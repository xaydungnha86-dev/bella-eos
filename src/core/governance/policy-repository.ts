/**
 * Policy-as-Code Repository
 * Manages versioned, testable enterprise policies.
 */

export interface EnterprisePolicy {
  policyId: string;
  version: string;
  category: 'FINANCE' | 'LEGAL' | 'OPERATIONS' | 'DATA_PRIVACY';
  description: string;
  evaluator: (context: Record<string, any>) => { compliant: boolean; violationReason?: string };
}

export class PolicyRepository {
  private static instance: PolicyRepository;
  private policies = new Map<string, EnterprisePolicy>();

  private constructor() {
    this.seedDefaultPolicies();
  }

  public static getInstance(): PolicyRepository {
    if (!PolicyRepository.instance) {
      PolicyRepository.instance = new PolicyRepository();
    }
    return PolicyRepository.instance;
  }

  private seedDefaultPolicies(): void {
    // Finance Policy: Budget <= Approved Budget Limit
    this.policies.set('policy_finance_max_budget_v1', {
      policyId: 'policy_finance_max_budget_v1',
      version: 'v1',
      category: 'FINANCE',
      description: 'Ngân sách đề xuất không vượt quá Hạn Mức An Toàn Dòng Tiền do Giám đốc Tài chính phê duyệt',
      evaluator: (ctx) => {
        const proposed = ctx.proposedBudgetVnd || 0;
        const limit = ctx.approvedBudgetLimitVnd || 100000000;
        if (proposed > limit) {
          return {
            compliant: false,
            violationReason: `Ngân sách đề xuất ${proposed.toLocaleString('vi-VN')} VND vượt quá hạn mức ${limit.toLocaleString('vi-VN')} VND.`
          };
        }
        return { compliant: true };
      }
    });

    // Operations Policy: Technician Staffing SLA
    this.policies.set('policy_ops_ktv_staffing_v1', {
      policyId: 'policy_ops_ktv_staffing_v1',
      version: 'v1',
      category: 'OPERATIONS',
      description: 'Không được triển khai chiến dịch nếu không có KTV hoạt động',
      evaluator: (ctx) => {
        const techCount = ctx.technicianCount ?? 3;
        if (techCount === 0) {
          return {
            compliant: false,
            violationReason: 'Không thể vận hành dịch vụ khi số lượng KTV active tại chi nhánh bằng 0.'
          };
        }
        return { compliant: true };
      }
    });
  }

  public getPolicy(id: string): EnterprisePolicy | undefined {
    return this.policies.get(id);
  }

  public getAllPolicies(): EnterprisePolicy[] {
    return Array.from(this.policies.values());
  }
}
