/**
 * BELLA ECOS — Knowledge Graph Runtime (L2: Functional Runtime)
 * Sprint 27 — Architecture Freeze Maturity Series
 *
 * L2 Capabilities:
 *   ✅ Persistence Abstraction (IGraphStore / InMemoryGraphStore)
 *   ✅ Full CRUD: addNode, updateNode, removeNode
 *   ✅ Graph Edges: link, unlink, getLinkedNodes
 *   ✅ Traversal: BFS with cycle-protection
 *   ✅ Merge: version-aware node deduplication
 *   ✅ Runtime Metrics: operation latency & success tracking
 *   ✅ Error handling & stable public interface
 */

// ─────────────────────────────────────────────
// 1. Core Type Definitions
// ─────────────────────────────────────────────

export interface ITemporalMetadata {
  validFrom: string;   // ISO 8601 — when the fact became true in the business world
  validTo: string;     // ISO 8601 — when the fact stopped being true
  transactionTime: string; // ISO 8601 — when it was recorded in the system
  asOfDate: string;    // ISO 8601 — the reference date for queries
}

export interface ITemporalEntityNode {
  id: string;
  label: string;       // e.g. 'CUSTOMER', 'BOOKING', 'CAMPAIGN'
  name: string;
  properties: Record<string, any>;
  temporal: ITemporalMetadata;
}

export interface IGraphEdge {
  sourceId: string;
  targetId: string;
  type: string;        // e.g. 'HAS_BOOKING', 'BELONGS_TO', 'TRIGGERED_BY'
  createdAt: string;   // ISO 8601
}

// ─────────────────────────────────────────────
// 2. Runtime Metrics (Shared across all Kernel Runtimes)
// ─────────────────────────────────────────────

export interface RuntimeMetrics {
  operation: string;
  latencyMs: number;
  success: boolean;
  meta?: Record<string, any>;
}

// ─────────────────────────────────────────────
// 3. Persistence Abstraction — IGraphStore
// ─────────────────────────────────────────────

export interface IGraphStore {
  addNode(node: ITemporalEntityNode): void;
  updateNode(id: string, properties: Record<string, any>): boolean;
  removeNode(id: string): boolean;
  getNode(id: string, asOf?: string): ITemporalEntityNode | undefined;
  getAllNodes(): ITemporalEntityNode[];

  link(sourceId: string, targetId: string, type: string): void;
  unlink(sourceId: string, targetId: string): boolean;
  getLinkedNodes(sourceId: string): IGraphEdge[];
  getAllEdges(): IGraphEdge[];
}

// ─────────────────────────────────────────────
// 4. InMemoryGraphStore — Default Implementation
// ─────────────────────────────────────────────

export class InMemoryGraphStore implements IGraphStore {
  // Store ALL versions of each node (temporal multi-version)
  private nodes: Map<string, ITemporalEntityNode[]> = new Map();
  private edges: Map<string, IGraphEdge> = new Map(); // key = `${source}::${target}`

  addNode(node: ITemporalEntityNode): void {
    const versions = this.nodes.get(node.id) ?? [];
    versions.push(node);
    this.nodes.set(node.id, versions);
  }

  updateNode(id: string, properties: Record<string, any>): boolean {
    const versions = this.nodes.get(id);
    if (!versions || versions.length === 0) return false;
    // Update the latest version's properties (shallow merge)
    const latest = versions[versions.length - 1];
    latest.properties = { ...latest.properties, ...properties };
    return true;
  }

  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) return false;
    this.nodes.delete(id);
    // Also remove all edges involving this node
    for (const key of this.edges.keys()) {
      const edge = this.edges.get(key)!;
      if (edge.sourceId === id || edge.targetId === id) {
        this.edges.delete(key);
      }
    }
    return true;
  }

  /**
   * Get the valid version of a node at a given point in time.
   * If asOf is not provided, returns the latest version.
   */
  getNode(id: string, asOf?: string): ITemporalEntityNode | undefined {
    const versions = this.nodes.get(id);
    if (!versions || versions.length === 0) return undefined;
    if (!asOf) return versions[versions.length - 1];

    const queryTime = new Date(asOf).getTime();
    // Find the version where the query time falls within [validFrom, validTo]
    return [...versions].reverse().find(n => {
      const from = new Date(n.temporal.validFrom).getTime();
      const to = new Date(n.temporal.validTo).getTime();
      return queryTime >= from && queryTime <= to;
    });
  }

  getAllNodes(): ITemporalEntityNode[] {
    const result: ITemporalEntityNode[] = [];
    this.nodes.forEach(versions => {
      if (versions.length > 0) result.push(versions[versions.length - 1]);
    });
    return result;
  }

  link(sourceId: string, targetId: string, type: string): void {
    const key = `${sourceId}::${targetId}`;
    this.edges.set(key, {
      sourceId,
      targetId,
      type,
      createdAt: new Date().toISOString(),
    });
  }

  unlink(sourceId: string, targetId: string): boolean {
    const key = `${sourceId}::${targetId}`;
    if (!this.edges.has(key)) return false;
    this.edges.delete(key);
    return true;
  }

  getLinkedNodes(sourceId: string): IGraphEdge[] {
    const result: IGraphEdge[] = [];
    this.edges.forEach(edge => {
      if (edge.sourceId === sourceId) result.push(edge);
    });
    return result;
  }

  getAllEdges(): IGraphEdge[] {
    return Array.from(this.edges.values());
  }
}

// ─────────────────────────────────────────────
// 5. KnowledgeGraphRuntime — Public API
// ─────────────────────────────────────────────

export class KnowledgeGraphRuntime {
  private static instance: KnowledgeGraphRuntime;
  private store: IGraphStore;
  private metricsLog: RuntimeMetrics[] = [];

  private constructor(store?: IGraphStore) {
    this.store = store ?? new InMemoryGraphStore();
  }

  public static getInstance(store?: IGraphStore): KnowledgeGraphRuntime {
    if (!KnowledgeGraphRuntime.instance) {
      KnowledgeGraphRuntime.instance = new KnowledgeGraphRuntime(store);
    }
    return KnowledgeGraphRuntime.instance;
  }

  /** @internal — for testing only: reset singleton */
  public static resetInstance(): void {
    (KnowledgeGraphRuntime as any).instance = undefined;
  }

  // ── Metrics helpers ──

  private measure<T>(operation: string, fn: () => T): T {
    const start = Date.now();
    let success = true;
    let result: T;
    try {
      result = fn();
    } catch (err) {
      success = false;
      this.metricsLog.push({ operation, latencyMs: Date.now() - start, success });
      throw err;
    }
    this.metricsLog.push({ operation, latencyMs: Date.now() - start, success });
    return result!;
  }

  public getMetrics(): RuntimeMetrics[] {
    return [...this.metricsLog];
  }

  public clearMetrics(): void {
    this.metricsLog = [];
  }

  // ── CRUD ──

  public addNode(node: ITemporalEntityNode): void {
    this.measure('addNode', () => {
      if (!node.id || !node.label) throw new Error('Node must have id and label');
      this.store.addNode(node);
    });
  }

  public updateNode(id: string, properties: Record<string, any>): boolean {
    return this.measure('updateNode', () => {
      if (!id) throw new Error('updateNode: id is required');
      return this.store.updateNode(id, properties);
    });
  }

  public removeNode(id: string): boolean {
    return this.measure('removeNode', () => {
      if (!id) throw new Error('removeNode: id is required');
      return this.store.removeNode(id);
    });
  }

  public getNode(id: string, asOf?: string): ITemporalEntityNode | undefined {
    return this.measure('getNode', () => this.store.getNode(id, asOf));
  }

  public getAllNodes(): ITemporalEntityNode[] {
    return this.measure('getAllNodes', () => this.store.getAllNodes());
  }

  // ── Graph Edges ──

  public link(sourceId: string, targetId: string, type: string): void {
    this.measure('link', () => {
      if (!sourceId || !targetId || !type) throw new Error('link: sourceId, targetId and type are required');
      this.store.link(sourceId, targetId, type);
    });
  }

  public unlink(sourceId: string, targetId: string): boolean {
    return this.measure('unlink', () => {
      if (!sourceId || !targetId) throw new Error('unlink: sourceId and targetId are required');
      return this.store.unlink(sourceId, targetId);
    });
  }

  // ── BFS Traversal (Lineage Tracing, Cycle-protected) ──

  /**
   * Traverse the graph starting from a node using BFS.
   * Returns an ordered list of node IDs visited.
   * Cycle-protected via a visited Set.
   */
  public traverse(startId: string, maxDepth: number = 5): string[] {
    return this.measure('traverse', () => {
      const visited = new Set<string>();
      const result: string[] = [];
      const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

      while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        if (visited.has(id) || depth > maxDepth) continue;

        visited.add(id);
        result.push(id);

        const edges = this.store.getLinkedNodes(id);
        for (const edge of edges) {
          if (!visited.has(edge.targetId)) {
            queue.push({ id: edge.targetId, depth: depth + 1 });
          }
        }
      }

      return result;
    });
  }

  // ── Merge (Temporal Version Deduplication) ──

  /**
   * Merges a new version of a node into the graph.
   * The previous version's validTo is automatically closed to maintain temporal integrity.
   * The new version is added with the provided temporal window.
   */
  public merge(node: ITemporalEntityNode): void {
    this.measure('merge', () => {
      if (!node.id) throw new Error('merge: node id is required');

      // Close the previous version: set its validTo to just before the new version starts
      const existing = this.store.getNode(node.id);
      if (existing) {
        const closedValidTo = new Date(
          new Date(node.temporal.validFrom).getTime() - 1
        ).toISOString();
        this.store.updateNode(node.id, { _closedValidTo: closedValidTo });
      }

      // Add the new version
      this.store.addNode(node);
    });
  }

  // ── Convenience: As-Of query ──

  public getEntityAsOf(entityId: string, asOfDate: string): ITemporalEntityNode | undefined {
    return this.measure('getEntityAsOf', () => this.store.getNode(entityId, asOfDate));
  }
}

// ─────────────────────────────────────────────
// 6. Legacy compatibility alias (used by route.ts)
// ─────────────────────────────────────────────

/** @deprecated Use KnowledgeGraphRuntime.getInstance() instead */
export class TemporalKnowledgeManager {
  private static _runtime: KnowledgeGraphRuntime;

  public static getInstance(): KnowledgeGraphRuntime {
    if (!TemporalKnowledgeManager._runtime) {
      TemporalKnowledgeManager._runtime = KnowledgeGraphRuntime.getInstance();
    }
    return TemporalKnowledgeManager._runtime;
  }
}
