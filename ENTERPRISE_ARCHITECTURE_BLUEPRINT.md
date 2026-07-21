# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA ENTERPRISE OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `OPERATIONAL` • **SPECIFICATION VERSION**: `v11.0 (ENTERPRISE INTELLIGENCE LAYER)`  
> **ENTERPRISE TARGET LIFESPAN**: `2026 - 2046 (20-YEAR ENTERPRISE OPERATING STANDARD)`

---

## 1. HỆ SINH THÁI THƯƠNG HIỆU BELLA AI PLATFORM

Hệ sinh thái được định vị theo mô hình thương hiệu nhiều tầng rõ ràng để phát triển bền vững trong 10-20 năm:

```
Bella AI Platform (Thương hiệu hệ sinh thái)
        │
        ├── Bella EOS (Enterprise Operating System - Hệ điều hành Doanh nghiệp)
        │
        ├── Bella EIP (Enterprise Integration Platform / Business Suite - Ứng dụng nghiệp vụ)
        │
        ├── Bella Workers (Lực lượng lao động số AI)
        │
        ├── Bella SDK (Bộ công cụ phát triển)
        │
        ├── Bella Connect (Cổng kết nối SAP, MISA, Facebook, TikTok...)
        │
        └── Bella Marketplace (Chợ quy trình SOP & Extension Packages)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Tên của toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Lõi Điều hành - System of Orchestration)**: "Hệ điều hành doanh nghiệp" đóng vai trò là bộ não điều khiển toàn bộ quy trình, chịu trách nhiệm cho các dịch vụ nền tảng: `Kernel`, `Process Runtime`, `Scheduler`, `Policy`, `Context`, `Memory`, `Command Bus`, `Dispatch`, `Evidence` và `Learning`.
3. **Bella EIP (Hệ thống Nghiệp vụ - System of Record / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu bao gồm `CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll` và `BI Dashboard`. EIP là nơi dữ liệu nghiệp vụ sinh ra, Bella EOS sẽ sử dụng dữ liệu này để ra quyết định và điều hành.
4. **Bella Workers**: Lực lượng lao động số thực hiện các nhiệm vụ được chỉ định.
5. **Hermes / Codex / Claude Code**: Các Execution Engines (Lớp thực thi).

---

## 2. THE 10-LAYER ENTERPRISE STACK

Bella EOS v11.0 is structured into **10 strict architectural layers** to decouple strategy, planning, execution, and learning:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Human Layer (CEO / HĐQT / Human-in-the-Loop Approval Gates)         │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. AI CEO Layer (Strategic Vision & Enterprise Directive Definition)    │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Goal Engine (OKR & Cross-Department Goal Decomposition Core)          │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. AI COO Layer (Portfolio Management & Operational Coordination)        │
├─────────────────────────────────────────────────────────────────────────┤
│ 5. Planning Engine (Multi-Agent Task Dependency Graph & DAG Generator)  │
├─────────────────────────────────────────────────────────────────────────┤
│ 6. Workflow Engine / Process Runtime (State Machine & Stage Execution)  │
├─────────────────────────────────────────────────────────────────────────┤
│ 7. Policy Engine (Compliance, Risk Matrix & Realtime Guardrails)        │
├─────────────────────────────────────────────────────────────────────────┤
│ 8. Enterprise Intelligence Layer (EIL - Multi-Dimensional Context)     │
├─────────────────────────────────────────────────────────────────────────┤
│ 9. Execution Adapter Layer (Pluggable Manager Interface)               │
├─────────────────────────────────────────────────────────────────────────┤
│ 10. Execution Runtimes (Hermes • Codex • Claude Code • OpenHands)       │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Human Layer**: Human operators, board directives, and manual approval overrides.
2. **AI CEO Layer**: Translates high-level corporate visions into actionable enterprise intents.
3. **Goal Engine**: Decomposes vision into departmental OKRs (Marketing, Sales, HR, Finance, Operations).
4. **AI COO Layer**: Manages the operational roadmap, schedules and assigns tasks.
5. **Planning Engine**: Dynamically compiles dependency graphs (DAGs) for process steps.
6. **Workflow Engine (Process Runtime)**: Executes stage-by-stage processes with a 12-state machine.
7. **Policy Engine**: Evaluates guardrails, budget limits, and risk matrices in real-time.
8. **Enterprise Intelligence Layer (EIL)**: Combines ERP, CRM, HR, and historical context into unified intelligence packages.
9. **Execution Adapter Layer**: Framework-agnostic runtime broker interface.
10. **Execution Runtimes**: Concrete agents (Hermes, Codex, Claude Code, OpenHands) that execute the work.

---

## 3. CLOSED-LOOP FLYWHEEL & 5 EVOLUTION ENGINES

Bella EOS implements an **8-step Closed-Loop Learning Flywheel** that continuously observes and mutates the enterprise:

```
        Goal Formulation (Goal Engine)
                     │
                     ▼
        Planning & Simulation (Simulation & Optimization Engine)
                     │
                     ▼
        Execution (Adapters & Runtimes)
                     │
                     ▼
        Observation (Evidence & Realtime Telemetry)
                     │
                     ▼
        Evaluation (Enterprise Quality Engine - EQE)
                     │
                     ▼
        Learning (Learning Engine - SOP & Skill Mutation)
                     │
                     ▼
        Knowledge Graph (Enterprise Knowledge Graph Sync)
                     │
                     ▼
        Next Decision (Optimized Goal & Policy Refinement)
```

### The 5 Evolutionary Engines:

1. **Goal Engine (`GoalEngine`)**:
   - Decomposes high-level strategic visions (e.g. *"Increase revenue by 30% in Q3"*) into departmental objectives:
     - *Marketing*: Lead target and campaign reach.
     - *Sales*: Conversion rate and bookings target.
     - *HR*: Workforce skills acquisition and training throughput.
     - *Finance*: Cost thresholds and net margin targets.
     - *Operations*: SOP cycle speed and SLA compliance metrics.

2. **Simulation Engine (`SimulationEngine`)**:
   - Runs a Monte Carlo simulator before execution to project KPIs.
   - Forecasts **ROI, Cashflow, and Net profit** for different decision vectors (Ad Spend vs. Personnel Expansion vs. AI Automation).

3. **OptimizationEngine**:
   - Analyzes telemetry logs from 100+ workflow runs.
   - Mathematically calculates the **Optimal Workflow Path** based on performance, cost, and historical SLA compliance.

4. **Knowledge Graph Subsystem (`KnowledgeGraphService`)**:
   - Maps 20 EOM object nodes (Company, Employee, Task, Resource, Invoice, Policy, Decision, Asset, etc.).
   - Establishes relationships (`GOVERNS`, `APPROVED_BY`, `DEPENDS_ON`, `GENERATED_BY`) to trace decision lineage.

5. **Learning Engine (`LearningEngine`)**:
   - Evaluates verification proofs from the `EvidenceService` and overall quality scorecards from the `EnterpriseQualityEngine` (EQE).
   - Mutates future SOP rules and adjusts the workforce skill weight matrix automatically.

---

## 4. ENTERPRISE INTELLIGENCE LAYER (EIL) CONTEXT PACKAGE

The EIL context packages the following metadata into every task dispatch:
```json
{
  "taskId": "TSK-MKT-008",
  "enterpriseIntelligenceLayer": {
    "objective": "Tăng 20% doanh thu tháng 8",
    "departmentOKRs": {
      "marketing": "Generate 1000 VIP leads",
      "finance": "Keep cost below 50M VND"
    },
    "erp": { "costCenter": "CC-MKT-2026", "approvedBudgetVnd": 50000000 },
    "crm": { "targetSegment": "VIP Beauty", "minEqeScore": 90 },
    "governance": { "maxAutoBudget": 100000000, "policyId": "POL-NO-NIGHT-POSTING" },
    "decisionLineage": ["DEC-98201", "DEC-98204"]
  },
  "executionAdapter": "HermesExecutionAdapter",
  "timestamp": "2026-07-21T09:15:00Z"
}
```

---

## 5. PLUGGABLE EXECUTION ADAPTERS

Standard `ExecutionEngineAdapter` interface contract:
```typescript
interface ExecutionEngineAdapter {
    execute(task: Task, context: EilContextPackage): Promise<ExecutionResult>;
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
