/**
 * BELLA EOS PLATFORM CONTRACTS: Governance Data Contracts
 * Defines structural EOM contracts exchanged between the core engines.
 */

export interface IntentContract {
  intentId: string;
  tenantId: string;
  rawText: string;
  targetObjective: string;
  spendLimitVnd: number;
  expectedTimelineDays: number;
  timestamp: string;
  parsingConfidence: number; // 0.0 to 1.0 (DoD requires > 0.95)
}

export interface AlternativeOption {
  strategyId: string;
  description: string;
  confidenceScore: number;
  riskScore: number;
  pros: string[];
  cons: string[];
}

export interface DecisionContract {
  decisionId: string;
  goalId: string;
  selectedStrategy: string;
  confidenceScore: number;
  riskScore: number;
  evidence: string[];
  alternatives: AlternativeOption[];
  requiresApproval: boolean;
  approvalRoleRequired: 'CEO' | 'MANAGER' | 'NONE';
  timestamp: string;
}

export interface ApproverNode {
  role: string;
  userId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt?: string;
}

export interface ApprovalContract {
  approvalId: string;
  workflowId: string;
  taskId: string;
  proposedAction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'TIMEOUT';
  routingType: 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';
  approvers: ApproverNode[];
  timeoutMs?: number;
  escalationRole?: string;
  reason?: string;
  createdAt: string;
}

export interface WorkflowStepState {
  stepId: string;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATED';
  error?: string;
}

export interface WorkflowContract {
  workflowId: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATING' | 'COMPENSATED';
  steps: WorkflowStepState[];
  startedAt: string;
  endedAt?: string;
}

export interface TaskContract {
  taskId: string;
  workflowId: string;
  taskType: string;
  assignedWorkerId: string;
  assigneeType: 'AI' | 'Human';
  requiredSkills: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  inputDataJson: string;
}

export interface EvidenceContract {
  evidenceId: string;
  taskId: string;
  workflowId: string;
  outputDataJson: string;
  qualityScore: number;
  signedBy: string;
  digitalSignature: string;
  timestamp: string;
}
