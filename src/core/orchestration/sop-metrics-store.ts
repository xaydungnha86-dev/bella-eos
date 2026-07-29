/**
 * BELLA EOS ORCHESTRATION: Operational Intelligence & SOP Metrics Store
 * Aggregates execution metrics, business outcomes, budget variance, and SLAs per SOP.
 */

export interface SopExecutionRecord {
  recordId: string;
  sopId: string;
  sopName: string;
  workflowId: string;
  status: 'SUCCESS' | 'FAILED' | 'COMPENSATED';
  durationMs: number;
  allocatedBudgetVnd: number;
  actualBudgetVnd: number;
  timestamp: string;
  businessOutcome?: string;
}

export interface SopAggregatedMetrics {
  sopId: string;
  sopName: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  successRate: number; // percentage, e.g. 95.2
  avgDurationMs: number;
  totalAllocatedBudgetVnd: number;
  totalActualBudgetVnd: number;
  budgetVarianceVnd: number; // allocated - actual
}

export class SopMetricsStore {
  private static instance: SopMetricsStore;
  private records: SopExecutionRecord[] = [];

  private constructor() {}

  public static getInstance(): SopMetricsStore {
    if (!SopMetricsStore.instance) {
      SopMetricsStore.instance = new SopMetricsStore();
    }
    return SopMetricsStore.instance;
  }

  public static resetInstance(): void {
    if (SopMetricsStore.instance) {
      SopMetricsStore.instance.records = [];
    }
    SopMetricsStore.instance = new SopMetricsStore();
  }

  /**
   * Records an execution result for an SOP.
   */
  public recordExecution(record: Omit<SopExecutionRecord, 'recordId' | 'timestamp'>): SopExecutionRecord {
    const fullRecord: SopExecutionRecord = {
      ...record,
      recordId: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };

    this.records.push(fullRecord);
    console.log(`[SopMetricsStore] 📊 Recorded SOP metrics for [${fullRecord.sopId}]. Status: ${fullRecord.status}. Duration: ${fullRecord.durationMs}ms`);

    return fullRecord;
  }

  /**
   * Calculates aggregated metrics for a specific SOP.
   */
  public getMetricsForSop(sopId: string): SopAggregatedMetrics | undefined {
    const filtered = this.records.filter(r => r.sopId === sopId);
    if (filtered.length === 0) return undefined;

    const sopName = filtered[0].sopName;
    const executionCount = filtered.length;
    const successCount = filtered.filter(r => r.status === 'SUCCESS').length;
    const failureCount = executionCount - successCount;
    const successRate = Number(((successCount / executionCount) * 100).toFixed(1));

    const totalDuration = filtered.reduce((acc, r) => acc + r.durationMs, 0);
    const avgDurationMs = Math.round(totalDuration / executionCount);

    const totalAllocated = filtered.reduce((acc, r) => acc + r.allocatedBudgetVnd, 0);
    const totalActual = filtered.reduce((acc, r) => acc + r.actualBudgetVnd, 0);

    return {
      sopId,
      sopName,
      executionCount,
      successCount,
      failureCount,
      successRate,
      avgDurationMs,
      totalAllocatedBudgetVnd: totalAllocated,
      totalActualBudgetVnd: totalActual,
      budgetVarianceVnd: totalAllocated - totalActual
    };
  }

  /**
   * Returns all recorded raw execution logs.
   */
  public getAllRecords(): SopExecutionRecord[] {
    return [...this.records];
  }
}
