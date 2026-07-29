import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { EIRPLRIntegration } from '../../src/core/integration/eir-plr-integration';
import { PLRToSagaCompiler } from '../../src/core/orchestration/plr-to-saga-compiler';
import { WorkflowRuntime, SupabaseWorkflowStore } from '../../src/core/orchestration/workflow-runtime';
import { OperationalPlan } from '../../src/types/operational-plan';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Bella EOS: Dynamic PLR-to-Saga Integration Tests', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    WorkflowRuntime.resetInstance();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.restoreAllMocks();
  });

  describe('1. PLRToSagaCompiler Mappings', () => {
    test('should dynamically compile phases of OperationalPlan into transactional SagaSteps', () => {
      const mockPlan: Partial<OperationalPlan> = {
        generatedFrom: {
          chosenStrategy: { name: 'Direct Mail Promo' }
        } as any,
        budgetPlan: {
          total: 100000000,
          buffer: 10000000,
          byInitiative: [
            { name: 'Creative Phase', total: 30000000, breakdown: [] },
            { name: 'Execution Phase', total: 70000000, breakdown: [] }
          ],
          byWeek: [],
          contingency: { amount: 0, triggers: [] }
        },
        timelinePlan: {
          duration: '4 weeks',
          phases: [
            {
              name: 'Creative Phase',
              weeks: '1-2',
              objectives: [],
              milestones: [
                { date: 'w1', milestone: 'Design Copy', owner: 'Designer', status: 'pending' }
              ]
            },
            {
              name: 'Execution Phase',
              weeks: '3-4',
              objectives: [],
              milestones: [
                { date: 'w3', milestone: 'Distribute Mailers', owner: 'MKT', status: 'pending' }
              ]
            }
          ],
          dependencies: [],
          criticalPath: []
        }
      };

      const steps = PLRToSagaCompiler.compile(mockPlan as OperationalPlan);
      expect(steps.length).toBe(2);

      expect(steps[0].stepId).toBe('phase-0-creative-phase');
      expect(steps[0].budgetVnd).toBe(30000000);

      expect(steps[1].stepId).toBe('phase-1-execution-phase');
      expect(steps[1].budgetVnd).toBe(70000000);
    });
  });

  describe('2. End-to-End Cycle with Saga Execution', () => {
    test('should process CEO Intent, reason, approve, generate PLR plan, and execute Saga workflow', async () => {
      const integration = new EIRPLRIntegration();
      const ceoIntent = 'Boost Q4 Spa client acquisition by 20% with a $20M budget limit';

      const result = await integration.executeFullCycle(ceoIntent);

      expect(result.status).toBe('approved');
      expect(result.operationalPlan).toBeDefined();
      expect(result.executionSuccess).toBe(true);
      expect(result.workflowId).toBeDefined();

      // Retrieve state from runtime store to verify persistence
      const state = await WorkflowRuntime.getInstance().loadState(result.workflowId!);
      expect(state).toBeDefined();
      expect(state?.status).toBe('SUCCESS');
      expect(state?.steps.length).toBeGreaterThan(0);
    }, 30000);
  });
});
