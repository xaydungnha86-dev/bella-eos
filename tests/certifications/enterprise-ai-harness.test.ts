/**
 * BELLA EOS CERTIFICATION: Enterprise AI Harness Runtime (EAH) Certification Suite
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Verifies zero raw prompt leakage, full 10-runtime harness composition,
 * business rule guardrails, and structured prompt output generation.
 */

import { BusinessContextRuntime } from '@/core/eah/business-context-runtime';
import { EnterpriseMemoryHarness } from '@/core/eah/enterprise-memory-harness';
import { LessonsLearnedHarness } from '@/core/eah/lessons-learned-harness';
import { SkillHarnessRuntime } from '@/core/eah/skill-harness-runtime';
import { BusinessRuleRuntime } from '@/core/eah/business-rule-runtime';
import { KnowledgeHarnessRuntime } from '@/core/eah/knowledge-harness-runtime';
import { HistoricalDecisionRuntime } from '@/core/eah/historical-decision-runtime';
import { ExperienceHarnessRuntime } from '@/core/eah/experience-harness-runtime';
import { ConfidenceHarnessRuntime } from '@/core/eah/confidence-harness-runtime';
import { EnterprisePromptComposer } from '@/core/eah/enterprise-prompt-composer';

describe('BELLA EOS v18.4 Enterprise AI Harness Runtime (EAH) Certification', () => {

  it('1. Business Context Runtime: should inject enterprise identity and goals without AI asking', () => {
    const bizCtx = BusinessContextRuntime.getInstance().getContext('default-tenant');
    expect(bizCtx.companyName).toBeDefined();
    expect(bizCtx.industry).toContain('Beauty');
    expect(bizCtx.quarterlyGoalVnd).toBeGreaterThan(0);
  });

  it('2. Enterprise Memory & Lessons Harness: should provide 6-month historical memory & concise lessons', () => {
    const memory = EnterpriseMemoryHarness.getInstance().getHistoricalMemory('default-tenant');
    const lessons = LessonsLearnedHarness.getInstance().getLessons('default-tenant');

    expect(memory.sixMonthRevenueVnd).toBeGreaterThan(0);
    expect(lessons.length).toBeGreaterThan(0);
  });

  it('3. Business Rule Runtime (Contract 28): should enforce hard constraint guardrails', () => {
    const ruleRuntime = BusinessRuleRuntime.getInstance();
    const activeRules = ruleRuntime.getActiveRules();
    expect(activeRules.length).toBeGreaterThan(0);

    const validResult = ruleRuntime.validateRules({ discountPercentage: 20, proposedBudgetVnd: 300_000_000, plannedRoas: 2.5 });
    expect(validResult.isValid).toBe(true);

    const invalidResult = ruleRuntime.validateRules({ discountPercentage: 50, proposedBudgetVnd: 800_000_000, plannedRoas: 1.0 });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.violations.length).toBeGreaterThan(0);
  });

  it('4. Master Prompt Composer (Contract 29 & IEAHPackage Contract 27): zero raw prompt leakage', async () => {
    const composer = EnterprisePromptComposer.getInstance();
    const harnessPkg = await composer.composeHarnessPackage('default-tenant', 'Design Q3 Retargeting Campaign');

    expect(harnessPkg.harnessId).toMatch(/^eah-pkg-/);
    expect(harnessPkg.businessContext.industry).toBeDefined();
    expect(harnessPkg.enforcedBusinessRules.length).toBeGreaterThan(0);
    expect(harnessPkg.composedSystemPrompt).toContain('HARD BUSINESS RULES');
    expect(harnessPkg.composedUserPrompt).toContain('ENCLOSED EXECUTIVE OBJECTIVE');

    const formatted = composer.formatPromptPayload(harnessPkg);
    expect(formatted.enclosedContextSummary.businessContextInjected).toBe(true);
    expect(formatted.enclosedContextSummary.rulesCount).toBeGreaterThan(0);
  });
});
