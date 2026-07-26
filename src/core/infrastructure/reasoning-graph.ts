/**
 * BELLA EOS COGNITIVE INFRASTRUCTURE SERVICE: Enterprise Reasoning Graph
 * Specification: Causal Anomalies & Explanations Graph
 */

export interface ReasoningNode {
  id: string;
  label: string;
  type: 'ANOMALY' | 'DIRECT_CAUSE' | 'ROOT_CAUSE' | 'EXTERNAL_FACTOR';
  description: string;
  evidenceNotes?: string;
  parentIds: string[];
}

export class ReasoningGraph {
  private static instance: ReasoningGraph;

  private nodes: Map<string, ReasoningNode> = new Map();

  private constructor() {
    this.seedDefaultGraph();
  }

  public static getInstance(): ReasoningGraph {
    if (!ReasoningGraph.instance) {
      ReasoningGraph.instance = new ReasoningGraph();
    }
    return ReasoningGraph.instance;
  }

  private seedDefaultGraph() {
    this.registerNode({
      id: 'rev-drop',
      label: 'Revenue ↓ (Da Nang Branch)',
      type: 'ANOMALY',
      description: 'Weekly sales target decreased by 12% in mid June.',
      parentIds: []
    });

    this.registerNode({
      id: 'cac-increase',
      label: 'CAC ↑ (Customer Acquisition Cost)',
      type: 'DIRECT_CAUSE',
      description: 'CAC increased from 150k VND to 220k VND.',
      parentIds: ['rev-drop']
    });

    this.registerNode({
      id: 'ads-cost-up',
      label: 'Ad Campaign Cost ↑',
      type: 'DIRECT_CAUSE',
      description: 'Facebook & Google ad bidding costs spiked.',
      parentIds: ['cac-increase']
    });

    this.registerNode({
      id: 'cpm-spike',
      label: 'TikTok CPM & FB Bid Rate ↑',
      type: 'EXTERNAL_FACTOR',
      description: 'Competitor bids on regional spa search terms increased.',
      parentIds: ['ads-cost-up']
    });

    this.registerNode({
      id: 'competitor-campaign',
      label: 'Competitor Launch Promo',
      type: 'ROOT_CAUSE',
      description: 'Local spa competitor launched a 50% discount campaign in Da Nang.',
      evidenceNotes: 'Observed via Hermes Ad Library tracker logs.',
      parentIds: ['cpm-spike']
    });
  }

  public registerNode(node: ReasoningNode): void {
    this.nodes.set(node.id, node);
  }

  public getNodes(): ReasoningNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(id: string): ReasoningNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Return chronological causal list back to the root cause for an anomaly ID
   */
  public traceCausalPath(anomalyId: string): ReasoningNode[] {
    const path: ReasoningNode[] = [];
    let current = this.getNode(anomalyId);
    
    while (current) {
      path.push(current);
      // Find children causing this node
      const cause = Array.from(this.nodes.values()).find(n => n.parentIds.includes(current!.id));
      current = cause;
    }
    
    return path;
  }
}
