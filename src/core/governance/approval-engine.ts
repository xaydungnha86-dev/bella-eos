/**
 * BELLA EOS PLATFORM: Human Approval Engine
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Coordinates human-in-the-loop approval requests and suspends/resumes workflows.
 */

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalTask {
  approvalId: string;
  workflowId: string;
  taskId: string;
  proposedAction: string;
  status: ApprovalState;
  approverRole: 'CEO' | 'MANAGER';
  reason?: string;
  createdAt: string;
  decidedAt?: string;
}

export class ApprovalEngine {
  private static instance: ApprovalEngine;
  private pendingApprovals: Map<string, ApprovalTask> = new Map();

  private constructor() {}

  public static getInstance(): ApprovalEngine {
    if (!ApprovalEngine.instance) {
      ApprovalEngine.instance = new ApprovalEngine();
    }
    return ApprovalEngine.instance;
  }

  public requestApproval(params: {
    workflowId: string;
    taskId: string;
    proposedAction: string;
    approverRole: 'CEO' | 'MANAGER';
  }): ApprovalTask {
    const approvalId = `appr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const task: ApprovalTask = {
      approvalId,
      workflowId: params.workflowId,
      taskId: params.taskId,
      proposedAction: params.proposedAction,
      status: 'PENDING',
      approverRole: params.approverRole,
      createdAt: new Date().toISOString(),
    };
    
    this.pendingApprovals.set(approvalId, task);
    console.log(`[ApprovalEngine] Human approval requested for task: ${params.taskId}. ID: ${approvalId}. Approver Role: ${params.approverRole}`);
    return task;
  }

  public submitDecision(approvalId: string, status: 'APPROVED' | 'REJECTED', reason?: string): boolean {
    const task = this.pendingApprovals.get(approvalId);
    if (!task) {
      console.warn(`[ApprovalEngine] Approval request ${approvalId} not found.`);
      return false;
    }

    task.status = status;
    task.reason = reason;
    task.decidedAt = new Date().toISOString();
    console.log(`[ApprovalEngine] Approval ${approvalId} decided: ${status}. Reason: ${reason || 'None'}`);
    return true;
  }

  public getApprovalState(approvalId: string): ApprovalState {
    const task = this.pendingApprovals.get(approvalId);
    return task ? task.status : 'REJECTED';
  }

  public getPendingApprovals(): ApprovalTask[] {
    return Array.from(this.pendingApprovals.values()).filter(t => t.status === 'PENDING');
  }
}
