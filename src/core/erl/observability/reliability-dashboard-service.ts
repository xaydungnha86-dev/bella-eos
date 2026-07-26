/**
 * BELLA EOS ERL: Reliability Dashboard Service
 * Specification: ERL Observability Engine
 * 
 * Mission: Aggregate ERI, Capability ERI, trends, timeline events, safety metrics, and Pareto Frontier recommendations.
 */

import { IEriScore, IParetoFrontierNode } from '@/types/erl';
import { ReliabilityHeatmap } from './reliability-heatmap';
import { AiSafetyMonitor } from './ai-safety-monitor';
import { ReliabilityTimeline } from './reliability-timeline';
import { TrendAndForecastEngine } from '../diagnostics/trend-and-forecast-engine';

export class ReliabilityDashboardService {
  private static instance: ReliabilityDashboardService;

  private constructor() {}

  public static getInstance(): ReliabilityDashboardService {
    if (!ReliabilityDashboardService.instance) {
      ReliabilityDashboardService.instance = new ReliabilityDashboardService();
    }
    return ReliabilityDashboardService.instance;
  }

  public getSystemEri(): IEriScore {
    // ERI = (Accuracy * 30%) + (Citation * 15%) + (1 - Hallucination * 20%) + (Latency * 10%) + (ToolSuccess * 10%) + (Consistency * 15%)
    // Let's compute average of seed capability metrics
    const heatmap = ReliabilityHeatmap.getInstance().generateHeatmap();
    const avgAccuracy = heatmap.reduce((acc, n) => acc + n.accuracy, 0) / heatmap.length;
    const avgLatency = heatmap.reduce((acc, n) => acc + n.latency, 0) / heatmap.length;
    
    // Normalize accuracy weight to ERI scale
    const accScore = avgAccuracy / 100;
    const latencyScore = avgLatency <= 3 ? 1.0 : Math.max(0.0, 1.0 - (avgLatency - 3) / 10);
    const citationScore = 0.96;
    const hallucinationScore = 0.025; // 2.5%
    const toolSuccess = 0.98;
    const consistency = 0.95;

    const overallEri = Math.round(
      (accScore * 30 +
        citationScore * 15 +
        (1.0 - hallucinationScore) * 20 +
        latencyScore * 10 +
        toolSuccess * 10 +
        consistency * 15) * 100
    ) / 100;

    return {
      overallEri,
      accuracyWeight: 30,
      citationWeight: 15,
      hallucinationWeight: 20,
      latencyWeight: 10,
      toolSuccessWeight: 10,
      consistencyWeight: 15
    };
  }

  public getParetoRecommendations(): IParetoFrontierNode[] {
    return [
      {
        selectedModel: 'Gemini-3.5-Flash',
        estimatedCostVnd: 50,
        latencySeconds: 0.8,
        reason: 'Recommended for High-Frequency FAQ and Simple Context Lookup (Accuracy: 91%, Cost: Low).'
      },
      {
        selectedModel: 'Claude-3.5-Sonnet',
        estimatedCostVnd: 450,
        latencySeconds: 2.5,
        reason: 'Recommended for General Workforce SOP Executions and Coding Tasks (Accuracy: 96%, Cost: Medium).'
      },
      {
        selectedModel: 'GPT-Reasoning',
        estimatedCostVnd: 1200,
        latencySeconds: 8.5,
        reason: 'Recommended for Strategic Planning and Complex Financial Audits (Accuracy: 98%, Cost: High).'
      }
    ];
  }

  public printConsoleDashboard(): string {
    const eri = this.getSystemEri();
    const safety = AiSafetyMonitor.getInstance().getMetrics();
    const timeline = ReliabilityTimeline.getInstance().getEvents();
    const heatmap = ReliabilityHeatmap.getInstance().renderTerminalHeatmap();
    const forecast = TrendAndForecastEngine.getInstance().generateForecast(97.0);

    let d = '\n========================================================================\n';
    d += `🏛️  BELLA EOS: EXECUTIVE AI RELIABILITY DASHBOARD\n`;
    d += `========================================================================\n`;
    d += `📈 OVERALL ENTERPRISE RELIABILITY INDEX (ERI): ${eri.overallEri}/100\n`;
    d += `   - Accuracy (30%): ${eri.accuracyWeight}% weighted\n`;
    d += `   - Citation (15%): ${eri.citationWeight}% weighted\n`;
    d += `   - Hallucination Monitor (20%): ${eri.hallucinationWeight}% weighted\n`;
    d += `   - Latency Compliance (10%): ${eri.latencyWeight}% weighted\n`;
    d += `   - Tool Success (10%): ${eri.toolSuccessWeight}% weighted\n`;
    d += `   - Consistency (15%): ${eri.consistencyWeight}% weighted\n`;
    d += `------------------------------------------------------------------------\n`;
    d += `🔮 FORECAST REPORT:\n`;
    d += `   - Predicted ERI (14 Days Out): ${forecast.predictedEriIn14Days}/100\n`;
    d += `   - SLA Violation Forecast     : ${forecast.daysToSlaViolation === -1 ? 'None' : `${forecast.daysToSlaViolation} days`}\n`;
    d += `   - Strategy Advice            : ${forecast.recommendation}\n`;
    d += `------------------------------------------------------------------------\n`;
    d += `🛡️  AI SAFETY METER:\n`;
    d += `   - Prompt Injection Detections: ${safety.promptInjectionsCount}\n`;
    d += `   - Unsafe Output Blocs        : ${safety.unsafeOutputsCount}\n`;
    d += `   - PII Leak Detections        : ${safety.piiLeaksCount}\n`;
    d += `   - Policy Violation Blocks    : ${safety.policyViolationsCount}\n`;
    d += `------------------------------------------------------------------------\n`;
    d += `📜 RELIABILITY TIMELINE LOG (Last 3 events):\n`;
    timeline.slice(-3).forEach(e => {
      d += `   [${e.timestamp.substring(11, 19)}] [${e.type}] ${e.description}\n`;
    });
    
    d += heatmap;
    d += `========================================================================\n`;
    return d;
  }
}
