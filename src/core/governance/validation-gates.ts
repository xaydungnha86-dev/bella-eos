/**
 * BELLA EOS GOVERNANCE: Quality Validation Gates (Definition of Done Enforcers)
 * Checks and validates EOM Contracts before allowing execution transition to downstream engines.
 */

import { IntentContract, DecisionContract } from '@/types/governance-contracts';

export class ValidationError extends Error {
  constructor(public engineName: string, message: string) {
    super(`[DoD Validation Gate: ${engineName}] ${message}`);
    this.name = 'ValidationError';
  }
}

export class IntentGate {
  /**
   * Validates IntentContract against Definition of Done (DoD).
   */
  public static validate(contract: IntentContract): void {
    if (!contract.targetObjective || contract.targetObjective.trim().length === 0) {
      throw new ValidationError('IntentEngine', 'Trường targetObjective không được để trống.');
    }
    if (contract.spendLimitVnd <= 0) {
      throw new ValidationError('IntentEngine', 'Ngân sách đề xuất spendLimitVnd phải là số dương.');
    }
    if (contract.expectedTimelineDays <= 0 || contract.expectedTimelineDays > 365) {
      throw new ValidationError('IntentEngine', 'Thời hạn expectedTimelineDays phải từ 1 đến 365 ngày.');
    }
    if (contract.parsingConfidence < 0.95) {
      throw new ValidationError('IntentEngine', `Độ tự tin phân tích (${(contract.parsingConfidence * 100).toFixed(0)}%) không đạt yêu cầu tối thiểu (>=95%).`);
    }
  }
}

export interface LeafGoal {
  goalId: string;
  objective: string;
  ownerRole?: string;
  budgetVnd: number;
}

export interface GoalTree {
  rootGoalId: string;
  parentBudgetVnd: number;
  goals: LeafGoal[];
}

export class GoalGate {
  /**
   * Validates GoalTree against Definition of Done (DoD).
   */
  public static validate(tree: GoalTree): void {
    if (!tree.rootGoalId) {
      throw new ValidationError('GoalEngine', 'Cây mục tiêu GoalTree phải có đỉnh gốc rootGoalId.');
    }
    if (tree.goals.length === 0) {
      throw new ValidationError('GoalEngine', 'Cây mục tiêu không được rỗng.');
    }

    let allocatedBudget = 0;
    for (const goal of tree.goals) {
      if (!goal.ownerRole || goal.ownerRole.trim().length === 0) {
        throw new ValidationError('GoalEngine', `Mục tiêu con [${goal.goalId}] chưa có người chịu trách nhiệm (ownerRole).`);
      }
      allocatedBudget += goal.budgetVnd;
    }

    if (allocatedBudget > tree.parentBudgetVnd) {
      throw new ValidationError(
        'GoalEngine', 
        `Tổng ngân sách phân bổ cho các mục tiêu con (${allocatedBudget.toLocaleString('vi-VN')} VND) vượt quá trần cho phép (${tree.parentBudgetVnd.toLocaleString('vi-VN')} VND).`
      );
    }
  }
}

export class DecisionGate {
  /**
   * Validates DecisionContract against Definition of Done (DoD).
   */
  public static validate(contract: DecisionContract): void {
    if (contract.alternatives.length < 2) {
      throw new ValidationError('DecisionEngine', 'Đề xuất quyết sách phải cung cấp tối thiểu 2 phương án thay thế (Alternative Options).');
    }

    for (const alt of contract.alternatives) {
      if (alt.pros.length < 2) {
        throw new ValidationError('DecisionEngine', `Phương án [${alt.strategyId}] phải có tối thiểu 2 ưu điểm (Pros).`);
      }
      if (alt.cons.length < 1) {
        throw new ValidationError('DecisionEngine', `Phương án [${alt.strategyId}] phải có tối thiểu 1 nhược điểm (Cons).`);
      }
    }

    if (contract.evidence.length < 3) {
      throw new ValidationError('DecisionEngine', 'Quyết sách phải có tối thiểu 3 dẫn chứng lịch sử hỗ trợ lập luận.');
    }

    if (contract.riskScore === undefined || contract.riskScore < 0 || contract.riskScore > 1) {
      throw new ValidationError('DecisionEngine', 'Quyết sách chưa được đánh giá chỉ số rủi ro (riskScore).');
    }
  }
}
