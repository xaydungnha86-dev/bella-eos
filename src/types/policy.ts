/**
 * BELLA EOS PLATFORM CONTRACT: Enterprise Policy Contract (IPolicy v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Authorization, compliance, risk threshold, and approval policy contract.
 */

export interface PolicyEvaluationResult {
  allowed: boolean;
  policyId: string;
  reason?: string;
  violations?: string[];
}

export interface IPolicy {
  id: string;
  name: string;
  ruleType: string;
  evaluate(context: Record<string, any>): Promise<PolicyEvaluationResult>;
  approve(actionId: string, approverId: string): Promise<boolean>;
  reject(actionId: string, reason: string): Promise<boolean>;
  explain(policyId: string): string;
}
