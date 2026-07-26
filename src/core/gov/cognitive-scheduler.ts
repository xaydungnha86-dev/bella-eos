/**
 * BELLA EOS E-COS: 5-Level Adaptive Cognitive Scheduler
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Mission: Adaptive Thinking Depth Engine. Analyzes the objective and determines required cognitive level:
 * - Level 1 (Information): Direct fast LLM call (e.g. "Doanh thu hôm nay?" - 0 token waste).
 * - Level 2 (Reasoning): Fast LLM + Context.
 * - Level 3 (Planning): EAH + ECH + Validation.
 * - Level 4 (Deliberation): EAH + ECH + EDR Deliberation + Simulation.
 * - Level 5 (Executive Decision): Full EAH + ECH + EDR + ERR + Human Approval.
 */

export type ThinkingLevel = 
  | 'LEVEL_1_INFO' 
  | 'LEVEL_2_REASONING' 
  | 'LEVEL_3_PLANNING' 
  | 'LEVEL_4_DELIBERATION' 
  | 'LEVEL_5_EXECUTIVE_DECISION';

export interface CognitiveScheduleResult {
  level: ThinkingLevel;
  requiresMultiAgentDebate: boolean;
  requiresSimulation: boolean;
  requiresAarReflection: boolean;
  requiresHumanApproval: boolean;
  targetModel: 'GEMINI_FLASH' | 'CLAUDE_SONNET' | 'GPT_4O';
}

export class CognitiveScheduler {
  private static instance: CognitiveScheduler;

  private constructor() {}

  public static getInstance(): CognitiveScheduler {
    if (!CognitiveScheduler.instance) {
      CognitiveScheduler.instance = new CognitiveScheduler();
    }
    return CognitiveScheduler.instance;
  }

  public scheduleCognitivePipeline(objective: string): CognitiveScheduleResult {
    const lower = objective.toLowerCase();

    if (lower.includes('hôm nay') || lower.includes('hiện tại') || lower.includes('là bao nhiêu')) {
      return {
        level: 'LEVEL_1_INFO',
        requiresMultiAgentDebate: false,
        requiresSimulation: false,
        requiresAarReflection: false,
        requiresHumanApproval: false,
        targetModel: 'GEMINI_FLASH',
      };
    }

    if (lower.includes('chi nhánh') || lower.includes('mở rộng') || lower.includes('chiến lược 2026')) {
      return {
        level: 'LEVEL_5_EXECUTIVE_DECISION',
        requiresMultiAgentDebate: true,
        requiresSimulation: true,
        requiresAarReflection: true,
        requiresHumanApproval: true,
        targetModel: 'CLAUDE_SONNET',
      };
    }

    if (lower.includes('kế hoạch') || lower.includes('marketing q3')) {
      return {
        level: 'LEVEL_4_DELIBERATION',
        requiresMultiAgentDebate: true,
        requiresSimulation: true,
        requiresAarReflection: true,
        requiresHumanApproval: false,
        targetModel: 'GPT_4O',
      };
    }

    return {
      level: 'LEVEL_3_PLANNING',
      requiresMultiAgentDebate: false,
      requiresSimulation: false,
      requiresAarReflection: false,
      requiresHumanApproval: false,
      targetModel: 'GEMINI_FLASH',
    };
  }
}
