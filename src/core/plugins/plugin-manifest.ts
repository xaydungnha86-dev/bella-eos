/**
 * Plugin Manifest Schema (v1)
 * Enforces version compatibility and capability registration for third-party extensions.
 */

export interface PluginManifestV1 {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  lifecycle: 'Draft' | 'Experimental' | 'Stable' | 'Deprecated';
  requires: {
    eosVersion: string;         // e.g. ">=1.0.0"
    contracts: string[];        // e.g. ["ContextContractV1", "ToolExecutionContractV1"]
    capabilities: string[];     // e.g. ["cap_marketing", "cap_content_writing"]
  };
  providedCapabilities: {
    id: string;
    name: string;
    category: string;
    version: string;
  }[];
  entrypoint: string;
}

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins = new Map<string, PluginManifestV1>();

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  public registerPlugin(manifest: PluginManifestV1): { success: boolean; reason?: string } {
    if (this.plugins.has(manifest.id)) {
      return { success: false, reason: `Plugin ID "${manifest.id}" already registered.` };
    }
    this.plugins.set(manifest.id, manifest);
    console.log(`🔌 [PluginRegistry] Registered plugin: "${manifest.name}" (v${manifest.version})`);
    return { success: true };
  }

  public getPlugin(id: string): PluginManifestV1 | undefined {
    return this.plugins.get(id);
  }

  public getAllPlugins(): PluginManifestV1[] {
    return Array.from(this.plugins.values());
  }
}
