/**
 * BELLA EOS PLATFORM CONTRACT: Multi-Dimensional Confidence Contract (IMultiDimensionalConfidence v1.0)
 * Specification: v18.7 BELLA EOS ENTERPRISE REFLECTION RUNTIME (ERR)
 * 
 * Contract 38: 6-Vector Executive Confidence Calibration Container.
 * Explicitly breaks down confidence across Data, Reasoning, Evidence, Prediction, Simulation, and Execution.
 */

export interface IMultiDimensionalConfidence {
  dataConfidence: number;      // Verified ERP metrics (0-100%)
  reasoningConfidence: number; // Deterministic logic steps (0-100%)
  evidenceConfidence: number;  // Source document citations (0-100%)
  predictionConfidence: number;// Historical outcome accuracy (0-100%)
  simulationConfidence: number;// 12-Month scenario projection (0-100%)
  executionConfidence: number; // EWOS workforce capacity (0-100%)
  overallWeightedScore: number;// Composite weighted executive score (0-100%)
}
