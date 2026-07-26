/**
 * BELLA EOS CERTIFICATION: Enterprise Intelligence Evolution Runtime (EIER / EER) Certification Suite
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Verifies full end-to-end 15-runtime EIER pipeline, 4-tier cognitive hierarchy
 * (Evidence ➔ Facts ➔ Knowledge ➔ Wisdom), Contracts 24-26, and Organizational Learning Diffusion.
 */

import { EvidenceIngestionRuntime } from '@/core/elr/evidence-ingestion-runtime';
import { EnterpriseParserRuntime } from '@/core/elr/enterprise-parser-runtime';
import { InformationExtractionRuntime } from '@/core/elr/information-extraction-runtime';
import { EntityResolutionRuntime } from '@/core/elr/entity-resolution-runtime';
import { EvidenceValidationRuntime } from '@/core/elr/evidence-validation-runtime';
import { KnowledgeDistillationRuntime } from '@/core/elr/knowledge-distillation-runtime';
import { ExperienceLearningRuntime } from '@/core/elr/experience-learning-runtime';
import { PatternDiscoveryRuntime } from '@/core/eer/pattern-discovery-runtime';
import { PlaybookRuntime } from '@/core/eer/playbook-runtime';
import { SOPEvolutionRuntime } from '@/core/eer/sop-evolution-runtime';
import { BenchmarkRuntime } from '@/core/eer/benchmark-runtime';
import { OrganizationalLearningRuntime } from '@/core/eer/organizational-learning-runtime';
import { WisdomEngine } from '@/core/eer/wisdom-engine';
import { ContinuousImprovementRuntime } from '@/core/eer/continuous-improvement-runtime';

describe('BELLA EOS v18.3 Enterprise Intelligence Evolution Runtime (EIER / EER) Certification', () => {

  it('1. Tier 1 Raw Evidence & Tier 2 Fact Extraction (Contracts 20 & 24)', () => {
    const ingestion = EvidenceIngestionRuntime.getInstance();
    const parser = EnterpriseParserRuntime.getInstance();
    const extractor = InformationExtractionRuntime.getInstance();

    const evidence = ingestion.ingest({
      type: 'CAMPAIGN_REPORT',
      source: 'Q3 Media Campaign',
      content: 'Doanh thu 1.2 tỷ VND, ROAS 3.8, Booking 181.',
      tenantId: 'tenant-bella-spa',
      department: 'Marketing',
    });

    expect(evidence.id).toMatch(/^evid-/);
    
    const parsed = parser.parse(evidence);
    const metrics = extractor.extractMetrics(evidence, parsed);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics.find(m => m.metricName === 'Revenue')?.numericValue).toBe(1_200_000_000);
  });

  it('2. Pattern Discovery Runtime (Runtime 11): should discover multi-campaign patterns', () => {
    const patternDiscovery = PatternDiscoveryRuntime.getInstance();
    patternDiscovery.recordCampaignOutcome('cmp-q3-10', ['video_review_authentic', 'no_kol', 'lookalike_3pct'], true);
    patternDiscovery.recordCampaignOutcome('cmp-q3-11', ['video_review_authentic', 'no_kol', 'lookalike_3pct'], true);
    
    const patterns = patternDiscovery.discoverPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].successRate).toBeGreaterThanOrEqual(0.90);
  });

  it('3. Playbook Runtime (Runtime 12: Contract 26): should generate & evaluate playbooks', () => {
    const playbookRuntime = PlaybookRuntime.getInstance();
    const playbooks = playbookRuntime.listPlaybooks();
    expect(playbooks.length).toBeGreaterThan(0);

    const triggered = playbookRuntime.evaluatePlaybooks('ROAS', 1.2);
    expect(triggered.length).toBeGreaterThan(0);
    expect(triggered[0].triggerCondition.metric).toBe('ROAS');
  });

  it('4. SOP Evolution Runtime (Runtime 13): should propose SOP Skill Packaging upon 98/100 identical operations', async () => {
    const sopEvolution = SOPEvolutionRuntime.getInstance();
    const proposal = await sopEvolution.observeAndEvolve({
      operationName: 'High Value Retargeting Campaign Launch',
      department: 'Marketing',
      actionSequence: ['Filter Target', 'Select Creative', 'Approve Budget', 'Dispatch'],
      totalObservationsCount: 100,
      identicalCount: 98,
    });

    expect(proposal).not.toBeNull();
    expect(proposal?.status).toBe('PENDING_CEO_APPROVAL');
    expect(proposal?.proposedSkillPackName).toBeDefined();
  });

  it('5. Enterprise Benchmark Runtime (Runtime 14): should benchmark YoY growth', () => {
    const benchmarker = BenchmarkRuntime.getInstance();
    const comparison = benchmarker.runYoYBenchmark('Revenue', 1_200_000_000, 1_000_000_000, 1_100_000_000);

    expect(comparison.growthPercentage).toBe(20);
    expect(comparison.performanceGrade).toBe('OUTPERFORMING');
  });

  it('6. Organizational Learning Runtime (Runtime 15): should diffuse insights across departments', () => {
    const orgLearning = OrganizationalLearningRuntime.getInstance();
    const record = orgLearning.diffuseKnowledge({
      id: 'knw-mkt-1',
      category: 'SUCCESS_PATTERN',
      lesson: 'Authentic customer video reviews yield +41% retention in 48h',
      confidence: 0.96,
      evidence_refs: ['evid-1'],
      owner: 'ELR_KNOWLEDGE_DISTILLER',
      effective_date: new Date().toISOString(),
      status: 'VERIFIED',
      tags: ['RETENTION'],
    }, 'Marketing');

    expect(record.targetDepartments.includes('Sales')).toBe(true);
    expect(record.targetDepartments.includes('Customer Service')).toBe(true);
    expect(record.adaptedRecommendations['Sales']).toBeDefined();
  });

  it('7. Wisdom Engine (Contract 25): should distill Tier 4 Strategic Wisdom for CEO advisory', () => {
    const wisdomEngine = WisdomEngine.getInstance();
    const wisdom = wisdomEngine.distillWisdom('High-End Spa Segment', [], [
      {
        id: 'knw-1',
        category: 'SUCCESS_PATTERN',
        lesson: 'Authentic customer video reviews yield +41% retention',
        confidence: 0.96,
        evidence_refs: ['evid-1'],
        owner: 'ELR_KNOWLEDGE_DISTILLER',
        effective_date: new Date().toISOString(),
        status: 'VERIFIED',
        tags: ['RETENTION'],
      }
    ]);

    expect(wisdom.segment).toBe('High-End Spa Segment');
    expect(wisdom.strategicPrinciple).toContain('authentic customer video reviews');
    expect(wisdom.confidenceScore).toBe(0.96);
  });

  it('8. Master Continuous Evolution Loop: should execute end-to-end 15-runtime cycle', async () => {
    const masterLoop = ContinuousImprovementRuntime.getInstance();
    const result = await masterLoop.executeCycle({
      type: 'MONTHLY_REPORT',
      source: 'Enterprise EOM Review 2026',
      content: 'Doanh thu 1.2 tỷ VND, ROAS 3.8, Booking 181.',
      tenantId: 'tenant-bella-spa',
      department: 'Marketing',
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.facts.length).toBeGreaterThan(0);
    expect(result.knowledgeItems.length).toBeGreaterThan(0);
    expect(result.diffusions.length).toBeGreaterThan(0);
    expect(result.wisdom).toBeDefined();
  });
});
