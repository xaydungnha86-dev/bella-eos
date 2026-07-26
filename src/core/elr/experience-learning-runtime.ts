/**
 * BELLA EOS ELR: Experience Learning Runtime (Runtime 7)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Closed-Loop Experience Feedback Engine. Tracks initial Executive Decisions vs
 * actual operational outcomes over time (e.g. 30 days post-execution). Computes success,
 * score, and deltas to transform execution data into Enterprise Experience.
 */

import { IExperience } from '@/types/experience';

export interface RegisterDecisionPayload {
  decisionId: string;
  description: string;
  initiativeName: string;
  executiveId?: string;
  workflowId?: string;
  expectedMetric: string;
  expectedValue: number;
  timelineDays: number;
}

export class ExperienceLearningRuntime {
  private static instance: ExperienceLearningRuntime;
  private pendingDecisions: Map<string, RegisterDecisionPayload> = new Map();
  private experienceLog: Map<string, IExperience> = new Map();

  private constructor() {}

  public static getInstance(): ExperienceLearningRuntime {
    if (!ExperienceLearningRuntime.instance) {
      ExperienceLearningRuntime.instance = new ExperienceLearningRuntime();
    }
    return ExperienceLearningRuntime.instance;
  }

  public registerDecision(payload: RegisterDecisionPayload): void {
    this.pendingDecisions.set(payload.decisionId, payload);
  }

  public evaluateExperience(
    decisionId: string,
    actualValue: number,
    measuredAt: string = new Date().toISOString()
  ): IExperience {
    const decision = this.pendingDecisions.get(decisionId);
    if (!decision) {
      // Fallback evaluation if decision not pre-registered
      const expId = `exp-${Date.now()}`;
      const exp: IExperience = {
        id: expId,
        decision: { id: decisionId, description: 'Executive Initiative', initiativeName: 'Enterprise Action' },
        action: { description: 'Execution of Initiative' },
        expected: { metric: 'Revenue', value: 100, timelineDays: 30 },
        actual: { metric: 'Revenue', value: actualValue, measuredAt },
        delta: { absoluteChange: actualValue - 100, percentageChange: ((actualValue - 100) / 100) * 100 },
        success: actualValue >= 100,
        score: actualValue >= 100 ? 0.90 : 0.40,
        confidence: 0.85,
        timestamp: measuredAt,
      };
      this.experienceLog.set(expId, exp);
      return exp;
    }

    const expValue = decision.expectedValue;
    const deltaAbs = actualValue - expValue;
    const deltaPct = expValue !== 0 ? (deltaAbs / Math.abs(expValue)) * 100 : 0;
    const isSuccess = actualValue >= expValue;
    const score = isSuccess ? Math.min(1.0, 0.85 + (deltaPct > 0 ? 0.10 : 0)) : Math.max(0.1, 0.50 - (Math.abs(deltaPct) / 100));

    const expId = `exp-${Date.now()}`;
    const experience: IExperience = {
      id: expId,
      decision: {
        id: decision.decisionId,
        description: decision.description,
        initiativeName: decision.initiativeName,
        executiveId: decision.executiveId,
      },
      action: {
        workflowId: decision.workflowId,
        description: `Executed SOP for ${decision.initiativeName}`,
      },
      expected: {
        metric: decision.expectedMetric,
        value: expValue,
        timelineDays: decision.timelineDays,
      },
      actual: {
        metric: decision.expectedMetric,
        value: actualValue,
        measuredAt,
      },
      delta: {
        absoluteChange: deltaAbs,
        percentageChange: deltaPct,
      },
      success: isSuccess,
      score: Math.round(score * 100) / 100,
      confidence: 0.95,
      timestamp: measuredAt,
    };

    this.experienceLog.set(expId, experience);
    this.pendingDecisions.delete(decisionId);
    return experience;
  }

  public listExperiences(): IExperience[] {
    return Array.from(this.experienceLog.values());
  }
}
