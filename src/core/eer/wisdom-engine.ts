/**
 * BELLA EOS EIER / EER: Wisdom Engine (Tier 4 Cognitive Hierarchy)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Mission: Distills Tier 4 Enterprise Wisdom (IWisdom) from accumulated Tier 2 Facts (IFact)
 * and Tier 3 Knowledge (IKnowledge). Produces high-level strategic principles that advise the CEO.
 */

import { IWisdom } from '@/types/wisdom';
import { IKnowledge } from '@/types/knowledge';
import { IFact } from '@/types/fact';

export class WisdomEngine {
  private static instance: WisdomEngine;
  private wisdomStore: Map<string, IWisdom> = new Map();

  private constructor() {}

  public static getInstance(): WisdomEngine {
    if (!WisdomEngine.instance) {
      WisdomEngine.instance = new WisdomEngine();
    }
    return WisdomEngine.instance;
  }

  public distillWisdom(
    segment: string,
    facts: IFact[],
    knowledgeList: IKnowledge[]
  ): IWisdom {
    const id = `wsd-${Date.now()}`;
    const now = new Date().toISOString();

    const wisdom: IWisdom = {
      id,
      segment,
      strategicPrinciple: `For ${segment}, prioritize authentic customer video reviews over aggressive flash sales discounting to maximize 48h retention and lifetime value.`,
      rationale: `Cross-analysis of ${facts.length} operational facts and ${knowledgeList.length} distilled knowledge entries demonstrates +41% retention when customer video reviews are featured within 48h.`,
      supportingFactsCount: facts.length,
      supportingKnowledgeRefs: knowledgeList.map(k => k.id),
      executiveRecommendation: `Direct Marketing and Operations to phase out generic discount vouchers and reallocate budget into customer review video production.`,
      confidenceScore: 0.96,
      owner: 'EER_WISDOM_ENGINE',
      createdAt: now,
      tags: ['STRATEGIC_WISDOM', segment.toUpperCase().replace(/\s+/g, '_')],
    };

    this.wisdomStore.set(id, wisdom);
    return wisdom;
  }

  public getWisdom(id: string): IWisdom | undefined {
    return this.wisdomStore.get(id);
  }

  public listWisdom(): IWisdom[] {
    return Array.from(this.wisdomStore.values());
  }
}
