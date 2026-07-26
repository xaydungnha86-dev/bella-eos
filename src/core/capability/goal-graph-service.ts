/**
 * BELLA EOS CAPABILITY PLATFORM: Enterprise Goal Graph Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Corporate Hierarchy Trace Engine. Models the full organizational lineage
 * from Vision to Outcome so that any AI action can be traced to its parent strategic goal.
 *
 * Hierarchy: Vision -> Objective -> Key Result -> Initiative -> Project -> Workflow -> Task -> AI Employee -> Outcome
 */

export type GoalNodeType = 'VISION' | 'OBJECTIVE' | 'KEY_RESULT' | 'INITIATIVE' | 'PROJECT' | 'WORKFLOW' | 'TASK' | 'AI_EMPLOYEE' | 'OUTCOME';

export interface GoalNode {
  nodeId: string;
  type: GoalNodeType;
  label: string;
  parentNodeId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED';
  ownerRole?: string;
}

export class GoalGraphService {
  private static instance: GoalGraphService;
  private graph: Map<string, GoalNode> = new Map();

  private constructor() {
    this.seedDemoGraph();
  }

  public static getInstance(): GoalGraphService {
    if (!GoalGraphService.instance) {
      GoalGraphService.instance = new GoalGraphService();
    }
    return GoalGraphService.instance;
  }

  private seedDemoGraph(): void {
    const nodes: GoalNode[] = [
      { nodeId: 'vision-01',      type: 'VISION',      label: 'Become the most trusted premium spa chain in Southeast Asia by 2030.',                               status: 'ACTIVE' },
      { nodeId: 'obj-01',         type: 'OBJECTIVE',   label: 'Expand to 3 new cities by end of 2026.',                                           parentNodeId: 'vision-01',   status: 'ACTIVE', ownerRole: 'COO' },
      { nodeId: 'kr-01',          type: 'KEY_RESULT',  label: 'Open Da Nang branch by Q3 2026.',                                                  parentNodeId: 'obj-01',      status: 'ACTIVE' },
      { nodeId: 'init-01',        type: 'INITIATIVE',  label: 'Da Nang Location Search, Legal Setup, and Staff Recruitment.',                      parentNodeId: 'kr-01',       status: 'ACTIVE', ownerRole: 'Operations Manager' },
      { nodeId: 'project-01',     type: 'PROJECT',     label: 'Da Nang Spa Branch Launch Project.',                                               parentNodeId: 'init-01',     status: 'ACTIVE' },
      { nodeId: 'workflow-01',    type: 'WORKFLOW',    label: 'Recruitment Workflow: Source, Screen, Hire, Train 12 Therapists.',                  parentNodeId: 'project-01',  status: 'ACTIVE' },
      { nodeId: 'task-01',        type: 'TASK',        label: 'Post job listings on LinkedIn and local job boards.',                              parentNodeId: 'workflow-01', status: 'ACTIVE' },
      { nodeId: 'employee-01',    type: 'AI_EMPLOYEE', label: 'AI Recruiter Worker: Automated CV screening and shortlisting.',                    parentNodeId: 'task-01',     status: 'ACTIVE' },
      { nodeId: 'outcome-01',     type: 'OUTCOME',     label: '12 therapists trained and certified with Bella SOP by September 2026.',            parentNodeId: 'employee-01', status: 'ACTIVE' },
    ];
    nodes.forEach(n => this.graph.set(n.nodeId, n));
  }

  public getNode(nodeId: string): GoalNode | undefined {
    return this.graph.get(nodeId);
  }

  public traceToVision(nodeId: string): GoalNode[] {
    const chain: GoalNode[] = [];
    let current = this.graph.get(nodeId);
    while (current) {
      chain.unshift(current);
      current = current.parentNodeId ? this.graph.get(current.parentNodeId) : undefined;
    }
    return chain;
  }

  public getChildrenOf(parentNodeId: string): GoalNode[] {
    return Array.from(this.graph.values()).filter(n => n.parentNodeId === parentNodeId);
  }

  public getTotalNodeCount(): number {
    return this.graph.size;
  }
}
