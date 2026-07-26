/**
 * BELLA EOS EIER / EER: Organizational Learning Runtime (Runtime 15)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Mission: Cross-Departmental Knowledge Diffusion Engine. Prevents departmental silos.
 * When Marketing learns a key insight (e.g. Short video reviews increase conversion +23%),
 * this runtime automatically diffuses the insight to Sales, Customer Service, and Operations,
 * updating departmental context packages company-wide.
 */

import { IKnowledge } from '@/types/knowledge';

export interface OrganizationalDiffusionRecord {
  knowledgeId: string;
  sourceDepartment: string;
  targetDepartments: string[];
  diffusedInsight: string;
  adaptedRecommendations: Record<string, string>; // Dept -> Action
  diffusedAt: string;
}

export class OrganizationalLearningRuntime {
  private static instance: OrganizationalLearningRuntime;
  private diffusionLog: Map<string, OrganizationalDiffusionRecord> = new Map();

  private constructor() {}

  public static getInstance(): OrganizationalLearningRuntime {
    if (!OrganizationalLearningRuntime.instance) {
      OrganizationalLearningRuntime.instance = new OrganizationalLearningRuntime();
    }
    return OrganizationalLearningRuntime.instance;
  }

  public diffuseKnowledge(
    knowledge: IKnowledge,
    sourceDepartment: string = 'Marketing'
  ): OrganizationalDiffusionRecord {
    const allDepartments = ['Sales', 'Customer Service', 'Operations', 'Finance', 'HR'];
    const targetDepartments = allDepartments.filter(d => d.toLowerCase() !== sourceDepartment.toLowerCase());

    const adaptedRecommendations: Record<string, string> = {
      'Sales': `Highlight [${knowledge.lesson}] in sales pitch scripts for incoming leads.`,
      'Customer Service': `Mention [${knowledge.lesson}] during 48h post-service check-in calls.`,
      'Operations': `Align branch capacity & scheduling with anticipated retention boost.`,
      'Finance': `Factor expected ROI improvement into Q3 cash flow forecasts.`,
      'HR': `Update onboarding training module with new best practice.`,
    };

    const record: OrganizationalDiffusionRecord = {
      knowledgeId: knowledge.id,
      sourceDepartment,
      targetDepartments,
      diffusedInsight: knowledge.lesson,
      adaptedRecommendations,
      diffusedAt: new Date().toISOString(),
    };

    const id = `diff-${knowledge.id}-${Date.now()}`;
    this.diffusionLog.set(id, record);
    return record;
  }

  public listDiffusions(): OrganizationalDiffusionRecord[] {
    return Array.from(this.diffusionLog.values());
  }
}
