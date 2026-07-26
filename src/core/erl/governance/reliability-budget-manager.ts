/**
 * BELLA EOS ERL: Reliability Budget Manager
 * Specification: ERL Governance Engine
 * 
 * Mission: SRE-style error budget registry. Freezes deployment updates upon budget exhaustion.
 */

import { IReliabilityBudget } from '@/types/erl';

export class ReliabilityBudgetManager {
  private static instance: ReliabilityBudgetManager;
  private budgets: Map<string, IReliabilityBudget> = new Map();

  private constructor() {
    this.initializeDefaultBudgets();
  }

  public static getInstance(): ReliabilityBudgetManager {
    if (!ReliabilityBudgetManager.instance) {
      ReliabilityBudgetManager.instance = new ReliabilityBudgetManager();
    }
    return ReliabilityBudgetManager.instance;
  }

  public reportIncident(capability: string, penalty: number): IReliabilityBudget {
    let budget = this.budgets.get(capability);
    if (!budget) {
      budget = {
        capability,
        errorBudgetTotal: 0.05, // 5% error allowed
        errorBudgetRemaining: 0.05,
        burnRate: 1.0,
        deploymentFrozen: false
      };
    }

    budget.errorBudgetRemaining = Math.max(0.0, budget.errorBudgetRemaining - penalty);
    budget.burnRate = Math.round((budget.burnRate + penalty * 50) * 100) / 100;

    if (budget.errorBudgetRemaining <= 0.01) {
      budget.deploymentFrozen = true;
    }

    this.budgets.set(capability, budget);
    return budget;
  }

  public getBudget(capability: string): IReliabilityBudget | undefined {
    return this.budgets.get(capability);
  }

  public resetBudget(capability: string): void {
    const budget = this.budgets.get(capability);
    if (budget) {
      budget.errorBudgetRemaining = budget.errorBudgetTotal;
      budget.burnRate = 1.0;
      budget.deploymentFrozen = false;
      this.budgets.set(capability, budget);
    }
  }

  private initializeDefaultBudgets(): void {
    this.budgets.set('Finance', {
      capability: 'Finance',
      errorBudgetTotal: 0.01, // 1% failure rate allowed
      errorBudgetRemaining: 0.01,
      burnRate: 1.0,
      deploymentFrozen: false
    });
    this.budgets.set('Strategic Planning', {
      capability: 'Strategic Planning',
      errorBudgetTotal: 0.03, // 3%
      errorBudgetRemaining: 0.03,
      burnRate: 1.0,
      deploymentFrozen: false
    });
  }
}
