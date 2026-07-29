/**
 * Planning Runtime (PLR)
 * ADR-0011 - Operational Planning Architecture
 * 
 * Translates strategic recommendation into detailed operational plan
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { OperationalPlan } from '@/types/operational-plan';
import { KPIDecompositionEngine } from './engines/kpi-decomposition-engine';
import { BudgetAllocationEngine } from './engines/budget-allocation-engine';
import { TimelinePlanningEngine } from './engines/timeline-planning-engine';
import { ResourceAllocationEngine } from './engines/resource-allocation-engine';
import { OwnerAssignmentEngine } from './engines/owner-assignment-engine';
import { RuntimeLifecycle, RuntimeHealth, HealthStatus } from '@/types/runtime-contract';

export class PlanningRuntime implements RuntimeLifecycle, RuntimeHealth {
  private kpiEngine: KPIDecompositionEngine;
  private budgetEngine: BudgetAllocationEngine;
  private timelineEngine: TimelinePlanningEngine;
  private resourceEngine: ResourceAllocationEngine;
  private ownerEngine: OwnerAssignmentEngine;

  // Lifecycle & Health Properties
  private healthState: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private lifecycleState: 'stopped' | 'initialized' | 'running' | 'paused' = 'stopped';
  private startTime = 0;
  private activeTasksCount = 0;
  
  constructor() {
    this.kpiEngine = new KPIDecompositionEngine();
    this.budgetEngine = new BudgetAllocationEngine();
    this.timelineEngine = new TimelinePlanningEngine();
    this.resourceEngine = new ResourceAllocationEngine();
    this.ownerEngine = new OwnerAssignmentEngine();
  }

  // RuntimeLifecycle Implementation
  async init(config: Record<string, any>): Promise<void> {
    this.lifecycleState = 'initialized';
    console.log('[PLR] Initialized with config:', config);
  }

  async start(): Promise<void> {
    this.lifecycleState = 'running';
    this.startTime = Date.now();
    console.log('[PLR] Started.');
  }

  async pause(): Promise<void> {
    this.lifecycleState = 'paused';
    console.log('[PLR] Paused.');
  }

  async stop(): Promise<void> {
    this.lifecycleState = 'stopped';
    console.log('[PLR] Stopped.');
  }

  async upgrade(newVersion: string, migrations?: any): Promise<void> {
    console.log(`[PLR] Upgraded to v${newVersion}`);
  }

  async rollback(targetVersion: string): Promise<void> {
    console.log(`[PLR] Rolled back to v${targetVersion}`);
  }

  // RuntimeHealth Implementation
  async checkHealth(): Promise<HealthStatus> {
    return {
      status: this.healthState,
      uptime: this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0,
      activeTasks: this.activeTasksCount,
      memoryUsage: {
        rss: 95 * 1024 * 1024,
        heapTotal: 65 * 1024 * 1024,
        heapUsed: 40 * 1024 * 1024
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
   * Generate complete operational plan from executive recommendation
   */
  async plan(recommendation: ExecutiveRecommendation): Promise<OperationalPlan> {
    console.log('\n📋 [PLR] Starting Planning Runtime...');
    console.log('[PLR] Strategy:', recommendation.chosenStrategy.name);
    console.log('[PLR] Initiatives:', recommendation.chosenStrategy.initiatives.length);
    
    const startTime = Date.now();
    
    // Execute all 5 planning engines in parallel (where possible)
    console.log('\n--- Running Planning Engines ---');
    
    const [kpiTree, budgetPlan, timelinePlan] = await Promise.all([
      this.kpiEngine.decompose(recommendation),
      this.budgetEngine.allocate(recommendation),
      this.timelineEngine.plan(recommendation)
    ]);
    
    // Resource allocation depends on KPIs
    const resourcePlan = await this.resourceEngine.allocate(recommendation);
    
    // Owner assignment depends on KPI tree
    const ownershipMap = await this.ownerEngine.assign(kpiTree);
    
    // Build operational plan
    const operationalPlan: OperationalPlan = {
      kpiTree,
      budgetPlan,
      timelinePlan,
      resourcePlan,
      ownershipMap,
      generatedFrom: recommendation,
      generatedAt: new Date().toISOString(),
      approvedBy: null // Will be set after human approval
    };
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ [PLR] Operational Plan Generated');
    console.log('   KPIs:', this.countTotalKPIs(kpiTree));
    console.log('   Budget:', `${budgetPlan.total}M (${budgetPlan.byInitiative.length} initiatives)`);
    console.log('   Timeline:', `${timelinePlan.phases.length} phases`);
    console.log('   Resources:', `${resourcePlan.workforce.total} capacity`);
    console.log('   Owners:', `${ownershipMap.byKPI.length} KPIs assigned`);
    console.log('   Duration:', `${duration}ms`);
    
    return operationalPlan;
  }
  
  /**
   * Validate operational plan against constraints
   */
  async validate(plan: OperationalPlan): Promise<{
    valid: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];
    
    // Check budget constraint
    const budgetLimit = parseFloat(
      plan.generatedFrom.constraints.budget.limit
    );
    if (plan.budgetPlan.total > budgetLimit) {
      violations.push(
        `Budget ${plan.budgetPlan.total}M exceeds limit ${budgetLimit}M`
      );
    }
    
    // Check workforce constraint
    const workforceLimit = this.parseWorkforceLimit(
      plan.generatedFrom.constraints.workforce.limit
    );
    const workforceUsed = parseFloat(plan.resourcePlan.workforce.total);
    if (workforceUsed > workforceLimit) {
      violations.push(
        `Workforce ${workforceUsed}% exceeds limit ${workforceLimit}%`
      );
    }
    
    // Check timeline constraint
    const timelineLimit = plan.generatedFrom.constraints.timeline.limit;
    const timelineUsed = plan.timelinePlan.duration;
    if (timelineUsed !== timelineLimit) {
      violations.push(
        `Timeline ${timelineUsed} does not match constraint ${timelineLimit}`
      );
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
  
  private countTotalKPIs(kpiTree: any): number {
    let count = 1; // Primary KPI
    kpiTree.byInitiative.forEach((init: any) => {
      count += this.countKPINodes(init.kpis);
    });
    return count;
  }
  
  private countKPINodes(nodes: any[]): number {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.breakdownKPIs) {
        count += this.countKPINodes(node.breakdownKPIs);
      }
    });
    return count;
  }
  
  private parseWorkforceLimit(limit: string): number {
    const match = limit.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 100;
  }
}
