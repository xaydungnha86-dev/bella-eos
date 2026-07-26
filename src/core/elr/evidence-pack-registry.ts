/**
 * BELLA EOS ELR: Enterprise Evidence Pack Registry
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Manages standard Evidence Pack Assets. Each Evidence Pack encapsulates domain-specific
 * parsing rules, metric extraction rules, validation thresholds, and knowledge distillation rules.
 * 
 * 8 Standard Evidence Packs:
 * 1. Meeting Pack
 * 2. Campaign Pack
 * 3. Financial Pack
 * 4. Incident Pack
 * 5. SOP Pack
 * 6. Audit Pack
 * 7. Customer Feedback Pack
 * 8. HR Review Pack
 */

export interface EvidencePackRules {
  packId: string;
  packName: string;
  targetEvidenceType: string;
  parserRules: {
    expectedObjectTypes: string[];
    mandatoryFields: string[];
  };
  extractionRules: {
    targetMetricNames: string[];
    defaultUnit: string;
  };
  validationRules: {
    minConfidenceThreshold: number; // e.g. 0.80
    crossCheckRequired: boolean;
  };
  knowledgeRules: {
    autoGeneratePatterns: boolean;
    defaultCategory: string;
  };
}

export class EvidencePackRegistry {
  private static instance: EvidencePackRegistry;
  private packs: Map<string, EvidencePackRules> = new Map();

  private constructor() {
    this.registerStandardPacks();
  }

  public static getInstance(): EvidencePackRegistry {
    if (!EvidencePackRegistry.instance) {
      EvidencePackRegistry.instance = new EvidencePackRegistry();
    }
    return EvidencePackRegistry.instance;
  }

  private registerStandardPacks(): void {
    const standardPacks: EvidencePackRules[] = [
      {
        packId: 'pack-meeting',
        packName: 'Meeting Minutes Evidence Pack',
        targetEvidenceType: 'MEETING_MINUTES',
        parserRules: { expectedObjectTypes: ['DECISION', 'ACTION', 'OWNER', 'DEADLINE'], mandatoryFields: ['title', 'attendees'] },
        extractionRules: { targetMetricNames: ['Revenue', 'Budget', 'Attendance'], defaultUnit: 'VND' },
        validationRules: { minConfidenceThreshold: 0.80, crossCheckRequired: true },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'LESSON_LEARNED' },
      },
      {
        packId: 'pack-campaign',
        packName: 'Campaign Performance Pack',
        targetEvidenceType: 'CAMPAIGN_REPORT',
        parserRules: { expectedObjectTypes: ['CAMPAIGN', 'KPI', 'RISK'], mandatoryFields: ['campaignId', 'channel'] },
        extractionRules: { targetMetricNames: ['ROAS', 'CAC', 'Cost', 'Bookings', 'Conversion'], defaultUnit: 'VND' },
        validationRules: { minConfidenceThreshold: 0.85, crossCheckRequired: true },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'SUCCESS_PATTERN' },
      },
      {
        packId: 'pack-financial',
        packName: 'Financial Report Pack',
        targetEvidenceType: 'ERP_EXPORT',
        parserRules: { expectedObjectTypes: ['KPI', 'DECISION'], mandatoryFields: ['period', 'ledgerId'] },
        extractionRules: { targetMetricNames: ['Revenue', 'Cost', 'Profit', 'Salary'], defaultUnit: 'VND' },
        validationRules: { minConfidenceThreshold: 0.90, crossCheckRequired: true },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'BEST_PRACTICE' },
      },
      {
        packId: 'pack-incident',
        packName: 'Incident Report Pack',
        targetEvidenceType: 'INCIDENT_REPORT',
        parserRules: { expectedObjectTypes: ['ISSUE', 'RISK', 'ACTION'], mandatoryFields: ['severity', 'description'] },
        extractionRules: { targetMetricNames: ['DowntimeMinutes', 'FinancialLoss'], defaultUnit: 'VND' },
        validationRules: { minConfidenceThreshold: 0.80, crossCheckRequired: false },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'RISK_CATALOG' },
      },
      {
        packId: 'pack-sop',
        packName: 'SOP Review Pack',
        targetEvidenceType: 'SOP_REVIEW',
        parserRules: { expectedObjectTypes: ['ACTION', 'RISK'], mandatoryFields: ['sopId', 'version'] },
        extractionRules: { targetMetricNames: ['ExecutionTimeMinutes', 'ComplianceScore'], defaultUnit: 'SCORE' },
        validationRules: { minConfidenceThreshold: 0.85, crossCheckRequired: false },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'BEST_PRACTICE' },
      },
      {
        packId: 'pack-audit',
        packName: 'Audit Evidence Pack',
        targetEvidenceType: 'EXCEL_KPI',
        parserRules: { expectedObjectTypes: ['KPI', 'ISSUE'], mandatoryFields: ['auditorId', 'scope'] },
        extractionRules: { targetMetricNames: ['DiscrepancyCount', 'AuditScore'], defaultUnit: 'COUNT' },
        validationRules: { minConfidenceThreshold: 0.90, crossCheckRequired: true },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'ANTI_PATTERN' },
      },
      {
        packId: 'pack-feedback',
        packName: 'Customer Feedback Pack',
        targetEvidenceType: 'CUSTOMER_FEEDBACK',
        parserRules: { expectedObjectTypes: ['ISSUE', 'KPI'], mandatoryFields: ['customerId', 'channel'] },
        extractionRules: { targetMetricNames: ['NPS', 'CSATScore', 'ChurnRisk'], defaultUnit: 'SCORE' },
        validationRules: { minConfidenceThreshold: 0.75, crossCheckRequired: false },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'RECOMMENDATION' },
      },
      {
        packId: 'pack-hr',
        packName: 'HR Review Pack',
        targetEvidenceType: 'MONTHLY_REPORT',
        parserRules: { expectedObjectTypes: ['OWNER', 'KPI'], mandatoryFields: ['employeeId', 'department'] },
        extractionRules: { targetMetricNames: ['PerformanceRating', 'Salary', 'TurnoverRisk'], defaultUnit: 'SCORE' },
        validationRules: { minConfidenceThreshold: 0.85, crossCheckRequired: true },
        knowledgeRules: { autoGeneratePatterns: true, defaultCategory: 'LESSON_LEARNED' },
      },
    ];

    for (const p of standardPacks) {
      this.packs.set(p.packId, p);
    }
  }

  public registerPack(pack: EvidencePackRules): void {
    this.packs.set(pack.packId, pack);
  }

  public getPack(packId: string): EvidencePackRules | undefined {
    return this.packs.get(packId);
  }

  public getPackForEvidenceType(evidenceType: string): EvidencePackRules | undefined {
    return Array.from(this.packs.values()).find(p => p.targetEvidenceType === evidenceType);
  }

  public listPacks(): EvidencePackRules[] {
    return Array.from(this.packs.values());
  }
}
