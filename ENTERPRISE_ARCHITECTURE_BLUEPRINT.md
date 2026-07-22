# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `ARCHITECTURE FREEZE (v1.0)` • **SPECIFICATION VERSION**: `v13.0`  
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
        └─► Bella Marketplace (SOP & Extensions)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Enterprise Operating System - Lõi Điều hành)**: Đóng vai trò là **Enterprise Brain** điều hành toàn bộ doanh nghiệp. Chịu trách nhiệm cho các dịch vụ nền tảng: `Kernel`, `EOM`, `Brain Centers`, `Orchestration`, `Internal API Gateway` và `Execution`.
3. **Bella EIP (Enterprise Integration Platform / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu bao gồm `CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll` và `BI Dashboard`. EIP là **System of Record** - nơi ghi nhận dữ liệu thực tế, không tự đưa ra quyết định hay lập kế hoạch.
4. **Bella Workers**: Lực lượng lao động số thực hiện các nhiệm vụ được định tuyến dựa theo **Năng lực (Capabilities)** thay vì chỉ định model AI cứng.
5. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, MISA, SAP...) dịch chuyển về mô hình dữ liệu chuẩn của EOS.
6. **Bella SDK**: Nền tảng mở cho phép lập trình viên tích hợp các executor và adapter mới.
7. **Marketplace**: Nơi phân phối các gói SOP chuẩn và extension.

---

## 2. 4 CORE DOMAINS OF BELLA EOS

Kiến trúc được phân tách thành 4 miền logic (domains) độc lập:

```
┌────────────────────────────────────────────────────────┐
│ Domain 1: Bella Kernel (Runtime Foundation)            │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Enterprise Object Model (Common Grammar)               │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 2: Enterprise Brain (6 Cognitive Centers)       │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 3: Orchestration (Process Control & Scheduling) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Internal API Gateway (Unified Adapter Interfaces)      │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ Domain 4: Execution (Executor Coordinator)             │
└────────────────────────────────────────────────────────┘
```

### Domain 1: Bella Kernel
* **Trách nhiệm**: Nền tảng runtime hệ thống, quản lý định danh, phân quyền, giao dịch, nhật ký kiểm toán (audit logs) và luồng phân phối sự kiện hệ thống. Kernel hoàn toàn độc lập với các khái niệm kinh doanh hay AI.

### Enterprise Object Model (EOM)
* **Trách nhiệm**: Ngôn ngữ chung của toàn bộ nền tảng. Tất cả các dữ liệu, tài liệu, kết quả đánh giá, và lệnh điều hành đều được chuẩn hóa thành các thực thể EOM trước khi đưa vào bộ não xử lý.
* **13 EOM Entities**: `Customer`, `Employee`, `Invoice`, `Campaign`, `Task`, `Process`, `Document`, `Decision`, `Evidence`, `Asset`, `Policy`, `Capability`, `Worker`.

### Domain 2: Enterprise Brain (6 Cognitive Centers)
* **Trách nhiệm**: Trái tim thông minh của hệ thống. Hiểu doanh nghiệp hoạt động thế nào, mục tiêu là gì, và cần học hỏi gì tiếp theo.
* **6 Brain Centers**:
  1. **🧠 Memory Center**: Bộ nhớ hoạt động (Operational), Bộ nhớ số liệu (Business), Bộ nhớ quyết định (Decision), Bộ nhớ hội thoại (Conversation) và Bộ nhớ tài liệu (Document).
  2. **🧠 Understanding Center**: **Enterprise Understanding Center** chịu trách nhiệm phân tích thông tin thô từ mọi nguồn dữ liệu (Documents, Database, API, CRM, ERP, Meetings, Email, Chat, Audio, Video) thành tri thức cấu trúc.
  3. **🧬 Knowledge Center**: Bản đồ tri thức (Knowledge Graph), Company DNA, sơ đồ phân loại (Taxonomy, Ontology), và bộ chỉ mục tìm kiếm ngữ nghĩa.
  4. **📊 Context Center**: Trích xuất dữ liệu, kiểm duyệt bảo mật và biên dịch thành **Canonical Context Packages**. **Context Center không bao giờ để lộ dữ liệu thô (raw database)** cho AI.
  5. **⚖️ Reasoning Center**: Phân rã mục tiêu (Goal Decompose), lập kế hoạch, kiểm tra tuân thủ chính sách (Policy Check) và chạy mô phỏng dự báo Monte Carlo.
  6. **🧬 Learning Center**: Phân tích kết quả thực thi (Evidence), cập nhật DNA và tối ưu hóa SOP (SOP Mutation).

### Domain 3: Orchestration
* **Trách nhiệm**: Tiếp nhận ý chí của CEO (Intent), phân rã thành OKR và lập lịch thực thi dựa trên năng lực.
* **Thành phần**: Intent Engine, Goal Engine, Planning Engine, Workflow Runtime, Policy Engine, Capability Scheduler.

### Internal API Gateway
* **Trách nhiệm**: Hợp đồng giao tiếp trung gian (Internal API Gateway). Decouple toàn bộ quy trình lập kế hoạch khỏi lớp mô hình thực thi cụ thể.

### Domain 4: Execution
* **Trách nhiệm**: Điều phối lực lượng lao động (Workers). **Execution / Workers tuyệt đối không được truy cập trực tiếp vào Brain/Database**, mà chỉ thực thi dựa trên gói Canonical Context được Gateway gửi sang.

---

## 3. CLOSED-LOOP FLYWHEEL & INGESTION PIPELINE

### 1. Vòng lặp Học hỏi Tự động (Closed-Loop Learning Flywheel)
```
         CEO Strategic Intent
                  │
                  ▼
         Goal Decompose & OKRs
                  │
                  ▼
         Monte Carlo ROI Projections
                  │
                  ▼
         Capability Scheduling & Routing
                  │
                  ▼
         Internal API Gateway Dispatch
                  │
                  ▼
         Worker Execution
                  │
                  ▼
         Quality Review (EQE) & Evidence Verification
                  │
                  ▼
         SOP Mutation & Learning Loop
```

### 2. Ingestion & Understanding Pipeline
Pipeline tự động hóa việc đưa tri thức vào bộ não doanh nghiệp mà không cần nhập liệu thủ công:
```
Upload Document ➔ OCR ➔ Parser ➔ Normalizer ➔ Classification ➔ Chunking ➔ Embedding ➔ Entity Extraction ➔ Relationship Builder ➔ Knowledge Graph Sync ➔ Memory Update ➔ Company DNA Sync
```

---

## 4. 🔒 THE 5 FROZEN CONTRACTS

Để đảm bảo hệ thống có tuổi thọ từ 15-20 năm mà không phát sinh lỗi tương thích ngược, 5 hợp đồng kiến trúc sau đây chính thức được đóng băng:

1. **Enterprise Object Model (EOM)**: Cấu trúc JSON Schema cố định cho 13 thực thể chính để tất cả các thành phần giao tiếp chung một ngôn ngữ.
2. **Canonical Context Package**: Chuẩn đóng gói ngữ cảnh duy nhất gửi đến AI Workers (chỉ chứa dữ liệu lọc bảo mật và đã được rút gọn tối ưu token).
3. **Capability Registry**: Chuẩn mô tả năng lực của Worker (định danh, proficient level, SLA, đơn giá token).
4. **Internal Event Contract**: Hệ thống sự kiện bất biến giao tiếp giữa các domains (`IntentCreated`, `GoalGenerated`, `PlanGenerated`, `TaskCreated`, `TaskCompleted`, `EvidenceVerified`, `LearningUpdated`).
5. **Internal API Contract**: Giao diện (Interface) các dịch vụ cốt lõi:
   - *Context API*
   - *Memory API*
   - *Planning API*
   - *Execution API*
   - *Learning API*

---

## 5. TECHNOLOGY STACK (FREE-FIRST & SCALABLE)

* **Frontend**: Next.js (App Router), React, TypeScript, CSS Modules, Framer Motion, Three.js (React Three Fiber).
* **Backend**: Next.js Route Handlers, TypeScript.
* **Database & Persistence**: Supabase PostgreSQL.
* **Object Storage**: Supabase Storage (SOPs, PDF, DOCX, media assets).
* **Vector Database (RAG)**: pgvector trên Supabase.
* **Authentication**: Supabase Auth (với Row Level Security - RLS).
* **File Parsing & OCR**: PDF.js, Mammoth (DOCX), xlsx, Tesseract.js.
* **AI Executors**: Hermes (Local/VPS execution node), Claude, GPT, Gemini.
* **Deployment**: Vercel (Development/Staging), VPS Ubuntu + Docker + Nginx (Production).

---

## 6. PROJECT DIRECTORY STRUCTURE

Dự án Next.js được tổ chức cấu trúc file theo mô hình domain cô lập như sau:

```
src/
├── app/                        # Next.js App Router (Pages & API Routes)
│   ├── api/
│   │   ├── intent/route.ts     # Parses intents & maps OKR goals
│   │   ├── ingest/route.ts     # Ingestion & Understanding receiver
│   │   └── execution/route.ts  # Dispatch API Gateway commands
│   ├── layout.tsx
│   └── page.tsx                # Main Dashboard UI
│
├── components/                 # React UI Components
│   ├── OfficeViewport.tsx      # 3D Office Environment (Three.js)
│   └── BrainConsoleModal.tsx   # Glassmorphic Brain Console UI
│
├── core/                       # Bella EOS Core (TypeScript)
│   ├── kernel/                 # Domain 1: Kernel Event Store & transaction log
│   ├── eom/                    # EOM Schema Validators
│   ├── brain/                  # Domain 2: 6 Brain Cognitive Centers
│   │   ├── memory.ts
│   │   ├── understanding.ts
│   │   ├── knowledge.ts
│   │   ├── context.ts
│   │   ├── reasoning.ts
│   │   ├── learning.ts
│   │   └── index.ts            # Facade exports
│   ├── orchestration/          # Domain 3: Goal trees, Intent, & Scheduler
│   └── execution/              # Domain 4: Execution Coordinator & API Gateway
│
├── connectors/                 # Bella Connect (EIP, SAP, MISA, Facebook, Google connectors)
│   ├── eip-connector.ts
│   ├── sap-connector.ts
│   ├── index.ts
│
├── lib/                        # Supabase client wrapper
│   └── supabase.ts
│
└── types/                      # Shared TS Interfaces
    └── eom.ts                  # Frozen EOM typings
```

---

## 7. ARCHITECTURE FREEZE COMPLIANCE RULES

1. **Bella EIP is External System of Record**: Trực thuộc Bella EIP độc lập bên ngoài, chỉ lưu trữ dữ liệu nghiệp vụ và giao tiếp qua connectors, không nằm trong lõi EOS.
2. **Bella EOS is Enterprise Brain**: Mọi quyết định, lập lịch, kiểm tra chính sách, và tiến hóa của doanh nghiệp đều phải thông qua các Cognitive Centers của EOS.
3. **No Direct DB Access for AI**: AI Workers luôn giao tiếp qua gói Canonical Context bảo mật của Context Center, tuyệt đối không kết nối trực tiếp vào PostgreSQL của EIP hay ERP bên ngoài.
4. **Capability-based Routing**: Điều phối công việc tự động dựa trên Năng lực, không gán tĩnh theo tên model AI để dễ dàng nâng cấp mô hình AI trong tương lai.
5. **Human-in-the-Loop**: Hỗ trợ ngắt tiến trình bất kỳ lúc nào để chuyển quyền duyệt cho CEO/Con người khi phát hiện cảnh báo rủi ro hoặc kiểm định chất lượng (EQE Gate).
