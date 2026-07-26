/**
 * BELLA EOS ERL: Enterprise Reliability Layer Orchestrator
 * Specification: ERL Orchestrator Spec
 * 
 * Mission: Main coordinator binding the 5 ERL engines together:
 * Evaluation ➔ Diagnostics ➔ Governance ➔ Observability ➔ Improvement.
 */

import { ICognitiveSession } from '@/types/cognitive-session';
import { IEvaluationResult, IAdaptivePolicyResult, IReleaseGateResult, ICanaryRollout, IReliabilityIncident } from '@/types/erl';
import { OnlineEvaluationService } from './evaluation/online-evaluation-service';
import { DriftDetectionService } from './diagnostics/drift-detection-service';
import { TrendAndForecastEngine } from './diagnostics/trend-and-forecast-engine';
import { ReliabilitySlaManager } from './governance/reliability-sla-manager';
import { ReleaseGateService } from './governance/release-gate-service';
import { AdaptiveReliabilityPolicyService } from './governance/adaptive-reliability-policy-service';
import { CanaryDeploymentCoordinator } from './governance/canary-deployment-coordinator';
import { ReliabilityDashboardService } from './observability/reliability-dashboard-service';
import { ReliabilityTimeline } from './observability/reliability-timeline';
import { AutoImprovementRecommender } from './improvement/auto-improvement-recommender';
import { ReliabilityIncidentManager } from './improvement/reliability-incident-manager';

export class ErlOrchestrator {
  private static instance: ErlOrchestrator;

  private constructor() {}

  public static getInstance(): ErlOrchestrator {
    if (!ErlOrchestrator.instance) {
      ErlOrchestrator.instance = new ErlOrchestrator();
    }
    return ErlOrchestrator.instance;
  }

  /**
   * Evaluates a completed cognitive session through the entire ERL pipeline.
   */
  public evaluateSession(session: ICognitiveSession, capability: string = 'Strategic Planning'): {
    evaluation: IEvaluationResult | null;
    slaViolated: boolean;
    policiesTriggered: IAdaptivePolicyResult[];
  } {
    // 1. Run Online Evaluation
    const evalResult = OnlineEvaluationService.getInstance().sampleAndEvaluate(session);
    if (!evalResult) {
      return { evaluation: null, slaViolated: false, policiesTriggered: [] };
    }

    // 2. Log ERI Score to Trend Engine
    TrendAndForecastEngine.getInstance().logEri(evalResult.calculatedEri);

    // 3. Validate SLA & SLO Compliance
    const slaCheck = ReliabilitySlaManager.getInstance().validateSlaAndSlo(
      capability,
      evalResult.calculatedEri,
      evalResult.latencySeconds,
      evalResult.hallucination.hallucinationRate,
      evalResult.hallucination.citationRate
    );

    if (slaCheck.slaViolated) {
      ReliabilityTimeline.getInstance().logEvent(
        'METRIC_DROP',
        `SLA violation detected for capability [${capability}]. ERI: ${evalResult.calculatedEri}, Latency: ${evalResult.latencySeconds}s.`
      );
    }

    // 4. Run Adaptive Fallback Policies
    const policiesTriggered = AdaptiveReliabilityPolicyService.getInstance().evaluateRules(
      capability,
      evalResult.calculatedEri,
      evalResult.hallucination.citationRate
    );

    policiesTriggered.forEach(p => {
      ReliabilityTimeline.getInstance().logEvent('HEALING_ACTION', `Policy [${p.policyName}] fired: ${p.actionTaken}`);
    });

    return {
      evaluation: evalResult,
      slaViolated: slaCheck.slaViolated,
      policiesTriggered
    };
  }

  /**
   * Run Drift check diagnostics manually or periodically.
   */
  public diagnoseDrift(
    currentAccuracy: number,
    baselineAccuracy: number,
    currentRecall: number,
    baselineRecall: number
  ) {
    const report = DriftDetectionService.getInstance().analyzeDrift(
      currentAccuracy,
      baselineAccuracy,
      currentRecall,
      baselineRecall
    );

    if (report.knowledgeDriftDetected) {
      ReliabilityTimeline.getInstance().logEvent(
        'METRIC_DROP',
        `⚠️ Knowledge Drift detected. Accuracy delta: ${report.accuracyDelta}, Retrieval delta: ${report.retrievalDelta}.`
      );
    }

    return report;
  }

  /**
   * Run Release gate check before deployments.
   */
  public evaluateReleaseGate(candidateEri: number, capability: string): IReleaseGateResult {
    return ReleaseGateService.getInstance().evaluateRelease(candidateEri, capability);
  }

  /**
   * Orchestrate canary release phase updates.
   */
  public advanceCanaryRelease(rolloutId: string, sampledEri: number): ICanaryRollout {
    const coordinator = CanaryDeploymentCoordinator.getInstance();
    const updated = coordinator.advanceCanary(rolloutId, sampledEri);

    if (updated.status === 'ROLLED_BACK') {
      ReliabilityTimeline.getInstance().logEvent(
        'METRIC_DROP',
        `Canary rollout [${rolloutId}] failed sample verification (ERI: ${sampledEri}). Automatically rolled back to stable version.`
      );
    } else if (updated.status === 'PROMOTED') {
      ReliabilityTimeline.getInstance().logEvent(
        'ERI_RECOVERY',
        `Canary rollout [${rolloutId}] successfully verified (ERI: ${sampledEri}). Promoted candidate to 100% traffic.`
      );
    }

    return updated;
  }

  /**
   * Report and resolve reliability incidents.
   */
  public logIncident(
    capability: string,
    severity: IReliabilityIncident['severity'],
    description: string,
    errorMsg: string
  ): IReliabilityIncident {
    const incident = ReliabilityIncidentManager.getInstance().reportIncident(capability, severity, description, errorMsg);
    
    ReliabilityTimeline.getInstance().logEvent(
      'DEPLOYMENT_FREEZE',
      `⚠️ INCIDENT ${incident.incidentId} reported. Reliability budget penalized. Checking freeze triggers.`
    );

    return incident;
  }

  public resolveIncident(incidentId: string, actionPlan: string, durationMinutes: number) {
    const manager = ReliabilityIncidentManager.getInstance();
    const incident = manager.resolveIncident(incidentId, actionPlan, durationMinutes);

    if (incident) {
      ReliabilityTimeline.getInstance().logEvent(
        'ERI_RECOVERY',
        `Incident ${incidentId} resolved in ${durationMinutes} minutes. Releasing deployment freeze.`
      );
    }

    return incident;
  }

  /**
   * Auto improvement suggestions for a specific metric.
   */
  public getAutoImprovementSuggestions(metricName: string, actualScore: number) {
    return AutoImprovementRecommender.getInstance().evaluateRemediation(metricName, actualScore);
  }

  /**
   * Retrieves the printable console dashboard view.
   */
  public getDashboardView(): string {
    return ReliabilityDashboardService.getInstance().printConsoleDashboard();
  }
}
