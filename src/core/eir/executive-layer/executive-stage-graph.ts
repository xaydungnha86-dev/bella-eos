import { ExecutiveSession } from '@/types/executive-session';
import { ExecutiveContextBuilder } from './executive-context-builder';
import { ExecutiveClarificationEngine } from './executive-clarification-engine';
import { EnterpriseDiagnosisCapability } from './enterprise-diagnosis-capability';
import { DecisionFrontierEngine } from './decision-frontier-engine';
import { ExecutiveNegotiationEngine } from './executive-negotiation-engine';

export interface ExecutiveStage {
  id: string;
  canExecute(session: ExecutiveSession): boolean;
  execute(session: ExecutiveSession): Promise<void>;
  rollback(session: ExecutiveSession): Promise<void>;
}

export class ContextCompilationStage implements ExecutiveStage {
  id = 'context-compilation';
  private builder = new ExecutiveContextBuilder();

  canExecute(session: ExecutiveSession): boolean {
    return !!session.intent;
  }

  async execute(session: ExecutiveSession): Promise<void> {
    session.context = await this.builder.buildContext(session.intent);
  }

  async rollback(session: ExecutiveSession): Promise<void> {
    session.context = null;
  }
}

export class ClarificationStage implements ExecutiveStage {
  id = 'clarification';
  private engine = new ExecutiveClarificationEngine();

  canExecute(session: ExecutiveSession): boolean {
    return !!session.context;
  }

  async execute(session: ExecutiveSession): Promise<void> {
    if (!session.context) throw new Error('Context missing for clarification stage');
    session.agreedGoal = await this.engine.clarifyIntent(session.intent, session.context);
  }

  async rollback(session: ExecutiveSession): Promise<void> {
    session.agreedGoal = null;
  }
}

export class DiagnosisStage implements ExecutiveStage {
  id = 'diagnosis';
  private capability = new EnterpriseDiagnosisCapability();

  canExecute(session: ExecutiveSession): boolean {
    return !!session.agreedGoal;
  }

  async execute(session: ExecutiveSession): Promise<void> {
    session.healthReport = await this.capability.diagnose(session.intent);
  }

  async rollback(session: ExecutiveSession): Promise<void> {
    session.healthReport = null;
  }
}

export class DecisionFrontierStage implements ExecutiveStage {
  id = 'decision-frontier';
  private engine = new DecisionFrontierEngine();

  canExecute(session: ExecutiveSession): boolean {
    return !!session.agreedGoal && !!session.context;
  }

  async execute(session: ExecutiveSession): Promise<void> {
    if (!session.agreedGoal || !session.context) {
      throw new Error('Goal or Context missing for decision frontier stage');
    }
    session.frontier = await this.engine.computeFrontier(session.agreedGoal, session.context);
  }

  async rollback(session: ExecutiveSession): Promise<void> {
    session.frontier = null;
  }
}

export class NegotiationStage implements ExecutiveStage {
  id = 'negotiation';
  private engine = new ExecutiveNegotiationEngine();

  canExecute(session: ExecutiveSession): boolean {
    return !!session.agreedGoal && !!session.frontier && !!session.context;
  }

  async execute(session: ExecutiveSession): Promise<void> {
    if (!session.agreedGoal || !session.frontier || !session.context) {
      throw new Error('Required state missing for negotiation stage');
    }
    const result = await this.engine.debateAndPropose(session.agreedGoal, session.frontier, session.context);
    
    session.agreedGoal = result.agreedGoal;
    session.negotiationLog = result.negotiationLog;
    session.decisionTrace = result.decisionTrace;
    
    // Auto-approve if success probability >= 50%
    const targetPercent = Math.round(((result.agreedGoal.target - result.agreedGoal.baseline) / result.agreedGoal.baseline) * 100);
    const recommendedOption = result.decisionTrace.steps.find(s => s.action === 'propose')?.proposalDetails;
    const probability = recommendedOption ? recommendedOption.probabilitySuccess : 0.55;

    if (probability >= 0.50) {
      session.approvalState = {
        status: 'approved',
        approvedBy: 'System Auto-Approval',
        comments: 'Consensus reached: Target matches recommended feasibility frontier.'
      };
    } else {
      session.approvalState = {
        status: 'pending',
        comments: 'Negotiated target success rate remains low. Awaiting manual CEO review.'
      };
    }
  }

  async rollback(session: ExecutiveSession): Promise<void> {
    session.negotiationLog = [];
    session.decisionTrace = null;
    session.approvalState = { status: 'pending' };
  }
}

export class ExecutiveStageGraph {
  private stages: ExecutiveStage[] = [];

  constructor() {
    this.stages = [
      new ContextCompilationStage(),
      new ClarificationStage(),
      new DiagnosisStage(),
      new DecisionFrontierStage(),
      new NegotiationStage()
    ];
  }

  async executeGraph(session: ExecutiveSession): Promise<ExecutiveSession> {
    console.log('[Executive Stage Graph] Traversing stages...');
    
    for (const stage of this.stages) {
      if (stage.canExecute(session)) {
        console.log(`[Executive Stage Graph] -> Executing stage: ${stage.id}`);
        await stage.execute(session);
      } else {
        console.warn(`[Executive Stage Graph] ⚠️ Cannot execute stage: ${stage.id}. Dependencies unmet.`);
        break;
      }
    }

    return session;
  }
}
