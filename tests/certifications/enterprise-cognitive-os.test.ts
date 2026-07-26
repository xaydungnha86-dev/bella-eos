/**
 * BELLA EOS CERTIFICATION: Enterprise Cognitive Operating System (E-COS) Certification Suite
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Verifies Dual-Tier Governance, 5-Level Adaptive Cognitive Scheduler, Context Token Budget Manager,
 * Memory Lifecycle Management, Knowledge Quality Score (KQS) thresholding (>80), AI Cost Optimizer model routing,
 * KPI Feedback Loop, and 5-Point Executive Trust Cards.
 */

import { CognitiveScheduler } from '@/core/gov/cognitive-scheduler';
import { ContextBudgetManager } from '@/core/gov/context-budget-manager';
import { MemoryLifecycleManager } from '@/core/gov/memory-lifecycle';
import { KnowledgeQualityEngine } from '@/core/gov/knowledge-quality';
import { SkillMarketplaceRegistry } from '@/core/gov/skill-marketplace';
import { AICostOptimizer } from '@/core/gov/ai-cost-optimizer';
import { KpiFeedbackLoopEngine } from '@/core/gov/kpi-feedback-loop';
import { ExecutiveTrustLayer } from '@/core/gov/trust-layer';
import { CognitiveOSOrchestrator } from '@/core/gov/cognitive-os-orchestrator';

describe('BELLA EOS v18.8 Enterprise Cognitive OS (E-COS) Certification', () => {

  it('1. 5-Level Adaptive Cognitive Scheduler: should adapt thinking depth by objective complexity', () => {
    const infoLevel = CognitiveScheduler.getInstance().scheduleCognitivePipeline('Doanh thu hôm nay?');
    const execLevel = CognitiveScheduler.getInstance().scheduleCognitivePipeline('Có nên mở thêm chi nhánh Hà Nội?');

    expect(infoLevel.level).toBe('LEVEL_1_INFO');
    expect(infoLevel.requiresMultiAgentDebate).toBe(false);
    expect(execLevel.level).toBe('LEVEL_5_EXECUTIVE_DECISION');
    expect(execLevel.requiresMultiAgentDebate).toBe(true);
  });

  it('2. Context Token Budget Manager: should calculate token allocation spec for 64K token window', () => {
    const budget = ContextBudgetManager.getInstance().calculateBudgetSpec(64_000);

    expect(budget.maxTotalTokens).toBe(64_000);
    expect(budget.businessRulesTokens).toBe(6400);
    expect(budget.lessonsLearnedTokens).toBe(12800);
  });

  it('3. Memory Lifecycle & KQS Engine: should classify memory aging & filter unverified knowledge (<80)', () => {
    const hotTier = MemoryLifecycleManager.getInstance().classifyTier(15);
    const coldTier = MemoryLifecycleManager.getInstance().classifyTier(200);
    const passItem = KnowledgeQualityEngine.getInstance().evaluateItem('knw-1', 'UGC Strategy', 10, 9);
    const failItem = KnowledgeQualityEngine.getInstance().evaluateItem('knw-2', 'Flash Sale Strategy', 10, 3);

    expect(hotTier).toBe('HOT');
    expect(coldTier).toBe('COLD');
    expect(passItem.isEligibleForPrompt).toBe(true);
    expect(failItem.isEligibleForPrompt).toBe(false);
  });

  it('4. Skill Marketplace & AI Cost Optimizer: should manage skill versions & route models efficiently', () => {
    const skill = SkillMarketplaceRegistry.getInstance().registerSkill('Marketing_Skill', 'v4.0', 96);
    const routeL1 = AICostOptimizer.getInstance().routeModel('LEVEL_1_INFO');
    const routeL5 = AICostOptimizer.getInstance().routeModel('LEVEL_5_EXECUTIVE_DECISION');

    expect(skill.version).toBe('v4.0');
    expect(routeL1.selectedProvider).toBe('GEMINI_FLASH');
    expect(routeL5.selectedProvider).toBe('CLAUDE_SONNET');
  });

  it('5. Executive Trust Layer & KPI Feedback: should generate 5-point trust card & process CEO feedback', () => {
    const trustCard = ExecutiveTrustLayer.getInstance().generateTrustCard('Mở chi nhánh Hà Nội', 93, 5, 'LOW');
    const feedback = KpiFeedbackLoopEngine.getInstance().processFeedback('dec-1', 'APPROVED', 18);

    expect(trustCard.recommendation).toBeDefined();
    expect(trustCard.confidenceScorePercentage).toBe(93);
    expect(feedback.learningFeedbackSignal).toBe('POSITIVE_REINFORCEMENT');
  });

  it('6. Master Cognitive OS Orchestrator: should process objective through full 9-layer E-COS pipeline', async () => {
    const response = await CognitiveOSOrchestrator.getInstance().processObjective('default-tenant', 'Có nên mở thêm chi nhánh Hà Nội?');

    expect(response.schedule.level).toBe('LEVEL_5_EXECUTIVE_DECISION');
    expect(response.budgetSpec.maxTotalTokens).toBe(64_000);
    expect(response.modelRouting.selectedProvider).toBe('CLAUDE_SONNET');
    expect(response.trustCard.approvalRequired).toBe(true);
  });
});
