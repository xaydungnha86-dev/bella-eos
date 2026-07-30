/**
 * Execution Plan Contract (v1) - Immutable Specification
 * Represents the structured multi-agent task execution graph.
 */

export interface ExecutionTaskV1 {
  readonly taskId: string;              // e.g. t1, t2, t3
  readonly requiredCapability: string;  // e.g. marketing_strategy, write_facebook_post
  readonly assignedAgentId: string;     // e.g. eos_marketing_manager
  readonly assignedAgentName: string;   // e.g. CMO AI (Executive Marketing Strategist)
  readonly taskType: string;
  readonly taskDescription: string;
  readonly input: Record<string, any>;
  readonly expectedOutput: string;
  readonly dependsOn: string[];
  readonly requiresHumanApproval: boolean;
  readonly SLAHours?: number;
}

export interface ExecutionPlanContractV1 {
  readonly version: 'v1';
  readonly planId: string;
  readonly contextId: string;
  readonly timestamp: string;
  readonly planTitle: string;
  readonly reasoning: string;
  readonly targetIndustryPack?: string; // e.g. Spa, F&B, Real Estate
  readonly tasks: ExecutionTaskV1[];
  readonly plannerProvider: string;     // e.g. gemini, openai, rule-based-sops
  readonly plannerModel: string;
}
