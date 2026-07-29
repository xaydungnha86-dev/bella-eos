/**
 * Insufficient Opportunities Detector
 * Detects when reasoning failed due to weak or limited opportunity set
 */

import { SimulationGraph } from '@/types/executive-recommendation';
import { ReasoningContext, Symptom, FailureReason } from '@/types/adaptive-dag';

export class InsufficientOpportunitiesDetector {
  detect(simulation: SimulationGraph, context: ReasoningContext): Symptom {
    const symptoms: string[] = [];
    let score = 0;
    
    const opportunities = context.getOpportunities();
    const bestStrategy = context.getBestStrategy();
    
    // Symptom 1: Best strategy STILL below goal (70% weight)
    if (bestStrategy) {
      const gap = (context.goal.target - bestStrategy.expectedRevenue) / context.goal.target;
      if (gap > 0.2) {
        symptoms.push(`Best strategy ${Math.round((1 - gap) * 100)}% of goal → opportunity set weak`);
        score += 0.7;
      }
    }
    
    // Symptom 2: Few high-impact opportunities (60% weight)
    const highImpact = opportunities.filter(o => 
      o.potential > context.goal.target * 0.3
    );
    
    if (highImpact.length < 3) {
      symptoms.push(`Only ${highImpact.length} high-impact options (need 3+)`);
      score += 0.6;
    }
    
    // Symptom 3: Opportunities clustered in one category (50% weight)
    const categories = [...new Set(opportunities.map(o => o.category))];
    if (categories.length < 3) {
      symptoms.push(`Only ${categories.length} categories → lack diversity`);
      score += 0.5;
    }
    
    // Symptom 4: Total opportunity count low (40% weight)
    if (opportunities.length < 10) {
      symptoms.push(`Only ${opportunities.length} opportunities generated (need 10+)`);
      score += 0.4;
    }
    
    // Symptom 5: Average ROI too low (55% weight)
    const avgROI = opportunities.reduce((sum, o) => sum + o.roi, 0) / 
                   Math.max(opportunities.length, 1);
    
    if (avgROI < 500) {
      symptoms.push(`Average ROI ${Math.round(avgROI)}% too low (need 500%+)`);
      score += 0.55;
    }
    
    // Symptom 6: Confidence borderline (30% weight)
    if (simulation.probabilitySuccess >= 0.70 && simulation.probabilitySuccess < 0.80) {
      symptoms.push(`Confidence ${Math.round(simulation.probabilitySuccess * 100)}% borderline → expand opportunities for safety margin`);
      score += 0.3;
    }
    
    return {
      type: FailureReason.INSUFFICIENT_OPPORTUNITIES,
      symptoms,
      score: Math.min(score, 1.0),
      retryNode: 'opportunity'
    };
  }
}
