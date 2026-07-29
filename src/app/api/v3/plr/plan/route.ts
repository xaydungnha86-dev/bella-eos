/**
 * API Route: /api/v3/plr/plan
 * Planning Runtime - Operational Planning Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { EIRPLRIntegration } from '@/core/integration/eir-plr-integration';
import { ExecutiveRecommendation } from '@/types/executive-recommendation';

const integration = new EIRPLRIntegration();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { recommendation } = body;
    
    if (!recommendation || typeof recommendation !== 'object') {
      return NextResponse.json(
        { error: 'Missing required field: recommendation (ExecutiveRecommendation object)' },
        { status: 400 }
      );
    }

    console.log('[API] Starting PLR planning only');
    console.log('[API] Recommendation:', recommendation.selectedStrategy?.name);

    const result = await integration.executePLROnly(recommendation as ExecutiveRecommendation);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[API] Error executing PLR:', error);
    
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

export async function GET() {
  return NextResponse.json({
    service: 'Bella EOS v3.1 - Planning Runtime',
    version: '3.1.0',
    description: 'Operational planning with 5 specialized engines',
    features: [
      'KPI Decomposition (Hierarchical trees + Leading indicators)',
      'Budget Allocation (Line-items + Weekly distribution + 10% contingency)',
      'Timeline Planning (4 phases + Day-by-day milestones + Critical path)',
      'Resource Allocation (Workforce by role + Conflict detection)',
      'Owner Assignment (KPI ownership + Escalation paths)',
    ],
    timestamp: new Date().toISOString(),
  });
}
