# 🏛️ BELLA AI PLATFORM
## Hệ sinh thái AI vận hành doanh nghiệp tự trị v11.0

> **Định Vị Thương Hiệu Nhiều Tầng (Brand Hierarchy)**:
> 
> * **Bella AI Platform**: Thương hiệu tổng của toàn bộ hệ sinh thái AI dành cho doanh nghiệp.
> * **Bella EOS (Enterprise Operating System)**: Bộ não điều hành doanh nghiệp (Lõi Kernel, Quy trình SOP, Phân quyền, Policy, Memory, Học hỏi tiến hóa).
> * **Bella EIP (Enterprise Integration Platform / Business Suite)**: Hệ thống quản trị nghiệp vụ sinh dữ liệu (`CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll`, `BI`).
> * **Bella Workers**: Lực lượng lao động số AI (các Agent trực tiếp nhận việc).
> * **Hermes / Codex / Adapters**: Lớp thực thi kỹ thuật (Execution Engine).
> 
> *Khi giới thiệu với khách hàng:* **"Bella AI Platform là nền tảng AI dành cho doanh nghiệp. Trong đó, Bella EOS là bộ não điều hành, Bella EIP là hệ thống nghiệp vụ và dữ liệu, các AI Workers là lực lượng lao động số trực tiếp thực thi qua lớp Hermes."**

---

## 📚 Bộ Tài Liệu Định Hướng Dự Án

- 📘 **[ENTERPRISE_ARCHITECTURE_BLUEPRINT.md](file:///d:/Antigravity/Projects/DN%20WORKFLOW/ENTERPRISE_ARCHITECTURE_BLUEPRINT.md)**: Bản Thiết Kế Master về Kiến trúc Doanh nghiệp 10 Lớp, Enterprise Policy Engine, Gốc Dự Án (Project-First Core), Decision Log Audit Trail, Tri thức Doanh nghiệp tích lũy (Business Memory) và Bảng Điều Hành Sức Khỏe CEO.

---

## 🏛️ Sơ Đồ Kiến Trúc Doanh Nghiệp 10 Lớp (10-Layer Enterprise OS v11.0)

```
Enterprise OS (Bella EOS)
├── 🎯 1. Human Layer (CEO / HĐQT / Human-in-the-Loop Approval Gates)
├── 📢 2. AI CEO Layer (Strategic Vision & Enterprise Directive Definition)
├── 📈 3. Goal Engine (OKR & Cross-Department Goal Decomposition Core)
├── 🗃️ 4. AI COO Layer (Portfolio Management & Operational Coordination)
├── 🗺️ 5. Planning Engine (Multi-Agent Task Dependency Graph & DAG Generator)
├── 🔄 6. Workflow Engine / Process Runtime (State Machine & Stage Execution)
├── 🛡️ 7. Policy Engine (Compliance, Risk Matrix & Realtime Guardrails)
├── 🧠 8. Enterprise Intelligence Layer (EIL - Multi-Dimensional Context)
├── 🔌 9. Execution Adapter Layer (Pluggable Manager Interface)
└── 🤖 10. Execution Runtimes (Hermes • Codex • Claude Code • OpenHands)
```

---

## 🗺️ Lộ Trình 5 Phase Thực Thi Chiến Lược (10-Year Strategic Roadmap)

| Phase | Module / System | Mục Tiêu Kỹ Thuật & Nghiệp Vụ Vận Hành |
| :--- | :--- | :--- |
| **Phase 1** | **Organization OS** | Xây dựng Cơ cấu Tổ chức, Unified Workforce Registry (`Human` + `AI`), Role Matrix & Capability Permissions. |
| **Phase 2** | **Project & Workflow OS** | Quản trị Gốc Dự án (Project-First Hub), Strategic Objectives, Task Contracts, Standard DoD & Workflow DAG Graph. |
| **Phase 3** | **Knowledge, Decision & Policy OS** | Enterprise Business Memory, SOPs Tree, Decision Log Audit Trail & **Enterprise Policy Engine** (Guardrails & Sign-off). |
| **Phase 4** | **Business Applications OS** | Tích hợp **Bella EIP Suite** (EIP, CRM, POS, HR, Finance) làm First-party Business App & Cổng kết nối Third-party (SAP, Oracle, Salesforce). |
| **Phase 5** | **Autonomous Enterprise OS** | Vận hành Tự trị Toàn diện: `Objective` $\rightarrow$ `AI COO` $\rightarrow$ `Dynamic Projects` $\rightarrow$ `OKRs` $\rightarrow$ `Continuous Learning` $\rightarrow$ `Self Optimization`. |

---

## 📦 Đóng Gói & Triển Khai Production (Deployment Options)

### 1. Triển khai 1-Click với Docker Compose (Khuyên dùng cho Enterprise Server)
```bash
# Build & Khởi chạy Container Production
docker-compose up -d --build

# Kiểm tra trạng thái ứng dụng trên cổng 3000
docker ps
```

### 2. Triển khai Cloud Hosting Vercel / Netlify
* Dự án đã sẵn sàng với cấu hình `vercel.json`.
* Đẩy mã nguồn lên GitHub/GitLab và kết nối với Vercel để nhận đường link **Go-Live SSL HTTPS** tự động.

### 3. Khởi chạy bằng Node.js / NPM local
```bash
# Cài đặt phụ thuộc & Chạy Production Server
npm install
npm start
```

## 🚀 Hướng Dẫn Vận Hành Ứng Dụng Chạy Trên Localhost

1. Khởi động Web Server (nếu chưa chạy):
   ```bash
   npx serve . -p 3000
   ```
2. Truy cập trình duyệt tại địa chỉ: **`http://localhost:3000`**
3. Màn hình hiển thị giao diện điều hành **`BELLA AI PLATFORM – Enterprise Operating Model`** với bộ chỉ số **Business Performance Bar** (Hours Saved, Tasks Completed, Automation Rate, ROI).
