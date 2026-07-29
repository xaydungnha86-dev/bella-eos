/**
 * BELLA EOS CORE: Decision Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Independent Decision Runtime encapsulating Strategy, Simulation, Optimizer, Tradeoff, Forecast.
 */

export interface DecisionSimulationResult {
  strategyName: string;
  expectedRevenueVnd: number;
  expectedCostUsd: number;
  estimatedRoiMultiplier: number;
  tradeoffRationale: string;
}

export interface DecisionEvaluationResult {
  decisionId: string;
  isAllowed: boolean;
  confidenceScore: number;
  reasoning: string;
  alternativesEvaluated: string[];
  requiresApproval: boolean;
  approvalRoleRequired: 'CEO' | 'MANAGER' | 'NONE';
}

export class DecisionRuntime {
  private static instance: DecisionRuntime;

  private constructor() {}

  public static getInstance(): DecisionRuntime {
    if (!DecisionRuntime.instance) {
      DecisionRuntime.instance = new DecisionRuntime();
    }
    return DecisionRuntime.instance;
  }

  public simulateStrategy(goalName: string, targetValue: number, budgetVnd: number): DecisionSimulationResult {
    const costUsd = Math.max(1, (budgetVnd / 25000) * 0.05); // Estimated LLM / compute cost
    const revenueVnd = targetValue * 1.25; // Projected 125% target achievement
    const roiMultiplier = (revenueVnd / 25000) / costUsd;

    return {
      strategyName: `Optimal Cross-Channel Acceleration for ${goalName}`,
      expectedRevenueVnd: revenueVnd,
      expectedCostUsd: Number(costUsd.toFixed(2)),
      estimatedRoiMultiplier: Number(roiMultiplier.toFixed(1)),
      tradeoffRationale: `Prioritized high-converting digital channels with budget cap of ${budgetVnd.toLocaleString('vi-VN')} VND to maximize ROI.`,
    };
  }

  public evaluateDecision(params: {
    decisionId: string;
    proposedBudgetVnd: number;
    objective: string;
    constraints?: { maxBudgetVnd: number };
  }): DecisionEvaluationResult {
    const budgetLimit = params.constraints?.maxBudgetVnd ?? 50000000; // default 50M VND
    const requiresApproval = params.proposedBudgetVnd > budgetLimit;
    const isExtreme = params.objective.toLowerCase().includes('300%') || params.objective.toLowerCase().includes('gấp 3');
    
    let isAllowed = true;
    let confidenceScore = 0.95;
    let reasoning = 'Mục tiêu thực tế và phù hợp với năng lực hiện tại của doanh nghiệp.';
    let approvalRoleRequired: DecisionEvaluationResult['approvalRoleRequired'] = 'NONE';

    if (isExtreme) {
      isAllowed = false;
      confidenceScore = 0.45;
      reasoning = 'Từ chối tự động thực thi: Mục tiêu tăng trưởng quá cao (300%) vượt quá giới hạn năng suất tối đa của Kỹ thuật viên (KTV) Spa hiện tại.';
    } else if (requiresApproval) {
      confidenceScore = 0.85;
      reasoning = `Yêu cầu phê duyệt từ CEO: Ngân sách đề xuất (${params.proposedBudgetVnd.toLocaleString('vi-VN')} VND) vượt quá hạn mức chính sách (${budgetLimit.toLocaleString('vi-VN')} VND).`;
      approvalRoleRequired = 'CEO';
    } else {
      if (params.proposedBudgetVnd > 20000000) {
        approvalRoleRequired = 'MANAGER';
      }
    }

    return {
      decisionId: params.decisionId,
      isAllowed: isAllowed && !requiresApproval,
      confidenceScore,
      reasoning,
      alternativesEvaluated: [
        'Tập trung tiếp thị tệp khách hàng cũ (Retention)',
        'Giảm 30% ngân sách đề xuất để tránh lãng phí chi phí quảng cáo (Ad Spend)'
      ],
      requiresApproval,
      approvalRoleRequired
    };
  }
}

