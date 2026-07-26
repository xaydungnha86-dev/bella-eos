/**
 * BELLA EOS COGNITIVE INFRASTRUCTURE SERVICE: Enterprise Semantic Layer
 * Specification: EECOS Business Ontology Engine
 */

export interface OntologyEntity {
  id: string;
  name: string;
  type: 'CONCEPT' | 'ACTOR' | 'METRIC' | 'CAMPAIGN';
  description: string;
}

export interface OntologyRelation {
  sourceId: string;
  targetId: string;
  type: 'is_a' | 'belongs_to' | 'eligible_for' | 'triggers' | 'monitors' | 'composed_of';
}

export class SemanticLayer {
  private static instance: SemanticLayer;

  private entities: Map<string, OntologyEntity> = new Map();
  private relations: OntologyRelation[] = [];

  private constructor() {
    this.seedDefaultOntology();
  }

  public static getInstance(): SemanticLayer {
    if (!SemanticLayer.instance) {
      SemanticLayer.instance = new SemanticLayer();
    }
    return SemanticLayer.instance;
  }

  private seedDefaultOntology() {
    // Concepts
    this.registerEntity({ id: 'ent-customer', name: 'Customer', type: 'CONCEPT', description: 'Core customer profile' });
    this.registerEntity({ id: 'ent-vip-customer', name: 'VIP Customer', type: 'CONCEPT', description: 'High-value customer segment' });
    
    // Tiers
    this.registerEntity({ id: 'ent-gold-tier', name: 'Gold Tier Member', type: 'CONCEPT', description: 'Gold membership level' });
    this.registerEntity({ id: 'ent-platinum-tier', name: 'Platinum Tier Member', type: 'CONCEPT', description: 'Premium membership level' });
    
    // Campaigns & Metrics
    this.registerEntity({ id: 'ent-premium-campaign', name: 'Premium Loyalty Campaign', type: 'CAMPAIGN', description: 'Exclusive perks and booking priorities' });
    this.registerEntity({ id: 'ent-leads-count', name: 'Spa Leads Count', type: 'METRIC', description: 'Total prospective bookings acquired' });

    // Relations
    this.registerRelation('ent-vip-customer', 'ent-customer', 'is_a');
    this.registerRelation('ent-vip-customer', 'ent-gold-tier', 'belongs_to');
    this.registerRelation('ent-vip-customer', 'ent-platinum-tier', 'belongs_to');
    this.registerRelation('ent-gold-tier', 'ent-premium-campaign', 'eligible_for');
    this.registerRelation('ent-platinum-tier', 'ent-premium-campaign', 'eligible_for');
    this.registerRelation('ent-premium-campaign', 'ent-leads-count', 'monitors');
  }

  public registerEntity(entity: OntologyEntity): void {
    this.entities.set(entity.id, entity);
  }

  public registerRelation(sourceId: string, targetId: string, type: OntologyRelation['type']): void {
    this.relations.push({ sourceId, targetId, type });
  }

  public getEntities(): OntologyEntity[] {
    return Array.from(this.entities.values());
  }

  public getRelations(): OntologyRelation[] {
    return this.relations;
  }

  /**
   * Traces paths of relations starting from an entity
   */
  public traceRelations(entityId: string): string[] {
    const paths: string[] = [];
    const direct = this.relations.filter(r => r.sourceId === entityId);
    
    for (const rel of direct) {
      const target = this.entities.get(rel.targetId);
      if (target) {
        paths.push(`${entityId} --(${rel.type})--> ${target.name} (${target.type})`);
      }
    }
    return paths;
  }
}
