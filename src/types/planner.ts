/**
 * BELLA EOS PLATFORM CONTRACT: Planner Engine Contract (IPlanner v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Orchestration planning engine contract for decomposing Intent and Goal trees.
 */

export interface Goal {
  id: string;
  name: string;
  targetMetric: string;
  targetValue: number;
  deadline?: string;
  constraints?: string[];
}

export interface ExecutionPlan {
  planId: string;
  goalId: string;
  strategy: string;
  tasks: Array<{
    id: string;
    name: string;
    agent: string;
    capability: string;
    dependsOn?: string[];
  }>;
}

export interface ResourceCostEstimate {
  estimatedTokens: number;
  estimatedCostUsd: number;
  estimatedDurationSeconds: number;
}

export interface IPlanner {
  plan(goal: Goal): Promise<ExecutionPlan>;
  optimize(plan: ExecutionPlan): Promise<ExecutionPlan>;
  estimate(plan: ExecutionPlan): Promise<ResourceCostEstimate>;
  rollback(planId: string): Promise<boolean>;
}
