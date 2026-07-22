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

## 2. HIỂN PHÁP KIẾN TRÚC & QUY TẮC PHỤ THUỘC (ARCHITECTURE CONSTITUTION)

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

| Module | Được phép phụ thuộc vào | KHÔNG ĐƯỢC PHÉP phụ thuộc vào |
| :--- | :--- | :--- |
| **Infrastructure** | Không phụ thuộc vào Business logic | Brain, Orchestration, Presentation UI |
| **Storage Domain** | Storage Interfaces v1.0, Secrets Store | Presentation UI, Brain internals |
| **Enterprise Brain** | Infrastructure Contracts, Storage Interfaces | Presentation UI, Raw Database SDKs |
| **Orchestration** | Brain APIs, Policy Engine, Solvers | Presentation UI, Raw Storage trực tiếp |
| **Execution** | Service Contracts, Orchestration APIs | Brain internals, Raw Database SDKs |
| **Presentation** | Public APIs, Experience Domain APIs | Brain internals, Storage trực tiếp |
| **Marketplace** | Asset Manifest v1.0, Marketplace Suite | Runtime internals |

---

## 3. THÁP KIỂM THỬ 5 TẦNG (5-LAYER TEST PYRAMID)

```
              ┌──────────────────────────┐
              │        E2E Tests         │
              ├──────────────────────────┤
              │    Architecture Tests    │
              ├──────────────────────────┤
              │    Integration Tests     │
              ├──────────────────────────┤
              │      Contract Tests      │
              ├──────────────────────────┤
              │        Unit Tests        │
              └──────────────────────────┘
```

1. **Unit Tests**: Kiểm thử logic hàm nội bộ của từng module.
2. **Contract Tests**: Verify 100% tính tương thích của 9 Platform Contracts.
3. **Integration Tests**: Kiểm thử tích hợp liên module (Kernel ➔ Storage ➔ Brain).
4. **Architecture Tests**: Kiểm thử tự động không vi phạm Forbidden Dependency Rules.
5. **E2E Tests**: Kiểm thử toàn trình từ CEO Prompt đến Realtime Dashboard UI.

---

## 4. QUẢN TRỊ SPRINT (DEFINITION OF DONE & ADR GATE)

Mỗi Sprint thi công bắt buộc tuân thủ 5 điều kiện nghiệm thu:

1. **Definition of Done (DoD)**: `npm run build` PASS, 100% Contract Tests & Architecture Tests PASS.
2. **Exit Criteria & Exit Tests**: Kịch bản chạy thực tế qua hết chuỗi subsystem của Sprint.
3. **ADR Gate**: Cập nhật ADR tương ứng trước khi merge code vào nhánh chính.
4. **Performance Baseline Tracking**: Đo đạc latency và token usage để theo dõi qua các Sprint.
5. **Technical Debt Log**: Ghi nhận Known Issues và Deferred Decisions của Sprint.

---

## 5. 🔒 BỘ 9 HỢP ĐỒNG KHÓA CỨNG (FROZEN PLATFORM CONTRACTS)

### 1. Enterprise Message Contract (`EnterpriseEvent<T>`)
### 2. Service Contract Interface (`IService`)
### 3. Cognitive Memory API (`MemoryAPI`)
### 4. Worker Contract Interface (`IWorker`)
### 5. Connector Contract Interface (`IConnector`)
### 6. Enterprise Policy Contract (`IPolicy`)
### 7. Planner Engine Contract (`IPlanner`)
### 8. Asset Manifest Specification (`AssetManifest`)
### 9. Marketplace Plugin Lifecycle Specification

---

## 6. 🎯 KHUNG THI CÔNG SPRINT-BY-SPRINT (SPRINT EXECUTION ROADMAP)

| Sprint | Mục tiêu Phân hệ | Deliverable & Output Chạy Được | Sprint Exit Criteria Test |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Foundation Contracts | `CBV v1.0`, `EOM v1.0`, `EnterpriseEvent`, `EventBus`, `StorageInterfaces`, `SecretsStore`, `MemoryAPI` | Platform compile PASS, Pub/Sub Event PASS, MemoryAPI & Storage Interfaces compile PASS |
| **Sprint 2** | Brain Runtime | Memory Center, Knowledge Center, Context Security & Token Optimizer, DNA Packs, Human Approval Gate | Brain Subsystem khởi tạo PASS, Memory API CRUD PASS, Context Optimizer (-90% tokens) PASS |
| **Sprint 3** | Business Runtime | Intent Engine, Goal Engine, Strategy Engine, Simulation Engine, Planning Engine (IPlanner), Workflow | CEO Prompt ➔ Intent ➔ Goal ➔ Strategy ➔ Simulation ➔ Planning ➔ Workflow PASS |
| **Sprint 4** | Execution Runtime | Capability Registry, Service Contracts (IService), Stateless Worker Gateway (IWorker), Connectors (IConnector) | Capability ➔ Service Contract ➔ Worker Gateway execute PASS với Connector mẫu |
| **Sprint 5** | Presentation Layer | CEO Console, Manager Portal, Employee Portal, Realtime Dashboard, Observability UI | CEO Console & Dashboard hoạt động thực tế với API của Orchestration & Execution PASS |
| **Sprint 6** | Marketplace Suite | Registry, Manifest (AssetManifest), Versioning, Dependency Resolver, Installer, Upgrade & Rollback Suite | Cài đặt, nâng cấp và gỡ bỏ Asset mẫu (Skill/SOP/DNA Pack) qua Manifest & Registry PASS |

---

## 7. ARCHITECTURE FREEZE COMPLIANCE

> **Mọi hoạt động thiết kế kiến trúc chính thức dứt điểm tại v17.3.** Dự án bắt đầu thi công Sprint 1 ngay lập tức.
