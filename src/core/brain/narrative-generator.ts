/**
 * Executive Narrative Generator
 * Translates pure domain decisions and analytics outputs into natural language executive summaries.
 */

import { ExplainableDecisionContractV1 } from '../contracts/decision-contract';
import { MonteCarloSimulationOutput } from '../analytics/analytics-engine';

export class ExecutiveNarrativeGenerator {
  public static generateExecutiveSummary(
    decision: ExplainableDecisionContractV1,
    analytics: MonteCarloSimulationOutput
  ): string {
    const rev = analytics.revenuePercentilesVnd;
    const roi = analytics.roiPercentiles;

    return `🏛️ **BÁO CÁO NGHỊ QUYẾT HỘI ĐỒNG AI & THẨM ĐỊNH TÀI CHÍNH (DECISION ID: ${decision.decisionId})**

### 1. Quyết định Chiến lược Được Duyệt
- **Chiến lược**: ${decision.approvedStrategy}
- **Độ tin cậy hệ thống**: ${(decision.confidenceScore * 100).toFixed(0)}%
- **Trạng thái**: ${decision.status === 'APPROVED' ? '✅ ĐÃ THỦ TRƯỞNG DUYỆT (READY FOR EXECUTION)' : '⚠️ CHỜ PHÊ DUYỆT CỦA CEO/CHỦ DOANH NGHIỆP'}

### 2. Kết quả Mô phỏng Toán học Monte Carlo (${analytics.iterationsRun.toLocaleString()} kịch bản)
- **Doanh thu P10 (Thận trọng)**: ${rev.p10.toLocaleString('vi-VN')} VND (ROI: ${roi.p10}%)
- **Doanh thu P50 (Trung vị)**: ${rev.p50.toLocaleString('vi-VN')} VND (ROI: ${roi.p50}%)
- **Doanh thu P90 (Lạc quan)**: ${rev.p90.toLocaleString('vi-VN')} VND (ROI: ${roi.p90}%)
- **Xác suất rủi ro rớt dòng tiền**: ${analytics.riskMatrix.lossProbabilityPercent}% (Mức độ: ${analytics.riskMatrix.riskLevel})

### 3. Bằng chứng Thẩm định & Giám sát Chính sách (Policy Guard)
${decision.evidence.map(e => `- ${e}`).join('\n')}

### 4. Báo cáo Tác động Độ nhạy (Sensitivity Analysis)
- ${analytics.sensitivityAnalysis.conversionRateImpact}
- ${analytics.sensitivityAnalysis.ticketSizeImpact}`;
  }
}
