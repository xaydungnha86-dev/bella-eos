/**
 * BELLA EOS PLATFORM CONTRACT: Cognitive Cache Entry Contract (ICognitiveCacheEntry v1.0)
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME (EDR)
 * 
 * Contract 35: Enterprise Cognitive Cache Entry Interface. Caches cognitive retrieval,
 * context ranking, and reasoning steps to save LLM tokens and accelerate decision response times.
 */

export interface ICognitiveCacheEntry {
  cacheId: string;
  queryHash: string;
  tenantId: string;
  userObjective: string;
  retrievedContextSummary: string;
  reasoningPlanId: string;
  harnessPackageId: string;
  ttlMs: number;
  createdAt: string;
  expiresAt: string;
}
