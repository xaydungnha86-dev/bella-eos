import { ClarifiedGoal, ExecutiveRecommendation } from './executive-recommendation';
import { BusinessHealthReport } from './business-health';

export interface ExecutiveContext {
  currentRevenue: number;
  cashRunway: number;
  seasonalityMultiplier: number;
  competitorVolume: 'low' | 'medium' | 'high';
  activeCampaignsCount: number;
  workforceCapacity: number;
  riskAppetite: 'conservative' | 'balanced' | 'aggressive';
  status: 'grounded' | 'degraded';
}

export interface DecisionTraceStep {
  agent: string;
  action: 'propose' | 'debate' | 'reject' | 'approve' | 'modify';
  message: string;
  timestamp: string;
  proposalDetails?: {
    target: number;
    probabilitySuccess: number;
    recommendedBudget: number;
  };
}

export interface DecisionTrace {
  sessionId: string;
  steps: DecisionTraceStep[];
}

export interface ExecutiveSession {
  sessionId: string;
  intent: string;
  context: ExecutiveContext | null;
  healthReport: BusinessHealthReport | null;
  frontier: any[] | null; // FrontierDecisionPoint[]
  negotiationLog: string[];
  decisionTrace: DecisionTrace | null;
  approvalState: {
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    comments?: string;
    modifications?: any[];
  };
  agreedGoal: ClarifiedGoal | null;
  reasoningOutput: ExecutiveRecommendation | null;
}
