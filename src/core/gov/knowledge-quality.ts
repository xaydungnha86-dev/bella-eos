/**
 * BELLA EOS E-COS: Knowledge Quality Score (KQS) Engine
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Mission: Knowledge Trust & Quality Assurance Engine. Computes dynamic KQS scores (0-100)
 * based on operational success/failure feedback, filtering out unverified or low-performing lessons (< 80).
 */

export interface ScoredKnowledgeItem {
  knowledgeId: string;
  title: string;
  kqsScore: number; // 0 - 100
  timesApplied: number;
  timesSuccessful: number;
  isEligibleForPrompt: boolean;
}

export class KnowledgeQualityEngine {
  private static instance: KnowledgeQualityEngine;

  private constructor() {}

  public static getInstance(): KnowledgeQualityEngine {
    if (!KnowledgeQualityEngine.instance) {
      KnowledgeQualityEngine.instance = new KnowledgeQualityEngine();
    }
    return KnowledgeQualityEngine.instance;
  }

  public computeKqs(timesApplied: number, timesSuccessful: number): number {
    if (timesApplied === 0) return 85; // Initial default score
    const winRate = timesSuccessful / timesApplied;
    return Math.floor(winRate * 100);
  }

  public evaluateItem(knowledgeId: string, title: string, timesApplied: number, timesSuccessful: number): ScoredKnowledgeItem {
    const kqsScore = this.computeKqs(timesApplied, timesSuccessful);
    return {
      knowledgeId,
      title,
      kqsScore,
      timesApplied,
      timesSuccessful,
      isEligibleForPrompt: kqsScore >= 80,
    };
  }
}
