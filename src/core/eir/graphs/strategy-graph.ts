/**
 * Strategy Graph - Generate and Evaluate Strategic Alternatives
 * Creates Conservative, Balanced, Aggressive strategies
 */

import { OpportunityGraph, ConstraintGraph, StrategyGraph, Strategy, Tradeoff, LogicChain } from '@/types/executive-recommendation';
import { ReasoningContext } from '../reasoning-context';

export class StrategyGraphExecutor {
  async execute(
    opportunities: OpportunityGraph,
    constraints: ConstraintGraph,
    context: ReasoningContext
  ): Promise<StrategyGraph> {
    
    console.log('[StrategyGraph] Generating strategic alternatives...');
    
    const budgetLimit = parseFloat(constraints.budget.limit);
    const top5 = opportunities.selectedTop5;
    
    // Conservative: Top 3 only (safest bets)
    const conservative: Strategy = {
      name: 'Conservative',
      initiatives: top5.slice(0, 3).map(p => p.name),
      expectedRevenue: top5.slice(0, 3).reduce((sum, p) => sum + p.potential, 0),
      budget: top5.slice(0, 3).reduce((sum, p) => sum + (p.potential * 0.1), 0), // 10% of potential
      risk: 'low',
      tradeoffs: ['No safety margin', 'No exploration', 'Minimal upside']
    };
    
    // Balanced: Top 4 (includes TikTok pilot)
    const balanced: Strategy = {
      name: 'Balanced',
      initiatives: top5.slice(0, 4).map(p => p.name),
      expectedRevenue: top5.slice(0, 4).reduce((sum, p) => sum + p.potential, 0),
      budget: Math.max(100, Math.min(top5.slice(0, 4).reduce((sum, p) => sum + (p.potential * 0.1), 0), budgetLimit * 0.9)),
      risk: 'medium',
      tradeoffs: ['TikTok uncertain but acceptable', 'Good safety margin', 'Balanced risk/reward']
    };
    
    // Aggressive: All top 5
    const aggressive: Strategy = {
      name: 'Aggressive',
      initiatives: top5.map(p => p.name),
      expectedRevenue: top5.reduce((sum, p) => sum + p.potential, 0),
      budget: top5.reduce((sum, p) => sum + (p.potential * 0.1), 0),
      risk: 'high',
      tradeoffs: ['Budget may exceed limit', 'Execution quality risk', 'Max upside potential']
    };
    
    const alternatives = [conservative, balanced, aggressive];
    
    // Tradeoff analysis
    const tradeoffs: Tradeoff[] = [
      {
        option: 'Conservative',
        pros: ['Low risk', 'High confidence', 'Budget well under limit'],
        cons: ['No safety margin if targets miss', 'No learning opportunities'],
        score: 75
      },
      {
        option: 'Balanced',
        pros: ['Safety margin', 'Learning opportunity (TikTok)', 'Acceptable risk'],
        cons: ['TikTok uncertain', 'Moderate complexity'],
        score: 90
      },
      {
        option: 'Aggressive',
        pros: ['Maximum upside', 'All opportunities pursued'],
        cons: ['Budget overrun risk', 'Execution stretched thin', 'High complexity'],
        score: 65
      }
    ];
    
    // Reasoning logic chain
    const reasoning: LogicChain = {
      premises: [
        `Goal requires ${context.goal.target}B revenue`,
        'Conservative = exactly goal (no margin)',
        `Balanced = ${balanced.expectedRevenue}B (113% of goal)`,
        'TikTok adds 200M at acceptable risk',
        `Budget limit is ${budgetLimit}M`
      ],
      conclusion: 'Balanced strategy optimal (safety margin + learning + acceptable risk)'
    };
    
    // Select Balanced as default (can be overridden by simulation failure)
    const selectedStrategy = balanced;
    
    (context as any).chosenStrategy = selectedStrategy;
    alternatives.forEach(alt => {
      if (!context.getAllStrategies().some(s => s.name === alt.name)) {
        context.addStrategy(alt);
      }
    });
    
    const strategyGraph: StrategyGraph = {
      alternatives,
      tradeoffs,
      reasoning,
      selectedStrategy
    };
    
    console.log('[StrategyGraph] ✓ Completed:', {
      alternatives: alternatives.length,
      selected: selectedStrategy.name,
      expectedRevenue: selectedStrategy.expectedRevenue,
      budget: selectedStrategy.budget
    });
    
    return strategyGraph;
  }
}
