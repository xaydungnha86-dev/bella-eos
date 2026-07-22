/**
 * BELLA EOS CORE: Feature Flag Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IFeatureFlag v1.0.
 */

import { FeatureFlag, IFeatureFlag } from '@/types/feature-flag';

export class FeatureRuntime implements IFeatureFlag {
  private static instance: FeatureRuntime;
  private flags: Map<string, FeatureFlag> = new Map();

  private constructor() {}

  public static getInstance(): FeatureRuntime {
    if (!FeatureRuntime.instance) {
      FeatureRuntime.instance = new FeatureRuntime();
    }
    return FeatureRuntime.instance;
  }

  public async isEnabled(flagKey: string, tenantId?: string): Promise<boolean> {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;
    if (!flag.isEnabled) return false;

    if (tenantId && flag.tenantWhitelist && flag.tenantWhitelist.length > 0) {
      return flag.tenantWhitelist.includes(tenantId);
    }

    return true;
  }

  public async setFlag(flag: FeatureFlag): Promise<boolean> {
    this.flags.set(flag.flagKey, flag);
    return true;
  }

  public async listFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.flags.values());
  }
}
