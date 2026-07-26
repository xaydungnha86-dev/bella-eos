/**
 * BELLA EOS EIER / EER: Continuous Enterprise Evolution Runtime (Runtime 10 & 15-Runtime Master Loop)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Mission: Autonomous 4-Tier Enterprise Evolution Loop:
 * Tier 1: Raw Evidence Ingestion & Parsing
 * Tier 2: Fact Extraction (IFact) & Validation (<80% Human Gate)
 * Tier 3: Knowledge Distillation (IKnowledge) & Experience Feedback (IExperience)
 * Tier 4: Pattern Discovery, Playbook Generation, SOP Evolution, Benchmarking,
 *         Organizational Diffusion & Strategic Wisdom Distillation (IWisdom).
 * 
 * The enterprise evolution loop never stops.
 */

import { RawInputPayload, EvidenceIngestionRuntime } from '../elr/evidence-ingestion-runtime';
import { EnterpriseParserRuntime } from '../elr/enterprise-parser-runtime';
import { InformationExtractionRuntime } from '../elr/information-extraction-runtime';
import { EntityResolutionRuntime } from '../elr/entity-resolution-runtime';
import { EvidenceValidationRuntime, EvidenceValidationResult } from '../elr/evidence-validation-runtime';
import { KnowledgeDistillationRuntime } from '../elr/knowledge-distillation-runtime';
import { ExperienceLearningRuntime } from '../elr/experience-learning-runtime';
import { MemoryUpdateRuntime } from '../elr/memory-update-runtime';
import { ConfidenceEngine } from '../elr/confidence-engine';
import { PatternDiscoveryRuntime, DiscoveredPattern } from './pattern-discovery-runtime';
import { PlaybookRuntime } from './playbook-runtime';
import { SOPEvolutionRuntime, SOPEvolutionProposal } from './sop-evolution-runtime';
import { BenchmarkRuntime, EnterpriseBenchmarkComparison } from './benchmark-runtime';
import { OrganizationalLearningRuntime, OrganizationalDiffusionRecord } from './organizational-learning-runtime';
import { WisdomEngine } from './wisdom-engine';
import { IFact } from '@/types/fact';
import { IKnowledge } from '@/types/knowledge';
import { IWisdom } from '@/types/wisdom';

export interface MasterEvolutionCycleResult {
  evolutionId: string;
  evidenceId: string;
  facts: IFact[];
  validation: EvidenceValidationResult;
  knowledgeItems: IKnowledge[];
  patterns: DiscoveredPattern[];
  sopProposals: SOPEvolutionProposal[];
  benchmark?: EnterpriseBenchmarkComparison;
  diffusions: OrganizationalDiffusionRecord[];
  wisdom?: IWisdom;
  memoryIds: string[];
  status: 'COMPLETED' | 'PENDING_HUMAN_APPROVAL' | 'FAILED';
}

export class ContinuousImprovementRuntime {
  private static instance: ContinuousImprovementRuntime;

  private constructor() {}

  public static getInstance(): ContinuousImprovementRuntime {
    if (!ContinuousImprovementRuntime.instance) {
      ContinuousImprovementRuntime.instance = new ContinuousImprovementRuntime();
    }
    return ContinuousImprovementRuntime.instance;
  }

  public async executeCycle(input: RawInputPayload): Promise<MasterEvolutionCycleResult> {
    const ingestion = EvidenceIngestionRuntime.getInstance();
    const parser = EnterpriseParserRuntime.getInstance();
    const extractor = InformationExtractionRuntime.getInstance();
    const entityResolver = EntityResolutionRuntime.getInstance();
    const validator = EvidenceValidationRuntime.getInstance();
    const distiller = KnowledgeDistillationRuntime.getInstance();
    const memoryUpdater = MemoryUpdateRuntime.getInstance();
    const confidenceEngine = ConfidenceEngine.getInstance();

    // Evolution Runtimes 11-15 & Wisdom
    const patternDiscovery = PatternDiscoveryRuntime.getInstance();
    const playbookRuntime = PlaybookRuntime.getInstance();
    const sopEvolution = SOPEvolutionRuntime.getInstance();
    const benchmarker = BenchmarkRuntime.getInstance();
    const orgLearning = OrganizationalLearningRuntime.getInstance();
    const wisdomEngine = WisdomEngine.getInstance();

    // Tier 1: Ingestion & Parsing
    const evidence = ingestion.ingest(input);
    const parsed = parser.parse(evidence);

    // Tier 2: Fact Extraction (IFact)
    const metrics = extractor.extractMetrics(evidence, parsed);
    entityResolver.resolveEntities(evidence);

    const facts: IFact[] = metrics.map((m, idx) => ({
      id: `fact-${evidence.id}-${idx}`,
      evidenceId: evidence.id,
      metricName: m.metricName,
      numericValue: m.numericValue,
      unit: m.unit || 'VND',
      verifiedBy: 'InformationExtractionRuntime',
      confidence: m.confidence,
      timestamp: new Date().toISOString(),
    }));

    // Tier 2 Validation Gate (<80% Human Gate)
    const validation = await validator.validate(evidence, metrics);
    if (validation.requiresHumanApproval) {
      return {
        evolutionId: `evo-pending-${evidence.id}`,
        evidenceId: evidence.id,
        facts,
        validation,
        knowledgeItems: [],
        patterns: [],
        sopProposals: [],
        diffusions: [],
        memoryIds: [],
        status: 'PENDING_HUMAN_APPROVAL',
      };
    }

    // Tier 3: Knowledge Distillation & Confidence Assessment
    const knowledgeItems = distiller.distill(evidence, parsed, metrics);
    for (const k of knowledgeItems) {
      confidenceEngine.assessConfidence(k.id, 1, k.confidence, k.owner);
    }

    // Tier 4: Evolution (Patterns, Playbooks, SOPs, Benchmarks, Organizational Diffusion, Wisdom)
    const patterns = patternDiscovery.discoverPatterns();
    const revMetric = metrics.find(m => m.metricName === 'Revenue');
    let benchmark: EnterpriseBenchmarkComparison | undefined;

    if (revMetric && revMetric.numericValue > 0) {
      benchmark = benchmarker.runYoYBenchmark('Revenue', revMetric.numericValue, 850_000_000, 900_000_000);
      playbookRuntime.evaluatePlaybooks('ROAS', 4.5);
    }

    const sopProposal = await sopEvolution.observeAndEvolve({
      operationName: 'High Value Retargeting Campaign Launch',
      department: input.department || 'Marketing',
      actionSequence: ['Target Audience Filter', 'Creative Selection', 'Budget Approval', 'Dispatch'],
      totalObservationsCount: 100,
      identicalCount: 98,
    });

    const sopProposals = sopProposal ? [sopProposal] : [];

    // Cross-departmental organizational learning diffusion
    const diffusions: OrganizationalDiffusionRecord[] = [];
    for (const k of knowledgeItems) {
      const diff = orgLearning.diffuseKnowledge(k, input.department || 'Marketing');
      diffusions.push(diff);
    }

    // Strategic Wisdom Distillation
    const wisdom = wisdomEngine.distillWisdom('High-End Spa Segment', facts, knowledgeItems);

    // Memory Update
    const memoryIds = await memoryUpdater.commitKnowledgeToBrain(input.tenantId, knowledgeItems);

    evidence.status = 'COMMITTED_TO_BRAIN';

    return {
      evolutionId: `evo-${Date.now()}`,
      evidenceId: evidence.id,
      facts,
      validation,
      knowledgeItems,
      patterns,
      sopProposals,
      benchmark,
      diffusions,
      wisdom,
      memoryIds,
      status: 'COMPLETED',
    };
  }
}
