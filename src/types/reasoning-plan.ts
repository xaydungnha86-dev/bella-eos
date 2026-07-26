/**
 * BELLA EOS PLATFORM CONTRACT: Reasoning Plan Contract (IReasoningPlan v1.0)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME (ECH / ECR)
 * 
 * Contract 31: Deterministic Reasoning Plan Interface. Defines step-by-step
 * execution sequences guiding LLMs without random wandering.
 */

export interface ReasoningStep {
  stepIndex: number;
  stepName: string;
  targetDomain: string;
  inputContextKeys: string[];
  expectedOutput: string;
}

export interface IReasoningPlan {
  planId: string;
  objective: string;
  steps: ReasoningStep[];
  targetMetric: string;
  expectedOutcome: string;
}
