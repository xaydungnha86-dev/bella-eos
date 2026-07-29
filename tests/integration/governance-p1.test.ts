import { describe, test, expect, beforeEach } from '@jest/globals';
import { PolicyEvaluator } from '../../src/core/governance/policy-as-code-evaluator';
import { PolicyEngine } from '../../src/core/governance/policy-engine';
import { ApprovalEngine } from '../../src/core/governance/approval-engine';
import { DecisionRuntime } from '../../src/core/decision/decision-runtime';

describe('Bella EOS Governance Layer (Phase P1) Integration Tests', () => {
  
  describe('1. Policy-as-Code Expression Parser', () => {
    test('should evaluate numeric comparisons correctly', () => {
      const context = { amount: 65000000 };
      expect(PolicyEvaluator.evaluate('amount > 50000000', context)).toBe(true);
      expect(PolicyEvaluator.evaluate('amount < 50000000', context)).toBe(false);
    });

    test('should evaluate string values and equality checks', () => {
      const context = { action: 'EXPORT', dataset: 'PII', userRole: 'MARKETING' };
      const rule = "action == 'EXPORT' && dataset == 'PII' && userRole != 'DATA_PRIVACY_OFFICER'";
      expect(PolicyEvaluator.evaluate(rule, context)).toBe(true);

      const context2 = { action: 'EXPORT', dataset: 'PII', userRole: 'DATA_PRIVACY_OFFICER' };
      expect(PolicyEvaluator.evaluate(rule, context2)).toBe(false);
    });

    test('should evaluate boolean logical operators', () => {
      const context = { inventory: 50, minimum: 100 };
      expect(PolicyEvaluator.evaluate('inventory < minimum', context)).toBe(true);
      expect(PolicyEvaluator.evaluate('(inventory < minimum) || inventory == 0', context)).toBe(true);
    });

    test('should throw error on invalid expressions', () => {
      expect(() => {
        PolicyEvaluator.evaluate('amount >', { amount: 100 });
      }).toThrow();
    });
  });

  describe('2. PolicyEngine Registry & Evaluation', () => {
    let policyEngine: PolicyEngine;

    beforeEach(() => {
      policyEngine = PolicyEngine.getInstance();
    });

    test('should register custom policies and evaluate block results', () => {
      policyEngine.addPolicy({
        policyId: 'POL-CUSTOM-01',
        policyName: 'Block advertising budget in off-hours',
        policyCategory: 'SECURITY',
        ruleExpression: "action == 'SPEND' && timeOfDay == 'NIGHT'",
        actionAllowed: false,
        enforcementLevel: 'STRICT_BLOCK'
      });

      const res1 = policyEngine.evaluatePolicies('SPEND', { timeOfDay: 'DAY' });
      expect(res1.passed).toBe(true);

      const res2 = policyEngine.evaluatePolicies('SPEND', { timeOfDay: 'NIGHT' });
      expect(res2.passed).toBe(false);
      expect(res2.violations[0].policyId).toBe('POL-CUSTOM-01');

      policyEngine.removePolicy('POL-CUSTOM-01');
    });

    test('should maintain backward compatibility for default budget policy checks', () => {
      const check = policyEngine.checkBudgetPolicy(30000000);
      expect(check.passed).toBe(true);

      const checkExceeded = policyEngine.checkBudgetPolicy(80000000);
      expect(checkExceeded.passed).toBe(false);
    });
  });

  describe('3. Advanced Approval Engine', () => {
    let approvalEngine: ApprovalEngine;

    beforeEach(() => {
      approvalEngine = ApprovalEngine.getInstance();
      approvalEngine.clearApprovals();
    });

    test('should route sequential approvals step-by-step', () => {
      const task = approvalEngine.requestApproval({
        workflowId: 'wf-seq',
        taskId: 't-seq-1',
        proposedAction: 'Tăng lương nhân sự 15%',
        routingType: 'SEQUENTIAL',
        approvers: ['MANAGER', 'CEO']
      });

      expect(task.status).toBe('PENDING');
      expect(task.approvers[0].status).toBe('PENDING'); // Manager is pending
      expect(task.approvers[1].status).toBe('PENDING');

      // Manager approves
      const success1 = approvalEngine.submitDecision(task.approvalId, 'APPROVED', 'MANAGER', 'Đồng ý nâng cấp');
      expect(success1).toBe(true);
      expect(task.status).toBe('PENDING'); // Overall still pending since CEO hasn't approved
      expect(task.approvers[0].status).toBe('APPROVED');

      // CEO approves
      const success2 = approvalEngine.submitDecision(task.approvalId, 'APPROVED', 'CEO', 'Ký duyệt nâng lương');
      expect(success2).toBe(true);
      expect(task.status).toBe('APPROVED'); // Overall completed successfully!
      expect(task.approvers[1].status).toBe('APPROVED');
    });

    test('should route parallel approvals and complete only when all approve', () => {
      const task = approvalEngine.requestApproval({
        workflowId: 'wf-par',
        taskId: 't-par-1',
        proposedAction: 'Xuất bản content nhạy cảm',
        routingType: 'PARALLEL',
        approvers: ['LEGAL_LEAD', 'CMO']
      });

      // Legal lead approves
      approvalEngine.submitDecision(task.approvalId, 'APPROVED', 'LEGAL_LEAD');
      expect(task.status).toBe('PENDING');

      // CMO approves
      approvalEngine.submitDecision(task.approvalId, 'APPROVED', 'CMO');
      expect(task.status).toBe('APPROVED');
    });

    test('should reject overall request if any approver rejects', () => {
      const task = approvalEngine.requestApproval({
        workflowId: 'wf-rej',
        taskId: 't-rej-1',
        proposedAction: 'Giải ngân khẩn cấp',
        routingType: 'PARALLEL',
        approvers: ['MANAGER', 'CEO']
      });

      // Manager rejects
      approvalEngine.submitDecision(task.approvalId, 'REJECTED', 'MANAGER', 'Từ chối giải ngân');
      expect(task.status).toBe('REJECTED');
    });

    test('should handle timeouts and automatic escalation to supervisor', () => {
      const task = approvalEngine.requestApproval({
        workflowId: 'wf-time',
        taskId: 't-time-1',
        proposedAction: 'Yêu cầu ngân sách phát sinh',
        approvers: ['MANAGER'],
        timeoutMs: 1, // Exceeds immediately
        escalationRole: 'CEO'
      });
      
      // Simulate timeout by backdating the creation timestamp
      task.createdAt = new Date(Date.now() - 5000).toISOString();

      // Fast forward time check
      approvalEngine.checkTimeouts();
      expect(task.status).toBe('ESCALATED');
      expect(task.approvers[1].role).toBe('CEO');
      expect(task.approvers[1].status).toBe('PENDING');
    });
  });

  describe('4. Upgraded Decision Engine', () => {
    test('should evaluate decisions with confidence, risk, and structured alternatives', () => {
      const decisionRuntime = DecisionRuntime.getInstance();
      const result = decisionRuntime.evaluateDecision({
        decisionId: 'dec-p1-1',
        proposedBudgetVnd: 45000000,
        objective: 'Tăng doanh thu TMV 15%'
      });

      expect(result.confidenceScore).toBe(0.95);
      expect(result.riskScore).toBe(0.15);
      expect(result.evidence).toContain('Doanh thu Quý vừa qua đạt 120% mục tiêu');
      expect(result.selectedStrategy).toContain('Tăng trưởng phễu khách hàng');
      
      expect(result.alternatives.length).toBe(2);
      expect(result.alternatives[0].strategyId).toBe('alt-retention');
      expect(result.alternatives[0].pros.length).toBeGreaterThan(0);
    });
  });
});
