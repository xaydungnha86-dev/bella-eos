/**
 * BELLA EOS PLUGIN SDK: Extension Plugin Interface Specification
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * Defines 3rd-party Enterprise Extension Plugins allowing external developers & ecosystem partners
 * to extend Bella EOS without mutating Core Frozen Kernel code.
 */

export type PluginType = 
  | 'RUNTIME' 
  | 'SKILL' 
  | 'DNA' 
  | 'WORKFLOW' 
  | 'CONNECTOR' 
  | 'MIR' 
  | 'AI_MODEL' 
  | 'WIDGET';

export interface PluginMetadata {
  pluginId: string;
  pluginName: string;
  version: string;
  author: string;
  description: string;
  pluginType: PluginType;
  minEcosVersion: string;
}

export interface IExtensionPlugin {
  metadata: PluginMetadata;
  initialize(): Promise<boolean>;
  execute(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  shutdown(): Promise<boolean>;
}
