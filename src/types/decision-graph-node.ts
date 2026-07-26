/**
 * BELLA EOS PLATFORM CONTRACT: Decision Graph Node Contract (IDecisionGraphNode v1.0)
 * Specification: v18.6 BELLA EOS ENTERPRISE DELIBERATION RUNTIME (EDR)
 * 
 * Contract 34: 20-Year Enterprise Decision Graph Node. Captures executive decision lineage
 * (Decision ➔ Evidence ➔ Deliberation ➔ Execution ➔ Outcome ➔ Lessons) as permanent Enterprise IP.
 */

export interface IDecisionGraphNode {
  decisionId: string;
  tenantId: string;
  decisionTitle: string;
  evidenceRefs: string[];
  deliberationSessionId: string;
  executionTaskId?: string;
  outcomeDelta: {
    predictionAccuracy: number;
    actualRoi: number;
  };
  lessonsLearnedRefs: string[];
  createdAt: string;
}
