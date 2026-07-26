/**
 * BELLA EOS ECH: Cognitive Pipeline Orchestrator
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME (ECH / ECR)
 * 
 * Mission: Master Orchestrator for the entire Enterprise Cognitive Flywheel:
 * User Objective ➔ Intent Understanding ➔ Context Retrieval ➔ Top 0.1% Context Ranking ➔
 * Contradiction Check ➔ Missing Context Check ➔ Evidence Citation ➔ Reasoning Plan ➔
 * EAH Prompt Composer ➔ LLM Execution ➔ Output Validator ➔ Persistent ICognitiveSession Asset Store.
 */

import { ICognitiveSession } from '@/types/cognitive-session';
import { EnterprisePromptComposer } from '../eah/enterprise-prompt-composer';

import { IntentUnderstandingRuntime } from './intent-understanding-runtime';
import { ContextRetrievalRuntime } from './context-retrieval-runtime';
import { ContextRankingRuntime } from './context-ranking-runtime';
import { ContradictionDetectionRuntime } from './contradiction-detection-runtime';
import { MissingContextRuntime } from './missing-context-runtime';
import { EvidenceCitationRuntime } from './evidence-citation-runtime';
import { EnterpriseReasoningRuntime } from './enterprise-reasoning-runtime';
import { OutputValidatorRuntime } from './output-validator-runtime';

export class CognitivePipelineOrchestrator {
  private static instance: CognitivePipelineOrchestrator;
  private sessionStore: Map<string, ICognitiveSession> = new Map();

  private constructor() {}

  public static getInstance(): CognitivePipelineOrchestrator {
    if (!CognitivePipelineOrchestrator.instance) {
      CognitivePipelineOrchestrator.instance = new CognitivePipelineOrchestrator();
    }
    return CognitivePipelineOrchestrator.instance;
  }

  public async executeCognitiveSession(tenantId: string, userObjective: string): Promise<ICognitiveSession> {
    const sessionId = `cog-session-${Date.now()}`;

    // 1. Intent Understanding
    const intent = IntentUnderstandingRuntime.getInstance().classifyIntent(userObjective);

    // 2. Context Candidate Retrieval
    const candidates = ContextRetrievalRuntime.getInstance().retrieveCandidateItems(tenantId, userObjective);

    // 3. Top 0.1% Context Ranking
    const rankedItems = ContextRankingRuntime.getInstance().rankCandidates(candidates, userObjective);

    // 4. Contradiction Detection
    const contradictions = ContradictionDetectionRuntime.getInstance().detectContradictions(candidates);

    // 5. Missing Context Check
    const missing = MissingContextRuntime.getInstance().detectMissingParameters(userObjective);

    // 6. Evidence Citation Binding
    const citations = EvidenceCitationRuntime.getInstance().generateCitations(rankedItems);

    // 7. Reasoning Plan Generation
    const reasoningPlan = EnterpriseReasoningRuntime.getInstance().buildReasoningPlan(intent, userObjective);

    // 8. EAH Prompt Composer Enclosure
    const harnessPackage = await EnterprisePromptComposer.getInstance().composeHarnessPackage(tenantId, userObjective);

    // Simulated LLM Execution Payload
    const simulatedRawLlmOutput = `[KẾ HOẠCH MARKETING Q3 2026 - PHÊ DUYỆT BỞI BELLA ECH]
Mục tiêu doanh thu: 3.800.000.000 VND
Ngân sách đề xuất: 500 triệu VND (Đã xác minh theo Biên bản 20/07).
Kênh ưu tiên: Retargeting Video UGC và Review Khách Hàng Thật (Theo Bài Học #123).
Chính sách: Khuyến mãi áp dụng tối đa giảm giá 30% dịch vụ.`;

    // 9. Post-LLM Output Validation
    const validationReport = OutputValidatorRuntime.getInstance().validateLlmOutput(
      sessionId,
      simulatedRawLlmOutput,
      harnessPackage.enforcedBusinessRules
    );

    // 10. Persistent ICognitiveSession Asset
    const session: ICognitiveSession = {
      sessionId,
      tenantId,
      userObjective,
      intent,
      rankedContextItems: rankedItems,
      contradictionsDetected: contradictions,
      missingParameters: missing,
      evidenceCitations: citations,
      reasoningPlan,
      harnessPackage,
      rawLlmOutput: validationReport.autoCorrectedOutput || simulatedRawLlmOutput,
      validationReport,
      createdAt: new Date().toISOString(),
    };

    this.sessionStore.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): ICognitiveSession | undefined {
    return this.sessionStore.get(sessionId);
  }
}
