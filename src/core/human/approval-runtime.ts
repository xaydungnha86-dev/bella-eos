/**
 * BELLA EOS HUMAN: Human Approval Engine Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IApproval v1.0.
 */

import { ApprovalRequestResult, ApprovalStatus, HumanApprovalTask, IApproval } from '@/types/approval';

export class ApprovalRuntime implements IApproval {
  private static instance: ApprovalRuntime;
  private tasks: Map<string, HumanApprovalTask & { status: ApprovalStatus; approverId?: string }> = new Map();

  private constructor() {}

  public static getInstance(): ApprovalRuntime {
    if (!ApprovalRuntime.instance) {
      ApprovalRuntime.instance = new ApprovalRuntime();
    }
    return ApprovalRuntime.instance;
  }

  public async requestApproval(taskInput: Omit<HumanApprovalTask, 'id' | 'createdAt'>): Promise<ApprovalRequestResult> {
    const id = `appr-${Date.now()}`;
    const now = new Date().toISOString();

    const task: HumanApprovalTask & { status: ApprovalStatus; approverId?: string } = {
      ...taskInput,
      id,
      createdAt: now,
      status: 'PENDING',
    };

    this.tasks.set(id, task);

    return {
      requestId: id,
      status: 'PENDING',
      queuedAt: now,
    };
  }

  public async approve(requestId: string, approverId: string, comments?: string): Promise<boolean> {
    const task = this.tasks.get(requestId);
    if (!task || task.status !== 'PENDING') return false;

    task.status = 'APPROVED';
    task.approverId = approverId;
    return true;
  }

  public async reject(requestId: string, approverId: string, reason: string): Promise<boolean> {
    const task = this.tasks.get(requestId);
    if (!task || task.status !== 'PENDING') return false;

    task.status = 'REJECTED';
    task.approverId = approverId;
    return true;
  }

  public async getStatus(requestId: string): Promise<ApprovalStatus> {
    const task = this.tasks.get(requestId);
    return task ? task.status : 'EXPIRED';
  }
}
