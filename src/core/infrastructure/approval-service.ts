/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Approval Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Cross-Cutting Approval Platform Service. Handles multi-stage sequential,
 * parallel, and conditional approvals for all enterprise primitives (Tasks, Invoices, Contracts, Leave Requests).
 */

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalStage {
  stageId: string;
  stageName: string;
  approverRole: string;
  status: ApprovalStatus;
  comment?: string;
  approvedAt?: string;
}

export interface ApprovalWorkflow {
  workflowId: string;
  aggregateType: 'TASK' | 'WORKFLOW' | 'INVOICE' | 'CONTRACT' | 'LEAVE_REQUEST' | 'DEPLOYMENT' | 'SOP' | 'PAYMENT' | 'FORECAST';
  targetId: string;
  stages: ApprovalStage[];
  currentStageIndex: number;
  status: ApprovalStatus;
  completedAt?: string;
}

export class ApprovalService {
  private static instance: ApprovalService;
  private workflows: Map<string, ApprovalWorkflow> = new Map();

  private constructor() {}

  public static getInstance(): ApprovalService {
    if (!ApprovalService.instance) {
      ApprovalService.instance = new ApprovalService();
    }
    return ApprovalService.instance;
  }

  public createWorkflow(
    aggregateType: ApprovalWorkflow['aggregateType'],
    targetId: string,
    stagesConfig: Array<{ stageName: string; approverRole: string; }>
  ): ApprovalWorkflow {
    const workflowId = `wf-appr-${targetId}-${Date.now()}`;
    const stages: ApprovalStage[] = stagesConfig.map((cfg, idx) => ({
      stageId: `${workflowId}-stage-${idx}`,
      stageName: cfg.stageName,
      approverRole: cfg.approverRole,
      status: 'PENDING',
    }));

    const wf: ApprovalWorkflow = {
      workflowId,
      aggregateType,
      targetId,
      stages,
      currentStageIndex: 0,
      status: 'PENDING',
    };

    this.workflows.set(workflowId, wf);
    return wf;
  }

  public approveStage(workflowId: string, approverRole: string, comment?: string): ApprovalWorkflow {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error(`Approval workflow ${workflowId} not found.`);

    if (wf.status !== 'PENDING') return wf;

    const currentStage = wf.stages[wf.currentStageIndex];
    if (currentStage && currentStage.approverRole === approverRole) {
      currentStage.status = 'APPROVED';
      currentStage.comment = comment;
      currentStage.approvedAt = new Date().toISOString();

      if (wf.currentStageIndex < wf.stages.length - 1) {
        wf.currentStageIndex += 1;
      } else {
        wf.status = 'APPROVED';
        wf.completedAt = new Date().toISOString();
      }
    }

    return wf;
  }

  public rejectStage(workflowId: string, approverRole: string, reason: string): ApprovalWorkflow {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error(`Approval workflow ${workflowId} not found.`);

    const currentStage = wf.stages[wf.currentStageIndex];
    if (currentStage && currentStage.approverRole === approverRole) {
      currentStage.status = 'REJECTED';
      currentStage.comment = reason;
      wf.status = 'REJECTED';
      wf.completedAt = new Date().toISOString();
    }

    return wf;
  }

  public getWorkflow(workflowId: string): ApprovalWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  public getWorkflowForTarget(targetId: string): ApprovalWorkflow | undefined {
    return Array.from(this.workflows.values()).find(w => w.targetId === targetId);
  }
}
