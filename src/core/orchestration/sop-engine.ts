/**
 * BELLA EOS ORCHESTRATION: Declarative SOP Engine
 * Rich Executable Enterprise SOP Knowledge & Templates.
 */

import { SagaStep } from './workflow-runtime';

export interface SopStepDefinition {
  stepId: string;
  stepName: string;
  requiredSkills: string[];
  actionType: 'CONTENT' | 'CREATIVE' | 'PUBLISH' | 'APPROVAL' | 'RECRUITMENT' | 'FINANCE' | 'RETENTION';
  budgetPercent?: number; // percentage of overall budget, e.g. 0.35 (35%)
  compensationAction: string;
}

export interface ApprovalPolicy {
  requiresCEOApproval: boolean;
  requiredRoles: string[];
}

export interface GovernancePolicy {
  strictness: 'NORMAL' | 'HIGH_SECURITY';
  maxBudgetThresholdVnd?: number;
}

export interface SopDefinition {
  sopId: string;
  sopName: string;
  department: 'Marketing' | 'HR' | 'Finance' | 'Customer Care' | 'Operations';
  version: string;
  intentPatterns: string[];
  approvalPolicy: ApprovalPolicy;
  governancePolicy: GovernancePolicy;
  kpiTargets: string[];
  steps: SopStepDefinition[];
}

export class SopEngine {
  private static instance: SopEngine;
  private sops: Map<string, SopDefinition> = new Map();

  private constructor() {
    this.seedDefaultSops();
  }

  public static getInstance(): SopEngine {
    if (!SopEngine.instance) {
      SopEngine.instance = new SopEngine();
    }
    return SopEngine.instance;
  }

  private seedDefaultSops(): void {
    // 1. Spa Marketing campaign SOP
    this.registerSop({
      sopId: 'sop-spa-marketing',
      sopName: 'Quy trình Chiến dịch Tiếp thị Spa Đa kênh',
      department: 'Marketing',
      version: '2.1.0',
      intentPatterns: ['marketing', 'tiếp thị', 'spa', 'quảng cáo', 'lead generation', 'doanh thu spa'],
      approvalPolicy: {
        requiresCEOApproval: true,
        requiredRoles: ['CEO', 'CMO']
      },
      governancePolicy: {
        strictness: 'NORMAL'
      },
      kpiTargets: ['Doanh thu +25%', 'Tỷ lệ chuyển đổi lead > 15%'],
      steps: [
        {
          stepId: 'step-content-draft',
          stepName: 'Soạn thảo nội dung bài viết',
          requiredSkills: ['copywriting', 'spa_services'],
          actionType: 'CONTENT',
          budgetPercent: 0.15,
          compensationAction: 'delete_content_draft'
        },
        {
          stepId: 'step-creative-design',
          stepName: 'Thiết kế banner hình ảnh',
          requiredSkills: ['graphic_design', 'brand_dna'],
          actionType: 'CREATIVE',
          budgetPercent: 0.25,
          compensationAction: 'delete_creative_banner'
        },
        {
          stepId: 'step-ceo-approval',
          stepName: 'Ký duyệt kế hoạch chi tiêu',
          requiredSkills: ['ceo_authority'],
          actionType: 'APPROVAL',
          budgetPercent: 0.0,
          compensationAction: 'void_approval_token'
        },
        {
          stepId: 'step-publish-ads',
          stepName: 'Lên chiến dịch & Xuất bản quảng cáo',
          requiredSkills: ['ads_management', 'facebook_api'],
          actionType: 'PUBLISH',
          budgetPercent: 0.60,
          compensationAction: 'stop_ad_campaign'
        }
      ]
    });

    // 2. HR Recruitment SOP
    this.registerSop({
      sopId: 'sop-hr-recruitment',
      sopName: 'Quy trình Tuyển dụng & Onboarding Nhân sự Cao cấp',
      department: 'HR',
      version: '1.4.0',
      intentPatterns: ['tuyển dụng', 'recruitment', 'hiring', 'bổ sung nhân sự', 'talent acquisition', 'nhân sự'],
      approvalPolicy: {
        requiresCEOApproval: true,
        requiredRoles: ['CEO', 'CHRO']
      },
      governancePolicy: {
        strictness: 'NORMAL'
      },
      kpiTargets: ['Tuyển thành công 100% định biên', 'Thời gian tuyển < 30 ngày'],
      steps: [
        {
          stepId: 'step-jd-screening',
          stepName: 'Lập JD & Lọc hồ sơ ứng viên',
          requiredSkills: ['hr_screening', 'job_description'],
          actionType: 'RECRUITMENT',
          budgetPercent: 0.20,
          compensationAction: 'cancel_job_posting'
        },
        {
          stepId: 'step-interview-scoring',
          stepName: 'Phỏng vấn & Đánh giá năng lực',
          requiredSkills: ['interview_assessment', 'competency_scoring'],
          actionType: 'RECRUITMENT',
          budgetPercent: 0.30,
          compensationAction: 'archive_candidate_feedback'
        },
        {
          stepId: 'step-offer-approval',
          stepName: 'Phê duyệt mức lương & Thư mời làm việc (Offer)',
          requiredSkills: ['compensation_benefits', 'ceo_approval'],
          actionType: 'APPROVAL',
          budgetPercent: 0.10,
          compensationAction: 'revoke_offer_letter'
        },
        {
          stepId: 'step-onboarding-training',
          stepName: 'Onboarding & Đào tạo hội nhập',
          requiredSkills: ['employee_onboarding', 'culture_training'],
          actionType: 'RECRUITMENT',
          budgetPercent: 0.40,
          compensationAction: 'terminate_onboarding_process'
        }
      ]
    });

    // 3. Finance Forecasting SOP
    this.registerSop({
      sopId: 'sop-finance-forecasting',
      sopName: 'Quy trình Dự báo Dòng tiền & Điều chỉnh Ngân sách',
      department: 'Finance',
      version: '3.0.0',
      intentPatterns: ['tài chính', 'finance', 'dòng tiền', 'cash flow', 'dự báo tài chính', 'forecast', 'ngân sách'],
      approvalPolicy: {
        requiresCEOApproval: true,
        requiredRoles: ['CEO', 'CFO']
      },
      governancePolicy: {
        strictness: 'HIGH_SECURITY',
        maxBudgetThresholdVnd: 500000000 // 500M VND limit for auto-reallocation
      },
      kpiTargets: ['Độ chính xác dự báo > 92%', 'Tối ưu hóa vốn lưu động +15%'],
      steps: [
        {
          stepId: 'step-cashflow-audit',
          stepName: 'Kiểm toán dữ liệu dòng tiền & Doanh thu thực tế',
          requiredSkills: ['financial_audit', 'erp_accounting'],
          actionType: 'FINANCE',
          budgetPercent: 0.10,
          compensationAction: 'rollback_financial_audit'
        },
        {
          stepId: 'step-scenario-modelling',
          stepName: 'Mô phỏng kịch bản biến động tài chính (Monte Carlo)',
          requiredSkills: ['financial_modeling', 'risk_assessment'],
          actionType: 'FINANCE',
          budgetPercent: 0.20,
          compensationAction: 'discard_scenario_model'
        },
        {
          stepId: 'step-cfo-ceo-approval',
          stepName: 'Duyệt hạn mức điều chuyển ngân sách (CFO/CEO Approval)',
          requiredSkills: ['cfo_authority', 'ceo_approval'],
          actionType: 'APPROVAL',
          budgetPercent: 0.0,
          compensationAction: 'freeze_budget_reallocation'
        },
        {
          stepId: 'step-budget-reallocation',
          stepName: 'Thực thi điều chuyển ngân sách giữa các quỹ phòng ban',
          requiredSkills: ['fund_allocation', 'bank_transfer_api'],
          actionType: 'FINANCE',
          budgetPercent: 0.70,
          compensationAction: 'revert_budget_transfer'
        }
      ]
    });

    // 4. Customer Retention SOP
    this.registerSop({
      sopId: 'sop-customer-retention',
      sopName: 'Quy trình Chăm sóc Khách hàng VIP & Win-Back',
      department: 'Customer Care',
      version: '1.8.0',
      intentPatterns: ['khách hàng vip', 'customer retention', 'win-back', 'chăm sóc khách hàng', 'giữ chân khách', 'tỷ lệ rời bỏ', 'churn'],
      approvalPolicy: {
        requiresCEOApproval: true,
        requiredRoles: ['CEO', 'CCO']
      },
      governancePolicy: {
        strictness: 'NORMAL'
      },
      kpiTargets: ['Tỷ lệ rời bỏ khách VIP giảm < 5%', 'Doanh thu Win-Back +30%'],
      steps: [
        {
          stepId: 'step-vip-segmentation',
          stepName: 'Phân tích tệp khách hàng nguy cơ rời bỏ (Churn Risk)',
          requiredSkills: ['crm_analytics', 'customer_segmentation'],
          actionType: 'RETENTION',
          budgetPercent: 0.15,
          compensationAction: 'clear_segmentation_list'
        },
        {
          stepId: 'step-incentive-design',
          stepName: 'Xây dựng gói ưu đãi tri ân & Quà tặng VIP',
          requiredSkills: ['loyalty_program', 'offer_design'],
          actionType: 'CREATIVE',
          budgetPercent: 0.35,
          compensationAction: 'cancel_vip_vouchers'
        },
        {
          stepId: 'step-outreach-campaign',
          stepName: 'Triển khai chiến dịch chăm sóc trực tiếp 1-on-1',
          requiredSkills: ['vip_relationship', 'omnichannel_outreach'],
          actionType: 'RETENTION',
          budgetPercent: 0.50,
          compensationAction: 'pause_vip_outreach'
        }
      ]
    });
  }

  /**
   * Registers a new SOP template definition.
   */
  public registerSop(sop: SopDefinition): void {
    this.sops.set(sop.sopId, sop);
  }

  /**
   * Retrieves a registered SOP by ID.
   */
  public getSop(sopId: string): SopDefinition | undefined {
    return this.sops.get(sopId);
  }

  /**
   * Lists all registered SOP definitions.
   */
  public getAllSops(): SopDefinition[] {
    return Array.from(this.sops.values());
  }

  /**
   * Compiles a declarative SOP definition into executable SagaSteps.
   */
  public compileToSaga(
    sopId: string, 
    totalBudgetVnd: number, 
    onStepExec?: (stepId: string, phase: 'ACTION' | 'COMPENSATE') => void
  ): SagaStep[] {
    const sop = this.getSop(sopId);
    if (!sop) {
      throw new Error(`SOP Template [${sopId}] not found in registry.`);
    }

    return sop.steps.map(step => {
      const stepBudget = totalBudgetVnd * (step.budgetPercent ?? 0.0);
      
      return {
        stepId: step.stepId,
        budgetVnd: stepBudget,
        action: async () => {
          if (onStepExec) onStepExec(step.stepId, 'ACTION');
          console.log(`[SOP Engine] Executing step: ${step.stepName} (${step.stepId}). Allocated budget: ${stepBudget.toLocaleString('vi-VN')} VND. Required Skills: ${step.requiredSkills.join(', ')}`);
          return true;
        },
        compensate: async () => {
          if (onStepExec) onStepExec(step.stepId, 'COMPENSATE');
          console.log(`[SOP Engine] Rollback compensation executed: ${step.compensationAction} for step: ${step.stepId}`);
        }
      };
    });
  }
}
