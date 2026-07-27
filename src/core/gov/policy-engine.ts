import { ExecutiveIntelligenceContract } from '../contracts/executive-intelligence-contract';

export interface PolicyViolation {
  policyId: string;
  policyName: string;
  category: 'FINANCE' | 'LEGAL' | 'COMPLIANCE' | 'SECURITY';
  severity: 'STRICT_BLOCK' | 'WARN_CEO' | 'INFO';
  reason: string;
}

export interface PolicyCheckResult {
  passed: boolean;
  violations: PolicyViolation[];
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private maxBudgetLimitVnd = 150000000;       // Chính sách cứng: Ngân sách chiến dịch tối đa 150M

  private constructor() {}

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  /**
   * Evaluates proposed Executive decisions before they are dispatched for execution
   */
  public evaluateProposal(eic: ExecutiveIntelligenceContract): PolicyCheckResult {
    const violations: PolicyViolation[] = [];

    // 1. Finance Rule check: Budget Cap
    const proposedBudget = eic.planning.spendLimitVnd;
    if (proposedBudget > this.maxBudgetLimitVnd) {
      violations.push({
        policyId: 'POL-FIN-001',
        policyName: 'Max Marketing Campaign Budget Limit',
        category: 'FINANCE',
        severity: 'STRICT_BLOCK',
        reason: `Đề xuất ngân sách ${proposedBudget.toLocaleString('vi-VN')} VND vượt quá giới hạn tối đa cho phép ${this.maxBudgetLimitVnd.toLocaleString('vi-VN')} VND.`
      });
    }

    // 2. Compliance check: GDPR & Customer safety
    const targetAudience = eic.strategicIntent.targetAudience.toLowerCase();
    if (targetAudience.includes('bệnh nhân') || targetAudience.includes('y tế nhạy cảm')) {
      violations.push({
        policyId: 'POL-LGL-002',
        policyName: 'Sensitive Segment Data Compliance Check',
        category: 'COMPLIANCE',
        severity: 'STRICT_BLOCK',
        reason: 'Không cho phép tiếp thị trực tiếp nhắm đến dữ liệu sức khỏe nhạy cảm khi chưa được Data Privacy Officer phê duyệt.'
      });
    }

    // 3. Brand Safety check
    if (eic.decision.approvedStrategy.toLowerCase().includes('spam') || eic.decision.approvedStrategy.toLowerCase().includes('mass email')) {
      violations.push({
        policyId: 'POL-SEC-003',
        policyName: 'Brand Reputation Safe Gate',
        category: 'SECURITY',
        severity: 'WARN_CEO',
        reason: 'Chiến dịch email hàng loạt (mass spam email) có nguy cơ ảnh hưởng xấu đến uy tín thương hiệu và bị liệt tên miền vào blacklist.'
      });
    }

    return {
      passed: violations.every(v => v.severity !== 'STRICT_BLOCK'),
      violations
    };
  }
}
