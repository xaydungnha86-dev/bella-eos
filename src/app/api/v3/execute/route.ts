/**
 * API Route: /api/v3/execute
 * Full EIR → PLR execution cycle with human approval gate
 */

import { NextRequest, NextResponse } from 'next/server';
import { EIRPLRIntegration } from '@/core/integration/eir-plr-integration';

const integration = new EIRPLRIntegration();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { ceoIntent } = body;
    
    if (!ceoIntent || typeof ceoIntent !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: ceoIntent (string)' },
        { status: 400 }
      );
    }

    console.log('[API] Starting full EIR → PLR execution cycle');
    console.log('[API] CEO Intent:', ceoIntent);

    const result = await integration.executeFullCycle(ceoIntent);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[API] Error executing full cycle:', error);
    
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
    service: 'Bella EOS v3.1 - Full Execution Cycle',
    version: '3.1.0',
    description: 'Executive Intelligence Runtime → Human Approval → Planning Runtime',
    endpoints: {
      'POST /api/v3/execute': 'Execute full cycle with CEO intent',
      'POST /api/v3/eir/recommend': 'Execute EIR reasoning only',
      'POST /api/v3/plr/plan': 'Execute PLR planning only',
      'POST /api/v3/learning/feedback': 'Submit campaign outcome feedback',
      'GET /api/v3/learning/report': 'Get learning report',
    },
    timestamp: new Date().toISOString(),
  });
}
