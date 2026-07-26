/**
 * BELLA EOS ELR: Entity Resolution Runtime (Runtime 4)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Canonical entity mapping across all Enterprise Inputs. Resolves raw aliases
 * and variations (e.g. "Bella Summer" ➔ Campaign #125, "Spa Q1" ➔ Branch #3, 
 * "Facebook" ➔ Marketing Channel) to maintain zero duplicate entities in Knowledge Graph.
 */

import { IEvidence } from '@/types/evidence';

export interface CanonicalEntityMapping {
  canonicalId: string;
  canonicalName: string;
  entityType: 'CAMPAIGN' | 'BRANCH' | 'CHANNEL' | 'DEPARTMENT' | 'EMPLOYEE' | 'CUSTOMER' | 'PRODUCT';
  aliases: string[];
}

export interface EntityResolutionResult {
  evidenceId: string;
  resolvedMappings: {
    rawAlias: string;
    canonicalId: string;
    canonicalName: string;
    entityType: string;
  }[];
}

export class EntityResolutionRuntime {
  private static instance: EntityResolutionRuntime;
  private entityRegistry: Map<string, CanonicalEntityMapping> = new Map();

  private constructor() {
    // Seed default Enterprise Canonical Mappings
    this.registerEntity({
      canonicalId: 'campaign-125',
      canonicalName: 'Bella Summer 2026',
      entityType: 'CAMPAIGN',
      aliases: ['bella summer', 'chiến dịch hè', 'summer campaign', 'bella summer 2026'],
    });

    this.registerEntity({
      canonicalId: 'branch-3',
      canonicalName: 'Spa Chi Nhánh Q1',
      entityType: 'BRANCH',
      aliases: ['spa q1', 'chi nhánh quận 1', 'spa quận 1', 'q1 branch'],
    });

    this.registerEntity({
      canonicalId: 'channel-mkt-fb',
      canonicalName: 'Facebook Ads Channel',
      entityType: 'CHANNEL',
      aliases: ['facebook', 'fb', 'fb ads', 'facebook video'],
    });
  }

  public static getInstance(): EntityResolutionRuntime {
    if (!EntityResolutionRuntime.instance) {
      EntityResolutionRuntime.instance = new EntityResolutionRuntime();
    }
    return EntityResolutionRuntime.instance;
  }

  public registerEntity(mapping: CanonicalEntityMapping): void {
    this.entityRegistry.set(mapping.canonicalId, mapping);
  }

  public resolveEntities(evidence: IEvidence): EntityResolutionResult {
    const rawText = typeof evidence.content === 'string' 
      ? evidence.content 
      : JSON.stringify(evidence.content);
    
    const textLower = rawText.toLowerCase();
    const resolved: EntityResolutionResult['resolvedMappings'] = [];

    for (const entity of Array.from(this.entityRegistry.values())) {
      for (const alias of entity.aliases) {
        if (textLower.includes(alias.toLowerCase())) {
          resolved.push({
            rawAlias: alias,
            canonicalId: entity.canonicalId,
            canonicalName: entity.canonicalName,
            entityType: entity.entityType,
          });
          break; // Avoid multi-alias duplicate matches for same canonical entity
        }
      }
    }

    evidence.status = 'RESOLVED';
    return {
      evidenceId: evidence.id,
      resolvedMappings: resolved,
    };
  }

  public getCanonicalMapping(alias: string): CanonicalEntityMapping | undefined {
    const lower = alias.toLowerCase();
    return Array.from(this.entityRegistry.values()).find(e => 
      e.aliases.some(a => a.toLowerCase() === lower) || e.canonicalName.toLowerCase() === lower
    );
  }
}
