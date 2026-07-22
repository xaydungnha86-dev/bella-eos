/**
 * BELLA EOS BRAIN: Knowledge Graph Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IKnowledgeGraphEngine v1.0.
 */

import { IKnowledgeGraphEngine, IKnowledgeNode, IRelationship } from '@/types/knowledge-graph';

export class KnowledgeGraphRuntime implements IKnowledgeGraphEngine {
  private static instance: KnowledgeGraphRuntime;
  private nodes: Map<string, IKnowledgeNode> = new Map();
  private relationships: Map<string, IRelationship> = new Map();
  private nodeNeighbors: Map<string, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeGraphRuntime {
    if (!KnowledgeGraphRuntime.instance) {
      KnowledgeGraphRuntime.instance = new KnowledgeGraphRuntime();
    }
    return KnowledgeGraphRuntime.instance;
  }

  public async addNode(nodeInput: Omit<IKnowledgeNode, 'id' | 'createdAt'>): Promise<string> {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const node: IKnowledgeNode = {
      ...nodeInput,
      id,
      createdAt: new Date().toISOString(),
    };
    this.nodes.set(id, node);
    this.nodeNeighbors.set(id, new Set());
    return id;
  }

  public async addRelationship(relInput: Omit<IRelationship, 'id'>): Promise<string> {
    const id = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const rel: IRelationship = { ...relInput, id };
    this.relationships.set(id, rel);

    if (this.nodeNeighbors.has(rel.sourceNodeId)) {
      this.nodeNeighbors.get(rel.sourceNodeId)!.add(id);
    }
    return id;
  }

  public async getNode(id: string): Promise<IKnowledgeNode | null> {
    return this.nodes.get(id) || null;
  }

  public async getNeighbors(nodeId: string, relationType?: string): Promise<{ node: IKnowledgeNode; relation: IRelationship }[]> {
    const relIds = this.nodeNeighbors.get(nodeId);
    if (!relIds) return [];

    const results: { node: IKnowledgeNode; relation: IRelationship }[] = [];
    for (const relId of relIds) {
      const rel = this.relationships.get(relId);
      if (!rel) continue;
      if (relationType && rel.relationType !== relationType) continue;

      const targetNode = this.nodes.get(rel.targetNodeId);
      if (targetNode) {
        results.push({ node: targetNode, relation: rel });
      }
    }
    return results;
  }

  public async query(cypherOrPattern: string): Promise<any> {
    return Array.from(this.nodes.values()).filter(n => n.name.toLowerCase().includes(cypherOrPattern.toLowerCase()));
  }
}
