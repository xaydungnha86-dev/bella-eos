/**
 * BELLA EOS EDR: Enterprise Cognitive Cache
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME
 * 
 * Mission: Enterprise Cognitive Token & Computation Cache. Caches context retrieval,
 * ranking, reasoning plans, and evidence citations to eliminate redundant LLM token costs.
 */

import { ICognitiveCacheEntry } from '@/types/cognitive-cache-entry';

export class CognitiveCache {
  private static instance: CognitiveCache;
  private cacheMap: Map<string, ICognitiveCacheEntry> = new Map();

  private constructor() {}

  public static getInstance(): CognitiveCache {
    if (!CognitiveCache.instance) {
      CognitiveCache.instance = new CognitiveCache();
    }
    return CognitiveCache.instance;
  }

  private generateHash(tenantId: string, objective: string): string {
    return `hash-${tenantId}-${objective.toLowerCase().trim().replace(/\s+/g, '-')}`;
  }

  public get(tenantId: string, objective: string): ICognitiveCacheEntry | undefined {
    const hash = this.generateHash(tenantId, objective);
    const entry = this.cacheMap.get(hash);

    if (!entry) return undefined;

    // Check expiration
    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      this.cacheMap.delete(hash);
      return undefined;
    }

    return entry;
  }

  public set(tenantId: string, objective: string, summary: string, planId: string, harnessId: string, ttlMs: number = 1800_000): ICognitiveCacheEntry {
    const hash = this.generateHash(tenantId, objective);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

    const entry: ICognitiveCacheEntry = {
      cacheId: `cog-cache-${Date.now()}`,
      queryHash: hash,
      tenantId,
      userObjective: objective,
      retrievedContextSummary: summary,
      reasoningPlanId: planId,
      harnessPackageId: harnessId,
      ttlMs,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.cacheMap.set(hash, entry);
    return entry;
  }

  public clear(): void {
    this.cacheMap.clear();
  }
}
