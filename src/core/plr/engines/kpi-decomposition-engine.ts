/**
 * KPI Decomposition Engine
 * Translates strategic goals into measurable operational KPIs
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { KPITree, InitiativeKPI, KPINode, CheckPoint } from '@/types/operational-plan';

export class KPIDecompositionEngine {
  async decompose(recommendation: ExecutiveRecommendation): Promise<KPITree> {
    console.log('[KPI Decomposition] Breaking down strategic goal into operational KPIs...');
    
    const goal = recommendation.goal;
    const strategy = recommendation.chosenStrategy;
    
    // Primary KPI
    const primary = {
      metric: 'Revenue',
      target: goal.target,
      baseline: goal.baseline
    };
    
    // Decompose by initiative
    const byInitiative: InitiativeKPI[] = [];
    
    strategy.initiatives.forEach(initiative => {
      if (initiative.includes('Win-back') || initiative.includes('churned')) {
        byInitiative.push(this.decomposeWinback(strategy.expectedRevenue));
      } else if (initiative.includes('Upsell') || initiative.includes('premium')) {
        byInitiative.push(this.decomposeUpsell(strategy.expectedRevenue));
      } else if (initiative.includes('Weekend')) {
        byInitiative.push(this.decomposeWeekend(strategy.expectedRevenue));
      } else if (initiative.includes('TikTok')) {
        byInitiative.push(this.decomposeTikTok(strategy.expectedRevenue));
      }
    });
    
    // Leading indicators (early warning system)
    const leadingIndicators = [
      {
        week: 1,
        checkpoints: [
          {
            metric: 'Email list cleaned',
            threshold: 220,
            action: 'If < 220, escalate to CMO'
          },
          {
            metric: 'Sales training attendance',
            threshold: 100,
            action: 'If < 100%, reschedule'
          }
        ]
      },
      {
        week: 2,
        checkpoints: [
          {
            metric: 'Win-back email open rate',
            threshold: 20,
            action: 'If < 20%, A/B test new subject lines'
          },
          {
            metric: 'TikTok video completion rate',
            threshold: 50,
            action: 'If < 50%, revise content strategy'
          }
        ]
      },
      {
        week: 3,
        checkpoints: [
          {
            metric: 'Cumulative revenue',
            threshold: goal.target * 0.6,
            action: 'If < 60%, activate contingency budget'
          }
        ]
      }
    ];
    
    const kpiTree: KPITree = {
      primary,
      byInitiative,
      leadingIndicators
    };
    
    console.log('[KPI Decomposition] ✓ Completed:', {
      initiatives: byInitiative.length,
      totalKPIs: byInitiative.reduce((sum, i) => sum + this.countKPIs(i.kpis), 0)
    });
    
    return kpiTree;
  }
  
  private decomposeWinback(totalRevenue: number): InitiativeKPI {
    const target = totalRevenue * 0.35; // 35% of total (600M if total is 1700M)
    
    return {
      name: 'Win-back',
      target,
      kpis: [
        {
          metric: 'Reactivated Customers',
          target: 66,
          formula: '220 churned × 30% conversion',
          breakdownKPIs: [
            {
              metric: 'Email List Size',
              target: '220',
              baseline: '220',
              industryBenchmark: 'N/A'
            },
            {
              metric: 'Email Open Rate',
              target: '30%',
              baseline: '0%',
              industryBenchmark: '25%'
            },
            {
              metric: 'Click-Through Rate',
              target: '8%',
              baseline: '0%',
              industryBenchmark: '5%'
            },
            {
              metric: 'Conversion Rate',
              target: '15%',
              baseline: '0%',
              industryBenchmark: '10%'
            }
          ]
        },
        {
          metric: 'Lifetime Value per Customer',
          target: '9.1M',
          formula: `${target}M / 66 customers`
        }
      ]
    };
  }
  
  private decomposeUpsell(totalRevenue: number): InitiativeKPI {
    const target = totalRevenue * 0.29; // 29% (500M)
    
    return {
      name: 'Upsell',
      target,
      kpis: [
        {
          metric: 'Premium Customers Converted',
          target: 48,
          formula: '400 customers × 12% upsell rate',
          breakdownKPIs: [
            {
              metric: 'Upsell Attempts per Day',
              target: '5/staff',
              baseline: '0/staff'
            },
            {
              metric: 'Upsell Success Rate',
              target: '12%',
              baseline: '0%',
              industryBenchmark: '10%'
            },
            {
              metric: 'Training Completion',
              target: '100%',
              baseline: '0%'
            }
          ]
        },
        {
          metric: 'Premium Average Order Value',
          target: '10.4M',
          formula: `${target}M / 48 customers`
        }
      ]
    };
  }
  
  private decomposeWeekend(totalRevenue: number): InitiativeKPI {
    const target = totalRevenue * 0.24; // 24% (400M)
    
    return {
      name: 'Weekend',
      target,
      kpis: [
        {
          metric: 'Extra Weekend Bookings',
          target: 32,
          formula: '8 extra bookings × 4 weekends',
          breakdownKPIs: [
            {
              metric: 'Ad Impressions',
              target: '50K',
              baseline: '0'
            },
            {
              metric: 'Ad CTR',
              target: '3%',
              baseline: '0%',
              industryBenchmark: '2.5%'
            },
            {
              metric: 'Booking Conversion',
              target: '25%',
              baseline: '20%'
            }
          ]
        },
        {
          metric: 'Weekend Utilization Rate',
          target: '85%',
          baseline: '60%'
        }
      ]
    };
  }
  
  private decomposeTikTok(totalRevenue: number): InitiativeKPI {
    const target = totalRevenue * 0.12; // 12% (200M)
    
    return {
      name: 'TikTok',
      target,
      kpis: [
        {
          metric: 'New Customers from TikTok',
          target: 16,
          formula: '100K views × 5% engagement × 2% CTR × 40% conversion',
          breakdownKPIs: [
            {
              metric: 'Video Views',
              target: '100K',
              baseline: '0'
            },
            {
              metric: 'Engagement Rate',
              target: '5%',
              baseline: '0%',
              industryBenchmark: '3-7%'
            },
            {
              metric: 'Profile CTR',
              target: '2%',
              baseline: '0%'
            },
            {
              metric: 'Lead Conversion',
              target: '40%',
              baseline: '0%'
            }
          ]
        },
        {
          metric: 'Content Production',
          target: '12 videos',
          baseline: '0',
          formula: '3 videos/week × 4 weeks'
        }
      ]
    };
  }
  
  private countKPIs(nodes: KPINode[]): number {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.breakdownKPIs) {
        count += this.countKPIs(node.breakdownKPIs);
      }
    });
    return count;
  }
}
