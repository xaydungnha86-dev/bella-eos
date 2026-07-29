/**
 * EIR ↔ PLR Integration Layer
 * Orchestrates full cycle: CEO Intent → EIR → Approval → PLR → Operational Plan → Saga Execution
 */

import { ExecutiveIntelligenceRuntime } from '../eir/executive-intelligence-runtime';
import { PlanningRuntime } from '../plr/planning-runtime';
import { HumanApprovalGate, ApprovalDecision } from './human-approval-gate';
import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { OperationalPlan } from '@/types/operational-plan';
import { ExecutiveStageGraph } from '../eir/executive-layer/executive-stage-graph';
import { ExecutiveSession } from '@/types/executive-session';
import { PLRToSagaCompiler } from '../orchestration/plr-to-saga-compiler';
import { WorkflowRuntime } from '../orchestration/workflow-runtime';
import { SopSelector, SopSelectionResult } from '../orchestration/sop-selector';
import { SopMetricsStore } from '../orchestration/sop-metrics-store';

export interface FullCycleResult {
  // CEO Input
  ceoIntent: string;

  // Explainable SOP Selection (Phase 5)
  sopSelection?: SopSelectionResult;
  
  // Executive Session (Stage 3)
  session?: ExecutiveSession;
  
  // EIR Output
  recommendation: ExecutiveRecommendation;
  
  // Approval
  approval: ApprovalDecision;
  
  // PLR Output
  operationalPlan: OperationalPlan | null;
  
  // Execution Output (Phase 4 Reliability)
  executionSuccess?: boolean;
  workflowId?: string;

  // Metrics
  metrics: {
    eirDuration: number;
    approvalDuration: number;
    plrDuration: number;
    totalDuration: number;
  };
  
  // Status
  status: 'approved' | 'rejected' | 'error';
  error?: string;
}

export class EIRPLRIntegration {
  private eir: ExecutiveIntelligenceRuntime;
  private plr: PlanningRuntime;
  private approvalGate: HumanApprovalGate;
  private stageGraph: ExecutiveStageGraph;
  
  constructor() {
    this.eir = new ExecutiveIntelligenceRuntime();
    this.plr = new PlanningRuntime();
    this.approvalGate = new HumanApprovalGate();
    this.stageGraph = new ExecutiveStageGraph();
  }
  
  /**
   * Execute complete cycle from CEO intent to operational plan
   * 
   * Flow:
   * 1. CEO Intent → Goal Clarification
   * 2. Goal → EIR (Strategic Reasoning)
   * 3. Recommendation → Human Approval Gate
   * 4. If Approved → PLR (Operational Planning)
   * 5. Return Full Result
   */
  async executeFullCycle(ceoIntent: string): Promise<FullCycleResult> {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 BELLA EOS v3.5 - FULL CYCLE EXECUTION (STAGE 3)');
    console.log('='.repeat(80));
    console.log('CEO Intent:', ceoIntent);
    console.log('='.repeat(80) + '\n');
    
    const startTime = Date.now();
    let eirDuration = 0;
    let approvalDuration = 0;
    let plrDuration = 0;
    
    // Initialize Executive Session
    const session: ExecutiveSession = {
      sessionId: `session-${Date.now()}`,
      intent: ceoIntent,
      context: null,
      healthReport: null,
      frontier: null,
      negotiationLog: [],
      decisionTrace: null,
      approvalState: { status: 'pending' },
      agreedGoal: null,
      reasoningOutput: null
    };
    
    try {
      // ==================== PHASE 0: EXPLAINABLE SOP SELECTION ====================
      console.log('📍 PHASE 0: EXPLAINABLE SOP SELECTION');
      console.log('-'.repeat(80));
      const selector = new SopSelector();
      const sopSelection = selector.selectSop(ceoIntent);
      console.log(`   Matched SOP: [${sopSelection.selectedSop.sopName}] (Confidence: ${Math.round(sopSelection.confidence * 100)}%)`);
      console.log(`   Reasons:`, sopSelection.reasons.join(' | '));

      // ==================== PHASE 1: EIR ====================
      console.log('\n📍 PHASE 1: EXECUTIVE INTELLIGENCE RUNTIME');
      console.log('-'.repeat(80));

      const eirStart = Date.now();
      
      // Step 1: Execute executive stage graph (Stage 3 context & negotiation)
      await this.stageGraph.executeGraph(session);
      
      if (!session.agreedGoal) {
        throw new Error('Failed to clarify and negotiate goal');
      }
      
      // Step 2: Execute reasoning graph
      const recommendation = await this.eir.executeReasoningGraph(session.agreedGoal);
      session.reasoningOutput = recommendation;
      
      eirDuration = Date.now() - eirStart;
      
      console.log('\n✅ EIR Phase Complete');
      console.log('   Duration:', `${eirDuration}ms`);
      console.log('   Strategy:', recommendation.chosenStrategy.name);
      console.log('   Confidence:', `${Math.round(recommendation.confidence * 100)}%`);
      
      // ==================== PHASE 2: APPROVAL ====================
      console.log('\n📍 PHASE 2: HUMAN APPROVAL GATE');
      console.log('-'.repeat(80));
      
      const approvalStart = Date.now();
      
      // Display recommendation for CEO
      const reviewSummary = this.approvalGate.formatForReview(recommendation);
      console.log(reviewSummary);
      
      // Submit for approval
      const approval = await this.approvalGate.submitForApproval(recommendation);
      
      approvalDuration = Date.now() - approvalStart;
      
      if (!approval.approved) {
        console.log('\n❌ CYCLE TERMINATED: CEO rejected recommendation');
        console.log('   Reason:', approval.comments);
        
        session.approvalState.status = 'rejected';
        session.approvalState.comments = approval.comments;
        
        return {
          ceoIntent,
          sopSelection,
          session,
          recommendation,
          approval,
          operationalPlan: null,
          metrics: {
            eirDuration,
            approvalDuration,
            plrDuration: 0,
            totalDuration: Date.now() - startTime
          },
          status: 'rejected'
        };
      }
      
      console.log('\n✅ Approval Phase Complete');
      console.log('   Duration:', `${approvalDuration}ms`);
      console.log('   Approved by:', approval.approvedBy);
      
      session.approvalState.status = 'approved';
      session.approvalState.approvedBy = approval.approvedBy;
      
      // Apply any CEO modifications
      let finalRecommendation = recommendation;
      if (approval.modifications && approval.modifications.length > 0) {
        finalRecommendation = this.approvalGate.applyModifications(
          recommendation, 
          approval.modifications
        );
        console.log('   Modifications applied:', approval.modifications.length);
        session.approvalState.modifications = approval.modifications;
      }
      
      // ==================== PHASE 3: PLR ====================
      console.log('\n📍 PHASE 3: PLANNING RUNTIME');
      console.log('-'.repeat(80));
      
      const plrStart = Date.now();
      
      // Generate operational plan
      const operationalPlan = await this.plr.plan(finalRecommendation);
      
      // Set approval info
      operationalPlan.approvedBy = approval.approvedBy;
      
      // Validate plan
      const validation = await this.plr.validate(operationalPlan);
      if (!validation.valid) {
        console.log('\n⚠️ WARNING: Operational plan has violations:');
        validation.violations.forEach(v => console.log('   -', v));
      }
      
      plrDuration = Date.now() - plrStart;
      
      // ==================== PHASE 4: EXECUTION ====================
      console.log('\n📍 PHASE 4: DYNAMIC SAGA WORKFLOW EXECUTION');
      console.log('-'.repeat(80));
      
      const workflowId = `wf-cycle-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const sagaSteps = PLRToSagaCompiler.compile(operationalPlan);
      
      console.log(`   Compiled ${sagaSteps.length} Saga steps. Executing workflow [${workflowId}]...`);
      const executionSuccess = await WorkflowRuntime.getInstance().executeSaga(
        workflowId,
        finalRecommendation.chosenStrategy.name,
        sagaSteps,
        undefined, // traceId
        sopSelection.selectedSop.sopId,
        sopSelection.selectedSop.version
      );

      console.log('✅ Execution Phase Complete');
      console.log('   Saga Execution Result:', executionSuccess ? 'SUCCESS 🎉' : 'COMPENSATED/FAILED ❌');

      // ==================== SUMMARY ====================
      const totalDuration = Date.now() - startTime;

      // Record SOP Execution Metrics
      SopMetricsStore.getInstance().recordExecution({
        sopId: sopSelection.selectedSop.sopId,
        sopName: sopSelection.selectedSop.sopName,
        workflowId,
        status: executionSuccess ? 'SUCCESS' : 'COMPENSATED',
        durationMs: totalDuration,
        allocatedBudgetVnd: operationalPlan.budgetPlan.total,
        actualBudgetVnd: Math.round(operationalPlan.budgetPlan.total * 0.95),
        businessOutcome: `Execution ${executionSuccess ? 'succeeded' : 'failed'} for strategy: ${finalRecommendation.chosenStrategy.name}`
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('🎉 FULL CYCLE COMPLETE');
      console.log('='.repeat(80));
      console.log('Status:', 'APPROVED, PLANNED & EXECUTED ✅');
      console.log('Total Duration:', `${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
      console.log('  - EIR:', `${eirDuration}ms`);
      console.log('  - Approval:', `${approvalDuration}ms`);
      console.log('  - PLR:', `${plrDuration}ms`);
      console.log('='.repeat(80) + '\n');
      
      return {
        ceoIntent,
        sopSelection,
        session,
        recommendation: finalRecommendation,
        approval,
        operationalPlan,
        executionSuccess,
        workflowId,
        metrics: {
          eirDuration,
          approvalDuration,
          plrDuration,
          totalDuration
        },
        status: 'approved'
      };
      
    } catch (error) {
      console.error('\n❌ CYCLE FAILED:', error);
      
      return {
        ceoIntent,
        session,
        recommendation: null as any,
        approval: null as any,
        operationalPlan: null,
        metrics: {
          eirDuration,
          approvalDuration,
          plrDuration,
          totalDuration: Date.now() - startTime
        },
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Execute only EIR phase (strategic reasoning)
   * Useful for "what-if" analysis without commitment
   */
  async executeEIROnly(ceoIntent: string): Promise<ExecutiveRecommendation> {
    const session: ExecutiveSession = {
      sessionId: `session-${Date.now()}`,
      intent: ceoIntent,
      context: null,
      healthReport: null,
      frontier: null,
      negotiationLog: [],
      decisionTrace: null,
      approvalState: { status: 'pending' },
      agreedGoal: null,
      reasoningOutput: null
    };

    await this.stageGraph.executeGraph(session);

    if (!session.agreedGoal) {
      throw new Error('Failed to clarify and negotiate goal');
    }

    return await this.eir.executeReasoningGraph(session.agreedGoal);
  }
  
  /**
   * Execute only PLR phase (operational planning)
   * Useful when recommendation is already approved
   */
  async executePLROnly(
    recommendation: ExecutiveRecommendation
  ): Promise<OperationalPlan> {
    return await this.plr.plan(recommendation);
  }
  
  /**
   * Get approval summary for display
   */
  getApprovalSummary(recommendation: ExecutiveRecommendation): string {
    return this.approvalGate.formatForReview(recommendation);
  }
}
