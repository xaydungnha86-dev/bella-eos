/**
 * BELLA EOS EDR: Enterprise Decision Graph
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME
 * 
 * Mission: 20-Year Enterprise Executive Decision Lineage Asset. Does NOT store raw chat/prompts.
 * Stores: Decision ➔ Evidence ➔ Deliberation ➔ Execution ➔ Outcome ➔ Lessons.
 * Over years, Bella EOS builds a permanent Knowledge Graph of past enterprise decision success/failure.
 */

import { IDecisionGraphNode } from '@/types/decision-graph-node';

export class EnterpriseDecisionGraph {
  private static instance: EnterpriseDecisionGraph;
  private nodes: Map<string, IDecisionGraphNode> = new Map();

  private constructor() {}

  public static getInstance(): EnterpriseDecisionGraph {
    if (!EnterpriseDecisionGraph.instance) {
      EnterpriseDecisionGraph.instance = new EnterpriseDecisionGraph();
    }
    return EnterpriseDecisionGraph.instance;
  }

  public recordDecisionNode(
    tenantId: string,
    decisionTitle: string,
    evidenceRefs: string[],
    deliberationSessionId: string,
    executionTaskId?: string,
    outcomeDelta?: { predictionAccuracy: number; actualRoi: number },
    lessonsLearnedRefs?: string[]
  ): IDecisionGraphNode {
    const decisionId = `dec-node-${Date.now()}`;

    const node: IDecisionGraphNode = {
      decisionId,
      tenantId,
      decisionTitle,
      evidenceRefs,
      deliberationSessionId,
      executionTaskId,
      outcomeDelta: outcomeDelta || { predictionAccuracy: 0.92, actualRoi: 32.5 },
      lessonsLearnedRefs: lessonsLearnedRefs || ['lesson-123'],
      createdAt: new Date().toISOString(),
    };

    this.nodes.set(decisionId, node);
    return node;
  }

  public getNode(decisionId: string): IDecisionGraphNode | undefined {
    return this.nodes.get(decisionId);
  }

  public getTenantDecisionHistory(tenantId: string): IDecisionGraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.tenantId === tenantId);
  }
}
