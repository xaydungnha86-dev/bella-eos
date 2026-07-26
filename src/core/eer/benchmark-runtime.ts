/**
 * BELLA EOS EIER / EER: Enterprise Benchmark Runtime (Runtime 14)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Mission: Autonomous Enterprise Benchmarking Engine. Automatically compares operational
 * performance across time horizons (e.g. 2026 vs 2025: +18% vs +12%), branches, and
 * industry standards without requiring human BI dashboard construction.
 */

export interface EnterpriseBenchmarkComparison {
  metricName: string;
  currentPeriod: string; // e.g. "Q3 2026"
  currentValue: number;
  previousPeriod: string; // e.g. "Q3 2025"
  previousValue: number;
  growthPercentage: number;
  industryBenchmarkValue?: number;
  performanceGrade: 'OUTPERFORMING' | 'MEETING_TARGET' | 'UNDERPERFORMING';
  insightSummary: string;
}

export class BenchmarkRuntime {
  private static instance: BenchmarkRuntime;
  private benchmarks: Map<string, EnterpriseBenchmarkComparison> = new Map();

  private constructor() {}

  public static getInstance(): BenchmarkRuntime {
    if (!BenchmarkRuntime.instance) {
      BenchmarkRuntime.instance = new BenchmarkRuntime();
    }
    return BenchmarkRuntime.instance;
  }

  public runYoYBenchmark(
    metricName: string,
    val2026: number,
    val2025: number,
    industryBenchmark?: number
  ): EnterpriseBenchmarkComparison {
    const growth = val2025 > 0 ? ((val2026 - val2025) / val2025) * 100 : 0;
    
    let grade: EnterpriseBenchmarkComparison['performanceGrade'] = 'MEETING_TARGET';
    if (growth >= 15) grade = 'OUTPERFORMING';
    else if (growth < 0) grade = 'UNDERPERFORMING';

    const comparison: EnterpriseBenchmarkComparison = {
      metricName,
      currentPeriod: '2026',
      currentValue: val2026,
      previousPeriod: '2025',
      previousValue: val2025,
      growthPercentage: Math.round(growth * 10) / 10,
      industryBenchmarkValue: industryBenchmark,
      performanceGrade: grade,
      insightSummary: `${metricName} grew +${growth.toFixed(1)}% in 2026 compared to 2025 (${grade}).`,
    };

    const bId = `bm-${metricName.toLowerCase()}-2026`;
    this.benchmarks.set(bId, comparison);
    return comparison;
  }

  public getBenchmark(id: string): EnterpriseBenchmarkComparison | undefined {
    return this.benchmarks.get(id);
  }

  public listBenchmarks(): EnterpriseBenchmarkComparison[] {
    return Array.from(this.benchmarks.values());
  }
}
