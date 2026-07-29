import { BusinessHealthReport } from '@/types/business-health';

export class EnterpriseDiagnosisCapability {
  async diagnose(ceoIntent?: string): Promise<BusinessHealthReport> {
    console.log('[Enterprise Diagnosis] Performing multi-dimensional corporate audit...');
    
    // Check if intent is asking for high growth, which might trigger specific bottlenecks
    const isAggressive = ceoIntent ? (ceoIntent.includes('40%') || ceoIntent.includes('50%')) : false;

    return {
      marketing: { 
        score: isAggressive ? 42 : 62, 
        status: isAggressive ? 'critical' : 'warning', 
        bottlenecks: ['High CAC on legacy channels', 'TikTok brand penetration underperforming'] 
      },
      sales: { score: 78, status: 'healthy', bottlenecks: [] },
      retention: { score: 51, status: 'critical', bottlenecks: ['Month-2 customer churn spike'] },
      finance: { score: 88, status: 'healthy', bottlenecks: [] },
      operations: { score: 94, status: 'healthy', bottlenecks: [] },
      brand: { score: 65, status: 'warning', bottlenecks: ['Low social engagement metrics'] },
      evidences: [
        {
          category: 'marketing',
          metric: 'CAC',
          delta: '+28%',
          description: 'Customer Acquisition Cost rose from $35 to $45'
        },
        {
          category: 'retention',
          metric: 'Churn Rate',
          delta: '+15%',
          description: 'Month 2 cohort churn increased by 15% YoY'
        }
      ],
      recommendations: [
        {
          category: 'marketing',
          recommendation: 'Launch localized referral campaigns',
          expectedImpact: 'Reduce CAC by 15%'
        },
        {
          category: 'retention',
          recommendation: 'Optimize Month-2 onboard client follow-ups',
          expectedImpact: 'Increase retention by 8%'
        }
      ]
    };
  }
}
