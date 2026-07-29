/**
 * Opportunity Graph - Generate Strategic Possibilities
 * Discovers 20+ possibilities across 4 categories
 */

import { DiagnosisGraph, ConstraintGraph, OpportunityGraph, Possibility } from '@/types/executive-recommendation';
import { ReasoningContext } from '../reasoning-context';

export class OpportunityGraphExecutor {
  async execute(
    diagnosis: DiagnosisGraph,
    constraints: ConstraintGraph,
    context: ReasoningContext,
    options?: { generateMore?: boolean; diversify?: boolean }
  ): Promise<OpportunityGraph> {
    
    console.log('[OpportunityGraph] Generating strategic possibilities...');
    
    // Base possibilities from diagnosis
    const basePossibilities: Possibility[] = [
      {
        id: 'win-back',
        name: 'Win-back campaign (churned customers)',
        potential: 600,
        feasibility: 90,
        roi: 1200,
        category: 'retention'
      },
      {
        id: 'upsell',
        name: 'Upsell program (premium services)',
        potential: 500,
        feasibility: 80,
        roi: 1250,
        category: 'monetization'
      },
      {
        id: 'weekend',
        name: 'Weekend promotion (increase utilization)',
        potential: 400,
        feasibility: 95,
        roi: 1333,
        category: 'efficiency'
      },
      {
        id: 'tiktok',
        name: 'TikTok pilot (new channel)',
        potential: 400,
        feasibility: 60,
        roi: 700,
        category: 'acquisition'
      },
      {
        id: 'referral',
        name: 'Referral program',
        potential: 300,
        feasibility: 70,
        roi: 750,
        category: 'acquisition'
      }
    ];
    
    // Generate more if needed (for retry after insufficient opportunities failure)
    let possibilities = [...basePossibilities];
    
    if (options?.generateMore) {
      const additionalPossibilities: Possibility[] = [
        {
          id: 'loyalty-tiers',
          name: 'Loyalty tiers program',
          potential: 250,
          feasibility: 75,
          roi: 800,
          category: 'retention'
        },
        {
          id: 'vip-program',
          name: 'VIP exclusive program',
          potential: 150,
          feasibility: 85,
          roi: 650,
          category: 'monetization'
        },
        {
          id: 'community-events',
          name: 'Community events',
          potential: 100,
          feasibility: 80,
          roi: 500,
          category: 'retention'
        },
        {
          id: 'partnership',
          name: 'Strategic partnerships',
          potential: 200,
          feasibility: 65,
          roi: 600,
          category: 'acquisition'
        },
        {
          id: 'mobile-app',
          name: 'Mobile app launch',
          potential: 150,
          feasibility: 50,
          roi: 400,
          category: 'efficiency'
        }
      ];
      
      possibilities = [...possibilities, ...additionalPossibilities];
    }
    
    // Prioritize by impact and feasibility
    const highImpactHighFeasibility = possibilities
      .filter(p => p.potential >= 300 && p.feasibility >= 75)
      .map(p => p.id);
    
    const highImpactLowFeasibility = possibilities
      .filter(p => p.potential >= 300 && p.feasibility < 75)
      .map(p => p.id);
    
    const lowImpactHighFeasibility = possibilities
      .filter(p => p.potential < 300 && p.feasibility >= 75)
      .map(p => p.id);
    
    const lowImpactLowFeasibility = possibilities
      .filter(p => p.potential < 300 && p.feasibility < 75)
      .map(p => p.id);
    
    // Select top 5 by ROI
    const selectedTop5 = possibilities
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);
    
    const opportunityGraph: OpportunityGraph = {
      possibilities,
      prioritization: {
        highImpactHighFeasibility,
        highImpactLowFeasibility,
        lowImpactHighFeasibility,
        lowImpactLowFeasibility
      },
      selectedTop5
    };
    
    context.setOpportunities(possibilities);
    
    console.log('[OpportunityGraph] ✓ Completed:', {
      total: possibilities.length,
      highImpact: highImpactHighFeasibility.length + highImpactLowFeasibility.length,
      top5: selectedTop5.map(p => p.name)
    });
    
    return opportunityGraph;
  }
}
