/**
 * BELLA EOS CERTIFICATION: Enterprise Deliberation Runtime (EDR) Certification Suite
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME
 * 
 * Verifies Task Decomposition, Multi-Agent Debate, Consensus Engine, Trade-off Matrix,
 * Alternative Options (A/B/C), Scenario Simulation, 1-Page CEO Executive Brief,
 * Enterprise Cognitive Cache, and Decision Graph persistence.
 */

import { TaskDecompositionRuntime } from '@/core/edr/task-decomposition-runtime';
import { ExpertSelectionRuntime } from '@/core/edr/expert-selection-runtime';
import { MultiAgentDebateRuntime } from '@/core/edr/multi-agent-debate-runtime';
import { ConsensusEngineRuntime } from '@/core/edr/consensus-engine-runtime';
import { TradeoffAnalysisRuntime } from '@/core/edr/tradeoff-analysis-runtime';
import { AlternativeStrategyRuntime } from '@/core/edr/alternative-strategy-runtime';
import { DecisionSimulationRuntime } from '@/core/edr/decision-simulation-runtime';
import { ExecutiveBriefRuntime } from '@/core/edr/executive-brief-runtime';
import { CognitiveCache } from '@/core/edr/cognitive-cache';
import { EnterpriseDecisionGraph } from '@/core/edr/decision-graph';
import { DeliberationPipelineOrchestrator } from '@/core/edr/deliberation-pipeline-orchestrator';

describe('BELLA EOS v18.6 Enterprise Deliberation Runtime (EDR) Certification', () => {

  it('1. Task Decomposition & Expert Selection: should split goal across domain experts', () => {
    const tasks = TaskDecompositionRuntime.getInstance().decomposeGoal('Mở chi nhánh mới');
    const experts = ExpertSelectionRuntime.getInstance().selectExperts('Mở chi nhánh mới');

    expect(tasks.length).toBe(5);
    expect(experts.length).toBe(5);
  });

  it('2. Multi-Agent Debate & Consensus Engine: should conduct cross-agent debate and calculate consensus %', () => {
    const debate = MultiAgentDebateRuntime.getInstance().conductDebate(['FINANCE_AGENT', 'MARKETING_AGENT'], 'Mở chi nhánh mới');
    const consensus = ConsensusEngineRuntime.getInstance().calculateConsensus(debate.opinions);

    expect(debate.opinions.length).toBeGreaterThan(0);
    expect(debate.debateTranscript.length).toBeGreaterThan(0);
    expect(consensus.consensusScore).toBeGreaterThan(0);
  });

  it('3. Trade-off Matrix & Alternative Strategies: should generate pros/cons matrix and Options A, B, C', () => {
    const tradeOffs = TradeoffAnalysisRuntime.getInstance().generateTradeOffMatrix('Mở chi nhánh mới');
    const alternatives = AlternativeStrategyRuntime.getInstance().generateAlternatives('Mở chi nhánh mới');

    expect(tradeOffs.length).toBeGreaterThan(0);
    expect(alternatives.length).toBe(3);
    expect(alternatives[0].optionTitle).toContain('Phương án A');
  });

  it('4. Decision Simulation & Executive Brief: should run 12-month projections and synthesize 1-page brief', () => {
    const sim = DecisionSimulationRuntime.getInstance().simulateDecision('Mở chi nhánh mới');
    const brief = ExecutiveBriefRuntime.getInstance().synthesizeBrief('Mở chi nhánh mới', [], [], 5);

    expect(sim.twelveMonthRevenueProjectionVnd).toBeGreaterThan(0);
    expect(brief.finalRecommendation).toBeDefined();
    expect(brief.prosSummary.length).toBeGreaterThan(0);
  });

  it('5. Cognitive Cache & Decision Graph (Contracts 34 & 35): should cache queries & log permanent decision node', () => {
    const cache = CognitiveCache.getInstance();
    cache.set('default-tenant', 'Query A', 'Summary', 'plan-1', 'harness-1');
    const cached = cache.get('default-tenant', 'Query A');

    expect(cached).toBeDefined();
    expect(cached?.queryHash).toContain('default-tenant');

    const graphNode = EnterpriseDecisionGraph.getInstance().recordDecisionNode('default-tenant', 'Decision Title A', ['e1'], 'session-1');
    expect(graphNode.decisionId).toMatch(/^dec-node-/);
  });

  it('6. Master Deliberation Pipeline (Contract 33: IDeliberationSession): complete multi-agent deliberation', async () => {
    const session = await DeliberationPipelineOrchestrator.getInstance().executeDeliberationSession('default-tenant', 'Mở chi nhánh mới');

    expect(session.sessionId).toMatch(/^delib-session-/);
    expect(session.taskDecomposition.length).toBe(5);
    expect(session.expertOpinions.length).toBeGreaterThan(0);
    expect(session.tradeOffMatrix.length).toBeGreaterThan(0);
    expect(session.alternativeOptions.length).toBe(3);
    expect(session.executiveBrief.finalRecommendation).toBeDefined();
  });
});
