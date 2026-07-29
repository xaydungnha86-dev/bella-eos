/**
 * Wrong Diagnosis Detector
 * Detects when reasoning failed due to incorrect root cause analysis
 */

import { SimulationGraph } from '@/types/executive-recommendation';
import { ReasoningContext, Symptom, FailureReason } from '@/types/adaptive-dag';

export class WrongDiagnosisDetector {
  detect(simulation: SimulationGraph, context: ReasoningContext): Symptom {
    const symptoms: string[] = [];
    let score = 0;
    
    // Symptom 1: ALL strategies failed (80% weight)
    const allStrategies = context.getAllStrategies();
    const allFailed = allStrategies.length > 0 && 
      allStrategies.every(s => s.expectedRevenue < context.goal.target * 0.9);
    
    if (allFailed) {
      symptoms.push('All strategies failed → likely wrong root cause');
      score += 0.8;
    }
    
    // Symptom 2: Expected value FAR below goal (60% weight)
    const evGap = (context.goal.target - simulation.expectedValue) / context.goal.target;
    if (evGap > 0.5) {
      symptoms.push(`EV ${Math.round(evGap * 100)}% below goal → diagnosis may be wrong`);
      score += 0.6;
    }
    
    // Symptom 3: Opportunities don't address root causes (70% weight)
    const opportunities = context.getOpportunities();
    const diagnosis = context.getDiagnosis();
    
    if (diagnosis && opportunities.length > 0) {
      // Check if opportunities are aligned with diagnosis
      const rootCauseKeywords = this.extractKeywords(diagnosis);
      const opportunityKeywords = opportunities.map(o => 
        this.extractKeywords(o.name.toLowerCase())
      ).flat();
      
      const overlap = rootCauseKeywords.filter(k => 
        opportunityKeywords.some(ok => ok.includes(k) || k.includes(ok))
      );
      
      const coverageRate = overlap.length / Math.max(rootCauseKeywords.length, 1);
      
      if (coverageRate < 0.5) {
        symptoms.push(`Only ${Math.round(coverageRate * 100)}% root causes addressed`);
        score += 0.7;
      }
    }
    
    // Symptom 4: Diagnosis age > 1 iteration (40% weight)
    if (context.getDiagnosisAge() > 1) {
      symptoms.push('Diagnosis not refreshed → may be stale');
      score += 0.4;
    }
    
    return {
      type: FailureReason.WRONG_DIAGNOSIS,
      symptoms,
      score: Math.min(score, 1.0),
      retryNode: 'diagnosis'
    };
  }
  
  private extractKeywords(text: any): string[] {
    if (typeof text !== 'string') return [];
    
    const keywords = [
      'retention', 'churn', 'acquisition', 'upsell', 'revenue', 
      'customer', 'loyalty', 'weekend', 'tiktok', 'referral'
    ];
    
    return keywords.filter(k => text.toLowerCase().includes(k));
  }
}
