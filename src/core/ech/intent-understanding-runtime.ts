/**
 * BELLA EOS ECH: Intent Understanding Runtime (Runtime 11)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Mission: Classifies raw CEO directives into explicit Enterprise Intents
 * (e.g. "Doanh thu tháng này giảm" ➔ ROOT_CAUSE_ANALYSIS, "Lập kế hoạch" ➔ STRATEGIC_PLANNING).
 */

import { EnterpriseIntentType } from '@/types/cognitive-session';

export class IntentUnderstandingRuntime {
  private static instance: IntentUnderstandingRuntime;

  private constructor() {}

  public static getInstance(): IntentUnderstandingRuntime {
    if (!IntentUnderstandingRuntime.instance) {
      IntentUnderstandingRuntime.instance = new IntentUnderstandingRuntime();
    }
    return IntentUnderstandingRuntime.instance;
  }

  public classifyIntent(objective: string): EnterpriseIntentType {
    const lower = objective.toLowerCase();

    if (lower.includes('giảm') || lower.includes('tại sao') || lower.includes('lỗi') || lower.includes('root cause')) {
      return 'ROOT_CAUSE_ANALYSIS';
    }
    if (lower.includes('kế hoạch') || lower.includes('chiến lược') || lower.includes('plan') || lower.includes('mục tiêu')) {
      return 'STRATEGIC_PLANNING';
    }
    if (lower.includes('tài chính') || lower.includes('ngân sách') || lower.includes('chi phí') || lower.includes('audit')) {
      return 'FINANCIAL_AUDIT';
    }
    if (lower.includes('phân công') || lower.includes('nhân sự') || lower.includes('giao việc') || lower.includes('tuyển')) {
      return 'WORKFORCE_DISPATCH';
    }

    return 'OPERATIONAL_REVIEW';
  }
}
