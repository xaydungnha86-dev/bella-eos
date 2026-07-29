import { createHash } from 'crypto';

export interface TaskDefinition<TIn = unknown, TOut = unknown> {
  name: string;
  correlationId: string;
  inputs: TIn;
  execute: () => Promise<TOut>;
}

export interface SagaStep {
  id: string;
  execute: () => Promise<unknown>;
  compensate: () => Promise<void>;
}

export class ECOSExecutionEngine {
  private idempotencyCache: Map<string, unknown> = new Map();
  private activeExecutions: Map<string, Promise<unknown>> = new Map();

  /**
   * Generates a unique deduplication key for a task
   */
  getDeduplicationKey(task: TaskDefinition): string {
    const serializedInputs = JSON.stringify(task.inputs);
    return createHash('sha256')
      .update(`${task.name}_${task.correlationId}_${serializedInputs}`)
      .digest('hex');
  }

  /**
   * Runs a task with idempotency and deduplication
   */
  async executeIdempotent<TOut = unknown>(task: TaskDefinition<unknown, TOut>): Promise<TOut> {
    const key = this.getDeduplicationKey(task);

    // 1. Check completed cache
    if (this.idempotencyCache.has(key)) {
      console.log(`[Execution Engine] ✓ Cache Hit for deduplication key: ${key.substring(0, 8)}... returning output.`);
      return this.idempotencyCache.get(key) as TOut;
    }

    // 2. Check active running tasks
    if (this.activeExecutions.has(key)) {
      console.log(`[Execution Engine] ⏳ Task already executing in parallel. Re-using active promise: ${key.substring(0, 8)}...`);
      return this.activeExecutions.get(key) as Promise<TOut>;
    }

    // 3. Start execution
    console.log(`[Execution Engine] Starting task execution: "${task.name}"`);
    const promise = task.execute().then((result) => {
      this.idempotencyCache.set(key, result);
      this.activeExecutions.delete(key);
      return result;
    }).catch((err) => {
      this.activeExecutions.delete(key);
      throw err;
    });

    this.activeExecutions.set(key, promise);
    return promise;
  }

  /**
   * Runs a task with exponential backoff and decorrelated jitter retry mechanism
   */
  async executeWithRetry<T = unknown>(
    operation: () => Promise<T>,
    options: {
      maxAttempts: number;
      baseDelay: number;
      maxDelay: number;
    } = { maxAttempts: 3, baseDelay: 100, maxDelay: 1000 }
  ): Promise<T> {
    let attempt = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= options.maxAttempts) {
          console.error(`[Execution Engine] Max attempts reached (${attempt}). Execution failed.`);
          throw error;
        }

        // Calculate exponential backoff
        const temp = options.baseDelay * Math.pow(2, attempt);
        const backoff = Math.min(options.maxDelay, temp);
        // Decorrelated jitter
        const jitter = Math.random() * (backoff / 2);
        const sleepDuration = backoff + jitter;

        console.warn(`[Execution Engine] Attempt ${attempt} failed. Retrying in ${Math.round(sleepDuration)}ms... Error:`, error);
        
        await new Promise(resolve => setTimeout(resolve, sleepDuration));
      }
    }
  }

  /**
   * Executes a Saga transaction consisting of multiple sequential steps.
   * If any step fails, compensation steps are executed in reverse order.
   */
  async executeSaga(steps: SagaStep[]): Promise<unknown[]> {
    const executedSteps: SagaStep[] = [];
    const results: unknown[] = [];

    console.log(`[Saga Manager] Starting Saga transaction with ${steps.length} steps...`);

    for (const step of steps) {
      try {
        console.log(`[Saga Manager] Executing step: "${step.id}"`);
        const res = await step.execute();
        results.push(res);
        executedSteps.push(step);
      } catch (err) {
        console.error(`[Saga Manager] 🚨 Step "${step.id}" failed! Initiating rollback sequence...`, err);
        await this.rollbackSaga(executedSteps);
        throw err;
      }
    }

    console.log('[Saga Manager] ✓ Saga transaction completed successfully.');
    return results;
  }

  private async rollbackSaga(executedSteps: SagaStep[]): Promise<void> {
    // Compensate in reverse order
    for (let i = executedSteps.length - 1; i >= 0; i--) {
      const step = executedSteps[i];
      try {
        console.log(`[Saga Manager] [Rollback] Compensating step: "${step.id}"`);
        await step.compensate();
        console.log(`[Saga Manager] [Rollback] ✓ Step "${step.id}" compensated.`);
      } catch (err) {
        console.error(`[Saga Manager] [Rollback] ❌ Failed to compensate step "${step.id}":`, err);
      }
    }
    console.log('[Saga Manager] Rollback sequence finished.');
  }

  clearCache(): void {
    this.idempotencyCache.clear();
    this.activeExecutions.clear();
  }
}
