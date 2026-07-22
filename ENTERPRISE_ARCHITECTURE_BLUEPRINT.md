# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `ENTERPRISE GOLD STANDARD FREEZE (v1.5)` • **SPECIFICATION VERSION**: `v15.0`  
> **ENTERPRISE TARGET LIFESPAN**: `2026 - 2046 (20-YEAR ENTERPRISE OPERATING STANDARD)`

---

## 1. HỆ SINH THÁI THƯƠNG HIỆU BELLA AI PLATFORM

Hệ sinh thái được định vị theo mô hình thương hiệu nhiều tầng rõ ràng để phát triển bền vững trong 15-20 năm:

```
                    Bella AI Platform
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   Bella EOS                           Bella EIP
Enterprise Brain                  Business Applications
(System of Orchestration)          (System of Record)
        │
        ├─► Bella Workers (AI & Human Workforce)
        ├─► Bella Connect (Enterprise Connectors)
        ├─► Bella SDK (Development Kits)
        └─► Bella Marketplace (Business Skills & SOP Extensions)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho các dịch vụ nền tảng: `Kernel`, `Storage Domain`, `EOM`, `Brain Centers`, `Orchestration`, `Internal API Gateway` và `Execution`.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu bao gồm `CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll` và `BI Dashboard`. EIP là **System of Record** - nơi ghi nhận dữ liệu thực tế, không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ thuật ngữ ngoại vi về **Canonical Business Vocabulary (CBV)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động số thực hiện các nhiệm vụ được định tuyến dựa theo **Năng lực (Capabilities)** thay vì chỉ định model AI cứng.
6. **Bella Marketplace**: Nơi phân phối các **Business Skills** (Kỹ năng doanh nghiệp) và các gói **SOP Extensions** phân cấp chuẩn.

---

## 2. DỮ LIỆU CHUẨN HÓA: CBV & EOM

Để đảm bảo mọi hệ thống ERP/CRM bên ngoài giao tiếp mượt mà với EOS:

```
[ ERP / CRM / API Ngoại Vi ] 
        │ (SAP, MISA, Facebook, Zalo...)
        ▼
┌────────────────────────────────────────────────────────┐
│ Bella Connect                                          │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│ Canonical Business Vocabulary (CBV)                    │
│ (Revenue, Customer, Booking, Campaign, KPI, ROI,       │
│  Margin, Lead, Invoice, Approval...)                   │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│ Enterprise Object Model (EOM - 13 Frozen Entities)     │
│ (Customer, Employee, Invoice, Campaign, Task, Process, │
│  Document, Decision, Evidence, Asset, Policy,          │
│  Capability, Worker)                                   │
└────────────────────────────────────────────────────────┘
```

---

## 3. THỨ BẬC TRI THỨC DOANH NGHIỆP (ENTERPRISE HIERARCHY)

Hệ thống phân cấp tri thức và thực thi từ cao xuống thấp để vận hành toàn bộ doanh nghiệp và phục vụ **Bella Marketplace**:

```
 🏆 Business Skill (Ví dụ: Launch Product, Spa Operation, Lead Generation, Financial Audit, Customer Recovery)
       │
       ▼
 📜 Standard Operating Procedure (SOP - Gói quy trình chuẩn)
       │
       ▼
 🔄 Workflow (Luồng công việc điều phối)
       │
       ▼
 📌 Task (Nhiệm vụ cụ thể)
       │
       ▼
 ⚖️ Capability (Năng lực yêu cầu)
       │
       ▼
 🤖 Worker (Lực lượng thực thi: AI Agent / Human)
```

---

## 4. COMPANY DNA — TÀI SẢN DOANH NGHIỆP ĐỘC LẬP

Company DNA được tách thành **Tài sản Doanh nghiệp Độc lập (Independent Enterprise Asset)** để cung cấp định hướng cho bộ não và tất cả AI Agents:

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPANY DNA ASSET                          │
├─────────────────────────────────────────────────────────────────┤
│ • Vision & Mission (Tầm nhìn & Sứ mệnh)                        │
│ • Brand Tone & Voice (Tông giọng & Phong cách giao tiếp)         │
│ • Corporate Culture & Values (Văn hóa & Giá trị cốt lõi)        │
│ • Brand Design Principles (Nguyên tắc thiết kế thương hiệu)     │
│ • Forbidden Rules & Anti-Patterns (Quy tắc cấm & Hạn chế)       │
│ • CEO & Board Preferences (Sở thích & Khẩu vị rủi ro của CEO)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. PIPELINE TIẾP NHẬN DỮ LIỆU: ENTERPRISE INGESTION & UNDERSTANDING

Hoạt động tiếp nhận và xử lý dữ liệu thô (ETL) được tách hoàn toàn ra khỏi Brain Cognitive Core để giữ bộ não thuần túy nhận thức:

```
[ Documents / Data / APIs / Email / Audio / Video ]
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Enterprise Ingestion & Understanding Pipeline (ETL)    │
│  OCR ➔ Parser ➔ Chunking ➔ Embedding ➔ Entity Extract │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│ Enterprise Brain (Cognitive Centers)                   │
└────────────────────────────────────────────────────────┘
```

---

## 6. 5 CORE DOMAINS OF BELLA EOS

Architecture Freeze v1.5 quy định 5 miền logic cô lập:

```
┌────────────────────────────────────────────────────────┐
│ Domain 1: Bella Kernel (Runtime & Event Store)         │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 2: Enterprise Storage Domain (Abstract Layer)   │
│  • Metadata Store (PostgreSQL / Relational)            │
│  • Vector Store (pgvector / Embeddings)                │
│  • Blob Store (Document & Asset Storage)               │
│  • Operational Cache (Redis / Key-Value)               │
│  • Graph Index (Knowledge Graph Index)                 │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 3: Enterprise Brain (Pure Cognitive Core)       │
│  • Memory Center (Operational, Business, Decision)     │
│  • Knowledge Center (Graph, Taxonomy, Ontology)        │
│  • Context Center (Selective Isolation & Packages)     │
│  • Reasoning Center (Goal Analysis, Logic, Monte Carlo)│
│  • Learning Center (Feedback, Verification, Mutation)  │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 4: Orchestration (Process Control & Scheduling) │
│  • Intent Engine, Planning Engine, Scheduler           │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Execution (Multi-Agent Workforce & Gateway)  │
│  • Internal API Gateway, Agent Runner, Tool Registry   │
└────────────────────────────────────────────────────────┘
```

### Chi tiết các Cognitive Centers trong Enterprise Brain:
1. **🧠 Memory Center**: Quản lý bộ nhớ vận hành, số liệu kinh doanh, quyết định lịch sử và hội thoại.
2. **🧬 Knowledge Center**: Bản đồ tri thức (Knowledge Graph), sơ đồ phân loại (Taxonomy, Ontology), và bộ chỉ mục tìm kiếm ngữ nghĩa.
3. **📊 Context Center**: Trích xuất dữ liệu, kiểm duyệt bảo mật và biên dịch thành **Canonical Context Packages**. **Context Center không bao giờ để lộ dữ liệu thô (raw database)** cho AI.
4. **⚖️ Reasoning Center**: Phân tích mục tiêu (Goal Analysis), lập luận logic, ra quyết định và chạy mô phỏng dự báo Monte Carlo ROI.
5. **🧬 Learning Center**: Tiếp nhận phản hồi từ **GoalVerificationEngine**, kiểm tra chứng cứ (Evidence), tính toán % hoàn thành mục tiêu, cảnh báo lỗi và tiến hóa SOP (SOP Mutation).

---

## 7. CLOSED-LOOP FLYWHEEL

```
         CEO Strategic Intent
                  │
                  ▼
         AI Orchestrator Planning (LLM-based)
                  │
                  ▼
         Goal Analysis & Monte Carlo Projections
                  │
                  ▼
         Agent Runner & Tool Registry Dispatch
                  │
                  ▼
         Worker Multi-Agent Execution
                  │
                  ▼
         Learning Center: Goal Verification Audit & Disconnection Track
                  │
                  ▼
         Interactive Topology & Task Detail Popup
                  │
                  ▼
         SOP Mutation & Learning Feedback Loop
```

---

## 8. 🔒 THE 6 FROZEN CONTRACTS

1. **Canonical Business Vocabulary (CBV)**: Chuẩn từ vựng kinh doanh dùng chung cho tất cả Connectors.
2. **Enterprise Object Model (EOM)**: Cấu trúc JSON Schema cố định cho 13 thực thể chính.
3. **Canonical Context Package**: Chuẩn đóng gói ngữ cảnh duy nhất gửi đến AI Workers.
4. **Capability Registry**: Chuẩn mô tả năng lực của Worker (định danh, proficient level, SLA, đơn giá token).
5. **Internal Event Contract**: Hệ thống sự kiện bất biến giao tiếp giữa các domains (`IntentCreated`, `GoalGenerated`, `PlanGenerated`, `TaskCreated`, `TaskCompleted`, `GoalVerified`, `EvidenceVerified`, `LearningUpdated`).
6. **Storage Abstraction Interface**: Giao diện lưu trữ chuẩn hóa — Brain Centers gọi qua Storage Interfaces mà không phụ thuộc trực tiếp vào Supabase hay PostgreSQL.

---

## 9. TECHNOLOGY STACK

* **Frontend**: Next.js (App Router), React 19, TypeScript, CSS Modules, Tailwind CSS, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Storage Domain Interfaces**: PostgreSQL (Metadata), pgvector (Vector), Supabase Storage (Blob), Redis/KV (Cache).
* **Security & Auth**: Server-side proxy API routes reading secrets from environment / encrypted DB, masking keys on client.
* **AI Executors**: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 2.0 Flash / 2.5 Pro).
* **Deployment**: Vercel (Development/Staging), VPS Ubuntu + Docker + Nginx (Production).

---

## 10. PROJECT DIRECTORY STRUCTURE

```
src/
├── app/                        # Next.js App Router (Pages & API Routes)
│   ├── api/
│   │   ├── ai/
│   │   │   └── write-post/     # AI Copywriter (OpenAI → Claude → Gemini)
│   │   ├── db/
│   │   │   └── audit/          # Supabase audit ledger writer
│   │   ├── facebook/
│   │   │   └── publish/        # Secure Facebook Graph API proxy route
│   │   ├── orchestrator/
│   │   │   ├── plan/           # Dynamic AI Orchestrator LLM Planner
│   │   │   └── run/            # Agent Runner & Tool Registry Executor
│   │   ├── settings/
│   │   │   └── integrations/   # Integration keys CRUD API
│   │   ├── ingest/route.ts     # Ingestion Pipeline receiver
│   │   └── intent/route.ts     # Intent parser
│   ├── settings/
│   │   └── page.tsx            # Customer Integration Settings UI
│   ├── layout.tsx              # SEO & Font Root Layout
│   └── page.tsx                # Main Dashboard & Interactive Topology UI
│
├── components/                 # React UI Components
│   └── BrainConsoleModal.tsx   # Glassmorphic Brain Console UI
│
├── core/                       # Bella EOS Core (TypeScript)
│   ├── kernel/                 # Domain 1: Kernel Event Store & transaction log
│   ├── storage/                # Domain 2: Storage Domain Abstraction (Metadata, Vector, Blob, Cache)
│   ├── eom/                    # CBV & EOM Schema Validators
│   ├── brain/                  # Domain 3: 5 Brain Cognitive Centers & Company DNA Asset
│   │   ├── memory.ts
│   │   ├── knowledge.ts
│   │   ├── context.ts
│   │   ├── reasoning.ts
│   │   ├── learning.ts         # Includes Goal Verification Audit
│   │   └── dna.ts              # Company DNA Enterprise Asset
│   ├── pipeline/               # Ingestion & Understanding ETL Pipeline
│   │   └── ingestion.ts
│   ├── orchestration/          # Domain 4: Goal trees, Intent, Planning & Scheduler
│   └── execution/              # Domain 5: Agent Runner, Tool Registry & Internal API Gateway
│
├── connectors/                 # Bella Connect (EIP, SAP, MISA, Facebook connectors + CBV Mapper)
│   ├── index.ts
│
├── lib/                        # Supabase client wrapper
│   └── supabase.ts
│
└── types/                      # Shared TS Interfaces
    └── eom.ts                  # Frozen EOM & CBV typings
```

---

## 11. ARCHITECTURE FREEZE COMPLIANCE RULES

1. **Bella EIP is External System of Record**: EIP độc lập bên ngoài, chỉ lưu trữ dữ liệu nghiệp vụ và giao tiếp qua connectors + CBV mapper.
2. **Bella EOS is Enterprise Brain**: Mọi quyết định, lập lịch, kiểm tra chính sách, và tiến hóa của doanh nghiệp đều phải thông qua các Cognitive Centers của EOS.
3. **No Direct DB Access for AI**: AI Workers luôn giao tiếp qua gói Canonical Context bảo mật của Context Center, tuyệt đối không kết nối trực tiếp vào PostgreSQL hay EIP.
4. **Storage Abstraction Enforcement**: Tất cả các Brain Centers phải giao tiếp qua Storage Interfaces của Storage Domain, không hardcode thư viện Supabase/Postgres trong logic nhận thức.
5. **Business Skill Hierarchy**: Định tuyến công việc dựa theo thứ bậc: `Business Skill` ➔ `SOP` ➔ `Workflow` ➔ `Task` ➔ `Capability` ➔ `Worker`.
6. **Goal Verification in Learning Center**: Mọi kết quả thực thi được `Learning Center` kiểm định để đánh giá % hoàn thành mục tiêu, cảnh báo lỗi và kích hoạt đột biến quy trình (SOP Mutation).
7. **Human-in-the-Loop**: Hỗ trợ ngắt tiến trình bất kỳ lúc nào để chuyển quyền duyệt cho CEO/Con người khi phát hiện cảnh báo rủi ro hoặc kiểm định chất lượng (EQE Gate).
