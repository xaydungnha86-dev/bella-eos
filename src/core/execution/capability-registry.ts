/**
 * BELLA EOS EXECUTION: Capability Registry
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Dynamic registry storing business capabilities (11-Level Hierarchy Chain).
 */

import { Capability } from '@/types/eom';

export interface EnterpriseCapability extends Capability {
  lifecycle: 'ACTIVE' | 'DEPRECATED' | 'EXPERIMENTAL';
  compatibilityVersion: string;
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, EnterpriseCapability> = new Map();

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
    const defaults: EnterpriseCapability[] = [
      {
        id: 'cap-content-gen',
        name: 'AI Marketing Content Generation',
        version: '2.0.0',
        category: 'Marketing',
        tags: ['AI', 'Copywriting'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=1.0.0'
      },
      {
        id: 'cap-policy-check',
        name: 'Enterprise Policy & Compliance Audit',
        version: '1.5.0',
        category: 'Governance',
        tags: ['Policy', 'Risk', 'Reasoning'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=1.2.0'
      },
      {
        id: 'cap-facebook-pub',
        name: 'Facebook Social Media Publisher',
        version: '1.0.0',
        category: 'Connector',
        tags: ['Social', 'API'],
        lifecycle: 'DEPRECATED',
        compatibilityVersion: '>=0.8.0'
      },
      {
        id: 'cap-reasoning',
        name: 'Logical Strategic Reasoning',
        version: '3.0.0',
        category: 'Intelligence',
        tags: ['Reasoning'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=2.0.0'
      },
      {
        id: 'cap-vision',
        name: 'Computer Vision Processing',
        version: '1.0.0',
        category: 'Intelligence',
        tags: ['Vision'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=1.0.0'
      },
      {
        id: 'cap-coding',
        name: 'Automated Code Construction',
        version: '2.5.0',
        category: 'Intelligence',
        tags: ['Coding'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=2.0.0'
      },
      {
        id: 'cap-writing',
        name: 'Premium Document Copywriting',
        version: '1.2.0',
        category: 'Intelligence',
        tags: ['Writing'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=1.0.0'
      },
      {
        id: 'cap-data',
        name: 'Big Data Pipeline Analytics',
        version: '1.8.0',
        category: 'Intelligence',
        tags: ['Data'],
        lifecycle: 'ACTIVE',
        compatibilityVersion: '>=1.5.0'
      },
    ];
    defaults.forEach(c => this.capabilities.set(c.id, c));
  }

  public register(cap: EnterpriseCapability): void {
    this.capabilities.set(cap.id, cap);
  }

  public get(id: string): EnterpriseCapability | null {
    return this.capabilities.get(id) || null;
  }

  public list(): EnterpriseCapability[] {
    return Array.from(this.capabilities.values());
  }
}
