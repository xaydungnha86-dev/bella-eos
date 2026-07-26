/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Cost Analytics Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 * 
 * Mission: Enterprise Cost Control & ROI Analytics. Tracks real-time compute expenditures across LLM tokens,
 * GPU reservation times, and external API billing, correlating costs with business ROI metrics.
 */

export interface CostReport {
  totalExpenditureUsd: number;
  modelCostsBreakdown: Record<string, number>;
  businessRoiPercentage: number;
}

export class EnterpriseCostAnalyticsService {
  private static instance: EnterpriseCostAnalyticsService;
  private totalSpent = 0;
  private modelCosts: Map<string, number> = new Map();

  private constructor() {
    this.modelCosts.set('claude-3.5-sonnet', 0);
    this.modelCosts.set('gpt-4o', 0);
    this.modelCosts.set('gemini-1.5-pro', 0);
  }

  public static getInstance(): EnterpriseCostAnalyticsService {
    if (!EnterpriseCostAnalyticsService.instance) {
      EnterpriseCostAnalyticsService.instance = new EnterpriseCostAnalyticsService();
    }
    return EnterpriseCostAnalyticsService.instance;
  }

  public trackUsage(modelName: string, tokensUsed: number, costMultiplier: number = 0.000015): void {
    const cost = tokensUsed * costMultiplier;
    this.totalSpent += cost;
    const current = this.modelCosts.get(modelName) || 0;
    this.modelCosts.set(modelName, current + cost);
  }

  public getCostReport(historicalRevenueIncreaseUsd: number): CostReport {
    const breakdown: Record<string, number> = {};
    this.modelCosts.forEach((val, key) => {
      breakdown[key] = Number(val.toFixed(4));
    });

    const roi = this.totalSpent > 0 
      ? Number((((historicalRevenueIncreaseUsd - this.totalSpent) / this.totalSpent) * 100).toFixed(2))
      : 0;

    return {
      totalExpenditureUsd: Number(this.totalSpent.toFixed(4)),
      modelCostsBreakdown: breakdown,
      businessRoiPercentage: roi,
    };
  }
}
