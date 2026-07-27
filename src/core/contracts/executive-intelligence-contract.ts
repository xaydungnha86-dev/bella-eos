export type EicType = 'DECISION' | 'ANALYSIS' | 'PLANNING' | 'FORECAST' | 'INVESTIGATION';

export type EicStatus = 
  | 'CREATED' 
  | 'UNDER_REVIEW' 
  | 'BOARD_REVIEW' 
  | 'APPROVED' 
  | 'PLANNED' 
  | 'DISPATCHED' 
  | 'EXECUTING' 
  | 'MONITORING' 
  | 'REPLANNING' 
  | 'COMPLETED' 
  | 'ARCHIVED';

export interface EicMetadata {
  contractId: string;                   // Định danh giao kèo EIC
  version: number;                      // Versioning: 1, 2, 3...
  parentContractId?: string;            // Quyết định cha (Decision Lineage)
  childContractIds?: string[];          // Quyết định con (Decision Lineage)
  agentId: string;                      // Agent ra quyết định (Ví dụ: eos_cmo_agent)
  role: string;                         // Chức danh (Ví dụ: Chief Marketing Officer)
  timestamp: string;
  status: EicStatus;
  type: EicType;
}

export interface ReasoningNode {
  id: string;                           // Ví dụ: "GOAL", "CRM_LEAK", "ROOT_CAUSE"
  type: 'GOAL' | 'METRIC' | 'LEAKAGE' | 'ROOT_CAUSE' | 'DECISION';
  dependsOn: string[];                  // Quan hệ phụ thuộc đồ thị DAG
  evidence: string[];                   // Evidence IDs (Ví dụ: ["CRM-29382"])
  confidence: number;                   // Độ tự tin trên từng Node đơn lẻ (0-100)
  description: string;
  outcome: string;
}

export interface EicReasoningGraph {
  nodes: ReasoningNode[];               // Đồ thị DAG suy luận giải thích "Tại sao" ra quyết định
}

export interface EicDecisionDetails {
  approvedStrategy: string;
  rejectedStrategies: Array<{
    strategy: string;
    reason: string;
    risk: string;
  }>;
  assumptions: string[];
}

export interface ExpectedOutcome {
  metric: string;
  targetValue: string | number;
  weight: number;                       // Trọng số KPI (0-1)
}

export interface EicPlanningSection {
  spendLimitVnd: number;
  delegations: Array<{
    department: string;
    role: string;
    task: string;
  }>;
  dependencies: Array<{
    task: string;
    blocking: string;
  }>;
  replanningTriggers: Array<{
    metric: string;
    condition: '<' | '>' | '==' | 'drop';
    value: number | string;
  }>;
  rollbackStrategy: {
    triggers: string[];
    actions: string[];
  };
}

// Task Execution Contract (TEC) - Giao thức giao việc cho cấp dưới
export interface TaskExecutionContract {
  taskId: string;
  parentContractId: string;             // Liên kết ngược về EIC
  assignedTo: string;                   // AI Worker hoặc Human ID
  taskType: string;
  description: string;
  kpi: string;
  riskOwner: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
}

export interface ExecutiveIntelligenceContract {
  metadata: EicMetadata;
  strategicIntent: {
    businessObjective: string;
    strategicAlignment: string;
    targetAudience: string;
  };
  businessDiagnosis: {
    swot: {
      strengths: string;
      weaknesses: string;
      opportunities: string;
      threats: string;
    };
    currentBottleneck: string;
  };
  reasoningGraph: EicReasoningGraph;
  decision: EicDecisionDetails;
  expectedOutcomes: ExpectedOutcome[];
  planning: EicPlanningSection;
  execution: {
    businessImpactForecast: {
      revenueGrowth: string;
      cashflowImprovement: string;
      hrLoadIncrease: string;
      overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    };
    taskPipeline: TaskExecutionContract[];
  };
}
