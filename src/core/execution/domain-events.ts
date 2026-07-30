/**
 * BELLA EOS PLATFORM CORE: Domain Events Definition
 * Part of Task Governance Bounded Context v5.4
 */

export interface EventMetadata {
  readonly eventId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly tenantId: string;
  readonly actor: string;
  readonly traceId?: string;
  readonly occurredAt: string;
  readonly eventVersion: number;  // Semantic version of business event
  readonly schemaVersion: number; // Serialization schema version
}

export interface DomainEvent<T = any> {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly aggregateVersion: number;
  readonly metadata: EventMetadata;
  readonly payload: Readonly<T>;
}

// Concrete helper function to generate standard EventMetadata
export function createMetadata(params: {
  correlationId: string;
  causationId?: string;
  tenantId: string;
  actor: string;
  traceId?: string;
  eventVersion?: number;
  schemaVersion?: number;
}): EventMetadata {
  return {
    eventId: `evt-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`,
    correlationId: params.correlationId,
    causationId: params.causationId,
    tenantId: params.tenantId || 'tenant-default-system',
    actor: params.actor || 'SYSTEM',
    traceId: params.traceId || `trace-${Math.random().toString(36).substring(2, 9)}`,
    occurredAt: new Date().toISOString(),
    eventVersion: params.eventVersion ?? 1,
    schemaVersion: params.schemaVersion ?? 1
  };
}

// 1. AssignmentCreated Event
export class AssignmentCreated implements DomainEvent<{ title: string; assignee: string; assigneeType: 'AI' | 'Human'; priority: string; dueDate: string }> {
  readonly eventType = 'AssignmentCreated';
  readonly aggregateType = 'Workflow';
  
  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ title: string; assignee: string; assigneeType: 'AI' | 'Human'; priority: string; dueDate: string }>
  ) {}
}

// 2. AssignmentReported Event
export class AssignmentReported implements DomainEvent<{ assignmentId: string; reportContent: any; latestSubmissionId: string }> {
  readonly eventType = 'AssignmentReported';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ assignmentId: string; reportContent: any; latestSubmissionId: string }>
  ) {}
}

// 3. AssignmentVerified Event
export class AssignmentVerified implements DomainEvent<{ assignmentId: string; verificationStatus: 'PASSED' | 'FAILED'; confidence: number; evidenceQuality: string; violations: string[] }> {
  readonly eventType = 'AssignmentVerified';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ assignmentId: string; verificationStatus: 'PASSED' | 'FAILED'; confidence: number; evidenceQuality: string; violations: string[] }>
  ) {}
}

// 4. AssignmentFailed Event
export class AssignmentFailed implements DomainEvent<{ assignmentId: string; reason: string; violations: string[] }> {
  readonly eventType = 'AssignmentFailed';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ assignmentId: string; reason: string; violations: string[] }>
  ) {}
}

// 5. WorkflowCompleted Event
export class WorkflowCompleted implements DomainEvent<{ completedAt: string }> {
  readonly eventType = 'WorkflowCompleted';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ completedAt: string }>
  ) {}
}

// 6. WorkflowFailed Event
export class WorkflowFailed implements DomainEvent<{ failedAt: string; reason: string }> {
  readonly eventType = 'WorkflowFailed';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ failedAt: string; reason: string }>
  ) {}
}

// 7. ApprovalRequested Event
export class ApprovalRequested implements DomainEvent<{ assignmentId: string; approverRole: string; workflowId: string }> {
  readonly eventType = 'ApprovalRequested';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ assignmentId: string; approverRole: string; workflowId: string }>
  ) {}
}

// 8. ApprovalCompleted Event
export class ApprovalCompleted implements DomainEvent<{ assignmentId: string; approved: boolean; approverRole: string; comment?: string }> {
  readonly eventType = 'ApprovalCompleted';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ assignmentId: string; approved: boolean; approverRole: string; comment?: string }>
  ) {}
}

// 9. EvidenceValidated Event
export class EvidenceValidated implements DomainEvent<{ assignmentId: string; status: 'PASS' | 'PASS_WITH_WARNING' | 'MANUAL_REVIEW' | 'FAIL'; confidence: number; violations: string[] }> {
  readonly eventType = 'EvidenceValidated';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ assignmentId: string; status: 'PASS' | 'PASS_WITH_WARNING' | 'MANUAL_REVIEW' | 'FAIL'; confidence: number; violations: string[] }>
  ) {}
}

// 10. OutcomeCalculated Event
export class OutcomeCalculated implements DomainEvent<{ workflowId: string; outcomeContractId: string; absoluteVariance: number; relativeImprovementPercent: number; isTargetAchieved: boolean }> {
  readonly eventType = 'OutcomeCalculated';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ workflowId: string; outcomeContractId: string; absoluteVariance: number; relativeImprovementPercent: number; isTargetAchieved: boolean }>
  ) {}
}

// 11. LedgerRecorded Event
export class LedgerRecorded implements DomainEvent<{ pilotId: string; outcomeCalculatedId: string; status: string }> {
  readonly eventType = 'LedgerRecorded';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ pilotId: string; outcomeCalculatedId: string; status: string }>
  ) {}
}

// 12. MeasurementDue Event
export class MeasurementDue implements DomainEvent<{ workflowId: string; outcomeContractId: string; observationWindowId: string }> {
  readonly eventType = 'MeasurementDue';
  readonly aggregateType = 'Workflow';

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly metadata: EventMetadata,
    readonly payload: Readonly<{ workflowId: string; outcomeContractId: string; observationWindowId: string }>
  ) {}
}

