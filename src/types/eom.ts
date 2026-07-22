export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  segment?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'on_leave' | 'terminated';
  email: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  amountVnd: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  budgetVnd: number;
  targetMetricType: 'targetFollowers' | 'targetRevenueVnd' | 'targetLeads' | 'targetStaffCount';
  targetValue: number;
  voiceTone: string;
  segment: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'REVISE';
  agent: string;
  requiredCapabilityIds?: string[];
  assignedWorkerId?: string;
  score?: number;
  content?: string;
}

export interface Process {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'completed';
  steps: Task[];
}

export interface Document {
  id: string;
  fileName: string;
  fileSize: string;
  classification: string;
  content: string;
  dnaTone?: string;
  uploadedAt: string;
}

export interface Decision {
  id: string;
  taskId: string;
  action: 'APPROVED' | 'REVISE' | 'REJECTED';
  rationale: string;
  score: number;
  timestamp: string;
}

export interface Evidence {
  id: string;
  taskId: string;
  score: number;
  facts: string;
  assessedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
  sizeBytes: number;
}

export interface Policy {
  id: string;
  name: string;
  ruleType: string;
  constraintValue: any;
  status: 'active' | 'disabled';
}

export interface Capability {
  id: string;
  name: string;
  version: string;
  category: string;
  tags: string[];
}

export interface Worker {
  id: string;
  name: string;
  type: 'AI' | 'HUMAN';
  capabilities: { [capabilityId: string]: { level: number; latencyMs: number } };
  status: 'idle' | 'busy' | 'offline';
}

// Canonical Context Package structure sent to AI Workers
export interface CanonicalContextPackage {
  objective: string;
  activeStep: {
    id: number;
    name: string;
    agent: string;
  };
  erp: {
    approvedBudgetVnd: number;
    targetValue: number;
    targetMetric: string;
  };
  brandDna: {
    brandName?: string;
    voiceTone: string;
    designStyle: string;
    targetSegment?: string;
  };
  policies: Array<{ id: string; rule: string }>;
  learningEvidence: Array<{ task: string; tip: string }>;
  timestamp: string;
}
