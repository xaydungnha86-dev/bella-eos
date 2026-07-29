import { DecisionEvaluationResult } from './decision-runtime';

export interface DecisionExplanation {
  decisionId: string;
  evidenceIds: string[];
  rationale: string;
  alternativesEvaluated: string[];
  counterfactualScenario: string;
}

export interface DetailedExplanation extends DecisionExplanation {
  confidenceScore: number;
  requiresApproval: boolean;
  approvalRoleRequired: string;
  generatedAt: string;
}

export class ExplainabilityRuntime {
  private static instance: ExplainabilityRuntime;

  private constructor() {}

  public static getInstance(): ExplainabilityRuntime {
    if (!ExplainabilityRuntime.instance) {
      ExplainabilityRuntime.instance = new ExplainabilityRuntime();
    }
    return ExplainabilityRuntime.instance;
  }

  public explain(params: {
    decisionId: string;
    objective: string;
    evidenceIds: string[];
    hasStats: boolean;
  }): DecisionExplanation {
    const isExtreme = params.objective.toLowerCase().includes('300%') || params.objective.toLowerCase().includes('gấp 3');
    
    let rationale = '';
    let counterfactual = '';
    
    if (isExtreme) {
      rationale = 'Bác bỏ mục tiêu 300% do nghẽn giới hạn công suất của kỹ thuật viên Spa (KTV) và thiếu hụt nguồn tuyển dụng tức thời.';
      counterfactual = 'Nếu cố chấp giải ngân 200M Ads mà không nâng cao tay nghề/số lượng KTV, tỷ lệ chuyển đổi sẽ sụt giảm nghiêm trọng và chi phí CAC sẽ vượt ngưỡng 300,000 VND.';
    } else {
      rationale = 'Tập trung Retention & referral để tối ưu dòng tiền khách hàng cũ trước khi đổ thêm Ads.';
      counterfactual = 'Nếu đổ tiền vào thu hút khách mới ngay lập tức, chi phí CAC tăng cao trong khi tỷ lệ chốt sales chưa cải thiện dẫn đến ROI tổng thể tụt xuống < 1.5.';
    }

    return {
      decisionId: params.decisionId,
      evidenceIds: params.evidenceIds,
      rationale,
      alternativesEvaluated: ['Scale Ads ngân sách lớn ngay lập tức', 'Spam email hàng loạt'],
      counterfactualScenario: counterfactual
    };
  }

  public explainEvaluation(
    evaluation: DecisionEvaluationResult,
    objective: string,
    evidenceIds: string[]
  ): DetailedExplanation {
    const baseExplanation = this.explain({
      decisionId: evaluation.decisionId,
      objective,
      evidenceIds,
      hasStats: true
    });

    return {
      ...baseExplanation,
      confidenceScore: evaluation.confidenceScore,
      requiresApproval: evaluation.requiresApproval,
      approvalRoleRequired: evaluation.approvalRoleRequired,
      generatedAt: new Date().toISOString()
    };
  }
}

