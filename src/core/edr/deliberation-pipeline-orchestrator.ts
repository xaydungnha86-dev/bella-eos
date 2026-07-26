/**
 * BELLA EOS EDR: Deliberation Pipeline Orchestrator
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME
 * 
 * Mission: Master Deliberation Orchestrator. Connects ECH Cognitive Pipeline ➔ Task Decomposition ➔
 * Expert Selection ➔ Multi-Agent Debate ➔ Consensus Engine ➔ Trade-off Analysis ➔ Alternative Strategies ➔
 * Decision Simulation ➔ 1-Page CEO Executive Brief ➔ Cognitive Cache ➔ Enterprise Decision Graph.
 */

import { IDeliberationSession } from '@/types/deliberation-session';
import { CognitivePipelineOrchestrator } from '../ech/cognitive-pipeline-orchestrator';

import { TaskDecompositionRuntime } from './task-decomposition-runtime';
import { ExpertSelectionRuntime } from './expert-selection-runtime';
import { MultiAgentDebateRuntime } from './multi-agent-debate-runtime';
import { ConsensusEngineRuntime } from './consensus-engine-runtime';
import { TradeoffAnalysisRuntime } from './tradeoff-analysis-runtime';
import { AlternativeStrategyRuntime } from './alternative-strategy-runtime';
import { DecisionSimulationRuntime } from './decision-simulation-runtime';
import { ExecutiveBriefRuntime } from './executive-brief-runtime';
import { CognitiveCache } from './cognitive-cache';
import { EnterpriseDecisionGraph } from './decision-graph';

export class DeliberationPipelineOrchestrator {
  private static instance: DeliberationPipelineOrchestrator;
  private sessionStore: Map<string, IDeliberationSession> = new Map();

  private constructor() {}

  public static getInstance(): DeliberationPipelineOrchestrator {
    if (!DeliberationPipelineOrchestrator.instance) {
      DeliberationPipelineOrchestrator.instance = new DeliberationPipelineOrchestrator();
    }
    return DeliberationPipelineOrchestrator.instance;
  }

  public async executeDeliberationSession(tenantId: string, userObjective: string): Promise<IDeliberationSession> {
    const sessionId = `delib-session-${Date.now()}`;

    // 1. Check Cognitive Cache
    const cache = CognitiveCache.getInstance();
    const cachedEntry = cache.get(tenantId, userObjective);

    // 2. Execute ECH Cognitive Session
    const cogSession = await CognitivePipelineOrchestrator.getInstance().executeCognitiveSession(tenantId, userObjective);

    // Save to Cache if miss
    if (!cachedEntry) {
      cache.set(
        tenantId,
        userObjective,
        `Retrieved ${cogSession.rankedContextItems.length} context items`,
        cogSession.reasoningPlan.planId,
        cogSession.harnessPackage.harnessId
      );
    }

    // 3. Task Decomposition (Runtime 19)
    const taskDecomposition = TaskDecompositionRuntime.getInstance().decomposeGoal(userObjective);

    // 4. Expert Selection (Runtime 20)
    const selectedExperts = ExpertSelectionRuntime.getInstance().selectExperts(userObjective);

    // 5. Multi-Agent Debate (Runtime 21)
    const debate = MultiAgentDebateRuntime.getInstance().conductDebate(selectedExperts, userObjective);

    // 6. Consensus Engine (Runtime 22)
    const consensus = ConsensusEngineRuntime.getInstance().calculateConsensus(debate.opinions);

    // 7. Trade-off Analysis (Runtime 23)
    const tradeOffMatrix = TradeoffAnalysisRuntime.getInstance().generateTradeOffMatrix(userObjective);

    // 8. Alternative Strategy Generation (Runtime 24)
    const alternativeOptions = AlternativeStrategyRuntime.getInstance().generateAlternatives(userObjective);

    // 9. Decision Simulation (Runtime 25)
    const simulatedOutcome = DecisionSimulationRuntime.getInstance().simulateDecision(userObjective);

    // 10. Executive Brief Synthesis (Runtime 26)
    const brief = ExecutiveBriefRuntime.getInstance().synthesizeBrief(
      userObjective,
      debate.opinions,
      tradeOffMatrix,
      cogSession.evidenceCitations.length
    );

    const deliberationSession: IDeliberationSession = {
      sessionId,
      tenantId,
      userObjective,
      taskDecomposition,
      selectedExperts,
      expertOpinions: debate.opinions,
      debateTranscript: debate.debateTranscript,
      consensusScore: consensus.consensusScore,
      requiresCeoReview: consensus.requiresCeoReview,
      tradeOffMatrix,
      alternativeOptions,
      simulatedOutcome,
      executiveBrief: brief,
      createdAt: new Date().toISOString(),
    };

    this.sessionStore.set(sessionId, deliberationSession);

    // 11. Record Node in Enterprise Decision Graph
    EnterpriseDecisionGraph.getInstance().recordDecisionNode(
      tenantId,
      `Chỉ thị Executive: ${userObjective}`,
      cogSession.evidenceCitations.map(c => c.citationId),
      sessionId
    );

    return deliberationSession;
  }

  public getSession(sessionId: string): IDeliberationSession | undefined {
    return this.sessionStore.get(sessionId);
  }
}
