# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v16.1 ENTERPRISE GOLD MASTER)`  
> **SPECIFICATION VERSION**: `v16.1`  
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
        └─► Bella Marketplace (Enterprise Assets: Skills, SOPs, Templates)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho 5 Domains cốt lõi.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu (`CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll`, `BI Dashboard`). EIP là **System of Record** - nơi ghi nhận sự thật (facts), không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ dữ liệu ngoại vi về **Canonical Business Vocabulary (CBV)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động thực thi **không lưu trạng thái (Stateless Executors)**: `AI Worker`, `Human Worker`, `MCP Worker`, `API Worker`, `Script Worker`, `Robot Worker`, `External Company`.
6. **Bella Marketplace**: Nơi phân phối các **Enterprise Assets** (`Business Skills`, `SOP Library`, `Policies`, `Brand Assets`, `Templates`).

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

*Ví dụ:*
`Marketing` (Domain) ➔ `Lead Generation` (Skill) ➔ `Facebook Ads SOP` (SOP) ➔ `Launch Campaign` (Workflow) ➔ `Creative` (Stage) ➔ `Write Copy` (Task) ➔ `Publishing` (Capability) ➔ `Facebook Graph API` (Service) ➔ `Apollo Agent` (Worker).

---

## 4. ENTERPRISE ASSETS & COMPANY DNA 3 TẦNG

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE ASSETS                          │
├─────────────────────────────────────────────────────────────────┤
│ 🧬 COMPANY DNA ASSET                                            │
│    ├── 1. Identity DNA (Vision, Mission, Core Values, Culture)  │
│    ├── 2. Brand DNA (Voice, Tone, Design, Content, Colors)      │
│    └── 3. Business DNA (SOPs, Policies, Risk, Decision Rules)   │
│                                                                 │
│ 📚 SOP Library         🛡️ Policies           🎨 Brand Assets │
│ 📑 Templates           🏆 Business Skills     🧩 Knowledge    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. ENTERPRISE INGESTION & UNDERSTANDING ETL PIPELINE

Mọi dữ liệu đi vào đều được trích xuất ngữ nghĩa và đánh giá **Confidence Score**:

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

## 6. 5 CORE DOMAINS OF BELLA EOS

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
│  • Memory Center & Memory API Layer                    │
│  • Knowledge Center (Graph, Ontology, Taxonomy, Index) │
│  • Context Center (Isolation, Token Optimizer)         │
│  • Reasoning Center (Goal, Logic, Decision, MonteCarlo)│
│  • Learning Center (Evidence, Feedback, SOP Evolution) │
│  • Prompt Center (Versions, Templates, Evaluation)     │
│  • Enterprise Policy Engine (GDPR, ISO, Approvals)     │
│  • Enterprise Assets & Company DNA Asset               │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 4: Orchestration & Strategy (Process Control)   │
│  Intent ➔ Goal ➔ Strategy ➔ Planning ➔ Workflow        │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Presentation Domain (Consoles & UI Portals)  │
│  • CEO Console, Manager Console, Employee Portal,      │
│    Customer Portal, Realtime Dashboard & Alert Engine  │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Execution Engine (Multi-Agent Workforce & Gateway)     │
│  • STATELESS Workers: AI, Human, MCP, API, Robot...    │
└────────────────────────────────────────────────────────┘
```

---

## 7. STATELESS WORKERS & CONTEXT TOKEN OPTIMIZER

1. **Stateless Workers Rules**:
   - Workers **tuyệt đối KHÔNG được lưu bộ nhớ**, conversation, hay context.
   - Worker nhận `Canonical Context Package` ➔ Thực thi ➔ Trả `Evidence` ➔ Xóa bộ nhớ RAM.
   - Toàn bộ trí nhớ doanh nghiệp nằm 100% trong **Enterprise Brain**.

2. **Context Token Optimizer**:
   - `Context Builder` ➔ `Token Optimizer` ➔ `Canonical Context Package`.
   - Giảm 90% lượng token lãng phí bằng cách loại bỏ tri thức không thuộc phạm vi công việc.

```
[ CEO Query ] ➔ Context Builder ➔ Token Optimizer (-90% Tokens) ➔ Canonical Context Package ➔ Stateless Worker
```

---

## 8. 🔒 THE 13 FROZEN ARCHITECTURE PRINCIPLES (v16.1)

1. **Bella EOS is Enterprise Brain**: Không tự làm nghiệp vụ ERP/EIP.
2. **Bella EIP & Systems of Record**: Cung cấp dữ liệu sự thật thông qua Bella Connect.
3. **Enterprise Brain is Sole Stateful Core**: Trí nhớ, tri thức và bối cảnh duy nhất của doanh nghiệp.
4. **Stateless Executors**: AI Workers chỉ là động cơ thực thi có thể thay thế, xóa RAM sau khi hoàn thành.
5. **Capability ➔ Service ➔ Worker Chain**: Chuỗi phân tách cố định giúp dễ dàng đổi Worker/MCP mà không sửa Capability.
6. **Context Center Security & Token Optimizer**: Trái tim bảo mật và tối ưu 90% token trước khi chuyển sang AI.
7. **Presentation Domain Isolation**: Tách biệt hoàn toàn lớp giao diện và API UI ra khỏi Execution Engine.
8. **Memory API Layer**: Brain gọi qua Memory API, không truy cập kho bộ nhớ trực tiếp.
9. **Prompt Center Asset**: Prompt được quản lý phiên bản, template và A/B testing như tài sản doanh nghiệp.
10. **Understanding Confidence Gate**: Nếu Confidence Score < 85%, bắt buộc qua Human Review trước khi nạp vào Brain.
11. **Human Feedback Loop**: Evidence ➔ CEO/Human Review Gate ➔ Learning & SOP Mutation.
12. **Secrets Store Isolation**: Quản lý API Keys, OAuth Tokens và Encryption Keys độc lập khỏi DB Metadata.
13. **Multi-Role Portals**: Cung cấp CEO Console, Manager Console, Employee Portal, Customer Portal và Realtime Dashboard.

---

## 9. CÔNG NGHỆ CHUẨN

* **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Storage Domain Interfaces**: PostgreSQL (Metadata), pgvector (Vector), Supabase Storage (Blob), Secrets Store, Redis/KV (Cache).
* **AI Executors**: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 2.0 Flash / 2.5 Pro).
* **Triển khai**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 10. ARCHITECTURE FREEZE COMPLIANCE

> **Bản kiến trúc v16.1 là bản Architecture Freeze duy nhất và chính thức cho 15-20 năm tới.** Từ thời điểm này, mọi hoạt động phát triển chỉ bổ sung tính năng bên trong các module đã đóng băng, tuyệt đối không thay đổi cấu trúc Domain và 13 Hợp đồng cốt lõi.
