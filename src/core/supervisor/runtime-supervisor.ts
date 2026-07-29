import { RuntimeLifecycle, RuntimeHealth, HealthStatus } from '@/types/runtime-contract';

export interface RegisteredRuntime {
  id: string;
  runtime: RuntimeLifecycle & RuntimeHealth;
  status: 'initialized' | 'running' | 'paused' | 'stopped' | 'error';
  lastHealthStatus?: HealthStatus;
  restartCount: number;
}

export class RuntimeSupervisor {
  private runtimes: Map<string, RegisteredRuntime> = new Map();

  registerRuntime(id: string, runtime: RuntimeLifecycle & RuntimeHealth): void {
    this.runtimes.set(id, {
      id,
      runtime,
      status: 'stopped',
      restartCount: 0
    });
    console.log(`[Supervisor] Registered runtime: "${id}"`);
  }

  getRuntime(id: string): RegisteredRuntime | undefined {
    return this.runtimes.get(id);
  }

  async initAll(configMap: Record<string, Record<string, unknown>>): Promise<void> {
    console.log('[Supervisor] Initializing all runtimes...');
    for (const [id, reg] of this.runtimes.entries()) {
      try {
        const config = configMap[id] || {};
        await reg.runtime.init(config);
        reg.status = 'initialized';
        console.log(`[Supervisor] ✓ Runtime "${id}" initialized.`);
      } catch (err) {
        reg.status = 'error';
        console.error(`[Supervisor] ❌ Failed to initialize runtime "${id}":`, err);
        throw err;
      }
    }
  }

  async startAll(): Promise<void> {
    console.log('[Supervisor] Starting all runtimes...');
    for (const [id, reg] of this.runtimes.entries()) {
      try {
        await reg.runtime.start();
        reg.status = 'running';
        console.log(`[Supervisor] ✓ Runtime "${id}" started.`);
      } catch (err) {
        reg.status = 'error';
        console.error(`[Supervisor] ❌ Failed to start runtime "${id}":`, err);
        throw err;
      }
    }
  }

  async pauseAll(): Promise<void> {
    console.log('[Supervisor] Pausing all runtimes...');
    for (const [id, reg] of this.runtimes.entries()) {
      if (reg.status === 'running') {
        try {
          await reg.runtime.pause();
          reg.status = 'paused';
          console.log(`[Supervisor] ✓ Runtime "${id}" paused.`);
        } catch (err) {
          console.error(`[Supervisor] ❌ Failed to pause runtime "${id}":`, err);
        }
      }
    }
  }

  async stopAll(): Promise<void> {
    console.log('[Supervisor] Stopping all runtimes...');
    for (const [id, reg] of this.runtimes.entries()) {
      try {
        await reg.runtime.stop();
        reg.status = 'stopped';
        console.log(`[Supervisor] ✓ Runtime "${id}" stopped.`);
      } catch (err) {
        console.error(`[Supervisor] ❌ Failed to stop runtime "${id}":`, err);
      }
    }
  }

  /**
   * Monitor health of all runtimes.
   * If a runtime is 'unhealthy', attempt auto-recovery (restart).
   */
  async checkAndHeal(): Promise<Record<string, 'healthy' | 'degraded' | 'unhealthy' | 'recovering'>> {
    console.log('[Supervisor] Initiating corporate health monitoring cycle...');
    const report: Record<string, 'healthy' | 'degraded' | 'unhealthy' | 'recovering'> = {};

    for (const [id, reg] of this.runtimes.entries()) {
      try {
        const health = await reg.runtime.checkHealth();
        reg.lastHealthStatus = health;
        
        if (health.status === 'healthy') {
          report[id] = 'healthy';
        } else if (health.status === 'degraded') {
          report[id] = 'degraded';
          console.warn(`[Supervisor] ⚠️ Runtime "${id}" is degraded.`);
        } else {
          console.error(`[Supervisor] 🚨 Runtime "${id}" is unhealthy! Triggering auto-restart recovery...`);
          report[id] = 'recovering';
          await this.recoverRuntime(reg);
        }
      } catch (err) {
        console.error(`[Supervisor] 🚨 Failed to pull health status for "${id}". Recovering...`, err);
        report[id] = 'recovering';
        await this.recoverRuntime(reg);
      }
    }

    return report;
  }

  private async recoverRuntime(reg: RegisteredRuntime): Promise<void> {
    reg.restartCount++;
    reg.status = 'error';
    try {
      console.log(`[Supervisor] [Recovery] Stopping runtime "${reg.id}"...`);
      await reg.runtime.stop();
    } catch (e) {
      console.warn(`[Supervisor] [Recovery] Warning during stop for "${reg.id}":`, e);
    }

    try {
      console.log(`[Supervisor] [Recovery] Starting runtime "${reg.id}" (Restart #${reg.restartCount})...`);
      await reg.runtime.start();
      reg.status = 'running';
      console.log(`[Supervisor] [Recovery] ✓ Runtime "${reg.id}" recovered successfully.`);
    } catch (e) {
      console.error(`[Supervisor] [Recovery] ❌ Recovery restart failed for "${reg.id}":`, e);
    }
  }
}
