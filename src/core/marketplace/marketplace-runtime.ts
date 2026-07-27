export interface IPackageManifest {
  packageId: string;
  version: string;
  dependencies: Record<string, string>;
  publisherSignature: string;
  compatibilityVersion: string;
}

export class MarketplaceRuntime {
  private static instance: MarketplaceRuntime;
  private registry: Map<string, IPackageManifest> = new Map();

  private constructor() {
    this.seedPacks();
  }

  public static getInstance(): MarketplaceRuntime {
    if (!MarketplaceRuntime.instance) {
      MarketplaceRuntime.instance = new MarketplaceRuntime();
    }
    return MarketplaceRuntime.instance;
  }

  private seedPacks(): void {
    this.registry.set('pack-spa-dna', {
      packageId: 'pack-spa-dna',
      version: '2.1.0',
      dependencies: { 'core-kernel': '>=18.0.0' },
      publisherSignature: 'sig-bella-official-sha256-938b8',
      compatibilityVersion: 'v21.0'
    });
  }

  public installPackage(manifest: IPackageManifest): boolean {
    this.registry.set(manifest.packageId, manifest);
    return true;
  }

  public getPackage(packageId: string): IPackageManifest | undefined {
    return this.registry.get(packageId);
  }
}
