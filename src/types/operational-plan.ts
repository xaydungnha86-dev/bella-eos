/**
 * Planning Runtime (PLR) - Core Types
 * ADR-0011 - Operational Planning Architecture
 */

import { ExecutiveRecommendation } from './executive-recommendation';

export interface KPINode {
  metric: string;
  target: number | string;
  baseline?: number | string;
  formula?: string;
  industryBenchmark?: string;
  breakdownKPIs?: KPINode[];
}

export interface InitiativeKPI {
  name: string;
  target: number;
  kpis: KPINode[];
}

export interface CheckPoint {
  metric: string;
  threshold: number;
  action: string;
}

export interface KPITree {
  primary: {
    metric: string;
    target: number;
    baseline: number;
  };
  byInitiative: InitiativeKPI[];
  leadingIndicators: {
    week: number;
    checkpoints: CheckPoint[];
  }[];
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
  rationale: string;
  vendor?: string;
}

export interface InitiativeBudget {
  name: string;
  total: number;
  breakdown: BudgetBreakdown[];
}

export interface WeeklyBudget {
  week: number;
  planned: number;
  cumulative: number;
}

export interface Contingency {
  amount: number;
  triggers: string[];
}

export interface BudgetPlan {
  total: number;
  buffer: number;
  byInitiative: InitiativeBudget[];
  byWeek: WeeklyBudget[];
  contingency: Contingency;
}

export interface Milestone {
  date: string;
  milestone: string;
  owner: string;
  status: 'pending' | 'in_progress' | 'done';
}

export interface Phase {
  name: string;
  weeks: string;
  objectives: string[];
  milestones: Milestone[];
}

export interface Dependency {
  task: string;
  dependsOn: string[];
  blocking: string[];
}

export interface TimelinePlan {
  duration: string;
  phases: Phase[];
  dependencies: Dependency[];
  criticalPath: string[];
}

export interface RoleAssignment {
  role: string;
  ftePct: string;
  people: string[];
  tasks: string[];
}

export interface InitiativeResource {
  name: string;
  capacity: string;
  roles: RoleAssignment[];
}

export interface ResourceConflict {
  resource: string;
  conflict: string;
  resolution: string;
}

export interface WorkforcePlan {
  total: string;
  byInitiative: InitiativeResource[];
  conflicts: ResourceConflict[];
}

export interface Asset {
  type: string;
  quantity: number;
  owner: string;
  status: string;
}

export interface ResourcePlan {
  workforce: WorkforcePlan;
  assets: Asset[];
}

export interface KPIOwnership {
  kpi: string;
  target: string;
  owner: string;
  contributors: string[];
  reportingCadence: string;
}

export interface EscalationPath {
  kpi: string;
  threshold: string;
  escalateTo: string;
}

export interface OwnershipMap {
  byKPI: KPIOwnership[];
  escalationPath: EscalationPath[];
}

export interface OperationalPlan {
  // From KPI Decomposition
  kpiTree: KPITree;
  
  // From Budget Allocation
  budgetPlan: BudgetPlan;
  
  // From Timeline Planning
  timelinePlan: TimelinePlan;
  
  // From Resource Allocation
  resourcePlan: ResourcePlan;
  
  // From Owner Assignment
  ownershipMap: OwnershipMap;
  
  // Meta
  generatedFrom: ExecutiveRecommendation;
  generatedAt: string;
  approvedBy: string | null;
}
