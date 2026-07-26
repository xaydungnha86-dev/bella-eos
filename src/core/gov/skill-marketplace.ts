/**
 * BELLA EOS E-COS: Enterprise Skill Marketplace & Versioning
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Mission: Enterprise Skill Governance Engine. Manages Skill Pack versioning (v3.0 ➔ v4.0),
 * benchmark ratings (e.g. 96% accuracy), dependencies, and auto-retirement of obsolete skills.
 */

export interface RegisteredSkillPack {
  skillId: string;
  skillName: string;
  version: string;
  benchmarkAccuracyPercentage: number;
  status: 'ACTIVE' | 'UPGRADED' | 'RETIRED';
}

export class SkillMarketplaceRegistry {
  private static instance: SkillMarketplaceRegistry;
  private registry: Map<string, RegisteredSkillPack[]> = new Map();

  private constructor() {}

  public static getInstance(): SkillMarketplaceRegistry {
    if (!SkillMarketplaceRegistry.instance) {
      SkillMarketplaceRegistry.instance = new SkillMarketplaceRegistry();
    }
    return SkillMarketplaceRegistry.instance;
  }

  public registerSkill(skillName: string, version: string, benchmarkAccuracyPercentage: number): RegisteredSkillPack {
    const list = this.registry.get(skillName) || [];
    
    // Retire previous versions
    list.forEach(s => {
      if (s.status === 'ACTIVE') s.status = 'RETIRED';
    });

    const newSkill: RegisteredSkillPack = {
      skillId: `skill-${skillName.toLowerCase()}-${version}`,
      skillName,
      version,
      benchmarkAccuracyPercentage,
      status: 'ACTIVE',
    };

    list.push(newSkill);
    this.registry.set(skillName, list);
    return newSkill;
  }

  public getActiveSkill(skillName: string): RegisteredSkillPack | undefined {
    const list = this.registry.get(skillName);
    return list?.find(s => s.status === 'ACTIVE');
  }
}
