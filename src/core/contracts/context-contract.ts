/**
 * Canonical Context Contract (v1) - Immutable Specification
 * Represents the single source of truth enterprise context package.
 */

export interface DataCoverageSnapshotV1 {
  crmActiveCount: number;
  appointmentCount: number;
  technicianCount: number;
  staffCount: number;
  monthlyRevenueVnd: number;
  monthlyExpensesVnd: number;
  fbReach24h: number;
  approvedBudgetLimitVnd: number;
  piiRedacted: string[];
}

export interface BrandDnaSnapshotV1 {
  brandName: string;
  voiceTone: string;
  designStyle: string;
  targetSegment: string;
  strategicIntent: 'Become Premium Brand' | 'Acquire Customers' | 'Performance Campaign' | string;
}

export interface CanonicalContextPackageV1 {
  readonly version: 'v1';
  readonly contextId: string;           // e.g. ECC-CTX-2026-07-001
  readonly timestamp: string;
  readonly tenantId: string;
  readonly objective: string;
  readonly brandDna: BrandDnaSnapshotV1;
  readonly evidenceIds: string[];       // Reference evidence IDs (CRM-9342, ERP-2039)
  readonly coverage: DataCoverageSnapshotV1;
  readonly pastPlansSummary?: string;
  readonly sopRulesLoaded: string[];
}
