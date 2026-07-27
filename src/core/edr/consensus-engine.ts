/**
 * BELLA EOS CORE: EDR Consensus Engine
 * Specification: v21.0 - Multi-Agent Coordination
 * 
 * Aggregates and evaluates multi-agent deliberation votes (Finance, Operations, Risk, 
 * Legal, Marketing, HR) to produce a unified board decision verdict.
 */

import { EnterpriseEventBus } from '@/infrastructure/event-bus';

export type DeliberationVerdict = 'APPROVE' | 'REJECT' | 'NEED_REVISION';

export interface AgentVote {
  agentName: string;
  verdict: DeliberationVerdict;
  confidence: number; // 0-100%
  reason: string;
}

export interface ConsensusReport {
  isConsensusReached: boolean;
  verdict: DeliberationVerdict;
  averageConfidence: number;
  totalVotesCount: number;
  approvesCount: number;
  rejectsCount: number;
  revisionRequestsCount: number;
  summary: string;
}

export class ConsensusEngine {
  /**
   * Aggregates votes from a list of board agents and computes a consensus decision.
   * If a supermajority (>= 66%) is required, approvals must meet the threshold.
   */
  public static evaluateDecision(
    objectiveId: string,
    votes: AgentVote[],
    options?: { requireSupermajority?: boolean }
  ): ConsensusReport {
    const total = votes.length;
    if (total === 0) {
      return {
        isConsensusReached: false,
        verdict: 'NEED_REVISION',
        averageConfidence: 0,
        totalVotesCount: 0,
        approvesCount: 0,
        rejectsCount: 0,
        revisionRequestsCount: 0,
        summary: 'Không có phiếu bầu từ hội đồng.'
      };
    }

    const approves = votes.filter(v => v.verdict === 'APPROVE');
    const rejects = votes.filter(v => v.verdict === 'REJECT');
    const revisions = votes.filter(v => v.verdict === 'NEED_REVISION');

    const totalConfidence = votes.reduce((sum, v) => sum + v.confidence, 0);
    const avgConfidence = Math.round(totalConfidence / total);

    const approveThreshold = options?.requireSupermajority ? 0.66 : 0.50;
    const approveRatio = approves.length / total;

    let finalVerdict: DeliberationVerdict = 'NEED_REVISION';
    let reached = false;
    let summaryText = '';

    if (approveRatio >= approveThreshold) {
      finalVerdict = 'APPROVE';
      reached = true;
      summaryText = `Đồng thuận THÔNG QUA đạt tỷ lệ ${Math.round(approveRatio * 100)}% (${approves.length}/${total} phiếu).`;
    } else if (rejects.length / total >= 0.50) {
      finalVerdict = 'REJECT';
      reached = true;
      summaryText = `Hội đồng PHỦ QUYẾT phương án với tỷ lệ ${Math.round((rejects.length / total) * 100)}% (${rejects.length}/${total} phiếu).`;
    } else {
      finalVerdict = 'NEED_REVISION';
      reached = false;
      summaryText = `Bất đồng ý kiến trong hội đồng. Yêu cầu LẬP LẠI PHƯƠNG ÁN (Need revision). Cần giải quyết ${revisions.length} yêu cầu chỉnh sửa.`;
    }

    const report: ConsensusReport = {
      isConsensusReached: reached,
      verdict: finalVerdict,
      averageConfidence: avgConfidence,
      totalVotesCount: total,
      approvesCount: approves.length,
      rejectsCount: rejects.length,
      revisionRequestsCount: revisions.length,
      summary: summaryText
    };

    // Emit event asynchronously on the system event bus
    EnterpriseEventBus.getInstance().publish({
      id: `ev-edr-${Date.now()}`,
      category: 'APPLICATION',
      type: 'EdrConsensusEvaluated',
      source: 'EDR_BOARD_DECISION',
      tenantId: 'system',
      timestamp: new Date().toISOString(),
      correlationId: `corr-${objectiveId}`,
      metadata: {},
      payload: {
        objectiveId,
        report
      }
    });

    return report;
  }
}
