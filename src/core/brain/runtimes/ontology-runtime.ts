/**
 * BELLA EOS BRAIN: Ontology Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IOntologyEngine v1.0.
 */

import { IOntology, IOntologyEngine, OntologyConcept } from '@/types/ontology';

export class OntologyRuntime implements IOntologyEngine {
  private static instance: OntologyRuntime;
  private ontologies: Map<string, IOntology> = new Map();

  private constructor() {}

  public static getInstance(): OntologyRuntime {
    if (!OntologyRuntime.instance) {
      OntologyRuntime.instance = new OntologyRuntime();
    }
    return OntologyRuntime.instance;
  }

  public async registerOntology(ontology: IOntology): Promise<boolean> {
    this.ontologies.set(ontology.id, ontology);
    return true;
  }

  public async getConcept(ontologyId: string, conceptName: string): Promise<OntologyConcept | null> {
    const ont = this.ontologies.get(ontologyId);
    if (!ont) return null;
    return ont.concepts.find(c => c.name.toLowerCase() === conceptName.toLowerCase()) || null;
  }

  public async validateEntity(ontologyId: string, conceptName: string, payload: any): Promise<{ valid: boolean; errors?: string[] }> {
    const concept = await this.getConcept(ontologyId, conceptName);
    if (!concept) {
      return { valid: false, errors: [`Concept ${conceptName} not found in ontology ${ontologyId}`] };
    }

    const errors: string[] = [];
    for (const attr of concept.attributes) {
      if (attr.required && (payload[attr.name] === undefined || payload[attr.name] === null)) {
        errors.push(`Missing required attribute: ${attr.name}`);
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }
}
