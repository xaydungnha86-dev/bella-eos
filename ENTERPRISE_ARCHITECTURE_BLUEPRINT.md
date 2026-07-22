# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v17.0 20-YEAR ENTERPRISE STANDARD)`  
> **SPECIFICATION VERSION**: `v17.0`  
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
        └─► Bella Marketplace (Enterprise Assets: Skills, SOPs, Prompts, Templates)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho 5 Core Domains.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu (`CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll`, `BI Dashboard`). EIP là **System of Record** - nơi ghi nhận sự thật (facts), không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ dữ liệu ngoại vi về **Canonical Business Vocabulary (CBV)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động thực thi **không lưu trạng thái (Stateless Executors)**: `AI Worker`, `Human Worker`, `MCP Worker`, `API Worker`, `Script Worker`, `Robot Worker`, `External Company`.
6. **Bella Marketplace**: Nơi phân phối các **Enterprise Assets** (`Business Skills`, `SOP Library`, `Prompts`, `Policies`, `Brand Assets`, `Templates`).

---

## 2. CHUẨN HÓA DỮ LIỆU: CBV & ESM

```
[ ERP / CRM / API Ngoại Vi ] (SAP, MISA, Facebook, Zalo...)
        │
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
│ Enterprise Semantic Model (ESM)                        │
│ (Document, Conversation, Email, Video, Meeting, Image, │
│  Voice, Policy, Asset, Task, Decision, Evidence...)    │
└────────────────────────────────────────────────────────┘
```

---

## 3. THỨ BẬC TRI THỨC DOANH NGHIỆP (10-LEVEL HIERARCHY)

Hệ thống phân cấp tri thức và thực thi từ chiến lược cao nhất đến hành động cụ thể:

```
 🏢 Business Domain  (Marketing, Sales, Finance, HR, Operations, R&D)
       │
       ▼
 🏆 Business Skill   (Lead Generation, Customer Recovery, Financial Audit, Product Launch)
       │
       ▼
 📜 SOP              (Quy trình vận hành chuẩn)
       │
       ▼
 🔄 Workflow         (Luồng công việc điều phối)
       │
       ▼
 🎯 Stage            (Giai đoạn thực thi)
       │
       ▼
 📌 Task             (Nhiệm vụ cụ thể)
       │
       ▼
 ⚖️ Capability       (Năng lực yêu cầu)
       │
       ▼
 🔌 Service          (Dịch vụ API / MCP Interface)
       │
       ▼
 🤖 Worker           (AI Worker, Human Worker, MCP, API, Script, Robot, External Company)
```

---

## 4. ENTERPRISE ASSETS & COMPANY DNA 4 TẦNG

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE ASSETS                          │
├─────────────────────────────────────────────────────────────────┤
│ 🧬 COMPANY DNA ASSET (4 Tầng)                                   │
│    ├── 1. Identity DNA (Vision, Mission, Core Values, Culture)  │
│    ├── 2. Brand DNA (Voice, Tone, Design, Content, Colors)      │
│    ├── 3. Business DNA (SOPs, Policies, Risk, Decision Rules)   │
│    └── 4. Operating DNA (Risk Appetite, Delegation Rules,       │
│                           Approval Matrix, Decision Style,      │
│                           Innovation Level, Compliance Level)   │
│                                                                 │
│ 📚 SOP Library         🛡️ Policies           🎨 Brand Assets │
│ 📑 Templates           🏆 Business Skills     🧩 Knowledge    │
│ 📝 Prompts             🧠 Cognitive Packs                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. ENTERPRISE INGESTION & UNDERSTANDING ETL PIPELINE

Mọi dữ liệu đi vào đều được trích xuất ngữ nghĩa và kiểm tra **Confidence Score**:

```
[ Documents, Images, Audio, Video, Email, Meetings, APIs, Databases, Events ]
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Enterprise Ingestion & Understanding Pipeline (ETL)             │
│ ├── Document Understanding   ├── Image Understanding            │
│ ├── Audio Understanding      ├── Video Understanding            │
│ ├── Email Understanding      ├── Meeting Understanding          │
│ ├── API Understanding        ├── Database Understanding         │
│ └── Event Understanding                                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                 [ Confidence Score Check ]
                 ├── Confidence >= 85% ➔ Enterprise Brain
                 └── Confidence <  85% ➔ Human Review Gate ➔ Brain
```

---

## 6. 5 CORE DOMAINS & PRESENTATION ADAPTER LAYER

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
│  • Secrets Store (API Keys, OAuth, Webhooks, Encr.)    │
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
│  Intent ➔ Goal ➔ Strategy ➔ Planning ➔ Workflow        │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Execution Domain (Stateless Workforce Engine)│
│  • Stateless Workers: AI, Human, MCP, API, Robot...    │
│  • Internal API Gateway & Service Allocator            │
└───────────────────────────┬────────────────────────────┘
                            ▼
===================== OUTER ADAPTER LAYER ================
┌────────────────────────────────────────────────────────┐
│ Presentation Layer (Adapters & Portals)                │
│  • CEO Console, Manager Portal, Employee Portal,       │
│    Customer Portal, Realtime Dashboard, Mobile, Voice  │
└────────────────────────────────────────────────────────┘
```

### Chi Tiết Cấu Trúc Các Cognitive Centers trong Brain:

1. **🧠 Memory Center (Cognitive Science Standard)**:
   - `Working Memory`, `Episodic Memory`, `Semantic Memory`, `Procedural Memory`, `Business Memory`.
2. **🧬 Knowledge Center (Anti-Hallucination Framework)**:
   - `Knowledge Graph`, `Ontology`, `Taxonomy`, `Semantic Index`, `Entity Registry`, `Relationship Registry`.
   - Anti-hallucination suite: `Knowledge Confidence`, `Knowledge Source`, `Knowledge Freshness`, `Knowledge Provenance`.
3. **📊 Context Center**:
   - `Context Builder` ➔ `Context Ranking` ➔ `Context Compression` ➔ `Context Validation` ➔ `Canonical Context Package`.
   - *Tối ưu bớt 90% token lãng phí & bảo mật tuyệt đối dữ liệu thô.*
4. **⚖️ Reasoning Center (Enterprise Solvers)**:
   - `Goal Analysis`, `Logical Reasoning`, `Decision Engine`, `Monte Carlo ROI Simulation`.
   - Enterprise Solvers: `Constraint Solver`, `Trade-off Engine`, `What-if Engine`.
5. **🧬 Learning Center**:
   - `Experience`, `Evidence`, `Success Pattern`, `Failure Pattern`, `SOP Evolution`, `Company Evolution`.
   - Learning Loop: `Evidence` ➔ `CEO/Human Review Gate` ➔ `Learning & SOP Mutation`.

---

## 7. STATELESS WORKERS & CONTEXT TOKEN OPTIMIZER

1. **Stateless Workers Rules**:
   - Workers **tuyệt đối KHÔNG được lưu bộ nhớ**, conversation, hay context.
   - Worker nhận `Canonical Context Package` ➔ Thực thi ➔ Trả `Evidence` ➔ Xóa bộ nhớ RAM.
   - Toàn bộ trí nhớ doanh nghiệp nằm 100% trong **Enterprise Brain**.

2. **Context Token Optimizer**:
   - `Context Builder` ➔ `Token Optimizer` ➔ `Canonical Context Package`.
   - Giảm 90% lượng token lãng phí bằng cách loại bỏ tri thức không thuộc phạm vi công việc.

---

## 8. 🔒 THE 13 FROZEN ARCHITECTURE PRINCIPLES (v17.0)

1. **Bella EOS is Enterprise Brain**: Không tự làm nghiệp vụ ERP/EIP.
2. **Bella EIP & Systems of Record**: Cung cấp dữ liệu sự thật thông qua Bella Connect.
3. **Enterprise Brain is Sole Stateful Core**: Trí nhớ, tri thức và bối cảnh duy nhất của doanh nghiệp.
4. **Stateless Executors**: AI Workers chỉ là động cơ thực thi có thể thay thế, xóa RAM ngay sau khi hoàn thành.
5. **Capability ➔ Service ➔ Worker Chain**: Chuỗi phân tách cố định giúp dễ dàng đổi Worker/MCP mà không sửa Capability.
6. **Context Center Security & Token Optimizer**: Trái tim bảo mật và tối ưu 90% token trước khi chuyển sang AI.
7. **Presentation Outer Layer**: Presentation chỉ là Layer hiển thị (Adapter), không phải Core Domain.
8. **Domain 5 is Execution Domain**: Quản lý lực lượng lao động số đa dạng và API Gateway.
9. **Prompts are Enterprise Assets**: Prompts nằm trong Enterprise Assets, Brain đọc Prompt như tài nguyên.
10. **4-Tier Company DNA Asset**: Bao gồm `Identity`, `Brand`, `Business` và `Operating DNA`.
11. **Understanding Confidence Gate**: Nếu Confidence Score < 85%, bắt buộc qua Human Review trước khi nạp vào Brain.
12. **Human Feedback Loop**: Evidence ➔ CEO/Human Review Gate ➔ Learning & SOP Mutation.
13. **Secrets Store Isolation**: Quản lý API Keys, OAuth Tokens và Encryption Keys độc lập khỏi DB Metadata.

---

## 9. CÔNG NGHỆ CHUẨN

* **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Storage Domain Interfaces**: PostgreSQL (Metadata), pgvector (Vector), Supabase Storage (Blob), Secrets Store, Redis/KV (Cache).
* **AI Executors**: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 2.0 Flash / 2.5 Pro).
* **Triển khai**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 10. ARCHITECTURE FREEZE COMPLIANCE

> **Bản kiến trúc v17.0 là bản Architecture Freeze chính thức duy nhất cho 20 năm tới.** Từ thời điểm này, mọi hoạt động phát triển chỉ bổ sung tính năng bên trong các module đã đóng băng, tuyệt đối không thay đổi cấu trúc Domain và 13 Hợp đồng cốt lõi.
