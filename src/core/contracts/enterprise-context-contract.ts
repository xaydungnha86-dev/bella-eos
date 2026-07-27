export interface DataCoverageSnapshot {
  crmActiveCount: number;
  fbReach24h: number;
  approvedBudgetLimitVnd: number;
  piiRedacted: string[];
}

export interface EnterpriseContextContract {
  contextId: string;                    // Ví dụ: ECC-CTX-2026-07-001
  timestamp: string;
  objective: string;
  brandDna: {
    brandName: string;
    voiceTone: string;
    designStyle: string;
    targetSegment: string;
    strategicIntent: 'Become Premium Brand' | 'Acquire Customers' | 'Performance Campaign' | string;
  };
  evidenceIds: string[];                // ID tham chiếu dữ liệu đầu vào (CRM-9342, ERP-2039)
  coverage: DataCoverageSnapshot;
}
