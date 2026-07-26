/**
 * BELLA EOS EAH: Skill Harness Runtime (Runtime 4)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Mission: Dynamic Skill Selection Engine. Analyzes the objective and automatically attaches
 * required platform skills (Marketing, Content, Media, Budget, ROI) into the Harness.
 */

export class SkillHarnessRuntime {
  private static instance: SkillHarnessRuntime;

  private constructor() {}

  public static getInstance(): SkillHarnessRuntime {
    if (!SkillHarnessRuntime.instance) {
      SkillHarnessRuntime.instance = new SkillHarnessRuntime();
    }
    return SkillHarnessRuntime.instance;
  }

  public selectSkills(objective: string): string[] {
    const skills: string[] = ['Core_Enterprise_Governance'];
    const lower = objective.toLowerCase();

    if (lower.includes('marketing') || lower.includes('quảng cáo') || lower.includes('campaign')) {
      skills.push('Marketing_Strategy_Skill', 'Content_Copywriting_Skill', 'ROAS_Optimizer_Skill');
    }
    if (lower.includes('budget') || lower.includes('ngân sách') || lower.includes('tài chính')) {
      skills.push('Financial_Modeling_Skill', 'Budget_ROI_Governor_Skill');
    }
    if (lower.includes('hr') || lower.includes('nhân sự') || lower.includes('tuyển dụng')) {
      skills.push('HR_Workforce_Skill', 'SOP_Dispatcher_Skill');
    }

    return skills;
  }
}
