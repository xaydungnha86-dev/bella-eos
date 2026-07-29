/**
 * Constraint Graph - Identify Strategic Constraints
 * Budget, workforce, timeline, technology, policy, market limits
 */

import { ClarifiedGoal, ConstraintGraph, Constraint } from '@/types/executive-recommendation';
import { ReasoningContext } from '../reasoning-context';

export class ConstraintGraphExecutor {
  async execute(
    goal: ClarifiedGoal,
    context: ReasoningContext,
    options?: { addMissing?: string[] }
  ): Promise<ConstraintGraph> {
    
    console.log('[ConstraintGraph] Identifying strategic constraints...');
    
    const constraintsList = goal.constraints || [];
    
    // Parse budget constraint
    const budgetMatch = constraintsList.find(c => c.toLowerCase().includes('budget'));
    const budgetLimit = budgetMatch ? this.extractNumber(budgetMatch) : 150; // Default 150M
    
    // Parse workforce constraint
    const workforceMatch = constraintsList.find(c => c.toLowerCase().includes('hiring') || c.toLowerCase().includes('workforce'));
    const workforceLimit = workforceMatch?.includes('No hiring') ? 20 : 100; // 20% if no hiring
    
    // Parse timeline
    const timelineLimit = goal.by || '4 weeks';
    
    const constraints: ConstraintGraph = {
      budget: {
        type: 'financial',
        limit: `${budgetLimit}M`,
        current: '0M allocated',
        status: 'acceptable'
      },
      workforce: {
        type: 'human_resources',
        limit: `${workforceLimit}% capacity available`,
        current: '0% allocated',
        status: 'acceptable'
      },
      timeline: {
        type: 'time',
        limit: timelineLimit,
        current: '0 elapsed',
        status: 'acceptable'
      },
      technology: {
        type: 'infrastructure',
        limit: 'Current tech stack only',
        current: 'CRM, Email platform, Ads platform',
        status: 'acceptable',
        mitigation: 'No new platforms required'
      },
      policy: {
        type: 'compliance',
        limit: 'No discounts > 25%',
        current: 'No active discounts',
        status: 'acceptable'
      },
      market: {
        type: 'external',
        limit: 'High season (favorable)',
        current: 'Market growing 15% YoY',
        status: 'acceptable'
      }
    };
    
    // Add missing constraints from failure analysis
    if (options?.addMissing) {
      options.addMissing.forEach(evidence => {
        const lower = evidence.toLowerCase();
        if (lower.includes('workforce')) {
          constraints.workforce.status = 'blocking';
          constraints.workforce.mitigation = 'Detected capacity issue in simulation';
        }
        if (lower.includes('budget')) {
          constraints.budget.status = 'blocking';
          constraints.budget.mitigation = 'Detected budget overrun in simulation';
        }
        if (lower.includes('timeline') || lower.includes('time')) {
          constraints.timeline.status = 'blocking';
          constraints.timeline.mitigation = 'Detected timeline conflict in simulation';
        }
      });
    }
    
    context.setConstraints(constraints);
    
    console.log('[ConstraintGraph] ✓ Completed:', {
      budget: constraints.budget.limit,
      workforce: constraints.workforce.limit,
      timeline: constraints.timeline.limit
    });
    
    return constraints;
  }
  
  private extractNumber(text: string): number {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 150;
  }
}
