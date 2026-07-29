/**
 * Strategic Learning Feedback Loop Types
 * Learning Runtime → EIR Integration
 */

import { Strategy } from './executive-recommendation';

export interface ObservedOutcome {
  actualRevenue: number;
  actualMetrics: Record<string, number>;
  timestamp: string;
  campaignId: string;
}

export interface Variance {
  expected: number;
  actual: number;
  delta: number;
  deltaPercent: number;
}

export interface Lesson {
  type: 'success' | 'failure' | 'insight';
  category: string;
  description: string;
  evidence: string[];
  confidence: number;
  applicability: string[];
}

export interface StrategyFeedback {
  plannedStrategy: Strategy;
  actualOutcome: ObservedOutcome;
  variance: Variance;
  lessons: Lesson[];
  confidenceAdjustment: Record<string, number>;
}

export interface ConfidenceAdjustment {
  possibility: string;
  oldConfidence: number;
  newConfidence: number;
  reason: string;
  evidence: string[];
}
