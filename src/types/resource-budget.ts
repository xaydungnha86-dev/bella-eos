/**
 * BELLA EOS PLATFORM CONTRACT: Enterprise Resource Budget Contract (IEnterpriseResourceBudget v1.0)
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Contract CORE-09: Enterprise Resource Constraint Contract.
 * Tracks and enforces real-world corporate resource ceilings across 9 dimensions:
 * People, AI, Money, Time, Machines, Inventory, API Limits, GPUs, and Licenses.
 */

export type EnterpriseResourceType = 
  | 'PEOPLE' 
  | 'AI' 
  | 'MONEY' 
  | 'TIME' 
  | 'MACHINES' 
  | 'INVENTORY' 
  | 'API_LIMIT' 
  | 'GPU' 
  | 'LICENSE';

export interface IEnterpriseResourceBudget {
  resourceId: string;
  tenantId: string;
  resourceType: EnterpriseResourceType;
  resourceName: string;
  allocatedQuantity: number;
  availableQuantity: number;
  unit: string; // e.g. "USD", "HOURS", "UNITS", "TOKENS", "HEADCOUNT"
  isHardConstraint: boolean;
  updatedAt: string;
}
