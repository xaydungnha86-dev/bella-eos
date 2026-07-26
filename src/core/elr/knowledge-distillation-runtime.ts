/**
 * BELLA EOS ELR: Knowledge Distillation Runtime (Runtime 6)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Autonomous Knowledge Distillation Engine. Automatically synthesizes validated
 * enterprise evidence into actionable Lessons Learned, Success Patterns, Failure Patterns,
 * Risks, Best Practices, Recommendations, and Anti-Patterns.
 */

import { IEvidence } from '@/types/evidence';
import { IKnowledge, KnowledgeCategory } from '@/types/knowledge';
import { EnterpriseParserResult } from './enterprise-parser-runtime';
import { ExtractedMetricItem } from './information-extraction-runtime';

export class KnowledgeDistillationRuntime {
  private static instance: KnowledgeDistillationRuntime;
  private knowledgeStore: Map<string, IKnowledge> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeDistillationRuntime {
    if (!KnowledgeDistillationRuntime.instance) {
      KnowledgeDistillationRuntime.instance = new KnowledgeDistillationRuntime();
    }
    return KnowledgeDistillationRuntime.instance;
  }

  public distill(
    evidence: IEvidence,
    parsed: EnterpriseParserResult,
    metrics: ExtractedMetricItem[]
  ): IKnowledge[] {
    const distilled: IKnowledge[] = [];
    const now = new Date().toISOString();

    const rawText = typeof evidence.content === 'string'
      ? evidence.content
      : JSON.stringify(evidence.content);

    // Rule 1: High ROAS / High Performance Pattern
    const roasMetric = metrics.find(m => m.metricName === 'ROAS');
    if (roasMetric && roasMetric.numericValue >= 3.0) {
      const kId = `knw-pat-${Date.now()}-1`;
      const item: IKnowledge = {
        id: kId,
        category: 'SUCCESS_PATTERN',
        lesson: `High ROAS Pattern detected (${roasMetric.numericValue}x return)`,
        pattern: rawText.includes('video') ? 'Short Video Copy < 20s yields high conversion' : 'High ROI Campaign Pattern',
        recommendation: 'Scale budget allocation for this high-performing creative/channel mix by +20%',
        confidence: evidence.confidence,
        evidence_refs: [evidence.id],
        owner: 'ELR_KNOWLEDGE_DISTILLER',
        effective_date: now,
        status: 'VERIFIED',
        tags: ['ROAS', 'MARKETING', 'SCALING'],
      };
      distilled.push(item);
      this.knowledgeStore.set(kId, item);
    }

    // Rule 2: Risk / Incident Pattern
    const riskObject = parsed.parsedObjects.find(o => o.type === 'RISK');
    if (riskObject || rawText.toLowerCase().includes('sự cố') || rawText.toLowerCase().includes('incident')) {
      const kId = `knw-rsk-${Date.now()}-2`;
      const item: IKnowledge = {
        id: kId,
        category: 'RISK_CATALOG',
        lesson: 'Operational risk identified from evidence report',
        risk: riskObject?.name || 'Unhedged Operational Disruption Risk',
        recommendation: 'Update SOP safeguard rules to enforce mandatory approval prior to deployment',
        confidence: evidence.confidence,
        evidence_refs: [evidence.id],
        owner: 'ELR_KNOWLEDGE_DISTILLER',
        effective_date: now,
        status: 'VERIFIED',
        tags: ['RISK', 'SOP_SAFEGUARD'],
      };
      distilled.push(item);
      this.knowledgeStore.set(kId, item);
    }

    // Rule 3: General Best Practice / Lesson Learned
    if (distilled.length === 0) {
      const kId = `knw-gen-${Date.now()}-0`;
      const item: IKnowledge = {
        id: kId,
        category: 'LESSON_LEARNED',
        lesson: `Extracted operational insight from ${evidence.source} (${evidence.type})`,
        recommendation: 'Maintain standard execution alignment and track 30-day performance delta',
        confidence: evidence.confidence,
        evidence_refs: [evidence.id],
        owner: 'ELR_KNOWLEDGE_DISTILLER',
        effective_date: now,
        status: 'VERIFIED',
        tags: ['GENERAL', evidence.type],
      };
      distilled.push(item);
      this.knowledgeStore.set(kId, item);
    }

    return distilled;
  }

  public getKnowledge(id: string): IKnowledge | undefined {
    return this.knowledgeStore.get(id);
  }

  public listKnowledge(): IKnowledge[] {
    return Array.from(this.knowledgeStore.values());
  }
}
