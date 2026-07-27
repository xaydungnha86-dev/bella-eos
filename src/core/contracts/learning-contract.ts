export interface SOPMutation {
  sopId: string;
  targetProperty: string;
  previousValue: string;
  mutatedValue: string;
  reason: string;
}

export interface LearningContract {
  learningId: string;                   // Ví dụ: LRN-SOP-2026-001
  timestamp: string;
  parentContractId: string;             // Tham chiếu EIC đã thực thi
  evaluation: {
    overallSuccessRate: number;         // Tỷ lệ thành công (0-100)
    eqeQualityScore: number;            // Điểm số chất lượng EQE
    kpiOutcomes: Array<{
      metric: string;
      expected: string | number;
      actual: string | number;
      variance: number;                 // Sai lệch so với mục tiêu
    }>;
  };
  mutations: SOPMutation[];             // Danh sách các đột biến SOP được áp dụng
  auditTrail: {
    logHistory: string[];               // Lịch sử dấu vết telemetry cho việc audit
    learningVectorId?: string;          // Lưu trữ tham chiếu Vector DB
  };
}
