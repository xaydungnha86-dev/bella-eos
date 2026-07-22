# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v16.0 MASTER ENTERPRISE FREEZE)`  
> **SPECIFICATION VERSION**: `v16.0`  
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
        ├─► Bella Workers (AI, Human, MCP, API, Script, Robot, External)
        ├─► Bella Connect (Enterprise Connectors & CBV Mapper)
        ├─► Bella SDK (Development Kits)
        └─► Bella Marketplace (Business Skills & SOP Extensions)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho 5 Domains cốt lõi.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu (`CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll`, `BI Dashboard`). EIP là **System of Record** - nơi ghi nhận sự thật (facts), không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ dữ liệu ngoại vi về **Canonical Business Vocabulary (CBV)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động số đa dạng: `AI Worker`, `Human Worker`, `MCP Worker`, `API Worker`, `Script Worker`, `Robot Worker`, `External Company`.
6. **Bella Marketplace**: Nơi phân phối các **Business Skills** và gói quy trình chuẩn **SOP Extensions**.

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

## 3. THỨ BẬC TRI THỨC DOANH NGHIỆP (9-LEVEL HIERARCHY)

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
 🤖 Worker           (AI Worker, Human Worker, MCP, API, Script, Robot, External Company)
```

---

## 4. COMPANY DNA — TÀI SẢN DOANH NGHIỆP 3 TẦNG (INDEPENDENT ASSET)

Company DNA được tổ chức thành 3 tầng độc lập cung cấp tri thức định hướng bất biến cho bộ não:

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPANY DNA ASSET                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. IDENTITY DNA                                                 │
│    • Vision, Mission, Core Values, Corporate Culture            │
│                                                                 │
│ 2. BRAND DNA                                                    │
│    • Voice, Tone, Design Principles, Content Rules, Colors      │
│                                                                 │
│ 3. BUSINESS DNA                                                 │
│    • SOPs, Policies, Approval Matrix, Risk Thresholds,         │
│      KPI Frameworks, Decision Rules                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. PIPELINE XỬ LÝ DỮ LIỆU: ENTERPRISE INGESTION & UNDERSTANDING

Hoạt động tiếp nhận và xử lý đa phương thức được tách hoàn toàn ra khỏi Brain Cognitive Core:

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
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Enterprise Brain (Cognitive Centers)                            │
└─────────────────────────────────────────────────────────────────┘
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
│  • Operational Cache (Local Memory / Redis)            │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 3: Enterprise Brain (6 Pure Cognitive Centers)  │
│  • Memory Center (Operational, Business, Decision)     │
│  • Knowledge Center (Graph, Ontology, Taxonomy, Index) │
│  • Context Center (Isolation, Security, Generator)     │
│  • Reasoning Center (Goal, Logic, Decision, MonteCarlo)│
│  • Learning Center (Evidence, Feedback, SOP Evolution) │
│  • Company DNA Asset (Identity, Brand, Business DNA)   │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 4: Orchestration & Strategy (Process Control)   │
│  Intent ➔ Goal ➔ Strategy ➔ Planning ➔ Workflow        │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 5: Experience Domain (Realtime UI & Alerting)   │
│  • Dashboard, Analytics, Realtime UI, Monitoring,      │
│    Timeline, Alert Engine, CEO Console                 │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Execution Engine (Multi-Agent Workforce & Gateway)     │
│  • AI, Human, MCP, API, Script, Robot, External        │
└────────────────────────────────────────────────────────┘
```

### Chi Tiết Cấu Trúc Các Cognitive Centers trong Brain:

1. **🧠 Memory Center**:
   - `Operational Memory`, `Business Memory`, `Decision Memory`, `Conversation Memory`, `Document Memory`.
2. **🧬 Knowledge Center**:
   - `Knowledge Graph`, `Ontology`, `Taxonomy`, `Semantic Index`, `Entity Registry`, `Relationship Registry`.
3. **📊 Context Center**:
   - `Context Builder`, `Context Optimizer`, `Context Security`, `Context Cache`, `Canonical Context Generator`.
   - *Bảo mật cách ly tuyệt đối — không bao giờ để lộ database thô cho AI.*
4. **⚖️ Reasoning Center**:
   - `Goal Analysis`, `Logical Reasoning`, `Decision Engine`, `Monte Carlo ROI Simulation`.
5. **🧬 Learning Center**:
   - `Experience`, `Evidence`, `Success Pattern`, `Failure Pattern`, `SOP Evolution`, `Prompt Evolution`, `Company Evolution`.
   - *Học hỏi và tiến hóa như một tổ chức doanh nghiệp thực thụ.*

---

## 7. ĐIỀU PHỐI CHIẾN LƯỢC & LUỒNG THỰC THI (ORCHESTRATION FLOW)

```
 CEO Strategic Intent
         │
         ▼
 Goal Definition
         │
         ▼
 Strategy Formulation (Cross-sell, Expansion, Retention...)
         │
         ▼
 Planning Engine (LLM-based Task Decomposition)
         │
         ▼
 Workflow Definition & Stage Mapping
         │
         ▼
 Task Execution & Capability Scheduler
         │
         ▼
 Worker Allocation (AI Worker, Human Worker, MCP, API, Script, Robot, External)
         │
         ▼
 Learning Center Audit & Goal Verification
         │
         ▼
 Experience Domain (Realtime UI, Alerts & CEO Console)
```

---

## 8. 🔒 THE 7 FROZEN CONTRACTS

1. **Bella Kernel Contract**: Kernel chỉ duy trì Runtime, Event Bus và Isolation. Tuyệt đối không chứa business hay AI logic.
2. **Canonical Business Vocabulary (CBV)**: Chuẩn từ vựng kinh doanh dùng chung cho tất cả Bella Connectors.
3. **Enterprise Semantic Model (ESM)**: Chuẩn thực thể ngữ cảnh cố định cho tất cả đối tượng dữ liệu.
4. **Canonical Context Package**: Chuẩn đóng gói ngữ cảnh bảo mật duy nhất gửi đến Workers.
5. **Storage Abstraction Contract**: Brain và Orchestration chỉ tương tác qua Storage Interfaces (`Metadata`, `Vector`, `Blob`, `Graph`, `Cache`).
6. **Internal Event Contract**: Hệ thống sự kiện bất biến giao tiếp giữa các domains (`IntentCreated`, `GoalGenerated`, `StrategyDefined`, `PlanGenerated`, `TaskCreated`, `TaskCompleted`, `GoalVerified`, `EvidenceVerified`, `LearningUpdated`).
7. **Business Skill Contract**: Chuẩn định nghĩa Kỹ năng Doanh nghiệp dùng cho **Bella Marketplace**.

---

## 9. CÔNG NGHỆ & INFRASTRUCTURE CHUẨN

* **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
* **Backend**: Next.js Server API Routes (`/api/*`), TypeScript.
* **Database & Persistence**: Supabase PostgreSQL + Local Storage Fallback.
* **Object Storage**: Supabase Storage.
* **Vector Engine**: pgvector (tích hợp trực tiếp trên PostgreSQL).
* **Knowledge Graph**: PostgreSQL Relation Tables (chỉ chuyển sang Neo4j khi quy mô thực sự cần).
* **Cache Layer**: Local Memory Cache ➔ Redis (Production).
* **AI Executors**: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 2.0 Flash / 2.5 Pro).
* **Triển khai**: Vercel (Dev/Staging) ➔ VPS Ubuntu + Docker + Nginx (Production).

---

## 10. CẤU TRÚC THƯ MỤC CHUẨN MASTER

```
src/
├── app/                        # Next.js App Router (Pages & API Routes)
│   ├── api/
│   │   ├── ai/
│   │   ├── db/
│   │   ├── facebook/
│   │   ├── orchestrator/
│   │   ├── settings/
│   │   ├── ingest/
│   │   └── intent/
│   ├── settings/
│   ├── layout.tsx
│   └── page.tsx                # Experience Domain UI Viewport
│
├── core/                       # Bella EOS Core
│   ├── kernel/                 # Domain 1: Runtime Kernel & Event Bus
│   ├── storage/                # Domain 2: Storage Domain Abstraction
│   │   ├── metadata.ts
│   │   ├── vector.ts
│   │   ├── blob.ts
│   │   ├── graph.ts
│   │   └── cache.ts
│   ├── esm/                    # CBV & ESM Schema Definitions
│   ├── brain/                  # Domain 3: 6 Cognitive Centers & 3-Tier DNA
│   │   ├── memory/
│   │   ├── knowledge/
│   │   ├── context/
│   │   ├── reasoning/
│   │   ├── learning/
│   │   └── dna/                # Identity, Brand, Business DNA
│   ├── pipeline/               # Enterprise Ingestion & Understanding ETL
│   │   ├── document.ts
│   │   ├── media.ts
│   │   └── event.ts
│   ├── orchestration/          # Domain 4: Strategy, Planning & Workflow
│   │   ├── strategy.ts
│   │   ├── planning.ts
│   │   └── workflow.ts
│   ├── experience/             # Domain 5: Experience Domain
│   │   ├── dashboard.ts
│   │   ├── alert.ts
│   │   └── console.ts
│   └── execution/              # Execution Engine & Worker Allocator
│       ├── workers/            # AI, Human, MCP, API, Script, Robot, External
│       └── gateway.ts
│
├── connectors/                 # Bella Connect & CBV Mapper
├── lib/                        # Infrastructure client wrappers
└── types/                      # Shared TS Interfaces & Frozen Contracts
```

---

## 11. NGUYÊN TẮC ARCHITECTURE FREEZE (v16.0)

1. **Linux Kernel Philosophy**: Kernel không bao giờ sửa đổi để thêm tính năng nghiệp vụ hay AI.
2. **Storage Decoupling**: Không bao giờ gọi trực tiếp Supabase client hay PostgreSQL SDK từ các module nhận thức của Brain.
3. **Pure Context Isolation**: AI Workers làm việc trên cùng một **Business Context** thống nhất thông qua **Context Center**, tuyệt đối không tự truy xuất dữ liệu thô.
4. **Strategy-First Orchestration**: Lập kế hoạch luôn phải có tầng **Strategy** nằm giữa Goal và Planning.
5. **No AI Model Lock-in**: AI Worker chỉ là động cơ thực thi có thể thay thế, toàn bộ tài sản và tri thức doanh nghiệp nằm trong **Enterprise Brain**.
