/**
 * BELLA EOS EDR: Multi-Agent Debate Service (ECOS Final Specification)
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Dynamic Board Deliberation. Generates opinions and a structured debate transcript
 * only for the active Core + Dynamic board members selected for the current goal.
 */

import { ExpertOpinion, ExpertRole } from '@/types/deliberation-session';
import { AiMarketAnalyst } from './ai-market-analyst';
import { RiskAnalyst } from './risk-analyst';
import { CxAnalyst } from './cx-analyst';

export class MultiAgentDebateRuntime {
  private static instance: MultiAgentDebateRuntime;

  private constructor() {}

  public static getInstance(): MultiAgentDebateRuntime {
    if (!MultiAgentDebateRuntime.instance) {
      MultiAgentDebateRuntime.instance = new MultiAgentDebateRuntime();
    }
    return MultiAgentDebateRuntime.instance;
  }

  public conductDebate(selectedExperts: string[], objective: string): { opinions: ExpertOpinion[]; debateTranscript: string[] } {
    // Generate potential opinions for all experts
    const allOpinions: Record<ExpertRole, () => ExpertOpinion> = {
      FINANCE: () => ({
        expertRole: 'FINANCE',
        recommendation: 'CONDITIONAL_APPROVAL',
        rationale: 'Chi phí đầu tư CapEx dự kiến 1.5 tỷ VND. Khuyến nghị chỉ cấp phép nếu dòng tiền Q3 khả dụng > 1.8 tỷ VND.',
        keyMetric: 'CapEx Limit = 1.5B VND',
        confidenceScore: 0.88,
      }),
      OPERATIONS: () => ({
        expertRole: 'OPERATIONS',
        recommendation: 'APPROVE',
        rationale: 'Tối ưu công suất 16 giường. Chuỗi cung ứng mỹ phẩm hữu cơ đã sẵn sàng kết nối.',
        keyMetric: 'Capacity = 16 beds',
        confidenceScore: 0.90,
      }),
      LEGAL: () => ({
        expertRole: 'LEGAL',
        recommendation: 'APPROVE',
        rationale: 'Giấy phép đăng ký kinh doanh và chứng chỉ hành nghề y tế/spa đáp ứng đủ tiêu chuẩn pháp lý.',
        keyMetric: 'Legal Compliance = 100%',
        confidenceScore: 0.95,
      }),
      RISK_ANALYST: () => RiskAnalyst.getInstance().generateExpertOpinion(objective),
      MARKETING: () => ({
        expertRole: 'MARKETING',
        recommendation: 'APPROVE',
        rationale: 'Thị trường có nhu cầu lớn. Dự kiến CAC 420.000 VND và ROAS 3.2x.',
        keyMetric: 'Target ROAS = 3.2x',
        confidenceScore: 0.92,
      }),
      HUMAN_RESOURCES: () => ({
        expertRole: 'HUMAN_RESOURCES',
        recommendation: 'CONDITIONAL_APPROVAL',
        rationale: 'Cần tuyển kỹ thuật viên tay nghề cao. Cần tối thiểu 45 ngày đào tạo chuẩn SOP Bella.',
        keyMetric: 'Lead Time = 45 days',
        confidenceScore: 0.85,
      }),
      MARKET_ANALYST: () => AiMarketAnalyst.getInstance().generateExpertOpinion(objective),
      CX_ANALYST: () => CxAnalyst.getInstance().generateExpertOpinion(objective),
      IT_SECURITY: () => ({
        expertRole: 'IT_SECURITY',
        recommendation: 'APPROVE',
        rationale: 'Kiến trúc bảo mật thông tin và hệ thống IT nội bộ đáp ứng đầy đủ tiêu chuẩn ECOS.',
        keyMetric: 'Security Rating = A+',
        confidenceScore: 0.94,
      }),
      SUPPLY_CHAIN: () => ({
        expertRole: 'SUPPLY_CHAIN',
        recommendation: 'APPROVE',
        rationale: 'Chuỗi cung ứng toàn diện đáp ứng được nhu cầu cung cấp nguyên liệu thô và mỹ phẩm.',
        keyMetric: 'Supply Lead Time = 3d',
        confidenceScore: 0.87,
      }),
      DATA_ANALYST: () => ({
        expertRole: 'DATA_ANALYST',
        recommendation: 'APPROVE',
        rationale: 'Phân tích dữ liệu lịch sử xác nhận xu hướng tăng trưởng ổn định trong phân khúc spa cao cấp.',
        keyMetric: 'Data Integrity = 99%',
        confidenceScore: 0.89,
      }),
      COMPLIANCE: () => ({
        expertRole: 'COMPLIANCE',
        recommendation: 'APPROVE',
        rationale: 'Quy trình vận hành tuân thủ 100% các quy định về vệ sinh an toàn và lao động địa phương.',
        keyMetric: 'Compliance Score = 100%',
        confidenceScore: 0.93,
      }),
      ESG: () => ({
        expertRole: 'ESG',
        recommendation: 'APPROVE',
        rationale: 'Các giải pháp năng lượng xanh và giảm thiểu rác thải nhựa được tích hợp triệt để.',
        keyMetric: 'Carbon Offset = 12%',
        confidenceScore: 0.90,
      }),
      MANUFACTURING: () => ({
        expertRole: 'MANUFACTURING',
        recommendation: 'APPROVE',
        rationale: 'Dự báo năng lực sản xuất mỹ phẩm nội bộ đáp ứng tốt tiến độ khai trương.',
        keyMetric: 'Yield Rate = 99.1%',
        confidenceScore: 0.86,
      }),
      MEDICAL: () => ({
        expertRole: 'MEDICAL',
        recommendation: 'APPROVE',
        rationale: 'Các bác sĩ da liễu và chuyên viên trị liệu đã được kiểm tra bằng cấp chuyên môn đầy đủ.',
        keyMetric: 'Safety Audited = 100%',
        confidenceScore: 0.95,
      }),
    };

    // Filter opinions to contain only those in selectedExperts
    const opinions: ExpertOpinion[] = [];
    selectedExperts.forEach(roleStr => {
      const role = roleStr as ExpertRole;
      if (allOpinions[role]) {
        opinions.push(allOpinions[role]());
      }
    });

    // Generate debate transcript dynamically based on active members
    const debateTranscript: string[] = [];
    debateTranscript.push(`[BOARD INIT] Conducting board deliberation with active experts: ${selectedExperts.join(', ')}`);

    if (selectedExperts.includes('FINANCE')) {
      debateTranscript.push('[DEBATE ROUND 1] FINANCE: Cảnh báo rủi ro đứt gãy dòng tiền nếu chi quá 1.5 tỷ VND CapEx.');
    }
    if (selectedExperts.includes('MARKETING')) {
      debateTranscript.push('[DEBATE ROUND 1] MARKETING: Phản biện - Nếu không mở trong Q3 sẽ mất 35% thị phần vào tay đối thủ.');
    }
    if (selectedExperts.includes('HUMAN_RESOURCES')) {
      debateTranscript.push('[DEBATE ROUND 2] HR: Đề xuất thỏa hiệp - Bắt đầu tuyển dụng sớm để kịp khai trương.');
    }
    if (selectedExperts.includes('MARKET_ANALYST')) {
      debateTranscript.push('[DEBATE ROUND 2] MARKET_ANALYST: Đánh giá cao cơ hội chiếm lĩnh phân khúc luxury.');
    }
    if (selectedExperts.includes('RISK_ANALYST')) {
      debateTranscript.push('[DEBATE ROUND 3] RISK_ANALYST: Đề xuất tăng quỹ dự phòng rủi ro lên 15% cho CapEx overrun.');
    }
    if (selectedExperts.includes('CX_ANALYST')) {
      debateTranscript.push('[DEBATE ROUND 3] CX_ANALYST: Khuyến nghị đầu tư hệ thống booking realtime để giữ chân khách hàng.');
    }

    // Add entries for other active dynamic experts if present
    selectedExperts.forEach(expert => {
      if (!['FINANCE', 'MARKETING', 'HUMAN_RESOURCES', 'MARKET_ANALYST', 'RISK_ANALYST', 'CX_ANALYST'].includes(expert)) {
        debateTranscript.push(`[DEBATE INPUT] ${expert}: Khuyến nghị chuyên môn liên quan đến mục tiêu doanh nghiệp.`);
      }
    });

    debateTranscript.push(`[CONSENSUS SYNTHESIS] Consensus reached by active board members on methods to achieve objective: "${objective}".`);

    return { opinions, debateTranscript };
  }
}
