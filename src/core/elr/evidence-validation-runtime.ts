/**
 * BELLA EOS ELR: Evidence Validation Runtime (Runtime 5)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Verification layer. Cross-verifies evidence metrics (e.g. Meeting Revenue 980M)
 * against ground truth ERP/DB data (e.g. ERP Revenue 978M) to compute confidence score.
 * 
 * CRITICAL RULE: If confidence < 80% (0.80), evidence CANNOT be auto-written to Knowledge.
 * It must route to Human Approval Engine (IApproval).
 */

import { IEvidence } from '@/types/evidence';
import { ExtractedMetricItem } from './information-extraction-runtime';
import { ApprovalRuntime } from '../human/approval-runtime';

export interface ValidationComparison {
  metricName: string;
  evidenceValue: number;
  groundTruthValue: number;
  deltaPercentage: number;
  matchScore: number;
}

export interface EvidenceValidationResult {
  evidenceId: string;
  confidenceScore: number;
  isValidated: boolean;
  requiresHumanApproval: boolean;
  humanApprovalRequestId?: string;
  comparisons: ValidationComparison[];
}

export class EvidenceValidationRuntime {
  private static instance: EvidenceValidationRuntime;
  private groundTruthDb: Map<string, number> = new Map();

  private constructor() {
    // Mock ERP/DB ground truth data for cross-validation
    this.groundTruthDb.set('Revenue', 978_000_000);
    this.groundTruthDb.set('Cost', 450_000_000);
    this.groundTruthDb.set('Budget', 500_000_000);
    this.groundTruthDb.set('ROAS', 4.5);
    this.groundTruthDb.set('CAC', 120_000);
    this.groundTruthDb.set('Bookings', 350);
  }

  public static getInstance(): EvidenceValidationRuntime {
    if (!EvidenceValidationRuntime.instance) {
      EvidenceValidationRuntime.instance = new EvidenceValidationRuntime();
    }
    return EvidenceValidationRuntime.instance;
  }

  public setGroundTruthMetric(metricName: string, value: number): void {
    this.groundTruthDb.set(metricName, value);
  }

  public async validate(evidence: IEvidence, metrics: ExtractedMetricItem[]): Promise<EvidenceValidationResult> {
    const comparisons: ValidationComparison[] = [];
    let totalScore = 0;
    let metricCount = 0;

    for (const item of metrics) {
      const gt = this.groundTruthDb.get(item.metricName);
      if (gt !== undefined && gt > 0) {
        const delta = Math.abs(item.numericValue - gt);
        const deltaPct = delta / gt;
        const matchScore = Math.max(0, 1 - deltaPct);
        
        comparisons.push({
          metricName: item.metricName,
          evidenceValue: item.numericValue,
          groundTruthValue: gt,
          deltaPercentage: deltaPct * 100,
          matchScore,
        });

        totalScore += matchScore;
        metricCount++;
      }
    }

    // Baseline confidence calculation
    const overallConfidence = metricCount > 0 
      ? Math.round((totalScore / metricCount) * 100) / 100
      : evidence.confidence;

    evidence.confidence = overallConfidence;

    const HUMAN_THRESHOLD = 0.80; // 80%

    if (overallConfidence < HUMAN_THRESHOLD) {
      evidence.status = 'REQUIRES_HUMAN_APPROVAL';
      const approvalReq = await ApprovalRuntime.getInstance().requestApproval({
        tenantId: evidence.metadata.tenantId || 'default-tenant',
        title: `Validation Gate: Low Confidence Evidence Approval (${(overallConfidence * 100).toFixed(0)}%)`,
        description: `Evidence ${evidence.id} (${evidence.type}) failed 80% confidence threshold. Requires manual executive verification before writing to Enterprise Knowledge.`,
        proposedAction: 'Route evidence to human approval gate',
        aiConfidenceScore: overallConfidence,
        riskLevel: 'MEDIUM',
        payload: { evidenceId: evidence.id, comparisons, confidence: overallConfidence },
        requiredRole: 'EXECUTIVE_CEO',
      });

      return {
        evidenceId: evidence.id,
        confidenceScore: overallConfidence,
        isValidated: false,
        requiresHumanApproval: true,
        humanApprovalRequestId: approvalReq.requestId,
        comparisons,
      };
    }

    evidence.status = 'VALIDATED';
    return {
      evidenceId: evidence.id,
      confidenceScore: overallConfidence,
      isValidated: true,
      requiresHumanApproval: false,
      comparisons,
    };
  }
}
