# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `FINAL ARCHITECTURE FREEZE (v17.1 20-YEAR GOLDEN STANDARD)`  
> **SPECIFICATION VERSION**: `v17.1`  
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
4. **Bella Connect**: Lớp kết nối ngoại vi (Google Analytics, Facebook, Zalo, TikTok, MISA, SAP, Odoo, Salesforce...). Chuẩn hóa toàn bộ dữ liệu ngoại vi về **Canonical Business Vocabulary (CBV)** trước khi chuyển vào EOS.
5. **Bella Workers**: Lực lượng lao động thực thi **không lưu trạng thái (Stateless Executors)**: `AI Worker`, `Human Worker`, `MCP Worker`, `API Worker`, `Script Worker`, `Robot Worker`, `External Company`.
6. **Bella Marketplace**: Nơi phân phối các **Enterprise Assets** (`Skills`, `SOP Library`, `DNA Packs`, `Prompt Packs`, `Connector Packs`, `Workflow Packs`, `Templates`).

---

## 2. CHUẨN HÓA DỮ LIỆU: CBV & EOM

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
│ Enterprise Object Model (EOM - Frozen 13 Entities)     │
│ (Customer, Employee, Invoice, Campaign, Task, Process, │
│  Document, Decision, Evidence, Asset, Policy,          │
│  Capability, Worker)                                   │
└────────────────────────────────────────────────────────┘
```

---

## 3. THỨ BẬC TRI THỨC DOANH NGHIỆP (11-LEVEL HIERARCHY)

Hệ thống phân cấp tri thức và thực thi từ chiến lược cao nhất đến hành động cụ thể:

```
 🏢 Business Domain     (Marketing, Sales, Finance, HR, Operations, R&D)
       │
       ▼
 🏆 Business Skill      (Lead Generation, Customer Recovery, Financial Audit, Product Launch)
       │
       ▼
 📜 SOP                 (Quy trình vận hành chuẩn)
       │
       ▼
 🔄 Workflow            (Luồng công việc điều phối)
       │
       ▼
 🎯 Stage               (Giai đoạn thực thi)
       │
       ▼
 📌 Task                (Nhiệm vụ cụ thể)
       │
       ▼
 ⚖️ Capability          (Năng lực yêu cầu)
       │
       ▼
 📜 Service Contract    (Giao diện hợp đồng dịch vụ)
       │
       ▼
 🔌 Service             (Dịch vụ API / MCP Implementation)
       │
       ▼
 🤖 Worker              (AI Worker, Human Worker, MCP, API, Script, Robot, External Company)
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
│ 📝 Prompt Packs        🔌 Connector Packs     🔄 Workflow Packs│
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

## 7. STRATEGY SIMULATION & STATELESS WORKERS

1. **Simulation Engine in Planner**:
   - `Goal` ➔ `Strategy` ➔ `Simulation (Monte Carlo ROI / Trade-off)` ➔ `Planning` ➔ `Workflow`.
   - Chạy mô phỏng trước để chọn phương án tối ưu trước khi sinh Workflow thực tế.

2. **Stateless Workers & Token Optimizer**:
   - Workers **tuyệt đối KHÔNG lưu bộ nhớ**, xóa RAM ngay sau khi gửi Evidence.
   - `Token Optimizer` loại bỏ 90% token dư thừa trước khi tạo `Canonical Context Package`.

---

## 8. 🔒 THE 13 FROZEN ARCHITECTURE PRINCIPLES (v17.1)

1. **Bella EOS is Enterprise Brain**: Không tự làm nghiệp vụ ERP/EIP.
2. **Bella EIP & Systems of Record**: Cung cấp dữ liệu sự thật thông qua Bella Connect.
3. **Enterprise Brain is Sole Stateful Core**: Trí nhớ, tri thức và bối cảnh duy nhất của doanh nghiệp.
4. **Stateless Executors**: AI Workers chỉ là động cơ thực thi có thể thay thế, xóa RAM ngay sau khi hoàn thành.
5. **Capability ➔ Service Contract ➔ Service ➔ Worker Chain**: Tách biệt giao diện hợp đồng và triển khai thực tế.
6. **Context Center Security & Token Optimizer**: Trái tim bảo mật và tối ưu 90% token trước khi chuyển sang AI.
7. **Presentation Outer Layer**: Presentation chỉ là Layer hiển thị (Adapter), không phải Core Domain.
8. **Domain 5 is Execution Domain**: Quản lý Service Contracts, lực lượng lao động số và API Gateway.
9. **Prompts & DNA Packs are Enterprise Assets**: Nằm trong Enterprise Assets Suite cho Bella Marketplace.
10. **4-Tier Company DNA Asset**: Bao gồm `Identity`, `Brand`, `Business` và `Operating DNA`.
11. **Understanding Confidence Gate**: Nếu Confidence Score < 85%, bắt buộc qua Human Review trước khi nạp vào Brain.
12. **Simulation Before Planning**: Chạy mô phỏng tối ưu hóa chiến lược trước khi lập kế hoạch Workflow.
13. **Secrets Store at Infrastructure Layer**: Tách biệt quản lý khóa bí mật khỏi Storage Domain.

---

## 9. CÔNG NGHỆ & BẢNG GIÁ DỰ DÁN (FREE-FIRST TECH STACK)

| Thành phần | Công nghệ | Chi phí giai đoạn đầu |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) + React + TypeScript | 0 VNĐ |
| **UI Framework** | Tailwind CSS + shadcn/ui + Framer Motion | 0 VNĐ |
| **Icons** | Lucide Icons | 0 VNĐ |
| **Backend** | Next.js Server API Routes | 0 VNĐ |
| **Database** | Supabase PostgreSQL | 0 VNĐ (Free Tier) |
| **Blob Storage** | Supabase Storage | 0 VNĐ (Free Tier) |
| **Vector Engine** | pgvector trên Supabase | 0 VNĐ |
| **Auth & Realtime**| Supabase Auth & Realtime | 0 VNĐ |
| **Hosting (Dev)** | Vercel | 0 VNĐ (Free Tier) |
| **Production** | VPS Ubuntu + Docker + Nginx | ~150k - 300k VNĐ/tháng |

---

## 10. ARCHITECTURE FREEZE COMPLIANCE

> **Bản kiến trúc v17.1 là bản Architecture Freeze duy nhất và tuyệt đối cho 20 năm tới.** Từ thời điểm này, mọi hoạt động phát triển chỉ bổ sung tính năng bên trong các module đã đóng băng, chuyển trọng tâm sang xây dựng mã nguồn thực tế và kiểm thử hệ thống.
