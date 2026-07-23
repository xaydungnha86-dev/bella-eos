import { HUMAN_WORKER_REGISTRY } from '../workforce/human-registry';

export interface ScorecardCandidate {
  id: string;
  name: string;
  avatar: string;
  type: 'AI' | 'Human';
  scores: {
    skillMatch: number;      // 0-10
    experience: number;      // 0-10
    workload: number;        // 0-10 (lower workload is better)
    costEffectiveness: number;// 0-10 (cheaper is better)
    slaReliability: number;  // 0-10
    total: number;           // weighted average
  };
  rationale: string;
}

// Map task types to required skills/capabilities
const TASK_TYPE_SKILL_MAP: Record<string, string[]> = {
  'analyze_marketing_strategy': ['Marketing', 'Strategy', 'plan_campaign_roadmap'],
  'write_facebook_post': ['Copywriting', 'SEO', 'write_facebook_post'],
  'write_zalo_message': ['Copywriting', 'Zalo Marketing', 'write_zalo_message'],
  'generate_media_creative': ['Branding', 'Photoshop', 'generate_media_creative'],
  'create_banner_design': ['Branding', 'Photoshop', 'create_banner_design'],
  'publish_facebook': ['Facebook Integration', 'publish_facebook'],
  'create_facebook_ad': ['Facebook Ads', 'create_facebook_ad'],
  'generate_report': ['Analytics', 'generate_report']
};

/**
 * Evaluates and ranks all AI & Human candidates for a given task type.
 */
export function rankCandidatesForTask(
  taskType: string,
  aiAgentId: string,
  aiAgentName: string
): ScorecardCandidate[] {
  const candidates: ScorecardCandidate[] = [];
  const requiredSkills = TASK_TYPE_SKILL_MAP[taskType] || [];

  // 1. Evaluate default AI Agent candidate
  const aiSkillMatch = 8.5; // AI has a high general match
  const aiExperience = 9.0;  // Standard 90% expert level
  const aiWorkloadScore = 10.0; // AI has infinite concurrency, no workload limits
  const aiCost = 10.0;        // AI is very cheap per run
  const aiSla = 9.5;        // Instant SLA delivery
  const aiTotal = parseFloat(((aiSkillMatch * 0.3) + (aiExperience * 0.25) + (aiWorkloadScore * 0.15) + (aiCost * 0.2) + (aiSla * 0.1)).toFixed(1));

  candidates.push({
    id: aiAgentId,
    name: aiAgentName,
    avatar: '🤖',
    type: 'AI',
    scores: {
      skillMatch: aiSkillMatch,
      experience: aiExperience,
      workload: aiWorkloadScore,
      costEffectiveness: aiCost,
      slaReliability: aiSla,
      total: aiTotal
    },
    rationale: 'AI Worker có năng lực tính toán song song tức thời, chi phí cận 0$, tuân thủ SOP tự động 100%.'
  });

  // 2. Evaluate all Human Workers
  HUMAN_WORKER_REGISTRY.forEach(worker => {
    // Calculate matched capabilities count
    let matchedCount = 0;
    requiredSkills.forEach(reqSkill => {
      if (worker.skills.some(ws => ws.toLowerCase() === reqSkill.toLowerCase())) {
        matchedCount++;
      }
    });

    const skillMatchScore = requiredSkills.length > 0 
      ? Math.round((matchedCount / requiredSkills.length) * 10)
      : 5; // Default score

    // Experience: rating * 2
    const experienceScore = worker.experience * 2;

    // Workload Score: higher is better (less loaded).
    const workloadScore = parseFloat((10 - (worker.workload / 10)).toFixed(1));

    // Cost effectiveness: normalized 0-10. Less expensive is higher score.
    const costEffectiveness = worker.hourlyCost <= 15 ? 9 : worker.hourlyCost <= 20 ? 8 : 6;

    // SLA Reliability: based on current workload
    const slaReliability = worker.workload > 80 ? 5 : worker.workload > 60 ? 7 : 8.5;

    // Weighted average: Skill (30%), Experience (25%), Workload (15%), Cost (20%), SLA (10%)
    const total = parseFloat((
      (skillMatchScore * 0.3) + 
      (experienceScore * 0.25) + 
      (workloadScore * 0.15) + 
      (costEffectiveness * 0.2) + 
      (slaReliability * 0.1)
    ).toFixed(1));

    // Rationale wording
    let rationale = '';
    if (skillMatchScore >= 8) {
      rationale = `Nhân sự chuyên môn cao (${worker.role}). `;
    } else if (skillMatchScore >= 5) {
      rationale = `Nhân sự có kỹ năng bổ trợ. `;
    } else {
      rationale = `Không thuộc chuyên môn chính cho tác vụ này. `;
    }

    if (worker.workload > 60) {
      rationale += `Hiện đang có tải công việc khá cao (${worker.workload}%).`;
    } else {
      rationale += `Thời gian rảnh tốt (${100 - worker.workload}%). Sẵn sàng nhận việc.`;
    }

    candidates.push({
      id: worker.id,
      name: worker.name,
      avatar: worker.avatar,
      type: 'Human',
      scores: {
        skillMatch: skillMatchScore,
        experience: experienceScore,
        workload: workloadScore,
        costEffectiveness,
        slaReliability,
        total
      },
      rationale
    });
  });

  // Sort candidates by total score descending
  return candidates.sort((a, b) => b.scores.total - a.scores.total);
}
