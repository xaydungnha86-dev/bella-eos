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

### 🚀 Sprint 27 — Knowledge Graph L2 (Mục tiêu hiện tại)
*Hoàn thiện đồ thị tri thức và quan hệ liên kết thực thể.*

#### Definition of Done (DoD) đạt L2:
- [x] Tách biệt lưu trữ qua `IGraphStore` (Persistence Abstraction).
- [x] Hoàn thành API CRUD đầy đủ: `addNode()`, `updateNode()`, `removeNode()`, `link()`, `unlink()`, `traverse()`, `merge()`.
- [x] Tích hợp `RuntimeMetrics` cơ bản: Đo lường latencyMs và success của các thao tác `traverse`, `merge`, `query`.
- [x] Không sử dụng mock data trong mã nguồn của runtime.
- [x] Viết test suite phủ ít nhất 80% số dòng code. (Đạt: 100%, 46/46 tests PASSED)
- [x] Hoàn thành Stress/Fuzz Test tối giản (100 nodes, 200 links, traverse) không crash.

---

### 🚀 Sprint 27B — Memory Store & Retrieval L2
*Tập trung hoàn thiện bộ lưu trữ và lọc tri thức động.*

#### Definition of Done (DoD) đạt L2:
- [x] Tách biệt lưu trữ qua `IMemoryStore`.
- [x] Hoàn thành API đầy đủ: `add()`, `retrieve()` (lọc ngữ cảnh thật), `forget()`.
- [x] Tích hợp `RuntimeMetrics` cơ bản đo lường retrieval latencyMs.
- [x] Viết test suite phủ ít nhất 80% số dòng code. (Đạt: 100%, 57/57 tests PASSED)

---

### 🚀 Sprint 27C — Memory Compression & Metrics L2
- [x] Hoàn thành API: `compress()`, `importance()` (chấm điểm theo quy tắc).
- [x] Stress/Fuzz Test (10,000 memories, retrieve, compress) không crash.

---

### 🚀 Sprint 29 — Planning Engine L2
### 🚀 Sprint 30 — Scheduler Runtime L2
### 🚀 Sprint 31 — Plugin SDK L2
### 🚀 Sprint 32 — Workflow Runtime L2
### 🚀 Sprint 33 — Event Sourcing L2
### 🚀 Sprint 34 — Decision Lifecycle L2
### 🚀 Sprint 35 — Security & Policy Runtimes L2
### 🚀 Sprint 36 — Economics & Evolution Runtimes L2

---

## 7. 📝 Quy trình Thay đổi Kiến trúc (ADR Requirement)

Nếu sau này xuất hiện nhu cầu thực tế bắt buộc phải bổ sung một **Kernel Primitive thứ 16**:
1. Đội ngũ kiến trúc bắt buộc phải viết một **Architecture Decision Record (ADR)** chi tiết.
2. ADR phải chứng minh rõ ràng: **Nhu cầu nghiệp vụ đó hoàn toàn không thể giải quyết hoặc mở rộng từ 15 Kernel Primitives hiện tại.**
3. ADR phải được phê duyệt chính thức bởi CEO / Kiến trúc sư trưởng trước khi triển khai code.
