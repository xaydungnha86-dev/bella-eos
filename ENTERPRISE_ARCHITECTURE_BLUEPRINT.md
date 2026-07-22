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
        └─► Bella Marketplace (Enterprise Assets: Skills, SOPs, DNA, Prompts, Connectors, Workflows)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho 5 Core Domains.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu (`CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll`, `BI Dashboard`). EIP là **System of Record** - nơi ghi nhận sự thật (facts), không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ dữ liệu ngoại vi về **Canonical Business Vocabulary (CBV v1.0)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động thực thi **không lưu trạng thái (Stateless Executors)**.
6. **Bella Marketplace**: Nơi phân phối các **Enterprise Assets** (`Skills`, `SOP Library`, `DNA Packs`, `Prompt Packs`, `Connector Packs`, `Workflow Packs`, `Templates`).

---

## 2. QUẢN LÝ ĐÓNG BĂNG KIẾN TRÚC (FROZEN VS EXTENSIBLE)

Để duy trì hệ thống 20 năm không phát sinh món nợ kỹ thuật:

```
┌─────────────────────────────────────────────────────────────────┐
│ ❄️ FROZEN CORE (BẤT BIẾN - KHÔNG THAY ĐỔI TRONG 20 NĂM)          │
├─────────────────────────────────────────────────────────────────┤
│ • 5 Core Domains Architecture (Kernel, Storage, Brain, Orchestr, Exec) │
│ • Canonical Business Vocabulary (CBV v1.0)                      │
│ • Enterprise Object Model (EOM v1.0)                            │
│ • Canonical Context Package (v1.0)                              │
│ • Service Contract Specification (v1.0)                         │
│ • Worker Lifecycle & Stateless Execution Principle              │
│ • Storage Abstraction Interfaces (v1.0)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 🚀 EXTENSIBLE LAYER (LINH HOẠT & THƯƠNG MẠI TRÊN MARKETPLACE)    │
├─────────────────────────────────────────────────────────────────┤
│ • Business Skills & SOP Extensions                              │
│ • Prompt Packs & Prompt Version Templates                       │
│ • Company DNA Packs (Identity, Brand, Business, Operating DNA)  │
│ • Connector Packs (SAP, MISA, Facebook, Zalo, Odoo, Salesforce)  │
│ • Workflow Packs & Stage Templates                              │
│ • Enterprise Policies & Compliance Rules                        │
│ • AI & Human Worker Implementations                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. VERSIONING CHO HỢP ĐỒNG (CONTRACT VERSIONING)

Tất cả Frozen Contracts đều gắn nhãn phiên bản cụ thể (SemVer):

1. **Canonical Business Vocabulary**: `CBV v1.0`
2. **Enterprise Object Model**: `EOM v1.0`
3. **Canonical Context Package**: `ContextPackage v1.0`
4. **Service Contract Specification**: `ServiceContract v1.0`
5. **Internal Event Contract**: `EventContract v1.0`
6. **Storage Abstraction Interface**: `StorageInterface v1.0`

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

## 6. 5 CORE DOMAINS & PRESENTATION LAYER

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
│ Domain 3: Enterprise Brain & Assets                    │
│  • Memory Center (Working, Episodic, Semantic, Business)│
│  • Knowledge Center (Graph, Provenance, Anti-Hallucin) │
│  • Context Center (Isolation, Ranking, Token Optimizer)│
│  • Reasoning Center (Goal, Constraint, Tradeoff, Monte)│
│  • Learning Center (Evidence, Feedback, SOP Evolution) │
│  • Enterprise Assets & Company DNA Asset (4 Tầng)      │
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
│ Secrets Store (Environment Variables / Supabase Vault) │
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

## 7. CÔNG NGHỆ CHUẨN

* **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Storage Domain Interfaces**: PostgreSQL (Metadata), pgvector (Vector), Supabase Storage (Blob), Secrets Store, Redis/KV (Cache).
* **AI Executors**: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 2.0 Flash / 2.5 Pro).
* **Triển khai**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 8. ARCHITECTURE FREEZE COMPLIANCE

> **Bản kiến trúc v17.2 là bản Architecture Freeze tuyệt đối và cuối cùng cho 20 năm tới.** Mọi trao đổi thảo luận kiến trúc kết thúc tại đây để tập trung 100% nguồn lực hiện thực hóa mã nguồn sản phẩm.
