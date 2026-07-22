/**
 * BELLA EOS EXECUTION: Economic ROI Governor
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IEconomicROI v1.0.
 */

import { CostEstimate, CostItem, IEconomicROI, RevenueImpactResult } from '@/types/economic';

export class EconomicGovernor implements IEconomicROI {
  private static instance: EconomicGovernor;
  private costs: CostItem[] = [];

  private constructor() {}

  public static getInstance(): EconomicGovernor {
    if (!EconomicGovernor.instance) {
      EconomicGovernor.instance = new EconomicGovernor();
    }
    return EconomicGovernor.instance;
  }

  public async estimateCost(executionPlan: any): Promise<CostEstimate> {
    const taskCount = executionPlan.tasks?.length || 1;
    return {
      estimatedTokens: taskCount * 1500,
      estimatedCostUsd: Number((taskCount * 0.02).toFixed(2)),
      estimatedComputeMs: taskCount * 500,
    };
  }

  public async trackActualCost(costInput: Omit<CostItem, 'id' | 'timestamp'>): Promise<void> {
    this.costs.push({
      ...costInput,
      id: `cost-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  }

  public async evaluateRevenueImpact(campaignId: string): Promise<RevenueImpactResult> {
    const totalCostUsd = this.costs.reduce((sum, c) => sum + c.costUsd, 0) || 5.0;
    const totalRevenueVnd = 125000000; // 125M VND
    const roiMultiplier = this.calculateROIScore(totalCostUsd, totalRevenueVnd);

    return {
      campaignId,
      totalCostUsd,
      totalRevenueVnd,
      roiScoreMultiplier: roiMultiplier,
    };
  }

  public calculateROIScore(costUsd: number, revenueVnd: number): number {
    const costVnd = costUsd * 25000;
    if (costVnd === 0) return 0;
    return Number((revenueVnd / costVnd).toFixed(1));
  }
}
