/**
 * BELLA EOS MIR: Market Memory Runtime (Runtime 46)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME
 * 
 * Mission: Long-Term Market Lesson Memory Store. Ignores transient daily news noise and permanently
 * retains distilled seasonal & macro market lessons (e.g. "Tet TikTok Livestream ROAS is 28% higher than Facebook Ads").
 */

export interface MarketMemoryEntry {
  memoryId: string;
  tenantId: string;
  seasonOrContext: string;
  distilledLesson: string;
  observedAdvantagePercentage: number;
  recordedAt: string;
}

export class MarketMemoryRuntime {
  private static instance: MarketMemoryRuntime;
  private memoryStore: Map<string, MarketMemoryEntry> = new Map();

  private constructor() {}

  public static getInstance(): MarketMemoryRuntime {
    if (!MarketMemoryRuntime.instance) {
      MarketMemoryRuntime.instance = new MarketMemoryRuntime();
    }
    return MarketMemoryRuntime.instance;
  }

  public recordMarketLesson(tenantId: string, seasonOrContext: string, distilledLesson: string, observedAdvantagePercentage: number): MarketMemoryEntry {
    const memoryId = `mkt-mem-${Date.now()}`;
    const entry: MarketMemoryEntry = {
      memoryId,
      tenantId,
      seasonOrContext,
      distilledLesson,
      observedAdvantagePercentage,
      recordedAt: new Date().toISOString(),
    };

    this.memoryStore.set(memoryId, entry);
    return entry;
  }

  public listMarketLessons(tenantId: string): MarketMemoryEntry[] {
    return Array.from(this.memoryStore.values()).filter(m => m.tenantId === tenantId);
  }
}
