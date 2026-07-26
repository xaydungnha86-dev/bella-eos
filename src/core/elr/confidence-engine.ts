/**
 * BELLA EOS ELR: Confidence Engine (Runtime 9)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Anti-Blind-Learning Engine. Ensures every Knowledge item and Pattern has:
 * Confidence Score, Evidence Count, Verification Status, Owner, Created Time, Expiration,
 * preventing ungrounded AI hallucination or outdated knowledge retention.
 */

export interface ConfidenceAssessment {
  knowledgeId: string;
  confidenceScore: number; // 0.0 to 1.0
  evidenceCount: number;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';
  owner: string;
  createdAt: string;
  expirationDate: string;
  isTrustworthy: boolean;
}

export class ConfidenceEngine {
  private static instance: ConfidenceEngine;
  private confidenceLog: Map<string, ConfidenceAssessment> = new Map();

  private constructor() {}

  public static getInstance(): ConfidenceEngine {
    if (!ConfidenceEngine.instance) {
      ConfidenceEngine.instance = new ConfidenceEngine();
    }
    return ConfidenceEngine.instance;
  }

  public assessConfidence(
    knowledgeId: string,
    evidenceCount: number,
    baseConfidence: number,
    owner: string = 'ELR_CONFIDENCE_ENGINE',
    validityDays: number = 365
  ): ConfidenceAssessment {
    const now = new Date();
    const expDate = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

    // Boost confidence dynamically with higher evidence count
    const evidenceBonus = Math.min(0.15, Math.log10(evidenceCount + 1) * 0.08);
    const finalScore = Math.min(0.99, Math.round((baseConfidence + evidenceBonus) * 100) / 100);

    const verificationStatus: ConfidenceAssessment['verificationStatus'] = 
      finalScore >= 0.80 && evidenceCount >= 1 ? 'VERIFIED' : 'UNVERIFIED';

    const assessment: ConfidenceAssessment = {
      knowledgeId,
      confidenceScore: finalScore,
      evidenceCount,
      verificationStatus,
      owner,
      createdAt: now.toISOString(),
      expirationDate: expDate.toISOString(),
      isTrustworthy: finalScore >= 0.80 && verificationStatus === 'VERIFIED',
    };

    this.confidenceLog.set(knowledgeId, assessment);
    return assessment;
  }

  public getAssessment(knowledgeId: string): ConfidenceAssessment | undefined {
    return this.confidenceLog.get(knowledgeId);
  }
}
