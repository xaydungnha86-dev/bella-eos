# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v17.2 ULTIMATE ENTERPRISE GOLD MASTER)`  
> **SPECIFICATION VERSION**: `v17.2`  
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
        │
        ├─► Bella Workers (Stateless Executors: AI, Human, MCP, API, Script, Robot, External)
        ├─► Bella Connect (Enterprise Connectors & CBV Mapper)
        ├─► Bella SDK (Development Kits)
        └─► Bella Marketplace (Enterprise Assets: Skills, SOPs, DNA Packs, Prompt Packs, Connectors, Workflows)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho 5 Core Domains & 3 Infrastructure Pillars.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu (`CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll`, `BI Dashboard`). EIP là **System of Record** - nơi ghi nhận sự thật (facts), không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ dữ liệu ngoại vi về **Canonical Business Vocabulary (CBV v1.0)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động thực thi **không lưu trạng thái (Stateless Executors)**.
6. **Bella Marketplace**: Nơi phân phối các **Enterprise Assets** (`Skills`, `SOP Library`, `DNA Packs`, `Prompt Packs`, `Connector Packs`, `Workflow Packs`, `Templates`).

---

## 2. QUẢN LÝ ĐÓNG BĂNG KIẾN TRÚC (FROZEN CORE VS PLUGGABLE MODULES)

Để giữ hệ thống vừa ổn định trong 20 năm, vừa đủ linh hoạt không bị khóa vào công nghệ của năm 2026:

```
┌─────────────────────────────────────────────────────────────────┐
│ ❄️ FROZEN CORE (BẤT BIẾN - HỢP ĐỒNG CỐ ĐỊNH TRONG 20 NĂM)        │
├─────────────────────────────────────────────────────────────────┤
│ • 5 Core Domains & 3 Infrastructure Pillars Architecture        │
│ • Canonical Business Vocabulary (CBV v1.0) & EOM (v1.0)         │
│ • Canonical Context Package (v1.0) & Security Isolation         │
│ • Service Contract Specification (v1.0) & Capability Chain      │
│ • Worker Lifecycle & Stateless Execution Principle              │
│ • Storage Abstraction Interfaces (v1.0)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🧩 PLUGGABLE & CONFIGURABLE MODULES (LẠM THAY ĐỔI & MỞ RỘNG)    │
├─────────────────────────────────────────────────────────────────┤
│ • Prompts & Prompt Templates (Phát triển liên tục theo AI)      │
│ • Reasoning Solvers (Pluggable: Monte Carlo, Tree Search, RL...)│
│ • Confidence Threshold (Cấu hình linh hoạt theo Tenant: 70%-95%)│
│ • Brain Centers (Mở rộng thêm: Vision, Compliance, Forecast...) │
│ • Company DNA Packs (Mở rộng theo ngành: Brand, Legal, Spa...)  │
│ • Marketplace Assets (Skills, SOPs, Prompts, Workflows)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 3 TRỤ CỘT HẠ TẦNG CỐT LÕI (3 INFRASTRUCTURE PILLARS)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚡ ENTERPRISE EVENT BUS                                         │
│ Quản lý luồng sự kiện bất biến Publish/Subscribe giữa Kernel,   │
│ Brain, Orchestration và Execution.                              │
├─────────────────────────────────────────────────────────────────┤
│ ⏱️ ENTERPRISE SCHEDULER                                         │
│ Quản lý Cron Jobs, Delayed Jobs, Retries, Priority Queue.       │
├─────────────────────────────────────────────────────────────────┤
│ 👁️ OBSERVABILITY & AUDIT DOMAIN                                 │
│ OpenTelemetry Tracing, Performance Metrics, System Logs,       │
│ Replay Engine & Dead Letter Queue (DLQ).                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. QUY TRÌNH CHỈ DẪN QUYẾT ĐỊNH KIẾN TRÚC (ADR GOVERNANCE)

Toàn bộ các quyết định kiến trúc cốt lõi được lưu trữ tại thư mục [`docs/architecture/adr/`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/):

- [`ADR-0001-domain-isolation.md`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/ADR-0001-domain-isolation.md): Phân tách 5 Core Domains độc lập.
- [`ADR-0002-stateless-workers.md`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/ADR-0002-stateless-workers.md): Nguyên tắc Worker không lưu trạng thái (Stateless Execution).
- [`ADR-0003-storage-abstraction.md`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/ADR-0003-storage-abstraction.md): Trích xuất Storage Domain Interfaces khỏi Brain.
- [`ADR-0004-context-security.md`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/ADR-0004-context-security.md): Bảo mật cách ly ngữ cảnh & Token Optimizer.
- [`ADR-0005-company-dna.md`](file:///d:/Antigravity/Projects/DN%20WORKFLOW/docs/architecture/adr/ADR-0005-company-dna.md): Độc lập hóa Company DNA Enterprise Asset 4 Tầng.

---

## 5. THỨ BẬC TRI THỨC DOANH NGHIỆP (11-LEVEL HIERARCHY)

```
 Business Domain ➔ Business Skill ➔ SOP ➔ Workflow ➔ Stage ➔ Task ➔ Capability ➔ Service Contract (v1.0) ➔ Service ➔ Worker
```

---

## 6. 5 CORE DOMAINS, INFRASTRUCTURE & PRESENTATION LAYER

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
│  • Memory Center (Working, Episodic, Semantic, Business)│
│  • Knowledge Center (Graph, Provenance, Anti-Hallucin) │
│  • Context Center (Isolation, Ranking, Token Optimizer)│
│  • Reasoning Center (Solvers: Monte Carlo, Tree, RL)   │
│  • Learning Center (Evidence, Feedback, SOP Evolution) │
│  • Enterprise Assets & Company DNA Packs (Brand, Legal)│
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 4: Orchestration & Strategy (Process Control)   │
│  Intent ➔ Goal ➔ Strategy ➔ Simulation ➔ Planning      │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Execution Domain (Stateless Workforce Engine)│
│  • Service Contracts & Service Registry                │
│  • Stateless Workers: AI, Human, MCP, API, Robot...    │
│  • Internal API Gateway                                │
└───────────────────────────┬────────────────────────────┘
                            ▼
=================== INFRASTRUCTURE LAYER =================
┌────────────────────────────────────────────────────────┐
│ • Secrets Store (Environment Variables / Supabase Vault│
│ • Enterprise Event Bus (Pub/Sub Event Delivery)        │
│ • Enterprise Scheduler (Cron, Queue, Priority, Retries)│
│ • Observability & Audit Domain (Tracing, Metrics, DLQ) │
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
* **Event & Queue**: Internal Event Bus + Local Memory ➔ Redis / BullMQ / Trigger.dev OSS (khi scale).
* **Observability**: OpenTelemetry + System Logs + DLQ.
* **Triển khai**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 8. 🎯 LỘ TRÌNH THI CÔNG 6 GIAI ĐOẠN (ROADMAP)

1. **Phase 1 — Foundation**: Kernel, EOM v1.0, CBV v1.0, Storage Domain Interfaces, Secrets Store, Event Bus.
2. **Phase 2 — Enterprise Brain**: Memory, Knowledge, Context, Reasoning, Learning, Company DNA Packs.
3. **Phase 3 — Orchestration**: Intent Engine, Goal Engine, Strategy Engine, Simulation Engine, Planning Engine, Workflow.
4. **Phase 4 — Execution**: Capability Registry, Service Registry, Service Contracts v1.0, Worker Gateway, Connectors.
5. **Phase 5 — Presentation**: CEO Console, Manager Portal, Employee Portal, Realtime Dashboard, Observability UI.
6. **Phase 6 — Marketplace**: Skills, SOPs, Templates, DNA Packs, Connector Packs, Extensions.
