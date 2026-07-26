/**
 * BELLA EOS E-COS: Enterprise KPI Feedback Loop
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Mission: Executive & KPI Feedback Engine. Learns directly from CEO Approval/Rejection signals
 * and actual enterprise KPI performance deltas.
 */

export interface KpiFeedbackRecord {
  decisionId: string;
  ceoAction: 'APPROVED' | 'REJECTED' | 'REVISED';
  actualKpiDeltaPercentage: number;
  learningFeedbackSignal: 'POSITIVE_REINFORCEMENT' | 'NEGATIVE_POLICY_UPDATE' | 'NEUTRAL';
}

export class KpiFeedbackLoopEngine {
  private static instance: KpiFeedbackLoopEngine;

  private constructor() {}

  public static getInstance(): KpiFeedbackLoopEngine {
    if (!KpiFeedbackLoopEngine.instance) {
      KpiFeedbackLoopEngine.instance = new KpiFeedbackLoopEngine();
    }
    return KpiFeedbackLoopEngine.instance;
  }

  public processFeedback(decisionId: string, ceoAction: 'APPROVED' | 'REJECTED' | 'REVISED', actualKpiDeltaPercentage: number): KpiFeedbackRecord {
    let signal: 'POSITIVE_REINFORCEMENT' | 'NEGATIVE_POLICY_UPDATE' | 'NEUTRAL' = 'NEUTRAL';

    if (ceoAction === 'APPROVED' && actualKpiDeltaPercentage > 0) {
      signal = 'POSITIVE_REINFORCEMENT';
    } else if (ceoAction === 'REJECTED' || actualKpiDeltaPercentage < 0) {
      signal = 'NEGATIVE_POLICY_UPDATE';
    }

    return {
      decisionId,
      ceoAction,
      actualKpiDeltaPercentage,
      learningFeedbackSignal: signal,
    };
  }
}
