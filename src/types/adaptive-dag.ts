/**
 * Adaptive DAG (v3.1) - Failure Analysis Types
 * Multi-Path Feedback Architecture
 */

import { SimulationGraph } from './executive-recommendation';

export type NodeType = 'diagnosis' | 'constraint' | 'opportunity' | 'strategy' | 'simulation';

export enum FailureReason {
  WRONG_DIAGNOSIS = 'diagnosis',
  MISSED_CONSTRAINT = 'constraint',
  INSUFFICIENT_OPPORTUNITIES = 'opportunity',
  POOR_STRATEGY = 'strategy',
  SIMULATION_ERROR = 'simulation'
}

export interface Symptom {
  type: FailureReason;
  symptoms: string[];
  score: number;
  retryNode: NodeType;
}

export interface FailureAnalysis {
  reason: FailureReason;
  evidence: string[];
  recommendedRetryNode: NodeType;
  confidence: number;
  secondaryOptions: {
    node: NodeType;
    confidence: number;
  }[];
}

export interface FailureRecord {
  iteration: number;
  strategy: any;
  simulation: SimulationGraph;
  analysis: FailureAnalysis;
}

export interface ReasoningContext {
  goal: any;
  diagnosis: any;
  constraints: any;
  opportunities: any[];
  strategies: any[];
  failures: FailureRecord[];
  
  // Node age tracking
  diagnosisAge: number;
  constraintAge: number;
  opportunityAge: number;
  
  // Helper methods
  getAllStrategies(): any[];
  getBestStrategy(): any;
  getOpportunities(): any[];
  getDiagnosis(): any;
  getConstraints(): any;
  getDiagnosisAge(): number;
  getNodeRetryCount(node: NodeType): number;
  getFailurePattern(): string[];
  
  // Mutation methods
  markDiagnosisRefreshed(): void;
  incrementNodeAges(): void;
  recordFailure(failure: FailureRecord): void;
  addStrategy(strategy: any): void;
}
