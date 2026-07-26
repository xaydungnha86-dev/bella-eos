/**
 * BELLA EOS PLATFORM CONTRACT: Market Insight Contract (IMarketInsight v1.0)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME (MIR)
 * 
 * Contract 42: Market Opportunity & Threat Insight Contract.
 * Distills verified external market evidence into strategic opportunities, threats,
 * benchmarks, and executive recommendations with full citation backing.
 */

export type MarketInsightCategory = 
  | 'OPPORTUNITY' 
  | 'THREAT' 
  | 'COMPETITOR_MOVE' 
  | 'INDUSTRY_BENCHMARK' 
  | 'CUSTOMER_NEED';

export interface IMarketInsight {
  insightId: string;
  tenantId: string;
  category: MarketInsightCategory;
  title: string;
  description: string;
  executiveRecommendation: string;
  opportunityScore?: number; // 0-100
  threatScore?: number;      // 0-100
  confidenceScore: number;   // 0.0-1.0
  evidenceRefs: string[];    // List of IMarketEvidence IDs
  createdAt: string;
}
