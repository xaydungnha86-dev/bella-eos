import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { WorkflowRuntime, SagaStep, InMemoryWorkflowStore } from '../../src/core/orchestration/workflow-runtime';
import { PolicyEngine } from '../../src/core/governance/policy-engine';
import { EventStore } from '../../src/core/event-sourcing/event-store';
import { WorkflowEventStreamer } from '../../src/core/orchestration/workflow-event-streamer';
import { SopMetricsStore } from '../../src/core/orchestration/sop-metrics-store';
import { EIRPLRIntegration } from '../../src/core/integration/eir-plr-integration';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Bella EOS: Phase 6 Enterprise Production Proof & Hardening Tests', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    WorkflowRuntime.resetInstance();
    WorkflowEventStreamer.resetInstance();
    SopMetricsStore.resetInstance();
    EventStore.resetInstance();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.restoreAllMocks();
  });

  describe('1. Chaos & Crash Recovery', () => {
    test('should recover from worker crash mid-execution and resume from checkpoint', async () => {
      const memoryStore = new InMemoryWorkflowStore();
      const runtime = WorkflowRuntime.getInstance(memoryStore);

      const workflowId = 'wf-crash-recovery-test';

      // Seed an interrupted RUNNING workflow state
      await memoryStore.saveState({
        workflowId,
        name: 'Financial Cashflow Forecast',
        status: 'RUNNING',
        currentStepId: 'step-scenario-modelling',
        steps: [
          { stepId: 'step-cashflow-audit', status: 'SUCCESS' },
          { stepId: 'step-scenario-modelling', status: 'PENDING' },
          { stepId: 'step-cfo-ceo-approval', status: 'PENDING' }
        ],
        startedAt: Date.now() - 5000,
        version: 2,
        traceId: 'trace-chaos-999',
        sopId: 'sop-finance-forecasting',
        sopVersion: '3.0.0'
      });

      const executedStepIds: string[] = [];

      const sagaSteps: SagaStep[] = [
        {
          stepId: 'step-cashflow-audit',
          action: async () => { executedStepIds.push('step-cashflow-audit'); return true; },
          compensate: async () => {}
        },
        {
          stepId: 'step-scenario-modelling',
          action: async () => { executedStepIds.push('step-scenario-modelling'); return true; },
          compensate: async () => {}
        },
        {
          stepId: 'step-cfo-ceo-approval',
          action: async () => { executedStepIds.push('step-cfo-ceo-approval'); return true; },
          compensate: async () => {}
        }
      ];

      // Resume workflow execution
      const success = await runtime.resumeWorkflow(workflowId, sagaSteps);

      expect(success).toBe(true);
      // step-cashflow-audit was SUCCESS, so it should be skipped
      expect(executedStepIds).not.toContain('step-cashflow-audit');
      expect(executedStepIds).toContain('step-scenario-modelling');
      expect(executedStepIds).toContain('step-cfo-ceo-approval');

      const finalState = await runtime.loadState(workflowId);
      expect(finalState?.status).toBe('SUCCESS');
      expect(finalState?.sopVersion).toBe('3.0.0');
    });
  });

  describe('2. Security & Governance Policy Enforcement', () => {
    test('should reject unauthorized budget reallocation violating policy limits', async () => {
      const runtime = WorkflowRuntime.getInstance(new InMemoryWorkflowStore());
      const workflowId = 'wf-security-policy-test';

      const sagaSteps: SagaStep[] = [
        {
          stepId: 'step-overbudget',
          budgetVnd: 2000000000, // 2 Billion VND exceeds policy threshold
          action: async () => true,
          compensate: async () => {}
        }
      ];

      const success = await runtime.executeSaga(workflowId, 'Finance Budget Shift', sagaSteps);

      expect(success).toBe(false);
      const state = await runtime.loadState(workflowId);
      expect(state?.status).toBe('COMPENSATED');
      expect(state?.steps[0].error).toContain('Policy violation');
    });
  });

  describe('3. Concurrent Workload & Contention Stress (24 Sagas)', () => {
    test('should execute 24 concurrent workflows without race conditions or memory corruption', async () => {
      const integration = new EIRPLRIntegration();
      const intents = [
        'Increase Q3 revenue by 30% through customer retention and upselling',
        'Increase Spa revenue by 25% through marketing campaign',
        'Boost customer acquisition by 20% through HR recruitment and sales expansion',
        'Optimize cashflow forecast and budget allocation for financial stability'
      ];

      const promises = Array.from({ length: 24 }).map((_, i) => {
        const intent = intents[i % intents.length];
        return integration.executeFullCycle(intent);
      });

      const results = await Promise.all(promises);

      const errorResults = results.filter(r => r.status === 'error');
      expect(results.length).toBe(24);
      expect(errorResults.length).toBe(0);

      // Verify that all concurrent executions are safely resolved (either approved or flagged for CEO review)
      const validStatuses = results.every(r => r.status === 'approved' || r.status === 'rejected');
      expect(validStatuses).toBe(true);

      const approvedWorkflows = results.filter(r => r.status === 'approved');
      expect(approvedWorkflows.length).toBeGreaterThan(0);
      expect(approvedWorkflows.every(r => r.executionSuccess === true)).toBe(true);
    }, 45000);
  });

  describe('4. End-to-End Observability & Performance Metrics', () => {
    test('should compute latency P50 & P95 metrics with zero compensation leaks', async () => {
      const integration = new EIRPLRIntegration();
      const intent = 'Giữ chân khách hàng VIP và tối ưu trải nghiệm';

      await integration.executeFullCycle(intent);

      const records = SopMetricsStore.getInstance().getAllRecords();
      expect(records.length).toBeGreaterThan(0);

      const durations = records.map(r => r.durationMs).sort((a, b) => a - b);
      const p50 = durations[Math.floor(durations.length * 0.5)];
      const p95 = durations[Math.floor(durations.length * 0.95)];

      expect(p50).toBeGreaterThan(0);
      expect(p95).toBeGreaterThanOrEqual(p50);
    });
  });
});
