/**
 * BELLA EOS PLATFORM CONTRACT: Enterprise Ontology Contract (IOntology v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages domain ontologies, taxonomies, and entity type definitions.
 */

export interface OntologyConcept {
  id: string;
  name: string;
  parentConceptId?: string;
  attributes: Array<{ name: string; type: string; required: boolean }>;
}

export interface IOntology {
  id: string;
  domain: string; // e.g. 'SPA_CLINIC', 'RETAIL', 'HEALTHCARE'
  version: string;
  concepts: OntologyConcept[];
  createdDate: string;
}

export interface IOntologyEngine {
  registerOntology(ontology: IOntology): Promise<boolean>;
  getConcept(ontologyId: string, conceptName: string): Promise<OntologyConcept | null>;
  validateEntity(ontologyId: string, conceptName: string, payload: any): Promise<{ valid: boolean; errors?: string[] }>;
}
