/**
 * BELLA EOS MIR GOVERNANCE: Freshness Runtime (Runtime 49)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Mission: Signal Aging & Decay Engine. Penalizes outdated data (e.g. 2023 industry reports)
 * to ensure stale market assumptions do not pollute the Enterprise Brain.
 */

export interface FreshnessEvaluationResult {
  signalAgeDays: number;
  isOutdated: boolean;
  decayPenaltyMultiplier: number; // 0.1 to 1.0
  recommendation: string;
}

export class FreshnessRuntime {
  private static instance: FreshnessRuntime;

  private constructor() {}

  public static getInstance(): FreshnessRuntime {
    if (!FreshnessRuntime.instance) {
      FreshnessRuntime.instance = new FreshnessRuntime();
    }
    return FreshnessRuntime.instance;
  }

  public evaluateFreshness(signalAgeDays: number, maxAllowedDays: number = 90): FreshnessEvaluationResult {
    const isOutdated = signalAgeDays > maxAllowedDays;
    const decayPenaltyMultiplier = isOutdated ? 0.35 : Number((1.0 - (signalAgeDays / maxAllowedDays) * 0.30).toFixed(2));

    return {
      signalAgeDays,
      isOutdated,
      decayPenaltyMultiplier,
      recommendation: isOutdated
        ? `OUTDATED SIGNAL: Data is ${signalAgeDays} days old (> ${maxAllowedDays}d limit). Weight reduced by 65%.`
        : `FRESH SIGNAL: Data is ${signalAgeDays} days old. Compliant with freshness window.`,
    };
  }
}
