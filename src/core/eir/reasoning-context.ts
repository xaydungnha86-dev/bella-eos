/**
 * Reasoning Context - State Management for EIR
 * Tracks graph execution state and node freshness
 */

import { ReasoningContext as IReasoningContext, FailureRecord, NodeType } from '@/types/adaptive-dag';
import { ClarifiedGoal, DiagnosisGraph, ConstraintGraph, Strategy } from '@/types/executive-recommendation';

export class ReasoningContext implements IReasoningContext {
  goal: ClarifiedGoal;
  diagnosis: DiagnosisGraph | null = null;
  constraints: ConstraintGraph | null = null;
  opportunities: any[] = [];
  strategies: Strategy[] = [];
  failures: FailureRecord[] = [];
  chosenStrategy: Strategy | null = null;
  
  diagnosisAge: number = 0;
  constraintAge: number = 0;
  opportunityAge: number = 0;
  
  constructor(goal: ClarifiedGoal) {
    this.goal = goal;
  }
  
  // Getters
  getAllStrategies(): Strategy[] {
    return this.strategies;
  }
  
  getBestStrategy(): Strategy {
    return this.chosenStrategy || this.strategies.sort((a, b) => b.expectedRevenue - a.expectedRevenue)[0];
  }
  
  getOpportunities(): any[] {
    return this.opportunities;
  }
  
  getDiagnosis(): DiagnosisGraph {
    if (!this.diagnosis) throw new Error('Diagnosis not yet executed');
    return this.diagnosis;
  }
  
  getConstraints(): ConstraintGraph {
    if (!this.constraints) throw new Error('Constraints not yet executed');
    return this.constraints;
  }
  
  getDiagnosisAge(): number {
    return this.diagnosisAge;
  }
  
  getNodeRetryCount(node: NodeType): number {
    return this.failures.filter(f => f.analysis.recommendedRetryNode === node).length;
  }
  
  getFailurePattern(): string[] {
    return this.failures.map(f => f.analysis.reason);
  }
  
  // Mutators
  markDiagnosisRefreshed(): void {
    this.diagnosisAge = 0;
  }
  
  incrementNodeAges(): void {
    this.diagnosisAge++;
    this.constraintAge++;
    this.opportunityAge++;
  }
  
  recordFailure(failure: FailureRecord): void {
    this.failures.push(failure);
  }
  
  addStrategy(strategy: Strategy): void {
    this.strategies.push(strategy);
  }
  
  setDiagnosis(diagnosis: DiagnosisGraph): void {
    this.diagnosis = diagnosis;
    this.diagnosisAge = 0;
  }
  
  setConstraints(constraints: ConstraintGraph): void {
    this.constraints = constraints;
    this.constraintAge = 0;
  }
  
  setOpportunities(opportunities: any[]): void {
    this.opportunities = opportunities;
    this.opportunityAge = 0;
  }
}
