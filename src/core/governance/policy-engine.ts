/**
 * BELLA EOS PLATFORM: Policy Engine
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Enforces hard rules and constraints (e.g. spending limits, campaign thresholds) before execution.
 */

export interface PolicyCheck {
  policyId: string;
  name: string;
  passed: boolean;
  reason?: string;
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private defaultBudgetLimit = 50000000; // 50M VND

  private constructor() {}

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  public checkBudgetPolicy(proposedBudget: number, customLimit?: number): PolicyCheck {
    const limit = customLimit ?? this.defaultBudgetLimit;
    const passed = proposedBudget <= limit;
    
    return {
      policyId: 'POL-FIN-001',
      name: 'Marketing Ad-spend Threshold Gate',
      passed,
      reason: passed 
        ? undefined 
        : `Ngân sách đề xuất ${proposedBudget.toLocaleString('vi-VN')} VND vượt quá giới hạn chính sách ${limit.toLocaleString('vi-VN')} VND.`
    };
  }
}
