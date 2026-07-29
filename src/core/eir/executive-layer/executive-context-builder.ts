import { ExecutiveContext } from '@/types/executive-session';

export interface ContextProvider {
  name: string;
  collect(ceoIntent: string): Promise<Partial<ExecutiveContext>>;
}

export class CRMContextProvider implements ContextProvider {
  name = 'CRMProvider';
  async collect(ceoIntent: string): Promise<Partial<ExecutiveContext>> {
    // Simulated CRM context (retention & customer info)
    return {
      activeCampaignsCount: 2
    };
  }
}

export class ERPContextProvider implements ContextProvider {
  name = 'ERPProvider';
  async collect(ceoIntent: string): Promise<Partial<ExecutiveContext>> {
    // Simulated ERP context (finance & budget info)
    return {
      currentRevenue: 5000 // 5B VND baseline
    };
  }
}

export class HRContextProvider implements ContextProvider {
  name = 'HRProvider';
  async collect(ceoIntent: string): Promise<Partial<ExecutiveContext>> {
    // Simulated HR context (headcount & workforce)
    return {
      workforceCapacity: 8
    };
  }
}

export class MarketContextProvider implements ContextProvider {
  name = 'MarketProvider';
  async collect(ceoIntent: string): Promise<Partial<ExecutiveContext>> {
    // Simulated Market context (competitors & seasonality)
    return {
      seasonalityMultiplier: 1.0,
      competitorVolume: 'medium'
    };
  }
}

export class FinanceContextProvider implements ContextProvider {
  name = 'FinanceProvider';
  async collect(ceoIntent: string): Promise<Partial<ExecutiveContext>> {
    // Simulated Finance context (cash runway & risk appetite)
    return {
      cashRunway: 12,
      riskAppetite: 'balanced'
    };
  }
}

export class ExecutiveContextBuilder {
  private providers: ContextProvider[];

  constructor(providers?: ContextProvider[]) {
    this.providers = providers || [
      new CRMContextProvider(),
      new ERPContextProvider(),
      new HRContextProvider(),
      new MarketContextProvider(),
      new FinanceContextProvider()
    ];
  }

  async buildContext(ceoIntent: string): Promise<ExecutiveContext> {
    console.log('[Context Builder] Initiating context collection via providers...');
    
    // Default fallback values
    let currentRevenue = 5000;
    let cashRunway = 12;
    let seasonalityMultiplier = 1.0;
    let competitorVolume: 'low' | 'medium' | 'high' = 'medium';
    let activeCampaignsCount = 2;
    let workforceCapacity = 8;
    let riskAppetite: 'conservative' | 'balanced' | 'aggressive' = 'balanced';
    let isDegraded = false;

    for (const provider of this.providers) {
      try {
        const data = await provider.collect(ceoIntent);
        
        if (data.currentRevenue !== undefined) currentRevenue = data.currentRevenue;
        if (data.cashRunway !== undefined) cashRunway = data.cashRunway;
        if (data.seasonalityMultiplier !== undefined) seasonalityMultiplier = data.seasonalityMultiplier;
        if (data.competitorVolume !== undefined) competitorVolume = data.competitorVolume;
        if (data.activeCampaignsCount !== undefined) activeCampaignsCount = data.activeCampaignsCount;
        if (data.workforceCapacity !== undefined) workforceCapacity = data.workforceCapacity;
        if (data.riskAppetite !== undefined) riskAppetite = data.riskAppetite;
        
        console.log(`[Context Builder] ✓ ${provider.name} collected successfully.`);
      } catch (error) {
        console.warn(`[Context Builder] ⚠️ ${provider.name} failed. Operating in degraded state:`, error);
        isDegraded = true;
      }
    }

    return {
      currentRevenue,
      cashRunway,
      seasonalityMultiplier,
      competitorVolume,
      activeCampaignsCount,
      workforceCapacity,
      riskAppetite,
      status: isDegraded ? 'degraded' : 'grounded'
    };
  }
}
