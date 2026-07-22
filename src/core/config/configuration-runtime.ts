/**
 * BELLA EOS CORE: Configuration Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IConfiguration v1.0.
 */

import { ConfigurationItem, IConfiguration } from '@/types/config';

export class ConfigurationRuntime implements IConfiguration {
  private static instance: ConfigurationRuntime;
  private configMap: Map<string, ConfigurationItem> = new Map();

  private constructor() {}

  public static getInstance(): ConfigurationRuntime {
    if (!ConfigurationRuntime.instance) {
      ConfigurationRuntime.instance = new ConfigurationRuntime();
    }
    return ConfigurationRuntime.instance;
  }

  public async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    const item = this.configMap.get(key);
    if (!item) {
      return (defaultValue !== undefined ? defaultValue : null) as T;
    }
    return item.value as T;
  }

  public async set<T = any>(key: string, value: T, isEncrypted = false): Promise<boolean> {
    this.configMap.set(key, {
      key,
      value,
      isEncrypted,
      updatedAt: new Date().toISOString()
    });
    return true;
  }

  public async delete(key: string): Promise<boolean> {
    return this.configMap.delete(key);
  }

  public async list(prefix?: string): Promise<ConfigurationItem[]> {
    const results: ConfigurationItem[] = [];
    for (const [k, v] of this.configMap.entries()) {
      if (!prefix || k.startsWith(prefix)) {
        results.push(v);
      }
    }
    return results;
  }
}
