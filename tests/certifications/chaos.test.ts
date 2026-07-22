/**
 * BELLA EOS CERTIFICATION: Chaos Engineering Certification Test Suite
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Verifies platform resilience under node failure, DLQ retry, and quota exhaustion scenarios.
 */

import { RuntimeComposer } from '@/core/kernel/runtime-composer';
import { SchedulerRuntime } from '@/core/orchestration/scheduler-runtime';
import { ResourceRuntime } from '@/core/execution/resource-runtime';

describe('BELLA EOS Chaos Engineering Certification', () => {
  it('should boot full Kernel Container via Runtime Composer cleanly', async () => {
    const composer = RuntimeComposer.getInstance();
    const booted = await composer.composeAndBoot();

    expect(booted).toBe(true);
  });

  it('should push failed jobs to DLQ after max retries exhausted under chaos failure', () => {
    const scheduler = SchedulerRuntime.getInstance();
    const job = scheduler.scheduleJob('Chaos High-Load Job', 0);

    scheduler.failJobAndRetry(job.jobId, 'Network Timeout 1');
    scheduler.failJobAndRetry(job.jobId, 'Network Timeout 2');
    const finalJob = scheduler.failJobAndRetry(job.jobId, 'Network Timeout 3');

    expect(finalJob?.status).toBe('DLQ');
    expect(scheduler.getDLQ().length).toBeGreaterThan(0);
  });

  it('should enforce resource rate limits and reject execution when AI Credits exhausted', () => {
    const resourceRuntime = ResourceRuntime.getInstance();
    resourceRuntime.setTenantQuota({
      tenantId: 'tenant-chaos-01',
      monthlyBudgetVnd: 10000000,
      monthlyAiCreditsUsd: 1.0,
      maxConcurrency: 1,
      currentUsedBudgetVnd: 0,
      currentUsedAiCreditsUsd: 0.9,
      currentActiveConcurrency: 0,
    });

    const check1 = resourceRuntime.checkExecutionAllowed('tenant-chaos-01', 0.2);
    expect(check1.allowed).toBe(false);
    expect(check1.reason).toContain('Monthly AI Credits quota exceeded');
  });
});
