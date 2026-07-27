/**
 * BELLA EOS — Creative Runtime
 * kernel/execution-policy.ts
 *
 * Implements ExecutionPolicy wrapper (Retry with Exponential Backoff, Timeout, and Circuit Breaker).
 * Ensures that if a planner execution (especially LLM or external API call) fails, 
 * the kernel can self-heal or fallback gracefully.
 */

export interface PolicyConfig {
  maxRetries: number;
  backoffMs: number;
  timeoutMs: number;
  fallbackPlannerName?: string;
  circuitBreakerThreshold?: number; // consecutive failures before tripping
  circuitBreakerResetMs?: number;    // time before open trips back to half-open
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly threshold: number = 3,
    private readonly resetMs: number = 10000
  ) {}

  public getState(): CircuitState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  public recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  public trip(): void {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
  }
}

export class ExecutionPolicy {
  // Global map of circuit breakers per planner name
  private static breakers = new Map<string, CircuitBreaker>();

  public static getBreaker(plannerName: string, threshold = 3, resetMs = 10000): CircuitBreaker {
    if (!this.breakers.has(plannerName)) {
      this.breakers.set(plannerName, new CircuitBreaker(threshold, resetMs));
    }
    return this.breakers.get(plannerName)!;
  }

  public static resetAllBreakers(): void {
    this.breakers.clear();
  }

  /**
   * Executes a planner action using Retry, Timeout, and Circuit Breaker logic.
   */
  public static async executeWithPolicy<T>(
    plannerName: string,
    action: () => Promise<T>,
    config: PolicyConfig,
    onWarning: (msg: string) => void
  ): Promise<T> {
    const breaker = this.getBreaker(
      plannerName,
      config.circuitBreakerThreshold ?? 3,
      config.circuitBreakerResetMs ?? 10000
    );

    const circuitState = breaker.getState();
    if (circuitState === 'OPEN') {
      throw new Error(`CIRCUIT_BREAKER_OPEN: Planner "${plannerName}" is failing too frequently. Execution blocked.`);
    }

    let attempts = 0;
    let lastError: any;

    while (attempts <= config.maxRetries) {
      attempts++;
      try {
        // Execute action bounded by a Timeout promise
        const result = await Promise.race([
          action(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout of ${config.timeoutMs}ms exceeded`)), config.timeoutMs)
          )
        ]);

        // Success: report to circuit breaker
        breaker.recordSuccess();
        return result;
      } catch (err) {
        lastError = err;
        onWarning(`Planner "${plannerName}" attempt ${attempts} failed: ${String(err)}`);

        // If it's a fatal system issue or retry is exhausted
        if (attempts > config.maxRetries) {
          break;
        }

        // Delay with Exponential Backoff
        const delay = config.backoffMs * Math.pow(2, attempts - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    // If we reach here, all retries failed
    breaker.recordFailure();
    throw lastError;
  }
}
