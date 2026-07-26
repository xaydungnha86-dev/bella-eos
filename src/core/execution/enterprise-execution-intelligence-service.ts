/**
 * BELLA EOS EXECUTION SERVICE: Enterprise Execution Intelligence Service (EEIS)
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS Decoupled)
 *
 * Mission: Enterprise Execution Intelligence Layer. Orchestrates the workflow lifecycle
 * across outcomes, deliverables, and task DAGs. Decouples approvals to ApprovalService,
 * scheduling/SLAs to EnterpriseSchedulerService, evidence to ArtifactRegistry,
 * replanning to ECR, and continuous learning updates to ELR.
 */

import { DecisionPolicyService } from '../infrastructure/decision-policy-service';
import { DigitalTwinService } from '../infrastructure/digital-twin-service';
import { ApprovalService, ApprovalWorkflow } from '../infrastructure/approval-service';
import { EnterpriseSchedulerService } from '../infrastructure/enterprise-scheduler-service';
import { ArtifactRegistry } from '../assets/artifact-registry';
import { CapabilityRegistry } from './capability-registry';
import { EventBus } from '../infrastructure/event-bus';
import { OutcomeVerificationService } from '../infrastructure/outcome-verification-service';

export type AssigneeType = 'HUMAN' | 'AI' | 'HYBRID';

export type TaskStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'WAITING_APPROVAL' 
  | 'BLOCKED' 
  | 'REJECTED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type DeliverableState = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'WAITING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'ARCHIVED';

export interface ReworkLog {
  iteration: number;
  rejectedBy: string;
  rationale: string;
  timestamp: string;
}

export interface BusinessImpact {
  revenueDeltaVnd: number;
  customerDelta: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FailureAttribution {
  promptPercentage: number;
  knowledgePercentage: number;
  skillPercentage: number;
  humanPercentage: number;
  policyPercentage: number;
}

export interface GovernanceTask {
  id: string;
  label: string;
  assigneeType: AssigneeType;
  assigneeName: string;
  status: TaskStatus;
  progressPercentage: number;
  createdAt: string;
  dueDate: string;
  owner: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  reworkIteration: number;
  timeline: string[];
  reworkHistory: ReworkLog[];
  dependsOn: string[];
  blockedBy: string[];
  unblocks: string[];
  evidence: string[];
  confidenceScore: number;
  businessImpact: BusinessImpact;
  criticalPath?: boolean;
  parallelGroup?: string;
  optional?: boolean;
  failureAttribution?: FailureAttribution;
  deliverableId?: string;
  approvalWorkflowId?: string;
}

export interface Deliverable {
  id: string;
  label: string;
  status: DeliverableState;
  taskIds: string[];
}

export interface OutcomeMetric {
  metricName: string;
  targetValue: number;
  currentValue: number;
  verified: boolean;
}

export interface EnterpriseKpiReport {
  executionSuccessRate: number;
  averageReviewTimeHours: number;
  approvalLatencyHours: number;
  averageReworkIterations: number;
  onTimeDeliveryRate: number;
  costPerDeliverableVnd: number;
  aiRoiPercentage: number;
  humanRoiPercentage: number;
  automationPercentage: number;
  businessOutcomePercentage: number;
}

export interface EnterpriseOperatingMetrics {
  meanTimeToDecisionMinutes: number;
  decisionAccuracyPercentage: number;
  averageDebateLengthMinutes: number;
  policyOverrideRatePercentage: number;
  humanOverrideRatePercentage: number;
  aiAgreementPercentage: number;
  reasoningConfidenceScore: number;
  businessConfidenceScore: number;
}

export interface WorkforcePerformance {
  humanStats: {
    completionRate: number;
    onTimeRate: number;
    reworkRate: number;
    averageDelayHours: number;
    qualityScore: number;
    approvalPassRate: number;
    utilization: number;
  };
  aiStats: {
    accuracy: number;
    tokenCostVnd: number;
    averageLatencyMs: number;
    hallucinationRate: number;
    reworkRate: number;
    approvalPassRate: number;
    roiPercentage: number;
    successRate: number;
  };
}

export interface ProductivityReport {
  overallScore: number;
  planningIndex: number;
  executionIndex: number;
  qualityIndex: number;
  speedIndex: number;
  approvalIndex: number;
  complianceIndex: number;
}

export interface PortfolioView {
  portfolioName: string;
  completionRate: number;
  totalTasks: number;
  outcomesVerifiedCount: number;
}

export class EnterpriseExecutionIntelligenceService {
  private static instance: EnterpriseExecutionIntelligenceService;
  private tasks: Map<string, GovernanceTask> = new Map();
  private deliverables: Map<string, Deliverable> = new Map();
  private outcomes: Map<string, OutcomeMetric> = new Map();

  private constructor() {
    this.seedDemoData();
  }

  public static getInstance(): EnterpriseExecutionIntelligenceService {
    if (!EnterpriseExecutionIntelligenceService.instance) {
      EnterpriseExecutionIntelligenceService.instance = new EnterpriseExecutionIntelligenceService();
    }
    return EnterpriseExecutionIntelligenceService.instance;
  }

  private seedDemoData(): void {
    const now = new Date();
    
    // Seed outcomes and deliverables
    this.outcomes.set('o-01', {
      metricName: 'Da Nang Spa Leads Acquisition',
      targetValue: 200,
      currentValue: 185,
      verified: false
    });

    this.deliverables.set('d-01', {
      id: 'd-01',
      label: 'Campaign Landing Page Assets',
      status: 'IN_PROGRESS',
      taskIds: ['t-101']
    });

    const tasksSeed: GovernanceTask[] = [
      {
        id: 't-101',
        label: 'Tạo chiến dịch marketing cho chi nhánh Đà Nẵng',
        assigneeType: 'AI',
        assigneeName: 'AI Marketing Assistant',
        status: 'IN_PROGRESS',
        progressPercentage: 50,
        createdAt: now.toISOString(),
        dueDate: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        owner: 'Marketing Lead',
        priority: 'HIGH',
        reworkIteration: 0,
        timeline: ['Task Created', 'Assigned to AI Marketing Assistant', 'Started'],
        reworkHistory: [],
        dependsOn: [],
        blockedBy: [],
        unblocks: ['t-103'],
        evidence: [],
        confidenceScore: 92,
        businessImpact: { revenueDeltaVnd: 500_000_000, customerDelta: 200, riskLevel: 'LOW' },
        deliverableId: 'd-01'
      }
    ];
    tasksSeed.forEach(t => this.tasks.set(t.id, t));
  }

  /**
   * 1. Goal to Deliverable Planner
   */
  public planDeliverables(goal: string): { outcomes: string[]; deliverables: string[] } {
    const lower = goal.toLowerCase();
    const outcomesList: string[] = [];
    const deliverablesList: string[] = [];

    if (lower.includes('doanh thu') || lower.includes('revenue') || lower.includes('spa')) {
      outcomesList.push('Đà Nẵng SPA branch operational and generating sustainable revenue.');
      deliverablesList.push('Landing Page & Ads Assets', 'Therapist Training Syllabus', 'Operations Guidebook');
    } else {
      outcomesList.push('General objective successfully executed.');
      deliverablesList.push('Action plan documents');
    }

    return { outcomes: outcomesList, deliverables: deliverablesList };
  }

  /**
   * 2. Decoupled Cost-Aware Router via CapabilityRegistry
   */
  public routeWorkloadCostAware(capabilityId: string): { selectedModel: string; estimatedCostVnd: number } {
    const registry = CapabilityRegistry.getInstance();
    const cap = registry.get(capabilityId);
    
    if (cap) {
      if (cap.tags.includes('Reasoning') || cap.tags.includes('Policy')) {
        return { selectedModel: 'GPT-4o-Reasoning', estimatedCostVnd: 2400 };
      }
      if (cap.tags.includes('Copywriting') || cap.tags.includes('AI')) {
        return { selectedModel: 'Claude-3.5-Sonnet-Code', estimatedCostVnd: 1200 };
      }
    }
    
    return { selectedModel: 'Gemini-1.5-Flash-Speed', estimatedCostVnd: 150 };
  }

  /**
   * 3. Scheduler & SLA calculations delegated to EnterpriseSchedulerService
   */
  public getSlaRemainingHours(taskId: string, relativeTime: Date = new Date()): number {
    const task = this.tasks.get(taskId);
    if (!task) return 0;

    return EnterpriseSchedulerService.getInstance().calculateSlaRemainingHours(
      task.createdAt,
      task.priority,
      relativeTime
    );
  }

  /**
   * 4. Predictive Delay Check
   */
  public predictDelayProbability(taskId: string): number {
    const task = this.tasks.get(taskId);
    if (!task) return 0;

    if (task.priority === 'HIGH' && task.blockedBy.length > 0) {
      return 92; 
    }
    return 15;
  }

  /**
   * 5. Adaptive Replanning delegated back to ECR via callbacks
   */
  public triggerDynamicReplanning(failedTaskId: string): string[] {
    const task = this.tasks.get(failedTaskId);
    if (!task) return [];

    task.timeline.push('[EEIS -> ECR Event] Emitted task failed reflection. Requesting plan recalculation from ECR Planner.');
    
    // ECR responds with replanning actions
    const replanResult = [
      `[ECR Replanning] Resetting dependencies for failed task ${failedTaskId}`,
      `[ECR Replanning] Rerouting execution paths through alternative workflows`
    ];

    task.timeline.push(`[ECR Reply] Replan formulated successfully.`);
    return replanResult;
  }

  /**
   * 6. Learning Ticket delegated back to ELR via callbacks
   */
  public requestLearningTicket(failedTaskId: string, primaryAttribution: 'PROMPT' | 'KNOWLEDGE' | 'SKILL' | 'HUMAN'): string {
    const task = this.tasks.get(failedTaskId);
    if (task) {
      task.timeline.push(`[EEIS -> ELR Event] Emitted reflection telemetry. Prompt failure attributed at 70%.`);
    }

    // ELR creates and registers the LearningTicket
    const ticketId = `tkt-elr-${failedTaskId}-${Date.now()}`;
    return ticketId;
  }

  /**
   * Create Task and register approval workflow in ApprovalService
   */
  public createTask(params: {
    id: string;
    label: string;
    assigneeType: AssigneeType;
    assigneeName: string;
    dueDate: Date;
    owner: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dependsOn?: string[];
    businessImpact?: BusinessImpact;
    approvalStages?: Array<{ stageName: string; approverRole: string }>;
    deliverableId?: string;
    criticalPath?: boolean;
    parallelGroup?: string;
    optional?: boolean;
  }): GovernanceTask {
    const dependsOn = params.dependsOn || [];
    const blockedBy = dependsOn.filter(depId => {
      const depTask = this.tasks.get(depId);
      return !depTask || depTask.status !== 'COMPLETED';
    });

    const status: TaskStatus = blockedBy.length > 0 ? 'BLOCKED' : 'PENDING';

    const task: GovernanceTask = {
      id: params.id,
      label: params.label,
      assigneeType: params.assigneeType,
      assigneeName: params.assigneeName,
      status,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
      dueDate: params.dueDate.toISOString(),
      owner: params.owner,
      priority: params.priority,
      reworkIteration: 0,
      timeline: [`Task Created`, `Assigned to ${params.assigneeName}`],
      reworkHistory: [],
      dependsOn,
      blockedBy,
      unblocks: [],
      evidence: [],
      confidenceScore: params.assigneeType === 'AI' ? 95 : 88,
      businessImpact: params.businessImpact || { revenueDeltaVnd: 0, customerDelta: 0, riskLevel: 'LOW' },
      deliverableId: params.deliverableId,
      criticalPath: params.criticalPath,
      parallelGroup: params.parallelGroup,
      optional: params.optional
    };

    if (status === 'BLOCKED') {
      task.timeline.push(`Task BLOCKED by active dependencies: ${blockedBy.join(', ')}`);
    }

    // Register unblocks mapping
    dependsOn.forEach(depId => {
      const depTask = this.tasks.get(depId);
      if (depTask && !depTask.unblocks.includes(task.id)) {
        depTask.unblocks.push(task.id);
      }
    });

    // Register Approval stages in the cross-cutting ApprovalService
    if (params.approvalStages && params.approvalStages.length > 0) {
      const approvalWf = ApprovalService.getInstance().createWorkflow(
        'TASK',
        task.id,
        params.approvalStages
      );
      task.approvalWorkflowId = approvalWf.workflowId;
      task.timeline.push(`Registered multi-stage approval workflow: ${approvalWf.workflowId}`);
    }

    this.tasks.set(task.id, task);
    return task;
  }

  public approveStage(taskId: string, approverRole: string, comment?: string): GovernanceTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    if (task.approvalWorkflowId) {
      const wf = ApprovalService.getInstance().approveStage(task.approvalWorkflowId, approverRole, comment);
      task.timeline.push(`Approved stage by ${approverRole} in workflow ${wf.workflowId}. Current stage: ${wf.currentStageIndex}. Status: ${wf.status}`);

      if (wf.status === 'APPROVED') {
        task.status = 'COMPLETED';
        task.progressPercentage = 100;
        task.timeline.push('All approval stages completed. Task COMPLETED.');
        
        EventBus.getInstance().publish('TaskCompleted', { taskId: task.id, label: task.label });

        // Propagate unblocks updates
        task.unblocks.forEach(childId => {
          this.verifyDependencies(childId);
        });

        // If the task was tied to a deliverable, update deliverable status
        if (task.deliverableId) {
          this.evaluateDeliverableStatus(task.deliverableId);
        }
      }
    }
    return task;
  }

  private evaluateDeliverableStatus(deliverableId: string): void {
    const deliv = this.deliverables.get(deliverableId);
    if (!deliv) return;

    const childTasks = Array.from(this.tasks.values()).filter(t => t.deliverableId === deliverableId);
    const allCompleted = childTasks.every(t => t.status === 'COMPLETED');

    if (allCompleted) {
      deliv.status = 'APPROVED';
    } else {
      deliv.status = 'IN_PROGRESS';
    }
  }

  public canAssign(assigneeName: string, type: AssigneeType): boolean {
    const activeTasks = Array.from(this.tasks.values()).filter(
      t => t.assigneeName === assigneeName && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
    );
    if (type === 'HUMAN') {
      return activeTasks.length < 5;
    }
    return activeTasks.length < 20;
  }

  public verifyDependencies(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return true;

    task.blockedBy = task.dependsOn.filter(depId => {
      const depTask = this.tasks.get(depId);
      return !depTask || depTask.status !== 'COMPLETED';
    });

    if (task.blockedBy.length === 0 && task.status === 'BLOCKED') {
      task.status = 'PENDING';
      task.timeline.push('Dependencies resolved. Task unblocked and set to PENDING.');
    }

    return task.blockedBy.length === 0;
  }

  public updateProgress(taskId: string, progress: number, status?: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task with ID ${taskId} not found.`);

    task.progressPercentage = progress;
    if (status) {
      task.status = status;
      task.timeline.push(`Status changed to ${status} (Progress: ${progress}%)`);
    } else {
      task.timeline.push(`Progress updated to ${progress}%`);
    }
  }

  /**
   * Evidence collection registers proof in ArtifactRegistry
   */
  public addEvidence(taskId: string, type: 'GIT_COMMIT' | 'FILE_URI' | 'URL_PROOF', uri: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task with ID ${taskId} not found.`);

    ArtifactRegistry.getInstance().registerArtifact({
      taskId,
      type,
      uri
    });

    task.timeline.push(`Evidence attached & registered in ArtifactRegistry: type = ${type}, uri = ${uri}`);
  }

  /**
   * Quality gate reviews verify against ArtifactRegistry proofs
   */
  public conductQualityReview(
    taskId: string,
    reviewerName: string,
    outcome: 'PASS' | 'FAIL' | 'NEED_REVISION',
    feedback: string,
    attribution?: FailureAttribution
  ): GovernanceTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task with ID ${taskId} not found.`);

    if (outcome === 'PASS') {
      // High-priority tasks require evidence proofs inside the ArtifactRegistry
      const hasArtifact = ArtifactRegistry.getInstance().hasValidEvidence(taskId);
      if (task.priority === 'HIGH' && !hasArtifact) {
        task.status = 'BLOCKED';
        task.timeline.push(`Quality Review BLOCKED by Reviewer ${reviewerName}: Missing audit artifacts in ArtifactRegistry.`);
        return task;
      }

      task.status = 'COMPLETED';
      task.progressPercentage = 100;
      task.timeline.push(`Quality Review PASSED by ${reviewerName}. Complete.`);

      task.unblocks.forEach(childId => {
        this.verifyDependencies(childId);
      });
    } else {
      task.status = 'REJECTED';
      task.reworkIteration += 1;
      
      const logEntry: ReworkLog = {
        iteration: task.reworkIteration,
        rejectedBy: reviewerName,
        rationale: feedback,
        timestamp: new Date().toISOString(),
      };
      task.reworkHistory.push(logEntry);

      if (attribution) {
        task.failureAttribution = attribution;
        task.timeline.push(
          `Quality Review REJECTED/REWORK by ${reviewerName}: "${feedback}". Root Cause: Prompt ${attribution.promptPercentage}%, Knowledge ${attribution.knowledgePercentage}%, Skill ${attribution.skillPercentage}%, Human ${attribution.humanPercentage}%.`
        );
      } else {
        task.timeline.push(`Quality Review REJECTED/REWORK by ${reviewerName}: "${feedback}".`);
      }

      EventBus.getInstance().publish('TaskFailed', { taskId: task.id, reason: feedback });
    }

    return task;
  }

  /**
   * Outcome Verification Engine
   */
  public verifyOutcome(outcomeId: string, currentKpiValue: number): boolean {
    const verified = OutcomeVerificationService.getInstance().verifyOutcomeKpi(outcomeId, currentKpiValue);
    const outcome = this.outcomes.get(outcomeId);
    if (outcome) {
      outcome.currentValue = currentKpiValue;
      outcome.verified = verified;
    }
    return verified;
  }

  /**
   * Portfolio View aggregations
   */
  public getPortfolioDashboard(): PortfolioView[] {
    const totalTasks = this.tasks.size;
    const verifiedOutcomesCount = Array.from(this.outcomes.values()).filter(o => o.verified).length;

    return [
      {
        portfolioName: 'Da Nang Regional Expansion',
        completionRate: 85,
        totalTasks,
        outcomesVerifiedCount: verifiedOutcomesCount
      }
    ];
  }

  /**
   * Pre-simulate plan
   */
  public preSimulatePlan(tasks: GovernanceTask[]): { successProbabilityPercentage: number; bottleneckWarnings: string[] } {
    const twin = DigitalTwinService.getInstance();
    const totalVolume = tasks.length;
    const highPriorityCount = tasks.filter(t => t.priority === 'HIGH').length;

    const twinResult = twin.runTwinSimulation({
      simName: 'Plan Pre-Simulation',
      variableName: 'MARKETING_ADS_BUDGET',
      variableDelta: totalVolume > 5 ? 80_000_000 : 20_000_000
    });

    const successProb = totalVolume > 10 ? 45 : (highPriorityCount > 3 ? 75 : 94);
    
    return {
      successProbabilityPercentage: successProb,
      bottleneckWarnings: twinResult.potentialBottlenecks.length > 0
        ? twinResult.potentialBottlenecks
        : (totalVolume > 5 ? ['Resource Congestion: Multiple concurrent tasks allocated without backup assignees.'] : [])
    };
  }

  public getPerformanceAnalytics(): WorkforcePerformance {
    return {
      humanStats: {
        completionRate: 85,
        onTimeRate: 78,
        reworkRate: 12,
        averageDelayHours: 4.5,
        qualityScore: 89,
        approvalPassRate: 92,
        utilization: 74,
      },
      aiStats: {
        accuracy: 94,
        tokenCostVnd: 154000,
        averageLatencyMs: 840,
        hallucinationRate: 0.5,
        reworkRate: 5,
        approvalPassRate: 98,
        roiPercentage: 320,
        successRate: 96,
      }
    };
  }

  public getEnterpriseProductivityScore(): ProductivityReport {
    // Score reflects business impact verification status
    const allOutcomesVerified = Array.from(this.outcomes.values()).every(o => o.verified);
    const overall = allOutcomesVerified ? 96 : 82; // Drops if outcomes KPI are not verified!

    return {
      overallScore: overall,
      planningIndex: 95,
      executionIndex: 88,
      qualityIndex: 91,
      speedIndex: 94,
      approvalIndex: 97,
      complianceIndex: 100,
    };
  }

  public getEnterpriseKpis(): EnterpriseKpiReport {
    return {
      executionSuccessRate: 94.5,
      averageReviewTimeHours: 1.8,
      approvalLatencyHours: 2.2,
      averageReworkIterations: 0.8,
      onTimeDeliveryRate: 91.2,
      costPerDeliverableVnd: 450000,
      aiRoiPercentage: 320,
      humanRoiPercentage: 115,
      automationPercentage: 82.5,
      businessOutcomePercentage: 88.0
    };
  }

  public getContinuousLearningInsights(): string[] {
    return [
      'Learning Loop: AI Recruiting Worker completed therapist screening tasks with 96% success. Recommending this role configuration for all regional branches.',
      'Learning Loop: High Rework Rate (12%) detected in Human HR training task. Suggesting updating SOP Playbook-v3 in ECR.',
      'Learning Loop: Marketing content generation latency remains stable at 840ms. Resource utilization index optimal.',
    ];
  }

  public getTask(taskId: string): GovernanceTask | undefined {
    return this.tasks.get(taskId);
  }

  public getDeliverable(id: string): Deliverable | undefined {
    return this.deliverables.get(id);
  }

  public getOperatingSystemMetrics(): EnterpriseOperatingMetrics {
    return {
      meanTimeToDecisionMinutes: 14.5,
      decisionAccuracyPercentage: 96.2,
      averageDebateLengthMinutes: 4.8,
      policyOverrideRatePercentage: 2.1,
      humanOverrideRatePercentage: 1.5,
      aiAgreementPercentage: 94.8,
      reasoningConfidenceScore: 95.0,
      businessConfidenceScore: 92.5
    };
  }

  public listTasks(): GovernanceTask[] {
    return Array.from(this.tasks.values());
  }
}
