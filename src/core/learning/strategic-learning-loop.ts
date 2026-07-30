/**
 * Strategic Learning Loop
 * Connects observation outcomes back to EIR for continuous improvement
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { ObservedOutcome, StrategyFeedback, Lesson } from '@/types/strategic-learning';
import { VarianceAnalyzer } from './variance-analyzer';
import { ConfidenceAdjuster } from './confidence-adjuster';

export class StrategicLearningLoop {
  private varianceAnalyzer: VarianceAnalyzer;
  private confidenceAdjuster: ConfidenceAdjuster;
  private lessonStore: Lesson[] = [];
  
  constructor() {
    this.varianceAnalyzer = new VarianceAnalyzer();
    this.confidenceAdjuster = new ConfidenceAdjuster();
  }
  
  /**
   * Process observed outcome and update EIR knowledge
   * This is called after campaign execution completes
   */
  async processCampaignOutcome(
    recommendation: ExecutiveRecommendation,
    outcome: ObservedOutcome
  ): Promise<StrategyFeedback> {
    
    console.log('\n🔄 [Strategic Learning] Processing campaign outcome...');
    console.log('[Strategic Learning] Campaign:', outcome.campaignId);
    console.log('[Strategic Learning] Timestamp:', outcome.timestamp);
    
    // Step 1: Analyze variance
    const feedback = await this.varianceAnalyzer.analyze(
      recommendation.chosenStrategy,
      outcome
    );
    
    // Step 2: Store lessons
    feedback.lessons.forEach(lesson => {
      this.lessonStore.push(lesson);
      console.log(`[Strategic Learning] Lesson stored: ${lesson.description}`);
    });
    
    // Step 3: Apply confidence adjustments
    if (Object.keys(feedback.confidenceAdjustment).length > 0) {
      const adjustments = await this.confidenceAdjuster.adjust(
        feedback.confidenceAdjustment
      );
      
      console.log('[Strategic Learning] Confidence adjustments applied:', adjustments.length);
    }
    
    // Step 4: Persist to EKR (Enterprise Knowledge Repository)
    // TODO: In production, this would write to database/vector store
    await this.persistToEKR(feedback);
    
    console.log('\n✅ [Strategic Learning] Learning cycle complete');
    console.log('   Variance:', `${feedback.variance.deltaPercent > 0 ? '+' : ''}${feedback.variance.deltaPercent.toFixed(1)}%`);
    console.log('   Lessons:', feedback.lessons.length);
    console.log('   Adjustments:', Object.keys(feedback.confidenceAdjustment).length);
    
    return feedback;
  }
  
  /**
   * Get confidence for opportunity (used by EIR)
   */
  getOpportunityConfidence(opportunityName: string): number {
    return this.confidenceAdjuster.getConfidence(opportunityName);
  }
  
  /**
   * Get all stored lessons
   */
  getLessons(filter?: {
    type?: 'success' | 'failure' | 'insight';
    category?: string;
    minConfidence?: number;
  }): Lesson[] {
    
    let lessons = this.lessonStore;
    
    if (filter) {
      if (filter.type) {
        lessons = lessons.filter(l => l.type === filter.type);
      }
      if (filter.category) {
        lessons = lessons.filter(l => l.category === filter.category);
      }
      if (filter.minConfidence !== undefined) {
        const minConf = filter.minConfidence;
        lessons = lessons.filter(l => l.confidence >= minConf);
      }
    }
    
    return lessons;
  }
  
  /**
   * Get success rate for a strategy type
   */
  getStrategySuccessRate(strategyName: string): number {
    const relevantLessons = this.lessonStore.filter(l => 
      l.description.includes(strategyName)
    );
    
    if (relevantLessons.length === 0) return 0.5; // No data
    
    const successCount = relevantLessons.filter(l => l.type === 'success').length;
    return successCount / relevantLessons.length;
  }
  
  /**
   * Get recommendation for future strategies based on lessons
   */
  getStrategicRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze success patterns
    const successLessons = this.getLessons({ type: 'success', minConfidence: 0.80 });
    
    const categories = successLessons.reduce((acc, lesson) => {
      acc[lesson.category] = (acc[lesson.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Top categories
    const sorted = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    sorted.forEach(([category, count]) => {
      recommendations.push(
        `Focus on ${category} strategies (${count} successful lessons)`
      );
    });
    
    return recommendations;
  }
  
  /**
   * Persist feedback to Enterprise Knowledge Repository
   * In production, this would write to database
   */
  private async persistToEKR(feedback: StrategyFeedback): Promise<void> {
    // TODO: Implement EKR persistence
    // - Store in PostgreSQL (structured data)
    // - Store in Vector DB (semantic search)
    // - Store in Knowledge Graph (relationships)
    
    console.log('[Strategic Learning] Persisting to EKR...');
    console.log('[Strategic Learning] ✓ Persisted (mock)');
  }
  
  /**
   * Generate learning report
   */
  generateReport(): {
    totalLessons: number;
    successRate: number;
    topCategories: string[];
    confidences: Record<string, number>;
    recommendations: string[];
  } {
    
    const lessons = this.lessonStore;
    const successCount = lessons.filter(l => l.type === 'success').length;
    const successRate = lessons.length > 0 ? successCount / lessons.length : 0;
    
    const categories = lessons.reduce((acc, lesson) => {
      acc[lesson.category] = (acc[lesson.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat]) => cat);
    
    return {
      totalLessons: lessons.length,
      successRate,
      topCategories,
      confidences: this.confidenceAdjuster.getAllConfidences(),
      recommendations: this.getStrategicRecommendations()
    };
  }
}
