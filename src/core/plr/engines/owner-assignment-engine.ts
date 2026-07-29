/**
 * Owner Assignment Engine
 * Assigns accountability for each KPI with escalation paths
 */

import { KPITree } from '@/types/operational-plan';
import { OwnershipMap, KPIOwnership, EscalationPath } from '@/types/operational-plan';

export class OwnerAssignmentEngine {
  async assign(kpiTree: KPITree): Promise<OwnershipMap> {
    console.log('[Owner Assignment] Assigning accountability for KPIs...');
    
    const byKPI: KPIOwnership[] = [];
    
    // Primary goal ownership
    byKPI.push({
      kpi: `${kpiTree.primary.metric} (${kpiTree.primary.target}B)`,
      target: `${kpiTree.primary.target}B`,
      owner: 'CEO',
      contributors: ['CMO', 'CSO', 'CFO'],
      reportingCadence: 'Daily dashboard'
    });
    
    // Initiative-level ownership
    kpiTree.byInitiative.forEach(initiative => {
      if (initiative.name === 'Win-back') {
        byKPI.push(...this.assignWinbackOwnership(initiative));
      } else if (initiative.name === 'Upsell') {
        byKPI.push(...this.assignUpsellOwnership(initiative));
      } else if (initiative.name === 'Weekend') {
        byKPI.push(...this.assignWeekendOwnership(initiative));
      } else if (initiative.name === 'TikTok') {
        byKPI.push(...this.assignTikTokOwnership(initiative));
      }
    });
    
    // Escalation paths
    const escalationPath: EscalationPath[] = [
      {
        kpi: 'Email open rate',
        threshold: '< 20% by Week 2',
        escalateTo: 'CMO → CEO'
      },
      {
        kpi: 'Upsell rate',
        threshold: '< 6% by Week 3',
        escalateTo: 'Sales Manager → CSO → CEO'
      },
      {
        kpi: 'Weekend bookings',
        threshold: '< 5 extra bookings/weekend',
        escalateTo: 'Ads Manager → CMO'
      },
      {
        kpi: 'TikTok engagement',
        threshold: '< 3% by Week 2',
        escalateTo: 'Social Media Manager → CMO → CEO (GO/NO-GO)'
      },
      {
        kpi: 'Total revenue',
        threshold: '< 1.2B by Week 4',
        escalateTo: 'CMO → CEO (activate contingency)'
      }
    ];
    
    const ownershipMap: OwnershipMap = {
      byKPI,
      escalationPath
    };
    
    console.log('[Owner Assignment] ✓ Completed:', {
      totalKPIs: byKPI.length,
      escalationPaths: escalationPath.length
    });
    
    return ownershipMap;
  }
  
  private assignWinbackOwnership(initiative: any): KPIOwnership[] {
    return [
      {
        kpi: `Win-back campaign (+${initiative.target}M)`,
        target: `${initiative.target}M`,
        owner: 'CMO',
        contributors: ['Email Marketing Manager'],
        reportingCadence: 'Weekly Monday 9 AM'
      },
      {
        kpi: 'Email open rate (30%)',
        target: '30%',
        owner: 'Email Marketing Manager',
        contributors: ['Copywriter'],
        reportingCadence: 'Daily'
      },
      {
        kpi: 'Conversion rate (15%)',
        target: '15%',
        owner: 'Email Marketing Manager',
        contributors: ['Sales team'],
        reportingCadence: 'Daily'
      }
    ];
  }
  
  private assignUpsellOwnership(initiative: any): KPIOwnership[] {
    return [
      {
        kpi: `Upsell program (+${initiative.target}M)`,
        target: `${initiative.target}M`,
        owner: 'CSO (Chief Sales Officer)',
        contributors: ['Sales Manager', 'Trainer'],
        reportingCadence: 'Weekly Tuesday 9 AM'
      },
      {
        kpi: 'Upsell rate (12%)',
        target: '12%',
        owner: 'Sales Manager',
        contributors: ['10 Sales Staff'],
        reportingCadence: 'Daily'
      },
      {
        kpi: 'Training completion (100%)',
        target: '100%',
        owner: 'Sales Trainer',
        contributors: ['Sales Manager'],
        reportingCadence: 'Week 2 Friday'
      }
    ];
  }
  
  private assignWeekendOwnership(initiative: any): KPIOwnership[] {
    return [
      {
        kpi: `Weekend promotion (+${initiative.target}M)`,
        target: `${initiative.target}M`,
        owner: 'CMO',
        contributors: ['Ads Manager', 'Operations Manager'],
        reportingCadence: 'Weekly Monday 9 AM'
      },
      {
        kpi: 'Extra weekend bookings (+32)',
        target: '+32 total (8/weekend)',
        owner: 'Ads Manager',
        contributors: ['Operations Manager'],
        reportingCadence: 'Monday after each weekend'
      },
      {
        kpi: 'Weekend utilization (85%)',
        target: '85%',
        owner: 'Operations Manager',
        contributors: ['Ads Manager'],
        reportingCadence: 'Monday after each weekend'
      }
    ];
  }
  
  private assignTikTokOwnership(initiative: any): KPIOwnership[] {
    return [
      {
        kpi: `TikTok pilot (+${initiative.target}M)`,
        target: `${initiative.target}M`,
        owner: 'CMO',
        contributors: ['Social Media Manager', 'Video Creator'],
        reportingCadence: 'Weekly Monday 9 AM'
      },
      {
        kpi: 'TikTok engagement rate (5%)',
        target: '5%',
        owner: 'Social Media Manager',
        contributors: ['Video Creator'],
        reportingCadence: 'Daily'
      },
      {
        kpi: 'Video production (12 videos)',
        target: '12 videos',
        owner: 'Video Creator',
        contributors: ['Social Media Manager'],
        reportingCadence: 'Weekly Monday (3 videos/week)'
      }
    ];
  }
}
