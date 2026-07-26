/**
 * BELLA EOS PLATFORM CONTRACT: Enterprise AI Harness Package Contract (IEAHPackage v1.0)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME (EAH)
 * 
 * Contract 27: Composite Enterprise AI Harness Package.
 * Encloses raw user input inside complete enterprise context, historical memory, business rules,
 * skills, and past decisions before passing to any LLM (GPT, Claude, Gemini, Hermes).
 */

import { IBusinessRule } from './business-rule';

export interface IEAHPackage {
  harnessId: string;
  tenantId: string;
  userObjective: string;
  businessContext: {
    industry: string;
    growthStage: string;
    quarterlyGoals: string[];
    annualGoals: string[];
    brandIdentity: string;
    targetAudience: string;
  };
  historicalMemory: {
    sixMonthRevenueVnd: number;
    avgRoas: number;
    avgBookings: number;
    activeCampaignsCount: number;
  };
  lessonsLearned: string[];
  selectedSkills: string[];
  enforcedBusinessRules: IBusinessRule[];
  knowledgeAndSOPs: string[];
  pastCeoDecisions: string[];
  experienceDelta: {
    predictionAccuracyScore: number;
    topSuccessDriver: string;
  };
  confidenceAssessment: {
    verifiedFactsCount: number;
    unverifiedAssumptionsCount: number;
  };
  composedSystemPrompt: string;
  composedUserPrompt: string;
  createdAt: string;
}
