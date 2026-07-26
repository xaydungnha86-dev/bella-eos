/**
 * BELLA EOS PLATFORM CONTRACT: Business Rule Contract (IBusinessRule v1.0)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME (EAH)
 * 
 * Contract 28: Hard Business Rule Contract. Defines absolute policy guardrails
 * (e.g. Max discount 30%, Cashflow cap, Capacity limit) that AI must strictly obey.
 */

export type ConstraintType = 
  | 'MAX_DISCOUNT_PERCENTAGE' 
  | 'BUDGET_CAP_VND' 
  | 'CASHFLOW_LIMIT' 
  | 'CAPACITY_BED_LIMIT' 
  | 'MIN_ROAS_THRESHOLD';

export interface IBusinessRule {
  ruleId: string;
  ruleName: string;
  domain: string;
  constraintType: ConstraintType;
  thresholdValue: number;
  errorMessage: string;
  isActive: boolean;
  validate(value: number): boolean;
}
