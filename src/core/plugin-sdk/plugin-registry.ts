/**
 * BELLA EOS PLUGIN SDK: Plugin Registry Lifecycle Engine (L2 Maturity)
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * Upgraded to Level 2 (Functional Runtime) with:
 *   - IPluginStore Persistence Abstraction
 *   - PermissionRegistry dynamic validation
 *   - CapabilityRegistry O(1) map lookup with pre-sorted bindings (O(k) traversal)
 *   - Plugin Lifecycle states (REGISTERED, READY, DISABLED, ERROR, STOPPED)
 *   - Strict single initialization on registration
 *   - Safe try/catch sandboxing with execution timeout & failover routing
 *   - Simple RuntimeMetrics logging
 */

import { IExtensionPlugin, PluginType } from './plugin-interface';
import { RuntimeMetrics, createMetric } from '@/types/runtime-metrics';

const RUNTIME_NAME = 'PluginRegistry';

// ─────────────────────────────────────────────
// 1. Plugin Lifecycle States & Bindings
// ─────────────────────────────────────────────

export type PluginState = 'REGISTERED' | 'READY' | 'DISABLED' | 'ERROR' | 'STOPPED';

export interface PluginBinding {
  plugin: IExtensionPlugin;
  state: PluginState;
  priority: number;
}

// ─────────────────────────────────────────────
// 2. Persistence Abstraction — IPluginStore
// ─────────────────────────────────────────────

export interface IPluginStore {
  savePluginBinding(binding: PluginBinding): void;
  getPluginBinding(pluginId: string): PluginBinding | undefined;
  deletePluginBinding(pluginId: string): boolean;
  getAllPluginBindings(): PluginBinding[];
}

export class InMemoryPluginStore implements IPluginStore {
  private bindings: Map<string, PluginBinding> = new Map();

  savePluginBinding(binding: PluginBinding): void {
    this.bindings.set(binding.plugin.metadata.pluginId, binding);
  }

  getPluginBinding(pluginId: string): PluginBinding | undefined {
    return this.bindings.get(pluginId);
  }

  deletePluginBinding(pluginId: string): boolean {
    return this.bindings.delete(pluginId);
  }

  getAllPluginBindings(): PluginBinding[] {
    return Array.from(this.bindings.values());
  }
}

// ─────────────────────────────────────────────
// 3. PermissionRegistry (Decoupled & Dynamic)
// ─────────────────────────────────────────────

export class PermissionRegistry {
  private static allowedPermissions: Set<string> = new Set([
    'READ_FABRIC',
    'WRITE_FABRIC',
    'EXECUTE_AGENT',
    'USE_MEMORY',
    'CALL_LLM',
    'READ_CUSTOMER',
    'READ_FINANCE',
    'EXECUTE_WORKFLOW'
  ]);

  public static isValid(permission: string): boolean {
    return this.allowedPermissions.has(permission);
  }

  public static registerPermission(permission: string): void {
    this.allowedPermissions.add(permission);
  }

  public static clear(): void {
    this.allowedPermissions.clear();
    // Re-seed default values
    const defaults = [
      'READ_FABRIC', 'WRITE_FABRIC', 'EXECUTE_AGENT', 'USE_MEMORY',
      'CALL_LLM', 'READ_CUSTOMER', 'READ_FINANCE', 'EXECUTE_WORKFLOW'
    ];
    defaults.forEach(p => this.allowedPermissions.add(p));
  }
}

// ─────────────────────────────────────────────
// 4. CapabilityRegistry (Pre-sorted bindings index)
// ─────────────────────────────────────────────

export interface CapabilityBinding {
  pluginId: string;
  priority: number;
}

export class CapabilityRegistry {
  private static index: Map<string, CapabilityBinding[]> = new Map();

  public static register(capability: string, pluginId: string, priority: number): void {
    let list = this.index.get(capability);
    if (!list) {
      list = [];
      this.index.set(capability, list);
    }
    // Remove existing binding for the same pluginId if any
    list = list.filter(b => b.pluginId !== pluginId);
    list.push({ pluginId, priority });
    // Sort descending by priority
    list.sort((a, b) => b.priority - a.priority);
    this.index.set(capability, list);
  }

  public static lookup(capability: string): CapabilityBinding[] {
    return this.index.get(capability) ?? [];
  }

  public static unregisterPlugin(pluginId: string): void {
    for (const [capability, list] of this.index.entries()) {
      const filtered = list.filter(b => b.pluginId !== pluginId);
      if (filtered.length === 0) {
        this.index.delete(capability);
      } else {
        this.index.set(capability, filtered);
      }
    }
  }

  public static clear(): void {
    this.index.clear();
  }
}

// ─────────────────────────────────────────────
// 5. PluginRegistry — Public L2 API
// ─────────────────────────────────────────────

export class PluginRegistry {
  private static instance: PluginRegistry;
  private store: IPluginStore;
  private metricsLog: RuntimeMetrics[] = [];

  private constructor(store?: IPluginStore) {
    this.store = store ?? new InMemoryPluginStore();
  }

  public static getInstance(store?: IPluginStore): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry(store);
    }
    return PluginRegistry.instance;
  }

  /** @internal — for testing only */
  public static resetInstance(): void {
    (PluginRegistry as any).instance = undefined;
    CapabilityRegistry.clear();
    PermissionRegistry.clear();
  }

  // ── Metrics helpers ──

  private measure<T>(operation: string, fn: () => T): T {
    const startedAt = Date.now();
    let success = true;
    let errorCode: string | undefined;
    let result: T;
    try {
      result = fn();
    } catch (err: any) {
      success = false;
      errorCode = err?.message ?? 'UNKNOWN_ERROR';
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success, errorCode));
      throw err;
    }
    this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success));
    return result!;
  }

  private async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    let success = true;
    let errorCode: string | undefined;
    try {
      const result = await fn();
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success));
      return result;
    } catch (err: any) {
      success = false;
      errorCode = err?.message ?? 'UNKNOWN_ERROR';
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success, errorCode));
      throw err;
    }
  }

  public getMetrics(): RuntimeMetrics[] {
    return [...this.metricsLog];
  }

  public clearMetrics(): void {
    this.metricsLog = [];
  }

  // ── Core API ──

  /**
   * validate(plugin) — Structural and security checks.
   */
  public validate(plugin: IExtensionPlugin): boolean {
    return this.measure('validate', () => {
      if (!plugin || !plugin.metadata) return false;
      const { pluginId, pluginName, version, pluginType, minEcosVersion, permissions } = plugin.metadata;

      // 1. Structural check
      if (!pluginId || !pluginName || !version || !pluginType || !minEcosVersion) {
        return false;
      }
      if (
        typeof plugin.initialize !== 'function' ||
        typeof plugin.execute !== 'function' ||
        typeof plugin.shutdown !== 'function'
      ) {
        return false;
      }

      // 2. Version check (minEcosVersion must be compatible — e.g. starts with 'v2')
      if (!minEcosVersion.startsWith('v2')) {
        return false;
      }

      // 3. Permission audit
      if (permissions && Array.isArray(permissions)) {
        for (const p of permissions) {
          if (!PermissionRegistry.isValid(p)) {
            return false; // Violates safety policy
          }
        }
      }

      return true;
    });
  }

  /**
   * registerPlugin() — Checks, registers, and initializes a plugin.
   * Runs initialize() exactly once.
   */
  public async registerPlugin(plugin: IExtensionPlugin, priority = 100): Promise<boolean> {
    return this.measureAsync('registerPlugin', async () => {
      if (!plugin) throw new Error('registerPlugin: plugin is required');
      const { pluginId, capabilities } = plugin.metadata;

      const isValid = this.validate(plugin);
      if (!isValid) {
        const binding: PluginBinding = { plugin, state: 'ERROR', priority };
        this.store.savePluginBinding(binding);
        return false;
      }

      const binding: PluginBinding = { plugin, state: 'REGISTERED', priority };
      this.store.savePluginBinding(binding);

      // Initialize EXACTLY once during registration
      try {
        const ok = await plugin.initialize();
        if (ok) {
          binding.state = 'READY';
          this.store.savePluginBinding(binding);

          // Register capabilities to index
          if (capabilities && Array.isArray(capabilities)) {
            for (const cap of capabilities) {
              CapabilityRegistry.register(cap, pluginId, priority);
            }
          }
          return true;
        } else {
          binding.state = 'ERROR';
          this.store.savePluginBinding(binding);
          return false;
        }
      } catch (err) {
        binding.state = 'ERROR';
        this.store.savePluginBinding(binding);
        throw err;
      }
    });
  }

  /**
   * unregisterPlugin() — Shutdowns and unmaps a plugin.
   */
  public async unregisterPlugin(pluginId: string): Promise<boolean> {
    return this.measureAsync('unregisterPlugin', async () => {
      if (!pluginId) throw new Error('unregisterPlugin: pluginId is required');
      const binding = this.store.getPluginBinding(pluginId);
      if (!binding) return false;

      try {
        await binding.plugin.shutdown();
      } catch (e) {
        // Log shutdown error but proceed to unregister
      }

      binding.state = 'STOPPED';
      this.store.deletePluginBinding(pluginId);
      CapabilityRegistry.unregisterPlugin(pluginId);
      return true;
    });
  }

  /**
   * executeCapability() — Routes dynamically to the highest-priority READY plugin.
   * Failover handles executing next available if best fails (without setting plugin to ERROR).
   */
  public async executeCapability(
    capability: string,
    input: Record<string, unknown>,
    options?: { timeoutMs?: number }
  ): Promise<Record<string, unknown>> {
    return this.measureAsync('executeCapability', async () => {
      if (!capability) throw new Error('executeCapability: capability is required');

      // Tra cứu pre-sorted bindings O(1)
      const bindings = CapabilityRegistry.lookup(capability);
      if (bindings.length === 0) {
        throw new Error(`executeCapability: no plugins registered for capability "${capability}"`);
      }

      const errors: Error[] = [];

      // O(k) traversal for routing and failover
      for (const binding of bindings) {
        const pluginBinding = this.store.getPluginBinding(binding.pluginId);
        if (!pluginBinding || pluginBinding.state !== 'READY') {
          continue; // skip disabled, stopped or broken plugins
        }

        try {
          const timeoutMs = options?.timeoutMs ?? 5000; // Default 5s sandbox timeout

          // Promise.race for runtime sandbox timeout protection
          const result = await Promise.race([
            pluginBinding.plugin.execute(input),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Execution timeout of ${timeoutMs}ms exceeded`)), timeoutMs)
            )
          ]);

          return result;
        } catch (err: any) {
          // Execution failure (timeout or business logic err) does NOT change state to ERROR.
          // It only logs the error and triggers failover to the next candidate plugin.
          errors.push(new Error(`Plugin "${binding.pluginId}" failed: ${err.message}`));
        }
      }

      throw new Error(
        `executeCapability: all plugins offering "${capability}" failed execution. Errors: [${errors.map(e => e.message).join('; ')}]`
      );
    });
  }

  // ── Accessors ──

  public getPlugin(pluginId: string): IExtensionPlugin | undefined {
    return this.measure('getPlugin', () => {
      if (!pluginId) throw new Error('getPlugin: pluginId is required');
      return this.store.getPluginBinding(pluginId)?.plugin;
    });
  }

  public getPluginBinding(pluginId: string): PluginBinding | undefined {
    return this.measure('getPluginBinding', () => {
      if (!pluginId) throw new Error('getPluginBinding: pluginId is required');
      return this.store.getPluginBinding(pluginId);
    });
  }

  public getPluginsByType(type: PluginType): IExtensionPlugin[] {
    return this.measure('getPluginsByType', () => {
      return this.store
        .getAllPluginBindings()
        .filter(b => b.plugin.metadata.pluginType === type)
        .map(b => b.plugin);
    });
  }

  public getActivePluginsCount(): number {
    return this.measure('getActivePluginsCount', () => {
      return this.store.getAllPluginBindings().filter(b => b.state === 'READY').length;
    });
  }

  public togglePluginState(pluginId: string, state: PluginState): boolean {
    return this.measure('togglePluginState', () => {
      if (!pluginId) throw new Error('togglePluginState: pluginId is required');
      const binding = this.store.getPluginBinding(pluginId);
      if (!binding) return false;
      binding.state = state;
      this.store.savePluginBinding(binding);
      return true;
    });
  }
}
