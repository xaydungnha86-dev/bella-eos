/**
 * BELLA EOS CERTIFICATION: Enterprise Learning Runtime (ELR) Certification Suite
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Verifies full end-to-end 10-runtime ELR pipeline, contract compliance (Contracts 20-23),
 * validation gates (<80% human gate), entity resolution, and EWOS continuous learning loop.
 */

import { EvidenceIngestionRuntime } from '@/core/elr/evidence-ingestion-runtime';
import { EnterpriseParserRuntime } from '@/core/elr/enterprise-parser-runtime';
import { InformationExtractionRuntime } from '@/core/elr/information-extraction-runtime';
import { EntityResolutionRuntime } from '@/core/elr/entity-resolution-runtime';
import { EvidenceValidationRuntime } from '@/core/elr/evidence-validation-runtime';
import { KnowledgeDistillationRuntime } from '@/core/elr/knowledge-distillation-runtime';
import { ExperienceLearningRuntime } from '@/core/elr/experience-learning-runtime';
import { ConfidenceEngine } from '@/core/elr/confidence-engine';
import { ContinuousImprovementRuntime } from '@/core/elr/continuous-improvement-runtime';
import { EvidencePackRegistry } from '@/core/elr/evidence-pack-registry';
import { LearningDNAManager } from '@/core/assets/learning-dna';
import { ApprovalRuntime } from '@/core/human/approval-runtime';

describe('BELLA EOS v18.3 Enterprise Learning Runtime (ELR) Certification', () => {

  it('1. EvidenceIngestionRuntime: should ingest multi-modal raw enterprise input into Contract 20 (IEvidence)', () => {
    const ingestion = EvidenceIngestionRuntime.getInstance();
    const evidence = ingestion.ingest({
      type: 'MEETING_MINUTES',
      source: 'Executive Strategy Meeting Q3',
      content: 'Biên bản họp: Quyết định tăng ngân sách Facebook Ads. Doanh thu 980 triệu VND, ROAS 4.5. Phụ trách: Nguyễn Văn A.',
      tenantId: 'tenant-bella-spa',
      department: 'Marketing',
      createdBy: 'CEO_Bella',
    });

    expect(evidence.id).toMatch(/^evid-/);
    expect(evidence.type).toBe('MEETING_MINUTES');
    expect(evidence.status).toBe('INGESTED');
    expect(evidence.confidence).toBe(1.0);
  });

  it('2. EnterpriseParserRuntime & InformationExtractionRuntime: should extract Enterprise Objects & metrics', () => {
    const ingestion = EvidenceIngestionRuntime.getInstance();
    const parser = EnterpriseParserRuntime.getInstance();
    const extractor = InformationExtractionRuntime.getInstance();

    const evidence = ingestion.ingest({
      type: 'CAMPAIGN_REPORT',
      source: 'Bella Summer 2026 Report',
      content: 'Chiến dịch Bella Summer: Doanh thu 980 triệu VND, Chi phí 450 triệu, ROAS 4.5x, Bookings 350.',
      tenantId: 'tenant-bella-spa',
    });

    const parsed = parser.parse(evidence);
    expect(parsed.parsedObjects.length).toBeGreaterThan(0);

    const metrics = extractor.extractMetrics(evidence, parsed);
    expect(metrics.find(m => m.metricName === 'Revenue')?.numericValue).toBe(980_000_000);
    expect(metrics.find(m => m.metricName === 'ROAS')?.numericValue).toBe(4.5);
  });

  it('3. EntityResolutionRuntime: should resolve raw aliases to canonical enterprise entities', () => {
    const resolver = EntityResolutionRuntime.getInstance();
    const ingestion = EvidenceIngestionRuntime.getInstance();

    const evidence = ingestion.ingest({
      type: 'CAMPAIGN_REPORT',
      source: 'Spa Q1 FB Ads',
      content: 'Chiến dịch Bella Summer tại Spa Q1 trên kênh Facebook.',
      tenantId: 'tenant-bella-spa',
    });

    const result = resolver.resolveEntities(evidence);
    expect(result.resolvedMappings.some(m => m.canonicalId === 'campaign-125')).toBe(true);
    expect(result.resolvedMappings.some(m => m.canonicalId === 'branch-3')).toBe(true);
    expect(result.resolvedMappings.some(m => m.canonicalId === 'channel-mkt-fb')).toBe(true);
  });

  it('4. EvidenceValidationRuntime: should validate against ERP and route <80% confidence to Human Gate', async () => {
    const validator = EvidenceValidationRuntime.getInstance();
    const ingestion = EvidenceIngestionRuntime.getInstance();
    const extractor = InformationExtractionRuntime.getInstance();

    // High confidence case (Meeting 980M vs ERP 978M -> ~99% match)
    const evidenceHigh = ingestion.ingest({
      type: 'ERP_EXPORT',
      source: 'ERP Reconciliation',
      content: 'Doanh thu 980 triệu VND',
      tenantId: 'tenant-bella-spa',
    });
    const metricsHigh = extractor.extractMetrics(evidenceHigh);
    const valHigh = await validator.validate(evidenceHigh, metricsHigh);
    expect(valHigh.isValidated).toBe(true);
    expect(valHigh.requiresHumanApproval).toBe(false);

    // Low confidence case (Reported Revenue 500M vs ERP Ground Truth 978M -> ~51% match < 80%)
    validator.setGroundTruthMetric('Revenue', 978_000_000);
    const evidenceLow = ingestion.ingest({
      type: 'EXCEL_KPI',
      source: 'Unverified Audit Report',
      content: 'Doanh thu 500 triệu VND',
      tenantId: 'tenant-bella-spa',
    });
    const metricsLow = extractor.extractMetrics(evidenceLow);
    const valLow = await validator.validate(evidenceLow, metricsLow);
    expect(valLow.isValidated).toBe(false);
    expect(valLow.requiresHumanApproval).toBe(true);
    expect(valLow.humanApprovalRequestId).toBeDefined();
  });

  it('5. KnowledgeDistillationRuntime & ConfidenceEngine: should distill verified knowledge into Contract 21', () => {
    const distiller = KnowledgeDistillationRuntime.getInstance();
    const confidenceEngine = ConfidenceEngine.getInstance();
    const ingestion = EvidenceIngestionRuntime.getInstance();

    const evidence = ingestion.ingest({
      type: 'CAMPAIGN_REPORT',
      source: 'Video Marketing Report',
      content: 'Short video ad campaign under 20s yielded ROAS 4.5.',
      tenantId: 'tenant-bella-spa',
    });

    const knowledge = distiller.distill(evidence, { evidenceId: evidence.id, parsedObjects: [], extractedMetrics: {} }, [
      { metricName: 'ROAS', rawTextValue: '4.5', numericValue: 4.5, confidence: 0.95 }
    ]);

    expect(knowledge.length).toBeGreaterThan(0);
    expect(knowledge[0].category).toBe('SUCCESS_PATTERN');

    const confidence = confidenceEngine.assessConfidence(knowledge[0].id, 29, 0.95);
    expect(confidence.isTrustworthy).toBe(true);
    expect(confidence.confidenceScore).toBeGreaterThanOrEqual(0.96);
  });

  it('6. ExperienceLearningRuntime: should calculate decision outcome score over 30 days into Contract 22', () => {
    const expRuntime = ExperienceLearningRuntime.getInstance();
    
    expRuntime.registerDecision({
      decisionId: 'dec-fb-budget-boost',
      description: 'Increase Facebook Ads Budget by +50%',
      initiativeName: 'Bella Summer Scaling',
      expectedMetric: 'Revenue',
      expectedValue: 1_000_000_000,
      timelineDays: 30,
    });

    // 30-day post-execution result: Actual Revenue 1.18 Billion (+18% over target)
    const experience = expRuntime.evaluateExperience('dec-fb-budget-boost', 1_180_000_000);
    expect(experience.success).toBe(true);
    expect(experience.score).toBeGreaterThan(0.90);
    expect(experience.delta.percentageChange).toBe(18);
  });

  it('7. EvidencePackRegistry: should manage standard Evidence Packs for 8 domain areas', () => {
    const registry = EvidencePackRegistry.getInstance();
    const packs = registry.listPacks();
    expect(packs.length).toBe(8);

    const meetingPack = registry.getPackForEvidenceType('MEETING_MINUTES');
    expect(meetingPack?.packId).toBe('pack-meeting');
  });

  it('8. ContinuousImprovementRuntime: should execute full closed-loop cycle', async () => {
    const loop = ContinuousImprovementRuntime.getInstance();
    const result = await loop.executeCycle({
      type: 'MEETING_MINUTES',
      source: 'Weekly Management Meeting',
      content: 'Doanh thu 980 triệu VND, ROAS 4.5. Quyết định tăng ngân sách video.',
      tenantId: 'tenant-bella-spa',
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.knowledgeItems.length).toBeGreaterThan(0);
    expect(result.memoryIds.length).toBeGreaterThan(0);
  });

  it('9. EWOS Integration: should auto-update Learning DNA Pack on completed human approval', async () => {
    const approvalRuntime = ApprovalRuntime.getInstance();
    const dnaManager = LearningDNAManager.getInstance();

    const req = await approvalRuntime.requestApproval({
      tenantId: 'default-tenant',
      title: 'Design Q3 Banner Creative',
      description: 'Senior Creative Designer task',
      proposedAction: 'Complete Q3 Banner Design',
      aiConfidenceScore: 0.95,
      riskLevel: 'LOW',
      payload: { employeeId: 'nguyen_van_a' },
      requiredRole: 'Senior Creative Designer',
    });

    const approved = await approvalRuntime.approve(req.requestId, 'CEO_Bella', 'Banner design exceeds SOP quality bar');
    expect(approved).toBe(true);

    const dna = dnaManager.getOrCreateDNA('default-tenant');
    expect(dna.contentPayload.lessons.some(l => l.includes('Design Q3 Banner Creative'))).toBe(true);
  });
});
