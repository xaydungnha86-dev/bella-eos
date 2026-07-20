# 🏛️ BELLA ENTERPRISE OPERATING SYSTEM (BELLA EOS)
## Autonomous Enterprise Business Operating System v3.0

> **Định Vị Cốt Lõi**: Bella AI Platform không phải là một "AI Platform" hay "AI Agent Tool", mà là một **Enterprise Operating System (Enterprise OS)** hoàn chỉnh dành cho Doanh nghiệp Số. AI chỉ đóng vai trò **Execution Layer** (tương tự CPU/ARM trong Windows/Android). Doanh nghiệp mua Mô hình Vận hành Doanh nghiệp Tự trị, chứ không mua công cụ AI đơn lẻ.

---

## 📚 Bộ Tài Liệu Định Hướng Dự Án

- 📘 **[ENTERPRISE_ARCHITECTURE_BLUEPRINT.md](file:///d:/Antigravity/Projects/DN%20WORKFLOW/ENTERPRISE_ARCHITECTURE_BLUEPRINT.md)**: Bản Thiết Kế Master về Kiến trúc Doanh nghiệp 10 Lớp, Enterprise Policy Engine, Gốc Dự Án (Project-First Core), Decision Log Audit Trail, Tri thức Doanh nghiệp tích lũy (Business Memory) và Bảng Điều Hành Sức Khỏe CEO.

---

## 🏛️ Sơ Đồ Kiến Trúc Doanh Nghiệp 10 Lớp (10-Layer Enterprise OS)

```
Enterprise OS (Bella EOS)
├── 🎯 1. Objective Center OS (Vision ➔ Strategy ➔ Objectives ➔ OKRs ➔ Projects)
├── 📂 2. Project Operating System (Project-First Core: Goals, Budget, Risks, Memory)
├── 🏛️ 3. Organization OS (Company ➔ Dept ➔ Team ➔ Role ➔ SOPs ➔ Policies)
├── 🛡️ 4. Enterprise Policy Engine (Lớp Quản Trị Phanh An Toàn & Quyền Hạn Độc Lập)
├── ⚖️ 5. Decision Engine OS (Enterprise Decision Log & Audit Trail)
├── 🤖 6. Workforce OS (Unified Human & AI Employees Matrix)
├── 🔄 7. Workflow OS (Task Contracts, DoD, Multi-Agent Topology Stream)
├── 🏢 8. Business Applications OS (First-party: Bella EIP/CRM | Third-party: SAP/Oracle)
├── 🧠 9. Business Memory & Knowledge OS (Enterprise Memory & 50+ Campaign Evolution)
└── 📊 10. Organization Analytics OS (Company Health, Dept Health, Project ROI)
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
