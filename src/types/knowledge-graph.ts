/**
 * BELLA EOS PLATFORM CONTRACT: Knowledge Graph Contract (IKnowledgeNode v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages relational triples and structural knowledge graphs.
 */

export interface IRelationship {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string; // e.g. 'MANAGES', 'BELONGS_TO', 'GENERATED_REVENUE'
  weight?: number;
  properties?: Record<string, any>;
}

export interface IKnowledgeNode {
  id: string;
  tenantId: string;
  label: string; // e.g. 'Company', 'Branch', 'Employee', 'Customer'
  name: string;
  properties: Record<string, any>;
  createdAt: string;
}

export interface IKnowledgeGraphEngine {
  addNode(node: Omit<IKnowledgeNode, 'id' | 'createdAt'>): Promise<string>;
  addRelationship(rel: Omit<IRelationship, 'id'>): Promise<string>;
  getNode(id: string): Promise<IKnowledgeNode | null>;
  getNeighbors(nodeId: string, relationType?: string): Promise<{ node: IKnowledgeNode; relation: IRelationship }[]>;
  query(cypherOrPattern: string): Promise<any>;
}
