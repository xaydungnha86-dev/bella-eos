/**
 * BELLA EOS CORE SERVICE: Capability Registry Service (Layer 3)
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Mission: Enterprise Capability Mapping Engine. Maps high-level enterprise capabilities
 * (e.g. Revenue Forecasting, Therapist Scheduling, Customer Voice Analysis) to underlying
 * Services, Workflows, Skill Packs, LLM models, and Required Permissions (Contract CORE-08).
 */

import { ICapabilitySpecification } from '@/types/capability-spec';

export class CapabilityRegistryService {
  private static instance: CapabilityRegistryService;
  private capabilities: Map<string, ICapabilitySpecification> = new Map();

  private constructor() {
    this.seedDefaultCapabilities();
  }

  public static getInstance(): CapabilityRegistryService {
    if (!CapabilityRegistryService.instance) {
      CapabilityRegistryService.instance = new CapabilityRegistryService();
    }
    return CapabilityRegistryService.instance;
  }

  private seedDefaultCapabilities(): void {
    this.registerCapability({
      capabilityId: 'cap-forecast-rev',
      capabilityName: 'Revenue & Cashflow Forecasting',
      category: 'FINANCE',
      mappedServiceId: 'srv-esr-scenario-planning',
      requiredSkillPack: 'financial-forecasting-pack',
      requiredModel: 'claude-3.5-sonnet',
      requiredPermission: 'ROLE_CFO_READ_WRITE',
      status: 'ACTIVE',
    });

    this.registerCapability({
      capabilityId: 'cap-market-watch',
      capabilityName: 'Strategic Competitor & Market Watch',
      category: 'MARKETING',
      mappedServiceId: 'srv-mir-watchlist',
      requiredSkillPack: 'market-intelligence-pack',
      requiredModel: 'gemini-1.5-pro',
      requiredPermission: 'ROLE_CMO_READ',
      status: 'ACTIVE',
    });
  }

  public registerCapability(cap: ICapabilitySpecification): void {
    this.capabilities.set(cap.capabilityId, cap);
  }

  public getCapability(capabilityId: string): ICapabilitySpecification | undefined {
    return this.capabilities.get(capabilityId);
  }

  public getCapabilitiesByCategory(category: ICapabilitySpecification['category']): ICapabilitySpecification[] {
    const result: ICapabilitySpecification[] = [];
    this.capabilities.forEach(c => {
      if (c.category === category && c.status === 'ACTIVE') {
        result.push(c);
      }
    });
    return result;
  }

  public getActiveCapabilitiesCount(): number {
    return this.capabilities.size;
  }
}
