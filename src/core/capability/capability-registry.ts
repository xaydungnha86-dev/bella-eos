/**
 * Capability Registry
 * Maps required Capabilities to candidate AI/Human Agents.
 */

import { CapabilityGraph } from './capability-graph';

export interface CapabilityAgentMapping {
  capabilityId: string;
  agentId: string;
  agentName: string;
  agentType: 'AI' | 'Human';
  performanceScore: number; // 0 - 100
  version: string;
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private mappings = new Map<string, CapabilityAgentMapping[]>();

  private constructor() {
    this.seedDefaultMappings();
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  private seedDefaultMappings(): void {
    this.registerMapping({
      capabilityId: 'cap_marketing',
      agentId: 'eos_marketing_manager',
      agentName: 'CMO AI (Executive Marketing Strategist)',
      agentType: 'AI',
      performanceScore: 98,
      version: 'v2'
    });

    this.registerMapping({
      capabilityId: 'cap_content_writing',
      agentId: 'eos_content_worker',
      agentName: 'Bella EOS Content Worker',
      agentType: 'AI',
      performanceScore: 96,
      version: 'v2'
    });

    this.registerMapping({
      capabilityId: 'cap_graphic_design',
      agentId: 'eos_creative_worker',
      agentName: 'Bella EOS Media & Creative Worker',
      agentType: 'AI',
      performanceScore: 95,
      version: 'v2'
    });

    this.registerMapping({
      capabilityId: 'cap_social_publishing',
      agentId: 'hermes_social',
      agentName: 'Hermes Social Publisher',
      agentType: 'AI',
      performanceScore: 97,
      version: 'v2'
    });

    this.registerMapping({
      capabilityId: 'cap_sales',
      agentId: 'sales_director',
      agentName: 'Sales Director AI',
      agentType: 'AI',
      performanceScore: 94,
      version: 'v2'
    });

    this.registerMapping({
      capabilityId: 'cap_finance',
      agentId: 'hermes_finance',
      agentName: 'Hermes Finance & Treasury AI',
      agentType: 'AI',
      performanceScore: 96,
      version: 'v1'
    });

    this.registerMapping({
      capabilityId: 'cap_ops',
      agentId: 'ops_operations',
      agentName: 'Ops Operations AI',
      agentType: 'AI',
      performanceScore: 95,
      version: 'v1'
    });
  }

  public registerMapping(mapping: CapabilityAgentMapping): void {
    const existing = this.mappings.get(mapping.capabilityId) || [];
    existing.push(mapping);
    this.mappings.set(mapping.capabilityId, existing);
  }

  public getAgentsForCapability(capabilityId: string): CapabilityAgentMapping[] {
    return this.mappings.get(capabilityId) || [];
  }

  public getBestAgentForCapability(capabilityId: string): CapabilityAgentMapping | undefined {
    const list = this.getAgentsForCapability(capabilityId);
    if (list.length === 0) return undefined;
    return [...list].sort((a, b) => b.performanceScore - a.performanceScore)[0];
  }
}
