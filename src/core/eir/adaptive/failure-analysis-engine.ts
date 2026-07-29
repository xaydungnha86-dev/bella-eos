/**
 * Failure Analysis Engine
 * Aggregates symptom detectors to determine retry strategy
 */

import { SimulationGraph } from '@/types/executive-recommendation';
import { ReasoningContext, FailureAnalysis, Symptom, NodeType, FailureReason } from '@/types/adaptive-dag';
import { WrongDiagnosisDetector } from './symptom-detectors/wrong-diagnosis-detector';
import { MissedConstraintDetector } from './symptom-detectors/missed-constraint-detector';
import { InsufficientOpportunitiesDetector } from './symptom-detectors/insufficient-opportunities-detector';
import { PoorStrategyDetector } from './symptom-detectors/poor-strategy-detector';

export class FailureAnalysisEngine {
  private diagnosisDetector: WrongDiagnosisDetector;
  private constraintDetector: MissedConstraintDetector;
  private opportunityDetector: InsufficientOpportunitiesDetector;
  private strategyDetector: PoorStrategyDetector;
  
  constructor() {
    this.diagnosisDetector = new WrongDiagnosisDetector();
    this.constraintDetector = new MissedConstraintDetector();
    this.opportunityDetector = new InsufficientOpportunitiesDetector();
    this.strategyDetector = new PoorStrategyDetector();
  }
  
  /**
   * Analyze simulation failure to determine root cause
   * Returns recommended retry node based on symptom scores
   */
  async analyzeFailure(
    simulation: SimulationGraph,
    context: ReasoningContext
  ): Promise<FailureAnalysis> {
    
    console.log('\n🔍 [Failure Analysis] Analyzing simulation failure...');
    
    // Run all symptom detectors in parallel
    const symptoms = await Promise.all([
      Promise.resolve(this.diagnosisDetector.detect(simulation, context)),
      Promise.resolve(this.constraintDetector.detect(simulation, context)),
      Promise.resolve(this.opportunityDetector.detect(simulation, context)),
      Promise.resolve(this.strategyDetector.detect(simulation, context))
    ]);
    // Rank by confidence score, but prioritize MISSED_CONSTRAINT to update constraint status first
    const ranked = symptoms
      .filter(s => s.score > 0.1) // Filter out very low scores
      .sort((a, b) => {
        const scoreA = a.type === FailureReason.MISSED_CONSTRAINT ? a.score + 0.3 : a.score;
        const scoreB = b.type === FailureReason.MISSED_CONSTRAINT ? b.score + 0.3 : b.score;
        return scoreB - scoreA;
      });
    
    if (ranked.length === 0) {
      // Fallback: default to strategy retry
      console.log('[Failure Analysis] No clear symptoms, defaulting to strategy retry');
      return {
        reason: 'strategy' as any,
        evidence: ['No clear failure pattern detected'],
        recommendedRetryNode: 'strategy',
        confidence: 0.3,
        secondaryOptions: []
      };
    }
    
    const winner = ranked[0];
    
    // Build failure analysis
    const analysis: FailureAnalysis = {
      reason: winner.type,
      evidence: winner.symptoms,
      recommendedRetryNode: winner.retryNode,
      confidence: winner.score,
      secondaryOptions: ranked.slice(1, 3).map(s => ({
        node: s.retryNode,
        confidence: s.score
      }))
    };
    
    // Log analysis
    console.log('[Failure Analysis] ✓ Analysis complete:');
    console.log('   Primary issue:', this.formatReason(winner.type));
    console.log('   Confidence:', `${Math.round(winner.score * 100)}%`);
    console.log('   Recommended retry:', winner.retryNode.toUpperCase());
    console.log('   Evidence:');
    winner.symptoms.forEach(s => console.log(`     - ${s}`));
    
    if (analysis.secondaryOptions.length > 0) {
      console.log('   Secondary options:');
      analysis.secondaryOptions.forEach(opt => 
        console.log(`     - ${opt.node} (${Math.round(opt.confidence * 100)}%)`)
      );
    }
    
    return analysis;
  }
  
  /**
   * Check if retry should be attempted
   * Prevents infinite loops on same node
   */
  shouldRetry(node: NodeType, context: ReasoningContext, maxRetries: number = 2): boolean {
    const retryCount = context.getNodeRetryCount(node);
    
    if (retryCount >= maxRetries) {
      console.log(`[Failure Analysis] ⚠️ Node '${node}' already retried ${retryCount} times, skipping`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Get failure pattern summary
   */
  getFailurePattern(context: ReasoningContext): string {
    const pattern = context.getFailurePattern();
    
    if (pattern.length === 0) return 'No failures yet';
    
    const counts = pattern.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([reason, count]) => `${this.formatReason(reason as any)}: ${count}x`)
      .join(', ');
  }
  
  private formatReason(reason: string): string {
    const map: Record<string, string> = {
      'diagnosis': 'Wrong Diagnosis',
      'constraint': 'Missed Constraint',
      'opportunity': 'Insufficient Opportunities',
      'strategy': 'Poor Strategy',
      'simulation': 'Simulation Error'
    };
    
    return map[reason] || reason;
  }
}
