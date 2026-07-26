/**
 * BELLA EOS PLATFORM CONTRACT: Playbook Contract (IPlaybook v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME (EIER / EER)
 * 
 * Contract 26: Executable Playbook Contract. Encapsulates automated trigger conditions,
 * multi-step action sequences, review schedules, and historical execution stats.
 */

export interface PlaybookTriggerCondition {
  metric: string; // e.g. "ROAS"
  operator: '<' | '<=' | '>' | '>=' | '==';
  threshold: number;
}

export interface PlaybookActionStep {
  stepNumber: number;
  actionType: 'ADJUST_BUDGET' | 'REPLACE_CREATIVE' | 'SCHEDULE_REVIEW' | 'NOTIFY_EXECUTIVE' | 'TRIGGER_WORKFLOW';
  targetComponent: string;
  parameters: Record<string, any>;
}

export interface IPlaybook {
  id: string;
  title: string;
  description: string;
  triggerCondition: PlaybookTriggerCondition;
  actionSequence: PlaybookActionStep[];
  reviewScheduleHours: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  executionCount: number;
  successRate: number; // 0.0 to 1.0
  owner: string;
  createdAt: string;
  updatedAt: string;
}
