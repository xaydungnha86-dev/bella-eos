import { OutcomeContract, OutcomeContractFactory, KPIDirection } from './outcome-contract';
import { OutcomeAttributionEngine } from './outcome-attribution-engine';

export interface ProductionPilotRecord {
  pilotId: string;
  tenantId: string; // Mandatory Multi-Tenant Identifier
  domain: string;
  workflowId: string;
  sopId: string;
  sopVersion: string;

  measurementWindow: {
    startDate: string;
    endDate: string;
  };
  dataSource: string;

  prePilotBaseline: number;
  target: number;
  postPilotActual: number | null; // Invariant: NULL while RUNNING

  absoluteVariance: number | null;
  relativeImprovementPercent: number | null;
  targetGapPercentagePoints: number | null;

  attributionType: string;
  attributionConfidence: number;
  displayWording: string;

  evidence: {
    reportId: string;
    query: string;
    snapshotHash: string;
    aggregationMethod: string;
  };

  executionMetrics: {
    workflowDurationMs: number;
    activeExecutionLatencyMs: number;
    humanApprovalWaitMs: number;
  };

  governanceMetrics: {
    riskLevel: string;
    autonomyMode: string;
    approvalStatus: string;
  };

  pilotStatus: 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}

export class ProductionPilotLedger {
  private static instance: ProductionPilotLedger;
  private records: Map<string, ProductionPilotRecord> = new Map();

  private constructor() {}

  public static getInstance(): ProductionPilotLedger {
    if (!ProductionPilotLedger.instance) {
      ProductionPilotLedger.instance = new ProductionPilotLedger();
    }
    return ProductionPilotLedger.instance;
  }

  public static resetInstance(): void {
    ProductionPilotLedger.instance = new ProductionPilotLedger();
  }

  public createPilotRecord(
    domain: string,
    workflowId: string,
    sopId: string,
    sopVersion: string,
    kpiName: string,
    unit: string,
    direction: KPIDirection,
    prePilotBaseline: number,
    target: number,
    postPilotActual: number | null = null,
    dataSource: string = 'CRM Production DB',
    durationMs = 3600000,
    tenantId: string = 'tenant-default-system'
  ): ProductionPilotRecord {
    const pilotId = `PILOT-${domain.toUpperCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const isRunning = postPilotActual === null;

    const contract: OutcomeContract = OutcomeContractFactory.createContract(
      sopId,
      sopVersion,
      `Production Pilot Execution for ${domain}`,
      kpiName,
      unit,
      direction,
      prePilotBaseline,
      target,
      postPilotActual ?? prePilotBaseline, // Temporary reference for calculation if null
      dataSource
    );

    const attribution = isRunning
      ? { attributionType: 'UNATTRIBUTED', attributionConfidence: 0, displayWording: 'Unattributed' }
      : OutcomeAttributionEngine.analyze(contract, true, 1.0, 1.8);

    const humanApprovalWaitMs = sopId.includes('finance') ? Math.round(durationMs * 0.85) : 0;
    const activeExecutionLatencyMs = Math.max(5, durationMs - humanApprovalWaitMs);

    const record: ProductionPilotRecord = {
      pilotId,
      tenantId,
      domain,
      workflowId,
      sopId,
      sopVersion,
      measurementWindow: contract.measurementWindow || {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      dataSource,
      prePilotBaseline,
      target,
      postPilotActual,
      absoluteVariance: isRunning ? null : contract.metrics!.absoluteVariance,
      relativeImprovementPercent: isRunning ? null : contract.metrics!.relativeImprovementPercent,
      targetGapPercentagePoints: isRunning ? null : contract.metrics!.targetGapPercentagePoints,
      attributionType: attribution.attributionType,
      attributionConfidence: attribution.attributionConfidence,
      displayWording: attribution.displayWording,
      evidence: contract.evidence!,
      executionMetrics: {
        workflowDurationMs: durationMs,
        activeExecutionLatencyMs,
        humanApprovalWaitMs
      },
      governanceMetrics: {
        riskLevel: sopId.includes('finance') ? 'HIGH' : 'LOW',
        autonomyMode: sopId.includes('finance') ? 'MULTI_APPROVAL' : 'AUTONOMOUS',
        approvalStatus: 'APPROVED'
      },
      pilotStatus: isRunning ? 'RUNNING' : 'COMPLETED',
      createdAt: new Date(Date.now() - durationMs).toISOString(),
      completedAt: isRunning ? undefined : new Date().toISOString()
    };

    this.records.set(pilotId, record);
    return record;
  }

  public finalizePilotActual(pilotId: string, postPilotActual: number): ProductionPilotRecord | undefined {
    const record = this.records.get(pilotId);
    if (!record) return undefined;

    const contract: OutcomeContract = OutcomeContractFactory.createContract(
      record.sopId,
      record.sopVersion,
      `Production Pilot Execution for ${record.domain}`,
      'KPI Measurement',
      '%',
      'HIGHER_IS_BETTER',
      record.prePilotBaseline,
      record.target,
      postPilotActual,
      record.dataSource
    );

    const attribution = OutcomeAttributionEngine.analyze(contract, true, 1.0, 1.8);

    record.postPilotActual = postPilotActual;
    record.absoluteVariance = contract.metrics!.absoluteVariance;
    record.relativeImprovementPercent = contract.metrics!.relativeImprovementPercent;
    record.targetGapPercentagePoints = contract.metrics!.targetGapPercentagePoints;
    record.attributionType = attribution.attributionType;
    record.attributionConfidence = attribution.attributionConfidence;
    record.displayWording = attribution.displayWording;
    record.pilotStatus = 'COMPLETED';
    record.completedAt = new Date().toISOString();

    return record;
  }

  public getRecord(pilotId: string): ProductionPilotRecord | undefined {
    return this.records.get(pilotId);
  }

  public getAllRecords(tenantId?: string): ProductionPilotRecord[] {
    const all = Array.from(this.records.values());
    if (tenantId) {
      return all.filter((r) => r.tenantId === tenantId);
    }
    return all;
  }
}
