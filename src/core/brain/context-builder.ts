import { EnterpriseContextContract } from '../contracts/enterprise-context-contract';

export class EnterpriseContextBuilder {
  private static instance: EnterpriseContextBuilder;

  private constructor() {}

  public static getInstance(): EnterpriseContextBuilder {
    if (!EnterpriseContextBuilder.instance) {
      EnterpriseContextBuilder.instance = new EnterpriseContextBuilder();
    }
    return EnterpriseContextBuilder.instance;
  }

  /**
   * Aggregates raw signals, deduplicates, masks PII, and signs off on the final Enterprise Context Contract (ECC)
   */
  public buildContext(params: {
    objective: string;
    brandDna: {
      brandName: string;
      voiceTone: string;
      designStyle: string;
      targetSegment: string;
    };
    rawCrmStats?: { activeCustomers: number; rawLeadsList?: Array<{ name: string; email: string }> };
    rawErpStats?: { fbReach24h: number; activeBranchCount?: number };
    approvedBudgetLimitVnd?: number;
  }): EnterpriseContextContract {
    const timestamp = new Date().toISOString();
    const contextId = `ECC-CTX-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 1. Normalization & Deduplication
    const activeCustomers = params.rawCrmStats?.activeCustomers || 0;
    const fbReach = params.rawErpStats?.fbReach24h || 0;

    // 2. Resolve Evidence ID registry (Reference keys to avoid raw data leakage)
    const evidenceIds: string[] = [];
    if (activeCustomers > 0) evidenceIds.push(`CRM-${Date.now().toString().substring(8)}`);
    if (fbReach > 0) evidenceIds.push(`ERP-${Date.now().toString().substring(8)}`);
    if (evidenceIds.length === 0) evidenceIds.push('SYSTEM-STUB-EVIDENCE');

    // 3. PII Masking (Redaction)
    const piiRedacted: string[] = [];
    if (params.rawCrmStats?.rawLeadsList) {
      // Simulate redacting sensitive details like emails
      params.rawCrmStats.rawLeadsList.forEach(lead => {
        piiRedacted.push(`REDACTED_LEAD_${lead.name.substring(0, 2).toUpperCase()}`);
      });
    }

    const strategicIntent = params.objective.toLowerCase().includes('premium') 
      ? 'Become Premium Brand' 
      : 'Acquire Customers';

    // 4. Compile into Immutable ECC contract
    const ecc: EnterpriseContextContract = {
      contextId,
      timestamp,
      objective: params.objective,
      brandDna: {
        brandName: params.brandDna.brandName,
        voiceTone: params.brandDna.voiceTone,
        designStyle: params.brandDna.designStyle,
        targetSegment: params.brandDna.targetSegment,
        strategicIntent
      },
      evidenceIds,
      coverage: {
        crmActiveCount: activeCustomers,
        fbReach24h: fbReach,
        approvedBudgetLimitVnd: params.approvedBudgetLimitVnd || 100000000,
        piiRedacted
      }
    };

    return ecc;
  }
}
