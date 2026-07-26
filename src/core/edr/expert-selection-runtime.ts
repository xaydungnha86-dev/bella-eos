/**
 * BELLA EOS EDR: Expert Selection Runtime (Runtime 20)
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Dynamic Role Selector Engine. Selects always-on Core Experts (Finance, Operations, Legal, Risk)
 * and dynamically activates relevant Dynamic Experts based on objective context.
 */

import { ExpertRole } from '@/types/deliberation-session';

export class ExpertSelectionRuntime {
  private static instance: ExpertSelectionRuntime;

  private readonly coreExperts: ExpertRole[] = [
    'FINANCE',
    'OPERATIONS',
    'LEGAL',
    'RISK_ANALYST'
  ];

  private constructor() {}

  public static getInstance(): ExpertSelectionRuntime {
    if (!ExpertSelectionRuntime.instance) {
      ExpertSelectionRuntime.instance = new ExpertSelectionRuntime();
    }
    return ExpertSelectionRuntime.instance;
  }

  public selectExperts(objective: string): ExpertRole[] {
    const lower = objective.toLowerCase();
    const activeDynamic: ExpertRole[] = [];

    // Objective-based dynamic selection
    if (lower.includes('spa') || lower.includes('mở rộng') || lower.includes('expansion') || lower.includes('branch') || lower.includes('chi nhánh')) {
      activeDynamic.push('MARKETING', 'HUMAN_RESOURCES', 'CX_ANALYST', 'MARKET_ANALYST');
    }
    if (lower.includes('sa thải') || lower.includes('layoff') || lower.includes('nhân viên') || lower.includes('tuyển dụng') || lower.includes('employee')) {
      activeDynamic.push('HUMAN_RESOURCES', 'CX_ANALYST');
    }
    if (lower.includes('quảng cáo') || lower.includes('marketing') || lower.includes('ads') || lower.includes('campaign')) {
      activeDynamic.push('MARKETING', 'MARKET_ANALYST', 'DATA_ANALYST');
    }
    if (lower.includes('an ninh') || lower.includes('bảo mật') || lower.includes('it') || lower.includes('security') || lower.includes('system')) {
      activeDynamic.push('IT_SECURITY', 'DATA_ANALYST');
    }
    if (lower.includes('cung ứng') || lower.includes('supply') || lower.includes('logistics') || lower.includes('vận chuyển')) {
      activeDynamic.push('SUPPLY_CHAIN');
    }
    if (lower.includes('compliance') || lower.includes('tuân thủ') || lower.includes('luật')) {
      activeDynamic.push('COMPLIANCE');
    }
    if (lower.includes('esg') || lower.includes('môi trường') || lower.includes('carbon')) {
      activeDynamic.push('ESG');
    }
    if (lower.includes('sản xuất') || lower.includes('manufacturing') || lower.includes('nhà máy')) {
      activeDynamic.push('MANUFACTURING');
    }
    if (lower.includes('medical') || lower.includes('y tế') || lower.includes('sức khỏe') || lower.includes('clinic')) {
      activeDynamic.push('MEDICAL');
    }

    // Always include core experts, and append unique activated dynamic experts
    const allSelected = [...this.coreExperts, ...activeDynamic];
    return Array.from(new Set(allSelected));
  }
}
