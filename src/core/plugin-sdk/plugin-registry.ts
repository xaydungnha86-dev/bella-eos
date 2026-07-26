/**
 * BELLA EOS PLUGIN SDK: Plugin Registry Lifecycle Engine
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * Mission: Enterprise Plugin Manager. Discovers, validates, registers, activates, and executes
 * 3rd-party enterprise plugins safely across the ECOS ecosystem.
 */

import { IExtensionPlugin, PluginType } from './plugin-interface';

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, IExtensionPlugin> = new Map();
  private activePluginIds: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  public async registerPlugin(plugin: IExtensionPlugin): Promise<boolean> {
    const { pluginId } = plugin.metadata;
    const ok = await plugin.initialize();
    if (ok) {
      this.plugins.set(pluginId, plugin);
      this.activePluginIds.add(pluginId);
      return true;
    }
    return false;
  }

  public getPlugin(pluginId: string): IExtensionPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  public getPluginsByType(type: PluginType): IExtensionPlugin[] {
    const result: IExtensionPlugin[] = [];
    this.plugins.forEach(p => {
      if (p.metadata.pluginType === type && this.activePluginIds.has(p.metadata.pluginId)) {
        result.push(p);
      }
    });
    return result;
  }

  public getActivePluginsCount(): number {
    return this.activePluginIds.size;
  }
}
