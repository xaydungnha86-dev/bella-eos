/**
 * BELLA EOS PLATFORM CORE: Domain Policies and Specifications
 * Part of Task Governance Bounded Context v5.4
 */

export interface AssignmentPolicyConfig {
  readonly maxSubmissions: number;
  readonly maxReassignments: number;
  readonly archiveAfterDays: number;
}

// Global immutable policy configuration
export const AssignmentPolicy: AssignmentPolicyConfig = Object.freeze({
  maxSubmissions: 10,
  maxReassignments: 5,
  archiveAfterDays: 90
});

export class WorkflowCompletionSpecification {
  /**
   * Evaluates if a workflow aggregate is ready to complete.
   * Business invariant: All child assignments must be in DONE executionStatus,
   * with a verificationStatus of PASSED and approvalStatus NOT equal to REJECTED.
   * If there are no assignments, the workflow is not completed automatically.
   */
  public isSatisfiedBy(workflow: { id: string; status: string; assignments: any[] }): boolean {
    if (!workflow || workflow.assignments.length === 0) {
      return false;
    }

    // Filter out logically archived assignments
    const activeAssignments = workflow.assignments.filter(a => a.executionStatus !== 'ARCHIVED');
    if (activeAssignments.length === 0) return false;

    return activeAssignments.every(a => 
      a.executionStatus === 'DONE' &&
      a.verificationStatus === 'PASSED' &&
      a.approvalStatus !== 'REJECTED'
    );
  }
}
