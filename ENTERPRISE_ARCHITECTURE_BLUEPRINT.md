# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v17.3 ULTIMATE CONTRACT MASTER - FEATURE COMPLETE)`  
> **SPECIFICATION VERSION**: `v17.3`  
> **ENTERPRISE TARGET LIFESPAN**: `2026 - 2046 (20-YEAR ENTERPRISE OPERATING STANDARD)`

---

## 1. HỆ SINH THÁI THƯƠNG HIỆU BELLA AI PLATFORM

```
                    Bella AI Platform
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   Bella EOS                           Bella EIP
Enterprise Brain                  Business Applications
(System of Orchestration)          (System of Record)
        ▲
        │ (Installed & Managed via Marketplace Suite)
 Bella Marketplace ──► Assets Distribution (Skills, SOPs, DNA Packs, Prompts, Connectors)
        │ ├── Registry ├── Manifest ├── Versioning ├── Dependency Resolver
        │ └── Installer ├── Upgrade  ├── Rollback   └── Publisher
        │
        ├─► Bella Workers (Stateless Executors: AI, Human, MCP, API, Script, Robot, External)
        ├─► Bella Connect (Enterprise Connectors & CBV Mapper)
        └─► Bella SDK (Development Kits)
```

---

## 2. QUẢN LÝ KIẾN TRÚC & PHÂN LOẠI TÀI LIỆU (SPEC VS ADR)

Để duy trì hệ thống trong 20 năm mà không gây xáo trộn tài liệu master:

1. **Architecture Specification (Đông cứng tuyệt đối)**: Quy định 5 Domains, 9 Core Platform Contracts, Dependency Rules, Package Rules.
2. **Architecture Decision Records (ADRs)**: Quản lý các quyết định lựa chọn công nghệ (PostgreSQL, pgvector, Redis, Event Bus...). Khi thay thế công nghệ chỉ cần bổ sung hoặc cập nhật ADR.

---

## 3. BẢNG PHÂN ĐỊNH KHÓA CỨNG (FROZEN CONTRACTS VS EXTENSIBLE)

```
┌─────────────────────────────────────────────────────────────────┐
│ ❄️ FROZEN PLATFORM CONTRACTS (KHÓA CỨNG BẤT BIẾN 20 NĂM)         │
├─────────────────────────────────────────────────────────────────┤
│ 1. 5 Core Domains Boundaries (Kernel, Storage, Brain, Orch, Exec)│
│ 2. Canonical Business Vocabulary (CBV v1.0)                      │
│ 3. Enterprise Object Model (EOM v1.0)                           │
│ 4. Enterprise Message Contract (EnterpriseEvent<T> v1.0)         │
│ 5. Cognitive Memory API Interface (MemoryAPI v1.0)             │
│ 6. Service Contract Specification (IService v1.0)              │
│ 7. Worker Contract Interface (IWorker v1.0)                     │
│ 8. Connector Contract Interface (IConnector v1.0)               │
│ 9. Enterprise Policy Contract (IPolicy v1.0)                    │
│ 10. Planner Engine Contract (IPlanner v1.0)                    │
│ 11. Asset Manifest Specification (AssetManifest v1.0)           │
│ 12. Marketplace Plugin Lifecycle Specification                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🚀 EXTENSIBLE LAYER (MỞ RỘNG & THƯƠNG MẠI TRÊN MARKETPLACE)    │
├─────────────────────────────────────────────────────────────────┤
│ • Business Skills & SOP Extensions                              │
│ • Prompt Packs & Prompt Version Templates                       │
│ • Company DNA Packs (Versioned v1.0, v1.1, v2.0)                │
│ • Connector Implementations (SAP, MISA, Facebook, Zalo, Odoo)   │
│ • Workflow Packs & Stage Templates                              │
│ • Enterprise Strategies & Pluggable Solvers                     │
│ • Presentation Consoles, Dashboards & Portals                   │
│ • AI & Human Worker Implementations                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 🔒 CHI TIẾT BỘ HỢP ĐỒNG PLATFORM CONTRACTS (v1.0)

### 1. Enterprise Message Contract (`EnterpriseEvent<T>`)
```typescript
interface EnterpriseEvent<T> {
  id: string;
  type: string;
  source: string;
  tenantId: string;
  timestamp: Date;
  correlationId: string;
  causationId: string;
  payload: T;
  metadata: Record<string, any>;
}
```

### 2. Service Contract Interface (`IService`)
```typescript
interface IService {
  execute(input: any): Promise<any>;
  validate(input: any): Promise<boolean>;
  rollback(executionId: string): Promise<boolean>;
  health(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' }>;
  metadata(): { id: string; version: string; capability: string };
}
```

### 3. Cognitive Memory API (`MemoryAPI`)
```typescript
interface MemoryAPI {
  store(memory: BusinessMemory): Promise<string>;
  retrieve(id: string): Promise<BusinessMemory | null>;
  search(query: MemorySearchQuery): Promise<BusinessMemory[]>;
  forget(id: string): Promise<boolean>;
  link(sourceId: string, targetId: string, relation: string): Promise<boolean>;
  version(id: string): Promise<MemoryVersionHistory>;
}
```

### 4. Worker Contract Interface (`IWorker`)
```typescript
interface IWorker {
  id: string;
  type: 'AI' | 'HUMAN' | 'MCP' | 'API' | 'SCRIPT' | 'ROBOT' | 'EXTERNAL';
  execute(context: CanonicalContextPackage): Promise<Evidence>;
  cancel(taskId: string): Promise<boolean>;
  heartbeat(): Promise<boolean>;
  health(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' }>;
  dispose(): Promise<void>;
}
```

### 5. Connector Contract Interface (`IConnector`)
```typescript
interface IConnector {
  authenticate(credentials: Record<string, any>): Promise<boolean>;
  discover(): Promise<CapabilitiesDescription>;
  fetch(query: Record<string, any>): Promise<any>;
  push(payload: any): Promise<any>;
  mapToCBV(rawData: any): CanonicalBusinessVocabulary;
}
```

### 6. Enterprise Policy Contract (`IPolicy`)
```typescript
interface IPolicy {
  evaluate(context: any): Promise<PolicyEvaluationResult>;
  approve(actionId: string, approverId: string): Promise<boolean>;
  reject(actionId: string, reason: string): Promise<boolean>;
  explain(policyId: string): string;
}
```

### 7. Planner Engine Contract (`IPlanner`)
```typescript
interface IPlanner {
  plan(goal: Goal): Promise<ExecutionPlan>;
  optimize(plan: ExecutionPlan): Promise<ExecutionPlan>;
  estimate(plan: ExecutionPlan): Promise<ResourceCostEstimate>;
  rollback(planId: string): Promise<boolean>;
}
```

### 8. Asset Manifest Specification (`AssetManifest`)
```typescript
interface AssetManifest {
  id: string;
  name: string;
  version: string;
  type: 'SKILL' | 'SOP' | 'DNA_PACK' | 'CONNECTOR' | 'PROMPT_PACK' | 'WORKFLOW';
  author: string;
  dependencies: Record<string, string>;
  compatibility: { eosVersion: string };
  license: string;
  signature: string;
  checksum: string;
}
```

---

## 5. MARKETPLACE SUITE SPECIFICATION

Bộ quản lý phân phối tài sản tự động:
```
Marketplace Suite
├── Registry (Danh mục Assets)
├── Manifest (Xác thực Manifest v1.0)
├── Versioning (Quản lý phiên bản)
├── Dependency Resolver (Giải quyết phụ thuộc)
├── Installer (Cài đặt Asset)
├── Upgrade Manager (Nâng cấp phiên bản)
├── Rollback Manager (Khôi phục phiên bản)
└── Publisher (Đóng gói & Phát hành Asset)
```

---

## 6. CLEAN ARCHITECTURE: 5 CORE DOMAINS & OUTER ADAPTERS

```
┌────────────────────────────────────────────────────────┐
│ Domain 1: Bella Kernel (Runtime & Event Store)         │
│  • Strictly ZERO business logic, ZERO AI, ZERO workflow│
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 2: Enterprise Storage Domain (Abstract Layer)   │
│  • Metadata Store (PostgreSQL / Relational)            │
│  • Vector Store (pgvector / Embeddings)                │
│  • Blob Store (Document & Media Assets)                │
│  • Graph Store (Knowledge Graph Index)                 │
│  • Operational Cache (Local Memory / Redis)            │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 3: Enterprise Brain & Pluggable Centers         │
│  • Memory Center (Communicates via MemoryAPI v1.0)     │
│  • Knowledge Center (Graph, Provenance, Anti-Hallucin) │
│  • Context Center (Isolation, Ranking, Token Optimizer)│
│  • Reasoning Center (Solvers: Monte Carlo, Tree, RL)   │
│  • Learning Center (Evidence ➔ Suggest ➔ Human Approve)│
│  • Enterprise Assets & Versioned DNA Packs (v1.0, v2.0)│
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 4: Orchestration & Strategy (Process Control)   │
│  Intent ➔ Goal ➔ Strategy ➔ Simulation ➔ Planning      │
│  • Driven by IPlanner Contract v1.0                    │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Execution Domain (Stateless Workforce Engine)│
│  • Service Contracts (IService v1.0 Interface)         │
│  • Stateless Workers (IWorker v1.0 Interface)          │
│  • Connectors (IConnector v1.0 Interface)              │
│  • Internal API Gateway                                │
└───────────────────────────┬────────────────────────────┘
                            ▼
===================== OUTER ADAPTER LAYER ================
┌────────────────────────────────────────────────────────┐
│ Presentation Layer (Adapters & Portals)                │
│  • CEO Console, Manager Portal, Employee Portal,       │
│    Customer Portal, Realtime Dashboard, Mobile, Voice  │
└────────────────────────────────────────────────────────┘
```

---

## 7. CÔNG NGHỆ CHUẨN (FREE-FIRST STACK)

* **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Database & Vector**: Supabase PostgreSQL + pgvector (Free Tier).
* **Storage**: Supabase Storage (Free Tier).
* **Deploy**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 8. 🎯 LỘ TRÌNH THI CÔNG 6 PHASE CHUẨN

1. **Phase 1 — Infrastructure Contracts**: CBV v1.0, EOM v1.0, EnterpriseEvent<T>, Storage Interfaces, Secrets Store, MemoryAPI v1.0.
2. **Phase 2 — Brain Runtime**: Memory, Knowledge, Context, Reasoning, Learning, DNA Packs.
3. **Phase 3 — Business Runtime**: Intent, Goal, Strategy, Simulation, Planning (IPlanner), Workflow.
4. **Phase 4 — Execution Runtime**: Capability Registry, Service Contracts (IService), Workers (IWorker), Connectors (IConnector).
5. **Phase 5 — Experience Layer**: CEO Console, Manager Portal, Employee Portal, Dashboard, Monitoring.
6. **Phase 6 — Marketplace**: Suite (Registry, Manifest, Versioning, Dependency Resolver, Installer, Upgrade, Rollback, Publisher).
