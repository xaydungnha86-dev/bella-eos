/**
 * Budget Allocation Engine
 * Decomposes strategic budget into line-item operational budget
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { BudgetPlan, InitiativeBudget, BudgetBreakdown, WeeklyBudget } from '@/types/operational-plan';

export class BudgetAllocationEngine {
  async allocate(recommendation: ExecutiveRecommendation): Promise<BudgetPlan> {
    console.log('[Budget Allocation] Breaking down strategic budget...');
    
    const strategy = recommendation.chosenStrategy;
    const totalBudget = strategy.budget;
    const buffer = totalBudget * 0.1; // 10% contingency
    const workingBudget = totalBudget - buffer;
    
    const byInitiative: InitiativeBudget[] = [];
    
    strategy.initiatives.forEach(initiative => {
      if (initiative.includes('Win-back')) {
        byInitiative.push(this.allocateWinback(workingBudget * 0.37)); // 37%
      } else if (initiative.includes('Upsell')) {
        byInitiative.push(this.allocateUpsell(workingBudget * 0.30)); // 30%
      } else if (initiative.includes('Weekend')) {
        byInitiative.push(this.allocateWeekend(workingBudget * 0.22)); // 22%
      } else if (initiative.includes('TikTok')) {
        byInitiative.push(this.allocateTikTok(workingBudget * 0.11)); // 11%
      }
    });
    
    // Weekly budget distribution
    const byWeek: WeeklyBudget[] = [
      {
        week: 1,
        planned: totalBudget * 0.25, // Setup costs
        cumulative: totalBudget * 0.25
      },
      {
        week: 2,
        planned: totalBudget * 0.30, // Launch costs
        cumulative: totalBudget * 0.55
      },
      {
        week: 3,
        planned: totalBudget * 0.25, // Scale costs
        cumulative: totalBudget * 0.80
      },
      {
        week: 4,
        planned: totalBudget * 0.20, // Final push
        cumulative: totalBudget
      }
    ];
    
    const budgetPlan: BudgetPlan = {
      total: totalBudget,
      buffer,
      byInitiative,
      byWeek,
      contingency: {
        amount: buffer,
        triggers: [
          'If Week 3 revenue < 60% of goal',
          'If TikTok pilot successful (scale budget)',
          'If any initiative needs emergency boost',
          'CEO approval required for deployment'
        ]
      }
    };
    
    console.log('[Budget Allocation] ✓ Completed:', {
      total: `${totalBudget}M`,
      buffer: `${buffer}M`,
      initiatives: byInitiative.length
    });
    
    return budgetPlan;
  }
  
  private allocateWinback(amount: number): InitiativeBudget {
    const breakdown: BudgetBreakdown[] = [
      {
        category: 'Email Platform',
        amount: amount * 0.10,
        rationale: 'SendGrid Professional plan for 220 contacts',
        vendor: 'SendGrid'
      },
      {
        category: 'Creative Assets',
        amount: amount * 0.20,
        rationale: 'Copywriter, designer, photography, landing page',
        vendor: 'Internal + Freelance'
      },
      {
        category: 'Customer Incentives',
        amount: amount * 0.70,
        rationale: '20% discount + free service upgrade for 66 customers'
      }
    ];
    
    return {
      name: 'Win-back',
      total: amount,
      breakdown
    };
  }
  
  private allocateUpsell(amount: number): InitiativeBudget {
    const breakdown: BudgetBreakdown[] = [
      {
        category: 'Training Program',
        amount: amount * 0.375,
        rationale: 'Trainer, materials, certification, practice sessions'
      },
      {
        category: 'Marketing Materials',
        amount: amount * 0.25,
        rationale: 'Brochures, digital assets, in-spa signage'
      },
      {
        category: 'System Setup',
        amount: amount * 0.375,
        rationale: 'CRM configuration, commission tracking, dashboard'
      }
    ];
    
    return {
      name: 'Upsell',
      total: amount,
      breakdown
    };
  }
  
  private allocateWeekend(amount: number): InitiativeBudget {
    const breakdown: BudgetBreakdown[] = [
      {
        category: 'Facebook Ads',
        amount: amount * 0.40,
        rationale: '4 weeks × 3M/week targeted ads',
        vendor: 'Meta Ads'
      },
      {
        category: 'Instagram Ads',
        amount: amount * 0.27,
        rationale: 'Instagram Stories + Feed ads',
        vendor: 'Meta Ads'
      },
      {
        category: 'Creative Production',
        amount: amount * 0.17,
        rationale: 'Video ads + image ads for both platforms'
      },
      {
        category: 'Staff Incentives',
        amount: amount * 0.17,
        rationale: 'Weekend overtime compensation'
      }
    ];
    
    return {
      name: 'Weekend',
      total: amount,
      breakdown
    };
  }
  
  private allocateTikTok(amount: number): InitiativeBudget {
    const breakdown: BudgetBreakdown[] = [
      {
        category: 'Video Production',
        amount: amount * 0.47,
        rationale: '12 videos, creators, equipment, editing',
        vendor: 'Freelance creators'
      },
      {
        category: 'TikTok Ads',
        amount: amount * 0.40,
        rationale: 'Boost top 3 performing videos',
        vendor: 'TikTok Ads Manager'
      },
      {
        category: 'Influencer Partnerships',
        amount: amount * 0.13,
        rationale: '2-3 micro-influencers for credibility'
      }
    ];
    
    return {
      name: 'TikTok',
      total: amount,
      breakdown
    };
  }
}
