/**
 * Missed Constraint Detector
 * Detects when reasoning failed due to missing or incomplete constraints
 */

import { SimulationGraph } from '@/types/executive-recommendation';
import { ReasoningContext, Symptom, FailureReason } from '@/types/adaptive-dag';

export class MissedConstraintDetector {
  detect(simulation: SimulationGraph, context: ReasoningContext): Symptom {
    const symptoms: string[] = [];
    let score = 0;
    
    const strategy = simulation.strategy;
    const constraints = context.getConstraints();
    
    // Symptom 1: Strategy violates implicit constraint (90% weight)
    const budgetLimit = parseFloat(constraints.budget.limit);
    if (strategy.budget > budgetLimit) {
      symptoms.push(`Budget ${strategy.budget}M exceeds ${budgetLimit}M limit`);
      score += 0.9;
    }
    
    // Check workforce constraint (if it exists)
    const workforceLimit = this.parseWorkforceLimit(constraints.workforce.limit);
    // Estimate workforce needed (rough calculation: 1% per 100M revenue)
    const estimatedWorkforce = (strategy.expectedRevenue / 100) * 1;
    if (estimatedWorkforce > workforceLimit) {
      symptoms.push(`Estimated workforce ${estimatedWorkforce.toFixed(1)}% exceeds ${workforceLimit}% limit`);
      score += 0.9;
    }
    
    // Symptom 2: Simulation reveals hidden bottleneck (90% weight)
    if (simulation.failureReason) {
      const lowerReason = simulation.failureReason.toLowerCase();
      if (lowerReason.includes('capacity') || 
          lowerReason.includes('workforce')) {
        symptoms.push('Capacity bottleneck revealed in simulation');
        score += 0.9;
      }
      
      if (lowerReason.includes('timeline') || 
          lowerReason.includes('time')) {
        symptoms.push('Timeline infeasible → dependency constraint missed');
        score += 0.9;
      }
      
      if (lowerReason.includes('policy') || 
          lowerReason.includes('compliance')) {
        symptoms.push('Policy violation → compliance constraint missed');
        score += 0.7;
      }
    }
    
    // Symptom 3: Constraint count very low (50% weight)
    const constraintCount = Object.keys(constraints).filter(k => {
      const c = constraints[k as keyof typeof constraints];
      return c && typeof c === 'object' && 'status' in c;
    }).length;
    
    if (constraintCount < 4) {
      symptoms.push(`Only ${constraintCount} constraints checked → likely incomplete`);
      score += 0.5;
    }
    
    // Symptom 4: Multiple initiatives but no capacity check (60% weight)
    if (strategy.initiatives.length >= 4 && constraints.workforce.status === 'acceptable') {
      symptoms.push(`${strategy.initiatives.length} initiatives but workforce marked 'acceptable' → capacity risk`);
      score += 0.6;
    }
    
    return {
      type: FailureReason.MISSED_CONSTRAINT,
      symptoms,
      score: Math.min(score, 1.0),
      retryNode: 'constraint'
    };
  }
  
  private parseWorkforceLimit(limit: string): number {
    const match = limit.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 100;
  }
}
