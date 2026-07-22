export class ReasoningCenter {
  // Verifies policy rules against context data (e.g. budget limit checks)
  static evaluatePolicy(policyId: string, requestedAmountVnd: number): { allowed: boolean; code: string; message: string } {
    console.log(`[Reasoning Center - Policy Verifier] checking ${policyId} for amount: ${requestedAmountVnd}`);
    
    if (policyId === 'POL-GOV-001') {
      const limit = 100000000; // 100M VND limit
      if (requestedAmountVnd > limit) {
        return {
          allowed: false,
          code: 'BUDGET_EXCEEDED',
          message: `Cảnh báo: Yêu cầu ${requestedAmountVnd.toLocaleString()} VND vượt quá hạn mức chính sách ${limit.toLocaleString()} VND!`
        };
      }
    }

    return {
      allowed: true,
      code: 'POLICY_OK',
      message: 'Đạt yêu cầu chính sách vận hành.'
    };
  }

  // Decomposes intent sentences into actionable goals
  static decomposeGoal(strategicVision: string): any {
    const defaultGoals = {
      marketing: { leads: 1000, cac: 1200000 },
      sales: { conversionRate: 2.8 },
      finance: { minNetMargin: 20 }
    };

    // Simple keyword extraction for simulations
    if (strategicVision.includes('20tr') || strategicVision.includes('20 triệu')) {
      defaultGoals.marketing.cac = 1500000;
    }
    if (strategicVision.includes('5000') || strategicVision.includes('5k')) {
      defaultGoals.marketing.leads = 5000;
    }

    return {
      vision: strategicVision,
      subGoals: defaultGoals,
      timestamp: new Date().toISOString()
    };
  }

  // Runs Monte Carlo simulation algorithm for ROI projections
  static runMonteCarlo(factor: string): { projectedRoi: string; cashflow: string; projectedNetProfitVND: number; confidence: number } {
    // Simulated forecast outcomes
    const baseProfit = 85000000;
    const confidence = 85 + Math.floor(Math.random() * 10);
    
    return {
      projectedRoi: '350% - 410%',
      cashflow: 'Dương (Positive)',
      projectedNetProfitVND: baseProfit * (1.1 + Math.random() * 0.2),
      confidence
    };
  }
}
