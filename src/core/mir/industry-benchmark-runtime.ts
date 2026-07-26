/**
 * BELLA EOS MIR: Industry Benchmark Runtime (Runtime 43)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME
 * 
 * Mission: Industry Benchmark Comparison Engine. Compares internal company metrics (ROAS, Retention, CAC, LTV)
 * against industry benchmarks to evaluate competitive advantage.
 */

export interface BenchmarkComparisonResult {
  metricName: string;
  companyValue: number;
  industryBenchmarkValue: number;
  performanceDeltaPercentage: number;
  status: 'OUTPERFORMING' | 'AT_PAR' | 'UNDERPERFORMING';
}

export class IndustryBenchmarkRuntime {
  private static instance: IndustryBenchmarkRuntime;

  private constructor() {}

  public static getInstance(): IndustryBenchmarkRuntime {
    if (!IndustryBenchmarkRuntime.instance) {
      IndustryBenchmarkRuntime.instance = new IndustryBenchmarkRuntime();
    }
    return IndustryBenchmarkRuntime.instance;
  }

  public compareMetric(metricName: string, companyValue: number, industryBenchmarkValue: number): BenchmarkComparisonResult {
    const delta = Number((((companyValue - industryBenchmarkValue) / industryBenchmarkValue) * 100).toFixed(2));
    let status: 'OUTPERFORMING' | 'AT_PAR' | 'UNDERPERFORMING' = 'AT_PAR';

    if (delta > 5) status = 'OUTPERFORMING';
    else if (delta < -5) status = 'UNDERPERFORMING';

    return {
      metricName,
      companyValue,
      industryBenchmarkValue,
      performanceDeltaPercentage: delta,
      status,
    };
  }
}
