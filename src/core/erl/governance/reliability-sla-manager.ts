/**
 * BELLA EOS ERL: Reliability SLA Manager
 * Specification: ERL Governance Engine
 * 
 * Mission: Enforce business-level SLAs and internal SLO target thresholds.
 */

import { IReliabilitySla, ISloSli } from '@/types/erl';

export class ReliabilitySlaManager {
  private static instance: ReliabilitySlaManager;
  private SLAs: Map<string, IReliabilitySla> = new Map();

  private constructor() {
    this.seedSlas();
  }

  public static getInstance(): ReliabilitySlaManager {
    if (!ReliabilitySlaManager.instance) {
      ReliabilitySlaManager.instance = new ReliabilitySlaManager();
    }
    return ReliabilitySlaManager.instance;
  }

  public getSla(capability: string): IReliabilitySla | undefined {
    return this.SLAs.get(capability);
  }

  public validateSlaAndSlo(
    capability: string,
    actualEri: number,
    actualLatency: number,
    actualHallucinationRate: number,
    actualCitationRate: number
  ): { slaViolated: boolean; sloSliReports: ISloSli[] } {
    const sla = this.SLAs.get(capability);
    
    // Internal SLOs (more stringent than customer-facing SLAs)
    const sloTargetEri = sla ? sla.targetEri + 1.0 : 96.0;
    const sloTargetLatency = sla ? sla.maxAllowedLatencySeconds - 0.5 : 2.5;

    const reports: ISloSli[] = [
      {
        sliName: 'ERI Index',
        sliValue: actualEri,
        sloThreshold: sloTargetEri,
        comparison: '>=',
        isCompliant: actualEri >= sloTargetEri
      },
      {
        sliName: 'Latency (s)',
        sliValue: actualLatency,
        sloThreshold: sloTargetLatency,
        comparison: '<=',
        isCompliant: actualLatency <= sloTargetLatency
      }
    ];

    let slaViolated = false;
    if (sla) {
      if (
        actualEri < sla.targetEri ||
        actualLatency > sla.maxAllowedLatencySeconds ||
        actualHallucinationRate > sla.maxAllowedHallucinationRate ||
        actualCitationRate < sla.minCitationRate
      ) {
        slaViolated = true;
      }
    }

    return {
      slaViolated,
      sloSliReports: reports
    };
  }

  private seedSlas(): void {
    this.SLAs.set('Strategic Planning', {
      capability: 'Strategic Planning',
      targetEri: 97.0,
      maxAllowedLatencySeconds: 20.0,
      maxAllowedHallucinationRate: 0.05,
      minCitationRate: 0.95
    });
    this.SLAs.set('Finance', {
      capability: 'Finance',
      targetEri: 99.0,
      maxAllowedLatencySeconds: 3.0,
      maxAllowedHallucinationRate: 0.0,
      minCitationRate: 0.99
    });
    this.SLAs.set('FAQ', {
      capability: 'FAQ',
      targetEri: 90.0,
      maxAllowedLatencySeconds: 3.0,
      maxAllowedHallucinationRate: 0.10,
      minCitationRate: 0.70
    });
  }
}
