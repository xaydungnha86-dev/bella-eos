/**
 * BELLA EOS CAPABILITY PLATFORM: Capability Discovery Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Natural Language Goal to Capability Decomposition & Routing.
 * Analyzes natural language objectives and maps them to capabilities (e.g. Revenue Optimization -> Marketing, Pricing)
 * before resolving the actual services or routes to run them.
 */

export interface CapabilityRoute {
  capability: string;
  associatedService: string;
  relevanceScore: number; // 0.0 to 1.0
}

export interface CapabilityDiscoveryPlan {
  originalGoal: string;
  decomposedCapabilities: string[];
  resolvedRoutes: CapabilityRoute[];
}

export class CapabilityDiscoveryService {
  private static instance: CapabilityDiscoveryService;

  private constructor() {}

  public static getInstance(): CapabilityDiscoveryService {
    if (!CapabilityDiscoveryService.instance) {
      CapabilityDiscoveryService.instance = new CapabilityDiscoveryService();
    }
    return CapabilityDiscoveryService.instance;
  }

  /**
   * Decomposes user goal into capabilities and resolves corresponding core/plugin services.
   */
  public discoverCapabilities(goal: string): CapabilityDiscoveryPlan {
    const lower = goal.toLowerCase();
    const decomposedCapabilities: string[] = [];
    const resolvedRoutes: CapabilityRoute[] = [];

    // Analyze goal keywords and map to capabilities
    if (lower.includes('doanh thu') || lower.includes('revenue') || lower.includes('tăng trưởng') || lower.includes('sales')) {
      decomposedCapabilities.push('Revenue Optimization', 'Marketing Strategy', 'Customer Retention', 'Pricing Analytics');
    }

    if (lower.includes('chi phí') || lower.includes('cost') || lower.includes('saving') || lower.includes('tối ưu')) {
      decomposedCapabilities.push('Cost Optimization', 'Operational efficiency', 'Capacity Planning');
    }

    if (lower.includes('spa') || lower.includes('mở rộng') || lower.includes('expansion') || lower.includes('chi nhánh')) {
      decomposedCapabilities.push('Geographical Expansion', 'Risk Assessment', 'Legal Compliance', 'Staff Onboarding');
    }

    if (lower.includes('nhân sự') || lower.includes('tuyển') || lower.includes('employee') || lower.includes('layoff')) {
      decomposedCapabilities.push('Talent Acquisition', 'HR Policy Compliance', 'Resource Capacity Management');
    }

    // Default fallback if no keywords match
    if (decomposedCapabilities.length === 0) {
      decomposedCapabilities.push('General Strategic Planning');
    }

    // Resolve capabilities to actual system services
    decomposedCapabilities.forEach(cap => {
      const routesForCap = this.mapCapabilityToRoutes(cap);
      resolvedRoutes.push(...routesForCap);
    });

    // Deduplicate and sort routes by relevance
    const uniqueRoutes = resolvedRoutes.filter(
      (route, idx, self) =>
        self.findIndex(r => r.capability === route.capability && r.associatedService === route.associatedService) === idx
    );

    return {
      originalGoal: goal,
      decomposedCapabilities: Array.from(new Set(decomposedCapabilities)),
      resolvedRoutes: uniqueRoutes.sort((a, b) => b.relevanceScore - a.relevanceScore),
    };
  }

  private mapCapabilityToRoutes(capability: string): CapabilityRoute[] {
    switch (capability) {
      case 'Revenue Optimization':
        return [
          { capability, associatedService: 'MIR_MARKET_INTELLIGENCE_SERVICE', relevanceScore: 0.95 },
          { capability, associatedService: 'ESR_STRATEGY_SERVICE', relevanceScore: 0.85 },
        ];
      case 'Marketing Strategy':
        return [{ capability, associatedService: 'EDR_MARKETING_EXPERT_AGENT', relevanceScore: 0.90 }];
      case 'Customer Retention':
        return [{ capability, associatedService: 'EDR_CX_EXPERT_AGENT', relevanceScore: 0.95 }];
      case 'Pricing Analytics':
        return [{ capability, associatedService: 'MIR_COMPETITOR_PRICING_MODEL', relevanceScore: 0.80 }];
      case 'Cost Optimization':
        return [
          { capability, associatedService: 'EDR_FINANCE_EXPERT_AGENT', relevanceScore: 0.95 },
          { capability, associatedService: 'ESR_EFFICIENCY_PLANNER', relevanceScore: 0.85 },
        ];
      case 'Geographical Expansion':
        return [
          { capability, associatedService: 'DIGITAL_TWIN_SIMULATOR', relevanceScore: 0.90 },
          { capability, associatedService: 'EDR_MARKET_ANALYST_AGENT', relevanceScore: 0.85 },
        ];
      case 'Risk Assessment':
        return [{ capability, associatedService: 'EDR_RISK_ANALYST_AGENT', relevanceScore: 0.95 }];
      case 'Legal Compliance':
        return [{ capability, associatedService: 'EDR_LEGAL_EXPERT_AGENT', relevanceScore: 0.95 }];
      case 'Staff Onboarding':
      case 'Talent Acquisition':
        return [{ capability, associatedService: 'EDR_HR_EXPERT_AGENT', relevanceScore: 0.90 }];
      default:
        return [{ capability, associatedService: 'ECOS_GENERIC_PLANNING_ENGINE', relevanceScore: 0.50 }];
    }
  }
}
