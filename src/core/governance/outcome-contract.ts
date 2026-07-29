export type KPIDirection = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';

export interface KPIMetric {
  id: string;
  name: string;
  unit: string;
  direction: KPIDirection;
  baseline: number;
  target: number;
  actual?: number;
}

export interface OutcomeMetrics {
  absoluteVariance: number;          // Actual - Baseline
  relativeImprovementPercent: number; // (Actual - Baseline) / Baseline * 100
  targetGapPercentagePoints: number; // Actual - Target (direction-aware)
  isTargetAchieved: boolean;
  status: 'EXCEEDED' | 'ACHIEVED' | 'UNDERPERFORMED';
}

export interface MeasurementWindow {
  startDate: string;
  endDate: string;
}

export interface OutcomeEvidence {
  reportId: string;
  query: string;
  snapshotHash: string;
  aggregationMethod: string;
}

export interface OutcomeContract {
  sopId: string;
  sopVersion: string;
  objective: string;
  kpi: KPIMetric;
  metrics?: OutcomeMetrics;
  measurementWindow?: MeasurementWindow;
  dataSource?: string;
  evidence?: OutcomeEvidence;
  recordedAt?: string;
}

export class OutcomeContractFactory {
  public static calculateMetrics(kpi: KPIMetric, actualValue: number): OutcomeMetrics {
    const isHigherBetter = kpi.direction === 'HIGHER_IS_BETTER';
    
    // 1. Absolute improvement (percentage points or raw units)
    const absoluteVariance = Number((actualValue - kpi.baseline).toFixed(2));
    
    // 2. Relative improvement percentage vs baseline
    const relativeImprovementPercent = kpi.baseline !== 0
      ? Number((((actualValue - kpi.baseline) / Math.abs(kpi.baseline)) * 100).toFixed(2))
      : 0;

    // 3. Target Overachievement / Gap percentage points
    const targetGapPercentagePoints = isHigherBetter
      ? Number((actualValue - kpi.target).toFixed(2))
      : Number((kpi.target - actualValue).toFixed(2));

    // 4. Target Achieved Determination
    let isTargetAchieved = false;
    if (isHigherBetter) {
      isTargetAchieved = actualValue >= kpi.target;
    } else {
      isTargetAchieved = actualValue <= kpi.target;
    }

    // 5. Status Determination
    let status: 'EXCEEDED' | 'ACHIEVED' | 'UNDERPERFORMED' = 'ACHIEVED';
    if (isHigherBetter) {
      if (actualValue > kpi.target) status = 'EXCEEDED';
      else if (actualValue >= kpi.target * 0.98) status = 'ACHIEVED';
      else status = 'UNDERPERFORMED';
    } else {
      if (actualValue < kpi.target) status = 'EXCEEDED';
      else if (actualValue <= kpi.target * 1.02) status = 'ACHIEVED';
      else status = 'UNDERPERFORMED';
    }

    return {
      absoluteVariance,
      relativeImprovementPercent,
      targetGapPercentagePoints,
      isTargetAchieved,
      status
    };
  }

  public static createContract(
    sopId: string,
    sopVersion: string,
    objective: string,
    kpiName: string,
    unit: string,
    direction: KPIDirection,
    baseline: number,
    target: number,
    actual?: number,
    dataSource = 'Bella Internal Metrics',
    measurementWindow?: MeasurementWindow,
    evidence?: OutcomeEvidence
  ): OutcomeContract {
    const kpi: KPIMetric = {
      id: `kpi-${Math.random().toString(36).substring(2, 7)}`,
      name: kpiName,
      unit,
      direction,
      baseline,
      target,
      actual
    };

    const metrics = actual !== undefined ? this.calculateMetrics(kpi, actual) : undefined;

    return {
      sopId,
      sopVersion,
      objective,
      kpi,
      metrics,
      measurementWindow: measurementWindow || {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      dataSource,
      evidence: evidence || {
        reportId: `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        query: `SELECT ${kpiName} FROM ${dataSource} WHERE sop_id = '${sopId}'`,
        snapshotHash: `sha256-${Math.random().toString(36).substring(2, 10)}`,
        aggregationMethod: 'MONTHLY_AVERAGE'
      },
      recordedAt: new Date().toISOString()
    };
  }
}
