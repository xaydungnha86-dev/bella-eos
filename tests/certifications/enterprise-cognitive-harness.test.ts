/**
 * BELLA EOS CERTIFICATION: Enterprise Cognitive Harness Runtime (ECH) Certification Suite
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Verifies Intent Classification, Context Ranking (Top 0.1%), Contradiction Detection,
 * Evidence Citations, Step-by-Step Reasoning Plans, Output Validation, and ICognitiveSession asset creation.
 */

import { IntentUnderstandingRuntime } from '@/core/ech/intent-understanding-runtime';
import { ContextRetrievalRuntime } from '@/core/ech/context-retrieval-runtime';
import { ContextRankingRuntime } from '@/core/ech/context-ranking-runtime';
import { ContradictionDetectionRuntime } from '@/core/ech/contradiction-detection-runtime';
import { MissingContextRuntime } from '@/core/ech/missing-context-runtime';
import { EvidenceCitationRuntime } from '@/core/ech/evidence-citation-runtime';
import { EnterpriseReasoningRuntime } from '@/core/ech/enterprise-reasoning-runtime';
import { OutputValidatorRuntime } from '@/core/ech/output-validator-runtime';
import { CognitivePipelineOrchestrator } from '@/core/ech/cognitive-pipeline-orchestrator';

describe('BELLA EOS v18.5 Enterprise Cognitive Harness Runtime (ECH) Certification', () => {

  it('1. Intent Understanding Runtime: should classify enterprise intent correctly', () => {
    const intent = IntentUnderstandingRuntime.getInstance().classifyIntent('Doanh thu tháng này giảm vì sao?');
    expect(intent).toBe('ROOT_CAUSE_ANALYSIS');
  });

  it('2. Context Retrieval & Top 0.1% Ranking: should retrieve & rank context candidates by relevance', () => {
    const candidates = ContextRetrievalRuntime.getInstance().retrieveCandidateItems('default-tenant', 'Lập kế hoạch marketing');
    const ranked = ContextRankingRuntime.getInstance().rankCandidates(candidates, 'Lập kế hoạch marketing');

    expect(candidates.length).toBeGreaterThan(0);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].relevanceScore).toBeGreaterThanOrEqual(ranked[ranked.length - 1].relevanceScore);
  });

  it('3. Contradiction & Missing Context Runtimes: should flag conflicting directives & missing parameters', () => {
    const candidates = ContextRetrievalRuntime.getInstance().retrieveCandidateItems('default-tenant', 'Lập kế hoạch marketing');
    const contradictions = ContradictionDetectionRuntime.getInstance().detectContradictions(candidates);
    const missing = MissingContextRuntime.getInstance().detectMissingParameters('Lập kế hoạch mở chi nhánh mới');

    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0]).toContain('CONFLICT DETECTED');
    expect(missing.length).toBeGreaterThan(0);
  });

  it('4. Reasoning Plan & Output Validator (Contracts 31 & 32): should build reasoning steps & auto-correct LLM responses', () => {
    const plan = EnterpriseReasoningRuntime.getInstance().buildReasoningPlan('STRATEGIC_PLANNING', 'Lập kế hoạch');
    expect(plan.steps.length).toBe(5);

    const valReport = OutputValidatorRuntime.getInstance().validateLlmOutput('session-1', 'Đề xuất chiến dịch giảm giá 40%', []);
    expect(valReport.isValid).toBe(false);
    expect(valReport.autoCorrectedOutput).toContain('giảm giá 30%');
  });

  it('5. Master Cognitive Pipeline (Contract 30: ICognitiveSession): complete closed-loop session execution', async () => {
    const session = await CognitivePipelineOrchestrator.getInstance().executeCognitiveSession('default-tenant', 'Doanh thu giảm, lập kế hoạch tối ưu Marketing');

    expect(session.sessionId).toMatch(/^cog-session-/);
    expect(session.intent).toBe('ROOT_CAUSE_ANALYSIS');
    expect(session.rankedContextItems.length).toBeGreaterThan(0);
    expect(session.evidenceCitations.length).toBeGreaterThan(0);
    expect(session.reasoningPlan.steps.length).toBe(5);
    expect(session.validationReport?.complianceScore).toBeGreaterThan(0);
  });
});
