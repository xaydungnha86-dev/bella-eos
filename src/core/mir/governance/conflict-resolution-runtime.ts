/**
 * BELLA EOS MIR GOVERNANCE: Conflict Resolution Runtime (Runtime 50)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Mission: Contradictory Market Signal Resolver. Resolves conflicting external data points
 * (e.g. Source A Industry ROAS = 3.2 vs Source B Industry ROAS = 4.8) using weighted Trust Scores & Citation Authority.
 */

export interface ContradictorySignal {
  sourceId: string;
  claimedValue: number;
  sourceTrustScore: number;
}

export interface ConflictResolutionResult {
  winningSourceId: string;
  resolvedValue: number;
  resolutionRationale: string;
}

export class ConflictResolutionRuntime {
  private static instance: ConflictResolutionRuntime;

  private constructor() {}

  public static getInstance(): ConflictResolutionRuntime {
    if (!ConflictResolutionRuntime.instance) {
      ConflictResolutionRuntime.instance = new ConflictResolutionRuntime();
    }
    return ConflictResolutionRuntime.instance;
  }

  public resolveConflict(metricName: string, signals: ContradictorySignal[]): ConflictResolutionResult {
    let highestScore = -1;
    let winningSignal = signals[0];

    let weightedSum = 0;
    let weightTotal = 0;

    for (const s of signals) {
      weightedSum += s.claimedValue * s.sourceTrustScore;
      weightTotal += s.sourceTrustScore;
      if (s.sourceTrustScore > highestScore) {
        highestScore = s.sourceTrustScore;
        winningSignal = s;
      }
    }

    const resolvedValue = Number((weightedSum / weightTotal).toFixed(2));

    return {
      winningSourceId: winningSignal.sourceId,
      resolvedValue,
      resolutionRationale: `Resolved conflict for [${metricName}]: Selected weighted average (${resolvedValue}) favoring higher authority source [${winningSignal.sourceId}] (Trust Score = ${winningSignal.sourceTrustScore}).`,
    };
  }
}
