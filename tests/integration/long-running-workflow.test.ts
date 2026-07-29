import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { WorkflowRuntime, SagaStep, InMemoryWorkflowStore } from '../../src/core/orchestration/workflow-runtime';
import { AuditExplorer } from '../../src/core/governance/audit-explorer';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Bella EOS: Multi-Day Long-Running Process & Resiliency Simulation', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    WorkflowRuntime.resetInstance();
    AuditExplorer.resetInstance();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.restoreAllMocks();
  });

  test('should persist state across 5-day simulated process with worker restart and delayed approval', async () => {
    // Shared persistent store surviving worker reboots
    const sharedStore = new InMemoryWorkflowStore();
    const workflowId = 'wf-long-running-5day-001';

    // ==================== DAY 1: Plan Approved & Phase 1 Launch ====================
    let runtime = WorkflowRuntime.getInstance(sharedStore);

    const executedSteps: string[] = [];

    const sagaSteps: SagaStep[] = [
      {
        stepId: 'phase-1-initial-setup',
        action: async () => { executedSteps.push('phase-1-initial-setup'); return true; },
        compensate: async () => {}
      },
      {
        stepId: 'phase-2-cfo-capital-release',
        action: async () => { executedSteps.push('phase-2-cfo-capital-release'); return true; },
        compensate: async () => {}
      },
      {
        stepId: 'phase-3-final-payout',
        action: async () => { executedSteps.push('phase-3-final-payout'); return true; },
        compensate: async () => {}
      }
    ];

    // Seed Initial State simulating Day 1 completion of Step 1
    await sharedStore.saveState({
      workflowId,
      name: 'Q3 Enterprise Expansion',
      status: 'RUNNING',
      currentStepId: 'phase-2-cfo-capital-release',
      steps: [
        { stepId: 'phase-1-initial-setup', status: 'SUCCESS' },
        { stepId: 'phase-2-cfo-capital-release', status: 'PENDING' },
        { stepId: 'phase-3-final-payout', status: 'PENDING' }
      ],
      startedAt: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
      version: 2,
      sopId: 'sop-finance-forecasting',
      sopVersion: '3.0.0',
      traceId: 'trace-long-run-777'
    });

    // Verify Day 1-3 Checkpoint State
    const day3State = await sharedStore.getState(workflowId);
    expect(day3State?.status).toBe('RUNNING');
    expect(day3State?.sopVersion).toBe('3.0.0');

    // ==================== DAY 4: Simulated Worker Crash / System Reboot ====================
    WorkflowRuntime.resetInstance(); // Simulate worker process death

    // ==================== DAY 5: Worker Recovery & Delayed Approval Execution ====================
    const newWorkerRuntime = WorkflowRuntime.getInstance(sharedStore);

    const success = await newWorkerRuntime.resumeWorkflow(workflowId, sagaSteps);

    expect(success).toBe(true);
    // Step 1 was completed on Day 1 so it must be skipped
    expect(executedSteps).not.toContain('phase-1-initial-setup');
    expect(executedSteps).toContain('phase-2-cfo-capital-release');
    expect(executedSteps).toContain('phase-3-final-payout');

    const finalState = await sharedStore.getState(workflowId);
    expect(finalState?.status).toBe('SUCCESS');

    // Audit Explorer Verification
    const auditRecord = await AuditExplorer.getInstance().getAuditRecord(workflowId, finalState!);
    expect(auditRecord).not.toBeNull();
    expect(auditRecord?.sop.sopVersion).toBe('3.0.0');
    expect(auditRecord?.execution.completedSteps).toBe(3);
    expect(auditRecord?.governance.riskLevel).toBe('HIGH');
  });
});
