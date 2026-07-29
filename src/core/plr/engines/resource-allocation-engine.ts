/**
 * Resource Allocation Engine
 * Assigns people, capacity, and assets to initiatives
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { ResourcePlan, WorkforcePlan, InitiativeResource, RoleAssignment, ResourceConflict, Asset } from '@/types/operational-plan';

export class ResourceAllocationEngine {
  async allocate(recommendation: ExecutiveRecommendation): Promise<ResourcePlan> {
    console.log('[Resource Allocation] Assigning workforce and assets...');
    
    const strategy = recommendation.chosenStrategy;
    const constraints = recommendation.constraints;
    
    // Parse workforce constraint
    const workforceLimit = this.parseWorkforceLimit(constraints.workforce.limit);
    
    const byInitiative: InitiativeResource[] = [];
    let totalCapacity = 0;
    
    strategy.initiatives.forEach(initiative => {
      if (initiative.includes('Win-back')) {
        const resource = this.allocateWinbackWorkforce();
        byInitiative.push(resource);
        totalCapacity += this.calculateCapacity(resource);
      } else if (initiative.includes('Upsell')) {
        const resource = this.allocateUpsellWorkforce();
        byInitiative.push(resource);
        totalCapacity += this.calculateCapacity(resource);
      } else if (initiative.includes('Weekend')) {
        const resource = this.allocateWeekendWorkforce();
        byInitiative.push(resource);
        totalCapacity += this.calculateCapacity(resource);
      } else if (initiative.includes('TikTok')) {
        const resource = this.allocateTikTokWorkforce();
        byInitiative.push(resource);
        totalCapacity += this.calculateCapacity(resource);
      }
    });
    
    // Detect conflicts
    const conflicts = this.detectConflicts(byInitiative);
    
    // Workforce plan
    const workforce: WorkforcePlan = {
      total: `${totalCapacity}%`,
      byInitiative,
      conflicts
    };
    
    // Assets
    const assets: Asset[] = [
      {
        type: 'Email list',
        quantity: 220,
        owner: 'CRM System',
        status: 'Available'
      },
      {
        type: 'Brand assets',
        quantity: 1,
        owner: 'Digital Asset Manager',
        status: 'Available'
      },
      {
        type: 'Customer database',
        quantity: 1,
        owner: 'CRM System',
        status: 'Available'
      }
    ];
    
    const resourcePlan: ResourcePlan = {
      workforce,
      assets
    };
    
    console.log('[Resource Allocation] ✓ Completed:', {
      totalCapacity: `${totalCapacity}%`,
      workforceLimit: `${workforceLimit}%`,
      status: totalCapacity <= workforceLimit ? 'Within limit ✅' : `Overallocated ⚠️`,
      conflicts: conflicts.length
    });
    
    return resourcePlan;
  }
  
  private parseWorkforceLimit(limit: string): number {
    const match = limit.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 100;
  }
  
  private allocateWinbackWorkforce(): InitiativeResource {
    return {
      name: 'Win-back',
      capacity: '5%',
      roles: [
        {
          role: 'Email Marketing Manager',
          ftePct: '30%',
          people: ['Nguyễn Văn A'],
          tasks: [
            'Campaign setup',
            'List segmentation',
            'Performance monitoring',
            'A/B testing'
          ]
        },
        {
          role: 'Copywriter',
          ftePct: '20%',
          people: ['Trần Thị B'],
          tasks: [
            'Email copy (Week 1 only)',
            'Landing page copy (Week 1 only)'
          ]
        },
        {
          role: 'Designer',
          ftePct: '20%',
          people: ['Lê Văn C'],
          tasks: [
            'Email templates (Week 1 only)',
            'Landing page design (Week 1 only)',
            'Visuals'
          ]
        }
      ]
    };
  }
  
  private allocateUpsellWorkforce(): InitiativeResource {
    return {
      name: 'Upsell',
      capacity: '8%',
      roles: [
        {
          role: 'Sales Trainer',
          ftePct: '40%',
          people: ['Phạm Thị D'],
          tasks: [
            'Training design',
            'Training delivery',
            'Certification',
            'Post-training support'
          ]
        },
        {
          role: 'Sales Manager',
          ftePct: '20%',
          people: ['Hoàng Văn E'],
          tasks: [
            'Oversight',
            'Performance tracking',
            'Coaching',
            'Escalation handling'
          ]
        },
        {
          role: 'Sales Staff',
          ftePct: '4% each (0.4% total)',
          people: ['10 sales staff'],
          tasks: [
            'Training (Week 2)',
            'Upselling (Week 3-4)'
          ]
        }
      ]
    };
  }
  
  private allocateWeekendWorkforce(): InitiativeResource {
    return {
      name: 'Weekend',
      capacity: '3%',
      roles: [
        {
          role: 'Ads Manager',
          ftePct: '20%',
          people: ['Võ Thị F'],
          tasks: [
            'Campaign setup',
            'Optimization',
            'Budget management',
            'Performance reporting'
          ]
        },
        {
          role: 'Operations Manager',
          ftePct: '10%',
          people: ['Đặng Văn G'],
          tasks: [
            'Capacity planning',
            'Weekend staffing',
            'Utilization tracking'
          ]
        }
      ]
    };
  }
  
  private allocateTikTokWorkforce(): InitiativeResource {
    return {
      name: 'TikTok',
      capacity: '5%',
      roles: [
        {
          role: 'Video Creator',
          ftePct: '30%',
          people: ['Ngô Thị H'],
          tasks: [
            '12 videos (3/week)',
            'Script writing',
            'Filming',
            'Editing'
          ]
        },
        {
          role: 'Social Media Manager',
          ftePct: '20%',
          people: ['Bùi Văn I'],
          tasks: [
            'Account management',
            'Posting schedule',
            'Engagement',
            'Ads management'
          ]
        }
      ]
    };
  }
  
  private calculateCapacity(resource: InitiativeResource): number {
    // Extract percentage from capacity string (e.g., "5%" -> 5)
    const match = resource.capacity.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }
  
  private detectConflicts(initiatives: InitiativeResource[]): ResourceConflict[] {
    const conflicts: ResourceConflict[] = [];
    
    // Check for designer conflict (Win-back Day 1-3 vs Weekend Day 4-5)
    const hasWinback = initiatives.some(i => i.name === 'Win-back');
    const hasWeekend = initiatives.some(i => i.name === 'Weekend');
    
    if (hasWinback && hasWeekend) {
      conflicts.push({
        resource: 'Designer (Lê Văn C)',
        conflict: 'Needed by Win-back (Days 1-3) and Weekend (Days 4-5)',
        resolution: 'Prioritize Win-back, Weekend second. No overlap.'
      });
    }
    
    return conflicts;
  }
}
