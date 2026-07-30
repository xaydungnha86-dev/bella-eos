/**
 * API Route: /api/v3/learning/feedback
 * Strategic Learning Feedback Loop
 */

import { NextRequest, NextResponse } from 'next/server';
import { StrategicLearningLoop } from '@/core/learning/strategic-learning-loop';
import { ObservedOutcome } from '@/types/strategic-learning';
import { ExecutiveRecommendation } from '@/types/executive-recommendation';

const learningLoop = new StrategicLearningLoop();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { outcome, recommendation } = body;
    
    if (!outcome || typeof outcome !== 'object') {
      return NextResponse.json(
        { error: 'Missing required field: outcome' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['campaignId', 'strategyId', 'plannedMetrics', 'actualMetrics'];
    const missingFields = requiredFields.filter(field => !(field in outcome));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('[API] Processing campaign outcome feedback');
    console.log('[API] Campaign ID:', outcome.campaignId);

    // Map incoming outcome to the correct ObservedOutcome structure
    const parsedOutcome: ObservedOutcome = {
      campaignId: outcome.campaignId,
      actualRevenue: outcome.actualRevenue || outcome.actualMetrics?.revenue || 0,
      actualMetrics: outcome.actualMetrics || {},
      timestamp: outcome.timestamp || outcome.completionDate || new Date().toISOString()
    };

    // Construct recommendation if not provided in the request body
    const finalRecommendation: ExecutiveRecommendation = recommendation || {
      goal: {
        what: 'Goal',
        howMuch: '30%',
        by: '4 weeks',
        baseline: 0,
        target: outcome.plannedMetrics?.revenue || 1000,
        constraints: [],
        urgency: 'high'
      },
      diagnosis: {
        currentState: 'Stale',
        symptoms: [],
        rootCauses: [],
        opportunities: []
      },
      constraints: {
        budget: { type: 'budget', limit: '1000', current: '0', status: 'acceptable' },
        workforce: { type: 'workforce', limit: '10', current: '0', status: 'acceptable' },
        timeline: { type: 'timeline', limit: '4 weeks', current: '0', status: 'acceptable' },
        technology: { type: 'technology', limit: 'none', current: '0', status: 'acceptable' },
        policy: { type: 'policy', limit: 'none', current: '0', status: 'acceptable' },
        market: { type: 'market', limit: 'none', current: '0', status: 'acceptable' }
      },
      assumptions: [],
      alternatives: [],
      chosenStrategy: {
        name: outcome.strategyId || 'Default Strategy',
        initiatives: outcome.initiatives || ['TikTok pilot', 'Win-back campaign', 'Upsell program'],
        expectedRevenue: outcome.plannedMetrics?.revenue || 1000,
        budget: outcome.plannedMetrics?.budget || 100,
        risk: 'medium',
        tradeoffs: []
      },
      simulationSummary: {
        strategy: { name: 'Default', initiatives: [], expectedRevenue: 1000, budget: 100, risk: 'medium', tradeoffs: [] },
        scenarios: [],
        expectedValue: outcome.plannedMetrics?.revenue || 1000,
        probabilitySuccess: 0.80,
        convergence: true
      },
      confidence: 0.80,
      expectedOutcome: '',
      majorRisks: [],
      successCriteria: {
        primary: '',
        secondary: []
      },
      generatedAt: new Date().toISOString(),
      reasoningTrace: {
        nodes: [],
        iterations: 1,
        convergenceAchieved: true
      }
    };

    const result = await learningLoop.processCampaignOutcome(finalRecommendation, parsedOutcome);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[API] Error processing feedback:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const strategyId = searchParams.get('strategyId');
    const type = searchParams.get('type') as 'success' | 'failure' | 'insight' | undefined;
    const category = searchParams.get('category');
    const minConfidence = searchParams.get('minConfidence');

    console.log('[API] Getting learning report');

    const filters: {
      strategyId?: string;
      type?: 'success' | 'failure' | 'insight';
      category?: string;
      minConfidence?: number;
    } = {};

    if (strategyId) filters.strategyId = strategyId;
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (minConfidence) filters.minConfidence = parseFloat(minConfidence);

    const lessons = learningLoop.getLessons(filters);
    const report = learningLoop.generateReport();

    return NextResponse.json({
      success: true,
      data: {
        lessons,
        report,
        filters,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[API] Error getting learning report:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}
