/**
 * BELLA EOS ASSETS: Asset Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages Asset Lifecycle & Package Governor (Skills, SOPs, DNA Packs, Connectors).
 */

import { AssetManifest, IAsset } from '@/types/asset';

export class BaseAsset implements IAsset {
  constructor(
    public readonly manifest: AssetManifest,
    public readonly contentPayload: any
  ) {}

  public async validate(): Promise<boolean> {
    return Boolean(this.manifest.id && this.manifest.signature);
  }

  public async install(tenantId: string): Promise<boolean> {
    return true;
  }

  public async uninstall(tenantId: string): Promise<boolean> {
    return true;
  }
}

export class AssetRuntime {
  private static instance: AssetRuntime;
  private installedAssets: Map<string, IAsset> = new Map();

  private constructor() {}

  public static getInstance(): AssetRuntime {
    if (!AssetRuntime.instance) {
      AssetRuntime.instance = new AssetRuntime();
    }
    return AssetRuntime.instance;
  }

  public async registerAndInstall(asset: IAsset, tenantId: string): Promise<boolean> {
    const isValid = await asset.validate();
    if (!isValid) return false;

    const success = await asset.install(tenantId);
    if (success) {
      this.installedAssets.set(asset.manifest.id, asset);
    }
    return success;
  }

  public getAsset(id: string): IAsset | null {
    return this.installedAssets.get(id) || null;
  }

  public listAssets(): IAsset[] {
    return Array.from(this.installedAssets.values());
  }
}
