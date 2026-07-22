# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v17.3 ULTIMATE CONTRACT MASTER)`  
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
        │ (Install & Manage via Asset Manifest & Plugin Lifecycle)
 Bella Marketplace ──► Enterprise Assets (Skills, SOPs, DNA Packs, Prompts, Connectors)
        │
        ├─► Bella Workers (Stateless Executors: AI, Human, MCP, API, Script, Robot, External)
        ├─► Bella Connect (Enterprise Connectors & CBV Mapper)
        └─► Bella SDK (Development Kits)
```

---

## 2. BẢNG PHÂN ĐỊNH KHÓA CỨNG (FROZEN CONTRACTS VS EXTENSIBLE)

```
┌─────────────────────────────────────────────────────────────────┐
│ ❄️ FROZEN CONTRACTS (KHÓA CỨNG BẤT BIẾN 20 NĂM)                  │
├─────────────────────────────────────────────────────────────────┤
│ 1. 5 Core Domains Boundaries (Kernel, Storage, Brain, Orch, Exec)│
│ 2. Canonical Business Vocabulary (CBV v1.0)                      │
│ 3. Enterprise Object Model (EOM v1.0)                           │
│ 4. Enterprise Message Contract (EnterpriseEvent<T> v1.0)         │
│ 5. Cognitive Memory API Interface (MemoryAPI v1.0)             │
│ 6. Service Contract Specification (IService v1.0)              │
│ 7. Worker Contract & Stateless Execution Principle              │
│ 8. Asset Manifest Specification (AssetManifest v1.0)            │
│ 9. Marketplace Plugin Lifecycle Specification                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🚀 EXTENSIBLE LAYER (MỞ RỘNG & THƯƠNG MẠI TRÊN MARKETPLACE)    │
├─────────────────────────────────────────────────────────────────┤
│ • Business Skills & SOP Extensions                              │
│ • Prompt Packs & Prompt Version Templates                       │
│ • Company DNA Packs (Versioned v1.0, v1.1, v2.0)                │
│ • Connector Packs (SAP, MISA, Facebook, Zalo, Odoo, Salesforce)  │
│ • Workflow Packs & Stage Templates                              │
│ • Enterprise Strategies & Pluggable Solvers                     │
│ • Presentation Consoles, Dashboards & Portals                   │
│ • AI & Human Worker Implementations                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 🔒 CHI TIẾT 5 HỢP ĐỒNG KHÓA CỨNG (FROZEN CONTRACT SPECIFICATIONS)

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

### 4. Asset Manifest Specification (`AssetManifest`)
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

### 5. Marketplace Plugin Lifecycle Specification
```
Install ➔ Validate ➔ Activate ➔ Execute ➔ Suspend ➔ Upgrade ➔ Rollback ➔ Remove
```

---

## 4. CLEAN ARCHITECTURE: 5 CORE DOMAINS & OUTER ADAPTERS

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
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Execution Domain (Stateless Workforce Engine)│
│  • Service Contracts (IService v1.0 Interface)         │
│  • Stateless Workers: AI, Human, MCP, API, Robot...    │
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

## 5. CÔNG NGHỆ CHUẨN (FREE-FIRST STACK)

* **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Database & Vector**: Supabase PostgreSQL + pgvector (Free Tier).
* **Storage**: Supabase Storage (Free Tier).
* **Deploy**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 6. 🎯 LỘ TRÌNH THI CÔNG 6 PHASE CHUẨN

1. **Phase 1 — Infrastructure Contracts**: CBV v1.0, EOM v1.0, EnterpriseEvent<T>, Storage Interfaces, Secrets Store, MemoryAPI.
2. **Phase 2 — Brain Runtime**: Memory, Knowledge, Context, Reasoning, Learning, DNA Packs.
3. **Phase 3 — Business Runtime**: Intent, Goal, Strategy, Simulation, Planning, Workflow.
4. **Phase 4 — Execution Runtime**: Capability Registry, Service Contracts (IService), Worker Gateway, Connectors.
5. **Phase 5 — Experience Layer**: CEO Console, Manager Portal, Employee Portal, Dashboard, Monitoring.
6. **Phase 6 — Marketplace**: Assets, Versioning (AssetManifest), Distribution, Plugin Lifecycle.
