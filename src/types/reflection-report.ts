/**
 * BELLA EOS PLATFORM CONTRACT: Reflection Report Contract (IReflectionReport v1.0)
 * Specification: v18.7 BELLA EOS ENTERPRISE REFLECTION RUNTIME (ERR)
 * 
 * Contract 36: After Action Review (AAR) Meta-Cognitive Reflection Report.
 * Dissects true underlying root causes vs external noise, validates initial assumptions,
 * and detects cognitive biases.
 */

import { IMultiDimensionalConfidence } from './multidimensional-confidence';

export interface IReflectionReport {
  reflectionId: string;
  decisionId: string;
  tenantId: string;
  trueRootCause: string;
  validatedAssumptions: string[];
  invalidAssumptions: string[];
  biasFlags: string[];
  calibratedConfidence: IMultiDimensionalConfidence;
  reflectionSummary: string;
  createdAt: string;
}
