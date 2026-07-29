/**
 * Confidence Adjuster
 * Updates EIR confidence scores based on strategic learning
 */

import { ConfidenceAdjustment } from '@/types/strategic-learning';

export class ConfidenceAdjuster {
  private confidenceStore: Map<string, number> = new Map();
  
  constructor() {
    // Initialize with baseline confidences
    this.confidenceStore.set('Win-back campaign', 0.85);
    this.confidenceStore.set('Upsell program', 0.80);
    this.confidenceStore.set('Weekend promotion', 0.90);
    this.confidenceStore.set('TikTok pilot', 0.60);
    this.confidenceStore.set('Referral program', 0.70);
    this.confidenceStore.set('Loyalty program', 0.75);
  }
  
  /**
   * Apply confidence adjustments from learning feedback
   */
  async adjust(
    adjustments: Record<string, number>
  ): Promise<ConfidenceAdjustment[]> {
    
    console.log('\n🎯 [Confidence Adjuster] Applying strategic learning...');
    
    const results: ConfidenceAdjustment[] = [];
    
    for (const [possibility, newConfidence] of Object.entries(adjustments)) {
      const oldConfidence = this.confidenceStore.get(possibility) || 0.60;
      
      // Apply adjustment
      this.confidenceStore.set(possibility, newConfidence);
      
      const adjustment: ConfidenceAdjustment = {
        possibility,
        oldConfidence,
        newConfidence,
        reason: this.getAdjustmentReason(oldConfidence, newConfidence),
        evidence: [
          `Previous campaigns showed ${newConfidence > oldConfidence ? 'better' : 'worse'} than expected performance`,
          `Confidence adjusted from ${Math.round(oldConfidence * 100)}% → ${Math.round(newConfidence * 100)}%`
        ]
      };
      
      results.push(adjustment);
      
      console.log(`[Confidence Adjuster] ${possibility}:`, 
        `${Math.round(oldConfidence * 100)}% → ${Math.round(newConfidence * 100)}%`,
        `(${newConfidence > oldConfidence ? '↑' : '↓'} ${Math.abs(newConfidence - oldConfidence).toFixed(2)})`
      );
    }
    
    console.log('[Confidence Adjuster] ✓ Applied', results.length, 'adjustments');
    
    return results;
  }
  
  /**
   * Get confidence for a possibility
   * Used by EIR during opportunity evaluation
   */
  getConfidence(possibility: string): number {
    return this.confidenceStore.get(possibility) || 0.60;
  }
  
  /**
   * Get all confidences
   */
  getAllConfidences(): Record<string, number> {
    return Object.fromEntries(this.confidenceStore.entries());
  }
  
  /**
   * Reset confidence to baseline
   */
  reset(possibility: string): void {
    const baseline = 0.60;
    this.confidenceStore.set(possibility, baseline);
    console.log(`[Confidence Adjuster] Reset ${possibility} to baseline ${baseline}`);
  }
  
  /**
   * Get reason for adjustment
   */
  private getAdjustmentReason(oldConf: number, newConf: number): string {
    const delta = newConf - oldConf;
    const deltaPercent = Math.abs(delta * 100);
    
    if (delta > 0.1) {
      return `Strong outperformance (+${deltaPercent.toFixed(0)}% confidence increase)`;
    } else if (delta > 0.05) {
      return `Moderate outperformance (+${deltaPercent.toFixed(0)}% confidence increase)`;
    } else if (delta > 0) {
      return `Slight outperformance (+${deltaPercent.toFixed(0)}% confidence increase)`;
    } else if (delta < -0.1) {
      return `Significant underperformance (-${deltaPercent.toFixed(0)}% confidence decrease)`;
    } else if (delta < -0.05) {
      return `Moderate underperformance (-${deltaPercent.toFixed(0)}% confidence decrease)`;
    } else {
      return `Slight underperformance (-${deltaPercent.toFixed(0)}% confidence decrease)`;
    }
  }
}
