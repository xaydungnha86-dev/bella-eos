# 🔌 ECOS Plugin Development Guide (L2 Maturity)

This guide documents how to develop, validate, register, and execute external extension plugins on the **Bella ECOS (Enterprise Cognitive Operating System)** platform without mutating the frozen core kernel.

---

## 1. Plugin Interface Structure

All ECOS plugins must implement the `IExtensionPlugin` interface defined in `src/core/plugin-sdk/plugin-interface.ts`:

```typescript
export interface PluginMetadata {
  pluginId: string;
  pluginName: string;
  version: string;
  author: string;
  description: string;
  pluginType: PluginType;     // 'RUNTIME' | 'SKILL' | 'DNA' | 'WORKFLOW' | 'CONNECTOR' | 'WIDGET' | etc.
  minEcosVersion: string;     // Must start with 'v2' to pass compatibility validation
  capabilities?: string[];    // Array of capability keys supported by this plugin
  permissions?: string[];     // Array of ECOS permissions requested by this plugin
}

export interface IExtensionPlugin {
  metadata: PluginMetadata;
  initialize(): Promise<boolean>;
  execute(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  shutdown(): Promise<boolean>;
}
```

---

## 2. Plugin Lifecycle States

The ECOS Core manages plugin bindings through a simplified, reliable state machine:

```
      [registerPlugin()]
              │
              ▼
        REGISTERED
              │
      (runs initialize())
        ┌─────┴─────┐
        ▼           ▼
      READY       ERROR (Init failure)
        │
   [Teardown]
        ▼
     STOPPED
```

* **REGISTERED**: The plugin is registered in the store and waiting to be initialized.
* **READY**: The plugin has successfully initialized and is available to handle execution requests.
* **DISABLED**: The plugin is temporarily deactivated. It will be skipped during capability routing.
* **ERROR**: The plugin failed initialization or structure checks.
* **STOPPED**: The plugin has been shut down gracefully and unregistered.

---

## 3. Capability-Driven Routing & O(1) Lookup

ECOS Core leverages a decoupled execution model: consumers invoke **capabilities** instead of hardcoded plugins.

1. **Capability Bindings**: At registration time, the `PluginRegistry` reads the capabilities from the metadata and binds them in the `CapabilityRegistry`.
2. **Priority Ordering**: Multiple plugins can register for the same capability. The index maintains them in a descending order based on `priority` (default = 100).
3. **Execution Routing**:
   ```typescript
   const registry = PluginRegistry.getInstance();
   const result = await registry.executeCapability('software-development', {
     prompt: 'Analyze memory leak'
   });
   ```
4. **Resilient Failover**: If the highest priority plugin fails during execution (throws an error or times out), the registry catches it, logs the error, and automatically fails over to try the next highest priority `READY` plugin in the capability binding chain.

---

## 4. Sandbox Security & Validation Constraints

To protect the integrity of the ECOS Kernel:
* **Validation Check**: Plugins are inspected before registration. Invalid `minEcosVersion` or requests for undeclared/invalid permissions (verified via `PermissionRegistry`) will fail validation.
* **Timeout Protection**: Every capability execution is run within a sandbox timeout (default = 5 seconds) using a `Promise.race` wrapper.
* **Try/Catch Wrapping**: Exceptions thrown during plugin runtime execution are isolated. They fail over to the next candidate plugin instead of crashing the core.
* **Error Isolation**: Transient execution errors (timeouts or input exceptions) do **NOT** modify the plugin's status to `ERROR` — preserving its state for subsequent requests. Only registration/initialization failure marks it as `ERROR`.

---

## 5. Sample Implementation

Refer to the boilerplate code template located at [boilerplate-plugin.ts](file:///d:/Antigravity/Projects/DN%20WORKFLOW/src/core/plugin-sdk/templates/boilerplate-plugin.ts) to jumpstart your plugin implementation.
