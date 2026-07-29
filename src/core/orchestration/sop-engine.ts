/**
 * BELLA EOS ORCHESTRATION: Declarative SOP Engine
 * Compiles static Standard Operating Procedures (SOPs) into Saga steps at runtime.
 */

import { SagaStep } from './workflow-runtime';

export interface SopStepDefinition {
  stepId: string;
  stepName: string;
  requiredSkills: string[];
  actionType: 'CONTENT' | 'CREATIVE' | 'PUBLISH' | 'APPROVAL';
  budgetPercent?: number; // percentage of overall budget, e.g. 0.35 (35%)
  compensationAction: string;
}

export interface SopDefinition {
  sopId: string;
  sopName: string;
  department: string;
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
    // Default Spa Marketing campaign SOP
    this.registerSop({
      sopId: 'sop-spa-marketing',
      sopName: 'Quy trình Chiến dịch Tiếp thị Spa Đa kênh',
      department: 'Marketing',
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
