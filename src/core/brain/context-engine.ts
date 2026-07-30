/**
 * Enterprise Context Engine (ECE) - Multi-layer Context Pipeline
 * Raw ➔ Normalized ➔ Business ➔ AI Context
 */

import { CanonicalContextPackageV1, BrandDnaSnapshotV1, DataCoverageSnapshotV1 } from '../contracts/context-contract';

export interface RawContextInput {
  objective: string;
  brandDna?: Partial<BrandDnaSnapshotV1>;
  rawCrmData?: Record<string, any>;
  rawErpData?: Record<string, any>;
  rawAnalyticsData?: Record<string, any>;
  approvedBudgetVnd?: number;
}

export class EnterpriseContextEngine {
  private static instance: EnterpriseContextEngine;

  private constructor() {}

  public static getInstance(): EnterpriseContextEngine {
    if (!EnterpriseContextEngine.instance) {
      EnterpriseContextEngine.instance = new EnterpriseContextEngine();
    }
    return EnterpriseContextEngine.instance;
  }

  /**
   * Pipeline Layer 1 & 2: Raw Input ➔ Normalized Business Data
   */
  public normalize(input: RawContextInput): {
    normalizedBrandDna: BrandDnaSnapshotV1;
    normalizedCoverage: DataCoverageSnapshotV1;
    sanitizedObjective: string;
  } {
    const sanitizedObjective = (input.objective || '').trim();

    const normalizedBrandDna: BrandDnaSnapshotV1 = {
      brandName: input.brandDna?.brandName || 'BELLA EOS',
      voiceTone: input.brandDna?.voiceTone || 'Professional & Premium',
      designStyle: input.brandDna?.designStyle || 'Minimalist Glassmorphism',
      targetSegment: input.brandDna?.targetSegment || 'Chủ Spa & Thẩm mỹ viện cao cấp',
      strategicIntent: input.brandDna?.strategicIntent || 'Acquire Customers'
    };

    const crmData = input.rawCrmData || {};
    const erpData = input.rawErpData || {};

    const normalizedCoverage: DataCoverageSnapshotV1 = {
      crmActiveCount: crmData.customer_count ?? crmData.activeCustomerCount ?? 0,
      appointmentCount: erpData.appointment_count ?? erpData.appointmentCount ?? 0,
      technicianCount: erpData.technician_count ?? erpData.technicianCount ?? 0,
      staffCount: erpData.staff_count ?? erpData.staffCount ?? 0,
      monthlyRevenueVnd: erpData.monthly_revenue ?? erpData.monthlyRevenueVnd ?? 0,
      monthlyExpensesVnd: erpData.monthly_expenses ?? erpData.monthlyExpensesVnd ?? 0,
      fbReach24h: erpData.fb_reach ?? erpData.fbReach24h ?? 0,
      approvedBudgetLimitVnd: input.approvedBudgetVnd || (sanitizedObjective.toLowerCase().includes('50 triệu') ? 50000000 : 100000000),
      piiRedacted: ['customer_passwords', 'credit_cards', 'health_notes']
    };

    return { normalizedBrandDna, normalizedCoverage, sanitizedObjective };
  }

  /**
   * Pipeline Layer 3 & 4: Business Data ➔ Pruned AI Context Package
   */
  public buildCanonicalContext(input: RawContextInput): CanonicalContextPackageV1 {
    const { normalizedBrandDna, normalizedCoverage, sanitizedObjective } = this.normalize(input);
    const timestamp = new Date().toISOString();
    const contextId = `ECC-CTX-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const evidenceIds = [];
    if (normalizedCoverage.crmActiveCount > 0) evidenceIds.push(`CRM-ACTIVE-${normalizedCoverage.crmActiveCount}`);
    if (normalizedCoverage.appointmentCount > 0) evidenceIds.push(`ERP-APPT-${normalizedCoverage.appointmentCount}`);
    if (normalizedCoverage.monthlyRevenueVnd > 0) evidenceIds.push(`FIN-REV-${(normalizedCoverage.monthlyRevenueVnd / 1000000).toFixed(0)}M`);

    return {
      version: 'v1',
      contextId,
      timestamp,
      tenantId: 'tenant-default',
      objective: sanitizedObjective,
      brandDna: normalizedBrandDna,
      evidenceIds,
      coverage: normalizedCoverage,
      sopRulesLoaded: ['SOP-MKT-V1.8', 'SOP-DSN-V2.1', 'SOP-SALES-V3.0']
    };
  }
}
