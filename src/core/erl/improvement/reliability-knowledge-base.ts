/**
 * BELLA EOS ERL: Reliability Knowledge Base
 * Specification: ERL Improvement Engine
 * 
 * Mission: Store proven system-level optimizations and best practices.
 */

import { IReliabilityKnowledgeEntry } from '@/types/erl';

export class ReliabilityKnowledgeBase {
  private static instance: ReliabilityKnowledgeBase;
  private kbStore: Map<string, IReliabilityKnowledgeEntry> = new Map();

  private constructor() {
    this.seedKb();
  }

  public static getInstance(): ReliabilityKnowledgeBase {
    if (!ReliabilityKnowledgeBase.instance) {
      ReliabilityKnowledgeBase.instance = new ReliabilityKnowledgeBase();
    }
    return ReliabilityKnowledgeBase.instance;
  }

  public registerEntry(entry: IReliabilityKnowledgeEntry): void {
    this.kbStore.set(entry.kbId, entry);
  }

  public getEntry(kbId: string): IReliabilityKnowledgeEntry | undefined {
    return this.kbStore.get(kbId);
  }

  public listEntries(): IReliabilityKnowledgeEntry[] {
    return Array.from(this.kbStore.values());
  }

  public incrementPreventionCount(kbId: string): void {
    const entry = this.kbStore.get(kbId);
    if (entry) {
      entry.reworkPreventionsCount++;
      this.kbStore.set(kbId, entry);
    }
  }

  private seedKb(): void {
    this.registerEntry({
      kbId: 'kb-rec-rag',
      category: 'RECALL',
      patternDescription: 'Retriever Recall drops during product schema updates.',
      suggestedFix: 'Set RAG parameters to Chunk Size = 800, Overlap = 120, TopK = 8 and enable Hybrid Search.',
      reworkPreventionsCount: 5
    });

    this.registerEntry({
      kbId: 'kb-rec-citation',
      category: 'CITATION',
      patternDescription: 'Hallucination occurs when strict verification is not enforced in system prompts.',
      suggestedFix: 'Append constraint: "Always cite sources from Business Context". Set TopK = 8.',
      reworkPreventionsCount: 12
    });
  }
}
