/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Outcome Verification Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS Decoupled)
 *
 * Mission: Cross-Cutting Outcome KPI Auditor. Verifies that delivered results match
 * business objectives and expected metrics before completing strategic goals.
 */

export interface OutcomeKpi {
  id: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  verified: boolean;
  lastChecked: string;
}

export class OutcomeVerificationService {
  private static instance: OutcomeVerificationService;
  private kpis: Map<string, OutcomeKpi> = new Map();

  private constructor() {
    this.seedDemoKpis();
  }

  public static getInstance(): OutcomeVerificationService {
    if (!OutcomeVerificationService.instance) {
      OutcomeVerificationService.instance = new OutcomeVerificationService();
    }
    return OutcomeVerificationService.instance;
  }

  private seedDemoKpis(): void {
    this.kpis.set('o-01', {
      id: 'o-01',
      metricName: 'Da Nang Spa Leads Acquisition',
      targetValue: 200,
      currentValue: 185,
      verified: false,
      lastChecked: new Date().toISOString(),
    });
  }

  public registerOutcome(params: Omit<OutcomeKpi, 'verified' | 'lastChecked'>): OutcomeKpi {
    const kpi: OutcomeKpi = {
      ...params,
      verified: params.currentValue >= params.targetValue,
      lastChecked: new Date().toISOString(),
    };
    this.kpis.set(kpi.id, kpi);
    return kpi;
  }

  public verifyOutcomeKpi(id: string, currentKpiValue: number): boolean {
    const kpi = this.kpis.get(id);
    if (!kpi) return false;

    kpi.currentValue = currentKpiValue;
    kpi.lastChecked = new Date().toISOString();
    
    if (kpi.currentValue >= kpi.targetValue) {
      kpi.verified = true;
    } else {
      kpi.verified = false;
    }

    return kpi.verified;
  }

  public getKpi(id: string): OutcomeKpi | undefined {
    return this.kpis.get(id);
  }

  public listKpis(): OutcomeKpi[] {
    return Array.from(this.kpis.values());
  }
}
