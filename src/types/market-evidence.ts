/**
 * BELLA EOS PLATFORM CONTRACT: Market Evidence Contract (IMarketEvidence v1.0)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME (MIR)
 * 
 * Contract 41: Normalized External Market Evidence Contract.
 * Captures external market signals (Google, Facebook, TikTok, Web, Competitors, News)
 * normalized into verifiable Evidence before reaching AI reasoning prompts.
 */

export type MarketSourceType = 
  | 'GOOGLE_SEARCH' 
  | 'FACEBOOK_ADS' 
  | 'TIKTOK_TRENDS' 
  | 'COMPETITOR_WEB' 
  | 'INDUSTRY_REPORT' 
  | 'CUSTOMER_REVIEW' 
  | 'NEWS_MEDIA';

export interface IMarketEvidence {
  marketEvidenceId: string;
  tenantId: string;
  sourceType: MarketSourceType;
  competitorName?: string;
  trendTag?: string;
  customerVoiceRaw?: string;
  normalizedSummary: string;
  confidenceScore: number;
  extractedTimestamp: string;
  metadata?: Record<string, any>;
}
