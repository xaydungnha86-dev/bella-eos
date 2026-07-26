/**
 * BELLA EOS EIER / EER: SOP Evolution Runtime (Runtime 13)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Mission: Autonomous SOP Evolution & Skill Packaging Engine. Monitors human operations.
 * When it detects that humans perform an action sequence identically (e.g. 98 out of 100 times),
 * it auto-generates a proposal to package the workflow into automated SOP Skill Packs, Workflow Packs,
 * and Learning DNA Packs for CEO approval.
 */

import { ApprovalRuntime } from '../human/approval-runtime';

export interface HumanOperationObserved {
  operationName: string;
  department: string;
  actionSequence: string[];
  totalObservationsCount: number;
  identicalCount: number;
}

export interface SOPEvolutionProposal {
  proposalId: string;
  operationName: string;
  identicalRatio: number; // e.g. 0.98 (98%)
  proposedSkillPackName: string;
  proposedWorkflowPackName: string;
  approvalRequestId: string;
  status: 'PENDING_CEO_APPROVAL' | 'APPROVED_AND_PACKAGED' | 'REJECTED';
  createdAt: string;
}

export class SOPEvolutionRuntime {
  private static instance: SOPEvolutionRuntime;
  private proposals: Map<string, SOPEvolutionProposal> = new Map();

  private constructor() {}

  public static getInstance(): SOPEvolutionRuntime {
    if (!SOPEvolutionRuntime.instance) {
      SOPEvolutionRuntime.instance = new SOPEvolutionRuntime();
    }
    return SOPEvolutionRuntime.instance;
  }

  public async observeAndEvolve(obs: HumanOperationObserved): Promise<SOPEvolutionProposal | null> {
    const ratio = obs.totalObservationsCount > 0 ? obs.identicalCount / obs.totalObservationsCount : 0;
    
    // Threshold: 90% identical consistency across at least 10 observations
    if (ratio >= 0.90 && obs.totalObservationsCount >= 10) {
      const propId = `sop-prop-${Date.now()}`;
      
      // Route proposal to CEO Approval Engine
      const approvalReq = await ApprovalRuntime.getInstance().requestApproval({
        tenantId: 'default-tenant',
        title: `SOP Evolution Proposal: Auto-package [${obs.operationName}] into AI Skill Pack`,
        description: `Human workforce performed [${obs.operationName}] identically ${obs.identicalCount}/${obs.totalObservationsCount} times (${(ratio * 100).toFixed(0)}% consistency). Propose packaging into automated AI SOP Skill Pack & Workflow Pack.`,
        proposedAction: `Generate AI Skill Pack & Workflow Pack for ${obs.operationName}`,
        aiConfidenceScore: Math.round(ratio * 100) / 100,
        riskLevel: 'LOW',
        payload: { operationName: obs.operationName, actionSequence: obs.actionSequence, ratio },
        requiredRole: 'EXECUTIVE_CEO',
      });

      const proposal: SOPEvolutionProposal = {
        proposalId: propId,
        operationName: obs.operationName,
        identicalRatio: ratio,
        proposedSkillPackName: `SkillPack_${obs.operationName.replace(/\s+/g, '')}_v1`,
        proposedWorkflowPackName: `WorkflowPack_${obs.operationName.replace(/\s+/g, '')}_v1`,
        approvalRequestId: approvalReq.requestId,
        status: 'PENDING_CEO_APPROVAL',
        createdAt: new Date().toISOString(),
      };

      this.proposals.set(propId, proposal);
      return proposal;
    }

    return null;
  }

  public listProposals(): SOPEvolutionProposal[] {
    return Array.from(this.proposals.values());
  }
}
