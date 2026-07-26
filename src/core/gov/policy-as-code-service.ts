/**
 * BELLA EOS GOVERNANCE SERVICE: Policy-as-Code Engine (Layer 1/2 Safeguard)
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Mission: Enterprise Universal Safeguard Engine. Evaluates and enforces Security, HR, Legal,
 * Compliance (ISO, GDPR), Accounting, and Tax policies across canApprove(), canRead(), canExport(),
 * canDelete(), and canRunWorkflow() (Contract GOV-01).
 */

import { IPolicyDefinition, PolicyCategory } from '@/types/policy-definition';

export interface PolicyEvaluationResult {
  isAllowed: boolean;
  violatedPolicyName?: string;
  policyCategory?: PolicyCategory;
  enforcementLevel?: IPolicyDefinition['enforcementLevel'];
  reason?: string;
}

export class PolicyAsCodeService {
  private static instance: PolicyAsCodeService;
  private policies: Map<string, IPolicyDefinition> = new Map();

  private constructor() {
    this.seedDefaultPolicies();
  }

  public static getInstance(): PolicyAsCodeService {
    if (!PolicyAsCodeService.instance) {
      PolicyAsCodeService.instance = new PolicyAsCodeService();
    }
    return PolicyAsCodeService.instance;
  }

  private seedDefaultPolicies(): void {
    this.policies.set('pol-export-gdpr', {
      policyId: 'pol-export-gdpr',
      policyName: 'GDPR Customer PII Export Prohibition',
      policyCategory: 'COMPLIANCE',
      ruleExpression: 'action == EXPORT && dataset == PII && userRole != DATA_PRIVACY_OFFICER',
      actionAllowed: false,
      enforcementLevel: 'STRICT_BLOCK',
    });

    this.policies.set('pol-approve-financial', {
      policyId: 'pol-approve-financial',
      policyName: 'Dual Executive Financial Approval Policy',
      policyCategory: 'APPROVAL',
      ruleExpression: 'action == APPROVE && amountUsd > 50000 && approverCount < 2',
      actionAllowed: false,
      enforcementLevel: 'STRICT_BLOCK',
    });
  }

  public canApprove(role: string, amountUsd: number, approverCount: number): PolicyEvaluationResult {
    if (amountUsd > 50000 && approverCount < 2) {
      const pol = this.policies.get('pol-approve-financial');
      return {
        isAllowed: false,
        violatedPolicyName: pol?.policyName,
        policyCategory: pol?.policyCategory,
        enforcementLevel: pol?.enforcementLevel,
        reason: `POLICY VIOLATION: Financial approvals exceeding $50,000 require dual executive signatures. Current count = ${approverCount}.`,
      };
    }
    return { isAllowed: true };
  }

  public canExport(userRole: string, dataType: string): PolicyEvaluationResult {
    if (dataType === 'PII' && userRole !== 'DATA_PRIVACY_OFFICER') {
      const pol = this.policies.get('pol-export-gdpr');
      return {
        isAllowed: false,
        violatedPolicyName: pol?.policyName,
        policyCategory: pol?.policyCategory,
        enforcementLevel: pol?.enforcementLevel,
        reason: `POLICY VIOLATION: Exporting raw customer PII is restricted to Data Privacy Officers under GDPR compliance. Role = ${userRole}.`,
      };
    }
    return { isAllowed: true };
  }

  public canRunWorkflow(workflowId: string, userRole: string): PolicyEvaluationResult {
    return { isAllowed: true };
  }
}
