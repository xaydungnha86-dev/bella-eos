export type EvidenceQuality = 
  | 'SYNTHETIC' 
  | 'SIMULATED' 
  | 'PRODUCTION_OBSERVED' 
  | 'PRODUCTION_REPEATED' 
  | 'PRODUCTION_VALIDATED';

export type LearningCandidateStatus = 
  | 'OBSERVE_ONLY' 
  | 'PATTERN_CANDIDATE' 
  | 'IMPROVEMENT_PROPOSAL' 
  | 'ELIGIBLE_FOR_HUMAN_REVIEW';

export interface MinimumEvidenceThresholdPolicy {
  minimumExecutions: number;
  minimumMeasurementWindows: number;
  minimumAttributionConfidence: number;
  requireZeroCriticalIncidents: boolean;
}

export class LearningPolicyEvaluator {
  public static evaluateCandidateStatus(
    executionCount: number,
    evidenceQuality: EvidenceQuality,
    attributionConfidence: number
  ): LearningCandidateStatus {
    // Phase 9 Gate: Block learning if data is synthetic or simulated
    if (evidenceQuality === 'SYNTHETIC' || evidenceQuality === 'SIMULATED') {
      return 'OBSERVE_ONLY';
    }

    if (executionCount < 10 || attributionConfidence < 75) {
      return 'OBSERVE_ONLY';
    }

    if (executionCount >= 50 && evidenceQuality === 'PRODUCTION_VALIDATED') {
      return 'ELIGIBLE_FOR_HUMAN_REVIEW';
    }

    if (executionCount >= 25 && (evidenceQuality === 'PRODUCTION_REPEATED' || evidenceQuality === 'PRODUCTION_VALIDATED')) {
      return 'IMPROVEMENT_PROPOSAL';
    }

    return 'PATTERN_CANDIDATE';
  }
}
