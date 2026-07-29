/**
 * API Route: /api/v3/learning/feedback
 * Strategic Learning Feedback Loop
 */

import { NextRequest, NextResponse } from 'next/server';
import { StrategicLearningLoop } from '@/core/learning/strategic-learning-loop';
import { ObservedOutcome } from '@/types/strategic-learning';

const learningLoop = new StrategicLearningLoop();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { outcome } = body;
    
    if (!outcome || typeof outcome !== 'object') {
      return NextResponse.json(
        { error: 'Missing required field: outcome (ObservedOutcome object)' },
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

    const result = await learningLoop.processCampaignOutcome(outcome as ObservedOutcome);

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
