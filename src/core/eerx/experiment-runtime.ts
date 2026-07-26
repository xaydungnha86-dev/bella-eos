/**
 * BELLA EOS EERX: Enterprise Experimentation Runtime
 * Specification: v18.7 BELLA EOS ENTERPRISE EXPERIMENTATION RUNTIME
 * 
 * Mission: Controlled Enterprise A/B/C Experimentation Engine.
 * Designs hypotheses, sets traffic/budget allocations, measures performance, and declares winner variants before full capital rollout.
 */

import { IExperimentPayload, ExperimentVariant } from '@/types/experiment-payload';

export class ExperimentRuntime {
  private static instance: ExperimentRuntime;
  private experiments: Map<string, IExperimentPayload> = new Map();

  private constructor() {}

  public static getInstance(): ExperimentRuntime {
    if (!ExperimentRuntime.instance) {
      ExperimentRuntime.instance = new ExperimentRuntime();
    }
    return ExperimentRuntime.instance;
  }

  public createExperiment(tenantId: string, hypothesis: string, variants: ExperimentVariant[]): IExperimentPayload {
    const experimentId = `exp-${Date.now()}`;

    const exp: IExperimentPayload = {
      experimentId,
      tenantId,
      hypothesis,
      variants,
      sampleSizeTarget: 1000,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
    };

    this.experiments.set(experimentId, exp);
    return exp;
  }

  public evaluateExperiment(experimentId: string, variantResults: Record<string, number>): IExperimentPayload {
    const exp = this.experiments.get(experimentId);
    if (!exp) throw new Error(`Experiment [${experimentId}] not found`);

    let bestScore = -1;
    let winnerId = '';

    for (const v of exp.variants) {
      const score = variantResults[v.variantId] || 0;
      v.observedRoiPercentage = score;
      if (score > bestScore) {
        bestScore = score;
        winnerId = v.variantId;
      }
    }

    exp.winnerVariantId = winnerId;
    exp.status = 'COMPLETED';
    exp.completedAt = new Date().toISOString();

    return exp;
  }
}
