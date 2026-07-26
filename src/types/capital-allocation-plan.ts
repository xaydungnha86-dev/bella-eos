/**
 * BELLA EOS PLATFORM CONTRACT: Capital Allocation Plan Contract (ICapitalAllocationPlan v1.0)
 * Specification: v19.0 BELLA EOS ENTERPRISE STRATEGIC OPERATING SYSTEM (ESOS)
 * 
 * Contract 48: Strategic Capital Allocation & Portfolio ROI Contract.
 * Manages CapEx and OpEx capital distributions across growth pillars, M&A, technology R&D,
 * and regional market expansions with projected portfolio ROI calculations.
 */

export interface CapitalAllocationItem {
  allocationId: string;
  pillarId: string;
  category: 'GROWTH_EXPANSION' | 'TECH_R_AND_D' | 'M_AND_A' | 'WORKING_CAPITAL';
  allocatedAmountUsd: number;
  expectedRoiPercentage: number;
}

export interface ICapitalAllocationPlan {
  planId: string;
  tenantId: string;
  totalCapExUsd: number;
  allocations: CapitalAllocationItem[];
  expectedPortfolioRoiPercentage: number;
  status: 'DRAFT' | 'APPROVED' | 'EXECUTING' | 'COMPLETED';
  createdAt: string;
}
