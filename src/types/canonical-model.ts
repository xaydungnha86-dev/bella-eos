export interface Goal {
  id: string;
  parentId?: string;
  title: string;
  description: string;
  metric: {
    name: string;
    unit: string;
    baseline: number;
    target: number;
    current: number;
  };
  timeline: {
    start: string;
    deadline: string;
  };
  constraints: {
    type: 'budget' | 'workforce' | 'policy' | 'market';
    description: string;
    value: any;
    status: 'monitoring' | 'warning' | 'blocking';
  }[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'active' | 'achieved' | 'failed';
}

export interface GoalGraph {
  nodes: Goal[];
  edges: {
    from: string;
    to: string;
    type: 'requires' | 'influences' | 'conflicts';
  }[];
}

export interface EnterpriseState {
  business: {
    currentRevenue: number;
    customerCount: number;
    conversionRate: number;
    churnRate: number;
    customMetrics: Record<string, number>;
  };
  runtime: {
    activeWorkflows: number;
    systemLoad: number;
    activeAgents: number;
    failedTaskRate: number;
  };
  resource: {
    tokenSpendToday: number;
    apiBudgetRemaining: number;
    activeLicenses: Record<string, number>;
  };
  human: {
    activeFTEs: number;
    allocatedFTEs: number;
    departmentalCapacity: Record<string, number>;
  };
  timestamp: string;
}

export interface Task {
  id: string;
  workflowId: string;
  title: string;
  description: string;
  status: 'backlog' | 'ready' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  assignedTo: {
    type: 'agent' | 'human' | 'system';
    id: string;
  };
  dependencies: string[];
  inputs: {
    name: string;
    schemaType: string;
    value: any;
  }[];
  outputs: {
    name: string;
    schemaType: string;
    value: any;
  }[];
  metrics?: {
    startedAt: string;
    completedAt: string;
    costIncurred: number;
    retryCount: number;
  };
}

export interface Decision {
  decisionId: string;
  timestamp: string;
  authorizer: string;
  sessionRef: {
    sessionId: string;
    traceId: string;
  };
  originalGoal: Goal;
  agreedGoal: Goal;
  alternatives: {
    target: number;
    probabilitySuccess: number;
    budget: number;
    primaryRisk: string;
  }[];
  debateTrace: {
    agent: string;
    action: 'debate' | 'propose' | 'modify' | 'approve';
    message: string;
    timestamp: string;
  }[];
  evidenceCollected: {
    category: string;
    metric: string;
    delta: string;
    description: string;
  }[];
  finalApproval: {
    status: 'approved' | 'rejected';
    approvedBy: string;
    comments: string;
    timestamp: string;
  };
}
