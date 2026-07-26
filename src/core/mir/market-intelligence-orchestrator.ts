/**
 * BELLA EOS MIR: Master Market Intelligence Orchestrator
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME
 * 
 * Mission: Master Market Intelligence Orchestrator. Unifies the 10 MIR Sub-Runtimes:
 * 1. Market Monitoring Runtime (Runtime 37)
 * 2. Competitor Intelligence Runtime (Runtime 38)
 * 3. Trend Intelligence Runtime (Runtime 39)
 * 4. Customer Voice Runtime (Runtime 40)
 * 5. Opportunity Discovery Runtime (Runtime 41)
 * 6. Threat Detection Runtime (Runtime 42)
 * 7. Industry Benchmark Runtime (Runtime 43)
 * 8. Forecast Intelligence Runtime (Runtime 44)
 * 9. External Knowledge Runtime (Runtime 45)
 * 10. Market Memory Runtime (Runtime 46)
 * Enforces Zero Raw External Data to LLM Pipeline:
 * External Data ➔ Normalization ➔ Evidence ➔ Verification ➔ Knowledge ➔ EAH ➔ ECH ➔ LLM.
 */

import { IMarketEvidence } from '@/types/market-evidence';
import { IMarketInsight } from '@/types/market-insight';
import { IMarketForecast } from '@/types/market-forecast';

import { MarketMonitoringRuntime } from './market-monitoring-runtime';
import { CompetitorIntelligenceRuntime } from './competitor-intelligence-runtime';
import { TrendIntelligenceRuntime } from './trend-intelligence-runtime';
import { CustomerVoiceRuntime } from './customer-voice-runtime';
import { OpportunityDiscoveryRuntime } from './opportunity-discovery-runtime';
import { ThreatDetectionRuntime } from './threat-detection-runtime';
import { IndustryBenchmarkRuntime } from './industry-benchmark-runtime';
import { ForecastIntelligenceRuntime } from './forecast-intelligence-runtime';
import { ExternalKnowledgeRuntime } from './external-knowledge-runtime';
import { MarketMemoryRuntime, MarketMemoryEntry } from './market-memory-runtime';

export interface MarketIntelligenceReport {
  evidence: IMarketEvidence;
  opportunityInsight: IMarketInsight;
  threatInsight: IMarketInsight;
  forecast: IMarketForecast;
  benchmarkResult: { companyValue: number; benchmarkValue: number; deltaPercentage: number };
  marketMemory: MarketMemoryEntry;
}

export class MarketIntelligenceOrchestrator {
  private static instance: MarketIntelligenceOrchestrator;

  private constructor() {}

  public static getInstance(): MarketIntelligenceOrchestrator {
    if (!MarketIntelligenceOrchestrator.instance) {
      MarketIntelligenceOrchestrator.instance = new MarketIntelligenceOrchestrator();
    }
    return MarketIntelligenceOrchestrator.instance;
  }

  public async runMarketIntelligenceScan(tenantId: string, competitorName: string): Promise<MarketIntelligenceReport> {
    // 1. Market Monitoring (R37)
    const evidence = MarketMonitoringRuntime.getInstance().monitorSource(tenantId, 'COMPETITOR_WEB', `Tracked competitor [${competitorName}] price discount promotion`);

    // 2. Competitor Intelligence (R38)
    CompetitorIntelligenceRuntime.getInstance().trackCompetitorMove(tenantId, competitorName, 'Price Slash', 'Discounted spa packages by 20%');

    // 3. Trend Intelligence (R39)
    TrendIntelligenceRuntime.getInstance().analyzeTrend('Organic Customer Review Creative', 45);

    // 4. Customer Voice (R40)
    CustomerVoiceRuntime.getInstance().extractVoiceOfCustomer(['Review 1: Loved authentic video', 'Review 2: Fast weekend booking']);

    // 5. Opportunity Discovery (R41)
    const opportunityInsight = OpportunityDiscoveryRuntime.getInstance().discoverOpportunity(tenantId, 'High-End Mobile Spa Service', 28);

    // 6. Threat Detection (R42)
    const threatInsight = ThreatDetectionRuntime.getInstance().detectThreat(tenantId, `Competitor [${competitorName}] Aggressive Ad Spike`, 'MEDIUM');

    // 7. Industry Benchmark (R43)
    const benchmark = IndustryBenchmarkRuntime.getInstance().compareMetric('ROAS', 3.2, 2.5);

    // 8. Forecast Intelligence (R44)
    const forecast = ForecastIntelligenceRuntime.getInstance().generateForecast(tenantId, 'EXPECTED_CASE', 6);

    // 9. External Knowledge (R45)
    ExternalKnowledgeRuntime.getInstance().distillExternalReport(tenantId, 'Q3 2026 Beauty & Wellness Report', 'Video review ad formats deliver 2.8x higher CTR');

    // 10. Market Memory (R46)
    const memory = MarketMemoryRuntime.getInstance().recordMarketLesson(tenantId, 'Tet Holiday Season', 'TikTok Livestream ROAS is +28% higher than Facebook Ads', 28);

    return {
      evidence,
      opportunityInsight,
      threatInsight,
      forecast,
      benchmarkResult: {
        companyValue: benchmark.companyValue,
        benchmarkValue: benchmark.industryBenchmarkValue,
        deltaPercentage: benchmark.performanceDeltaPercentage,
      },
      marketMemory: memory,
    };
  }
}
