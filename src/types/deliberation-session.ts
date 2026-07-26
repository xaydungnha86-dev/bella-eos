/**
 * BELLA EOS PLATFORM CONTRACT: Deliberation Session Contract (IDeliberationSession v1.0)
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME (EDR)
 * 
 * Contract 33: Multi-Agent Executive Deliberation Session Record.
 * Captures task decomposition across experts (Finance, Marketing, HR, Ops, Legal), cross-agent debate,
 * consensus scoring, trade-off matrix, alternative options, 12-month simulation, and CEO Executive Brief.
 */

export type ExpertRole = 
  | 'FINANCE' 
  | 'MARKETING' 
  | 'HUMAN_RESOURCES' 
  | 'OPERATIONS' 
  | 'LEGAL' 
  | 'MARKET_ANALYST' 
  | 'RISK_ANALYST' 
  | 'CX_ANALYST' 
  | 'IT_SECURITY' 
  | 'SUPPLY_CHAIN' 
  | 'DATA_ANALYST' 
  | 'COMPLIANCE' 
  | 'ESG' 
  | 'MANUFACTURING' 
  | 'MEDICAL';

export interface ExpertOpinion {
  expertRole: ExpertRole;
  recommendation: 'APPROVE' | 'REJECT' | 'CONDITIONAL_APPROVAL';
  rationale: string;
  keyMetric: string;
  confidenceScore: number;
}

export interface TradeOffItem {
  dimension: string;
  proEffect: string;
  conRisk: string;
  impactWeight: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AlternativeOption {
  optionId: string;
  optionTitle: string;
  description: string;
  estimatedRoiPercentage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IDeliberationSession {
  sessionId: string;
  tenantId: string;
  userObjective: string;
  taskDecomposition: string[];
  selectedExperts: string[];
  expertOpinions: ExpertOpinion[];
  debateTranscript: string[];
  consensusScore: number; // 0-100%
  requiresCeoReview: boolean;
  tradeOffMatrix: TradeOffItem[];
  alternativeOptions: AlternativeOption[];
  simulatedOutcome: {
    twelveMonthRevenueProjectionVnd: number;
    projectedCashflowDeltaVnd: number;
    workloadCapacityImpact: string;
    projectedRoiPercentage: number;
  };
  executiveBrief: {
    prosSummary: string[];
    consSummary: string[];
    criticalRisks: string[];
    finalRecommendation: string;
    evidenceCitationsCount: number;
  };
  createdAt: string;
}
