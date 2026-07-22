# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v17.3 PLATFORM SPECIFICATION & CONSTITUTION)`  
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

## 2. HIỂN PHÁP KIẾN TRÚC & MA TRẬN PHỤ THUỘC (ARCHITECTURE CONSTITUTION)

Để bảo vệ kiến trúc sạch không bị xói mòn trong 20 năm phát triển:

```
Presentation Layer (Outer Adapter)
    │
    ▼
Application API Layer
    │
    ▼
Domain 4: Orchestration & Strategy
    │
    ▼
Domain 3: Enterprise Brain (Brain APIs)
    │
    ▼
Domain 2: Storage Interfaces (v1.0)
    │
    ▼
Domain 1 & Infrastructure Layer (Kernel, Events, Secrets)
```

### 🚫 Bảng Quy Tắc Phụ Thuộc Cấm (Forbidden Dependency Rules):

| Module | Được phép phụ thuộc vào | KHÔNG ĐƯỢC BÉP phụ thuộc vào |
| :--- | :--- | :--- |
| **Infrastructure** | Không phụ thuộc vào Business logic | Brain, Orchestration, Presentation UI |
| **Storage Domain** | Storage Interfaces v1.0, Secrets Store | Presentation UI, Brain internals |
| **Enterprise Brain** | Infrastructure Contracts, Storage Interfaces | Presentation UI, Raw Database SDKs |
| **Orchestration** | Brain APIs, Policy Engine, Solvers | Presentation UI, Raw Storage trực tiếp |
| **Execution** | Service Contracts, Orchestration APIs | Brain internals, Raw Database SDKs |
| **Presentation** | Public APIs, Experience Domain APIs | Brain internals, Storage trực tiếp |
| **Marketplace** | Asset Manifest v1.0, Marketplace Suite | Runtime internals |

---

## 3. CHÍNH SÁCH PHIÊN BẢN HỢP ĐỒNG (CONTRACT VERSIONING POLICY)

Tất cả Frozen Platform Contracts tuân thủ nghiêm ngặt Semantic Versioning (SemVer):

- **Major Version (`v1.0` ➔ `v2.0`)**: Chứa breaking changes. Yêu cầu tạo adapter tương thích ngược.
- **Minor Version (`v1.0` ➔ `v1.1`)**: Chỉ được phép bổ sung thuộc tính optional. Tuyệt đối không xóa thuộc tính hiện có.
- **Patch Version (`v1.1.0` ➔ `v1.1.1`)**: Sửa lỗi bug mà không đổi schema.

---

## 4. MA TRẬN TƯƠNG THÍCH HỢP ĐỒNG (CONTRACT COMPATIBILITY MATRIX)

```
┌─────────────────────────┬─────────────────────────────────────────┐
│ Frozen Platform Contract│ Consumer Components                     │
├─────────────────────────┼─────────────────────────────────────────┤
│ CBV v1.0                │ Connectors, EOM Converter               │
│ EOM v1.0                │ Enterprise Brain, Orchestration         │
│ EnterpriseEvent v1.0    │ Enterprise Event Bus, Audit Logger      │
│ MemoryAPI v1.0          │ Cognitive Memory Centers                │
│ IPlanner v1.0           │ Planning Engine, Simulation Engine      │
│ IPolicy v1.0            │ Policy Engine, Learning Center          │
│ IService v1.0           │ Execution Domain, Service Registry      │
│ IWorker v1.0            │ Worker Gateway, Stateless Executors     │
│ IConnector v1.0         │ Connector Framework, Bella Connect      │
│ AssetManifest v1.0      │ Marketplace Suite                       │
└─────────────────────────┴─────────────────────────────────────────┘
```

---

## 5. 🔒 BỘ 9 HỢP ĐỒNG KHÓA CỨNG (FROZEN PLATFORM CONTRACTS)

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

## 6. DANH MỤC AD RS GOVERNANCE INDEX

Hệ thống tài liệu quản trị kiến trúc chi tiết tại [`docs/architecture/adr/`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/):

- `ADR-001 Platform Vision & Core Philosophy`
- `ADR-002 Canonical Business Vocabulary (CBV)`
- `ADR-003 Enterprise Object Model (EOM)`
- `ADR-004 Enterprise Event Message Contract`
- `ADR-005 Cognitive Memory API Interface`
- `ADR-006 Storage Domain Abstraction`
- `ADR-007 Worker Contract & Stateless Execution`
- `ADR-008 Marketplace Suite & Asset Manifest`
- `ADR-009 Context Isolation & Security Optimizer`
- `ADR-010 Plugin Lifecycle Governance`

---

## 7. 🎯 SPRINT EXECUTION ROADMAP

```
Sprint 1: Infrastructure Contracts ➔ Event Bus, Storage Interfaces, Secrets, CBV/EOM
Sprint 2: Brain Runtime ➔ Memory API, Knowledge Center, Context Optimizer, DNA Packs
Sprint 3: Business Runtime ➔ Intent Engine, Goal Engine, Strategy Engine, Simulation
Sprint 4: Execution Runtime ➔ Capability Registry, Service Contracts, Worker Gateway
Sprint 5: Presentation ➔ CEO Console, Manager Portal, Realtime Dashboard
Sprint 6: Marketplace ➔ Registry, Resolver, Installer, Upgrade & Publisher Suite
```
