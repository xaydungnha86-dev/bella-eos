/**
 * BELLA EOS PLATFORM CONTRACT: Meta-Cognitive Session Contract (IMetaCognitiveSession v1.0)
 * Specification: v18.7 BELLA EOS ENTERPRISE REFLECTION RUNTIME (ERR / EERX)
 * 
 * Contract 40: Crown Persistent Meta-Cognitive Lifecycle Session Asset.
 * Completes the 40 Frozen Platform Contracts of Bella EOS, binding Reflection Reports,
 * Experiment Payloads, 6-Vector Confidence Calibrations, and Strategy Evolutions into permanent Enterprise IP.
 */

import { IReflectionReport } from './reflection-report';
import { IExperimentPayload } from './experiment-payload';
import { IMultiDimensionalConfidence } from './multidimensional-confidence';
import { IStrategyEvolutionNode } from './strategy-evolution-node';

export interface IMetaCognitiveSession {
  sessionId: string;
  tenantId: string;
  decisionId: string;
  reflectionReport: IReflectionReport;
  experimentPayload?: IExperimentPayload;
  calibratedConfidence: IMultiDimensionalConfidence;
  strategyEvolutions: IStrategyEvolutionNode[];
  createdAt: string;
}
