# ADR-0013: Runtime Contract Specification

* **Status**: Draft
* **Date**: 2026-07-29
* **Author**: Enterprise Architecture Board

## Context
With the adoption of the 12-tier decoupled E-COS architecture (ADR-0012), communication across runtimes is managed via a Logic-Level Coordination Mesh rather than tight code imports. To ensure platform resilience, enable hot-reloading/rolling upgrades, and support auto-healing by the Runtime Supervisor, we must enforce a contract-first architecture. 

This specification standardizes the payload schemas, event definitions, error structures, and control-plane APIs (Lifecycle & Health) that all E-COS core runtimes must implement.

## Decision
All runtimes operating within E-COS must implement the standard contract specifications detailed below.

```
                  ┌─────────────────────────────────┐
                  │        Runtime Supervisor       │
                  └────────┬────────────────┬───────┘
                           │                │
            [Lifecycle API]│                │[Health API]
                           ▼                ▼
                  ┌─────────────────────────────────┐
                  │       Core E-COS Runtime        │
                  │  (e.g., Marketing OS, Goal RT)  │
                  └────────┬────────────────▲───────┘
                           │                │
            [RuntimeOutput]│                │[RuntimeInput]
                           ▼                │
                     (Event Bus) ───────────┘
                    [RuntimeEvent]
```

### 1. Runtime Input and Output Contracts
Every runtime operation is parameterized by a type-safe input wrapper and returns a structured output wrapper:

```typescript
export interface RuntimeInput<T = any> {
  correlationId: string;    // Distributed tracing traceId
  timestamp: string;
  principalId: string;      // IAM Identity requesting execution
  sessionContext?: {
    sessionId: string;
    stageId: string;
  };
  payload: T;
}

export interface RuntimeOutput<T = any> {
  correlationId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  payload: T | null;
  error?: RuntimeError;
}
```

### 2. Runtime Event Contract
Communication across the Enterprise Event Bus is standardized via the `RuntimeEvent` schema:

```typescript
export interface RuntimeEvent<T = any> {
  eventId: string;          // UUID v4
  correlationId: string;
  name: string;             // e.g., "marketing.campaign.finished"
  source: string;           // E.g., "runtimes.marketing-os"
  timestamp: string;
  version: string;          // Event schema version
  payload: T;
}
```

### 3. Runtime Error Contract
To support self-healing and recovery paths, errors must contain severity, recovery recommendations, and retry parameters:

```typescript
export interface RuntimeError {
  code: string;             // Standardized alphanumeric code, e.g. "ERR_LIMIT_EXCEEDED"
  message: string;
  severity: 'low' | 'medium' | 'high' | 'fatal';
  isRetryable: boolean;
  recoveryStage?: string;   // Recommended stage ID to loop back to
  details?: Record<string, any>;
}
```

### 4. Runtime Lifecycle Control API
Every runtime registered in the E-COS must expose a lifecycle hook API, allowing the **Runtime Supervisor** to coordinate deployments and status shifts:

```typescript
export interface RuntimeLifecycle {
  /**
   * Initializes dependencies and configurations without starting execution loops.
   */
  init(config: Record<string, any>): Promise<void>;

  /**
   * Starts active polling, event subscriptions, or loops.
   */
  start(): Promise<void>;

  /**
   * Temporarily pauses event processing, queueing incoming requests.
   */
  pause(): Promise<void>;

  /**
   * Stop processing, unsubscribe from event buses, and prepare for teardown.
   */
  stop(): Promise<void>;

  /**
   * Performs inline hot reload/upgrade of runtime logic.
   */
  upgrade(newVersion: string, migrations?: any): Promise<void>;

  /**
   * Restores runtime configuration and logic state to a previous version.
   */
  rollback(targetVersion: string): Promise<void>;
}
```

### 5. Runtime Health Control API
For orchestration monitoring, status checks, and self-healing:

```typescript
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;           // seconds
  activeTasks: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  dependencies: {
    id: string;
    status: 'up' | 'down';
  }[];
}

export interface RuntimeHealth {
  /**
   * Returns a detailed status snapshot for health checks.
   */
  checkHealth(): Promise<HealthStatus>;

  /**
   * Retrieves operational metrics (SLA durations, success rates) for Telemetry.
   */
  getMetrics(): Promise<Record<string, number>>;
}
```

## Consequences
- **Type-Safety across Runtimes**: Standardizing inputs, outputs, and event schemas ensures compile-time checkability and decoupling of internal runtime logic.
- **Autonomous Recovery**: Standardizing `RuntimeError` and `RuntimeLifecycle` enables the Runtime Supervisor to automatically execute loops back, rollbacks, and hot reloads upon failure.
- **Traceability**: Compulsory `correlationId` fields across I/O and events guarantee complete end-to-end trace mapping inside the Audit Runtime ledger.
