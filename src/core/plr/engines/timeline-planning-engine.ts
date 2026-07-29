/**
 * Timeline Planning Engine
 * Creates detailed day-by-day execution timeline with dependencies
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';
import { TimelinePlan, Phase, Milestone, Dependency } from '@/types/operational-plan';

export class TimelinePlanningEngine {
  async plan(recommendation: ExecutiveRecommendation): Promise<TimelinePlan> {
    console.log('[Timeline Planning] Creating detailed execution timeline...');
    
    const strategy = recommendation.chosenStrategy;
    const duration = recommendation.goal.by;
    
    const phases: Phase[] = [
      {
        name: 'Setup Phase',
        weeks: 'Week 1',
        objectives: [
          'Prepare all campaign materials',
          'Train staff',
          'Setup accounts and systems'
        ],
        milestones: this.getWeek1Milestones(strategy)
      },
      {
        name: 'Launch & Learn',
        weeks: 'Week 2',
        objectives: [
          'Launch all campaigns',
          'Monitor early indicators',
          'A/B test and optimize'
        ],
        milestones: this.getWeek2Milestones(strategy)
      },
      {
        name: 'Optimize & Scale',
        weeks: 'Week 3',
        objectives: [
          'Scale winning initiatives',
          'Cut underperforming tactics',
          'Accelerate momentum'
        ],
        milestones: this.getWeek3Milestones(strategy)
      },
      {
        name: 'Final Push',
        weeks: 'Week 4',
        objectives: [
          'Maximum effort on proven tactics',
          'Close deals in pipeline',
          'Measure final results'
        ],
        milestones: this.getWeek4Milestones(strategy)
      }
    ];
    
    const dependencies = this.buildDependencies(strategy);
    const criticalPath = this.identifyCriticalPath(dependencies);
    
    const timelinePlan: TimelinePlan = {
      duration,
      phases,
      dependencies,
      criticalPath
    };
    
    console.log('[Timeline Planning] ✓ Completed:', {
      phases: phases.length,
      milestones: phases.reduce((sum, p) => sum + p.milestones.length, 0),
      dependencies: dependencies.length,
      criticalPath: criticalPath.length
    });
    
    return timelinePlan;
  }
  
  private getWeek1Milestones(strategy: any): Milestone[] {
    const milestones: Milestone[] = [
      {
        date: 'Day 1',
        milestone: 'Kickoff meeting (all teams)',
        owner: 'CEO',
        status: 'pending'
      }
    ];
    
    if (strategy.initiatives.some((i: string) => i.includes('Win-back'))) {
      milestones.push(
        {
          date: 'Day 1',
          milestone: 'Clean win-back email list (220 contacts)',
          owner: 'Email Marketing Manager',
          status: 'pending'
        },
        {
          date: 'Day 2',
          milestone: 'Write win-back email copy',
          owner: 'Copywriter',
          status: 'pending'
        },
        {
          date: 'Day 3',
          milestone: 'Design win-back landing page',
          owner: 'Designer',
          status: 'pending'
        }
      );
    }
    
    if (strategy.initiatives.some((i: string) => i.includes('Upsell'))) {
      milestones.push(
        {
          date: 'Day 2',
          milestone: 'Schedule upsell training (2-day program)',
          owner: 'Sales Manager',
          status: 'pending'
        },
        {
          date: 'Day 4-5',
          milestone: 'Conduct upsell training',
          owner: 'Trainer',
          status: 'pending'
        }
      );
    }
    
    if (strategy.initiatives.some((i: string) => i.includes('TikTok'))) {
      milestones.push(
        {
          date: 'Day 2',
          milestone: 'Setup TikTok business account',
          owner: 'Social Media Manager',
          status: 'pending'
        },
        {
          date: 'Day 3-5',
          milestone: 'Produce first 3 TikTok videos',
          owner: 'Video Creator',
          status: 'pending'
        }
      );
    }
    
    milestones.push({
      date: 'Day 5',
      milestone: 'CEO Week 1 checkpoint',
      owner: 'CEO',
      status: 'pending'
    });
    
    return milestones;
  }
  
  private getWeek2Milestones(strategy: any): Milestone[] {
    const milestones: Milestone[] = [];
    
    if (strategy.initiatives.some((i: string) => i.includes('Win-back'))) {
      milestones.push(
        {
          date: 'Day 8 (Monday 9 AM)',
          milestone: 'LAUNCH win-back email campaign',
          owner: 'Email Marketing Manager',
          status: 'pending'
        },
        {
          date: 'Day 9',
          milestone: 'Monitor email open rate (target 30%)',
          owner: 'Email Marketing Manager',
          status: 'pending'
        }
      );
    }
    
    if (strategy.initiatives.some((i: string) => i.includes('Weekend'))) {
      milestones.push({
        date: 'Day 8',
        milestone: 'Launch weekend ads (soft launch)',
        owner: 'Ads Manager',
        status: 'pending'
      });
    }
    
    if (strategy.initiatives.some((i: string) => i.includes('TikTok'))) {
      milestones.push(
        {
          date: 'Day 8',
          milestone: 'Post first 3 TikTok videos',
          owner: 'Social Media Manager',
          status: 'pending'
        },
        {
          date: 'Day 10',
          milestone: 'GO/NO-GO decision on TikTok (based on engagement)',
          owner: 'CMO',
          status: 'pending'
        }
      );
    }
    
    milestones.push({
      date: 'Day 12',
      milestone: 'CEO Week 2 checkpoint',
      owner: 'CEO',
      status: 'pending'
    });
    
    return milestones;
  }
  
  private getWeek3Milestones(strategy: any): Milestone[] {
    return [
      {
        date: 'Day 15',
        milestone: 'Scale winning tactics (increase budget 20%)',
        owner: 'CMO',
        status: 'pending'
      },
      {
        date: 'Day 17',
        milestone: 'Cut underperforming channels',
        owner: 'CMO',
        status: 'pending'
      },
      {
        date: 'Day 19',
        milestone: 'CEO Week 3 checkpoint (60% revenue check)',
        owner: 'CEO',
        status: 'pending'
      }
    ];
  }
  
  private getWeek4Milestones(strategy: any): Milestone[] {
    return [
      {
        date: 'Day 22',
        milestone: 'Final push on all channels',
        owner: 'CMO',
        status: 'pending'
      },
      {
        date: 'Day 25',
        milestone: 'Close pending deals',
        owner: 'Sales Team',
        status: 'pending'
      },
      {
        date: 'Day 28',
        milestone: 'Measure final results vs goal',
        owner: 'CEO',
        status: 'pending'
      },
      {
        date: 'Day 30',
        milestone: 'Post-mortem & lessons learned',
        owner: 'CEO',
        status: 'pending'
      }
    ];
  }
  
  private buildDependencies(strategy: any): Dependency[] {
    const dependencies: Dependency[] = [
      {
        task: 'Win-back email launch',
        dependsOn: ['Email list cleaned', 'Copy written', 'Landing page designed'],
        blocking: ['Email performance analysis']
      },
      {
        task: 'Upsell program launch',
        dependsOn: ['Training completed', 'CRM configured'],
        blocking: ['Upsell performance tracking']
      },
      {
        task: 'TikTok ads launch',
        dependsOn: ['TikTok account approved', 'Videos produced'],
        blocking: ['TikTok GO/NO-GO decision']
      }
    ];
    
    return dependencies;
  }
  
  private identifyCriticalPath(dependencies: Dependency[]): string[] {
    // Critical path: tasks that cannot be delayed
    return [
      'Upsell training (2 weeks lead time)',
      'TikTok account approval (3-5 days)',
      'Win-back email list cleaning (Day 1)',
      'CEO Week 3 checkpoint (revenue check)'
    ];
  }
}
