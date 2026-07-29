import { DeclarativeSOP } from '../orchestration/sop-engine';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AutonomyMode = 'AUTONOMOUS' | 'SINGLE_APPROVAL' | 'MULTI_APPROVAL' | 'HUMAN_ONLY';

export interface AutonomyEvaluationResult {
  riskLevel: RiskLevel;
  autonomyMode: AutonomyMode;
  isAutonomousAllowed: boolean;
  requiresHumanClarification: boolean;
  requiredApprovers: string[];
  reasons: string[];
}

export class AdaptiveAutonomyEngine {
  private static CONFIDENCE_THRESHOLD = 0.75;

  public evaluate(
    sop: DeclarativeSOP,
    confidence: number,
    intentBudgetVnd?: number
  ): AutonomyEvaluationResult {
    const reasons: string[] = [];

    // 1. Calculate Risk Level based on SOP domain, security tag, and budget
    let riskLevel: RiskLevel = 'LOW';

    if (sop.securityPolicy?.securityTag === 'HIGH_SECURITY' || (intentBudgetVnd && intentBudgetVnd > 500000000)) {
      riskLevel = 'HIGH';
      reasons.push(`Chính sách bảo mật cao (HIGH_SECURITY) hoặc ngân sách lớn (> 500M VND)`);
    } else if (intentBudgetVnd && intentBudgetVnd > 1000000000) {
      riskLevel = 'CRITICAL';
      reasons.push(`Hạn mức ngân sách cực kỳ lớn (> 1B VND) - Yêu cầu kiểm soát đặc biệt`);
    } else if (sop.approvalPolicy.requiresCEOApproval) {
      riskLevel = 'MEDIUM';
      reasons.push(`Yêu cầu phê duyệt cấp C-Level từ CEO`);
    } else {
      reasons.push(`Mức độ rủi ro tiêu chuẩn (LOW)`);
    }

    // 2. Evaluate Low Confidence Gating
    const lowConfidence = confidence < AdaptiveAutonomyEngine.CONFIDENCE_THRESHOLD;
    if (lowConfidence) {
      reasons.push(`Độ tin cậy khớp SOP (${(confidence * 100).toFixed(0)}%) dưới ngưỡng tối thiểu (${AdaptiveAutonomyEngine.CONFIDENCE_THRESHOLD * 100}%)`);
    }

    // 3. Determine Autonomy Mode & Approvers
    let autonomyMode: AutonomyMode = 'AUTONOMOUS';
    let isAutonomousAllowed = false;
    let requiredApprovers: string[] = [];

    if (riskLevel === 'CRITICAL' || lowConfidence) {
      autonomyMode = riskLevel === 'CRITICAL' ? 'HUMAN_ONLY' : 'SINGLE_APPROVAL';
      isAutonomousAllowed = false;
      requiredApprovers = ['CEO', 'Board of Directors'];
      if (lowConfidence) {
        reasons.push(`Khóa tự động hóa: Cần con người làm rõ yêu cầu do độ tin cậy thấp`);
      }
    } else if (riskLevel === 'HIGH') {
      autonomyMode = 'MULTI_APPROVAL';
      isAutonomousAllowed = false;
      requiredApprovers = Array.from(new Set(['CFO', 'CEO', ...sop.approvalPolicy.requiredRoles]));
      reasons.push(`Đồng phê duyệt đa cấp C-Suite (${requiredApprovers.join(', ')})`);
    } else if (riskLevel === 'MEDIUM') {
      autonomyMode = 'SINGLE_APPROVAL';
      isAutonomousAllowed = false;
      requiredApprovers = sop.approvalPolicy.requiredRoles;
      reasons.push(`Cần 1 cấp phê duyệt (${requiredApprovers.join(', ')})`);
    } else {
      // LOW risk & High confidence
      autonomyMode = 'AUTONOMOUS';
      isAutonomousAllowed = true;
      requiredApprovers = [];
      reasons.push(`Tự động thi hành độc lập (Fully Autonomous Execution)`);
    }

    return {
      riskLevel,
      autonomyMode,
      isAutonomousAllowed,
      requiresHumanClarification: lowConfidence,
      requiredApprovers,
      reasons
    };
  }
}
