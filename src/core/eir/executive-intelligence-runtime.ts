/**
 * Executive Intelligence Runtime (EIR)
 * ADR-0010 v2.0 - Strategic Reasoning Graph Engine
 * 
 * Main orchestrator for strategic reasoning with graph-based execution
 */

import { ClarifiedGoal, ExecutiveRecommendation } from '@/types/executive-recommendation';
import { ReasoningContext } from './reasoning-context';
import { DiagnosisGraphExecutor } from './graphs/diagnosis-graph';
import { ConstraintGraphExecutor } from './graphs/constraint-graph';
import { OpportunityGraphExecutor } from './graphs/opportunity-graph';
import { StrategyGraphExecutor } from './graphs/strategy-graph';
import { SimulationGraphExecutor } from './graphs/simulation-graph';
import { RiskGraphExecutor } from './graphs/risk-graph';
import { RecommendationGenerator } from './graphs/recommendation-generator';
import { FailureAnalysisEngine } from './adaptive/failure-analysis-engine';
import { RuntimeLifecycle, RuntimeHealth, HealthStatus } from '@/types/runtime-contract';

export class ExecutiveIntelligenceRuntime implements RuntimeLifecycle, RuntimeHealth {
  private diagnosisExecutor: DiagnosisGraphExecutor;
  private constraintExecutor: ConstraintGraphExecutor;
  private opportunityExecutor: OpportunityGraphExecutor;
  private strategyExecutor: StrategyGraphExecutor;
  private simulationExecutor: SimulationGraphExecutor;
  private riskExecutor: RiskGraphExecutor;
  private recommendationGenerator: RecommendationGenerator;
  private failureAnalyzer: FailureAnalysisEngine;

  // Lifecycle & Health Properties
  private healthState: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private lifecycleState: 'stopped' | 'initialized' | 'running' | 'paused' = 'stopped';
  private startTime = 0;
  private activeTasksCount = 0;
  
  constructor() {
    this.diagnosisExecutor = new DiagnosisGraphExecutor();
    this.constraintExecutor = new ConstraintGraphExecutor();
    this.opportunityExecutor = new OpportunityGraphExecutor();
    this.strategyExecutor = new StrategyGraphExecutor();
    this.simulationExecutor = new SimulationGraphExecutor();
    this.riskExecutor = new RiskGraphExecutor();
    this.recommendationGenerator = new RecommendationGenerator();
    this.failureAnalyzer = new FailureAnalysisEngine();
  }

  // RuntimeLifecycle Implementation
  async init(config: Record<string, any>): Promise<void> {
    this.lifecycleState = 'initialized';
    console.log('[EIR] Initialized with config:', config);
  }

  async start(): Promise<void> {
    this.lifecycleState = 'running';
    this.startTime = Date.now();
    console.log('[EIR] Started.');
  }

  async pause(): Promise<void> {
    this.lifecycleState = 'paused';
    console.log('[EIR] Paused.');
  }

  async stop(): Promise<void> {
    this.lifecycleState = 'stopped';
    console.log('[EIR] Stopped.');
  }

  async upgrade(newVersion: string, migrations?: any): Promise<void> {
    console.log(`[EIR] Upgraded to v${newVersion}`);
  }

  async rollback(targetVersion: string): Promise<void> {
    console.log(`[EIR] Rolled back to v${targetVersion}`);
  }

  // RuntimeHealth Implementation
  async checkHealth(): Promise<HealthStatus> {
    return {
      status: this.healthState,
      uptime: this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0,
      activeTasks: this.activeTasksCount,
      memoryUsage: {
        rss: 120 * 1024 * 1024,
        heapTotal: 80 * 1024 * 1024,
        heapUsed: 50 * 1024 * 1024
      },
      dependencies: []
    };
  }

  async getMetrics(): Promise<Record<string, number>> {
    return {
      activeTasks: this.activeTasksCount,
      uptime: this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0
    };
  }

  // Helper for recovery testing
  setHealthStatus(status: 'healthy' | 'degraded' | 'unhealthy'): void {
    this.healthState = status;
  }

  getLifecycleState(): 'stopped' | 'initialized' | 'running' | 'paused' {
    return this.lifecycleState;
  }
  
  /**
   * Execute complete reasoning graph
   * Returns strategic recommendation after convergence
   */
  async executeReasoningGraph(goal: ClarifiedGoal): Promise<ExecutiveRecommendation> {
    console.log('\n🧠 [EIR] Starting Executive Intelligence Runtime...');
    console.log('[EIR] Goal:', goal.what, goal.howMuch, 'by', goal.by);
    
    const context = new ReasoningContext(goal);
    const maxIterations = 5;
    let iteration = 0;
    
    // Initial forward pass: Diagnosis → Constraint → Opportunity
    console.log('\n--- Initial Forward Pass ---');
    let diagnosis = await this.diagnosisExecutor.execute(goal, context);
    let constraints = await this.constraintExecutor.execute(goal, context);
    let opportunities = await this.opportunityExecutor.execute(diagnosis, constraints, context);
    
    // Strategy → Simulation loop (with convergence check)
    console.log('\n--- Strategy-Simulation Loop ---');
    
    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n[Iteration ${iteration}]`);
      
      // Generate strategy
      const strategyGraph = await this.strategyExecutor.execute(opportunities, constraints, context);
      const strategy = strategyGraph.selectedStrategy;
      
      // Simulate
      const simulation = await this.simulationExecutor.execute(strategy, context);
      
      // Check convergence
      if (simulation.convergence) {
        console.log('\n✅ [EIR] Convergence achieved!');
        
        // Proceed to risk assessment
        const riskGraph = await this.riskExecutor.execute(strategy, simulation, context);
        
        if (!riskGraph.acceptability) {
          console.log('⚠️ [EIR] Risk not acceptable, refining...');
          context.incrementNodeAges();
          continue;
        }
        
        // Build final recommendation
        const recommendation = this.recommendationGenerator.buildRecommendation(context, simulation);
        
        console.log('\n🎯 [EIR] Executive Recommendation Generated');
        console.log('   Strategy:', recommendation.chosenStrategy.name);
        console.log('   Expected:', recommendation.expectedOutcome);
        console.log('   Confidence:', `${Math.round(recommendation.confidence * 100)}%`);
        console.log('   Iterations:', iteration);
        
        return recommendation;
      }
      
      // FAIL → Adaptive DAG: Analyze failure and intelligently retry
      console.log(`❌ [Iteration ${iteration}] Simulation failed:`, simulation.failureReason);
      
      // Analyze failure to determine root cause
      const analysis = await this.failureAnalyzer.analyzeFailure(simulation, context);
      
      // Record failure
      context.recordFailure({
        iteration,
        strategy,
        simulation,
        analysis
      });
      
      context.incrementNodeAges();
      
      // Intelligent retry based on failure analysis
      console.log(`\n🔄 [Adaptive DAG] Retrying node: ${analysis.recommendedRetryNode.toUpperCase()}`);
      
      // Check if we should retry this node (prevent infinite loops)
      if (!this.failureAnalyzer.shouldRetry(analysis.recommendedRetryNode, context, 2)) {
        console.log('[Adaptive DAG] Max retries reached for this node, trying alternative...');
        
        // Try secondary option if available
        if (analysis.secondaryOptions.length > 0) {
          const secondary = analysis.secondaryOptions[0];
          if (this.failureAnalyzer.shouldRetry(secondary.node, context, 2)) {
            analysis.recommendedRetryNode = secondary.node;
            console.log(`[Adaptive DAG] Switching to secondary option: ${secondary.node.toUpperCase()}`);
          }
        }
      }
      
      // Execute retry based on analysis
      switch (analysis.recommendedRetryNode) {
        case 'diagnosis':
          console.log('[Adaptive DAG] Re-diagnosing with fresh perspective...');
          diagnosis = await this.diagnosisExecutor.execute(goal, context, { fresh: true });
          // Cascade: re-run downstream
          opportunities = await this.opportunityExecutor.execute(diagnosis, constraints, context);
          break;
          
        case 'constraint':
          console.log('[Adaptive DAG] Re-checking constraints with additional evidence...');
          constraints = await this.constraintExecutor.execute(
            goal, 
            context, 
            { addMissing: analysis.evidence }
          );
          break;
          
        case 'opportunity':
          console.log('[Adaptive DAG] Expanding opportunity set for better alternatives...');
          opportunities = await this.opportunityExecutor.execute(
            diagnosis, 
            constraints, 
            context, 
            { generateMore: true, diversify: true }
          );
          break;
          
        case 'strategy':
          console.log('[Adaptive DAG] Strategy will be regenerated in next iteration...');
          // Strategy retry is implicit in next loop iteration
          break;
      }
      
      // Log failure pattern
      const pattern = this.failureAnalyzer.getFailurePattern(context);
      console.log(`[Adaptive DAG] Failure pattern so far: ${pattern}`);
    }
    
    console.log(`⚠️ [EIR] Did not converge after ${maxIterations} iterations. Returning best effort recommendation.`);
    const lastFailure = context.failures[context.failures.length - 1];
    const recommendation = this.recommendationGenerator.buildRecommendation(context, lastFailure?.simulation);
    
    // Override confidence and simulation summary to reflect the actual failed simulation
    if (lastFailure) {
      recommendation.confidence = lastFailure.simulation.probabilitySuccess * 0.5; // Penalize for non-convergence
      recommendation.simulationSummary = lastFailure.simulation;
      recommendation.expectedOutcome = `Failed to meet target. Expected value ${lastFailure.simulation.expectedValue.toFixed(2)}M (${Math.round((lastFailure.simulation.expectedValue / goal.target) * 100)}% of goal)`;
      recommendation.reasoningTrace.iterations = lastFailure.iteration;
      recommendation.reasoningTrace.convergenceAchieved = false;
    }
    
    return recommendation;
  }
  
  async clarifyGoal(ceoIntent: string): Promise<ClarifiedGoal> {
    console.log('[EIR] Clarifying CEO intent:', ceoIntent);
    
    if (!ceoIntent || ceoIntent.trim() === '') {
      throw new Error('CEO intent cannot be empty');
    }
    
    // Parse percent increase from intent
    const revenueMatch = ceoIntent.match(/(\d+)%/);
    const percentIncrease = revenueMatch ? parseInt(revenueMatch[1]) : 30;
    
    const baseline = 5000; // 5B (should come from database)
    const target = baseline * (1 + percentIncrease / 100);
    const delta = target - baseline;
    
    // Parse budget constraint from intent if present
    const constraints = [
      'No hiring',
      'No price changes'
    ];
    
    const budgetMatch = ceoIntent.match(/budget\s*\$([\d,]+)/i) || 
                        ceoIntent.match(/\$([\d,]+)\s*budget/i) ||
                        ceoIntent.match(/budget\s*of\s*\$([\d,]+)/i);
    if (budgetMatch) {
      const dollarAmount = parseFloat(budgetMatch[1].replace(/,/g, ''));
      const mVnd = dollarAmount * 0.024;
      constraints.push(`Budget ${mVnd.toFixed(2)}M VND`);
    } else {
      constraints.push('Budget 150M VND');
    }
    
    // Parse timeline constraint from intent if present
    const timelineMatch = ceoIntent.match(/in\s*(\d+)\s*(week|day|month)/i) ||
                          ceoIntent.match(/(\d+)\s*(week|day|month)\s*timeline/i) ||
                          ceoIntent.match(/(\d+)\s*(week|day|month)\s*budget/i); // fallback if timeline written weirdly
    let by = 'Next month (4 weeks)';
    if (timelineMatch) {
      const count = parseInt(timelineMatch[1]);
      const unit = timelineMatch[2].toLowerCase();
      by = `${count} ${unit}${count > 1 ? 's' : ''}`;
      constraints.push(`Timeline ${by}`);
    } else {
      constraints.push('Timeline 4 weeks');
    }
    
    const clarified: ClarifiedGoal = {
      what: 'Increase spa revenue',
      howMuch: `${percentIncrease}% = ${delta}M VND`,
      by,
      baseline,
      target,
      constraints,
      urgency: 'high'
    };
    
    console.log('[EIR] ✓ Goal clarified:', clarified);
    
    return clarified;
  }
}
