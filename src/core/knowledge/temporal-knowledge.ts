export interface ITemporalMetadata {
  validFrom: string;
  validTo: string;
  transactionTime: string;
  asOfDate: string;
}

export interface ITemporalEntityNode {
  id: string;
  label: string;
  name: string;
  properties: Record<string, any>;
  temporal: ITemporalMetadata;
}

export class TemporalKnowledgeManager {
  private static instance: TemporalKnowledgeManager;
  private nodes: ITemporalEntityNode[] = [];

  private constructor() {
    this.seedSampleData();
  }

  public static getInstance(): TemporalKnowledgeManager {
    if (!TemporalKnowledgeManager.instance) {
      TemporalKnowledgeManager.instance = new TemporalKnowledgeManager();
    }
    return TemporalKnowledgeManager.instance;
  }

  private seedSampleData(): void {
    // Seed an entity that changed VIP status over time
    this.nodes.push({
      id: 'cust-101',
      label: 'CUSTOMER',
      name: 'Nguyễn Văn A',
      properties: { tier: 'GOLD_VIP' },
      temporal: {
        validFrom: '2026-05-01T00:00:00Z',
        validTo: '2026-06-30T23:59:59Z',
        transactionTime: '2026-05-01T08:00:00Z',
        asOfDate: '2026-05-15T00:00:00Z'
      }
    });

    this.nodes.push({
      id: 'cust-101',
      label: 'CUSTOMER',
      name: 'Nguyễn Văn A',
      properties: { tier: 'PLATINUM_VIP' },
      temporal: {
        validFrom: '2026-07-01T00:00:00Z',
        validTo: '2099-12-31T23:59:59Z',
        transactionTime: '2026-07-01T09:00:00Z',
        asOfDate: '2026-07-15T00:00:00Z'
      }
    });
  }

  public registerTemporalNode(node: ITemporalEntityNode): void {
    this.nodes.push(node);
  }

  /**
   * Queries the state of an entity at a specific point in time (As-Of query)
   */
  public getEntityAsOf(entityId: string, asOfDate: string): ITemporalEntityNode | undefined {
    const queryTime = new Date(asOfDate).getTime();
    return this.nodes.find(n => {
      if (n.id !== entityId) return false;
      const validFromTime = new Date(n.temporal.validFrom).getTime();
      const validToTime = new Date(n.temporal.validTo).getTime();
      return queryTime >= validFromTime && queryTime <= validToTime;
    });
  }
}
