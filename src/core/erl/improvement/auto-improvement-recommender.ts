/**
 * BELLA EOS ERL: Auto Improvement Recommender
 * Specification: ERL Improvement Engine
 * 
 * Mission: Auto-formulate optimization parameter fixes when reliability drop alerts fire.
 */

import { IRemediationProposal } from '@/types/erl';

export class AutoImprovementRecommender {
  private static instance: AutoImprovementRecommender;

  private constructor() {}

  public static getInstance(): AutoImprovementRecommender {
    if (!AutoImprovementRecommender.instance) {
      AutoImprovementRecommender.instance = new AutoImprovementRecommender();
    }
    return AutoImprovementRecommender.instance;
  }

  public evaluateRemediation(metricName: string, actualScore: number): IRemediationProposal | null {
    if (metricName === 'RETRIEVER_RECALL' && actualScore < 0.90) {
      return {
        proposalId: `prop-rem-rag-${Date.now()}`,
        targetMetric: 'RETRIEVER_RECALL',
        issueDetected: `Retriever Recall is ${actualScore * 100}% which is below the 90% threshold.`,
        suggestedAction: 'Tăng kích thước chunk và bổ sung TopK để mở rộng khả năng phủ thông tin.',
        suggestedChunkSize: 800,
        suggestedOverlap: 120,
        suggestedTopK: 8,
        applied: false
      };
    }

    if (metricName === 'CITATION_RATE' && actualScore < 0.70) {
      return {
        proposalId: `prop-rem-cit-${Date.now()}`,
        targetMetric: 'CITATION_RATE',
        issueDetected: `Citation Rate is ${actualScore * 100}% which is below the 70% threshold.`,
        suggestedAction: 'Tăng tham số TopK trong Retriever và bổ sung chỉ dẫn định dạng trích dẫn cụ thể.',
        suggestedTopK: 8,
        suggestedPromptConstraint: 'MANDATORY RULE: Trích dẫn chính xác tiêu đề tài liệu nguồn.',
        applied: false
      };
    }

    return null;
  }
}
