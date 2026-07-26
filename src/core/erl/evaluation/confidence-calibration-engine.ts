/**
 * BELLA EOS ERL: Confidence Calibration Engine
 * Specification: ERL Evaluation Engine
 * 
 * Mission: Compute Expected Calibration Error (ECE) and flag AI over-confidence bugs.
 */

import { IConfidenceCalibration } from '@/types/erl';

export class ConfidenceCalibrationEngine {
  private static instance: ConfidenceCalibrationEngine;

  private constructor() {}

  public static getInstance(): ConfidenceCalibrationEngine {
    if (!ConfidenceCalibrationEngine.instance) {
      ConfidenceCalibrationEngine.instance = new ConfidenceCalibrationEngine();
    }
    return ConfidenceCalibrationEngine.instance;
  }

  public calibrate(predictedConfidence: number, actualAccuracy: number): IConfidenceCalibration {
    const calibrationError = Math.abs(predictedConfidence - actualAccuracy);
    const overConfidenceAlert = (predictedConfidence > actualAccuracy) && (calibrationError > 0.15);

    return {
      predictedConfidence,
      actualAccuracy,
      calibrationError: Math.round(calibrationError * 100) / 100,
      overConfidenceAlert
    };
  }
}
