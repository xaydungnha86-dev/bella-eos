# ADR-0015: Capability SDK Specification

* **Status**: Draft
* **Date**: 2026-07-29
* **Author**: Enterprise Architecture Board

## Context
In E-COS, "Capabilities" represent stateless compute engines (e.g., Forecast Engine, Simulation Engine, Diagnosis Capability) that are consumed by stateful runtimes. To enable developers to write modular, reusable capabilities and to allow hot-swapping/A/B rollout of engines without system restarts, we require a standardized **Capability SDK**. 

This specification defines the registry protocol, capability descriptor schemas, dynamic loading hooks, and execution sandbox permissions.

## Decision
All capability plugins written for E-COS must utilize the Capability SDK and implement the interfaces specified below.

```
       ┌───────────────────────────────────────────────────┐
       │                 CapabilityRegistry                │
       ├───────────────────────────────────────────────────┤
       │ + register(cap: Capability)                       │
       │ + resolveDependencies(capId: string): boolean     │
       │ + get<T>(capId: string, versionRange: string): T  │
       └─────────────────────────┬─────────────────────────┘
                                 │
                   [Loads]       │       [Validates Descriptor]
                                 ▼
       ┌───────────────────────────────────────────────────┐
       │                Capability SDK Plugin              │
       ├───────────────────────────────────────────────────┤
       │  - Descriptor (metadata, dependencies, security)   │
       │  - onLoad() / onUnload() Hooks                    │
       │  - Stateless Compute Methods                      │
       └───────────────────────────────────────────────────┘
```

### 1. Capability Descriptor Schema
Every capability must include a manifest file (`manifest.json` or inline code configuration) matching the `CapabilityDescriptor` interface:

```typescript
export interface CapabilityDescriptor {
  id: string;               // Unique namespace, e.g., "org.bella.engine.forecast"
  name: string;
  version: string;          // Semantic versioning (SemVer), e.g. "1.2.0"
  description: string;
  author: string;
  dependencies: {
    capabilityId: string;
    versionRange: string;   // SemVer range, e.g., "^1.0.0"
  }[];
  permissions: {
    network: {
      allowedDomains: string[]; // Strict domain allowlist
    };
    fileSystem: {
      readablePaths: string[];  // Sandbox path restrictions
      writablePaths: string[];
    };
    environmentVariables: string[]; // Allowlist of process.env keys
  };
}
```

### 2. Capability Lifecycle Hooks
Capabilities are loaded and unloaded dynamically. They must expose lifecycle hooks to establish connections or flush resources:

```typescript
export interface Capability {
  descriptor: CapabilityDescriptor;

  /**
   * Executed when the capability is registered.
   * Can be used to open connection pools or check platform compatibility.
   */
  onLoad(context: Record<string, any>): Promise<void>;

  /**
   * Executed when the capability is replaced or removed.
   * Must release all file handles, networks, and memory allocations.
   */
  onUnload(): Promise<void>;
}
```

### 3. Capability Registry API
The E-COS Kernel exposes a global registry where capabilities are registered, queried, and verified:

```typescript
export interface CapabilityRegistry {
  /**
   * Registers a capability instance, checking metadata and validation rules.
   */
  register(capability: Capability): Promise<void>;

  /**
   * Retreives a specific capability conforming to SemVer constraints.
   */
  get<T = any>(capabilityId: string, versionRange?: string): Promise<T>;

  /**
   * Verifies if all dependency requirements are met for all loaded capabilities.
   */
  resolveDependencies(capabilityId: string): boolean;

  /**
   * Unregisters a capability, executing its onUnload hook.
   */
  unregister(capabilityId: string, version: string): Promise<void>;
}
```

### 4. Sandbox Execution Wrapper
To guarantee security, the SDK forces execution wrappers that intercept file and network operations, comparing them against the capability's declared permissions:

```typescript
export class CapabilitySandbox {
  static wrap(capability: Capability): Capability {
    // Intercepts global/process variables and network calls,
    // throwing errors if capability violates descriptor permissions.
    return capability;
  }
}
```

## Consequences
- **Dynamic Hot-Swapping**: Standardized load/unload hooks allow the platform to load capabilities on-the-fly and run A/B rollouts.
- **Dependency Resolution**: SemVer resolution prevents runtime crashes caused by incompatible helper dependencies.
- **Zero-Trust Security**: The sandbox wrapper stops malicious or poorly written capability plugins from accessing raw files or making unsolicited network requests.
