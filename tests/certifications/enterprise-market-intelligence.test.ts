/**
 * BELLA EOS CERTIFICATION: Enterprise Market Intelligence Runtime (MIR) Certification Suite
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME
 * 
 * Verifies Market Monitoring (R37), Competitor Intelligence (R38), Trend Intelligence (R39),
 * Customer Voice (R40), Opportunity Discovery (R41), Threat Detection (R42), Industry Benchmark (R43),
 * Forecast Intelligence (R44), External Knowledge (R45), Market Memory (R46), and Contracts 41–43.
 */

import { MarketMonitoringRuntime } from '@/core/mir/market-monitoring-runtime';
import { CompetitorIntelligenceRuntime } from '@/core/mir/competitor-intelligence-runtime';
import { TrendIntelligenceRuntime } from '@/core/mir/trend-intelligence-runtime';
import { CustomerVoiceRuntime } from '@/core/mir/customer-voice-runtime';
import { OpportunityDiscoveryRuntime } from '@/core/mir/opportunity-discovery-runtime';
import { ThreatDetectionRuntime } from '@/core/mir/threat-detection-runtime';
import { IndustryBenchmarkRuntime } from '@/core/mir/industry-benchmark-runtime';
import { ForecastIntelligenceRuntime } from '@/core/mir/forecast-intelligence-runtime';
import { ExternalKnowledgeRuntime } from '@/core/mir/external-knowledge-runtime';
import { MarketMemoryRuntime } from '@/core/mir/market-memory-runtime';
import { MarketIntelligenceOrchestrator } from '@/core/mir/market-intelligence-orchestrator';

describe('BELLA EOS v18.9 Enterprise Market Intelligence (MIR) Certification', () => {

  it('1. Market Monitoring & Competitor Intelligence (Contracts 41, 21): should normalize raw data to evidence & knowledge', () => {
    const evidence = MarketMonitoringRuntime.getInstance().monitorSource('tenant-1', 'COMPETITOR_WEB', 'Raw Promo Signal');
    const compKnowledge = CompetitorIntelligenceRuntime.getInstance().trackCompetitorMove('tenant-1', 'Comp A', 'Discount', '20% off');

    expect(evidence.marketEvidenceId).toMatch(/^mkt-evid-/);
    expect(evidence.confidenceScore).toBeGreaterThan(0.9);
    expect(compKnowledge.category).toBe('RECOMMENDATION');
  });

  it('2. Trend & Customer Voice Runtimes: should score trend impact & extract VoC insights', () => {
    const trend = TrendIntelligenceRuntime.getInstance().analyzeTrend('Organic Reviews', 50);
    const voc = CustomerVoiceRuntime.getInstance().extractVoiceOfCustomer(['Review 1', 'Review 2']);

    expect(trend.trendScore).toBeGreaterThan(0);
    expect(voc.painPoint).toBeDefined();
    expect(voc.sentimentScore).toBeGreaterThan(0);
  });

  it('3. Opportunity & Threat Discovery (Contract 42): should generate strategic insights with scores', () => {
    const opp = OpportunityDiscoveryRuntime.getInstance().discoverOpportunity('tenant-1', 'Mobile Spa', 30);
    const thrt = ThreatDetectionRuntime.getInstance().detectThreat('tenant-1', 'Competitor Price Slash', 'HIGH');

    expect(opp.category).toBe('OPPORTUNITY');
    expect(opp.opportunityScore).toBeGreaterThan(50);
    expect(thrt.category).toBe('THREAT');
    expect(thrt.threatScore).toBe(90);
  });

  it('4. Industry Benchmark & Forecast Intelligence (Contract 43): should evaluate ROAS delta & scenario projections', () => {
    const benchmark = IndustryBenchmarkRuntime.getInstance().compareMetric('ROAS', 3.2, 2.5);
    const forecast = ForecastIntelligenceRuntime.getInstance().generateForecast('tenant-1', 'EXPECTED_CASE', 6);

    expect(benchmark.status).toBe('OUTPERFORMING');
    expect(forecast.scenario).toBe('EXPECTED_CASE');
    expect(forecast.probabilityPercentage).toBe(65);
  });

  it('5. External Knowledge & Market Memory Runtimes: should distill reports & retain long-term market lessons', () => {
    const report = ExternalKnowledgeRuntime.getInstance().distillExternalReport('tenant-1', 'Whitepaper Q3', 'Video ads win');
    const memory = MarketMemoryRuntime.getInstance().recordMarketLesson('tenant-1', 'Tet Holiday', 'TikTok ROAS +28%', 28);

    expect(report.id).toMatch(/^knw-ext-/);
    expect(memory.memoryId).toMatch(/^mkt-mem-/);
  });

  it('6. Master Market Intelligence Orchestrator: should execute full MIR scan adhering to Zero-Raw-Data rule', async () => {
    const report = await MarketIntelligenceOrchestrator.getInstance().runMarketIntelligenceScan('tenant-1', 'Comp A');

    expect(report.evidence.marketEvidenceId).toBeDefined();
    expect(report.opportunityInsight.opportunityScore).toBeGreaterThan(0);
    expect(report.forecast.timeHorizonMonths).toBe(6);
    expect(report.marketMemory.observedAdvantagePercentage).toBe(28);
  });
});
