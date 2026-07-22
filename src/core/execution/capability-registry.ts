/**
 * BELLA EOS EXECUTION: Capability Registry
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Dynamic registry storing business capabilities (11-Level Hierarchy Chain).
 */

import { Capability } from '@/types/eom';

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, Capability> = new Map();

  private constructor() {
    this.registerDefaultCapabilities();
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  private registerDefaultCapabilities(): void {
    const defaults: Capability[] = [
      { id: 'cap-content-gen', name: 'AI Marketing Content Generation', version: '1.0', category: 'Marketing', tags: ['AI', 'Copywriting'] },
      { id: 'cap-policy-check', name: 'Enterprise Policy & Compliance Audit', version: '1.0', category: 'Governance', tags: ['Policy', 'Risk'] },
      { id: 'cap-facebook-pub', name: 'Facebook Social Media Publisher', version: '1.0', category: 'Connector', tags: ['Social', 'API'] },
    ];
    defaults.forEach(c => this.capabilities.set(c.id, c));
  }

  public register(cap: Capability): void {
    this.capabilities.set(cap.id, cap);
  }

  public get(id: string): Capability | null {
    return this.capabilities.get(id) || null;
  }

  public list(): Capability[] {
    return Array.from(this.capabilities.values());
  }
}
