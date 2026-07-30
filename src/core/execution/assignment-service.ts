/**
 * BELLA EOS PLATFORM CORE: Workflow Aggregate & Work Assignment Service
 * Part of Task Governance Bounded Context v5.4
 */

import { 
  DomainEvent, 
  AssignmentCreated, 
  AssignmentReported, 
  AssignmentVerified, 
  AssignmentFailed, 
  ApprovalRequested, 
  ApprovalCompleted, 
  createMetadata 
} from './domain-events';
import { WorkflowRepository, SubmissionStore, SubmissionData, VerificationRecord, ApprovalRecord } from './repositories';
import { EvidenceValidationService, TaskEvidence } from './evidence-validation-service';
import { AssignmentPolicy, WorkflowCompletionSpecification } from './domain-policies';

export interface WorkAssignment {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  assigneeType: 'AI' | 'Human';
  executionStatus: 'NOT_STARTED' | 'RUNNING' | 'DONE' | 'ARCHIVED';
  verificationStatus: 'NONE' | 'VALIDATING' | 'PASSED' | 'FAILED';
  approvalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  latestSubmissionId?: string;
  submissionCount: number;
  createdAt: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  department?: string;
  campaign?: string;
  createdBy?: string;
}

export class Workflow {
  public id: string;
  public status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  public assignments: WorkAssignment[];
  public aggregateVersion: number;
  private domainEvents: DomainEvent[] = [];

  constructor(data: { id: string; status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'; assignments: WorkAssignment[]; aggregateVersion: number }) {
    this.id = data.id;
    this.status = data.status;
    this.assignments = data.assignments || [];
    this.aggregateVersion = data.aggregateVersion || 1;
  }

  public record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getRaisedEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearRaisedEvents(): void {
    this.domainEvents = [];
  }

  public createAssignment(params: {
    id: string;
    title: string;
    description: string;
    assignee: string;
    assigneeName: string;
    assigneeType: 'AI' | 'Human';
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    department?: string;
    campaign?: string;
    createdBy?: string;
    tenantId: string;
    actor: string;
    correlationId: string;
  }): WorkAssignment {
    const assignment: WorkAssignment = {
      id: params.id,
      title: params.title,
      description: params.description,
      assignee: params.assignee,
      assigneeName: params.assigneeName,
      assigneeType: params.assigneeType,
      executionStatus: 'NOT_STARTED',
      verificationStatus: 'NONE',
      approvalStatus: 'NONE',
      submissionCount: 0,
      createdAt: new Date().toISOString(),
      dueDate: params.dueDate,
      priority: params.priority,
      department: params.department,
      campaign: params.campaign,
      createdBy: params.createdBy
    };

    this.assignments.push(assignment);
    this.aggregateVersion++;

    const event = new AssignmentCreated(
      this.id,
      this.aggregateVersion,
      createMetadata({
        correlationId: params.correlationId,
        tenantId: params.tenantId,
        actor: params.actor,
        eventVersion: 1,
        schemaVersion: 1
      }),
      {
        title: assignment.title,
        assignee: assignment.assignee,
        assigneeType: assignment.assigneeType,
        priority: assignment.priority,
        dueDate: assignment.dueDate
      }
    );

    this.record(event);
    return assignment;
  }

  public verifyAssignment(assignmentId: string): void {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error(`WorkAssignment with ID "${assignmentId}" not found in Workflow "${this.id}"`);

    assignment.executionStatus = 'DONE';
    assignment.verificationStatus = 'PASSED';
    this.aggregateVersion++;
  }

  public completeIfReady(): void {
    const spec = new WorkflowCompletionSpecification();
    if (spec.isSatisfiedBy(this)) {
      this.status = 'COMPLETED';
      this.aggregateVersion++;
    }
  }

  public archiveAssignment(assignmentId: string): void {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error(`WorkAssignment with ID "${assignmentId}" not found`);

    // Invariant check: only allow archive draft or complete work assignments
    if (assignment.executionStatus === 'RUNNING') {
      throw new Error('Cannot archive a running work assignment. Stop execution first.');
    }

    assignment.executionStatus = 'ARCHIVED';
    this.aggregateVersion++;
  }

  public reassignAssignment(assignmentId: string, assigneeId: string, assigneeName: string, assigneeType: 'AI' | 'Human'): void {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error(`WorkAssignment with ID "${assignmentId}" not found`);

    if (this.status === 'COMPLETED' || this.status === 'ARCHIVED') {
      throw new Error('Cannot reassign assignments in a closed or archived workflow aggregate.');
    }

    if (assignment.submissionCount >= AssignmentPolicy.maxSubmissions) {
      throw new Error(`Cannot reassign assignment. Maximum submission limit (${AssignmentPolicy.maxSubmissions}) reached.`);
    }

    assignment.assignee = assigneeId;
    assignment.assigneeName = assigneeName;
    assignment.assigneeType = assigneeType;
    assignment.executionStatus = 'RUNNING'; // Automatically reset execution trigger
    this.aggregateVersion++;
  }
}

export class WorkAssignmentService {
  constructor(
    private workflowRepo: WorkflowRepository,
    private submissionStore: SubmissionStore,
    private validationService: EvidenceValidationService,
    private eventBus: any // EventBus
  ) {}

  public createAssignment(params: {
    workflowId: string;
    assignmentId: string;
    title: string;
    description: string;
    assignee: string;
    assigneeName: string;
    assigneeType: 'AI' | 'Human';
    dueDate: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    department?: string;
    campaign?: string;
    createdBy?: string;
    tenantId: string;
    actor: string;
    correlationId: string;
  }): WorkAssignment {
    let wfData = this.workflowRepo.getById(params.workflowId);
    let workflow: Workflow;

    if (!wfData) {
      workflow = new Workflow({
        id: params.workflowId,
        status: 'ACTIVE',
        assignments: [],
        aggregateVersion: 1
      });
    } else {
      workflow = new Workflow(wfData);
    }

    const assignment = workflow.createAssignment({
      ...params,
      id: params.assignmentId
    });
    this.workflowRepo.save(workflow);

    // Publish event
    workflow.getRaisedEvents().forEach(event => {
      this.eventBus.publish(event);
    });

    return assignment;
  }

  public reassignAssignment(params: {
    workflowId: string;
    assignmentId: string;
    assigneeId: string;
    assigneeName: string;
    assigneeType: 'AI' | 'Human';
    tenantId: string;
    actor: string;
    correlationId: string;
  }): void {
    const wfData = this.workflowRepo.getById(params.workflowId);
    if (!wfData) throw new Error('Workflow not found');

    const workflow = new Workflow(wfData);
    workflow.reassignAssignment(params.assignmentId, params.assigneeId, params.assigneeName, params.assigneeType);
    
    this.workflowRepo.save(workflow);
  }

  public archiveAssignment(workflowId: string, assignmentId: string): void {
    const wfData = this.workflowRepo.getById(workflowId);
    if (!wfData) throw new Error('Workflow not found');

    const workflow = new Workflow(wfData);
    workflow.archiveAssignment(assignmentId);
    
    this.workflowRepo.save(workflow);
  }

  public async submitSubmission(params: {
    workflowId: string;
    assignmentId: string;
    submittedBy: string;
    reportContent: string;
    evidence: TaskEvidence[];
    tenantId: string;
    actor: string;
    correlationId: string;
  }): Promise<void> {
    const wfData = this.workflowRepo.getById(params.workflowId);
    if (!wfData) throw new Error('Workflow not found');

    const workflow = new Workflow(wfData);
    const assignment = workflow.assignments.find(a => a.id === params.assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    // 1. Enforce max submission policy check
    if (assignment.submissionCount >= AssignmentPolicy.maxSubmissions) {
      throw new Error(`Submission rejected. Assignment has exceeded the policy limit of ${AssignmentPolicy.maxSubmissions} submissions.`);
    }

    const submissionId = `sub-${Math.random().toString(36).substring(2, 9)}`;
    const submission: SubmissionData = {
      submissionId,
      assignmentId: params.assignmentId,
      workflowId: params.workflowId,
      submittedBy: params.submittedBy,
      submittedAt: new Date().toISOString(),
      reportContent: params.reportContent,
      evidencePackage: params.evidence
    };

    // Save submission
    this.submissionStore.append(submission);

    // Update aggregate metrics cache
    assignment.latestSubmissionId = submissionId;
    assignment.submissionCount++;
    assignment.executionStatus = 'DONE';
    assignment.verificationStatus = 'VALIDATING';
    
    workflow.aggregateVersion++;

    const reportedMeta = createMetadata({
      correlationId: params.correlationId,
      tenantId: params.tenantId,
      actor: params.actor,
      eventVersion: 1,
      schemaVersion: 1
    });

    const reportedEvent = new AssignmentReported(
      workflow.id,
      workflow.aggregateVersion,
      reportedMeta,
      {
        assignmentId: assignment.id,
        reportContent: params.reportContent,
        latestSubmissionId: submissionId
      }
    );
    workflow.record(reportedEvent);

    // Save and publish reported event
    this.workflowRepo.save(workflow);
    this.eventBus.publish(reportedEvent);

    // 2. Validate Evidence
    const valResult = this.validationService.validate(params.assignmentId, params.evidence);

    // Log VerificationRecord
    const recordId = `rec-${Math.random().toString(36).substring(2, 9)}`;
    const verificationRec: VerificationRecord = {
      recordId,
      submissionId,
      assignmentId: params.assignmentId,
      status: (valResult.status === 'PASS' || valResult.status === 'PASS_WITH_WARNING') ? 'PASSED' : 'FAILED',
      confidence: valResult.confidence,
      evidenceQuality: valResult.confidence > 80 ? 'HIGH' : valResult.confidence > 50 ? 'MEDIUM' : 'LOW',
      checkedAt: new Date().toISOString(),
      violations: valResult.violations
    };
    this.submissionStore.appendVerification(verificationRec);

    // Update validation details in submission
    submission.verificationResult = valResult;

    // 3. Resolve status branch
    if (valResult.status === 'PASS' || valResult.status === 'PASS_WITH_WARNING') {
      // Transition directly to verified
      workflow.verifyAssignment(assignment.id);
      
      const verifiedMeta = createMetadata({
        correlationId: params.correlationId,
        causationId: reportedMeta.eventId,
        tenantId: params.tenantId,
        actor: 'EvidenceValidationService',
        eventVersion: 1,
        schemaVersion: 1
      });

      const verifiedEvent = new AssignmentVerified(
        workflow.id,
        workflow.aggregateVersion,
        verifiedMeta,
        {
          assignmentId: assignment.id,
          verificationStatus: 'PASSED',
          confidence: valResult.confidence,
          evidenceQuality: verificationRec.evidenceQuality,
          violations: []
        }
      );
      workflow.record(verifiedEvent);

      // Check workflow completion spec
      workflow.completeIfReady();

      this.workflowRepo.save(workflow);
      this.eventBus.publish(verifiedEvent);

    } else if (valResult.status === 'MANUAL_REVIEW') {
      // Set to manual approval queue
      assignment.approvalStatus = 'PENDING';
      workflow.aggregateVersion++;

      const reqMeta = createMetadata({
        correlationId: params.correlationId,
        causationId: reportedMeta.eventId,
        tenantId: params.tenantId,
        actor: 'EvidenceValidationService',
        eventVersion: 1,
        schemaVersion: 1
      });

      const reqEvent = new ApprovalRequested(
        workflow.id,
        workflow.aggregateVersion,
        reqMeta,
        {
          assignmentId: assignment.id,
          approverRole: 'DIRECTOR',
          workflowId: workflow.id
        }
      );
      workflow.record(reqEvent);

      this.workflowRepo.save(workflow);
      this.eventBus.publish(reqEvent);

    } else {
      // Validation FAIL
      assignment.verificationStatus = 'FAILED';
      workflow.aggregateVersion++;

      const failMeta = createMetadata({
        correlationId: params.correlationId,
        causationId: reportedMeta.eventId,
        tenantId: params.tenantId,
        actor: 'EvidenceValidationService',
        eventVersion: 1,
        schemaVersion: 1
      });

      const failEvent = new AssignmentFailed(
        workflow.id,
        workflow.aggregateVersion,
        failMeta,
        {
          assignmentId: assignment.id,
          reason: valResult.violations.join('; '),
          violations: valResult.violations
        }
      );
      workflow.record(failEvent);

      this.workflowRepo.save(workflow);
      this.eventBus.publish(failEvent);
    }
  }

  public resolveApproval(params: {
    workflowId: string;
    assignmentId: string;
    submissionId: string;
    approved: boolean;
    approverRole: string;
    comment?: string;
    tenantId: string;
    actor: string;
    correlationId: string;
  }): void {
    const wfData = this.workflowRepo.getById(params.workflowId);
    if (!wfData) throw new Error('Workflow not found');

    const workflow = new Workflow(wfData);
    const assignment = workflow.assignments.find(a => a.id === params.assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    // 1. Record immutable approval
    const recordId = `app-${Math.random().toString(36).substring(2, 9)}`;
    const approvalRec: ApprovalRecord = {
      recordId,
      submissionId: params.submissionId,
      assignmentId: params.assignmentId,
      status: params.approved ? 'APPROVED' : 'REJECTED',
      approverRole: params.approverRole,
      comment: params.comment,
      occurredAt: new Date().toISOString()
    };
    this.submissionStore.appendApproval(approvalRec);

    // 2. Update projection cache
    assignment.approvalStatus = params.approved ? 'APPROVED' : 'REJECTED';
    
    if (params.approved) {
      assignment.verificationStatus = 'PASSED';
      workflow.verifyAssignment(assignment.id);

      const verifiedMeta = createMetadata({
        correlationId: params.correlationId,
        tenantId: params.tenantId,
        actor: params.actor,
        eventVersion: 1,
        schemaVersion: 1
      });

      const verifiedEvent = new AssignmentVerified(
        workflow.id,
        workflow.aggregateVersion,
        verifiedMeta,
        {
          assignmentId: assignment.id,
          verificationStatus: 'PASSED',
          confidence: 100, // Manual approval overrides machine validation confidence
          evidenceQuality: 'HIGH',
          violations: []
        }
      );
      workflow.record(verifiedEvent);

      // Check if workflow can complete
      workflow.completeIfReady();
    } else {
      assignment.verificationStatus = 'FAILED';
    }

    workflow.aggregateVersion++;

    const appCompletedMeta = createMetadata({
      correlationId: params.correlationId,
      tenantId: params.tenantId,
      actor: params.actor,
      eventVersion: 1,
      schemaVersion: 1
    });

    const appCompletedEvent = new ApprovalCompleted(
      workflow.id,
      workflow.aggregateVersion,
      appCompletedMeta,
      {
        assignmentId: assignment.id,
        approved: params.approved,
        approverRole: params.approverRole,
        comment: params.comment
      }
    );
    workflow.record(appCompletedEvent);

    this.workflowRepo.save(workflow);
    this.eventBus.publish(appCompletedEvent);
  }
}
