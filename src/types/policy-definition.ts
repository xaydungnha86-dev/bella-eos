/**
 * BELLA EOS PLATFORM CONTRACT: Policy Definition Contract (IPolicyDefinition v1.0)
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Contract GOV-01: Enterprise Policy-as-Code Contract.
 * Defines Security, HR, Legal, Compliance (ISO, GDPR), Accounting, and Tax policies enforced across
 * canApprove(), canRead(), canExport(), canDelete(), and canRunWorkflow().
 */

export type PolicyCategory = 'SECURITY' | 'HR' | 'LEGAL' | 'COMPLIANCE' | 'ACCOUNTING' | 'TAX' | 'APPROVAL';

export interface IPolicyDefinition {
  policyId: string;
  policyName: string;
  policyCategory: PolicyCategory;
  ruleExpression: string;
  actionAllowed: boolean;
  enforcementLevel: 'STRICT_BLOCK' | 'WARN_AND_AUDIT' | 'LOG_ONLY';
}
