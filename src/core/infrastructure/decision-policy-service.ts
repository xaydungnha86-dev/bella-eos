/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Decision Policy Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 * 
 * Mission: Executive Decision Gating Engine. Represents the authority layer of ECOS.
 * Separates Thinking (EDR Expert Board recommendations) from Authority (Policy compliance checks).
 */

import { EnterpriseStateService } from './enterprise-state-service';

export type DecisionMode = 
  | 'AI_AUTO_APPROVE' 
  | 'MANAGER_REVIEW' 
  | 'CEO_REVIEW' 
  | 'NEVER_ALLOW'
  | 'AI_AUTO_EXECUTE' 
  | 'MANAGER_APPROVAL' 
  | 'CEO_APPROVAL' 
  | 'REJECT';

export interface DecisionPolicyGatingResult {
  decisionMode: DecisionMode;
  requiredApproversCount: number;
  reason: string;
}

export class DecisionPolicyService {
  private static instance: DecisionPolicyService;

  private constructor() {}

  public static getInstance(): DecisionPolicyService {
    if (!DecisionPolicyService.instance) {
      DecisionPolicyService.instance = new DecisionPolicyService();
    }
    return DecisionPolicyService.instance;
  }

  /**
   * The core of thinking vs authority separation.
   * Evaluates the recommended board opinion and gates it against current policy and company state.
   */
  public evaluateRecommendation(
    boardRecommendation: 'APPROVE' | 'REJECT' | 'CONDITIONAL_APPROVAL',
    action: string,
    amountVnd: number
  ): DecisionPolicyGatingResult {
    if (boardRecommendation === 'REJECT') {
      return {
        decisionMode: 'REJECT',
        requiredApproversCount: 0,
        reason: 'BOARD REJECTION: The Executive Board rejected this objective during deliberation.',
      };
    }

    // Board approved or conditionally approved. Now apply the authority policies.
    const transactionCheck = this.evaluateTransaction(action, amountVnd);

    // Map legacy names to the newer names in the user pipeline where appropriate
    let mode = transactionCheck.decisionMode;
    if (mode === 'AI_AUTO_APPROVE') mode = 'AI_AUTO_EXECUTE';
    if (mode === 'MANAGER_REVIEW') mode = 'MANAGER_APPROVAL';
    if (mode === 'CEO_REVIEW') mode = 'CEO_APPROVAL';

    return {
      decisionMode: mode,
      requiredApproversCount: transactionCheck.requiredApproversCount,
      reason: `${transactionCheck.reason} (Board recommendation: ${boardRecommendation})`,
    };
  }

  public evaluateTransaction(action: string, amountVnd: number): DecisionPolicyGatingResult {
    const stateService = EnterpriseStateService.getInstance();
    const currentState = stateService.getCurrentState();

    if (action === 'DELETE_CUSTOMER') {
      return { 
        decisionMode: 'NEVER_ALLOW', 
        requiredApproversCount: Infinity, 
        reason: 'CRITICAL SECURITY: Customer deletion is strictly prohibited.' 
      };
    }

    if (action === 'FIRE_EMPLOYEE') {
      return { 
        decisionMode: 'CEO_REVIEW', 
        requiredApproversCount: 2, 
        reason: 'HR GATING: Employee termination always requires dual-human review.' 
      };
    }

    if (action === 'APPROVE_INVOICE') {
      const defaultCap = 20_000_000;
      const actualCap = stateService.getAutoApproveCapOverride(defaultCap);
      const managerLimit = currentState === 'CRISIS' ? 50_000_000 : 100_000_000;

      if (amountVnd < actualCap) {
        return { 
          decisionMode: 'AI_AUTO_APPROVE', 
          requiredApproversCount: 0, 
          reason: `AUTO-APPROVE: Invoice amount is under current state auto-approve ceiling of ${actualCap.toLocaleString()} VND (State: ${currentState}).` 
        };
      } else if (amountVnd <= managerLimit) {
        return { 
          decisionMode: 'MANAGER_REVIEW', 
          requiredApproversCount: 1, 
          reason: `MANAGER GATING: Invoice amount is between auto-approve ceiling and manager limit of ${managerLimit.toLocaleString()} VND (State: ${currentState}).` 
        };
      } else {
        return { 
          decisionMode: 'CEO_REVIEW', 
          requiredApproversCount: 2, 
          reason: `CEO GATING: Invoice amount exceeds manager limit of ${managerLimit.toLocaleString()} VND (State: ${currentState}).` 
        };
      }
    }

    return { 
      decisionMode: 'MANAGER_REVIEW', 
      requiredApproversCount: 1, 
      reason: 'DEFAULT GATING: Standard transaction review triggered.' 
    };
  }
}
