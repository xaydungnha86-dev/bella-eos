/**
 * BELLA EOS ERL: Drift Detection Service
 * Specification: ERL Diagnostics Engine
 * 
 * Mission: Monitor historical indices to flag Accuracy, Retrieval, and Knowledge drift.
 */

import { IDriftReport } from '@/types/erl';

export class DriftDetectionService {
  private static instance: DriftDetectionService;

  private constructor() {}

  public static getInstance(): DriftDetectionService {
    if (!DriftDetectionService.instance) {
      DriftDetectionService.instance = new DriftDetectionService();
    }
    return DriftDetectionService.instance;
  }

  /**
   * Evaluates current metrics against baseline numbers to identify drift trends.
   */
  public analyzeDrift(
    currentAccuracy: number,
    baselineAccuracy: number,
    currentRecall: number,
    baselineRecall: number
  ): IDriftReport {
    const accuracyDelta = currentAccuracy - baselineAccuracy;
    const retrievalDelta = currentRecall - baselineRecall;

    const accuracyDriftDetected = accuracyDelta < -0.05; // Accuracy drop > 5%
    const retrievalDriftDetected = retrievalDelta < -0.10; // Recall drop > 10%

    // Knowledge drift is flagged if retrieval drops significantly or if accuracy diverges
    const knowledgeDriftDetected = accuracyDriftDetected || retrievalDriftDetected;

    return {
      timestamp: new Date().toISOString(),
      accuracyDriftDetected,
      retrievalDriftDetected,
      knowledgeDriftDetected,
      accuracyDelta: Math.round(accuracyDelta * 100) / 100,
      retrievalDelta: Math.round(retrievalDelta * 100) / 100
    };
  }
}
