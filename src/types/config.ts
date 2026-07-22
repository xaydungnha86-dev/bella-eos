/**
 * BELLA EOS PLATFORM CONTRACT: Configuration Management Contract (IConfiguration v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Dynamic platform configuration contract.
 */

export interface ConfigurationItem<T = any> {
  key: string;
  value: T;
  tenantId?: string;
  isEncrypted: boolean;
  updatedAt: string;
}

export interface IConfiguration {
  get<T = any>(key: string, defaultValue?: T): Promise<T>;
  set<T = any>(key: string, value: T, isEncrypted?: boolean): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  list(prefix?: string): Promise<ConfigurationItem[]>;
}
