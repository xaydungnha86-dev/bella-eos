import { NextResponse } from 'next/server';
import { OrchestrationEngine } from '../../../core/orchestration/orchestration';
import { EnterpriseBrain } from '../../../core/brain';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { objective } = body;

    if (!objective) {
      return NextResponse.json({ error: 'Objective field is required' }, { status: 400 });
    }

    // 1. Domain 3: Parse Intent
    const intent = OrchestrationEngine.IntentEngine.parseIntent(objective);

    // 2. Domain 3: Decompose Goal into OKRs
    const goals = OrchestrationEngine.GoalEngine.decomposeGoal(objective);

    // 3. Domain 2: Compile Canonical Context Package for Step 1
    const activeStep = { id: 1, name: 'Phân tích và setup chiến dịch', agent: 'hermes' };
    const contextPackage = EnterpriseBrain.Context.compileContext(activeStep, objective);

    return NextResponse.json({
      success: true,
      intentId: intent.intentId,
      goals,
      canonicalContext: contextPackage
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
