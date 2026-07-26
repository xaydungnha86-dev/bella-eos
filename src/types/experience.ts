/**
 * BELLA EOS PLATFORM CONTRACT: Experience Contract (IExperience v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME (ELR)
 * 
 * Contract 22: Closed-loop execution feedback experience mapping initial decision
 * & expected outcomes to actual operational results over time (e.g. 30 days).
 */

export interface IExperience {
  id: string;
  decision: {
    id: string;
    description: string;
    initiativeName: string;
    executiveId?: string;
  };
  action: {
    workflowId?: string;
    goalId?: string;
    description: string;
  };
  expected: {
    metric: string;
    value: number;
    timelineDays: number;
  };
  actual: {
    metric: string;
    value: number;
    measuredAt: string;
  };
  delta: {
    absoluteChange: number;
    percentageChange: number;
  };
  success: boolean;
  score: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  timestamp: string;
  metadata?: Record<string, any>;
}
