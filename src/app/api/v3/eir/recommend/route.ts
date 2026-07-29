/**
 * API Route: /api/v3/eir/recommend
 * Executive Intelligence Runtime - Strategic Recommendation Only
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

    console.log('[API] Starting EIR reasoning only');
    console.log('[API] CEO Intent:', ceoIntent);

    const result = await integration.executeEIROnly(ceoIntent);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[API] Error executing EIR:', error);
    
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
    service: 'Bella EOS v3.1 - Executive Intelligence Runtime',
    version: '3.1.0',
    description: 'Strategic reasoning with adaptive DAG (7 graphs + failure analysis)',
    features: [
      'Diagnosis Graph (5 Whys)',
      'Constraint Graph (6 types)',
      'Opportunity Graph (20+ possibilities)',
      'Strategy Graph (Conservative/Balanced/Aggressive)',
      'Simulation Graph (Monte Carlo 3 scenarios)',
      'Risk Graph (Assessment + Mitigation)',
      'Adaptive DAG (4 symptom detectors)',
    ],
    timestamp: new Date().toISOString(),
  });
}
