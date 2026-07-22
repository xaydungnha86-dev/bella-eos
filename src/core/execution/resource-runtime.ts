/**
 * BELLA EOS EXECUTION: Resource Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages Quota, Rate Limit, Budget, AI Credits, Tokens, and Concurrency Governors.
 */

export interface TenantResourceQuota {
  tenantId: string;
  monthlyBudgetVnd: number;
  monthlyAiCreditsUsd: number;
  maxConcurrency: number;
  currentUsedBudgetVnd: number;
  currentUsedAiCreditsUsd: number;
  currentActiveConcurrency: number;
}

export class ResourceRuntime {
  private static instance: ResourceRuntime;
  private quotas: Map<string, TenantResourceQuota> = new Map();

  private constructor() {}

  public static getInstance(): ResourceRuntime {
    if (!ResourceRuntime.instance) {
      ResourceRuntime.instance = new ResourceRuntime();
    }
    return ResourceRuntime.instance;
  }

  public setTenantQuota(quota: TenantResourceQuota): void {
    this.quotas.set(quota.tenantId, quota);
  }

  public checkExecutionAllowed(tenantId: string, estimatedCostUsd: number): { allowed: boolean; reason?: string } {
    const quota = this.quotas.get(tenantId);
    if (!quota) return { allowed: true }; // Default allow if unlimited

    if (quota.currentActiveConcurrency >= quota.maxConcurrency) {
      return { allowed: false, reason: `Max concurrency limit (${quota.maxConcurrency}) reached` };
    }

    if (quota.currentUsedAiCreditsUsd + estimatedCostUsd > quota.monthlyAiCreditsUsd) {
      return { allowed: false, reason: `Monthly AI Credits quota exceeded` };
    }

    return { allowed: true };
  }

  public acquireResource(tenantId: string): void {
    const quota = this.quotas.get(tenantId);
    if (quota) {
      quota.currentActiveConcurrency++;
    }
  }

  public releaseResource(tenantId: string, actualCostUsd: number): void {
    const quota = this.quotas.get(tenantId);
    if (quota) {
      quota.currentActiveConcurrency = Math.max(0, quota.currentActiveConcurrency - 1);
      quota.currentUsedAiCreditsUsd += actualCostUsd;
    }
  }
}
