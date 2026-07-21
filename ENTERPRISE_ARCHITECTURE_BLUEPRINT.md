# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA ENTERPRISE OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `ARCHITECTURE FROZEN` • **SPECIFICATION VERSION**: `v10.0 (FROZEN)`  
> **ENTERPRISE TARGET LIFESPAN**: `2026 - 2046 (20-YEAR ENTERPRISE OPERATING STANDARD)`

---

## 1. EXECUTIVE SUMMARY & TRI-PARTITE ARCHITECTURE

Bella EOS is a frozen **Autonomous Enterprise Operating System (Autonomous EOS)** designed around the **Tri-Partite System Separation**:

```
                       Bella EIP Suite (System of Record + Data Fabric)
                                       │
                                       ▼
                       Bella EOS (System of Orchestration)
                       ├── Business Context Engine (BCE)
                       └── Pluggable Execution Adapters
                                       │
                                       ▼
             Pluggable Execution Runtimes (System of Execution)
         [Hermes • Codex • Claude Code • OpenHands • Custom REST]
```

1. **Bella EIP (System of Record)**: Business Data Fabric (Customer, Invoice, Booking, Financial Ledger, Inventory, HR).
2. **Bella EOS (System of Orchestration)**: Operating Kernel, Enterprise Services, Intent Decomposition, Process Life Cycle, Quality & Evidence, and **Business Context Engine (BCE)**.
3. **Pluggable Execution Runtimes (System of Execution)**: Framework-agnostic execution engines (Hermes, Codex, Claude Code, OpenHands, Custom REST) managed via unified `ExecutionEngineAdapter`.

---

## 2. THE 6 FROZEN ARCHITECTURE GROUPS

```
                                  CEO Intent
                                      │
                                      ▼
                        Enterprise Object Model (EOM)
                                      │
                                      ▼
                         Kernel Services Layer (6 Services)
       ┌──────────────────┬──────────────────┬──────────────────┐
       │ Process Runtime  │ Execution Service│ Resource Service │
       ├──────────────────┼──────────────────┼──────────────────┤
       │  Policy Service  │ Evidence Service │Enterprise Memory │
       │                  │                  │ & Business Context│
       └──────────────────┴──────────────────┴──────────────────┘
                                      │
                                      ▼
                           Bella Micro-Kernel (Pure)
     [Identity • Permission • Transaction • Context • Audit • Event Store]
                                      │
                                      ▼
                     Pluggable Execution Adapters Layer
           [HermesAdapter • CodexAdapter • ClaudeCodeAdapter • OpenHandsAdapter]
                                      │
                                      ▼
                             External Systems Layer
            [Bella EIP • Facebook • YouTube • CRM • SAP • MISA]
```

### Group 1: Bella Micro-Kernel (Pure & Agnostic)
- Strictly contains **6 primitives**:
  1. `Identity`: Universal Identity & Auth Core.
  2. `Permission`: Capability & RBAC Access Matrix.
  3. `Transaction`: ACID Transaction Engine.
  4. `Context`: Global Runtime Execution Context.
  5. `Audit`: Immutable Compliance Audit Ledger.
  6. `Event Store`: Append-Only Event Store.
- *Kernel Rule*: The Micro-Kernel is 100% domain-agnostic. It does not contain AI, Workflow, Scheduler, Marketing, or External API logic.

### Group 2: Enterprise Object Model (EOM)
Unified domain language shared across API, Database, Event Sourcing, and UI:
- **Org & Identity**: `Company`, `Department`, `Role`.
- **Operating**: `Objective`, `Project`, `Process`, `Stage`, `Task`, `Command`.
- **Resource & Security**: `Resource`, `Capability`, `Policy`.
- **Telemetry & Asset**: `Evidence`, `Knowledge`, `Decision`, `Asset`, `Metric`, `Document`, `Event`.

### Group 3: Consolidated Kernel Services (6 Services)
All capabilities are consolidated into **6 Kernel Services**:
1. **Process Runtime**: Consolidates Workflow OS, State Machine (12 states), Process Templates (`v1`, `v2`), Process Instances, Stages, and Tasks.
2. **Execution Service & Pluggable Adapters**: Manages standard `ExecutionEngineAdapter` contract (`execute`, `cancel`, `status`, `retry`, `approve`) for Hermes, Codex, Claude Code, and OpenHands.
3. **Resource Service**: Consolidates Quota Allocation, Budget Locks, AI Token Accounting, API Quotas, License Management, Human & Machine Capacity, and Deadlock Prevention.
4. **Policy Service**: Consolidates Business Rules, Approval Gates, Realtime Guardrails, and Legal Compliance.
5. **Evidence Service**: Consolidates Verification Engine, Cryptographic Evidence, Proof Storage, Replay Engine, VM Snapshots, and Process Recovery.
6. **Enterprise Memory & Business Context Engine (BCE)**:
   - **Business Context Engine (BCE)**: Compiles and embeds multi-dimensional enterprise context into every task payload before dispatching to an execution runtime:
     - `ERP Context` (Stock, Cost Center, Invoices)
     - `CRM Context` (Customer segment, EQE history)
     - `HR & Delegation Context` (Role, Skill SLA)
     - `Financial & KPI Context` (Budget caps, Margin target)
     - `Governance & Policy Context` (Sign-off rules, Legal guardrails)
     - `Decision Lineage` (Historical XAI rationale, past rollback reasons)

### Group 4: Pluggable Execution Adapters Layer
Standard `ExecutionEngineAdapter` interface contract:
```typescript
interface ExecutionEngineAdapter {
    execute(task: Task, context: BusinessContextPackage): Promise<ExecutionResult>;
    cancel(taskId: string): Promise<boolean>;
    status(taskId: string): Promise<TaskStatus>;
    retry(taskId: string): Promise<ExecutionResult>;
    approve(taskId: string, approverRole: string): Promise<boolean>;
}
```
Concrete Adapter Implementations:
- `HermesExecutionAdapter`: Primary operational automation driver.
- `CodexExecutionAdapter`: OpenAI / Codex engine driver.
- `ClaudeCodeExecutionAdapter`: Anthropic Claude Code engine driver.
- `OpenHandsExecutionAdapter`: OpenHands autonomous agent driver.
- `CustomRESTExecutionAdapter`: Third-party enterprise REST/gRPC engine driver.

### Group 5: External Systems
- `Bella EIP Suite`, `Facebook API`, `TikTok API`, `YouTube API`, `Email SMTP`, `CRM`, `SAP`.

### Group 6: Marketplace & Extensions Platform
- `Process Packages` (App Store for enterprise processes like `Marketing v2`, `Sales SOP v4`).
- `Execution Engine Packages` (Pluggable runtime drivers for new AI engines).

---

## 3. REASONING MEMORY & BUSINESS CONTEXT PACKAGE (BCE)

Bella EOS records AI decision rationale in **Reasoning Memory** and attaches complete **Business Context Packages**:
```json
{
  "taskId": "TSK-MKT-008",
  "businessContextPackage": {
    "objective": "Tăng 20% doanh thu tháng 8",
    "erp": { "costCenter": "CC-MKT-2026", "approvedBudgetVnd": 50000000 },
    "crm": { "targetSegment": "VIP Beauty", "minEqeScore": 90 },
    "governance": { "maxAutoBudget": 100000000, "policyId": "POL-NO-NIGHT-POSTING" },
    "historyLineage": ["DEC-98201", "DEC-98204"]
  },
  "executionAdapter": "HermesExecutionAdapter",
  "timestamp": "2026-07-21T09:15:00Z"
}
```

---

## 4. ARCHITECTURE FREEZE DIRECTIVE

By order of Architecture Freeze, **no new engines or layers shall be added**. All future extensions must be implemented as:
1. An extension to one of the 6 Consolidated Kernel Services.
2. A new `ExecutionEngineAdapter` implementation.
3. A Marketplace Process/Connector Package.OL-NO-NIGHT-POSTING",
  "llmModel": "gemini-2.5-flash",
  "toolInvoked": "PublishPostCommand",
  "timestamp": "2026-07-21T09:15:00Z"
}
```

---

## 4. ARCHITECTURE FREEZE DIRECTIVE

By order of Architecture Freeze, **no new engines or layers shall be added**. All future extensions must be implemented as:
1. An extension to one of the 6 Consolidated Kernel Services.
2. A new Executor Driver.
3. A Marketplace Process/Connector Package.
