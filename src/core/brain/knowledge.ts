export interface GraphNode {
  id: string;
  label: string;
  name: string;
  properties: any;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export class KnowledgeCenter {
  private static nodes: GraphNode[] = [
    { id: 'company_bella', label: 'Company', name: 'Bella Group', properties: { industry: 'Beauty & Wellness', scale: 'Enterprise' } },
    { id: 'app_crm', label: 'App', name: 'SpaPOS CRM', properties: { location: 'Local Cloud', tables: 42 } },
    { id: 'policy_budget', label: 'Policy', name: 'POL-GOV-001', properties: { description: 'Budget verification policy', limitVnd: 100000000 } }
  ];

  private static edges: GraphEdge[] = [
    { source: 'app_crm', target: 'company_bella', type: 'BELONGS_TO' },
    { source: 'policy_budget', target: 'company_bella', type: 'APPLIES_TO' }
  ];

  // Company DNA specifications
  static CompanyDNA = {
    voiceTone: 'Professional & Premium',
    style: 'Minimalist Glassmorphism',
    philosophy: 'Fact-Based Decisions'
  };

  static addNode(id: string, label: string, name: string, properties: any = {}): GraphNode {
    const node: GraphNode = { id, label, name, properties };
    this.nodes.push(node);
    return node;
  }

  static addEdge(source: string, target: string, type: string): GraphEdge {
    const edge: GraphEdge = { source, target, type };
    this.edges.push(edge);
    return edge;
  }

  static getNodes(): GraphNode[] {
    return [...this.nodes];
  }

  static getEdges(): GraphEdge[] {
    return [...this.edges];
  }

  static getStats() {
    return {
      nodesCount: this.nodes.length,
      edgesCount: this.edges.length
    };
  }

  static updateDNA(tone: string, style: string) {
    this.CompanyDNA.voiceTone = tone;
    this.CompanyDNA.style = style;
    console.log(`[Knowledge Center] Company DNA Updated: Tone = ${tone}, Style = ${style}`);
  }
}
