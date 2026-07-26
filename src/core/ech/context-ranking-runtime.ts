/**
 * BELLA EOS ECH: Context Ranking Runtime (Runtime 13)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Mission: Relevance Scorer & Top 0.1% Selection Engine. Evaluates candidates, assigns relevance
 * scores (0-100), and injects only Top 0.1% (Top 20) items to eliminate token clutter & prompt degradation.
 */

import { CandidateContextItem } from './context-retrieval-runtime';

export interface RankedContextItem {
  sourceId: string;
  sourceType: string;
  documentTitle: string;
  snippet: string;
  relevanceScore: number;
}

export class ContextRankingRuntime {
  private static instance: ContextRankingRuntime;

  private constructor() {}

  public static getInstance(): ContextRankingRuntime {
    if (!ContextRankingRuntime.instance) {
      ContextRankingRuntime.instance = new ContextRankingRuntime();
    }
    return ContextRankingRuntime.instance;
  }

  public rankCandidates(candidates: CandidateContextItem[], objective: string): RankedContextItem[] {
    const lower = objective.toLowerCase();

    const ranked: RankedContextItem[] = candidates.map(c => {
      let score = 50;
      if (c.sourceType === 'MEETING_MINUTES' && c.snippet.includes('CEO')) score += 40;
      if (c.sourceType === 'SOP') score += 35;
      if (c.sourceType === 'CAMPAIGN_REPORT' && (lower.includes('marketing') || lower.includes('doanh thu'))) score += 30;
      if (c.sourceType === 'FINANCIAL_LEDGER') score += 25;
      if (c.sourceId.includes('conflict')) score -= 15; // lower priority for unapproved drafts

      return {
        sourceId: c.sourceId,
        sourceType: c.sourceType,
        documentTitle: c.documentTitle,
        snippet: c.snippet,
        relevanceScore: Math.min(score, 100),
      };
    });

    // Sort descending by relevance score & return top candidates (Top 0.1% rule)
    return ranked.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);
  }
}
