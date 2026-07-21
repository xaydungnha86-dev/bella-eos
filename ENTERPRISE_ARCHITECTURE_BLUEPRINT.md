# 🏛️ MASTER ENTERPRISE BLUEPRINT: BELLA ENTERPRISE OPERATING SYSTEM (BELLA EOS)
> **STATUS**: `OPERATIONAL` • **SPECIFICATION VERSION**: `v12.0 (ENTERPRISE CONTEXT LAYER & CAPABILITY REGISTRY)`  
> **ENTERPRISE TARGET LIFESPAN**: `2026 - 2046 (20-YEAR ENTERPRISE OPERATING STANDARD)`

---

## 1. HỆ SINH THÁI THƯƠNG HIỆU BELLA AI PLATFORM

Hệ sinh thái được định vị theo mô hình thương hiệu nhiều tầng rõ ràng để phát triển bền vững trong 10-20 năm:

```
Bella AI Platform (Thương hiệu hệ sinh thái)
        │
        ├── Bella EOS (Enterprise Operating System - Lõi Điều hành & Orchestration)
        │
        ├── Bella EIP (Enterprise Integration Platform / Business Suite - Ứng dụng nghiệp vụ / System of Record)
        │
        ├── Bella Workers (Lực lượng lao động số AI - Cung cấp Capabilities)
        │
        ├── Bella SDK (Bộ công cụ phát triển)
        │
        ├── Bella Connect (Cổng kết nối SAP, MISA, Facebook, TikTok...)
        │
        └── Bella Marketplace (Chợ quy trình SOP & Extension Packages)
```

### Phân vai và Định vị thành phần:

1. **Bella AI Platform (Thương hiệu tổng)**: Toàn bộ hệ sinh thái công nghệ AI dành cho doanh nghiệp.
2. **Bella EOS (Lõi Điều hành - System of Orchestration)**: Hệ điều hành chịu trách nhiệm cho các dịch vụ nền tảng: `Kernel`, `Process Runtime`, `Policy`, `Enterprise Context`, `Memory`, `Command Bus`, `Capability Registry`, `Dispatch`, `Evidence` và `Learning`.
3. **Bella EIP (Hệ thống Nghiệp vụ - System of Record / Business Suite)**: Gói ứng dụng nghiệp vụ sinh dữ liệu bao gồm `CRM`, `Booking`, `POS`, `Inventory`, `Finance`, `Payroll` và `BI Dashboard`. EIP là nơi dữ liệu nghiệp vụ sinh ra, Bella EOS sẽ sử dụng dữ liệu này để ra quyết định và điều hành qua lớp kết nối an toàn.
4. **Bella Workers**: Lực lượng lao động số thực hiện các nhiệm vụ được định tuyến dựa theo **Năng lực (Capabilities)** thay vì định tuyến theo tên model AI cố định.
5. **Bella Connect**: Lớp trung gian kết nối các nguồn cấp ngoài (Google Analytics, Facebook, MISA, SAP...) chuyển đổi về mô hình dữ liệu chuẩn của EOS.
6. **Bella SDK**: Nền tảng mở cho phép lập trình viên tích hợp các executor và adapter mới.
7. **Marketplace**: Nơi phân phối các gói SOP chuẩn và extension.

---

## 2. THE 6-LAYER ENTERPRISE STACK

Bella EOS v12.0 được gom lại thành **6 lớp lớn** nhằm phân tách rõ trách nhiệm dữ liệu, điều hành và thực thi:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Executive Intent Layer (Tương tác Người và Tiếp nhận Ý chí Strategic)│
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Goal & Planning Layer (Phân rã OKRs & Mô phỏng Monte Carlo / Path)   │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Process Runtime Layer (Thực thi SOP qua State Machine 12 trạng thái) │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. Enterprise Context Layer (BCE, Enterprise Memory, Knowledge Graph)   │
├─────────────────────────────────────────────────────────────────────────┤
│ 5. Policy & Scheduler (Capability Registry, Compliance, Cost/SLA check) │
├─────────────────────────────────────────────────────────────────────────┤
│ 6. Execution Coordination Layer (Queue, Dispatcher, Heartbeat, Audit)   │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Executive Intent Layer**: Nơi tiếp nhận ý chí của CEO/HĐQT dưới dạng ngôn ngữ tự nhiên và chuyển dịch thành mục tiêu vận hành doanh nghiệp.
2. **Goal & Planning Layer**: Phân rã mục tiêu thành OKRs của các phòng ban (Mkt, Sales, HR, Finance, Operations) và mô phỏng tối ưu hóa lộ trình.
3. **Process Runtime Layer**: Chịu trách nhiệm thực thi các bước của quy trình SOP theo mô hình máy trạng thái (State Machine).
4. **Enterprise Context Layer (ECL)**: Tổng hợp ngữ cảnh từ Connectors, truy xuất bộ nhớ và bản đồ tri thức để xây dựng Gói Ngữ cảnh Chuẩn hóa (Canonical Context).
5. **Policy & Scheduler Layer**: Kiểm tra tính tuân thủ chính sách, đối chiếu năng lực yêu cầu của nhiệm vụ với **Capability Registry** để tự động lựa chọn Executor phù hợp nhất (dựa trên chi phí, SLA, token quota, tải hiện tại).
6. **Execution Coordination Layer**: Phụ trách phân phối việc (Dispatch), quản lý hàng đợi (Queue), giám sát trạng thái (Heartbeat, Timeout), xử lý lỗi (Retry) và lưu trữ chứng cứ (Evidence).

---

## 3. CLOSED-LOOP FLYWHEEL & EVOLUTION ENGINES

Bella EOS triển khai một vòng lặp tự tối ưu hóa khép kín 8 bước (**Closed-Loop Learning Flywheel**) để cải tiến quy trình liên tục:

```
        Executive Intent Formulation
                     │
                     ▼
        Planning & Simulation (Monte Carlo & Path Optimization)
                     │
                     ▼
        Execution Coordination (Dispatch via Capability Scheduler)
                     │
                     ▼
        Observation (Evidence & Real-Time Telemetry)
                     │
                     ▼
        Evaluation (Enterprise Quality Engine - EQE)
                     │
                     ▼
        Learning Mutation (SOP & Skill Adjustments)
                     │
                     ▼
        Knowledge Graph Sync (Enterprise Object Model Update)
```

### Các Engine Tiến Hóa:

1. **Goal Engine (`GoalEngine`)**:
   - Phân rã định hướng chiến lược (ví dụ: *"Tăng doanh thu 20%"*) thành OKRs phòng ban:
     - *Marketing*: Chỉ tiêu Leads và Reach.
     - *Sales*: Tỷ lệ chuyển đổi và số lượt đặt lịch.
     - *HR*: Đào tạo năng lực nhân sự mới.
     - *Finance*: Giới hạn chi phí và tỷ suất lợi nhuận ròng.
     - *Operations*: Thời gian hoàn thành SLA trung bình.

2. **Simulation Engine (`SimulationEngine`)**:
   - Chạy mô phỏng Monte Carlo để dự báo các chỉ số ROI, Cashflow và Net profit trước khi thực thi.

3. **Optimization Engine (`OptimizationEngine`)**:
   - Tính toán toán học đường dẫn quy trình tối ưu dựa trên dữ liệu hiệu năng lịch sử.

4. **Knowledge Graph Subsystem (`KnowledgeGraphService`)**:
   - Bản đồ hóa các thực thể **Enterprise Object Model (EOM)** bao gồm Customer, Booking, Invoice, Campaign, Process, Task, Evidence, Capability và các quan hệ `GOVERNS`, `APPROVED_BY`, `DEPENDS_ON`.

5. **Learning Engine (`LearningEngine`)**:
   - Đánh giá chất lượng đầu ra thông qua điểm số từ EQE và thực hiện đột biến SOP tự động.

---

## 4. BUSINESS CONTEXT ENGINE (BCE) & EIL CONNECTORS

Lớp Ngữ cảnh Doanh nghiệp (Enterprise Intelligence Layer - EIL) tích hợp bộ điều phối **Business Context Engine (BCE)** để lấy thông tin từ các cổng kết nối độc lập, sau đó chuẩn hóa thành một gói **Canonical Context Model** duy nhất:

```
    [Bella EIP Connector] ────┐
    [Facebook Connector]  ────┼───► [Business Context Engine] ───► Unified Enterprise Context
    [MISA ERP Connector]  ────┤
    [Google Analytics]    ────┘
```

### Các Cổng kết nối tích hợp (Active Connectors):
* **Bella EIP Connector (`EipConnector`)**: Đọc trạng thái dữ liệu nghiệp vụ: Số khách hàng hoạt động, hôm nay có bao nhiêu lượt đặt lịch (active bookings), doanh thu hiện tại.
* **Google Analytics Connector (`GoogleAnalyticsConnector`)**: Theo dõi lượt truy cập Website hàng ngày, tỷ lệ thoát (bounce rate), tỷ lệ chuyển đổi.
* **Facebook Graph Connector (`FacebookConnector`)**: Đo lường lượt tiếp cận trang 24h, tỷ lệ tương tác của bài viết.
* **MISA ERP Connector (`MisaConnector`)**: Giám sát lượng hàng tồn kho cảnh báo, lượng tiền mặt lưu động (cash on hand), công nợ phải trả.
* **Brand Guidelines Indexer**: Phân tích quy định thương hiệu (ví dụ: cấm đăng bài ban đêm, cấm sử dụng từ ngữ phi chuẩn).

### Cấu trúc Gói Ngữ Cảnh Chuẩn Hóa (EIL Context Package JSON):
```json
{
  "taskId": "task-step-6",
  "objective": "Tăng 20% Spa demo trong 30 ngày với ngân sách 50 triệu",
  "erp": {
    "costCenter": "CC-BELLA-2026",
    "approvedBudgetVnd": 50000000,
    "currency": "VND",
    "cashOnHandVnd": 12400000000,
    "payableAmountVnd": 45000000,
    "inventoryAlerts": 3
  },
  "crm": {
    "targetSegment": "Enterprise VIP",
    "minEqeScore": 90,
    "activeCustomers": 1289,
    "activeBookings": 42,
    "dailyWebsiteSessions": 4200,
    "facebookReach24h": 14500
  },
  "hr": {
    "roleRequired": "mkt",
    "slaHours": 24,
    "approvalRole": "CEO"
  },
  "governance": {
    "maxAutoSpendVnd": 100000000,
    "policyId": "POL-ENTERPRISE-GOV-2026",
    "nightPostingAllowed": false
  },
  "decisionLineage": ["DEC-INITIAL-INTENT-001"]
}
```

---

## 5. ENTERPRISE CONTEXT LAYER: ENTERPRISE MEMORY

Để ra quyết định đúng đắn, hệ thống không chỉ cần Context ngắn hạn mà cần một hệ thống lưu trữ bộ nhớ doanh nghiệp sâu sắc (**Enterprise Memory**):

* **Operational Memory (Bộ nhớ Vận hành)**: Ghi nhớ các bước quy trình, các lần thực thi SOP trước đó, các phiên làm việc và vết logs lỗi.
* **Business Memory (Bộ nhớ Nghiệp vụ)**: Lưu giữ thông tin về lịch sử biến động dữ liệu của Bella EIP (chiến dịch thành công/thất bại, doanh thu, tăng trưởng khách hàng).
* **Reasoning Memory (Bộ nhớ Tư duy)**: Lưu trữ chuỗi lập luận (chain of thoughts) của các mô phỏng Monte Carlo, các quyết định điều hướng của Scheduler.
* **Conversation Memory (Bộ nhớ Hội thoại)**: Lưu lịch sử hội thoại, các ý chí điều khiển trực tiếp từ CEO/HĐQT qua Chat.
* **Document Memory (Bộ nhớ Tài liệu)**: Cơ sở dữ liệu tri thức nội bộ được vector hóa (SOPs, Brand Guidelines, Sách hướng dẫn vận hành).

---

## 6. CAPABILITY REGISTRY & SCHEDULER FLOW

Hệ thống không quản lý tĩnh theo tên AI Agent mà quản lý động theo **Năng lực (Capabilities)**:

### 1. Quy trình Lập lịch và Điều Phối (Scheduler Flow):
```
    Nhiệm vụ (Task)
         │
         ▼
    Yêu cầu Năng lực (Capability Requirement)
         │
         ▼
    Kiểm tra Chính sách & Ngân sách (Policy & Budget Check)
         │
         ▼
    Đối chiếu Ngữ cảnh Doanh nghiệp (Business Context Check)
         │
         ▼
    Bộ Lập Lịch (Scheduler) ◄─── Đối chiếu ───► Capability Registry (Workers)
         │
         ▼
    Lựa chọn Thực thi phù hợp nhất (Cost, SLA, Quota, Load)
         │
         ▼
    Phân phối và Đăng ký Hàng đợi (Dispatch & Queue)
```

### 2. Định nghĩa Capability Registry:
Các AI Workers (Claude, Gemini, GPT) và Human Workers sẽ khai báo các Capabilities tương ứng:
* **Hermes Worker**: `SEO`, `Facebook Graph API`, `Publishing`, `Web Screenshot`.
* **Claude Worker**: `Architecture Design`, `Coding`, `Strategic Reasoning`.
* **Gemini Worker**: `Video Analysis`, `Multi-modal Vision`, `Long Context Processing`.
* **OpenAI Worker**: `Reasoning`, `Coding`, `Function Calling`.

---

## 7. EXECUTION COORDINATION LAYER

Execution Coordination Layer chịu trách nhiệm đảm bảo tính tin cậy của giao dịch quy trình:

```typescript
interface ExecutionCoordinator {
    dispatch(task: Task, context: CanonicalContext): Promise<string>; // Trả về Task ID
    queue: TaskQueue;                                                 // Quản lý hàng đợi nhiệm vụ
    heartbeat(taskId: string): void;                                  // Giám sát trạng thái hoạt động
    timeout(taskId: string, maxSlaHours: number): void;               // Xử lý quá hạn
    retry(taskId: string, error: Error): Promise<boolean>;            // Tự động thử lại
    compensate(taskId: string, error: Error): Promise<void>;          // Giao dịch bù (roll back trạng thái)
    verify(taskId: string): Promise<Evidence>;                        // Xác thực chứng cứ (Evidence)
}
```

---

## 8. EVENT BUS DECISION SYSTEM

Toàn bộ hệ thống giao tiếp bất đồng bộ qua **Event Bus** để đảm bảo khả năng mở rộng ở quy mô lớn:

```
CEO Intent ➔ [Executive Intent] ➔ Event: IntentCreated ➔ [Goal Engine] ➔ OKRs ➔ Event: OKRsSet 
           ➔ [Planning Engine] ➔ Task DAG ➔ Event: TasksPlanned ➔ [Scheduler] ➔ Select Executor 
           ➔ Event: TaskDispatched ➔ [Execution Coordination] ➔ [Executor] ➔ [Evidence Store] ➔ Event: TaskDone 
           ➔ [Learning Engine] ➔ Event: SOPMutated
```

---

## 9. ARCHITECTURE FREEZE: THREE FOUNDATIONAL SCHEMAS

Để đảm bảo tính ổn định tối cao trong suốt vòng đời phát triển 15-20 năm tới, chúng ta chính thức **đóng băng (Architecture Freeze)** 3 lược đồ nền tảng dưới đây. Mọi thay đổi nghiệp vụ tương lai chỉ được phép kế thừa từ các cấu trúc chuẩn này.

### ① Lược đồ Đối tượng Doanh nghiệp chuẩn - Enterprise Object Model (EOM)
Tất cả các thành phần trong hệ sinh thái (DB, API, SDK, UI, Event) đều bắt buộc sử dụng chung cấu trúc EOM:

```typescript
type EomType = 'Customer' | 'Invoice' | 'Booking' | 'Task' | 'Process' | 'Policy' | 'Resource' | 'Evidence' | 'Command' | 'Decision';

interface EomObject {
    id: string;
    type: EomType;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, any>;
}

// Chi tiết lược đồ của 10 thực thể EOM lõi:
interface Customer extends EomObject {
    name: string;
    tier: 'VIP' | 'Regular';
    segment: string;
    contactInfo: { phone?: string; email?: string };
}

interface Invoice extends EomObject {
    amountVnd: number;
    taxCode?: string;
    status: 'DRAFT' | 'PAID' | 'RECONCILED';
    customerId: string;
}

interface Booking extends EomObject {
    customerId: string;
    time: string;
    serviceName: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

interface Task extends EomObject {
    title: string;
    requiredCapabilities: string[];
    assignedExecutor?: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

interface Process extends EomObject {
    name: string;
    activeStep: number;
    stepsCount: number;
    state: 'INIT' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'REVISED';
}

interface Policy extends EomObject {
    ruleName: string;
    conditions: string[];
    maxSpendLimit: number;
}

interface Resource extends EomObject {
    resourceType: 'API' | 'Compute' | 'TokenQuota';
    limit: number;
    used: number;
}

interface Evidence extends EomObject {
    taskId: string;
    hash: string;
    payload: any;
    verifiedAt: string;
}

interface Command extends EomObject {
    commandName: string;
    sender: string;
    receiver: string;
    payload: any;
    dispatchedAt: string;
}

interface Decision extends EomObject {
    objective: string;
    pathChosen: string;
    confidencePct: number;
    reason: string;
}
```

### ② Lược đồ Ngữ cảnh chuẩn - Canonical Context Package Schema
Cấu trúc chuẩn của gói Context ECL phân phối đến mọi AI Model & Executor:

```json
{
  "$schema": "https://bella.ai/schemas/canonical-context-v12.json",
  "type": "object",
  "required": ["taskId", "objective", "erp", "crm", "hr", "governance", "recalledMemoryExcerpt"],
  "properties": {
    "taskId": { "type": "string" },
    "objective": { "type": "string" },
    "erp": {
      "type": "object",
      "required": ["costCenter", "approvedBudgetVnd", "currency", "cashOnHandVnd", "payableAmountVnd", "inventoryAlerts"],
      "properties": {
        "costCenter": { "type": "string" },
        "approvedBudgetVnd": { "type": "number" },
        "currency": { "type": "string" },
        "cashOnHandVnd": { "type": "number" },
        "payableAmountVnd": { "type": "number" },
        "inventoryAlerts": { "type": "number" }
      }
    },
    "crm": {
      "type": "object",
      "required": ["targetSegment", "minEqeScore", "activeCustomers", "activeBookings", "dailyWebsiteSessions", "facebookReach24h"],
      "properties": {
        "targetSegment": { "type": "string" },
        "minEqeScore": { "type": "number" },
        "activeCustomers": { "type": "number" },
        "activeBookings": { "type": "number" },
        "dailyWebsiteSessions": { "type": "number" },
        "facebookReach24h": { "type": "number" }
      }
    },
    "hr": {
      "type": "object",
      "required": ["roleRequired", "slaHours", "approvalRole"],
      "properties": {
        "roleRequired": { "type": "string" },
        "slaHours": { "type": "number" },
        "approvalRole": { "type": "string" }
      }
    },
    "governance": {
      "type": "object",
      "required": ["maxAutoSpendVnd", "policyId", "nightPostingAllowed"],
      "properties": {
        "maxAutoSpendVnd": { "type": "number" },
        "policyId": { "type": "string" },
        "nightPostingAllowed": { "type": "boolean" }
      }
    },
    "recalledMemoryExcerpt": {
      "type": "object",
      "required": ["recentConversations"],
      "properties": {
        "recentConversations": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["speaker", "text"],
            "properties": {
              "speaker": { "type": "string" },
              "text": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

### ③ Lược đồ Đăng ký Năng lực chuẩn - Capability Registry Schema
Được sử dụng bởi tất cả các AI Workers và Human Operators khi gia nhập lực lượng lao động số (Bella Workers):

```typescript
type CapabilityName = 'SEO' | 'Coding' | 'Video' | 'Accounting' | 'Legal' | 'CRM' | 'Facebook' | 'TikTok' | 'Email';

interface CapabilityRegistration {
    executorId: string;                     // ID duy nhất của worker (ví dụ: 'hermes', 'claude-3-5')
    workerType: 'AI' | 'Human';
    activeCapabilities: {
        name: CapabilityName;
        proficiencyLevel: number;           // Thang điểm 1 - 100
        avgLatencyMs: number;
    }[];
    financialConstraints: {
        costPerTokenVnd?: number;
        costPerHourVnd?: number;
        remainingBudgetLimitVnd: number;
    };
    concurrencyLimits: {
        maxRatePerMin: number;
        activeTasksCount: number;
    };
}
```
