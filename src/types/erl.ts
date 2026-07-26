/**
 * BELLA EOS PLATFORM CONTRACT: Enterprise Reliability Layer Contracts (ERL v1.0)
 * Specification: ERL Architecture Freeze Spec
 * 
 * Defines all standard metrics, logs, policies, dashboards, sandbox experiment,
 * incident management, and auto-remediations for ERL.
 */

export interface IGoldenCase {
  caseId: string;
  userObjective: string;
  expectedIntent: string;
  expectedReferenceDocIds: string[];
  referenceAnswer: string;
}

export interface IRetrievalMetrics {
  retrieverPrecision: number;
  retrieverRecall: number;
  contextPrecision: number;
  contextRecall: number;
}

export interface IHallucinationMetrics {
  hallucinationRate: number; // 0.0 to 1.0
  citationRate: number;       // 0.0 to 1.0
  unsupportedClaimsCount: number;
}

export interface IConfidenceCalibration {
  predictedConfidence: number; // 0.0 to 1.0
  actualAccuracy: number;       // 0.0 to 1.0
  calibrationError: number;     // Expected Calibration Error (ECE) delta
  overConfidenceAlert: boolean;
}

export interface IPromptVersion {
  versionId: string;
  promptText: string;
  accuracyRate: number;
  latencySeconds: number;
  createdAt: string;
}

export interface IReliabilityExperiment {
  experimentId: string;
  promptVersionId: string;
  chunkSize: number;
  overlap: number;
  topK: number;
  eriScore: number;
  registeredAt: string;
}

export interface IDriftReport {
  timestamp: string;
  accuracyDriftDetected: boolean;
  retrievalDriftDetected: boolean;
  knowledgeDriftDetected: boolean;
  accuracyDelta: number;
  retrievalDelta: number;
}

export interface IErlRootCause {
  incidentId?: string;
  knowledgeAttribution: number;  // percentage (0-100)
  promptAttribution: number;
  retrieverAttribution: number;
  policyAttribution: number;
  reasoningAttribution: number;
  toolAttribution: number;
  runtimeAttribution: number;
  humanAttribution: number;
  apiAttribution: number;
}

export interface IFailurePattern {
  patternId: string;
  failedObjectiveSubString: string;
  dominantRootCause: string;
  failureCount: number;
  recommendedFixId?: string;
  resolvedCount: number;
}

export interface IReliabilitySla {
  capability: string;
  targetEri: number;
  maxAllowedLatencySeconds: number;
  maxAllowedHallucinationRate: number;
  minCitationRate: number;
}

export interface ISloSli {
  sliName: string;
  sliValue: number;
  sloThreshold: number;
  comparison: '>=' | '<=';
  isCompliant: boolean;
}

export interface IReliabilityBudget {
  capability: string;
  errorBudgetTotal: number; // e.g. 1.0 - 0.99 = 0.01 (1%)
  errorBudgetRemaining: number;
  burnRate: number;
  deploymentFrozen: boolean;
}

export interface ICanaryRollout {
  rolloutId: string;
  targetVersion: string;
  activePercent: number; // e.g., 5, 50, 100
  eriSampleScore: number;
  status: 'ROLLING_OUT' | 'PROMOTED' | 'ROLLED_BACK';
  logs: string[];
}

export interface IAdaptivePolicyResult {
  policyName: string;
  triggerCondition: string;
  actionTaken: string;
  timestamp: string;
}

export interface IEriScore {
  overallEri: number; // 0-100 weighted index
  accuracyWeight: number;
  citationWeight: number;
  hallucinationWeight: number;
  latencyWeight: number;
  toolSuccessWeight: number;
  consistencyWeight: number;
}

export interface IReliabilityTrend {
  last7DaysEri: number[];
  last30DaysEri: number[];
  lastQuarterEri: number[];
}

export interface IReliabilityForecast {
  daysToSlaViolation: number; // predicted number of days before ERI falls below SLA target
  predictedEriIn14Days: number;
  forecastConfidence: number; // 0.0 to 1.0
  recommendation: string;
}

export interface IReliabilityIncident {
  incidentId: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  capability: string;
  rootCauseAttribution: IErlRootCause;
  description: string;
  durationMinutes: number;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  recoveryTimeline: string[];
  actionPlan: string;
  createdAt: string;
}

export interface IReliabilityTimelineEvent {
  timestamp: string;
  type: 'METRIC_DROP' | 'HEALING_ACTION' | 'ERI_RECOVERY' | 'DEPLOYMENT_FREEZE' | 'DEPLOYMENT_THAW';
  description: string;
}

export interface IExplainabilityScore {
  overallScore: number; // 0-100
  citationDensity: number; // 0-100
  evidenceQuality: number; // 0-100
  traceability: number; // 0-100
  decisionJournalLogged: boolean;
}

export interface IAiSafetyMetrics {
  unsafeOutputsCount: number;
  promptInjectionsCount: number;
  piiLeaksCount: number;
  policyViolationsCount: number;
}

export interface IParetoFrontierNode {
  selectedModel: string;
  estimatedCostVnd: number;
  latencySeconds: number;
  reason: string;
}

export interface IRemediationProposal {
  proposalId: string;
  targetMetric: string;
  issueDetected: string;
  suggestedAction: string;
  suggestedChunkSize?: number;
  suggestedOverlap?: number;
  suggestedTopK?: number;
  suggestedPromptConstraint?: string;
  applied: boolean;
}

export interface IReliabilityKnowledgeEntry {
  kbId: string;
  category: 'RECALL' | 'PRECISION' | 'LATENCY' | 'SAFETY' | 'CITATION';
  patternDescription: string;
  suggestedFix: string;
  reworkPreventionsCount: number;
}

export interface IEvaluationResult {
  sessionId: string;
  objective: string;
  accuracy: number;
  latencySeconds: number;
  retrieval: IRetrievalMetrics;
  hallucination: IHallucinationMetrics;
  confidence: IConfidenceCalibration;
  explainability: IExplainabilityScore;
  safety: IAiSafetyMetrics;
  calculatedEri: number;
  timestamp: string;
}

export interface IReleaseGateResult {
  isApproved: boolean;
  threshold: number;
  reason: string;
}
