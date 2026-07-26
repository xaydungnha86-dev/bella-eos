# 📘 BELLA EOS — TÀI LIỆU HƯỚNG DẪN SỬ DỤNG
## Executive Control Room (ECR) · Phiên bản v20.1

> **Đối tượng**: CEO, COO, Trưởng bộ phận, Quản lý cấp cao  
> **Hệ thống**: Bella Enterprise Operating System — Executive Control Room  
> **Địa chỉ truy cập**: `http://localhost:3000/executive`

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Khái niệm cốt lõi cần biết trước](#2-khái-niệm-cốt-lõi-cần-biết-trước)
3. [Giao diện chính — Bố cục màn hình](#3-giao-diện-chính--bố-cục-màn-hình)
4. [Hướng dẫn từng Tab](#4-hướng-dẫn-từng-tab)
   - 4.1 Strategic Control Room
   - 4.2 Goal & Outcome Center
   - 4.3 Executive Decision Center
   - 4.4 Workforce Command
   - 4.5 Execution Center & DAG
   - 4.6 Platform Health Console
   - 4.7 Digital Twin & Simulation Engine
   - 4.8 Knowledge Center
   - 4.9 Enterprise KPI Dashboard
   - 4.10 Executive Timeline
5. [Quy trình vận hành — End-to-End Workflow](#5-quy-trình-vận-hành--end-to-end-workflow)
6. [Cách đọc kết quả & chỉ số](#6-cách-đọc-kết-quả--chỉ-số)
7. [Xử lý tình huống khẩn cấp (Crisis Mode)](#7-xử-lý-tình-huống-khẩn-cấp-crisis-mode)
8. [Bảng thuật ngữ (Glossary)](#8-bảng-thuật-ngữ-glossary)

---

## 1. Tổng quan hệ thống

**Bella EOS (Enterprise Operating System)** là hệ thống điều hành doanh nghiệp tích hợp AI, được thiết kế để vận hành cùng lúc cả **Human Workforce** và **AI Workforce** trong một nền tảng thống nhất.

**Executive Control Room (ECR)** là giao diện trung tâm dành cho cấp lãnh đạo — nơi CEO và quản lý cấp cao:

- Theo dõi sức khỏe toàn doanh nghiệp theo thời gian thực
- Đặt mục tiêu chiến lược và phân rã thành kế hoạch hành động
- Ra quyết định có sự tham vấn của hội đồng AI chuyên gia
- Điều phối đồng thời nhân sự con người và AI worker
- Mô phỏng kịch bản trước khi ra quyết định thực tế
- Kiểm tra toàn bộ lịch sử hành động và học hỏi từ kết quả

### Triết lý thiết kế

> Bella EOS không phải là công cụ task management.  
> Bella EOS là **Enterprise Cognitive Operating System** — hệ thống suy nghĩ, quyết định và thực thi thay mặt tổ chức.

---

## 2. Khái niệm cốt lõi cần biết trước

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **Enterprise State** | Trạng thái tổng thể hiện tại của doanh nghiệp. Quyết định toàn bộ hành vi hệ thống. |
| **State Gating** | Cơ chế khóa — chỉ cho phép thực hiện hành động phù hợp với trạng thái hiện tại. |
| **AI Worker** | Tác nhân AI tự động (Marketing Bot, Financial Analyst...) làm việc không ngừng nghỉ. |
| **Human Worker** | Nhân viên con người được giao việc qua hệ thống. |
| **DAG** | Directed Acyclic Graph — đồ thị phụ thuộc nhiệm vụ, xác định thứ tự thực hiện. |
| **Digital Twin** | Bản sao số của doanh nghiệp, dùng để mô phỏng kịch bản trước khi ra quyết định thật. |
| **EDR** | Expert Deliberation Runtime — hội đồng AI chuyên gia bỏ phiếu cho quyết định. |
| **EEIS** | Enterprise Execution Intelligence Service — dịch vụ thực thi và theo dõi nhiệm vụ. |
| **Outcome** | Kết quả đo lường được của một mục tiêu, có ngưỡng KPI cụ thể. |
| **Policy** | Quy tắc hành vi của hệ thống theo từng Enterprise State. |

---

## 3. Giao diện chính — Bố cục màn hình

```
┌─────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (trái)               │  HEADER (trên)                      │
│  ─────────────────────────    │  ─────────────────────────────────  │
│  [Logo] BELLA EOS             │  [Tên Tab Hiện Tại]                 │
│         EXECUTIVE CONTROL...  │  BELLA EOS CONSTITUTION v20.1       │
│                               │                    [State Switcher] │
│  Operational Dashboard        ├─────────────────────────────────────┤
│  ▸ Strategic Control Room     │                                     │
│  ▸ Goal & Outcome Center      │        NỘI DUNG TAB                │
│  ▸ Executive Decision Center  │        (Workspace Area)             │
│  ▸ Workforce Command          │                                     │
│  ▸ Execution Center & DAG     │                                     │
│  ▸ Platform Health Console    │                                     │
│  ▸ Digital Twin Simulation    │                                     │
│  ▸ Knowledge Center           │                                     │
│  ▸ KPI Dashboard              │                                     │
│  ▸ Executive Timeline         │                                     │
│                               │                                     │
│  [← Back to Ops Dashboard]   │                                     │
└───────────────────────────────┴─────────────────────────────────────┘
```

### 3.1 State Switcher — Bộ chuyển trạng thái doanh nghiệp

Nằm ở **góc phải trên**, đây là điều khiển quan trọng nhất:

```
Enterprise State: [ HEALTHY ] [ EXPANSION ] [ CRISIS ]
```

| State | Màu | Ý nghĩa | Hành vi hệ thống |
|-------|-----|---------|------------------|
| **HEALTHY** | 🟢 Xanh | Doanh nghiệp ổn định, tăng trưởng bình thường | Tất cả chức năng hoạt động đầy đủ |
| **EXPANSION** | 🟡 Vàng | Đang mở rộng, cần nguồn lực bổ sung | Ưu tiên tốc độ, cho phép rủi ro cao hơn |
| **CRISIS** | 🔴 Đỏ | Tình huống khẩn cấp cần ứng phó ngay | Kích hoạt chế độ khẩn cấp, hạn chế chi tiêu |

> ⚠️ **Lưu ý quan trọng**: Thay đổi State sẽ ảnh hưởng tức thì đến Policy và hành vi toàn bộ hệ thống. Chỉ thay đổi khi có lý do kinh doanh rõ ràng.

---

## 4. Hướng dẫn từng Tab

---

### 4.1 · Strategic Control Room

**Mục đích**: Tổng quan sức khỏe doanh nghiệp và cảnh báo chiến lược.

**Khi nào dùng**: Mỗi sáng khi bắt đầu ngày làm việc. Đây là tab đầu tiên cần xem.

#### Các thành phần chính

**① State Policy Guideline Alert**
- Hộp thông báo màu sắc theo Enterprise State hiện tại
- Hiển thị hướng dẫn hành vi ưu tiên cho ngày hôm đó
- **Cách đọc**:
  - 🔵 Xanh indigo = HEALTHY → tập trung tăng trưởng bền vững
  - 🟡 Vàng amber = EXPANSION → đẩy nhanh, chấp nhận rủi ro có kiểm soát
  - 🔴 Đỏ rose = CRISIS → ưu tiên bảo toàn, cắt giảm không cần thiết

**② Top Enterprise Goals** (lưới 3 cột)
- Mỗi thẻ hiển thị 1 mục tiêu chiến lược
- **Cách đọc một thẻ Goal**:
  ```
  ┌─────────────────────────────────────┐
  │ [Trạng thái] ON_TRACK / AT_RISK     │
  │ Tên mục tiêu                        │
  │ Strategy: [Chiến lược thực thi]     │
  │ Deadline: YYYY-MM-DD                │
  │ Verified Outcome KPIs: X / Y Met   │
  └─────────────────────────────────────┘
  ```
  - `ON_TRACK` 🟢 = đang đúng tiến độ
  - `AT_RISK` 🟡 = có dấu hiệu chậm, cần chú ý
  - `BLOCKED` 🔴 = bị tắc, cần can thiệp ngay

**③ Active Executive Alerts**
- Danh sách cảnh báo đang hoạt động (nhấp nháy nếu nghiêm trọng)
- **Hành động**: Nhấp vào cảnh báo → chuyển sang tab liên quan để xử lý

#### Quy trình sáng sử dụng Strategic Control Room

```
1. Vào /executive → Tab: Strategic Control Room
2. Kiểm tra Enterprise State có đúng không
3. Đọc State Policy Guideline → nắm định hướng ngày hôm nay
4. Xem Top Goals → goal nào AT_RISK hoặc BLOCKED?
5. Kiểm tra Active Alerts → có cảnh báo khẩn nào không?
6. Quyết định: đi đến tab nào tiếp theo để xử lý ưu tiên
```

---

### 4.2 · Goal & Outcome Center

**Mục đích**: Quản lý mục tiêu chiến lược, đo kết quả và xác minh KPI đạt được.

**Khi nào dùng**: Khi đặt mục tiêu mới, review tiến độ định kỳ, hoặc điều chỉnh kế hoạch.

#### Các thành phần chính

**① Cây mục tiêu (Goal Tree)**
- Hiển thị phân cấp: Goal → Deliverable → Task
- Màu sắc theo trạng thái:
  - `IN_PROGRESS` 🔵 = đang thực hiện
  - `COMPLETED` 🟢 = hoàn thành
  - `BLOCKED` 🔴 = bị chặn

**② Outcome Verification Panel**
- Xác minh kết quả đo lường được
- **Cách đọc**:
  ```
  Outcome Verification Status:
  ✅ VERIFIED (Target Met)     → mục tiêu đạt
  ⚠️  DEGRADED (Under target)  → dưới ngưỡng, cần điều chỉnh
  ```

**③ Enterprise Semantic Layer (Ontology Schema)**
- Danh sách các khái niệm nghiệp vụ đã được hệ thống nhận biết
- **Registered Ontological Concepts**: thực thể như SPA, REVENUE, CUSTOMER...
- **Active Semantic Connections**: mối quan hệ giữa các thực thể
- **Cách đọc tag**:
  - `CONCEPT` (xanh indigo) = khái niệm trừu tượng
  - `METRIC` (vàng amber) = chỉ số đo được

#### Workflow đặt mục tiêu mới

```
1. Vào tab: Goal & Outcome Center
2. Xem cây mục tiêu hiện tại → xác định gap
3. Kiểm tra Ontology Schema → doanh nghiệp đã nhận biết các thực thể liên quan chưa?
4. Xem Semantic Connections → hiểu mối quan hệ nhân quả giữa các thực thể
5. Quay lại Dashboard chính (/) để tạo Goal mới từ Ops Dashboard
6. Sau khi tạo, quay lại ECR → Goal Center để theo dõi
```

---

### 4.3 · Executive Decision Center

**Mục đích**: Ra quyết định chiến lược có sự tham vấn của hội đồng AI chuyên gia (EDR).

**Khi nào dùng**: Khi cần ra quyết định quan trọng với nhiều phương án, rủi ro cao, hoặc cần tính đồng thuận.

#### Các thành phần chính

**① Expert Deliberation Board**
- Hội đồng gồm các AI Specialist: CFO Agent, Marketing Strategist, Risk Analyst, Operations Expert...
- Mỗi chuyên gia đưa ra: Khuyến nghị (`APPROVE`/`REJECT`/`DEFER`) + Lý do + Mức độ tự tin

**② Reasoning Graph**
- Đồ thị nhân quả — visualize chuỗi logic:
  ```
  [Nguyên nhân A] ──causes──→ [Kết quả B] ──leads_to──→ [Tác động C]
  ```
- **Cách đọc**:
  - Chọn một node trong danh sách → xem toàn bộ chuỗi suy luận
  - `HIGH` confidence = hệ thống rất chắc chắn về phân tích này
  - `MEDIUM` = có thể xem xét thêm
  - `LOW` = cần human review bổ sung

**③ Decision Journal**
- Nhật ký quyết định — ghi lại toàn bộ lịch sử quyết định đã ra
- Dùng để: tra cứu lại lý do quyết định, tránh lặp lỗi, học hỏi từ quá khứ

#### Quy trình ra quyết định chiến lược

```
Bước 1: Vào tab → Expert Deliberation Board
Bước 2: Đọc Context tình huống hiện tại
Bước 3: Xem từng chuyên gia AI đề xuất gì và lý do
Bước 4: Chú ý phiếu REJECT → đọc lý do phản đối
Bước 5: Chuyển sang Reasoning Graph → chọn scenario liên quan
Bước 6: Theo dõi chuỗi nhân quả → xác nhận logic có đúng không
Bước 7: Ra quyết định → ghi vào Decision Journal
Bước 8: Chuyển sang Execution Center → tạo Task để thực thi
```

#### Cách đọc kết quả Deliberation

| Kết quả | Hành động đề xuất |
|---------|-------------------|
| 3+ APPROVE, 0 REJECT | Tiến hành ngay |
| 2 APPROVE, 1 REJECT | Xem xét lý do REJECT, quyết định có điều kiện |
| Đa số DEFER | Cần thu thập thêm thông tin trước khi quyết định |
| Đa số REJECT | Không nên tiến hành — xem xét lại phương án |

---

### 4.4 · Workforce Command

**Mục đích**: Điều phối và theo dõi cả AI Workers và Human Workers trong thời gian thực.

**Khi nào dùng**: Giao việc, theo dõi tiến độ nhân lực, đánh giá hiệu suất.

#### Bố cục 2 cột

**Cột trái — AI Agents Command**
- Danh sách AI Workers đang online
- Mỗi thẻ Agent hiển thị:
  ```
  [Tên Agent]          [Trạng thái: ACTIVE/IDLE/OVERLOADED]
  Chuyên môn: [Domain]
  Nhiệm vụ hiện tại: [Task đang làm]
  Load: [Số task đang xử lý]
  ```
- **Màu trạng thái**:
  - 🟢 `ACTIVE` = đang xử lý task
  - ⚪ `IDLE` = rảnh, có thể nhận task mới
  - 🔴 `OVERLOADED` = quá tải, cần giảm tải

**Cột phải — Human Personnel**
- Danh sách nhân viên được giao qua hệ thống
- Hiển thị: Tên, Vai trò, Task được giao, Deadline, Trạng thái

#### Workflow giao việc cho AI Worker

```
1. Xác định loại công việc → chọn AI Agent phù hợp (IDLE)
2. Từ tab Execution Center → tạo Task mới
3. Assign cho Agent → hệ thống tự phân bổ dựa trên specialization
4. Theo dõi tại Workforce Command → xem Agent ACTIVE
5. Khi hoàn thành → xem kết quả tại Execution Center
```

---

### 4.5 · Execution Center & DAG

**Mục đích**: Theo dõi thực thi nhiệm vụ theo cấu trúc đồ thị phụ thuộc (DAG).

**Khi nào dùng**: Theo dõi tiến độ thực thi hàng ngày, xác định điểm tắc nghẽn.

#### Thành phần chính

**① Task Card Grid (9 task cards)**
Mỗi thẻ nhiệm vụ hiển thị:
```
┌─────────────────────────────────────────────┐
│ [TASK ID]                    [STATUS BADGE]  │
│ Tên nhiệm vụ                                │
│ Assigned: [Worker/Agent]                    │
│ Type: [ANALYSIS/EXECUTION/REVIEW...]        │
│ Priority: [CRITICAL/HIGH/MEDIUM/LOW]        │
│ Due: YYYY-MM-DD                             │
│ Rework Cycles: R[n]                         │
│ [⚡ CRITICAL PATH]  [|| PARALLEL]           │
└─────────────────────────────────────────────┘
```

**② Status Badges — Cách đọc**

| Badge | Màu | Ý nghĩa |
|-------|-----|---------|
| `PENDING` | ⚫ Xám | Chưa bắt đầu, đang chờ điều kiện tiên quyết |
| `IN_PROGRESS` | 🔵 Xanh | Đang được thực hiện |
| `REVIEW` | 🟡 Vàng | Hoàn thành, đang chờ review |
| `APPROVED` | 🟢 Xanh lá | Được phê duyệt, thành công |
| `REWORK` | 🔴 Đỏ | Bị trả lại, cần làm lại |
| `BLOCKED` | 🔴 Đỏ nhấp nháy | Bị chặn bởi dependency |

**③ Critical Path Indicator**
- Tag `⚡ CRITICAL PATH` (vàng amber) = task này ảnh hưởng trực tiếp đến deadline tổng thể
- Nếu critical path task bị delay → toàn bộ dự án bị delay
- **Hành động**: Ưu tiên giải phóng CRITICAL PATH tasks trước

**④ Rework Cycles**
- `R0` = lần đầu thực hiện (tốt)
- `R1` = đã làm lại 1 lần
- `R2+` = có vấn đề về chất lượng → cần review quy trình

#### Workflow theo dõi thực thi hàng ngày

```
Sáng:
1. Vào Execution Center
2. Filter các task BLOCKED → tìm nguyên nhân, giải phóng
3. Kiểm tra CRITICAL PATH tasks → đảm bảo không bị chậm
4. Xem Rework R2+ → có pattern lỗi lặp lại không?

Chiều:
5. Review các task REVIEW → phê duyệt hoặc trả lại REWORK
6. Xem tiến độ tổng thể → bao nhiêu % APPROVED / Total
7. Ghi nhận vào Decision Journal nếu có điều chỉnh
```

---

### 4.6 · Platform Health Console

**Mục đích**: Giám sát sức khỏe kỹ thuật của toàn bộ hệ thống ECOS.

**Khi nào dùng**: Khi có lỗi kỹ thuật, khi muốn kiểm tra hệ thống đang ổn không.

#### Thành phần chính

**① Services Health Status Grid**
Mỗi service card hiển thị:
```
[Service Name]
Last Checked: HH:MM:SS
Active Fallbacks: [fallback-1], [fallback-2]
[HEALTHY / DEGRADED]     [Timeout] hoặc [Recover]
```

**② Cách đọc trạng thái Service**

| Status | Ý nghĩa | Hành động |
|--------|---------|-----------|
| 🟢 `HEALTHY` | Service hoạt động bình thường | Không cần làm gì |
| 🔴 `DEGRADED` (nhấp nháy) | Service gặp sự cố, đang dùng fallback | Nhấn `Recover` |

**③ Nút điều khiển thủ công**
- **[Timeout]**: Kích hoạt timeout giả lập (dùng để test resilience) → `HEALTHY` → `DEGRADED`
- **[Recover]**: Khôi phục service → `DEGRADED` → `HEALTHY`

> 🔧 **Cho Admins**: Nút Timeout/Recover chỉ dùng trong môi trường test, không dùng trên production khi đang có khách hàng.

**④ System Event Bus Stream Logs**
- Terminal log màu đen — hiển thị sự kiện hệ thống real-time
- **Cách đọc**:
  ```
  [Health Alert] Provider X TIMEOUT reported. Router activated self-healing.
  [Health Recovery] Provider X recovered back to healthy status.
  ```
  - `[Health Alert]` = có sự kiện cần chú ý
  - `[Health Recovery]` = hệ thống đã tự phục hồi
  - Nếu log trống → hệ thống đang hoạt động hoàn toàn bình thường

---

### 4.7 · Digital Twin & Simulation Engine

**Mục đích**: Mô phỏng kịch bản kinh doanh TRƯỚC khi ra quyết định thực tế.

**Khi nào dùng**: Trước khi thay đổi ngân sách, giá cả, quy mô đội ngũ, hoặc chiến lược lớn.

#### Thành phần chính

**① Pre-Simulation Config**
```
Simulation Name: [Đặt tên mô phỏng]
Variable Delta:  [Giá trị thay đổi bạn muốn mô phỏng - VND]
                 [RUN PRE-SIMULATION]
```

**② Sim Output Projections**
Sau khi chạy, hiển thị:
```
Est Revenue Delta: +XXX,XXX,XXX VND    (dự kiến thay đổi doanh thu)
Friction Score:    XX / 100            (mức độ kháng cự của tổ chức)
Resource Bottleneck Warnings:
⚠️  [Tên bottleneck nếu có]
```

**③ Scenario Suite (15 Scenarios)**

Hệ thống tự động chạy 15 kịch bản với các mức delta khác nhau và xếp hạng:

**Cách đọc bảng Scenarios:**
```
Delta: X.XM VND | +Revenue VND | Friction: XX | Score: X.XM ▲/▼
```
- `Delta`: Mức thay đổi biến số được mô phỏng
- `+Revenue`: Dự kiến tăng doanh thu
- `Friction Score`: Điểm ma sát tổ chức (0-100, thấp = dễ thực thi hơn)
- `Score`: Điểm tổng hợp (dương = tốt, âm = không nên làm)

**④ Top 3 Recommended Scenarios**
- Hệ thống tự động chọn 3 kịch bản tối ưu nhất
- Mỗi kịch bản hiển thị: Delta, Revenue Delta, Friction Score
- **Rule of thumb**: Chọn kịch bản có Score cao nhất VÀ Friction thấp nhất

#### Workflow mô phỏng trước quyết định ngân sách

```
Ví dụ: Muốn biết nếu tăng ngân sách marketing 50M VND thì có hiệu quả không?

Bước 1: Nhập Simulation Name: "Marketing Budget Increase Q3"
Bước 2: Nhập Variable Delta: 50000000 (50M VND)
Bước 3: Nhấn [Run Pre-Simulation]
Bước 4: Xem Est Revenue Delta → dự kiến thu thêm bao nhiêu?
Bước 5: Xem Friction Score → đội ngũ có khó thích nghi không?
Bước 6: Kiểm tra Resource Bottleneck Warnings → có tắc nghẽn nào không?
Bước 7: Scroll xuống xem Scenario Suite → tìm điểm tối ưu
Bước 8: Đọc Top 3 Recommendations → hệ thống gợi ý kịch bản nào?
Bước 9: Ra quyết định dựa trên dữ liệu → ghi vào Decision Journal
```

#### Giải thích Friction Score

| Friction | Ý nghĩa | Quyết định |
|----------|---------|------------|
| 0-20 | Rất dễ thực thi | ✅ Tiến hành |
| 21-40 | Có một số kháng cự nhỏ | ✅ Tiến hành, có kế hoạch quản trị thay đổi |
| 41-60 | Trung bình, cần cẩn thận | ⚠️ Cần chuẩn bị kỹ trước khi thực hiện |
| 61-80 | Khó thực thi | ⚠️ Chỉ làm nếu Revenue Delta rất cao |
| 81-100 | Cực kỳ khó, nguy cơ thất bại cao | 🚫 Không nên làm ngay |

---

### 4.8 · Knowledge Center

**Mục đích**: Trung tâm tri thức và ký ức chiến lược của doanh nghiệp.

**Khi nào dùng**: Khi muốn xem hoặc bổ sung các nguyên tắc kinh doanh cốt lõi mà hệ thống phải tuân theo.

#### Executive Memory Mandates

Đây là các **"Nguyên tắc Bất Biến"** của doanh nghiệp — hệ thống sẽ KHÔNG vi phạm dù hoàn cảnh nào.

**Ví dụ**:
```
[BRAND_PHILOSOPHY]
"Bella NEVER competes on price. We compete on quality,
 premium experience, and customer trust."
```

**Các loại Memory Tags**:
- `BRAND_PHILOSOPHY` = triết lý thương hiệu
- `FINANCIAL_POLICY` = chính sách tài chính
- `QUALITY_STANDARD` = tiêu chuẩn chất lượng
- `HIRING_MANDATE` = tiêu chí tuyển dụng
- `CUSTOMER_PROMISE` = cam kết với khách hàng

> 📌 **Lưu ý**: Các Memory Mandates ảnh hưởng trực tiếp đến cách AI đưa ra khuyến nghị. Nếu AI từ chối một đề xuất nào đó, hãy kiểm tra tại đây xem có Mandate nào bị vi phạm không.

---

### 4.9 · Enterprise KPI Dashboard

**Mục đích**: Tổng quan chỉ số hiệu suất toàn doanh nghiệp ở cấp lãnh đạo.

**Khi nào dùng**: Review định kỳ (hàng tuần/hàng tháng), báo cáo cho ban lãnh đạo.

#### 5 Nhóm chỉ số chính

**① Business Performance**
| Chỉ số | Giải thích |
|--------|-----------|
| Target Revenue | Mục tiêu doanh thu kỳ này |
| KPI Target Met | % mục tiêu KPI đã đạt được (100% = hoàn hảo) |

**② Execution Performance**
| Chỉ số | Giải thích | Ngưỡng tốt |
|--------|-----------|-----------|
| Success Rate | % nhiệm vụ thành công / tổng | > 90% |
| Average Rework | Số lần trung bình phải làm lại | < 1.0 lần |

**③ Workforce Performance**
| Chỉ số | Giải thích | Ngưỡng tốt |
|--------|-----------|-----------|
| AI ROI Index | Tỷ lệ lợi nhuận từ AI workers | > 200% |
| Automation Index | % công việc được tự động hóa | > 70% |

**④ Platform Health**
| Chỉ số | Giải thích |
|--------|-----------|
| System State | Trạng thái kỹ thuật (HEALTHY/DEGRADED) |
| Active Providers | Số AI Provider đang online |

**⑤ Enterprise Cognitive OS Operational Metrics** _(quan trọng nhất cho CEO)_
| Chỉ số | Giải thích | Ngưỡng tốt |
|--------|-----------|-----------|
| Mean Time To Decision | Thời gian trung bình từ khi có thông tin đến khi ra quyết định | < 15 phút |
| Average Debate Length | Độ dài trung bình của phiên tranh luận AI | 5-20 phút |
| Policy Override Rate | % lần CEO override quyết định AI | < 20% |
| AI Agreement Ratio | % AI và CEO đồng thuận | > 80% |

#### Cách đọc tổng thể KPI Dashboard

```
Healthy Enterprise Pattern:
✅ KPI Target Met: 95-100%
✅ Success Rate: > 90%
✅ Average Rework: < 1.0
✅ AI ROI: > 250%
✅ AI Agreement: > 80%
✅ Policy Override: < 15%

Warning Pattern:
⚠️ Success Rate < 80% → kiểm tra Execution Center, tìm BLOCKED tasks
⚠️ Rework > 2.0 → có vấn đề về quy trình hoặc yêu cầu không rõ
⚠️ AI Agreement < 60% → CEO và AI không cùng quan điểm → cần review Memory Mandates
⚠️ Policy Override > 30% → có thể Policy cần được cập nhật
```

---

### 4.10 · Executive Timeline

**Mục đích**: Lịch sử hành động và ký ức tổ chức theo thời gian.

**Khi nào dùng**: Post-mortem review, học hỏi từ lịch sử, báo cáo cho hội đồng quản trị.

#### 2 Panel song song

**Panel trái — Chronological Replay Timeline**
- Chuỗi sự kiện trong ngày/kỳ hiện tại theo thứ tự thời gian
- **Màu dot**:
  - 🔵 Indigo = CEO action (quyết định, mục tiêu)
  - 🔵 Cyan = AI Planning action
  - 🟢 Green = Approval / Vote passed
  - 🟣 Purple = Worker execution

**Cách đọc chuỗi thời gian**:
```
09:00 CEO Created Objective          ← Khởi đầu
  ↓
09:03 ECR Formulated Plan           ← AI phân rã kế hoạch
  ↓
09:05 EDR Expert Board Vote Passed  ← Hội đồng phê duyệt
  ↓
09:09 Worker Initiated Execution    ← Bắt đầu thực thi
```

**Panel phải — Organizational Memory Landmarks**
- Các mốc lịch sử quan trọng của doanh nghiệp
- **Màu dot theo Category**:
  - 🔵 Indigo = EXPANSION (mở rộng)
  - 🔵 Cyan = ACQUISITION (thâu tóm)
  - 🟢 Green = FINANCE (tài chính)
  - ⚫ Xám = OTHER

**Cách đọc một Landmark**:
```
[Month Year]
[Tên sự kiện quan trọng]
[Mô tả chi tiết]
Impact: [Ảnh hưởng đo lường được]
```

---

## 5. Quy trình vận hành — End-to-End Workflow

### Workflow A: Quy trình hàng ngày (Daily Ops)

```
07:00 ─── Mở ECR → Tab: Strategic Control Room
          └─ Kiểm tra Enterprise State
          └─ Đọc State Policy Guideline
          └─ Xem Goals status

07:15 ─── Tab: Execution Center
          └─ Filter BLOCKED tasks → giải phóng
          └─ Xem CRITICAL PATH tasks
          └─ Review REWORK R2+ items

08:00 ─── Tab: Workforce Command
          └─ Xem Agent load → OVERLOADED? → phân bổ lại
          └─ Xem Human tasks → có ai cần hỗ trợ không?

17:00 ─── Tab: KPI Dashboard
          └─ Review ngày → Success Rate hôm nay?
          └─ Bất thường nào cần ghi nhận?

17:30 ─── Tab: Executive Timeline
          └─ Xem Replay Timeline của ngày
          └─ Ghi nhận learning vào Decision Journal
```

### Workflow B: Ra quyết định chiến lược

```
Bước 1: Platform Health → đảm bảo hệ thống OK
Bước 2: Digital Twin → mô phỏng kịch bản
Bước 3: Decision Center → tham vấn hội đồng AI
Bước 4: Reasoning Graph → kiểm tra logic nhân quả
Bước 5: Knowledge Center → đảm bảo không vi phạm Mandate
Bước 6: Ra quyết định → ghi Decision Journal
Bước 7: Execution Center → tạo và giao task
Bước 8: Workforce Command → theo dõi thực thi
Bước 9: Timeline → ghi lại Landmark nếu quyết định quan trọng
```

### Workflow C: Xử lý khi Enterprise bị CRISIS

```
NGAY LẬP TỨC:
1. State Switcher → chuyển sang CRISIS
   → Hệ thống tự kích hoạt Emergency Policy
   → Policy Guideline chuyển sang màu đỏ

2. Tab: Strategic Control Room
   → Đọc CRISIS Policy Guideline
   → Xem tất cả Active Alerts

3. Tab: Platform Health
   → Kiểm tra có service DEGRADED không
   → Nếu có → nhấn [Recover]

4. Tab: Execution Center
   → Dừng các task không khẩn cấp
   → Ưu tiên CRITICAL PATH tasks

5. Tab: Digital Twin
   → Chạy simulation với delta âm (cắt giảm)
   → Tìm kịch bản tối ưu để bảo toàn nguồn lực

6. Tab: Decision Center
   → Triệu tập Emergency Deliberation
   → Đọc Risk Analyst khuyến nghị gì

7. Sau khi ổn định → chuyển về HEALTHY hoặc EXPANSION
```

---

## 6. Cách đọc kết quả & chỉ số

### 6.1 Màu sắc hệ thống

| Màu | Ý nghĩa |
|-----|---------|
| 🟢 Emerald/Green | Tốt, đạt mục tiêu, healthy |
| 🔵 Indigo/Blue | Đang tiến hành, trung tính |
| 🟡 Amber/Yellow | Cần chú ý, có rủi ro nhỏ |
| 🔴 Rose/Red | Xấu, cần can thiệp ngay |
| ⚫ Slate/Gray | Không hoạt động, pending |

### 6.2 Score tổng hợp (Digital Twin)

```
Score dương (+) → Kịch bản này có lợi nhuận ròng dương
Score âm (-)  → Kịch bản này lỗ hoặc không hiệu quả

Công thức ước tính:
Score ≈ Revenue Delta − (Friction Score × Operational Cost Factor)
```

### 6.3 AI Agreement Ratio

```
Cao (>80%): AI và người lãnh đạo đang nhìn cùng hướng
            → Hệ thống đang học đúng từ bạn
Thấp (<60%): AI và người lãnh đạo có quan điểm khác nhau
            → Một trong hai đang sai
            → Cần review: (a) Memory Mandates có cập nhật chưa?
                           (b) AI có đủ dữ liệu không?
                           (c) Quyết định gần đây có pattern bất thường không?
```

### 6.4 Policy Override Rate

```
< 15%: Lý tưởng — CEO tin tưởng vào AI judgement
15-30%: Chấp nhận được — CEO vẫn cần can thiệp thường xuyên
> 30%: Cần xem xét lại Policy/Mandate — có thể AI đang không được train đúng
```

---

## 7. Xử lý tình huống khẩn cấp (Crisis Mode)

### Kịch bản 1: Service bị DEGRADED

```
Triệu chứng: Health tab hiển thị badge DEGRADED nhấp nháy
Hành động:
  1. Nhấn [Recover] trên service card bị lỗi
  2. Xem System Event Log → đọc dòng "[Health Recovery]"
  3. Nếu không recover được → liên hệ IT Admin
  4. Kiểm tra Execution Center → task nào đang dựa vào service đó?
```

### Kịch bản 2: Nhiều task BLOCKED cùng lúc

```
Triệu chứng: Execution Center có > 3 task BLOCKED
Hành động:
  1. Xác định task đầu tiên bị BLOCKED (dependency gốc)
  2. Tìm người/agent responsible → liên hệ trực tiếp
  3. Nếu là task của AI Agent → kiểm tra Agent load tại Workforce Command
  4. Nếu Agent OVERLOADED → reassign task cho Agent IDLE khác
  5. Sau khi giải phóng → Refresh để thấy cascade unblock
```

### Kịch bản 3: KPI Success Rate thấp (<80%)

```
Triệu chứng: KPI Dashboard → Success Rate < 80%
Hành động:
  1. Execution Center → xem task REWORK R2+ → tìm pattern lỗi
  2. Decision Journal → review quyết định nào dẫn đến rework
  3. Workforce Command → AI Agent nào có nhiều task bị reject?
  4. Knowledge Center → Memory Mandate có xung đột với yêu cầu thực tế không?
  5. Digital Twin → mô phỏng lại với thông số mới → tìm điểm tối ưu
```

---

## 8. Bảng thuật ngữ (Glossary)

| Thuật ngữ | Viết tắt | Định nghĩa |
|-----------|---------|-----------|
| Enterprise Operating System | EOS | Hệ điều hành doanh nghiệp |
| Executive Control Room | ECR | Phòng điều hành chiến lược |
| Enterprise State | — | Trạng thái tổng thể doanh nghiệp |
| State Gating | — | Cơ chế kiểm soát hành vi theo State |
| Expert Deliberation Runtime | EDR | Hội đồng AI chuyên gia bỏ phiếu |
| Enterprise Execution Intelligence | EEIS | Dịch vụ thực thi và theo dõi task |
| Enterprise AI Harness | EAH | Bộ điều phối AI providers |
| Directed Acyclic Graph | DAG | Đồ thị phụ thuộc nhiệm vụ |
| Digital Twin | — | Bản sao số để mô phỏng |
| Critical Path | — | Chuỗi task quyết định deadline |
| Memory Mandate | — | Nguyên tắc bất biến của doanh nghiệp |
| Ontology | — | Bản đồ khái niệm nghiệp vụ |
| Reasoning Graph | — | Đồ thị nhân quả suy luận |
| Policy Override | — | CEO ghi đè quyết định của AI |
| Friction Score | — | Điểm kháng cự tổ chức (0-100) |
| Revenue Delta | — | Chênh lệch doanh thu dự kiến |
| Rework Cycle | — | Số lần phải làm lại một task |
| Landmark | — | Mốc lịch sử quan trọng của doanh nghiệp |

---

## Phụ lục: Phím tắt & Tips

### Tips hiệu quả

1. **Bắt đầu mỗi ngày** bằng Strategic Control Room — không bao giờ bỏ qua tab này
2. **Trước mọi quyết định lớn** — chạy Digital Twin simulation trước
3. **Policy Override > 20%** là dấu hiệu cần cập nhật Memory Mandates
4. **Critical Path tasks** luôn ưu tiên hơn mọi task khác
5. **AI Agreement cao** = hệ thống đang hiểu đúng văn hóa doanh nghiệp của bạn
6. **Decision Journal** là tài sản quan trọng — ghi chép đầy đủ để học hỏi

### Lịch review đề xuất

| Tần suất | Nội dung |
|----------|---------|
| Hàng ngày (7:00) | Strategic Control Room + Execution Center |
| Hàng tuần | KPI Dashboard + Decision Journal review |
| Hàng tháng | Executive Timeline + Knowledge Center update |
| Hàng quý | Full Platform Health audit + Digital Twin stress test |

---

*Tài liệu này được tạo cho Bella EOS v20.1 · Executive Control Room*  
*Cập nhật lần cuối: 2026-07-25*
