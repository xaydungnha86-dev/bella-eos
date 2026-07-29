# 📖 BELLA EOS — TENANT ONBOARDING & DATA INTEGRATION GUIDE

> **Hướng dẫn Kỹ thuật Triển khai & Kết nối Dữ liệu cho Doanh nghiệp Thí điểm (Tenant Onboarding Guide)**  
> **Phiên bản**: 1.0  
> **Trạng thái**: Platform Freeze Locked 🔒  
> **Áp dụng cho**: Kỹ thuật viên triển khai (Deployment Engineer), Customer Success & Đội IT Doanh nghiệp

---

## 1. TỔNG QUAN QUY TRÌNH ONBOARDING (OVERVIEW)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TENANT ONBOARDING WORKFLOW                            │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ BƯỚC 1: ĐĂNG KÝ      │ BƯỚC 2: KẾT NỐI      │ BƯỚC 3: CẤU HÌNH BẢO MẬT     │
│ • Cấp Tenant ID      │ • Thêm API Keys      │ • Bật JWT RLS Claims          │
│ • Ký hợp đồng Pilot  │ • Kết nối CRM/MISA    │ • Xác minh Phân lập Dữ liệu  │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ BƯỚC 4: THU THẬP     │ BƯỚC 5: PHÂN QUYỀN   │ BƯỚC 6: KIỂM THỬ ONBOARDING   │
│ • Đo Baseline ban đầu│ • Cài đặt C-Level    │ • Chạy thử nghiệm 1 Workflow  │
│ • Chốt Window 30 ngày│   Email/Slack Approve│ • Xác nhận 100% Go Checklist  │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

## 2. BƯỚC 1: ĐĂNG KÝ TENANT & CẤP ĐỊNH DANH (TENANT PROVISIONING)

1. Cấp mã định danh doanh nghiệp độc nhất (`tenant_id`), quy chuẩn chuỗi ký tự thường:
   - Ví dụ: `tenant-acme-corp`, `tenant-spa-bella`
2. Đăng ký thông tin vào cơ sở dữ liệu Supabase:
   ```sql
   INSERT INTO public.tenants (tenant_id, tenant_name, status)
   VALUES ('tenant-acme-corp', 'Acme Spa Group Enterprises', 'ACTIVE');
   ```

---

## 3. BƯỚC 2: KẾT NỐI NGUỒN DỮ LIỆU THỰC TẾ (DATA CONNECTOR INTEGRATION)

Kỹ thuật viên kết nối nguồn dữ liệu của Tenant theo từng SOP được lựa chọn. Tất cả các kết nối bắt buộc dùng quyền **Chỉ Đọc (Read-Only)** để đảm bảo an toàn dữ liệu:

### 🅰️ SOP 1: Customer Retention (`sop-customer-retention`)
- **Hệ thống kết nối:** CRM System (Salesforce / HubSpot / Custom CRM)
- **Phương thức truy cập:** REST API / Database Service Account (Read-Only)
- **Truy vấn đo lường Baseline:**
  ```sql
  SELECT AVG(repeat_rate) AS baseline_rate 
  FROM crm_customer_stats 
  WHERE tenant_id = 'tenant-acme-corp' AND created_at >= NOW() - INTERVAL '30 days';
  ```
- **Thông số cấu hình:**
  ```env
  TENANT_CRM_API_URL=https://api.salesforce.com/v1/acme
  TENANT_CRM_READ_TOKEN=bearer_crm_token_secret_xyz
  ```

### 🅱️ SOP 2: Finance Forecasting (`sop-finance-forecasting`)
- **Hệ thống kết nối:** MISA Accounting / SAP ERP
- **Phương thức truy cập:** Read-Only API Key / Database View
- **Truy vấn đo lường Error Rate:**
  ```sql
  SELECT ABS(forecast_cash - actual_cash) / forecast_cash * 100 AS error_rate
  FROM misa_cashflow_reports
  WHERE tenant_id = 'tenant-acme-corp' AND report_month = '2026-06';
  ```

### 🅲 SOP 3: HR Recruitment (`sop-hr-recruitment`)
- **Hệ thống kết nối:** HRIS / ATS System (BaseHR / BambooHR / Workday)
- **Phương thức truy cập:** Read-Only Webhooks / API Integration
- **Truy vấn đo lường Time-to-Hire:**
  ```sql
  SELECT AVG(DATE_PART('day', hired_date - job_posted_date)) AS avg_time_to_hire
  FROM hris_recruitment_jobs
  WHERE tenant_id = 'tenant-acme-corp' AND status = 'FILLED';
  ```

### 🅳 SOP 4: Spa Marketing (`sop-spa-marketing`)
- **Hệ thống kết nối:** Booking System Database / Facebook Ads API / Zalo OA
- **Phương thức truy cập:** Webhook Event Listener (Read/Write)
- **Sự kiện ghi nhận:** `lead.created`, `booking.confirmed`

---

## 4. BƯỚC 3: CẤU HÌNH BẢO MẬT & JWT RLS CLAIMS (ROW-LEVEL SECURITY)

Để đảm bảo hệ thống PostgreSQL từ chối tất cả các truy vấn không có `tenant_id`, mọi request gửi tới Bella EOS API bắt buộc kèm theo JWT Header:

### 🔑 Cấu trúc JWT Payload của Tenant Context:
```json
{
  "sub": "user-acme-ceo-001",
  "role": "authenticated",
  "iss": "bella-eos-auth",
  "tenant_id": "tenant-acme-corp",
  "user_metadata": {
    "full_name": "Nguyen Van A",
    "c_level_role": "CEO"
  },
  "exp": 1785400000
}
```

### 🧪 Kiểm tra Tính năng Phân lập Dữ liệu RLS (Security Verification Test):
Chạy câu lệnh kiểm thử PostgreSQL để đảm bảo Tenant A không thể đọc dữ liệu Tenant B:
```sql
-- Giả lập Context của Tenant A
SET LOCAL request.jwt.claims = '{"tenant_id": "tenant-acme-corp"}';

-- Truy vấn kiểm tra: Chỉ trả về record của tenant-acme-corp
SELECT * FROM public.production_pilot_ledgers;

-- Giả lập Context không có tenant_id (Kết quả phải bị Từ chối - DENY / 0 rows)
SET LOCAL request.jwt.claims = '{}';
SELECT * FROM public.production_pilot_ledgers; -- Trả về 0 rows!
```

---

## 5. BƯỚC 4: THU THẬP BASELINE BẮT ĐẦU & CHỐT HỢP ĐỒNG (CONTRACT INITIALIZATION)

Khởi tạo bản ghi hợp đồng đo lường chỉ số kinh doanh (`OutcomeContract`) cho Tenant:

```typescript
import { OutcomeContractFactory } from './src/core/governance/outcome-contract';

const pilotContract = OutcomeContractFactory.createContract(
  'sop-customer-retention',
  '3.0.0',
  'Giữ chân nhóm khách hàng VIP của Acme Spa Group',
  'VIP Customer Repeat Rate',
  '%',
  'HIGHER_IS_BETTER',
  61.0,                    // Baseline thu thập từ CRM thật
  70.0,                    // Target mục tiêu thống nhất với CEO
  null,                    // post_pilot_actual bắt buộc NULL khi khởi tạo
  'CRM Production DB'      // Nguồn dữ liệu kết nối
);
```

---

## 6. BƯỚC 5: CẤU HÌNH CỔNG PHÊ DUYỆT CẤP CAO (APPROVAL GATEWAY SETUP)

Cấu hình địa chỉ nhận thông báo và nút bấm phê duyệt cho các cấp quản lý Tenant:

| Cấp Quản Lý | Email / Slack Webhook | Phụ trách Duyệt Quy Trình |
| :--- | :--- | :--- |
| **Chief Executive Officer (CEO)** | `ceo@acmespa.com` / `#acme-ceo-approvals` | Đồng duyệt `HIGH` Risk & Duyệt SOP Evolution |
| **Chief Financial Officer (CFO)** | `cfo@acmespa.com` / `#acme-cfo-finance` | Duyệt `HIGH` Risk (Ngân sách > 50 triệu) |
| **Marketing Director (CMO)** | `cmo@acmespa.com` / `#acme-mkt-leads` | Duyệt `MEDIUM` Risk (Chiến dịch Quảng cáo) |

---

## 7. BƯỚC 6: DANH MỤC KIỂM TRA ONBOARDING THÀNH CÔNG (10-STEP GO CHECKLIST)

Trước khi kích hoạt chính thức Workflow đầu tiên, Kỹ thuật viên bắt buộc đánh dấu **100% các ô kiểm dưới đây**:

- [ ] `[ ]` 1. `tenant_id` được khởi tạo và kích hoạt trong bảng `tenants`.
- [ ] `[ ]` 2. API Token / Service Account Read-Only kết nối thành công với CRM/Accounting/HRIS/Booking.
- [ ] `[ ]` 3. Kiểm thử RLS Security PASS: Đảm bảo phân lập dữ liệu tuyệt đối giữa các Tenants.
- [ ] `[ ]` 4. Thu thập và xác nhận chỉ số `pre_pilot_baseline` ban đầu từ dữ liệu lịch sử Tenant.
- [ ] `[ ]` 5. Thống nhất chỉ số `target` và khoảng thời gian đo lường (`planned_measurement_start/end`).
- [ ] `[ ]` 6. Khóa cứng `sop_id` và `sop_version` (VD: `sop-customer-retention`, `v3.0.0`).
- [ ] `[ ]` 7. Cấu hình email/slack webhook phê duyệt cho CEO, CFO, CMO.
- [ ] `[ ]` 8. Kiểm tra `LearningPolicyEvaluator` giữ ở trạng thái `OBSERVE_ONLY`.
- [ ] `[ ]` 9. Đảm bảo trường `post_pilot_actual` giữ giá trị `NULL` trong suốt quá trình Pilot đang chạy (`RUNNING`).
- [ ] `[ ]` 10. Biên bản xác nhận đồng ý triển khai được ký bởi CTO Bella EOS và CEO Tenant.

---

> **Phê duyệt & Ban hành:**  
> **Bella EOS Tenant Deployment Team**  
> **Lead Customer Success & Onboarding Engineer**
