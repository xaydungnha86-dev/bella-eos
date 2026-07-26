/**
 * BELLA EOS EDR: Consensus Engine Runtime (Runtime 22)
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME
 * 
 * Mission: Executive Consensus Calculator. Aggregates expert votes, calculates consensus score (%),
 * and automatically triggers CEO Escalation Review if consensus score is < 75%.
 */

import { ExpertOpinion } from '@/types/deliberation-session';

export class ConsensusEngineRuntime {
  private static instance: ConsensusEngineRuntime;

  private constructor() {}

  public static getInstance(): ConsensusEngineRuntime {
    if (!ConsensusEngineRuntime.instance) {
      ConsensusEngineRuntime.instance = new ConsensusEngineRuntime();
    }
    return ConsensusEngineRuntime.instance;
  }

  public calculateConsensus(opinions: ExpertOpinion[]): { consensusScore: number; requiresCeoReview: boolean } {
    if (opinions.length === 0) return { consensusScore: 100, requiresCeoReview: false };

    let totalScore = 0;
    for (const op of opinions) {
      if (op.recommendation === 'APPROVE') totalScore += 100;
      else if (op.recommendation === 'CONDITIONAL_APPROVAL') totalScore += 80;
      else totalScore += 20; // REJECT
    }

    const consensusScore = Math.round(totalScore / opinions.length);
    const requiresCeoReview = consensusScore < 75;

    return { consensusScore, requiresCeoReview };
  }
}
