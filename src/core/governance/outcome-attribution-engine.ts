import { OutcomeContract } from './outcome-contract';

export type AttributionType = 'DIRECT_CAUSATION' | 'PRIMARY_CONTRIBUTOR' | 'CORRELATION_ONLY' | 'UNATTRIBUTED';

export interface AttributionAnalysisResult {
  attributionConfidence: number; // 0 to 100%
  attributionType: AttributionType;
  displayWording: string;        // Precise UI wording for C-Suite Dashboard
  causalFactorScore: number;
  reasoning: string[];
}

export class OutcomeAttributionEngine {
  public static analyze(
    contract: OutcomeContract,
    executionSuccess: boolean,
    workflowCompletionRate: number,
    budgetVariancePercent: number
  ): AttributionAnalysisResult {
    const reasoning: string[] = [];

    if (!executionSuccess || workflowCompletionRate < 0.8) {
      reasoning.push('Workflow chưa hoàn thành tối thiểu 80% mốc milestone - Không thể ghi nhận tác động trực tiếp.');
      return {
        attributionConfidence: 15,
        attributionType: 'UNATTRIBUTED',
        displayWording: 'Unattributed',
        causalFactorScore: 0.15,
        reasoning
      };
    }

    let confidenceBase = 70;

    // 1. Completion Rate Contribution
    if (workflowCompletionRate === 1.0) {
      confidenceBase += 15;
      reasoning.push('100% các mốc milestone nhiệm vụ đã hoàn tất thành công.');
    } else {
      confidenceBase += Math.round(workflowCompletionRate * 10);
    }

    // 2. Budget Control Factor
    if (Math.abs(budgetVariancePercent) <= 5.0) {
      confidenceBase += 10;
      reasoning.push('Ngân sách thi hành tuân thủ hạn mức chính sách (Sai lệch <= 5%).');
    } else {
      confidenceBase -= 5;
      reasoning.push('Ngân sách thi hành vượt hạn mức chính sách.');
    }

    // 3. Target Achievement Impact
    if (contract.metrics?.isTargetAchieved) {
      confidenceBase += 5;
      reasoning.push(`Mục tiêu KPI (${contract.kpi.name}) đã đạt chỉ số thực tế (${contract.kpi.actual} ${contract.kpi.unit}).`);
    }

    const attributionConfidence = Math.min(98, Math.max(10, confidenceBase));

    let attributionType: AttributionType = 'PRIMARY_CONTRIBUTOR';
    let displayWording = 'Primary Contributor — policy-based';

    if (attributionConfidence >= 90) {
      attributionType = 'DIRECT_CAUSATION';
      displayWording = 'Direct Attribution — policy-based';
      reasoning.push('Phân bổ trực tiếp theo chính sách (Direct Attribution — policy-based).');
    } else if (attributionConfidence >= 75) {
      attributionType = 'PRIMARY_CONTRIBUTOR';
      displayWording = 'Primary Contributor — policy-based';
      reasoning.push('Bella EOS là nhân tố đóng góp chính theo chính sách (Primary Contributor — policy-based).');
    } else {
      attributionType = 'CORRELATION_ONLY';
      displayWording = 'Correlation Only';
      reasoning.push('Ghi nhận tương quan song song (Correlation Only).');
    }

    return {
      attributionConfidence,
      attributionType,
      displayWording,
      causalFactorScore: Number((attributionConfidence / 100).toFixed(2)),
      reasoning
    };
  }
}
