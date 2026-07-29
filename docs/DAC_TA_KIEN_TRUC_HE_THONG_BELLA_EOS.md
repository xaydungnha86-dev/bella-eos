# 🏛️ ĐẶC TẢ KIẾN TRÚC HỆ THỐNG BELLA EOS
> **TÀI LIỆU KỸ THUẬT CHI TIẾT DÀNH CHO LẬP TRÌNH VIÊN (DEVELOPER BLUEPRINT)**  
> *Đặc tả Thiết kế 13 Core Engines, Luồng Chạy Runtime, Hợp Đồng Dữ Liệu và Bản Đồ Trạng Thái*

---

## I. TỔNG QUAN BẢN ĐỒ KIẾN TRÚC BELLA EOS (ARCHITECTURE MAP)

Hệ điều hành Bella EOS không xoay quanh hội thoại (Chat/Message) mà được thiết kế theo hướng hướng sự kiện (Event-Driven) và hướng mục tiêu kinh doanh (Goal-Oriented). Hệ thống được chia thành 13 Engine độc lập làm nhiệm vụ chuyên biệt:

```
                            [Ý Chí Lãnh Đạo (CEO)]
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              GOVERNANCE TIER                              │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ │
│ │    Intent Engine     │ │     Goal Engine      │ │   Decision Engine   │ │
│ └──────────┬───────────┘ └──────────┬───────────┘ └──────────┬──────────┘ │
│            ▼                        ▼                        ▼            │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ │
│ │    Policy Engine     │ │   Approval Engine    │ │    Audit Center     │ │
│ └──────────────────────┘ └──────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              EXECUTION TIER                               │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ │
│ │   Workflow Runtime   │ │  Capability Router   │ │   Worker Runtime    │ │
│ └──────────┬───────────┘ └──────────┬───────────┘ └──────────┬──────────┘ │
│            ▼                        ▼                        ▼            │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐ │
│ │    Memory Center     │ │   Knowledge Center   │ │   Learning Center   │ │
│ └──────────────────────┘ └──────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      ▼
                          [Telemetry Center & KPIs]
```

---

## II. ĐẶC TẢ CHI TIẾT 13 CORE ENGINES

---

### 1. Intent Engine
*   **Trách nhiệm (Responsibility)**: Biên dịch chỉ thị tự nhiên thô của CEO thành cấu trúc `IntentContract` có ý nghĩa số liệu và ràng buộc kỹ thuật.
*   **Đầu vào (Input)**: `rawText` (Chuỗi thô), `tenantId` (Mã định danh doanh nghiệp).
*   **Đầu ra (Output)**: `IntentContract` (Chứa mục tiêu, ngân sách dự kiến, và thời hạn mong muốn).
*   **Sự kiện phát ra (Events)**: `IntentParsedEvent`, `IntentParsingFailedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `intent_logs` (id, tenant_id, raw_input, parsed_contract_json, created_at).
*   **API chính**: `parseIntent(rawText: string, tenantId: string): Promise<IntentContract>`.
*   **Phụ thuộc (Dependencies)**: LLM Gateway, Brand DNA Service.

---

### 2. Goal Engine
*   **Trách nhiệm (Responsibility)**: Phân rã mục tiêu cấp cao thành cây mục tiêu con (Goal Tree) kết nối trực tiếp đến các phòng ban và gán KPI đo lường được.
*   **Đầu vào (Input)**: `IntentContract`.
*   **Đầu ra (Output)**: `GoalTreeContract` (Danh sách các đỉnh nhánh mục tiêu, liên kết cha-con, vai trò chịu trách nhiệm).
*   **Sự kiện phát ra (Events)**: `GoalsDecomposedEvent`, `GoalOwnerAssignedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `goals` (id, parent_id, objective, target_metric, target_value, department_role, status).
*   **API chính**: 
    *   `decomposeGoal(intent: IntentContract): Promise<GoalTreeContract>`
    *   `updateGoalProgress(goalId: string, currentVal: number): Promise<void>`
*   **Phụ thuộc (Dependencies)**: Intent Engine, Organization Directory Service.

---

### 3. Decision Engine
*   **Trách nhiệm (Responsibility)**: Chạy mô phỏng dự báo ROI/Rủi ro, đề xuất chiến lược tối ưu và liệt kê các kịch bản thay thế kèm pros/cons.
*   **Đầu vào (Input)**: `GoalTreeContract`, dữ liệu thị trường và lịch sử vận hành doanh nghiệp.
*   **Đầu ra (Output)**: `DecisionContract` (Chiến lược đề xuất, độ tin cậy, mức độ rủi ro, bằng chứng hỗ trợ, danh sách phương án phụ).
*   **Sự kiện phát ra (Events)**: `StrategySimulatedEvent`, `DecisionEvaluationCompletedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `decision_evaluations` (id, goal_id, recommended_strategy, confidence_score, risk_score, alternatives_json, evidence_json).
*   **API chính**: `evaluateDecision(goalTree: GoalTreeContract): Promise<DecisionContract>`.
*   **Phụ thuộc (Dependencies)**: Monte Carlo Simulation Engine, History Memory Analytics.

---

### 4. Policy Engine
*   **Trách nhiệm (Responsibility)**: Thực thi cơ chế Policy-as-Code. Chạy kiểm duyệt tự động đối với mọi hành vi của hệ thống để chặn đứng rủi ro pháp lý/tài chính.
*   **Đầu vào (Input)**: `actionName` (Tác vụ yêu cầu), `context` (Tham số tác vụ: ngân sách, tệp dữ liệu, vai trò người chạy).
*   **Đầu ra (Output)**: `PolicyCheckResult` (passed: boolean, violations: PolicyViolation[]).
*   **Sự kiện phát ra (Events)**: `PolicyCheckPassedEvent`, `PolicyViolationTriggeredEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `policies` (id, policy_name, rule_expression, category, enforcement_level, active).
*   **API chính**: 
    *   `evaluatePolicies(action: string, context: Record<string, any>): PolicyCheckResult`
    *   `registerPolicy(policy: IPolicyDefinition): void`
*   **Phụ thuộc (Dependencies)**: Policy-as-Code Expression Parser (`PolicyEvaluator`).

---

### 5. Approval Engine
*   **Trách nhiệm (Responsibility)**: Điều phối luồng ký duyệt của con người (Single, Sequential, Parallel), xử lý hạn giờ (Timeout) và tự động chuyển cấp (Escalation).
*   **Đầu vào (Input)**: `workflowId`, `proposedAction`, `routingType`, `approverRoles`, `timeoutMs`, `escalationRole`.
*   **Đầu ra (Output)**: `ApprovalContract` (Trạng thái duyệt: PENDING | APPROVED | REJECTED | ESCALATED | TIMEOUT).
*   **Sự kiện phát ra (Events)**: `ApprovalRequestedEvent`, `ApprovalApprovedEvent`, `ApprovalRejectedEvent`, `ApprovalEscalatedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `approvals` (id, workflow_id, status, routing_type, created_at, decided_at); Bảng `approvers` (approval_id, role, status, reason, decided_at).
*   **API chính**:
    *   `requestApproval(params: ApprovalParams): Promise<ApprovalContract>`
    *   `submitStepDecision(approvalId: string, role: string, decision: 'APPROVED' | 'REJECTED', reason?: string): boolean`
    *   `checkTimeouts(): void`
*   **Phụ thuộc (Dependencies)**: Policy Engine, Human Workforce Directory.

---

### 6. Workflow Runtime
*   **Trách nhiệm (Responsibility)**: Trái tim vận hành chiến dịch. Quản lý vòng đời SOP thông qua kiến trúc giao dịch phân tán (Saga Pattern) hỗ trợ rollback nghiệp vụ sạch sẽ.
*   **Đầu vào (Input)**: Danh sách các bước trong quy trình (`SagaStep[]`).
*   **Đầu ra (Output)**: Trạng thái chạy (`WorkflowState`: SUCCESS, COMPENSATED, hoặc FAILED).
*   **Sự kiện phát ra (Events)**: `WorkflowStartedEvent`, `StepExecutionSucceededEvent`, `StepExecutionFailedEvent`, `WorkflowCompensatedEvent`, `WorkflowFailedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `workflow_instances` (id, name, status, current_step_id, steps_state_json, started_at, ended_at).
*   **API chính**:
    *   `executeSaga(workflowId: string, name: string, steps: SagaStep[]): Promise<boolean>`
    *   `compensateSteps(workflowId: string, executedSteps: SagaStep[]): Promise<void>`
*   **Phụ thuộc (Dependencies)**: Policy Engine, Approval Engine, Capability Router.

---

### 7. Capability Router
*   **Trách nhiệm (Responsibility)**: Lớp trung gian ánh xạ kỹ năng được yêu cầu trong SOP sang vai trò Agent hoặc Nhân viên con người rảnh rỗi và phù hợp nhất.
*   **Đầu vào (Input)**: Yêu cầu kỹ năng (ví dụ: `['SEO', 'Vietnamese copywriting']`).
*   **Đầu ra (Output)**: Định danh thực thể được gán (`assignedWorkerId`, `assigneeType: 'AI' | 'Human'`).
*   **Sự kiện phát ra (Events)**: `CapabilityMatchedEvent`, `RoutingFailedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `worker_capabilities` (worker_id, capabilities_array, workload_score, status).
*   **API chính**: `matchBestWorker(requiredSkills: string[]): Promise<WorkerAssignment>`.
*   **Phụ thuộc (Dependencies)**: Worker Runtime, Workforce Registry.

---

### 8. Worker Runtime
*   **Trách nhiệm (Responsibility)**: Cung cấp môi trường thực thi (Sandbox) biệt lập, không trạng thái để chạy các Agent (Hermes, Ares, Athena) mà không làm rò rỉ bối cảnh hoặc làm lỗi hệ thống chính.
*   **Đầu vào (Input)**: Chỉ thị công việc (`TaskContract`), Gói ngữ cảnh chuẩn hóa (`CanonicalContextPackage`).
*   **Đầu ra (Output)**: Kết quả chạy (`TaskResultContract`).
*   **Sự kiện phát ra (Events)**: `WorkerExecutionStartedEvent`, `WorkerExecutionCompletedEvent`, `WorkerExecutionFailedEvent`.
*   **Mô hình dữ liệu (Database)**: Logs thực thi tạm thời (Transient Logs).
*   **API chính**: `executeWorker(task: TaskContract, context: CanonicalContextPackage): Promise<TaskResultContract>`.
*   **Phụ thuộc (Dependencies)**: Telemetry Center, LLM API Providers.

---

### 9. Memory Center
*   **Trách nhiệm (Responsibility)**: Lưu trữ và phân tách bối cảnh hội thoại, bối cảnh kinh doanh của từng doanh nghiệp theo mô hình đa khách thuê (Multi-tenant).
*   **Đầu vào (Input)**: Logs tương tác và hội thoại.
*   **Đầu ra (Output)**: Bối cảnh lịch sử rút gọn phù hợp với giới hạn tokens.
*   **Sự kiện phát ra (Events)**: `MemoryIndexedEvent`, `ContextClearedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `memory_records` (id, tenant_id, session_id, key, value_json, weight, access_count, updated_at).
*   **API chính**:
    *   `retrieveContext(sessionId: string, maxTokens: number): Promise<string>`
    *   `saveInteractions(sessionId: string, interaction: InteractionNode): Promise<void>`
*   **Phụ thuộc (Dependencies)**: Redis / PostgreSQL storage layer.

---

### 10. Knowledge Center
*   **Trách nhiệm (Responsibility)**: Lưu trữ và tra cứu bản đồ tri thức (Enterprise Knowledge Graph & Ontologies), bao gồm: tài liệu SOPs, Brand DNA, cẩm nang dịch vụ.
*   **Đầu vào (Input)**: Văn bản tri thức, cấu trúc sơ đồ thực thể.
*   **Đầu ra (Output)**: Điểm dữ liệu/Sự thật đã được xác minh (Verified facts).
*   **Sự kiện phát ra (Events)**: `KnowledgeGraphUpdatedEvent`, `FactVerificationEvent`.
*   **Mô hình dữ liệu (Database)**: Cơ sở dữ liệu Vector (pgvector) + Neo4j Graph.
*   **API chính**:
    *   `queryKnowledge(query: string, tenantId: string): Promise<string[]>`
    *   `verifyFact(fact: string): Promise<{ isVerified: boolean; confidence: number }>`.
*   **Phụ thuộc (Dependencies)**: Embedding Engine, Graph DB Connection.

---

### 11. Audit Center
*   **Trách nhiệm (Responsibility)**: Lưu trữ bất biến nhật ký tất cả hành động (Ai làm, Khi nào, Tại sao, Bằng chứng gì) để phục vụ kiểm toán nội bộ và truy vết.
*   **Đầu vào (Input)**: Gói kiểm toán (`AuditPayload`).
*   **Đầu ra (Output)**: Nhật ký log được lưu trữ bảo mật (Cryptographically hashed trace).
*   **Sự kiện phát ra (Events)**: `AuditLoggedEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `audit_trail` (id, timestamp, workflow_id, actor_id, action, justification, evidence_hash, sign_off_sig).
*   **API chính**:
    *   `logAudit(payload: AuditPayload): void`
    *   `getAuditTrace(workflowId: string): Promise<AuditPayload[]>`
*   **Phụ thuộc (Dependencies)**: Event Bus, Crytography Helpers.

---

### 12. Learning Center
*   **Trách nhiệm (Responsibility)**: Rút ra bài học kinh nghiệm từ Feedback/Rating của CEO và KPIs đạt được để tự điều chỉnh (đột biến) cấu trúc SOP trong Knowledge Center.
*   **Đầu vào (Input)**: `score` (Đánh giá từ CEO), `comments`, `kpiMetrics` (Hiệu quả thực tế của quy trình).
*   **Đầu ra (Output)**: Đề xuất cải tiến SOP hoặc Mutation Rule.
*   **Sự kiện phát ra (Events)**: `SopMutatedEvent`, `LearningdistilledEvent`.
*   **Mô hình dữ liệu (Database)**: Bảng `feedback_logs` (id, task_id, rating, comments); Bảng `sop_mutations` (id, original_sop_id, mutated_sop_id, rationale, applied_at).
*   **API chính**:
    *   `submitFeedback(taskId: string, rating: number, comments: string): Promise<void>`
    *   `distillLessons(tenantId: string): Promise<void>`
*   **Phụ thuộc (Dependencies)**: Goal Engine, Knowledge Center.

---

### 13. Telemetry Center
*   **Trách nhiệm (Responsibility)**: Thu thập số liệu vật lý thực tế như Token Latency, Token Count, LLM Cost, API Error rates để phục vụ tối ưu hóa chi phí.
*   **Đầu vào (Input)**: Các metrics đo lường hiệu năng.
*   **Đầu ra (Output)**: Báo cáo tối ưu và phân bổ ngân sách AI.
*   **Sự kiện phát ra (Events)**: `MetricEmittedEvent`, `CostExceededAlert`.
*   **Mô hình dữ liệu (Database)**: Time-series database (TimescaleDB / InfluxDB).
*   **API chính**: `emitMetric(metricName: string, value: number, tags: Record<string, string>): void`.
*   **Phụ thuộc (Dependencies)**: System Loggers, Event Bus.

---

## III. LUỒNG DỮ LIỆU THỰC THI CHẠY RUNTIME (DATA TRANSITIONS)

Mỗi bước chuyển đổi dữ liệu giữa các Engine đều được đóng gói dữ liệu chặt chẽ và lưu vết kiểm toán:

```
[CEO Chỉ thị]
      │
      ▼
┌──────────────┐
│Intent Engine │ ➔ Nhận: raw string (Ý chí CEO).
└──────┬───────┘ ➔ Trả: IntentContract.
       │         ➔ Xác thực: Ràng buộc cú pháp tham số mục tiêu/hạn mức.
       ▼
┌──────────────┐
│ Goal Engine  │ ➔ Nhận: IntentContract.
└──────┬───────┘ ➔ Trả: GoalTreeContract.
       │         ➔ Xác thực: Đối chiếu sơ đồ phòng ban của tổ chức.
       ▼
┌──────────────┐
│Decision Eng. │ ➔ Nhận: GoalTreeContract.
└──────┬───────┘ ➔ Trả: DecisionContract.
       │         ➔ Xác thực: Kiểm thử Monte Carlo đạt tỷ lệ tin cậy tối thiểu.
       ▼
┌──────────────┐
│Policy Engine │ ➔ Nhận: Action + Context (từ Decision).
└──────┬───────┘ ➔ Trả: PolicyCheckResult.
       │         ➔ Xác thực: Chạy biểu thức logic kiểm tra luật cấm/giới hạn trần chi.
       ▼
┌──────────────┐
│Approval Eng. │ ➔ Nhận: Workflow Context (khi bị cảnh báo/yêu cầu phê duyệt).
└──────┬───────┘ ➔ Trả: ApprovalContract (APPROVED / REJECTED).
       │         ➔ Xác thực: Chữ ký số từ vai trò chỉ định (C-level/Manager).
       ▼
┌──────────────┐
│Workflow Run. │ ➔ Nhận: APPROVED Decision + SOP Steps.
└──────┬───────┘ ➔ Trả: Final execution state (SUCCESS / COMPENSATED / FAILED).
       │         ➔ Xác thực: Kiểm tra checksum đầu ra của từng bước.
       ▼
┌──────────────┐
│ Audit Center │ ➔ Nhận: AuditPayload của tất cả các bước.
└──────┬───────┘ ➔ Trả: Hash kiểm toán lưu cố định.
       │         ➔ Xác thực: Chữ ký của Agent và Người vận hành.
       ▼
┌──────────────┐
│Learning Ctr. │ ➔ Nhận: KPIs + CEO Đánh giá.
└──────────────┘ ➔ Trả: Sop Mutation Rule.
```

---

## IV. BẢN ĐỒ MÔ HÌNH LĨNH VỰC DOANH NGHIỆP (DOMAIN MODEL)

Bella EOS từ bỏ hoàn toàn các khái niệm xoay quanh Chat (Conversation, Message, UserChat) để thiết kế mô hình hướng cấu trúc doanh nghiệp:

```
┌───────────────────────────────────────────────────────────────┐
│                       BUSINESS GOAL                           │
│ - goalId: string                                              │
│ - targetKPI: string (ví dụ: 'REVENUE')                         │
│ - targetValue: number                                         │
│ - ownerRole: string                                           │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     BUSINESS DECISION                         │
│ - decisionId: string                                          │
│ - recommendedStrategy: string                                 │
│ - confidenceScore: number (0.0 - 1.0)                         │
│ - riskScore: number (0.0 - 1.0)                               │
│ - evidenceList: string[]                                      │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      BUSINESS ACTION                          │
│ - actionId: string                                            │
│ - stepName: string                                            │
│ - assignedWorker: string (AI/Human ID)                        │
│ - inputContext: CanonicalContextPackage                       │
│ - compensationAction: string                                  │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     BUSINESS EVIDENCE                         │
│ - evidenceId: string                                          │
│ - executionOutput: string                                     │
│ - qualityScore: number (0 - 100)                              │
│ - auditHash: string (Bất biến)                                │
│ - signOffSignature: string                                    │
└───────────────────────────────────────────────────────────────┘
```

---

## V. ĐẶC TẢ CÁC HỢP ĐỒNG DỮ LIỆU (DATA CONTRACTS)

Các Engine giao tiếp với nhau bằng các Contract được định kiểu tĩnh chặt chẽ (Strongly Typed).

```typescript
// 1. Intent Contract
export interface IntentContract {
  intentId: string;
  tenantId: string;
  rawText: string;
  targetObjective: string;
  spendLimitVnd: number;
  expectedTimelineDays: number;
  timestamp: string;
}

// 2. Decision Contract
export interface AlternativeOption {
  strategyId: string;
  description: string;
  confidenceScore: number;
  riskScore: number;
  pros: string[];
  cons: string[];
}

export interface DecisionContract {
  decisionId: string;
  goalId: string;
  selectedStrategy: string;
  confidenceScore: number;
  riskScore: number;
  evidence: string[];
  alternatives: AlternativeOption[];
  requiresApproval: boolean;
  approvalRoleRequired: 'CEO' | 'MANAGER' | 'NONE';
  timestamp: string;
}

// 3. Approval Contract
export interface ApproverNode {
  role: string;
  userId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt?: string;
}

export interface ApprovalContract {
  approvalId: string;
  workflowId: string;
  taskId: string;
  proposedAction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'TIMEOUT';
  routingType: 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';
  approvers: ApproverNode[];
  timeoutMs?: number;
  escalationRole?: string;
  reason?: string;
  createdAt: string;
}

// 4. Workflow Contract
export interface WorkflowStepState {
  stepId: string;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATED';
  error?: string;
}

export interface WorkflowContract {
  workflowId: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATING' | 'COMPENSATED';
  steps: WorkflowStepState[];
  startedAt: string;
  endedAt?: string;
}

// 5. Task Contract
export interface TaskContract {
  taskId: string;
  workflowId: string;
  taskType: string;
  assignedWorkerId: string;
  assigneeType: 'AI' | 'Human';
  requiredSkills: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  inputDataJson: string;
}

// 6. Evidence Contract
export interface EvidenceContract {
  evidenceId: string;
  taskId: string;
  workflowId: string;
  outputDataJson: string;
  qualityScore: number;
  signedBy: string;
  digitalSignature: string;
  timestamp: string;
}
```

---

## VI. BẢN ĐỒ TRẠNG THÁI RUNTIME (WORKFLOW STATE MACHINE)

Tiến trình chạy (Workflow Runtime) được ràng buộc nghiêm ngặt bằng sơ đồ trạng thái dưới đây:

```
[DRAFT] ──(Decomposed)──> [SIMULATED] ──(Policy Run)──> [POLICY CHECKED]
                                                               │
     ┌─────────────────────────(Requires Approval)─────────────┘
     ▼
[WAITING APPROVAL] ──(Approved)──> [APPROVED] ──(Start Execution)──> [RUNNING]
     │                                                                  │
     ├──(Rejected)──> [REJECTED]                                         ├──(Success)──> [COMPLETED]
     │                                                                  │
     └──(Timeout)───> [TIMEOUT/ESCALATED]                               └──(Error)────> [COMPENSATING]
                                                                                             │
                                                                                             ▼
                                                                                     [COMPENSATED / FAILED]
```

### Chi tiết chuyển dịch trạng thái:
1.  **DRAFT ➔ SIMULATED**: Goal Engine phân rã xong mục tiêu ➔ Kích hoạt Decision Engine chạy Monte Carlo.
2.  **SIMULATED ➔ POLICY CHECKED**: Decision Engine hoàn tất đề xuất ➔ Policy Engine duyệt các luật quy chế.
3.  **POLICY CHECKED ➔ WAITING APPROVAL**: Nếu vượt hạn mức ngân sách hoặc chứa cảnh báo nguy cơ ➔ Tạm treo quy trình, Approval Engine kích hoạt xin chữ ký.
4.  **WAITING APPROVAL ➔ APPROVED**: Cấp thẩm quyền bấm ký duyệt ➔ Chuyển trạng thái được phép kích hoạt.
5.  **APPROVED ➔ RUNNING**: Kích hoạt Workflow Runtime điều phối các Agent thực thi.
6.  **RUNNING ➔ COMPENSATING ➔ COMPENSATED**: Nếu có Agent chạy lỗi trong chuỗi thực thi ➔ Gọi các bước bù trừ (compensation) ngược để khôi phục trạng thái cũ.

---

## VII. CHỈ SỐ ĐO LƯỜNG HIỆU NĂNG TỪNG ENGINE (KPI METRICS)

Để đo lường hiệu năng vận hành thực tế của Bella EOS, các Engine liên tục phát chỉ số đo lường về Telemetry Center:

| Tên Engine | Tên Chỉ Số KPI | Công Thức / Mục Tiêu Đo Lường | Ngưỡng Chất Lượng (SLA) |
| :--- | :--- | :--- | :--- |
| **Intent Engine** | **Accuracy Rate** | Tỷ lệ trích xuất đúng tham số đích từ chỉ thị thô. | **>= 98%** |
| | **Latency** | Thời gian xử lý biên dịch ngôn ngữ tự nhiên. | **< 800ms** |
| **Decision Engine** | **Simulation Time** | Thời gian chạy 10,000 lần Monte Carlo & tìm phương án. | **< 1500ms** |
| | **Risk Accuracy** | Sai số giữa mức độ rủi ro dự báo và rủi ro thực tế xảy ra. | **< 10%** |
| **Workflow Runtime**| **Success Rate** | Tỷ lệ workflow chạy thành công trọn vẹn không bị lỗi hệ thống. | **>= 99.5%** |
| | **Rollback Rate** | Tỷ lệ quy trình kích hoạt bù trừ (compensation) thành công. | **100% (Không treo)** |
| **Approval Engine** | **Approval SLA** | Thời gian phản hồi ký duyệt trung bình của nhân sự. | **< 4 giờ** |
| | **Escalation Rate**| Tỷ lệ công việc trễ hạn phải chuyển cấp tự động lên CEO. | **< 5%** |
| **Learning Center** | **Improvement %** | Hiệu quả cải thiện của KPIs quy trình sau khi áp SOP đột biến. | **>= 15% tăng trưởng** |
| | **Knowledge Growth**| Số lượng bài học/SOP mutations mới được đúc kết. | Tích lũy liên tục |
