/**
 * Poor Strategy Detector
 * Detects when reasoning failed due to suboptimal strategy combination
 */

import { SimulationGraph } from '@/types/executive-recommendation';
import { ReasoningContext, Symptom, FailureReason } from '@/types/adaptive-dag';

export class PoorStrategyDetector {
  detect(simulation: SimulationGraph, context: ReasoningContext): Symptom {
    const symptoms: string[] = [];
    let score = 0;
    
    const strategy = simulation.strategy;
    const opportunities = context.getOpportunities();
    
    // Symptom 1: Internal strategy conflict (80% weight)
    if (simulation.failureReason?.includes('conflict')) {
      symptoms.push('Strategy has internal conflicts → poor combination');
      score += 0.8;
    }
    
    // Symptom 2: High risk reduces value significantly (70% weight)
    const riskAdjustedValue = simulation.riskAdjustedValue || simulation.expectedValue;
    const rawValue = simulation.rawValue || strategy.expectedRevenue;
    const riskPenalty = 1 - (riskAdjustedValue / rawValue);
    
    if (riskPenalty > 0.4) {
      symptoms.push(`Risk reduces value by ${Math.round(riskPenalty * 100)}% → too aggressive`);
      score += 0.7;
    }
    
    // Symptom 3: Few alternatives explored (60% weight)
    const allStrategies = context.getAllStrategies();
    if (allStrategies.length < 3) {
      symptoms.push(`Only ${allStrategies.length} alternatives → explore more combinations`);
      score += 0.6;
    }
    
    // Symptom 4: Strategy doesn't use best opportunities (50% weight)
    if (opportunities.length > 0) {
      const topOpportunities = opportunities
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5);
      
      const usedTopOps = strategy.initiatives.filter(initiative =>
        topOpportunities.some(o => 
          initiative.toLowerCase().includes(o.name.toLowerCase().split(' ')[0])
        )
      );
      
      if (usedTopOps.length < 3) {
        symptoms.push(`Only using ${usedTopOps.length}/5 top ROI opportunities`);
        score += 0.5;
      }
    }
    
    // Symptom 5: Budget utilization too low or too high (45% weight)
    const constraints = context.getConstraints();
    const budgetLimit = parseFloat(constraints.budget.limit);
    const budgetUtilization = strategy.budget / budgetLimit;
    
    if (budgetUtilization < 0.5) {
      symptoms.push(`Budget utilization ${Math.round(budgetUtilization * 100)}% too conservative`);
      score += 0.45;
    } else if (budgetUtilization > 0.95) {
      symptoms.push(`Budget utilization ${Math.round(budgetUtilization * 100)}% too aggressive`);
      score += 0.45;
    }
    
    // Symptom 6: Strategy complexity mismatch (40% weight)
    const initiativeCount = strategy.initiatives.length;
    if (initiativeCount === 1 && context.goal.target > context.goal.baseline * 1.2) {
      symptoms.push(`Only 1 initiative for ${Math.round((context.goal.target / context.goal.baseline - 1) * 100)}% growth → too simple`);
      score += 0.4;
    } else if (initiativeCount >= 6) {
      symptoms.push(`${initiativeCount} initiatives → too complex, execution risk`);
      score += 0.4;
    }
    
    return {
      type: FailureReason.POOR_STRATEGY,
      symptoms,
      score: Math.min(score, 1.0),
      retryNode: 'strategy'
    };
  }
}
