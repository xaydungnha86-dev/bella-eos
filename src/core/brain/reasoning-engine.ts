import { EnterpriseContextContract } from '../contracts/enterprise-context-contract';
import { ReasoningNode } from '../contracts/executive-intelligence-contract';

export interface SharedReasoningGraph {
  graphId: string;
  timestamp: string;
  contextId: string;                    // ECC Context Reference
  nodes: ReasoningNode[];               // Đồ thị DAG logic độc lập
}

export class EnterpriseReasoningEngine {
  private static instance: EnterpriseReasoningEngine;

  private constructor() {}

  public static getInstance(): EnterpriseReasoningEngine {
    if (!EnterpriseReasoningEngine.instance) {
      EnterpriseReasoningEngine.instance = new EnterpriseReasoningEngine();
    }
    return EnterpriseReasoningEngine.instance;
  }

  /**
   * Compiles objective into a DAG of reasoning nodes before passing it to AI Executives
   */
  public generateReasoningGraph(ecc: EnterpriseContextContract): SharedReasoningGraph {
    const graphId = `SRG-DAG-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const hasStats = ecc.coverage.crmActiveCount > 0 && ecc.coverage.fbReach24h > 0;
    const isExtremeGoal = ecc.objective.toLowerCase().includes('300%') || ecc.objective.toLowerCase().includes('gấp 3');

    // 1. Calculate step confidence based on input quality/coverage
    const diagnosisConfidence = hasStats ? 94 : 25;
    const leakageConfidence = hasStats ? 90 : 35;
    const decisionConfidence = hasStats ? 95 : 45;

    // 2. Formulate Node Graph with dependencies (dependsOn list forms the DAG)
    const nodes: ReasoningNode[] = [
      {
        id: 'GOAL',
        type: 'GOAL',
        dependsOn: [],
        evidence: [],
        confidence: 100,
        description: 'Mục tiêu kinh doanh được đặt bởi CEO',
        outcome: ecc.objective
      },
      {
        id: 'DIAGNOSIS',
        type: 'METRIC',
        dependsOn: ['GOAL'],
        evidence: ecc.evidenceIds,
        confidence: diagnosisConfidence,
        description: 'Đánh giá bối cảnh và số liệu kinh doanh hiện tại',
        outcome: hasStats 
          ? `Số liệu thực tế hoạt động: ${ecc.coverage.crmActiveCount.toLocaleString()} khách hàng hoạt động.`
          : 'Dữ liệu thiếu hụt nghiêm trọng, hệ thống chạy trên mô hình giả lập.'
      },
      {
        id: 'LEAKAGE',
        type: 'LEAKAGE',
        dependsOn: ['DIAGNOSIS'],
        evidence: ['CRM-LEAK-AUDIT'],
        confidence: leakageConfidence,
        description: 'Dự báo điểm thất thoát phễu kinh doanh (Funnel Leakage)',
        outcome: isExtremeGoal 
          ? 'Điểm nghẽn nằm ở công suất tối đa của KTV và tỷ lệ chốt sales yếu' 
          : 'Rò rỉ ở tỷ lệ chuyển đổi Leads sang Bookings tại chi nhánh'
      },
      {
        id: 'DECISION',
        type: 'DECISION',
        dependsOn: ['LEAKAGE'],
        evidence: [],
        confidence: decisionConfidence,
        description: 'Lựa chọn phương án tối ưu dựa trên phân tích điểm nghẽn',
        outcome: isExtremeGoal 
          ? 'Kiến nghị bác bỏ chỉ tiêu 300% và đề xuất lộ trình 30% trong 60 ngày' 
          : 'Tập trung Retention chăm sóc khách hàng cũ thông qua SMS/Zalo để tạo đà dòng tiền bền vững'
      }
    ];

    return {
      graphId,
      timestamp: new Date().toISOString(),
      contextId: ecc.contextId,
      nodes
    };
  }
}
