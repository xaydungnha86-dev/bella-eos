/**
 * Policy Engine
 * Evaluates context against all registered versioned policies.
 */

import { PolicyRepository } from './policy-repository';

export interface PolicyComplianceReport {
  compliant: boolean;
  totalPoliciesEvaluated: number;
  violations: { policyId: string; category: string; description: string; reason: string }[];
}

export class PolicyEngine {
  private static instance: PolicyEngine;

  private constructor() {}

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  public evaluateCompliance(context: Record<string, any>): PolicyComplianceReport {
    const repo = PolicyRepository.getInstance();
    const policies = repo.getAllPolicies();
    const violations: { policyId: string; category: string; description: string; reason: string }[] = [];

    for (const policy of policies) {
      const res = policy.evaluator(context);
      if (!res.compliant) {
        violations.push({
          policyId: policy.policyId,
          category: policy.category,
          description: policy.description,
          reason: res.violationReason || 'Chính sách bị vi phạm'
        });
      }
    }

    return {
      compliant: violations.length === 0,
      totalPoliciesEvaluated: policies.length,
      violations
    };
  }

  public checkBudgetPolicy(proposedBudget: number, limit: number = 100000000): {
    passed: boolean;
    policyId: string;
    name: string;
    reason?: string;
    compliant: boolean;
    violationReason?: string;
  } {
    const report = this.evaluateCompliance({
      proposedBudgetVnd: proposedBudget,
      approvedBudgetLimitVnd: limit
    });
    const violation = report.violations.find(v => v.category === 'FINANCE');
    const passed = report.compliant;
    const policyId = 'policy_finance_max_budget_v1';
    const name = 'Hạn Mức Ngân Sách An Toàn Dòng Tiền';
    const reason = violation?.reason;

    return {
      passed,
      policyId,
      name,
      reason,
      compliant: passed,
      violationReason: reason
    };
  }
}
