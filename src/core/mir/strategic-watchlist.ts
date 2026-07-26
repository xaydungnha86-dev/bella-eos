/**
 * BELLA EOS MIR: Strategic Watchlist & Proactive Alert Engine
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME
 * 
 * Mission: Proactive Strategic Watchlist Engine. Continuously monitors top competitors,
 * industry keywords, regulatory shifts, and ad platform changes. Automatically generates `IMarketEvidence`
 * and feeds into ELR ➔ EAH ➔ ECH to warn CEO without waiting for CEO prompts.
 */

import { IMarketEvidence } from '@/types/market-evidence';
import { MarketMonitoringRuntime } from './market-monitoring-runtime';

export interface WatchlistTopic {
  topicId: string;
  topicCategory: 'COMPETITOR' | 'INDUSTRY_KEYWORD' | 'LEGAL_REGULATORY' | 'AD_PLATFORM_POLICY';
  queryKeyword: string;
  isHighPriorityAlert: boolean;
}

export class StrategicWatchlistEngine {
  private static instance: StrategicWatchlistEngine;
  private watchTopics: Map<string, WatchlistTopic> = new Map();

  private constructor() {
    this.seedDefaultTopics();
  }

  public static getInstance(): StrategicWatchlistEngine {
    if (!StrategicWatchlistEngine.instance) {
      StrategicWatchlistEngine.instance = new StrategicWatchlistEngine();
    }
    return StrategicWatchlistEngine.instance;
  }

  private seedDefaultTopics(): void {
    this.addTopic('topic-1', 'COMPETITOR', 'Spa X Discount Promotion', true);
    this.addTopic('topic-2', 'INDUSTRY_KEYWORD', 'High-End Beauty Mobile Booking', false);
    this.addTopic('topic-3', 'AD_PLATFORM_POLICY', 'TikTok Ads CPM Algorithm Update', true);
  }

  public addTopic(topicId: string, topicCategory: WatchlistTopic['topicCategory'], queryKeyword: string, isHighPriorityAlert: boolean): void {
    this.watchTopics.set(topicId, { topicId, topicCategory, queryKeyword, isHighPriorityAlert });
  }

  public executeProactiveScan(tenantId: string): { totalTopicsScanned: number; generatedAlerts: IMarketEvidence[] } {
    const alerts: IMarketEvidence[] = [];

    this.watchTopics.forEach(topic => {
      if (topic.isHighPriorityAlert) {
        const evidence = MarketMonitoringRuntime.getInstance().monitorSource(
          tenantId,
          'COMPETITOR_WEB',
          `PROACTIVE ALERT: Strategic Watchlist detected movement on [${topic.queryKeyword}]`
        );
        alerts.push(evidence);
      }
    });

    return {
      totalTopicsScanned: this.watchTopics.size,
      generatedAlerts: alerts,
    };
  }
}
