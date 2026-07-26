/**
 * BELLA EOS ERL: Release Gate Service
 * Specification: ERL Governance Engine
 * 
 * Mission: Block or approve software/prompt deployments based on quality benchmark thresholds.
 */

import { IReleaseGateResult } from '@/types/erl';

export class ReleaseGateService {
  private static instance: ReleaseGateService;
  private thresholdEri: number = 90.0;

  private constructor() {}

  public static getInstance(): ReleaseGateService {
    if (!ReleaseGateService.instance) {
      ReleaseGateService.instance = new ReleaseGateService();
    }
    return ReleaseGateService.instance;
  }

  public setThreshold(threshold: number): void {
    this.thresholdEri = threshold;
  }

  public evaluateRelease(candidateEri: number, targetCapability: string): IReleaseGateResult {
    const isApproved = candidateEri >= this.thresholdEri;
    
    return {
      isApproved,
      threshold: this.thresholdEri,
      reason: isApproved
        ? `Phê duyệt phát hành cho [${targetCapability}]. Điểm ERI đạt ${candidateEri} (Ngưỡng yêu cầu: ${this.thresholdEri}).`
        : `⚠️ BỊ CHẶN: Điểm ERI đạt ${candidateEri} thấp hơn ngưỡng an toàn ${this.thresholdEri} cho Capability [${targetCapability}].`
    };
  }
}
