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
| **Planning** | Orchestration | L1 | Draft | Knowledge, Memory | Workflow, Scheduler |
| **Scheduler** | Runtime | L1 | Draft | Priority Queue | Workflow |
| **Workflow** | Runtime | L1 | Draft | Scheduler | Execution |
| **Plugin SDK** | Runtime | L2 | Stable | Registry | Capability |

---

## 5. ⚖️ Quy tắc Phụ thuộc Ràng buộc (Dependency Constraints)

> **"Một Kernel Primitive chỉ được phép để cho các module/runtime khác phụ thuộc hoặc gọi trực tiếp khi nó đã đạt tối thiểu mức trưởng thành L2 (Functional Runtime)."**

---

## 6. 📅 Lộ trình Nâng cấp Maturity (Sprint Phases Roadmap)

Để kiểm soát rủi ro và nâng cao tính ổn định, quá trình đưa các primitives từ L1 lên L2 được chia thành các sprint chuyên biệt:

### 🚀 Sprint 27 — Knowledge Graph L2 (Đã hoàn thành)
*Hoàn thiện đồ thị tri thức và quan hệ liên kết thực thể.*

---

### 🚀 Sprint 28 — Planning & Scheduler Runtimes ➔ L2 (Mục tiêu hiện tại)
*Tập trung hoàn thiện hệ thống lập kế hoạch công việc và hàng đợi điều phối.*

#### Definition of Done (DoD) cho Planning Engine (L2):
- [ ] Tách biệt lưu trữ qua `IPlanStore` (Persistence Abstraction).
- [ ] Hoàn thành API lập kế hoạch: `plan()`, `solveDependencies()`, `validate()`.
- [ ] Lập kế hoạch phân rã Goal thành Task Graph động thực tế (không stub).
- [ ] Tích hợp API `validate(plan)` kiểm tra: thiếu capability, dependency bị mất, cyclic dependency, trùng lặp task ID, orphan task.
- [ ] Loại bỏ tính toán chi phí (Cost Estimation) khỏi Planning (giao hoàn toàn cho Economics Runtime).
- [ ] Viết test suite phủ ít nhất 80% số dòng code, có test chuyên biệt cho cycle, duplicate task, orphan task.

#### Definition of Done (DoD) cho Scheduler Runtime (L2):
- [ ] Tách biệt lưu trữ qua `ISchedulerStore` (Persistence Abstraction).
- [ ] Sử dụng Binary Heap/Sorted Queue cấu trúc Priority Queue hiệu năng cao (CRITICAL > HIGH > MEDIUM > LOW).
- [ ] Hoàn thành API: `scheduleTask()`, `failTaskAndRetry()`, `checkSlaViolation()`.
- [ ] Lập lịch chạy lại Exponential Backoff lũy tiến thực tế, chuyển vào Dead Letter Queue (DLQ) đơn giản (`Map<string, string>`) khi vượt quá retryLimit.
- [ ] Viết test suite phủ ít nhất 80% số dòng code, có test chuyên biệt cho retry, timeout, deadline, DLQ.

---

### 🚀 Sprint 29 — Plugin SDK & Workflow Runtimes ➔ L2
*Tập trung hoàn thiện cơ chế nạp plugin, sandbox bảo mật và điều phối Saga transaction.*

### 🚀 Sprint 30 — Event Sourcing & Decision Lifecycle Runtimes ➔ L2
*Tập trung hoàn thiện Event Store và vòng đời quyết định.*

### 🚀 Sprint 31 — Security & Policy Runtimes ➔ L2
### 🚀 Sprint 32 — Economics & Evolution Runtimes ➔ L2

---

## 7. 📝 Quy trình Thay đổi Kiến trúc (ADR Requirement)

Nếu sau này xuất hiện nhu cầu thực tế bắt buộc phải bổ sung một **Kernel Primitive thứ 16**:
1. Đội ngũ kiến trúc bắt buộc phải viết một **Architecture Decision Record (ADR)** chi tiết.
2. ADR phải chứng minh rõ ràng: **Nhu cầu nghiệp vụ đó hoàn toàn không thể giải quyết hoặc mở rộng từ 15 Kernel Primitives hiện tại.**
3. ADR phải được phê duyệt chính thức bởi CEO / Kiến trúc sư trưởng trước khi triển khai code.
