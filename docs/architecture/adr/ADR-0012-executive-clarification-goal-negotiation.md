# ADR-0012: 12-Tier Decoupled Enterprise Cognitive Operating System (E-COS) Architecture

* **Status**: Approved & Frozen (Stage 3 Architecture Constitution)
* **Date**: 2026-07-29
* **Author**: Enterprise Architecture Board

## Context
In Giai đoạn 2 (EIR & PLR v3.1), the system takes raw CEO intents and parses them immediately into budget, timeline, and growth metrics (Goal Parsing). This creates three major limitations:
1. **Lack of Challenge**: The system accepts unrealistic or impossible CEO goals (e.g., "Increase revenue 40% in 1 week with $100 budget") and runs full, expensive reasoning/simulation loops only to fail convergence, rather than challenging the assumptions immediately.
2. **Missing Corporate Health Perspective**: The reasoning engine focuses on sparse campaign constraint inputs instead of a holistic view of the company's organizational health.
3. **No Target Negotiation**: The system accepts targets without presenting alternative target curves based on feasibility and proposing optimal adjustments.

Additionally, as we evolve towards a full Enterprise Cognitive Operating System, we must avoid the anti-pattern of "runtime bloat" (i.e., turning every algorithm or forecasting service into an independent runtime). Only modules that manage persistent state, have distinct lifecycles, and require runtime orchestration should be defined as Runtimes. Other stateless reasoning engines must be implemented as Platform Capabilities.

## Decision
We establish a **Decoupled 12-Tier Cognitive Architecture** for Bella EOS (Stage 3). The coordination between these components is governed via a **Logic-Level Coordination Mesh** (Capability Mesh) where runtimes interact dynamically via message schemas, avoiding hardcoded pipelines without mimicking heavy network service meshes.

---

### 1. Unified 12-Tier Enterprise Cognitive Architecture (E-COS v3.5)

```
                       [ CEO Intent (Raw Input) ]
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 1: Executive Cognitive Layer (C-Level Interaction Graph)            │
│  ├─ 1. Executive Context Builder: Compiles CRM, ERP, and Market context  │
│  ├─ 2. Executive Clarification Engine: Clarifies assumptions             │
│  ├─ 3. Decision Frontier Orchestrator: Composite runner drawing curve    │
│  ├─ 4. Executive Negotiation Engine: Runs dynamic debate & negotiate     │
│  ├─ 5. Executive Approval Gate: CEO signs off negotiated target         │
│  ├─ 6. Executive Stage Graph: DAG orchestrator allowing feedback loops   │
│  └─ 7. Executive Reasoning Runtime (EIR): Generates Strategy Blueprint   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 2: Enterprise Cognitive Foundation Layer                           │
│  ├─ Enterprise Semantic Model: Maps unified business meanings (Revenue) │
│  ├─ Knowledge Graph & Ontology  ├─ Decision Memory (Rationale/Trace)    │
│  ├─ Semantic Search & Vector    ├─ Capability Registry (Discovery)      │
│  ├─ Context Assembly Engine     └─ Enterprise Capability Platform (Life)│
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 3: Decision Intelligence Capabilities Layer (Stateless Services)    │
│  ├─ Enterprise Digital Twin Simulation                                  │
│  ├─ Enterprise Diagnosis Service ├─ Forecast Service                   │
│  ├─ Monte Carlo Sim Service      ├─ Economic Optimization Service       │
│  └─ Risk & Sensitivity Service   └─ Scenario Ranking Service            │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 4: Enterprise State, Portfolio, IAM & Policy Layer (Governance)    │
│  ├─ Enterprise State Runtime: Snapshot of business, resource, human,   │
│  │                            goal, and execution states                │
│  ├─ Goal & Portfolio Runtime: Manages goals, projects, and programs     │
│  ├─ Policy Runtime: Active enforcement of rules and permission caps     │
│  ├─ Organization Runtime: Maps org structure (CEO ➔ COO ➔ Worker)       │
│  └─ Enterprise IAM Runtime: Auth, secrets, delegation, AI/Human tokens  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 5: Domain Operating Systems (Strategic Domain Thinking)            │
│  ├─ Marketing OS: Transposes strategy to Campaign brief                 │
│  ├─ Sales OS: Transposes strategy to Pipeline brief                     │
│  └─ Finance OS, HR OS, CS OS, Legal OS, Supply Chain OS...              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 6: Domain Planning & Composition Layer (Tactical Planners)         │
│  ├─ Domain Planners: Campaign Planner, Sales Planner, Payroll Planner   │
│  └─ Composition Runtime: Merges/caches Tactical Plans ➔ Exec Plans      │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 7: Business Operations Runtimes (Content & Deliverable Factories)   │
│  ├─ Campaign Engine  ├─ Content Engine (Multi-Agent Creative Factory)   │
│  └─ Sales Engine     └─ Payroll Engine, Inventory Engine...             │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 8: Workflow & Event Runtime (Execution Coordination Engine)        │
│  └─ Task Graph Builder, Dependency Resolver, Saga Transaction Engine    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 9: Resource Runtime (Platform Resource Allocation)                 │
│  └─ Dynamic Allocation (GPU, LLM Credits, Humans, API limits, Database) │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 10: Execution Gateway (Unified Execution Workforce Routing)        │
│  └─ Routing to AI Workers, Human Workers (EWOS), Robots, external APIs  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 11: Observation & Distillation Layer                               │
│  ├─ Observation Runtime: Telemetry, metrics, and KPI drift tracing      │
│  ├─ Knowledge Distillation Runtime: Heavy log synthesis & fact extraction│
│  └─ Audit Runtime: Immutable Decision Chain ledger (Who did what)        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 12: Learning & Evolution Runtime (Recursive Improvement Loops)    │
│  └─ Four independent learning pipelines:                                │
│     ├─ Knowledge Learning  ├─ Policy Learning                           │
│     └─ Model Learning      └─ Capability Learning                       │
└─────────────────────────────────────────────────────────────────────────┘
```

#### ─── Cross-Cutting Infrastructure & Governance ───────────────────────────
- **Enterprise Event Bus**: Decoupled messaging across the entire system (`CustomerCreated`, `CampaignFinished`, `InvoicePaid`, `BudgetChanged`).
- **Capability Mesh Routing**: Resolves logic coordination, routing, and schema verification among the active runtimes.
- **Contract Layer**: Standardizes interfaces (`GoalContract`, `StateContract`, `CapabilityContract`, `WorkflowContract`, `ExecutionContract`, `PolicyContract`, `ObservationContract`) representing the system's runtime API contracts.
- **Runtime Supervisor**: System control plane (Kubernetes-like Controller) orchestrating lifecycle, dependencies, health, scaling, crash recovery, canary rollouts, and auto-healing.
─────────────────────────────────────────────────────────────────────────────

---

### 2. Component Specifications

#### 1. Executive Stage Graph
The executive layer operates as a DAG of cognitive stages (Context Builder ➔ Clarification ➔ Decision Frontier ➔ Negotiation ➔ Approval), allowing loopbacks. E.g., if target negotiation yields feedback, the system loops back to the clarification engine to adjust assumptions.

#### 2. Decision Frontier Orchestrator
Coordinates the stateless `Forecast`, `Simulation`, `Risk`, and `Ranking` services (Tier 3) to compile decision trade-off curves, returning standard `DecisionFrontier` outputs.

#### 3. Enterprise State Runtime
Aggregates and isolates status across 6 sub-states: Business State (finance, metrics), Runtime State (running engines), Resource State (allocation levels), Human State (EWOS workforce logs), Goal State (drift, milestones), and Execution State (active task graphs).

#### 4. Enterprise Capability Platform
Separated from the core metadata lookup:
- **Capability Registry (Tier 2)**: Registry database for live lookup and discovery.
- **Enterprise Capability Platform (Tier 2)**: Decoupled developer-facing layer for SDK distribution, billing models, licenses, and certification pipelines.

#### 5. Execution Gateway
Replaces the static Worker Runtime. It provides unified routing to heterogeneous executors (Humans via EWOS, AI Agents, hardware Robots, Cloud Functions, external APIs, SaaS connections, and MCP tools).

#### 6. Runtime Supervisor
Manages startup order, dependency trees, leader elections, hot reloads, rolling upgrades, canary rollouts, resource quotas, and crash auto-healing.

---

### 3. Next Steps: Foundational Specifications
Prior to final freeze, the following four specifications must be drafted to solidify E-COS core interfaces:
1. **ADR-0013: Runtime Contract Specification**: Standardizes Runtime I/O, Event contracts, Error contracts, Lifecycle API, and Health APIs.
2. **ADR-0014: Enterprise Canonical Data Model**: Details schemas for `Goal`, `State`, `Task`, `Resource`, `Capability`, `Worker`, `Evidence`, and `Decision`.
3. **ADR-0015: Capability SDK Specification**: Standardizes capability registration, versioning, dependency resolution, permissions, and compatibility checks.
4. **ADR-0016: Execution Semantics**: Details behavior for synchronous vs. asynchronous execution, idempotency, retry mechanisms, Saga compensation, timeouts, task priority, and cancellations.
