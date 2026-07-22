/**
 * BELLA EOS MARKETPLACE: Asset Installer & Rollback Engine
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Pipeline: Install ➔ Validate ➔ Activate ➔ Execute ➔ Suspend ➔ Upgrade ➔ Rollback ➔ Remove.
 */

import { AssetRuntime, BaseAsset } from '@/core/assets/asset-runtime';
import { AssetManifest } from '@/types/asset';
import { DependencyResolver } from './dependency-resolver';
import { LicensePolicyGovernor } from './license-policy';

export class AssetInstaller {
  private static instance: AssetInstaller;
  private assetRuntime: AssetRuntime;
  private resolver: DependencyResolver;
  private licenseGovernor: LicensePolicyGovernor;

  private constructor() {
    this.assetRuntime = AssetRuntime.getInstance();
    this.resolver = DependencyResolver.getInstance();
    this.licenseGovernor = LicensePolicyGovernor.getInstance();
  }

  public static getInstance(): AssetInstaller {
    if (!AssetInstaller.instance) {
      AssetInstaller.instance = new AssetInstaller();
    }
    return AssetInstaller.instance;
  }

  public async installAssetPack(manifest: AssetManifest, payload: any, tenantId: string): Promise<{ success: boolean; message: string }> {
    // 1. Verify License
    const licResult = this.licenseGovernor.verifyLicense(manifest, tenantId);
    if (!licResult.valid) {
      return { success: false, message: `License Error: ${licResult.reason}` };
    }

    // 2. Resolve Dependencies
    const depResult = this.resolver.resolveDependencies(manifest, []);
    if (!depResult.compatible) {
      return { success: false, message: `Missing dependencies: ${depResult.missingDependencies.join(', ')}` };
    }

    // 3. Register and Install into Asset Runtime
    const asset = new BaseAsset(manifest, payload);
    const installed = await this.assetRuntime.registerAndInstall(asset, tenantId);

    return {
      success: installed,
      message: installed ? `Successfully installed ${manifest.name}@${manifest.version}` : `Failed to install asset package`,
    };
  }
}
