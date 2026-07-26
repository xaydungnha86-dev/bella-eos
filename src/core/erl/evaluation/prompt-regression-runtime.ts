/**
 * BELLA EOS ERL: Prompt Regression Runtime
 * Specification: ERL Evaluation Engine
 * 
 * Mission: Compare prompt version parameters and detect regression degradation.
 */

import { IPromptVersion } from '@/types/erl';

export class PromptRegressionRuntime {
  private static instance: PromptRegressionRuntime;

  private constructor() {}

  public static getInstance(): PromptRegressionRuntime {
    if (!PromptRegressionRuntime.instance) {
      PromptRegressionRuntime.instance = new PromptRegressionRuntime();
    }
    return PromptRegressionRuntime.instance;
  }

  public detectRegression(current: IPromptVersion, candidate: IPromptVersion): { regressionDetected: boolean; accuracyDelta: number; latencyDelta: number } {
    const accuracyDelta = candidate.accuracyRate - current.accuracyRate;
    const latencyDelta = candidate.latencySeconds - current.latencySeconds;

    const regressionDetected = accuracyDelta < -0.01 || latencyDelta > 2.0;

    return {
      regressionDetected,
      accuracyDelta: Math.round(accuracyDelta * 100) / 100,
      latencyDelta: Math.round(latencyDelta * 100) / 100
    };
  }
}
