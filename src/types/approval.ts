/**
 * BELLA EOS PLATFORM CONTRACT: Human Approval Engine Contract (IApproval v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages risk-evaluated human approval tasks for executive review.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface HumanApprovalTask {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  proposedAction: string;
  aiConfidenceScore: number;
  riskLevel: RiskLevel;
  requiredRole: string;
  payload: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface ApprovalRequestResult {
  requestId: string;
  status: ApprovalStatus;
  queuedAt: string;
}

export interface IApproval {
  requestApproval(task: Omit<HumanApprovalTask, 'id' | 'createdAt'>): Promise<ApprovalRequestResult>;
  approve(requestId: string, approverId: string, comments?: string): Promise<boolean>;
  reject(requestId: string, approverId: string, reason: string): Promise<boolean>;
  getStatus(requestId: string): Promise<ApprovalStatus>;
}
