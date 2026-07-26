/**
 * BELLA EOS PLATFORM CONTRACT: Cognitive Session Contract (ICognitiveSession v1.0)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME (ECH / ECR)
 * 
 * Contract 30: Persistent Enterprise Cognitive Session. Stores the complete cognitive lifecycle
 * (Intent, Top 0.1% Ranked Context, Evidence Citations, Reasoning Plan, LLM Response, Validation Report)
 * as permanent Enterprise Intellectual Property.
 */

import { IReasoningPlan } from './reasoning-plan';
import { IValidationReport } from './validation-report';
import { IEAHPackage } from './eah-package';

export type EnterpriseIntentType = 
  | 'STRATEGIC_PLANNING' 
  | 'ROOT_CAUSE_ANALYSIS' 
  | 'FINANCIAL_AUDIT' 
  | 'OPERATIONAL_REVIEW' 
  | 'WORKFORCE_DISPATCH';

export interface ICognitiveSession {
  sessionId: string;
  tenantId: string;
  userObjective: string;
  intent: EnterpriseIntentType;
  rankedContextItems: Array<{
    sourceId: string;
    sourceType: string;
    snippet: string;
    relevanceScore: number;
  }>;
  contradictionsDetected: string[];
  missingParameters: string[];
  evidenceCitations: Array<{
    citationId: string;
    documentTitle: string;
    evidenceReference: string;
  }>;
  reasoningPlan: IReasoningPlan;
  harnessPackage: IEAHPackage;
  rawLlmOutput?: string;
  validationReport?: IValidationReport;
  createdAt: string;
}
