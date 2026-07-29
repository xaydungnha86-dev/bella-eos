import { ClarifiedGoal } from '@/types/executive-recommendation';
import { ExecutiveContext, DecisionTrace, DecisionTraceStep } from '@/types/executive-session';
import { FrontierDecisionPoint } from './decision-frontier-engine';

export class ExecutiveNegotiationEngine {
  async debateAndPropose(
    goal: ClarifiedGoal,
    frontier: FrontierDecisionPoint[],
    context: ExecutiveContext
  ): Promise<{
    agreedGoal: ClarifiedGoal;
    negotiationLog: string[];
    decisionTrace: DecisionTrace;
    requiresCEOAction: boolean;
  }> {
    console.log('[Negotiation Engine] Initiating dynamic C-Suite debate on frontier options...');
    
    const sessionId = `exec-session-${Math.random().toString(36).substr(2, 9)}`;
    const steps: DecisionTraceStep[] = [];
    const targetPercent = Math.round(((goal.target - goal.baseline) / goal.baseline) * 100);
    const recommendedOption = frontier.find(f => f.isRecommended) || frontier[0];
    const timestamp = new Date().toISOString();

    // Trace 1: CFO
    steps.push({
      agent: 'CFO Pacioli',
      action: 'debate',
      message: `Pacioli: Warning. High target of +${targetPercent}% risks capital inefficiency under current runway limits.`,
      timestamp
    });

    // Trace 2: CMO
    steps.push({
      agent: 'CMO Apollo',
      action: 'propose',
      message: `Apollo: TikTok & Facebook campaigns can support up to +${recommendedOption.target}% with high conversion probability.`,
      timestamp,
      proposalDetails: {
        target: recommendedOption.target,
        probabilitySuccess: recommendedOption.probabilitySuccess,
        recommendedBudget: recommendedOption.recommendedBudget
      }
    });

    // Trace 3: COO
    steps.push({
      agent: 'COO Ops',
      action: 'debate',
      message: `Ops: Operations can handle workload delegation for up to +${recommendedOption.target}% growth without team burnout.`,
      timestamp
    });

    const logs: string[] = steps.map(s => `[${s.agent}] ${s.message}`);
    
    let agreedGoal = { ...goal };
    let requiresCEOAction = false;
    
    // Check if the original goal success probability is low
    const originalOption = frontier.find(f => f.target === targetPercent);
    const originalProb = originalOption ? originalOption.probabilitySuccess : 0.5;

    if (originalProb < 0.5) {
      requiresCEOAction = true;
      logs.push(`[Negotiation Engine] Proposal: Success probability for original target (+${targetPercent}%) is low (${Math.round(originalProb * 100)}%).`);
      logs.push(`[Negotiation Engine] Alternative Proposal: We recommend target +${recommendedOption.target}% with success probability ${Math.round(recommendedOption.probabilitySuccess * 100)}%.`);
      
      // Trace 4: Negotiation Proposal
      steps.push({
        agent: 'Executive Negotiation Engine',
        action: 'modify',
        message: `Engine: Proposing modified target of +${recommendedOption.target}% due to low success probability (${Math.round(originalProb * 100)}%) of original target.`,
        timestamp,
        proposalDetails: {
          target: recommendedOption.target,
          probabilitySuccess: recommendedOption.probabilitySuccess,
          recommendedBudget: recommendedOption.recommendedBudget
        }
      });

      const newTarget = goal.baseline * (1 + recommendedOption.target / 100);
      agreedGoal = {
        ...goal,
        target: newTarget,
        howMuch: `${recommendedOption.target}% = ${newTarget - goal.baseline}M VND`,
        constraints: [...goal.constraints, `Negotiated Target +${recommendedOption.target}%`]
      };
    } else {
      logs.push(`[Negotiation Engine] Consensus: Goal +${targetPercent}% is feasible. Proceeding.`);
      
      // Trace 4: Consensus
      steps.push({
        agent: 'Executive Negotiation Engine',
        action: 'approve',
        message: `Engine: Consensus reached on original target +${targetPercent}% with probability ${Math.round(originalProb * 100)}%.`,
        timestamp
      });
    }

    return {
      agreedGoal,
      negotiationLog: logs,
      decisionTrace: {
        sessionId,
        steps
      },
      requiresCEOAction
    };
  }
}
