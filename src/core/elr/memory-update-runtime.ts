/**
 * BELLA EOS ELR: Memory Update Runtime (Runtime 8)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Enterprise Brain Memory Maintenance Engine. Ensures memory remains clean by storing ONLY
 * distilled structured tuples (Campaign, Outcome, Decision, Lesson, Confidence, Evidence Ref)
 * rather than raw, noisy document reports.
 */

import { MemoryRuntime } from '../brain/runtimes/memory-runtime';
import { IKnowledge } from '@/types/knowledge';
import { IExperience } from '@/types/experience';
import { IEvidence } from '@/types/evidence';

export interface DistilledMemoryPayload {
  tenantId: string;
  campaign?: string;
  outcome?: string;
  decision?: string;
  lesson: string;
  confidence: number;
  evidenceId: string;
  category: 'STRATEGIC' | 'OPERATIONAL' | 'FINANCIAL' | 'MARKETING';
}

export class MemoryUpdateRuntime {
  private static instance: MemoryUpdateRuntime;

  private constructor() {}

  public static getInstance(): MemoryUpdateRuntime {
    if (!MemoryUpdateRuntime.instance) {
      MemoryUpdateRuntime.instance = new MemoryUpdateRuntime();
    }
    return MemoryUpdateRuntime.instance;
  }

  public async commitDistilledMemory(payload: DistilledMemoryPayload): Promise<string> {
    const memoryRuntime = MemoryRuntime.getInstance();
    
    // Form compact, clean structured memory content
    const memoryContent = JSON.stringify({
      campaign: payload.campaign || 'GLOBAL',
      outcome: payload.outcome || 'OBSERVED',
      decision: payload.decision || 'NONE',
      lesson: payload.lesson,
      confidence: payload.confidence,
      evidenceRef: payload.evidenceId,
    });

    const memoryId = await memoryRuntime.store({
      tenantId: payload.tenantId,
      category: 'BUSINESS',
      content: memoryContent,
      tags: ['ELR_DISTILLED', payload.category],
      importanceScore: Math.round(payload.confidence * 10),
      metadata: {
        evidenceId: payload.evidenceId,
        confidence: payload.confidence,
        committedBy: 'ELR_MEMORY_UPDATE_RUNTIME',
      },
    });

    return memoryId;
  }

  public async commitKnowledgeToBrain(tenantId: string, knowledgeItems: IKnowledge[]): Promise<string[]> {
    const memoryIds: string[] = [];
    for (const item of knowledgeItems) {
      const memId = await this.commitDistilledMemory({
        tenantId,
        lesson: item.lesson,
        confidence: item.confidence,
        evidenceId: item.evidence_refs[0] || 'N/A',
        category: 'OPERATIONAL',
      });
      memoryIds.push(memId);
    }
    return memoryIds;
  }
}
