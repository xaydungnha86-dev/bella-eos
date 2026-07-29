/**
 * BELLA EOS PLATFORM: Human Approval Engine
 * Coordinates human-in-the-loop approval routing with Single, Sequential, 
 * and Parallel support, timeout gates, and automated escalation.
 */

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'TIMEOUT';
export type RoutingType = 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';

export interface ApproverNode {
  role: string;
  userId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt?: string;
}

export interface ApprovalTask {
  approvalId: string;
  workflowId: string;
  taskId: string;
  proposedAction: string;
  status: ApprovalState;
  routingType: RoutingType;
  approvers: ApproverNode[];
  timeoutMs?: number;
  escalationRole?: string;
  createdAt: string;
  decidedAt?: string;
  escalatedAt?: string;
  reason?: string;
  // Legacy fields for backward compatibility
  approverRole?: 'CEO' | 'MANAGER'; 
}

export class ApprovalEngine {
  private static instance: ApprovalEngine;
  private approvals: Map<string, ApprovalTask> = new Map();

  private constructor() {}

  public static getInstance(): ApprovalEngine {
    if (!ApprovalEngine.instance) {
      ApprovalEngine.instance = new ApprovalEngine();
    }
    return ApprovalEngine.instance;
  }

  /**
   * Submits a new human approval request with custom routing options.
   */
  public requestApproval(params: {
    workflowId: string;
    taskId: string;
    proposedAction: string;
    approverRole?: 'CEO' | 'MANAGER'; // Preserved for legacy compatibility
    routingType?: RoutingType;
    approvers?: string[]; // Array of roles
    timeoutMs?: number;
    escalationRole?: string;
  }): ApprovalTask {
    const approvalId = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const routing = params.routingType ?? 'SINGLE';
    const roles = params.approvers ?? [params.approverRole ?? 'CEO'];

    const approverNodes: ApproverNode[] = roles.map((role, idx) => ({
      role,
      // For sequential routing, only the first node starts as PENDING, others start as PENDING but inactive
      status: (routing === 'SEQUENTIAL' && idx > 0) ? 'PENDING' : 'PENDING',
      userId: undefined
    }));

    const task: ApprovalTask = {
      approvalId,
      workflowId: params.workflowId,
      taskId: params.taskId,
      proposedAction: params.proposedAction,
      status: 'PENDING',
      routingType: routing,
      approvers: approverNodes,
      timeoutMs: params.timeoutMs,
      escalationRole: params.escalationRole,
      createdAt: new Date().toISOString(),
      // Legacy compatibility
      approverRole: params.approverRole ?? 'CEO'
    };

    this.approvals.set(approvalId, task);
    console.log(`[ApprovalEngine] Human approval [${approvalId}] requested. Routing: ${routing}, Approvers: ${roles.join(', ')}`);
    return task;
  }

  /**
   * Submit decision for a specific approver role in the task.
   */
  public submitDecision(
    approvalId: string, 
    status: 'APPROVED' | 'REJECTED', 
    approverRoleOrReason?: string, // Dual signature support: can be role or reason (legacy)
    reason?: string
  ): boolean {
    const task = this.approvals.get(approvalId);
    if (!task) {
      console.warn(`[ApprovalEngine] Approval request ${approvalId} not found.`);
      return false;
    }

    if (task.status === 'APPROVED' || task.status === 'REJECTED') {
      console.warn(`[ApprovalEngine] Approval task ${approvalId} is already completed.`);
      return false;
    }

    // Determine if we are using the legacy signature or the new role-based signature.
    // If only status is passed and the first role matches or is a generic call,
    // we map to the currently pending node.
    let targetRole = approverRoleOrReason;
    let actualReason = reason;

    if (status === 'APPROVED' && (!reason && !approverRoleOrReason)) {
      // Legacy simple approval: pick the first pending node
      const pendingNode = task.approvers.find(a => a.status === 'PENDING');
      if (pendingNode) targetRole = pendingNode.role;
    } else if (approverRoleOrReason && !reason) {
      // If we got approvalId, status, and reason (legacy)
      actualReason = approverRoleOrReason;
      const pendingNode = task.approvers.find(a => a.status === 'PENDING');
      if (pendingNode) targetRole = pendingNode.role;
    }

    const node = task.approvers.find(a => a.role === targetRole && a.status === 'PENDING');
    if (!node) {
      console.warn(`[ApprovalEngine] No pending approver node for role: ${targetRole} in task: ${approvalId}`);
      return false;
    }

    // Update node state
    node.status = status;
    node.decidedAt = new Date().toISOString();

    if (status === 'REJECTED') {
      // Any rejection immediately rejects the entire task
      task.status = 'REJECTED';
      task.reason = actualReason;
      task.decidedAt = new Date().toISOString();
      console.log(`[ApprovalEngine] Task ${approvalId} rejected by ${targetRole}. Reason: ${actualReason}`);
      return true;
    }

    // Evaluate completion based on routing types
    if (task.routingType === 'SINGLE') {
      task.status = 'APPROVED';
      task.reason = actualReason;
      task.decidedAt = new Date().toISOString();
      console.log(`[ApprovalEngine] Task ${approvalId} approved by single approver: ${targetRole}`);
    } else if (task.routingType === 'SEQUENTIAL') {
      const allApproved = task.approvers.every(a => a.status === 'APPROVED');
      if (allApproved) {
        task.status = 'APPROVED';
        task.reason = actualReason;
        task.decidedAt = new Date().toISOString();
        console.log(`[ApprovalEngine] Task ${approvalId} approved sequentially by all approvers.`);
      } else {
        console.log(`[ApprovalEngine] Task ${approvalId} approved by ${targetRole}. Sequential pipeline continuing.`);
      }
    } else if (task.routingType === 'PARALLEL') {
      const allApproved = task.approvers.every(a => a.status === 'APPROVED');
      if (allApproved) {
        task.status = 'APPROVED';
        task.reason = actualReason;
        task.decidedAt = new Date().toISOString();
        console.log(`[ApprovalEngine] Task ${approvalId} approved in parallel by all approvers.`);
      } else {
        console.log(`[ApprovalEngine] Task ${approvalId} approved by ${targetRole}. Waiting for parallel consensus.`);
      }
    }

    return true;
  }

  /**
   * Checks pending approvals and triggers escalation if timeout limits are crossed.
   */
  public checkTimeouts(): void {
    const now = Date.now();
    for (const task of this.approvals.values()) {
      if (task.status !== 'PENDING') continue;
      if (!task.timeoutMs) continue;

      const elapsed = now - new Date(task.createdAt).getTime();
      if (elapsed > task.timeoutMs) {
        if (task.escalationRole) {
          task.status = 'ESCALATED';
          task.escalatedAt = new Date().toISOString();
          // Add the escalated role to the approvers list as a new pending node
          task.approvers.push({
            role: task.escalationRole,
            status: 'PENDING'
          });
          console.log(`[ApprovalEngine] Task ${task.approvalId} timed out after ${task.timeoutMs}ms. Escalated to: ${task.escalationRole}`);
        } else {
          task.status = 'TIMEOUT';
          task.decidedAt = new Date().toISOString();
          console.log(`[ApprovalEngine] Task ${task.approvalId} timed out. Set to TIMEOUT state.`);
        }
      }
    }
  }

  public getApprovalState(approvalId: string): ApprovalState {
    const task = this.approvals.get(approvalId);
    return task ? task.status : 'REJECTED';
  }

  public getApprovalTask(approvalId: string): ApprovalTask | undefined {
    return this.approvals.get(approvalId);
  }

  public getPendingApprovals(): ApprovalTask[] {
    return Array.from(this.approvals.values()).filter(t => t.status === 'PENDING' || t.status === 'ESCALATED');
  }

  public clearApprovals(): void {
    this.approvals.clear();
  }
}
