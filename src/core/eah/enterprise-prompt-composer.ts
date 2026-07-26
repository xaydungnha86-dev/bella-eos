/**
 * BELLA EOS EAH: Enterprise Prompt Composer (Runtime 10)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Mission: Master Harness Composer. Intercepts raw user requests and wraps them inside all 9 EAH layers:
 * Business Context + Historical Memory + Lessons + Skills + Business Rules + Knowledge/SOPs +
 * Past Decisions + Experience Delta + Confidence Assessment.
 * 
 * Zero raw user prompts are ever passed directly to LLMs.
 */

import { IPromptComposer, ComposedPromptPayload } from '@/types/prompt-composer';
import { IEAHPackage } from '@/types/eah-package';

import { BusinessContextRuntime } from './business-context-runtime';
import { EnterpriseMemoryHarness } from './enterprise-memory-harness';
import { LessonsLearnedHarness } from './lessons-learned-harness';
import { SkillHarnessRuntime } from './skill-harness-runtime';
import { BusinessRuleRuntime } from './business-rule-runtime';
import { KnowledgeHarnessRuntime } from './knowledge-harness-runtime';
import { HistoricalDecisionRuntime } from './historical-decision-runtime';
import { ExperienceHarnessRuntime } from './experience-harness-runtime';
import { ConfidenceHarnessRuntime } from './confidence-harness-runtime';

export class EnterprisePromptComposer implements IPromptComposer {
  private static instance: EnterprisePromptComposer;

  private constructor() {}

  public static getInstance(): EnterprisePromptComposer {
    if (!EnterprisePromptComposer.instance) {
      EnterprisePromptComposer.instance = new EnterprisePromptComposer();
    }
    return EnterprisePromptComposer.instance;
  }

  public async composeHarnessPackage(tenantId: string, rawObjective: string): Promise<IEAHPackage> {
    const businessContext = BusinessContextRuntime.getInstance().getContext(tenantId);
    const memory = EnterpriseMemoryHarness.getInstance().getHistoricalMemory(tenantId);
    const lessons = LessonsLearnedHarness.getInstance().getLessons(tenantId);
    const skills = SkillHarnessRuntime.getInstance().selectSkills(rawObjective);
    const rules = BusinessRuleRuntime.getInstance().getActiveRules();
    const knowledge = KnowledgeHarnessRuntime.getInstance().getKnowledgeAndSOPs(tenantId);
    const pastDecisions = HistoricalDecisionRuntime.getInstance().getPastDecisions(tenantId);
    const experience = ExperienceHarnessRuntime.getInstance().getExperienceDelta(tenantId);
    const confidence = ConfidenceHarnessRuntime.getInstance().getConfidenceAssessment(tenantId);

    const systemPrompt = `[ENTERPRISE AI HARNESS v18.4 - ${businessContext.companyName}]
Industry: ${businessContext.industry} (Stage: ${businessContext.growthStage})
Brand Identity: ${businessContext.brandIdentity}
Target Audience: ${businessContext.targetAudience}

[HARD BUSINESS RULES & POLICIES - MANDATORY GOVERNANCE]
${rules.map(r => `- ${r.ruleName}: Constraint=${r.constraintType}, Cap=${r.thresholdValue}`).join('\n')}

[HISTORICAL OPERATIONAL MEMORY (Past 6 Months)]
- Revenue: ${memory.sixMonthRevenueVnd.toLocaleString()} VND
- Avg ROAS: ${memory.avgRoas}x
- Avg Monthly Bookings: ${memory.avgBookings}

[ACTIONABLE LESSONS LEARNED]
${lessons.map(l => `- ${l}`).join('\n')}

[HISTORICAL CEO DIRECTIVES]
${pastDecisions.map(d => `- ${d}`).join('\n')}

[ACTIVE SKILLS & KNOWLEDGE SOPS]
Selected Skills: ${skills.join(', ')}
${knowledge.slice(0, 5).join('\n')}

CRITICAL EXECUTION RULE: You are surrounded by the Bella Enterprise AI Harness. You MUST NOT propose actions that violate Hard Business Rules or contradict Historical CEO Directives without explicit rationale. Output canonical structured enterprise format.`;

    const userPrompt = `[ENCLOSED EXECUTIVE OBJECTIVE]
User Directive: "${rawObjective}"
Target Quarterly Revenue Goal: ${businessContext.quarterlyGoalVnd.toLocaleString()} VND
Confidence Status: Verified Ground Truth (${confidence.verifiedFactsCount} facts).`;

    const harnessPackage: IEAHPackage = {
      harnessId: `eah-pkg-${Date.now()}`,
      tenantId,
      userObjective: rawObjective,
      businessContext: {
        industry: businessContext.industry,
        growthStage: businessContext.growthStage,
        quarterlyGoals: [`Reach ${businessContext.quarterlyGoalVnd.toLocaleString()} VND`],
        annualGoals: [`Reach ${businessContext.annualGoalVnd.toLocaleString()} VND`],
        brandIdentity: businessContext.brandIdentity,
        targetAudience: businessContext.targetAudience,
      },
      historicalMemory: {
        sixMonthRevenueVnd: memory.sixMonthRevenueVnd,
        avgRoas: memory.avgRoas,
        avgBookings: memory.avgBookings,
        activeCampaignsCount: memory.activeCampaignsCount,
      },
      lessonsLearned: lessons,
      selectedSkills: skills,
      enforcedBusinessRules: rules,
      knowledgeAndSOPs: knowledge,
      pastCeoDecisions: pastDecisions,
      experienceDelta: experience,
      confidenceAssessment: confidence,
      composedSystemPrompt: systemPrompt,
      composedUserPrompt: userPrompt,
      createdAt: new Date().toISOString(),
    };

    return harnessPackage;
  }

  public formatPromptPayload(harnessPackage: IEAHPackage): ComposedPromptPayload {
    return {
      systemPrompt: harnessPackage.composedSystemPrompt,
      userPrompt: harnessPackage.composedUserPrompt,
      enclosedContextSummary: {
        businessContextInjected: true,
        historyInjected: true,
        lessonsCount: harnessPackage.lessonsLearned.length,
        rulesCount: harnessPackage.enforcedBusinessRules.length,
        skillsCount: harnessPackage.selectedSkills.length,
      },
    };
  }
}
