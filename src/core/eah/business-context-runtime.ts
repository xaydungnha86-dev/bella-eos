/**
 * BELLA EOS EAH: Business Context Runtime (Runtime 1)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Mission: Automatically injects Enterprise Business Context (Industry, Growth Stage, OKRs, KPIs,
 * Product Catalog, Brand Identity, Positioning, SWOT). AI never has to ask "What does your company sell?".
 */

export interface BusinessContextPayload {
  tenantId: string;
  companyName: string;
  industry: string;
  growthStage: string;
  annualGoalVnd: number;
  quarterlyGoalVnd: number;
  brandIdentity: string;
  targetAudience: string;
  activeCampaigns: string[];
}

export class BusinessContextRuntime {
  private static instance: BusinessContextRuntime;
  private contextStore: Map<string, BusinessContextPayload> = new Map();

  private constructor() {
    this.seedDefaultContext();
  }

  public static getInstance(): BusinessContextRuntime {
    if (!BusinessContextRuntime.instance) {
      BusinessContextRuntime.instance = new BusinessContextRuntime();
    }
    return BusinessContextRuntime.instance;
  }

  private seedDefaultContext(): void {
    const defaultCtx: BusinessContextPayload = {
      tenantId: 'default-tenant',
      companyName: 'Bella Beauty & Healthcare Spa',
      industry: 'High-End Beauty & Wellness Spa',
      growthStage: 'SCALE_UP',
      annualGoalVnd: 15_000_000_000,
      quarterlyGoalVnd: 3_800_000_000,
      brandIdentity: 'Premium Organic Skincare & Aesthetic Wellness',
      targetAudience: 'Female professionals aged 28-45 in urban centers',
      activeCampaigns: ['Bella Summer 2026 Retargeting', 'VIP Membership Upgrade Q3'],
    };
    this.contextStore.set(defaultCtx.tenantId, defaultCtx);
  }

  public getContext(tenantId: string): BusinessContextPayload {
    return this.contextStore.get(tenantId) || this.contextStore.get('default-tenant')!;
  }
}
