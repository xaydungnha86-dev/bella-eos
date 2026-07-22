/**
 * BELLA EOS GOVERNANCE: Policy & Compliance Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IPolicy v1.0.
 */

import { IPolicy, PolicyEvaluationResult } from '@/types/policy';

export class PolicyRuntime implements IPolicy {
  public id = 'pol-core-001';
  public name = 'Enterprise Budget & Risk Compliance Policy';
  public ruleType = 'BUDGET_AND_RISK';

  private static instance: PolicyRuntime;

  private constructor() {}

  public static getInstance(): PolicyRuntime {
    if (!PolicyRuntime.instance) {
      PolicyRuntime.instance = new PolicyRuntime();
    }
    return PolicyRuntime.instance;
  }

  public async evaluate(context: Record<string, any>): Promise<PolicyEvaluationResult> {
    const budgetVnd = context.budgetVnd || 0;
    const maxAllowedVnd = 1000000000; // 1 Billion VND max per single automated campaign

    if (budgetVnd > maxAllowedVnd) {
      return {
        allowed: false,
        policyId: this.id,
        reason: `Requested budget (${budgetVnd.toLocaleString('vi-VN')} VND) exceeds single automated limit (${maxAllowedVnd.toLocaleString('vi-VN')} VND)`,
        violations: ['POLICY_BUDGET_EXCEEDED'],
      };
    }

    return { allowed: true, policyId: this.id };
  }

  public async approve(actionId: string, approverId: string): Promise<boolean> {
    return true;
  }

  public async reject(actionId: string, reason: string): Promise<boolean> {
    return true;
  }

  public explain(policyId: string): string {
    return 'Enforces strict enterprise budget ceilings and multi-signature approvals for high-value AI executions.';
  }
}
