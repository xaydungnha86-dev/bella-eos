/**
 * Variance Analyzer
 * Compares planned vs actual outcomes to extract strategic lessons
 */

import { Strategy } from '@/types/executive-recommendation';
import { ObservedOutcome, Variance, Lesson, StrategyFeedback } from '@/types/strategic-learning';

export class VarianceAnalyzer {
  /**
   * Analyze variance between planned strategy and actual outcome
   */
  async analyze(
    plannedStrategy: Strategy,
    actualOutcome: ObservedOutcome
  ): Promise<StrategyFeedback> {
    
    console.log('\n📊 [Variance Analyzer] Analyzing strategy performance...');
    console.log('[Variance Analyzer] Planned:', `${plannedStrategy.expectedRevenue}M`);
    console.log('[Variance Analyzer] Actual:', `${actualOutcome.actualRevenue}M`);
    
    // Calculate variance
    const variance: Variance = {
      expected: plannedStrategy.expectedRevenue,
      actual: actualOutcome.actualRevenue,
      delta: actualOutcome.actualRevenue - plannedStrategy.expectedRevenue,
      deltaPercent: ((actualOutcome.actualRevenue - plannedStrategy.expectedRevenue) / 
                     plannedStrategy.expectedRevenue) * 100
    };
    
    // Extract lessons from variance
    const lessons = await this.extractLessons(
      plannedStrategy,
      actualOutcome,
      variance
    );
    
    // Calculate confidence adjustments for future strategies
    const confidenceAdjustment = this.calculateConfidenceAdjustments(
      plannedStrategy,
      actualOutcome,
      variance
    );
    
    const feedback: StrategyFeedback = {
      plannedStrategy,
      actualOutcome,
      variance,
      lessons,
      confidenceAdjustment
    };
    
    console.log('[Variance Analyzer] ✓ Analysis complete:');
    console.log('   Delta:', `${variance.delta > 0 ? '+' : ''}${variance.delta.toFixed(0)}M (${variance.deltaPercent > 0 ? '+' : ''}${variance.deltaPercent.toFixed(1)}%)`);
    console.log('   Lessons extracted:', lessons.length);
    console.log('   Confidence adjustments:', Object.keys(confidenceAdjustment).length);
    
    return feedback;
  }
  
  /**
   * Extract actionable lessons from variance
   */
  private async extractLessons(
    plannedStrategy: Strategy,
    actualOutcome: ObservedOutcome,
    variance: Variance
  ): Promise<Lesson[]> {
    
    const lessons: Lesson[] = [];
    
    // Overall performance lesson
    if (variance.deltaPercent > 10) {
      lessons.push({
        type: 'success',
        category: 'strategy',
        description: `${plannedStrategy.name} strategy outperformed by ${variance.deltaPercent.toFixed(1)}%`,
        evidence: [
          `Planned: ${variance.expected}M`,
          `Actual: ${variance.actual}M`,
          `Delta: +${variance.delta.toFixed(0)}M`
        ],
        confidence: 0.95,
        applicability: ['Similar market conditions', 'Comparable budget']
      });
    } else if (variance.deltaPercent < -10) {
      lessons.push({
        type: 'failure',
        category: 'strategy',
        description: `${plannedStrategy.name} strategy underperformed by ${Math.abs(variance.deltaPercent).toFixed(1)}%`,
        evidence: [
          `Planned: ${variance.expected}M`,
          `Actual: ${variance.actual}M`,
          `Delta: ${variance.delta.toFixed(0)}M`
        ],
        confidence: 0.90,
        applicability: ['Review assumptions', 'Adjust confidence']
      });
    }
    
    // Initiative-level lessons (extract from actualMetrics if available)
    plannedStrategy.initiatives.forEach(initiative => {
      // TikTok pilot lesson example
      if (initiative.includes('TikTok')) {
        const tiktokActual = actualOutcome.actualMetrics['tiktok_revenue'] || 0;
        const tiktokExpected = 200; // Default expected
        
        if (tiktokActual > tiktokExpected * 1.2) {
          lessons.push({
            type: 'success',
            category: 'channel',
            description: 'TikTok pilot exceeded expectations - scale recommended',
            evidence: [
              `Expected: ${tiktokExpected}M`,
              `Actual: ${tiktokActual}M`,
              `Outperformance: ${((tiktokActual / tiktokExpected - 1) * 100).toFixed(1)}%`
            ],
            confidence: 0.85,
            applicability: ['TikTok campaigns', 'Video content strategy']
          });
        }
      }
      
      // Win-back campaign lesson example
      if (initiative.includes('Win-back')) {
        const winbackActual = actualOutcome.actualMetrics['winback_revenue'] || 0;
        const winbackExpected = 600;
        
        if (winbackActual > winbackExpected * 1.1) {
          lessons.push({
            type: 'success',
            category: 'retention',
            description: 'Win-back campaigns highly effective - invest more in retention',
            evidence: [
              `Expected: ${winbackExpected}M`,
              `Actual: ${winbackActual}M`,
              `Email conversion rate exceeded benchmark`
            ],
            confidence: 0.92,
            applicability: ['Retention strategies', 'Email marketing']
          });
        } else if (winbackActual < winbackExpected * 0.8) {
          lessons.push({
            type: 'insight',
            category: 'retention',
            description: 'Win-back conversion lower than expected - review offer strength',
            evidence: [
              `Expected: ${winbackExpected}M`,
              `Actual: ${winbackActual}M`,
              `May need stronger incentives`
            ],
            confidence: 0.75,
            applicability: ['Future win-back campaigns']
          });
        }
      }
    });
    
    // Budget efficiency lesson
    const budgetEfficiency = variance.actual / plannedStrategy.budget;
    if (budgetEfficiency > 12) {
      lessons.push({
        type: 'success',
        category: 'efficiency',
        description: `Excellent ROI: ${budgetEfficiency.toFixed(1)}x budget`,
        evidence: [
          `Revenue: ${variance.actual}M`,
          `Budget: ${plannedStrategy.budget}M`,
          `ROI: ${budgetEfficiency.toFixed(1)}x`
        ],
        confidence: 0.90,
        applicability: ['Budget allocation', 'Similar initiatives']
      });
    }
    
    return lessons;
  }
  
  /**
   * Calculate confidence adjustments for future EIR reasoning
   */
  private calculateConfidenceAdjustments(
    plannedStrategy: Strategy,
    actualOutcome: ObservedOutcome,
    variance: Variance
  ): Record<string, number> {
    
    const adjustments: Record<string, number> = {};
    
    // Adjust confidence based on overall performance
    plannedStrategy.initiatives.forEach(initiative => {
      const baseConfidence = 0.60; // Default starting confidence
      
      if (initiative.includes('TikTok')) {
        const tiktokActual = actualOutcome.actualMetrics['tiktok_revenue'] || 0;
        const tiktokExpected = 200;
        
        if (tiktokActual > tiktokExpected * 1.2) {
          adjustments['TikTok pilot'] = Math.min(baseConfidence + 0.15, 0.95);
        } else if (tiktokActual < tiktokExpected * 0.7) {
          adjustments['TikTok pilot'] = Math.max(baseConfidence - 0.10, 0.30);
        }
      }
      
      if (initiative.includes('Win-back')) {
        const winbackActual = actualOutcome.actualMetrics['winback_revenue'] || 0;
        const winbackExpected = 600;
        
        if (winbackActual > winbackExpected * 1.15) {
          adjustments['Win-back campaign'] = Math.min(0.85 + 0.07, 0.95);
        }
      }
      
      if (initiative.includes('Upsell')) {
        const upsellActual = actualOutcome.actualMetrics['upsell_revenue'] || 0;
        const upsellExpected = 500;
        
        if (upsellActual > upsellExpected * 1.1) {
          adjustments['Upsell program'] = Math.min(0.80 + 0.05, 0.92);
        }
      }
    });
    
    return adjustments;
  }
}
