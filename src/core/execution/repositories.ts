/**
 * BELLA EOS PLATFORM CORE: Repositories & Projections
 * Part of Task Governance Bounded Context v5.4
 */

import { PersistenceAdapter } from './persistence-adapter';
import { DomainEvent } from './domain-events';

// Structural definitions of domain aggregates mapped in persistence
export interface WorkflowData {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  assignments: any[];
  aggregateVersion: number;
}

export interface SubmissionData {
  submissionId: string;
  assignmentId: string;
  workflowId: string;
  submittedBy: string;
  submittedAt: string;
  reportContent: any;
  evidencePackage: any[];
  verificationResult?: any;
  approvalComment?: string;
}

export interface VerificationRecord {
  recordId: string;
  submissionId: string;
  assignmentId: string;
  status: 'PASSED' | 'FAILED';
  confidence: number;
  evidenceQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'SELF_REPORTED';
  checkedAt: string;
  violations: string[];
}

export interface ApprovalRecord {
  recordId: string;
  submissionId: string;
  assignmentId: string;
  status: 'APPROVED' | 'REJECTED';
  approverRole: string;
  comment?: string;
  occurredAt: string;
}

// Outbox item structure
export interface OutboxEntry {
  id: string;
  event: DomainEvent;
  status: 'PENDING' | 'DISPATCHED';
}

export class OutboxStore {
  private key = 'bella_eos_outbox';
  constructor(private adapter: PersistenceAdapter) {}

  public append(event: DomainEvent): void {
    const list: OutboxEntry[] = this.adapter.load(this.key) || [];
    list.push({
      id: `out-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      event,
      status: 'PENDING'
    });
    this.adapter.save(this.key, list);
  }

  public getPending(): OutboxEntry[] {
    const list: OutboxEntry[] = this.adapter.load(this.key) || [];
    return list.filter(e => e.status === 'PENDING');
  }

  public markDispatched(id: string): void {
    const list: OutboxEntry[] = this.adapter.load(this.key) || [];
    const updated = list.map(e => e.id === id ? { ...e, status: 'DISPATCHED' as const } : e);
    this.adapter.save(this.key, updated);
  }
}

export class WorkflowRepository {
  private keyPrefix = 'workflow::';

  constructor(
    private adapter: PersistenceAdapter,
    private outbox: OutboxStore
  ) {}

  public getById(workflowId: string): WorkflowData | null {
    return this.adapter.load(`${this.keyPrefix}${workflowId}`);
  }

  public save(workflow: { id: string; status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'; assignments: any[]; aggregateVersion: number; getRaisedEvents?: () => DomainEvent[]; clearRaisedEvents?: () => void }): void {
    this.adapter.transaction(() => {
      // 1. Persist the aggregate state
      const data: WorkflowData = {
        id: workflow.id,
        status: workflow.status,
        assignments: workflow.assignments,
        aggregateVersion: workflow.aggregateVersion
      };
      this.adapter.save(`${this.keyPrefix}${workflow.id}`, data);

      // 2. Persist outbox events if any raised
      if (workflow.getRaisedEvents) {
        const events = workflow.getRaisedEvents();
        events.forEach(event => {
          this.outbox.append(event);
        });
        if (workflow.clearRaisedEvents) {
          workflow.clearRaisedEvents();
        }
      }
    });
  }

  public listAll(): WorkflowData[] {
    if (typeof window === 'undefined') return [];
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(k => k.startsWith(this.keyPrefix))
        .map(k => JSON.parse(localStorage.getItem(k) || '{}'));
    } catch {
      return [];
    }
  }
}

export class SubmissionStore {
  private subKey = 'bella_eos_submissions';
  private verKey = 'bella_eos_verifications';
  private appKey = 'bella_eos_approvals';

  constructor(private adapter: PersistenceAdapter) {}

  public append(submission: SubmissionData): void {
    const list: SubmissionData[] = this.adapter.load(this.subKey) || [];
    list.push(submission);
    this.adapter.save(this.subKey, list);
  }

  public appendVerification(record: VerificationRecord): void {
    const list: VerificationRecord[] = this.adapter.load(this.verKey) || [];
    list.push(record);
    this.adapter.save(this.verKey, list);
  }

  public appendApproval(record: ApprovalRecord): void {
    const list: ApprovalRecord[] = this.adapter.load(this.appKey) || [];
    list.push(record);
    this.adapter.save(this.appKey, list);
  }

  public findById(submissionId: string): SubmissionData | null {
    const list: SubmissionData[] = this.adapter.load(this.subKey) || [];
    return list.find(s => s.submissionId === submissionId) || null;
  }

  public findByAssignmentId(assignmentId: string): SubmissionData[] {
    const list: SubmissionData[] = this.adapter.load(this.subKey) || [];
    return list.filter(s => s.assignmentId === assignmentId);
  }

  public findLatest(assignmentId: string): SubmissionData | null {
    const list = this.findByAssignmentId(assignmentId);
    if (list.length === 0) return null;
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
  }

  public findHistory(assignmentId: string): { submission: SubmissionData; verification?: VerificationRecord; approval?: ApprovalRecord }[] {
    const subs = this.findByAssignmentId(assignmentId);
    const vers: VerificationRecord[] = this.adapter.load(this.verKey) || [];
    const apps: ApprovalRecord[] = this.adapter.load(this.appKey) || [];

    return subs.map(s => {
      const v = vers.find(vr => vr.submissionId === s.submissionId);
      const a = apps.find(ap => ap.submissionId === s.submissionId);
      return { submission: s, verification: v, approval: a };
    });
  }

  public findByWorkflow(workflowId: string): SubmissionData[] {
    const list: SubmissionData[] = this.adapter.load(this.subKey) || [];
    return list.filter(s => s.workflowId === workflowId);
  }
}

// ─── Query Projections (CQRS Read Model) ────────────────────────────────────
export class WorkAssignmentReadRepository {
  private workflowPrefix = 'workflow::';

  constructor(private adapter: PersistenceAdapter) {}

  public getById(assignmentId: string): any | null {
    const workflows = this.listAllWorkflows();
    for (const w of workflows) {
      const found = w.assignments.find((a: any) => a.id === assignmentId);
      if (found) return { ...found, workflowId: w.id };
    }
    return null;
  }

  public getByWorkflowId(workflowId: string): any[] {
    const wf: WorkflowData | null = this.adapter.load(`${this.workflowPrefix}${workflowId}`);
    return wf ? wf.assignments : [];
  }

  public listAllAssignments(): any[] {
    const workflows = this.listAllWorkflows();
    const list: any[] = [];
    workflows.forEach(w => {
      w.assignments.forEach((a: any) => {
        list.push({ ...a, workflowId: w.id });
      });
    });
    return list;
  }

  private listAllWorkflows(): WorkflowData[] {
    if (typeof window === 'undefined') return [];
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(k => k.startsWith(this.workflowPrefix))
        .map(k => JSON.parse(localStorage.getItem(k) || '{}'));
    } catch {
      return [];
    }
  }

  // Dashboard Aggregation projection
  public getDashboardProjection(): {
    total: number;
    completed: number;
    completionRate: number;
    activeHumanWorkload: number;
    activeAiWorkload: number;
    overdue: number;
    blocked: number;
    awaitingApproval: number;
  } {
    const list = this.listAllAssignments();
    const active = list.filter(a => a.executionStatus !== 'ARCHIVED');
    const total = active.length;
    const completed = active.filter(a => a.executionStatus === 'DONE' && a.verificationStatus === 'PASSED').length;
    
    const humanCount = active.filter(a => a.assigneeType === 'Human' && a.executionStatus !== 'DONE').length;
    const aiCount = active.filter(a => a.assigneeType === 'AI' && a.executionStatus !== 'DONE').length;

    const blocked = active.filter(a => a.executionStatus === 'RUNNING' && a.verificationStatus === 'FAILED').length;
    const awaitingApproval = active.filter(a => a.approvalStatus === 'PENDING').length;

    const now = new Date().getTime();
    const overdue = active.filter(a => a.executionStatus !== 'DONE' && new Date(a.dueDate).getTime() < now).length;

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 100,
      activeHumanWorkload: humanCount,
      activeAiWorkload: aiCount,
      overdue,
      blocked,
      awaitingApproval
    };
  }
}
