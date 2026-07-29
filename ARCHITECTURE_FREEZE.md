# 🏛️ HIẾN PHÁP ĐÓNG BĂNG KIẾN TRÚC KERNEL (BELLA ECOS KERNEL CONSTITUTION)

Hiến pháp này định nghĩa các nguyên tắc quản trị kiến trúc tối cao của **Bella ECOS Kernel (Enterprise Cognitive Operating System)** để bảo đảm tuổi thọ 20 năm của hệ thống, chống phân rã cấu trúc và ngăn ngừa việc over-engineering.

---

## 1. 📜 Quy tắc Đóng băng Lõi (Kernel Freeze Rule)

> **"Không được phép thêm bất kỳ Kernel Primitive nào mới trừ khi toàn bộ các Kernel Primitives hiện tại đã đạt mức trưởng thành Production Ready (L3)."**

### Ngoại lệ được cho phép:
- Việc đóng băng chỉ áp dụng cho **ECOS Kernel Primitives** (15 platform runtimes cốt lõi).
- Hệ sinh thái **Verticals** (`spa/`, `clinic/`, `retail/`, `software/`...) và **Plugins** (`plugins/`, `adapters/`, `capabilities/`) vẫn tiếp tục phát triển, mở rộng bình thường mà không bị giới hạn bởi hiến pháp này.

---

## 2. 💎 3 Nguyên tắc Kiến trúc Tối cao (Architectural Principles)

Để đảm bảo kỷ luật đóng băng nhân hệ điều hành, mọi thay đổi phải tuân thủ nghiêm ngặt 3 nguyên tắc sau:

1. **No New Primitive (Không tạo mới tùy tiện)**: Không tạo primitive lõi mới nếu chỉ mở rộng hành vi của primitive hiện có. (Ví dụ: Không tạo `SimulationMemoryRuntime`, hãy tích hợp tính năng đó thông qua Memory + Simulation).
2. **Prefer Extension over Creation (Ưu tiên mở rộng trước khi tạo mới)**: Mọi yêu cầu tính năng mới đều phải trả lời câu hỏi: *"Có thể mở rộng trên runtime hiện tại không?"* Nếu có thể, bắt buộc không được tạo runtime mới.
3. **One Responsibility (Đơn nhiệm)**: Mỗi primitive lõi chỉ giữ một trách nhiệm duy nhất (Ví dụ: Knowledge Runtime chỉ quản lý tri thức và quan hệ thực thể; tuyệt đối không làm nhiệm vụ scheduling, plugin, hay security).

---

## 3. 📊 Bảng Đánh giá & Giám sát Trưởng thành (Maturity Ledger)

Hệ thống định nghĩa 6 mức độ trưởng thành (**Maturity Levels**):

| Mức độ | Định nghĩa | Tiêu chí đạt được |
|---|---|---|
| **L0** | Interface / Contract | Định nghĩa xong các TypeScript interfaces và kiểu dữ liệu chuẩn |
| **L1** | Stub Implementation | Có code mockup, chạy dữ liệu cứng (hardcoded mock data) |
| **L2** | Functional Runtime | Có CRUD đầy đủ, Unit Test ≥ 80%, Stress/Fuzz Test tối giản không crash, không dùng mock trong runtime, xử lý lỗi cơ bản, có **Persistence Abstraction** (Store interfaces), tích hợp **Runtime Metrics** cơ bản, interface ổn định |
| **L3** | Production Ready | Hỗ trợ concurrency, rollback, retry, timeout, metrics, logging, benchmark |
| **L4** | Scalable & Observable | Tích hợp metrics/tracing phân tán, chạy bất đồng bộ đa tiến trình |
| **L5** | Self-Evolution | Tự động giám sát, đột biến cấu hình và tự phục hồi (Self-healing) |

---

## 4. 🛡️ Bảng đăng ký Primitive Lõi (Kernel Primitive Registry)

| Primitive | Owner | Level | Status | Dependencies | Consumers |
|---|---|---|---|---|---|
| **ECC (Context)** | Kernel | L3 | Stable | None | CMO, CFO, COO |
| **EIC (Decision)** | Decision | L2 | Stable | Knowledge, Memory | Workflow, Telemetry |
| **Knowledge Graph** | Knowledge | L2 | ✅ Stable | Data Fabric | Planning, Decision, Memory |
| **Memory** | Memory | L2 | ✅ Stable | Event Store | Decision, Planning, Learning |
| **Planning** | Orchestration | L2 | ✅ Stable | Knowledge, Memory | Workflow, Scheduler |
| **Scheduler** | Runtime | L2 | ✅ Stable | Priority Queue | Workflow |
| **Workflow** | Runtime | L2 | ✅ Stable | Scheduler | Execution |
| **Plugin SDK** | Runtime | L2 | ✅ Stable | CapabilityRegistry | Verticals, AI Employees |

---

## 5. ⚖️ Quy tắc Phụ thuộc Ràng buộc (Dependency Constraints)

> **"Một Kernel Primitive chỉ được phép để cho các module/runtime khác phụ thuộc hoặc gọi trực tiếp khi nó đã đạt tối thiểu mức trưởng thành L2 (Functional Runtime)."**

---

## 6. 📅 Lộ trình Nâng cấp Maturity (Sprint Phases Roadmap)

Để kiểm soát rủi ro và nâng cao tính ổn định, quá trình đưa các primitives từ L1 lên L2 được chia thành các sprint chuyên biệt:

### ✅ Sprint 27 — Knowledge Graph L2 (Hoàn thành)
*Hoàn thiện đồ thị tri thức và quan hệ liên kết thực thể. 46/46 tests PASSED.*

---

### ✅ Sprint 28 — Planning & Scheduler Runtimes ➔ L2 (Hoàn thành)
*Hoàn thiện hệ thống lập kế hoạch công việc và hàng đợi điều phối. 71/71 tests PASSED.*

---

### ✅ Sprint 29 — Plugin SDK & Workflow Runtimes ➔ L2 (Hoàn thành)
*Hoàn thiện cơ chế nạp plugin, sandbox bảo mật và điều phối Saga transaction. 83/83 tests PASSED.*

---

## 🏛️ ARCHITECTURE FREEZE — ECOS Core L2 Đã Đóng Băng

> **Hiệu lực từ Sprint 29 (hoàn thành ngày 27/07/2026)**

Toàn bộ 6 Kernel Primitives cốt lõi đã đạt mức trưởng thành **L2 (Functional Runtime)**:

| Runtime | Sprint | Tests | Status |
|---|---|---|---|
| Knowledge Graph | Sprint 27 | 46/46 | ✅ L2 Frozen |
| Memory Manager | Sprint 27 | 57/57 | ✅ L2 Frozen |
| Planning Engine | Sprint 28 | 71/71 | ✅ L2 Frozen |
| Scheduler Runtime | Sprint 28 | 71/71 | ✅ L2 Frozen |
| Plugin SDK | Sprint 29 | 83/83 | ✅ L2 Frozen |
| Workflow Runtime | Sprint 29 | 83/83 | ✅ L2 Frozen |

**Sau Architecture Freeze, mọi effort chuyển sang:**

```
ECOS Core L2 (Frozen)
        │
        ▼
Architecture Freeze
        │
        ├──────────────────┐
        ▼                  ▼
   Verticals           Plugins
        │                  │
  Bella Spa           BMAD
  Bella Clinic        Claude Code
  Bella Retail        Codex
  Bella Manufacture   OpenHands
  AI Employees        Custom Plugins
  SOP Engine
  Business DNA
  Connector Ecosystem
  Bella EIP Integration
```

---

## 🔒 BELLA EOS — OFFICIAL PLATFORM FREEZE DECLARATION

> **Hiệu lực chính thức từ ngày 30/07/2026**

```
BELLA EOS — PLATFORM FREEZE STATUS

Architecture:            FROZEN 🔒
Engine Expansion:        STOPPED 🛑
Schema:                  PRODUCTION-READY / SECURITY-GATED 🛡️
Automated Validation:    186 / 186 PASS (31 Test Suites) 🧪

Next Objective:          REAL TENANT PILOT #1 🚀

Pilot Scope:
  • 1 Enterprise Tenant
  • 1 Cognitive Domain
  • 1 SOP
  • 1 Target KPI
  • 1 Real Data Source (CRM / Booking / Accounting / HRIS)

Governed Learning:       OBSERVE_ONLY 👁️
Autonomous SOP Evolution: DISABLED 🔒
Phase 9 Learning:        CONDITIONAL — REAL DATA DRIVEN ONLY 📊
```

### 📜 Nguyên tắc Vận hành Sau Freeze:
1. **Không tăng số lượng test vô nghĩa (No Arbitrary Test Expansion):** 186/186 PASS là đủ cho Engineering Validation. Mốc duy nhất tiếp theo là **Production Evidence**.
2. **Không học từ dữ liệu thử nghiệm (No Learning on Synthetic Data):** Mọi hành vi tự động sửa SOP mà không có sự phê duyệt của C-Suite đều bị **CẤM HOÀN TOÀN**.
3. **Phát hiện Blocker Thực tế:** Chỉ mở lại code khi Tenant Pilot thật gặp blocker vận hành nghiêm trọng. Không mở rộng code vì ý thích cá nhân.

