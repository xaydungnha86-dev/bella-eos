/**
 * BELLA EOS PLATFORM CONTRACT: Economic & ROI Governor Contract (IEconomicROI v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Tracks AI worker token cost vs actual revenue impact and calculates ROI.
 */

export interface CostItem {
  id: string;
  taskId: string;
  workerId: string;
  tokensUsed: number;
  computeMs: number;
  costUsd: number;
  timestamp: string;
}

export interface RevenueImpactItem {
  id: string;
  campaignId: string;
  revenueGeneratedVnd: number;
  leadsGenerated: number;
  timestamp: string;
}

export interface CostEstimate {
  estimatedTokens: number;
  estimatedCostUsd: number;
  estimatedComputeMs: number;
}

export interface RevenueImpactResult {
  campaignId: string;
  totalCostUsd: number;
  totalRevenueVnd: number;
  roiScoreMultiplier: number; // e.g. 125.0 (125x return)
}

export interface IEconomicROI {
  estimateCost(executionPlan: any): Promise<CostEstimate>;
  trackActualCost(costItem: Omit<CostItem, 'id' | 'timestamp'>): Promise<void>;
  evaluateRevenueImpact(campaignId: string): Promise<RevenueImpactResult>;
  calculateROIScore(costUsd: number, revenueVnd: number): number;
}
