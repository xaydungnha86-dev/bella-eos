/**
 * Executive Intelligence Runtime (EIR) - Core Types
 * ADR-0010 v2.0 - Strategic Reasoning Architecture
 */

export interface ClarifiedGoal {
  what: string;           // "Increase spa revenue"
  howMuch: string;        // "30% = 1.5B VND"
  by: string;             // "Next month (4 weeks)"
  baseline: number;       // 5B
  target: number;         // 6.5B
  constraints: string[];  // ["Budget 150M", "No hiring"]
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface Cause {
  level: number;          // 5 Whys depth (1-5)
  cause: string;
  evidence: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: number;         // Revenue impact
}

export interface DiagnosisGraph {
  currentState: string;
  symptoms: string[];
  rootCauses: {
    symptom: string;
    causes: Cause[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    impact: number;
  }[];
  opportunities: {
    name: string;
    potential: number;
  }[];
}

export interface Constraint {
  type: string;
  limit: string;
  current: string;
  status: 'blocking' | 'limiting' | 'acceptable';
  mitigation?: string;
}

export interface ConstraintGraph {
  budget: Constraint;
  workforce: Constraint;
  timeline: Constraint;
  technology: Constraint;
  policy: Constraint;
  market: Constraint;
}

export interface Possibility {
  id: string;
  name: string;
  potential: number;      // Revenue impact
  feasibility: number;    // 0-100%
  roi: number;
  category: 'acquisition' | 'retention' | 'monetization' | 'efficiency';
}

export interface OpportunityGraph {
  possibilities: Possibility[];
  prioritization: {
    highImpactHighFeasibility: string[];
    highImpactLowFeasibility: string[];
    lowImpactHighFeasibility: string[];
    lowImpactLowFeasibility: string[];
  };
  selectedTop5: Possibility[];
}

export interface Strategy {
  name: string;
  initiatives: string[];
  expectedRevenue: number;
  budget: number;
  risk: 'low' | 'medium' | 'high';
  tradeoffs: string[];
}

export interface Tradeoff {
  option: string;
  pros: string[];
  cons: string[];
  score: number;
}

export interface LogicChain {
  premises: string[];
  conclusion: string;
}

export interface StrategyGraph {
  alternatives: Strategy[];
  tradeoffs: Tradeoff[];
  reasoning: LogicChain;
  selectedStrategy: Strategy;
}

export interface Scenario {
  name: 'optimistic' | 'realistic' | 'pessimistic';
  probability: number;
  revenue: number;
  assumptions: string[];
}

export interface SimulationGraph {
  strategy: Strategy;
  scenarios: Scenario[];
  expectedValue: number;
  probabilitySuccess: number;
  convergence: boolean;   // Pass/Fail
  failureReason?: string;
  rawValue?: number;
  riskAdjustedValue?: number;
}

export interface Risk {
  risk: string;
  probability: number;
  impact: string;
  mitigation: string;
  residualRisk: 'low' | 'medium' | 'high';
}

export interface RiskGraph {
  risks: Risk[];
  overallRiskLevel: 'low' | 'medium' | 'high';
  acceptability: boolean;
}

export interface Assumption {
  assumption: string;
  confidence: number;
  evidence: string[];
}

export interface GraphTrace {
  nodes: {
    name: string;
    executedAt: string;
    duration: number;
    output: any;
  }[];
  iterations: number;
  convergenceAchieved: boolean;
}

export interface ExecutiveRecommendation {
  // Strategic Goal
  goal: ClarifiedGoal;
  
  // Strategic Diagnosis
  diagnosis: DiagnosisGraph;
  
  // Strategic Constraints
  constraints: ConstraintGraph;
  
  // Strategic Assumptions
  assumptions: Assumption[];
  
  // Strategic Alternatives
  alternatives: Strategy[];
  
  // Chosen Strategy
  chosenStrategy: Strategy;
  
  // Simulation Summary
  simulationSummary: SimulationGraph;
  
  // Confidence & Risk
  confidence: number;
  expectedOutcome: string;
  majorRisks: Risk[];
  
  // Success Criteria (Strategic Level)
  successCriteria: {
    primary: string;
    secondary: string[];
  };
  
  // Meta
  generatedAt: string;
  reasoningTrace: GraphTrace;
}
