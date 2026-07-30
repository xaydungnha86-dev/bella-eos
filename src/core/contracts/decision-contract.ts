/**
 * Explainable Decision Contract (v1) - Immutable Specification
 * Pure domain decision output with structured rationale.
 */

export interface RejectedStrategyV1 {
  readonly strategy: string;
  readonly reason: string;
  readonly risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ExplainableDecisionContractV1 {
  readonly version: 'v1';
  readonly decisionId: string;
  readonly contextId: string;
  readonly planId: string;
  readonly timestamp: string;
  readonly approvedStrategy: string;
  readonly confidenceScore: number;    // 0 to 1
  readonly riskScore: number;          // 0 to 1
  readonly assumptions: string[];
  readonly evidence: string[];
  readonly rejectedStrategies: RejectedStrategyV1[];
  readonly counterfactualScenario: string;
  readonly alternativesEvaluated: string[];
  readonly requiresHumanApproval: boolean;
  readonly status: 'AWAITING_APPROVAL' | 'APPROVED' | 'BLOCKED' | 'REJECTED';
}
