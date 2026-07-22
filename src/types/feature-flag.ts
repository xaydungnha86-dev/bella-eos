/**
 * BELLA EOS PLATFORM CONTRACT: Feature Flag Management Contract (IFeatureFlag v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Tenant-scoped feature flag governor contract.
 */

export interface FeatureFlag {
  flagKey: string;
  isEnabled: boolean;
  tenantWhitelist?: string[];
  percentageRollout?: number;
  metadata?: Record<string, any>;
}

export interface IFeatureFlag {
  isEnabled(flagKey: string, tenantId?: string): Promise<boolean>;
  setFlag(flag: FeatureFlag): Promise<boolean>;
  listFlags(): Promise<FeatureFlag[]>;
}
