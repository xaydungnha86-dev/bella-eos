/**
 * INTEGRATION TESTS: Bella EOS Operational Control Layer
 * Verifies SOP compilation and DoD Validation Gates compliance.
 */

import { SopEngine } from '../../src/core/orchestration/sop-engine';
import { IntentGate, GoalGate, DecisionGate, ValidationError } from '../../src/core/governance/validation-gates';
import { IntentContract, DecisionContract } from '../../src/types/governance-contracts';

describe('Bella EOS: Declarative SOP Engine Tests', () => {
  const sopEngine = SopEngine.getInstance();

  test('Should seed and retrieve default Spa Marketing SOP', () => {
    const sop = sopEngine.getSop('sop-spa-marketing');
    expect(sop).toBeDefined();
    expect(sop?.sopName).toBe('Quy trình Chiến dịch Tiếp thị Spa Đa kênh');
    expect(sop?.steps.length).toBe(4);
  });

  test('Should compile SOP to Saga steps with correct budget allocation', () => {
    const totalBudget = 50000000; // 50 million VND
    const steps = sopEngine.compileToSaga('sop-spa-marketing', totalBudget);

    expect(steps.length).toBe(4);
    
    // Check specific steps and their budget partitions
    const stepContent = steps.find(s => s.stepId === 'step-content-draft');
    expect(stepContent).toBeDefined();
    expect(stepContent?.budgetVnd).toBe(totalBudget * 0.15); // 15%

    const stepPublish = steps.find(s => s.stepId === 'step-publish-ads');
    expect(stepPublish).toBeDefined();
    expect(stepPublish?.budgetVnd).toBe(totalBudget * 0.60); // 60%
  });

  test('Should trigger execution callback hook during Saga actions and rollbacks', async () => {
    const executedSteps: string[] = [];
    const steps = sopEngine.compileToSaga('sop-spa-marketing', 10000000, (id, phase) => {
      executedSteps.push(`${id}-${phase}`);
    });

    const mockStep = steps[0];
    await mockStep.action();
    await mockStep.compensate();

    expect(executedSteps).toContain('step-content-draft-ACTION');
    expect(executedSteps).toContain('step-content-draft-COMPENSATE');
  });
});

describe('Bella EOS: Quality Validation Gates (DoD) Tests', () => {
  describe('Intent Gate', () => {
    test('Should pass when IntentContract satisfies all DoD requirements', () => {
      const validIntent: IntentContract = {
        intentId: 'int-101',
        tenantId: 'tenant-001',
        rawText: 'Increase Spa revenue',
        targetObjective: 'Tăng doanh thu Spa',
        spendLimitVnd: 50000000,
        expectedTimelineDays: 30,
        timestamp: new Date().toISOString(),
        parsingConfidence: 0.98 // Minimum required is 0.95
      };

      expect(() => IntentGate.validate(validIntent)).not.toThrow();
    });

    test('Should fail if targetObjective is empty or blank', () => {
      const invalidIntent: IntentContract = {
        intentId: 'int-102',
        tenantId: 'tenant-001',
        rawText: 'Increase Spa revenue',
        targetObjective: '',
        spendLimitVnd: 50000000,
        expectedTimelineDays: 30,
        timestamp: new Date().toISOString(),
        parsingConfidence: 0.98
      };

      expect(() => IntentGate.validate(invalidIntent)).toThrow(ValidationError);
      expect(() => IntentGate.validate(invalidIntent)).toThrow('Trường targetObjective không được để trống.');
    });

    test('Should fail if parsing confidence is under 95%', () => {
      const invalidIntent: IntentContract = {
        intentId: 'int-103',
        tenantId: 'tenant-001',
        rawText: 'Increase Spa revenue',
        targetObjective: 'Tăng doanh thu Spa',
        spendLimitVnd: 50000000,
        expectedTimelineDays: 30,
        timestamp: new Date().toISOString(),
        parsingConfidence: 0.92 // fails DoD
      };

      expect(() => IntentGate.validate(invalidIntent)).toThrow(ValidationError);
      expect(() => IntentGate.validate(invalidIntent)).toThrow('Độ tự tin phân tích (92%) không đạt yêu cầu tối thiểu (>=95%).');
    });
  });

  describe('Goal Gate', () => {
    test('Should pass when GoalTree budget matches parent limits and has valid owners', () => {
      const validTree = {
        rootGoalId: 'goal-root',
        parentBudgetVnd: 50000000,
        goals: [
          { goalId: 'g1', objective: 'Marketing lead generation', ownerRole: 'CMO', budgetVnd: 20000000 },
          { goalId: 'g2', objective: 'Sales conversion boost', ownerRole: 'Sales Manager', budgetVnd: 30000000 }
        ]
      };

      expect(() => GoalGate.validate(validTree)).not.toThrow();
    });

    test('Should fail if any leaf goal has no assigned ownerRole', () => {
      const invalidTree = {
        rootGoalId: 'goal-root',
        parentBudgetVnd: 50000000,
        goals: [
          { goalId: 'g1', objective: 'Marketing lead generation', ownerRole: '', budgetVnd: 20000000 }
        ]
      };

      expect(() => GoalGate.validate(invalidTree)).toThrow(ValidationError);
      expect(() => GoalGate.validate(invalidTree)).toThrow('Mục tiêu con [g1] chưa có người chịu trách nhiệm (ownerRole).');
    });

    test('Should fail if sum of child budgets exceeds parent allocation limit', () => {
      const invalidTree = {
        rootGoalId: 'goal-root',
        parentBudgetVnd: 50000000,
        goals: [
          { goalId: 'g1', objective: 'Marketing', ownerRole: 'CMO', budgetVnd: 30000000 },
          { goalId: 'g2', objective: 'Sales', ownerRole: 'Sales Manager', budgetVnd: 25000000 } // Sum = 55M > 50M
        ]
      };

      expect(() => GoalGate.validate(invalidTree)).toThrow(ValidationError);
      expect(() => GoalGate.validate(invalidTree)).toThrow('Tổng ngân sách phân bổ cho các mục tiêu con (55.000.000 VND) vượt quá trần cho phép (50.000.000 VND).');
    });
  });

  describe('Decision Gate', () => {
    test('Should pass when decision matches alternatives, pros/cons, evidence count and risk assessment criteria', () => {
      const validDecision: DecisionContract = {
        decisionId: 'dec-201',
        goalId: 'goal-root',
        selectedStrategy: 'Strategy A',
        confidenceScore: 0.92,
        riskScore: 0.12,
        evidence: [
          'Chiến dịch Spa Q1 đạt ROI 3.2',
          'Khảo sát ý kiến khách hàng cho thấy nhu cầu massage trị liệu tăng',
          'Ngân sách 50 triệu đủ phủ bán kính 5km xung quanh tiệm'
        ],
        alternatives: [
          {
            strategyId: 'A',
            description: 'Google Ads Search',
            confidenceScore: 0.92,
            riskScore: 0.12,
            pros: ['Độ chính xác cao', 'Đúng tệp khách tìm kiếm'],
            cons: ['Chi phí click cao']
          },
          {
            strategyId: 'B',
            description: 'Facebook Ads Lead Gen',
            confidenceScore: 0.85,
            riskScore: 0.25,
            pros: ['Phủ sóng rộng', 'Tương tác trực quan'],
            cons: ['Tỷ lệ lead ảo cao']
          }
        ],
        requiresApproval: true,
        approvalRoleRequired: 'CEO',
        timestamp: new Date().toISOString()
      };

      expect(() => DecisionGate.validate(validDecision)).not.toThrow();
    });

    test('Should fail if there are fewer than 2 alternative options', () => {
      const invalidDecision: DecisionContract = {
        decisionId: 'dec-202',
        goalId: 'goal-root',
        selectedStrategy: 'Strategy A',
        confidenceScore: 0.92,
        riskScore: 0.12,
        evidence: ['Ev1', 'Ev2', 'Ev3'],
        alternatives: [
          {
            strategyId: 'A',
            description: 'Google Ads Search',
            confidenceScore: 0.92,
            riskScore: 0.12,
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1']
          }
        ], // Only 1 alternative
        requiresApproval: true,
        approvalRoleRequired: 'CEO',
        timestamp: new Date().toISOString()
      };

      expect(() => DecisionGate.validate(invalidDecision)).toThrow(ValidationError);
      expect(() => DecisionGate.validate(invalidDecision)).toThrow('Đề xuất quyết sách phải cung cấp tối thiểu 2 phương án thay thế');
    });

    test('Should fail if alternatives do not have at least 2 pros and 1 con', () => {
      const invalidDecision: DecisionContract = {
        decisionId: 'dec-203',
        goalId: 'goal-root',
        selectedStrategy: 'Strategy A',
        confidenceScore: 0.92,
        riskScore: 0.12,
        evidence: ['Ev1', 'Ev2', 'Ev3'],
        alternatives: [
          {
            strategyId: 'A',
            description: 'Google Ads Search',
            confidenceScore: 0.92,
            riskScore: 0.12,
            pros: ['Only 1 pro'], // fails pros count
            cons: ['Con 1']
          },
          {
            strategyId: 'B',
            description: 'Facebook Ads Lead Gen',
            confidenceScore: 0.85,
            riskScore: 0.25,
            pros: ['Pro 1', 'Pro 2'],
            cons: [] // fails cons count (empty)
          }
        ],
        requiresApproval: true,
        approvalRoleRequired: 'CEO',
        timestamp: new Date().toISOString()
      };

      expect(() => DecisionGate.validate(invalidDecision)).toThrow(ValidationError);
    });

    test('Should fail if evidence citation count is less than 3', () => {
      const invalidDecision: DecisionContract = {
        decisionId: 'dec-204',
        goalId: 'goal-root',
        selectedStrategy: 'Strategy A',
        confidenceScore: 0.92,
        riskScore: 0.12,
        evidence: ['Only 1 evidence line', 'Second evidence line'], // Only 2 evidences
        alternatives: [
          {
            strategyId: 'A',
            description: 'Google Ads Search',
            confidenceScore: 0.92,
            riskScore: 0.12,
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1']
          },
          {
            strategyId: 'B',
            description: 'Facebook Ads',
            confidenceScore: 0.85,
            riskScore: 0.25,
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1']
          }
        ],
        requiresApproval: true,
        approvalRoleRequired: 'CEO',
        timestamp: new Date().toISOString()
      };

      expect(() => DecisionGate.validate(invalidDecision)).toThrow(ValidationError);
      expect(() => DecisionGate.validate(invalidDecision)).toThrow('Quyết sách phải có tối thiểu 3 dẫn chứng lịch sử hỗ trợ lập luận.');
    });
  });
});
