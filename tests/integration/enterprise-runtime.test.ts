import { describe, test, expect, beforeEach } from '@jest/globals';
import { DecisionRuntime } from '@/core/decision/decision-runtime';
import { ExplainabilityRuntime } from '@/core/decision/explainability-runtime';
import { PolicyEngine } from '@/core/governance/policy-engine';
import { ApprovalEngine } from '@/core/governance/approval-engine';
import { WorkflowRuntime, SagaStep } from '@/core/orchestration/workflow-runtime';

describe('Bella EOS Enterprise Runtime Integration Tests', () => {
  beforeEach(() => {
    WorkflowRuntime.resetInstance();
  });

  describe('1. Decision & Explainability Runtime', () => {
    test('should evaluate normal budget within limits', () => {
      const runtime = DecisionRuntime.getInstance();
      const res = runtime.evaluateDecision({
        decisionId: 'dec-1',
        proposedBudgetVnd: 15000000,
        objective: 'Tăng trưởng doanh thu spa 10%'
      });

      expect(res.isAllowed).toBe(true);
      expect(res.requiresApproval).toBe(false);
      expect(res.confidenceScore).toBe(0.95);
    });

    test('should flag budget exceeding limits for CEO approval', () => {
      const runtime = DecisionRuntime.getInstance();
      const res = runtime.evaluateDecision({
        decisionId: 'dec-2',
        proposedBudgetVnd: 60000000, // Limit is 50M
        objective: 'Tăng trưởng doanh thu spa 15%'
      });

      expect(res.isAllowed).toBe(false);
      expect(res.requiresApproval).toBe(true);
      expect(res.approvalRoleRequired).toBe('CEO');
    });

    test('should auto-reject extreme goals', () => {
      const runtime = DecisionRuntime.getInstance();
      const res = runtime.evaluateDecision({
        decisionId: 'dec-3',
        proposedBudgetVnd: 10000000,
        objective: 'Tăng trưởng doanh thu spa gấp 3 lần'
      });

      expect(res.isAllowed).toBe(false);
      expect(res.confidenceScore).toBeLessThan(0.5);
      expect(res.reasoning).toContain('Từ chối tự động thực thi');
    });

    test('should generate structured explanation', () => {
      const decisionRuntime = DecisionRuntime.getInstance();
      const explainRuntime = ExplainabilityRuntime.getInstance();

      const evaluation = decisionRuntime.evaluateDecision({
        decisionId: 'dec-4',
        proposedBudgetVnd: 80000000,
        objective: 'Tăng trưởng 300%'
      });

      const explanation = explainRuntime.explainEvaluation(evaluation, 'Tăng trưởng 300%', ['ev-1', 'ev-2']);
      expect(explanation.confidenceScore).toBe(evaluation.confidenceScore);
      expect(explanation.requiresApproval).toBe(evaluation.requiresApproval);
      expect(explanation.rationale).toContain('Bác bỏ mục tiêu 300%');
    });
  });

  describe('2. Policy & Approval Engine', () => {
    test('should check policy constraints', () => {
      const policyEngine = PolicyEngine.getInstance();
      const check1 = policyEngine.checkBudgetPolicy(30000000);
      expect(check1.passed).toBe(true);

      const check2 = policyEngine.checkBudgetPolicy(100000000);
      expect(check2.passed).toBe(false);
      expect(check2.reason).toContain('vượt quá giới hạn chính sách');
    });

    test('should request and resolve human approval task', () => {
      const approvalEngine = ApprovalEngine.getInstance();
      const task = approvalEngine.requestApproval({
        workflowId: 'wf-1',
        taskId: 'task-1',
        proposedAction: 'Giải ngân 60M VND chi phí quảng cáo',
        approverRole: 'CEO'
      });

      expect(task.status).toBe('PENDING');
      expect(task.approverRole).toBe('CEO');

      const success = approvalEngine.submitDecision(task.approvalId, 'APPROVED', 'Đã duyệt chiến dịch');
      expect(success).toBe(true);
      expect(approvalEngine.getApprovalState(task.approvalId)).toBe('APPROVED');
    });
  });

  describe('3. Workflow Runtime & Saga Integration', () => {
    test('should execute Saga successfully and log TurnRuntime telemetry', async () => {
      const workflowRuntime = WorkflowRuntime.getInstance();
      const executionLog: string[] = [];

      const steps: SagaStep[] = [
        {
          stepId: 'step-reserve',
          budgetVnd: 20000000, // Within 50M limit
          action: async () => {
            executionLog.push('reserved');
            return true;
          },
          compensate: async () => {
            executionLog.push('reverted-reserve');
          }
        },
        {
          stepId: 'step-create',
          action: async () => {
            executionLog.push('created');
            return true;
          },
          compensate: async () => {
            executionLog.push('reverted-create');
          }
        }
      ];

      workflowRuntime.clearTurnTelemetries();
      const success = await workflowRuntime.executeSaga('wf-test-1', 'Workflow Thành Công', steps);

      expect(success).toBe(true);
      expect(executionLog).toEqual(['reserved', 'created']);

      const telemetries = workflowRuntime.getTurnTelemetries();
      expect(telemetries.length).toBe(2);
      expect(telemetries[0].exitReason).toBe('COMPLETED');
      expect(telemetries[0].taskId).toBe('step-reserve');
    });

    test('should roll back saga steps and log fail telemetry when policy fails', async () => {
      const workflowRuntime = WorkflowRuntime.getInstance();
      const executionLog: string[] = [];

      const steps: SagaStep[] = [
        {
          stepId: 'step-ok',
          budgetVnd: 10000000,
          action: async () => {
            executionLog.push('ok-run');
            return true;
          },
          compensate: async () => {
            executionLog.push('ok-reverted');
          }
        },
        {
          stepId: 'step-policy-violation',
          budgetVnd: 80000000, // Exceeds default 50M limit
          action: async () => {
            executionLog.push('should-not-run');
            return true;
          },
          compensate: async () => {
            executionLog.push('violation-reverted');
          }
        }
      ];

      workflowRuntime.clearTurnTelemetries();
      const success = await workflowRuntime.executeSaga('wf-test-2', 'Workflow Bị Lỗi Policy', steps);

      expect(success).toBe(false);
      expect(executionLog).toEqual(['ok-run', 'ok-reverted']);
      expect(executionLog).not.toContain('should-not-run');
      expect(executionLog).toContain('ok-reverted'); // compensation executed in reverse order

      const telemetries = workflowRuntime.getTurnTelemetries();
      expect(telemetries.length).toBe(2);
      expect(telemetries[0].exitReason).toBe('COMPLETED');
      expect(telemetries[1].exitReason).toBe('FAILED');
      expect(telemetries[1].error).toContain('Policy violation');
    });
  });
});
