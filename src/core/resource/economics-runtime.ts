export interface ICostEstimation {
  estimatedTokens: number;
  llmCostVnd: number;
  gpuCostVnd: number;
  netMarginImpact: number;
}

export class EconomicsRuntime {
  private static instance: EconomicsRuntime;

  private constructor() {}

  public static getInstance(): EconomicsRuntime {
    if (!EconomicsRuntime.instance) {
      EconomicsRuntime.instance = new EconomicsRuntime();
    }
    return EconomicsRuntime.instance;
  }

  public estimateCost(objective: string): ICostEstimation {
    const isBig = objective.toLowerCase().includes('300%') || objective.toLowerCase().includes('gấp 3');
    return {
      estimatedTokens: isBig ? 12000 : 3500,
      llmCostVnd: isBig ? 4200 : 1200,
      gpuCostVnd: isBig ? 15000 : 4500,
      netMarginImpact: isBig ? 22 : 38 // 38% net margin target!
    };
  }
}
