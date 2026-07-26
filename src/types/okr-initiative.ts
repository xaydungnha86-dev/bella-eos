/**
 * BELLA EOS PLATFORM CONTRACT: OKR Initiative Contract (IOkrInitiative v1.0)
 * Specification: v19.0 BELLA EOS ENTERPRISE STRATEGIC OPERATING SYSTEM (ESOS)
 * 
 * Contract 47: Enterprise OKR & Strategic Initiative Contract.
 * Maps top-level corporate OKRs to execution initiatives, owner roles, target metrics, and progress percentages.
 */

export interface IOkrInitiative {
  initiativeId: string;
  tenantId: string;
  strategicPillarId: string;
  okrTitle: string;
  ownerRole: string; // e.g. "CEO", "CMO", "CFO", "COO"
  targetMetric: string; // e.g. "+30% Market Share"
  completionPercentage: number; // 0 - 100
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK';
  createdAt: string;
}
