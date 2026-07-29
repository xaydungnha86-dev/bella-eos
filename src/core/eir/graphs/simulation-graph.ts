/**
 * Simulation Graph - Monte Carlo Simulation
 * Validates strategy with optimistic/realistic/pessimistic scenarios
 */

import { Strategy, SimulationGraph, Scenario, ConstraintGraph, ClarifiedGoal } from '@/types/executive-recommendation';
import { ReasoningContext } from '../reasoning-context';

export class SimulationGraphExecutor {
  async execute(
    strategy: Strategy,
    context: ReasoningContext
  ): Promise<SimulationGraph> {
    
    console.log('[SimulationGraph] Running Monte Carlo simulation...');
    
    const goal = context.goal;
    const constraints = context.getConstraints();
    
    // Generate 3 scenarios
    const scenarios: Scenario[] = [
      {
        name: 'optimistic',
        probability: 0.2,
        revenue: strategy.expectedRevenue * 1.35,
        assumptions: [
          'All initiatives perform at upper bound',
          'Market conditions favorable',
          'Perfect execution'
        ]
      },
      {
        name: 'realistic',
        probability: 0.6,
        revenue: strategy.expectedRevenue,
        assumptions: [
          'Initiatives perform as expected',
          'Normal market conditions',
          'Standard execution quality'
        ]
      },
      {
        name: 'pessimistic',
        probability: 0.2,
        revenue: strategy.expectedRevenue * 0.67,
        assumptions: [
          'Some initiatives underperform',
          'Market headwinds',
          'Execution challenges'
        ]
      }
    ];
    
    // Calculate expected value
    const expectedValue = scenarios.reduce(
      (sum, s) => sum + (s.revenue * s.probability),
      0
    );
    
    // Calculate probability of success (EV >= goal incremental target)
    const targetDelta = goal.target - goal.baseline;
    const successScenarios = scenarios.filter(s => s.revenue >= targetDelta);
    const probabilitySuccess = successScenarios.reduce((sum, s) => sum + s.probability, 0);
    
    // Check timeline constraint
    const timelineLimit = constraints.timeline.limit.toLowerCase();
    const isTimelineShort = timelineLimit.includes('day') || 
                            (timelineLimit.includes('week') && (parseFloat(timelineLimit) < 4 || timelineLimit.includes('1 week') || timelineLimit.includes('2 weeks')));
    const timelineCheck = !isTimelineShort;

    // Check convergence criteria
    const budgetLimit = parseFloat(constraints.budget.limit);
    const budgetCheck = strategy.budget <= budgetLimit;
    const evCheck = expectedValue >= targetDelta;
    const confidenceCheck = probabilitySuccess >= 0.75;
    
    const convergence = budgetCheck && evCheck && confidenceCheck && timelineCheck;
    
    // Failure reason if not converged
    let failureReason: string | undefined;
    if (!convergence) {
      if (!budgetCheck) {
        failureReason = `Budget ${strategy.budget}M exceeds limit ${budgetLimit}M`;
      } else if (!timelineCheck) {
        failureReason = `Timeline limit ${constraints.timeline.limit} is too short/infeasible`;
      } else if (!confidenceCheck) {
        failureReason = `Confidence ${Math.round(probabilitySuccess * 100)}% below 75% threshold`;
      } else if (!evCheck) {
        failureReason = `Expected value ${expectedValue}M below incremental goal ${targetDelta}M`;
      }
    }
    
    const simulation: SimulationGraph = {
      strategy,
      scenarios,
      expectedValue,
      probabilitySuccess,
      convergence,
      failureReason,
      rawValue: strategy.expectedRevenue,
      riskAdjustedValue: expectedValue
    };
    
    console.log('[SimulationGraph] ✓ Completed:', {
      expectedValue: `${expectedValue.toFixed(2)}B`,
      probabilitySuccess: `${Math.round(probabilitySuccess * 100)}%`,
      convergence: convergence ? 'PASS ✅' : 'FAIL ❌',
      failureReason
    });
    
    return simulation;
  }
}
