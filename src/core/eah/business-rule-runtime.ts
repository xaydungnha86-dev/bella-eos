/**
 * BELLA EOS EAH: Business Rule Runtime (Runtime 5)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Mission: Hard Enterprise Constraint Engine. Enforces immutable business guardrails
 * (e.g. Max discount 30%, Cashflow cap, Bed capacity limit) that AI must strictly obey.
 */

import { IBusinessRule } from '@/types/business-rule';

export class BusinessRuleRuntime {
  private static instance: BusinessRuleRuntime;
  private rules: Map<string, IBusinessRule> = new Map();

  private constructor() {
    this.seedDefaultRules();
  }

  public static getInstance(): BusinessRuleRuntime {
    if (!BusinessRuleRuntime.instance) {
      BusinessRuleRuntime.instance = new BusinessRuleRuntime();
    }
    return BusinessRuleRuntime.instance;
  }

  private seedDefaultRules(): void {
    const defaultRules: IBusinessRule[] = [
      {
        ruleId: 'rule-max-discount',
        ruleName: 'Max Service Discount Limit (30%)',
        domain: 'SALES_MARKETING',
        constraintType: 'MAX_DISCOUNT_PERCENTAGE',
        thresholdValue: 30,
        errorMessage: 'Discounts exceeding 30% are strictly prohibited by enterprise policy.',
        isActive: true,
        validate: (val: number) => val <= 30,
      },
      {
        ruleId: 'rule-budget-cap',
        ruleName: 'Quarterly Campaign Budget Cap',
        domain: 'FINANCIAL_GOVERNANCE',
        constraintType: 'BUDGET_CAP_VND',
        thresholdValue: 500_000_000,
        errorMessage: 'Campaign budget proposal exceeds quarterly cashflow ceiling.',
        isActive: true,
        validate: (val: number) => val <= 500_000_000,
      },
      {
        ruleId: 'rule-min-roas',
        ruleName: 'Minimum Acceptable ROAS (1.5x)',
        domain: 'MARKETING_PERFORMANCE',
        constraintType: 'MIN_ROAS_THRESHOLD',
        thresholdValue: 1.5,
        errorMessage: 'Target ROAS cannot be planned below 1.5x threshold.',
        isActive: true,
        validate: (val: number) => val >= 1.5,
      },
    ];

    for (const r of defaultRules) {
      this.rules.set(r.ruleId, r);
    }
  }

  public getActiveRules(): IBusinessRule[] {
    return Array.from(this.rules.values()).filter(r => r.isActive);
  }

  public validateRules(proposedMetrics: Record<string, number>): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    const active = this.getActiveRules();

    for (const r of active) {
      if (r.constraintType === 'MAX_DISCOUNT_PERCENTAGE' && proposedMetrics.discountPercentage !== undefined) {
        if (!r.validate(proposedMetrics.discountPercentage)) violations.push(r.errorMessage);
      }
      if (r.constraintType === 'BUDGET_CAP_VND' && proposedMetrics.proposedBudgetVnd !== undefined) {
        if (!r.validate(proposedMetrics.proposedBudgetVnd)) violations.push(r.errorMessage);
      }
      if (r.constraintType === 'MIN_ROAS_THRESHOLD' && proposedMetrics.plannedRoas !== undefined) {
        if (!r.validate(proposedMetrics.plannedRoas)) violations.push(r.errorMessage);
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }
}
