/**
 * BELLA EOS CORE SERVICE: Enterprise Resource Manager Service (Layer 1)
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Mission: Enterprise Real-World Constraint Enforcement Engine. Tracks and enforces corporate
 * resource ceilings across 9 dimensions: People, AI, Money, Time, Machines, Inventory, APIs, GPUs, and Licenses.
 * Prevents AI from over-promising or proposing campaigns that exceed available budgets (Contract CORE-09).
 */

import { IEnterpriseResourceBudget, EnterpriseResourceType } from '@/types/resource-budget';

export interface ResourceConstraintCheckResult {
  isWithinCeiling: boolean;
  resourceType: EnterpriseResourceType;
  requestedQuantity: number;
  availableQuantity: number;
  reason?: string;
}

export class EnterpriseResourceService {
  private static instance: EnterpriseResourceService;
  private budgets: Map<string, IEnterpriseResourceBudget> = new Map();

  private constructor() {
    this.seedDefaultBudgets();
  }

  public static getInstance(): EnterpriseResourceService {
    if (!EnterpriseResourceService.instance) {
      EnterpriseResourceService.instance = new EnterpriseResourceService();
    }
    return EnterpriseResourceService.instance;
  }

  private seedDefaultBudgets(): void {
    this.setBudget('res-mkt-money', 'tenant-bella-spa', 'MONEY', 'Marketing Q3 Budget', 120_000, 'USD', true);
    this.setBudget('res-human-designer', 'tenant-bella-spa', 'PEOPLE', 'Graphic Designer Workload', 40, 'HOURS', true);
    this.setBudget('res-gpu-tokens', 'tenant-bella-spa', 'GPU', 'AI Compute Quota', 5_000_000, 'TOKENS', false);
  }

  public setBudget(
    resourceId: string,
    tenantId: string,
    resourceType: EnterpriseResourceType,
    resourceName: string,
    availableQuantity: number,
    unit: string,
    isHardConstraint: boolean
  ): IEnterpriseResourceBudget {
    const budget: IEnterpriseResourceBudget = {
      resourceId,
      tenantId,
      resourceType,
      resourceName,
      allocatedQuantity: availableQuantity,
      availableQuantity,
      unit,
      isHardConstraint,
      updatedAt: new Date().toISOString(),
    };
    this.budgets.set(resourceId, budget);
    return budget;
  }

  public checkResourceAvailability(resourceId: string, requestedQuantity: number): ResourceConstraintCheckResult {
    const b = this.budgets.get(resourceId);
    if (!b) {
      return { isWithinCeiling: true, resourceType: 'MONEY', requestedQuantity, availableQuantity: Infinity };
    }

    if (requestedQuantity > b.availableQuantity && b.isHardConstraint) {
      return {
        isWithinCeiling: false,
        resourceType: b.resourceType,
        requestedQuantity,
        availableQuantity: b.availableQuantity,
        reason: `RESOURCE EXCEEDED: Requested ${requestedQuantity} ${b.unit} exceeds available limit of ${b.availableQuantity} ${b.unit} for [${b.resourceName}].`,
      };
    }

    return {
      isWithinCeiling: true,
      resourceType: b.resourceType,
      requestedQuantity,
      availableQuantity: b.availableQuantity,
    };
  }
}
