/**
 * BELLA EOS ERL: Adaptive Reliability Policy Service
 * Specification: ERL Governance Engine
 * 
 * Mission: Execute fallback strategies dynamically (e.g. model routing or human-in-the-loop locks) when quality indicators decline.
 */

import { IAdaptivePolicyResult } from '@/types/erl';

export class AdaptiveReliabilityPolicyService {
  private static instance: AdaptiveReliabilityPolicyService;
  private triggersLog: IAdaptivePolicyResult[] = [];

  private constructor() {}

  public static getInstance(): AdaptiveReliabilityPolicyService {
    if (!AdaptiveReliabilityPolicyService.instance) {
      AdaptiveReliabilityPolicyService.instance = new AdaptiveReliabilityPolicyService();
    }
    return AdaptiveReliabilityPolicyService.instance;
  }

  /**
   * Applies fallback actions depending on current ERI or citation rates.
   */
  public evaluateRules(capability: string, actualEri: number, actualCitationRate: number): IAdaptivePolicyResult[] {
    const actions: IAdaptivePolicyResult[] = [];

    // Rule 1: ERI is low -> Fallback from lightweight model to reasoning-heavy models (e.g. Gemini Flash to GPT Reasoning)
    if (actualEri < 90.0) {
      const result: IAdaptivePolicyResult = {
        policyName: 'Low ERI Model Fallback',
        triggerCondition: `ERI score ${actualEri} < 90.0`,
        actionTaken: 'MANDATORY MODEL SWITCH: Fallback routing activated. Diverting queries from Gemini Flash to GPT Reasoning model.',
        timestamp: new Date().toISOString()
      };
      actions.push(result);
      this.triggersLog.push(result);
    }

    // Rule 2: Citation rate is low -> Trigger mandatory Human-in-the-Loop gate review
    if (actualCitationRate < 0.70) {
      const result: IAdaptivePolicyResult = {
        policyName: 'Uncited Output Guardrail',
        triggerCondition: `Citation rate ${actualCitationRate * 100}% < 70%`,
        actionTaken: 'HUMAN GATING ACTIVATED: Flagging output for manual check. Requiring human verification before release to customer.',
        timestamp: new Date().toISOString()
      };
      actions.push(result);
      this.triggersLog.push(result);
    }

    return actions;
  }

  public getHistory(): IAdaptivePolicyResult[] {
    return this.triggersLog;
  }
}
