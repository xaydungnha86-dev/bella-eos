/**
 * BELLA EOS ORCHESTRATION: Explainable SOP Selector
 * Matches CEO Intent to registered SOP Templates deterministically with reasoning traces.
 */

import { SopEngine, SopDefinition } from './sop-engine';

export interface SopSelectionResult {
  selectedSop: SopDefinition;
  confidence: number;
  reasons: string[];
  matchedKeywords: string[];
  department: string;
  requiresHumanClarification: boolean;
  clarificationPrompt?: string;
}

export class SopSelector {
  private sopEngine: SopEngine;
  private readonly CONFIDENCE_THRESHOLD = 0.75;

  constructor() {
    this.sopEngine = SopEngine.getInstance();
  }

  /**
   * Evaluates CEO Intent against registered SOPs and returns the best match with explainable traces.
   */
  public selectSop(ceoIntent: string, context?: Record<string, any>): SopSelectionResult {
    const normalizedIntent = ceoIntent.toLowerCase();
    const registeredSops = this.sopEngine.getAllSops();

    let bestSop: SopDefinition | null = null;
    let highestScore = 0;
    let bestMatchedKeywords: string[] = [];
    let bestReasons: string[] = [];

    for (const sop of registeredSops) {
      const matchedKeywords: string[] = [];
      const reasons: string[] = [];
      let score = 0;

      // 1. Intent pattern matching (Base Weight: 0.6)
      for (const pattern of sop.intentPatterns) {
        if (normalizedIntent.includes(pattern.toLowerCase())) {
          matchedKeywords.push(pattern);
          score += 0.25;
        }
      }

      if (matchedKeywords.length > 0) {
        reasons.push(`Khớp ${matchedKeywords.length} từ khóa ý định: [${matchedKeywords.join(', ')}]`);
      }

      // Cap keyword matching score contribution to 0.65
      score = Math.min(score, 0.65);

      // 2. Department / Category context affinity (Weight: 0.2)
      if (context?.department && context.department.toLowerCase() === sop.department.toLowerCase()) {
        score += 0.20;
        reasons.push(`Phòng ban ngữ cảnh trùng khớp với phòng ban SOP [${sop.department}]`);
      }

      // 3. Preconditions & Budget governance rules (Weight: 0.15)
      if (sop.governancePolicy.strictness === 'HIGH_SECURITY') {
        reasons.push(`SOP yêu cầu chính sách quản trị an toàn tài chính cao (HIGH_SECURITY)`);
      }

      if (score > highestScore) {
        highestScore = score;
        bestSop = sop;
        bestMatchedKeywords = matchedKeywords;
        bestReasons = reasons;
      }
    }

    // Default fallback if no keywords match or confidence is low
    if (!bestSop || highestScore < 0.2) {
      const fallbackSop = this.sopEngine.getSop('sop-spa-marketing')!;
      return {
        selectedSop: fallbackSop,
        confidence: 0.65,
        reasons: [
          'Không tìm thấy từ khóa đặc thù phòng ban rõ ràng trong Ý định CEO',
          'Sử dụng quy trình mặc định SOP Tiếp thị Spa Đa kênh (Default Fallback)'
        ],
        matchedKeywords: [],
        department: fallbackSop.department,
        requiresHumanClarification: true,
        clarificationPrompt: 'Ý định của CEO chưa chứa từ khóa phòng ban rõ ràng (HR, Finance, Retention, Spa). Vui lòng xác nhận quy trình vận hành mong muốn.'
      };
    }

    // Calculate normalized confidence score (Base 0.68 + score scaling)
    const finalConfidence = Math.min(0.98, Number((0.68 + highestScore * 0.40).toFixed(2)));
    const requiresHumanClarification = finalConfidence < this.CONFIDENCE_THRESHOLD;

    bestReasons.push(`Áp dụng chính sách duyệt: ${bestSop.approvalPolicy.requiredRoles.join(', ')} (Cần duyệt CEO: ${bestSop.approvalPolicy.requiresCEOApproval})`);

    return {
      selectedSop: bestSop,
      confidence: finalConfidence,
      reasons: bestReasons,
      matchedKeywords: bestMatchedKeywords,
      department: bestSop.department,
      requiresHumanClarification,
      clarificationPrompt: requiresHumanClarification ? `Độ tự tin khớp quy trình (${Math.round(finalConfidence * 100)}%) chưa đạt ngưỡng tối thiểu (75%). Vui lòng xác nhận trực tiếp trước khi thực thi.` : undefined
    };
  }
}
