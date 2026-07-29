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

---

## VIII. TẦNG KIỂM SOÁT VẬN HÀNH (OPERATIONAL CONTROL LAYER)

Tầng kiểm soát vận hành đóng vai trò là "Cơ quan An ninh" giám sát chất lượng và tính đúng đắn của 13 Core Engines, bảo đảm hệ thống vận hành đúng quy chế quản trị doanh nghiệp.

```
       [Engine Output]
             │
             ▼
┌──────────────────────────┐
│   Validation Gate check  │ ➔ Failed ➔ [Reject & Return Error]
└────────────┬─────────────┘
             │ Passed
             ▼
┌──────────────────────────┐
│  Evaluate Engine Health  │ ➔ Health Score < 90 ➔ [Emit Alert]
└────────────┬─────────────┘
             │
             ▼
       [Next Engine]
```

### 1. Tiêu chuẩn Hoàn thành của từng Engine (Definition of Done - DoD)
Mỗi Engine chỉ được phép chuyển giao Contract dữ liệu khi đạt các tiêu chuẩn kiểm duyệt sau:

*   **Intent Engine DoD**:
    *   [x] Trường `targetObjective` không được rỗng và phải ánh xạ được tới ít nhất 1 phòng ban cụ thể.
    *   [x] Trường `spendLimitVnd` phải là số dương (hoặc tự áp giá trị mặc định tối thiểu).
    *   [x] `expectedTimelineDays` phải nằm trong giới hạn thực tế (từ 1 đến 365 ngày).
    *   [x] Điểm số tự tin của mô hình ngôn ngữ `confidenceScore` phải lớn hơn **95%**.
*   **Goal Engine DoD**:
    *   [x] Cây mục tiêu `GoalTreeContract` phải có duy nhất một đỉnh gốc chiến lược.
    *   [x] Mỗi mục tiêu con (Leaf Goal) bắt buộc phải có thuộc tính `ownerRole` gán cụ thể cho một vai trò thực tế.
    *   [x] Tổng ngân sách phân bổ của các mục tiêu con không được vượt quá `spendLimitVnd` của mục tiêu gốc.
*   **Decision Engine DoD**:
    *   [x] Kết quả phải đề xuất tối thiểu **2 phương án thay thế** (Alternative Options).
    *   [x] Mỗi phương án thay thế bắt buộc phải ghi rõ tối thiểu **2 Ưu điểm (Pros)** và **1 Nhược điểm (Cons)**.
    *   [x] Phải trích xuất ít nhất **3 dẫn chứng lịch sử** (Evidence) từ EOM Data Fabric làm cơ sở lý luận.
    *   [x] Có chỉ số rủi ro tính toán rõ ràng (`riskScore`).
*   **Policy Engine DoD**:
    *   [x] Toàn bộ các quy tắc chính sách (Dynamic Policies) áp dụng cho tác vụ hiện tại phải được duyệt qua.
    *   [x] Không có bất kỳ vi phạm nào mang cấp độ nghiêm trọng `STRICT_BLOCK` được chấp nhận cho chạy tự động.
*   **Approval Engine DoD**:
    *   [x] Trạng thái nhiệm vụ chuyển sang `APPROVED` hoặc `REJECTED`.
    *   [x] Ghi nhận rõ ràng ID người duyệt thực tế và mã Hash chữ ký số.
    *   [x] Bắt buộc có trường `reason` (lý do) đi kèm đối với các quyết định `REJECTED`.
*   **Workflow Runtime DoD**:
*   [x] Tất cả các bước trong Saga hoặc đạt trạng thái `SUCCESS` hoặc đã chạy hoàn tất các bước hoàn tác `COMPENSATED`.
    *   [x] Không có trạng thái treo (lửng lơ không chạy tiếp và không rollback).

### 2. Các Chốt Kiểm Soát Chất Lượng (Quality Validation Gates)
Giữa hai Engine liên kết bắt buộc phải có một cổng kiểm soát (Gatekeeper) để chặn dữ liệu lỗi:
*   **Intent Gate**: Chặn đầu vào của Goal Engine. Nếu đầu ra của Intent Engine không đạt tiêu chuẩn DoD ➔ Trả lỗi về giao diện UI CEO và yêu cầu CEO làm rõ mục tiêu.
*   **Goal Gate**: Chặn đầu vào của Decision Engine. Nếu Goal Tree phân rã không có người gán (Owner) hoặc thiếu chỉ số KPIs đo lường ➔ Từ chối chạy mô phỏng.
*   **Decision Gate**: Chặn đầu vào của Workflow Runtime. Nếu chiến lược đề xuất có chỉ số rủi ro (`riskScore`) vượt quá trần quy định mà không được đính kèm phê duyệt hợp lệ ➔ Đóng khóa kích hoạt quy trình thực thi.

### 3. Chỉ số Sức Khỏe của từng Engine (Engine Health Score)
Mỗi Engine tự giám sát chất lượng hoạt động của mình theo thang điểm 100:
$$\text{Health Score} = 100 - (\text{Tỷ lệ Lỗi} \times 40) - (\text{Tỷ lệ Quá hạn SLA} \times 40) - (\text{Độ lệch hiệu năng} \times 20)$$
*   **Intent Engine Health**: Dựa trên tỷ lệ CEO phải sửa lại chỉ thị do AI hiểu sai ý định.
*   **Decision Engine Health**: Dựa trên độ lệch sai số giữa tỷ lệ ROI dự báo và ROI thực tế.
*   **Workflow Engine Health**: Dựa trên tỷ lệ bước chạy bị lỗi cần phải rollback (Saga compensation rate).
*   *Nếu Health Score của bất kỳ Engine nào giảm xuống dưới 90, Telemetry Center sẽ tự động phát cảnh báo đỏ (Critical Alert) tới CEO.*

### 4. Đo lường Chất lượng quy trình thực thi (Workflow Quality Score)
Hệ thống không chỉ quan tâm tới việc quy trình chạy thành công về mặt kỹ thuật, mà phải đo lường chất lượng thực thi nghiệp vụ:
*   **Workflow Quality Score (WQS) từ 0 - 100**:
    *   `30%`: Đúng hạn mức tài chính (Không phát sinh chi phí phụ ngoài kế hoạch).
    *   `30%`: Đúng thời hạn cam kết (SLA thực tế so với Timeline dự kiến).
    *   `40%`: Đúng chất lượng đầu ra (Được kiểm định qua bộ lọc kiểm toán và điểm đánh giá thực tế của Quản lý / CEO).

### 5. Chỉ số Giải thích của Quyết sách (Explainability Score)
Để loại bỏ tính chất "hộp đen" của AI, Decision Engine phải chấm điểm khả năng tự giải thích của mình trước khi trình lên CEO:
$$\text{Explainability Score} = (\text{Mức phủ bằng chứng} \times 40\%) + (\text{Độ tươi của dữ liệu} \times 30\%) + (\text{Tính toàn vẹn lập luận} \times 30\%)$$
*   **Mức phủ bằng chứng (Evidence Coverage)**: Đạt 100% nếu mọi đề xuất đều dẫn chiếu tới dữ liệu doanh số thực tế thu thập từ POS/CRM.
*   **Độ tươi của dữ liệu (Data Freshness)**: Đạt 100% nếu dữ liệu sử dụng được cập nhật trong vòng 24h qua.
*   **Tính toàn vẹn lập luận (Reasoning Completeness)**: Cấu trúc logic lập luận được xác thực không có mâu thuẫn bởi bộ kiểm chứng tri thức (Knowledge Center).

### 6. Bản đồ Nhiệt Rủi ro Chính sách (Policy Risk Heatmap)
Thay vì chỉ trả về kết quả nhị phân (ĐẠT/HỎNG), Policy Engine phân tích rủi ro theo 4 chiều kích của doanh nghiệp:
*   **Financial Risk (Rủi ro Tài chính)**: Điểm số rủi ro dựa trên tỷ lệ ngân sách đề xuất so với dòng tiền hiện có.
*   **Compliance Risk (Rủi ro Hợp quy)**: Mức độ tuân thủ tiêu chuẩn ISO, GDPR và quy chế nội bộ.
*   **Privacy Risk (Rủi ro Bảo mật)**: Nguy cơ lộ thông tin cá nhân khách hàng (PII) ra môi trường bên ngoài.
*   **Security Risk (Rủi ro An ninh)**: Nguy cơ bị tấn công, lỗi bảo mật hoặc mất uy tín thương hiệu.
*   *Các điểm số này được tổng hợp thành sơ đồ ma trận Risk Matrix để CEO đưa ra quyết định duyệt chi chính xác.*

### 7. Giám sát Điểm nghẽn Duyệt (Approval SLA Monitor)
Theo dõi hiệu năng phê duyệt của con người:
*   **Average Approval Duration**: Thời gian trung bình để duyệt một yêu cầu (phân tách theo CEO vs Manager).
*   **Escalation Rate %**: Tỷ lệ các tờ trình bị trễ hạn phải tự động kích hoạt chuyển cấp.
*   **SLA Bottleneck Index**: Chỉ số xác định xem khâu phê duyệt con người có đang làm chậm tiến độ chung của các chiến dịch hay không.

### 8. Giám sát Trực quan Tiến độ thực thi (Workflow Runtime Visualization Map)
Mỗi quy trình chạy đều phải cung cấp trạng thái trực quan hóa cho Ban giám đốc, ví dụ:
*   **Chiến dịch Marketing Spa**: `RUNNING (85% Progress)`
    *   ➔ Bước 1: Setup chiến dịch `[DONE]`
    *   ➔ Bước 2: Biên soạn nội dung quảng cáo `[DONE]`
    *   ➔ Bước 3: Thiết kế ảnh/banner chiến dịch `[RUNNING]`
    *   ➔ Bước 4: CEO Ký duyệt xuất bản `[WAITING]`
    *   ➔ Bước 5: Chạy Ads & Gửi mail tự động `[PENDING]`

### 9. Chỉ số Đo lường Hiệu quả Học tập (Learning Gain Metric)
Learning Center chỉ được tính là học tập hiệu quả nếu các đột biến SOP thực sự đem lại giá trị kinh tế:
$$\text{Learning Gain} = \text{KPI}_{\text{Chiến dịch mới}} - \text{KPI}_{\text{Chiến dịch cũ}}$$
*   Nếu hệ thống đề xuất biến đổi cấu trúc SOP (SOP Mutation) nhưng chạy chiến dịch tiếp theo không đem lại chỉ số ROI tăng trưởng hoặc tỷ lệ lỗi tăng lên ➔ Hệ thống tự động phục hồi về phiên bản SOP cũ (Rollback SOP) và gán nhãn đột biến đó là không hiệu quả.

---

## IX. BẢN THÔNG TIN LÃNH ĐẠO CẤP CAO (EXECUTIVE ENTERPRISE DASHBOARD)

Đây là giao diện tối cao dành cho CEO, tổng hợp toàn bộ các chỉ số vận hành logic của 13 Engines và Tầng kiểm soát vận hành thành một Dashboard duy nhất đơn giản, sang trọng và đầy đủ quyền lực:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ BELLA EOS - EXECUTIVE BOARDROOM                                   2026-07-29 21:15  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ SỨC KHỎE DOANH NGHIỆP ]      [ TỶ LỆ AI CHẠY ĐÚNG ]     [ ROI CHIẾN DỊCH TRUNG BÌNH ] │
│         92 / 100                     98.2%                         4.6 x               │
│        (Tốt - Đạt SLA)            (Giảm 0.3% lỗi)             (Tăng 12% so với Q1)     │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  📊 TRẠNG THÁI VẬN HÀNH DÒNG VIỆC (WORKFLOW STATUS)                                    │
│  - Đang vận hành: 18 quy trình      - Chờ duyệt (Pending): 5 tờ trình                  │
│  - Rủi ro nghiêm trọng: 1 (Cần xử lý)  - Vi phạm chính sách: 0                         │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  💰 PHÂN BỔ & CHI PHÍ TÀI NGUYÊN (RESOURCES & COST MONITOR)                           │
│  - Ngân sách đã chi: 62% (310,000,000 VND / 500,000,000 VND)                           │
│  - Chi phí Token AI: 3,200,000 VND  | Tỷ lệ tiết kiệm tài nguyên: +15%                 │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  👑 DANH SÁCH DUYỆT KHẨN CẤP (ACTION ITEMS FOR CEO)                                    │
│  [appr_1785]: Phê duyệt Chiến dịch khuyến mãi Spa Q3 - Ngân sách: 80M | Rủi ro: 45%     │
│               ➔ [Xem Tờ Trình Chi Tiết]  [Ký Phê Duyệt]  [Bác Bỏ]                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## X. VÍ DỤ THỰC TẾ TRÊN DÒNG VIỆC (REAL-WORLD WORKFLOW WALKTHROUGH)

Để lập trình viên dễ hình dung sự phối hợp giữa 13 Engines, dưới đây là luồng xử lý thực tế của một chỉ thị từ CEO.

### Chỉ thị từ CEO:
> *"Tháng 8 tôi muốn tăng doanh thu Spa thêm 20%. Ngân sách marketing tối đa 50 triệu. Không được giảm lợi nhuận dưới 30%. Hãy lập kế hoạch và nếu hợp lý thì triển khai."*

---

### 🧠 PHÂN TẦNG SUY NGHĨ (THINK TIER)
*Nhiệm vụ: Hiểu ý định của lãnh đạo, phân rã công việc và lên phương án.*

#### Bước 1: Intent Engine (Biên dịch ngôn ngữ)
*   **Hành động**: Nhận câu lệnh thô của CEO và dịch thành cấu trúc dữ liệu máy hiểu được.
*   **Kết quả đầu ra (`IntentContract`)**:
    ```json
    {
      "objective": "Tăng doanh thu Spa",
      "target": "+20%",
      "timeline": "Tháng 8",
      "budgetLimit": 50000000,
      "constraints": { "minProfitMargin": 0.30 }
    }
    ```

#### Bước 2: Goal Engine (Phân rã mục tiêu)
*   **Hành động**: Tự động phân chia chỉ tiêu doanh số 20% thành các mục tiêu cụ thể gán cho từng phòng ban.
*   **Kết quả đầu ra (`GoalTreeContract`)**:
    *   **Marketing Goal** (`Owner: CMO AI`): Tăng lượng Lead quan tâm lên 25%.
    *   **Sales Goal** (`Owner: Sales Manager`): Tăng tỷ lệ chốt sales từ 42% lên 50%.
    *   **Spa Operations Goal** (`Owner: Spa Supervisor`): Tăng tỷ lệ khách quay lại bằng chương trình CSKH.
    *   **Inventory Goal** (`Owner: Storekeeper`): Đảm bảo tồn kho dầu massage & dược mỹ phẩm đủ đáp ứng.

#### Bước 3: Decision Engine (Lên chiến lược & Chọn phương án)
*   **Hành động**: Không thực thi ngay lập tức. Chạy mô phỏng Monte Carlo để đề xuất chiến lược tối ưu.
*   **Kết quả đầu ra (`DecisionContract`)**: Đưa ra 3 phương án lựa chọn:
    *   *Phương án A (Google Ads)*: ROI dự kiến 3.5 | Độ tự tin 92% | Rủi ro 12%. (Khuyên dùng)
    *   *Phương án B (Facebook Ads)*: ROI dự kiến 2.8 | Độ tự tin 85% | Rủi ro 25%.
    *   *Phương án C (Tiktok Ads)*: ROI dự kiến 2.0 | Độ tự tin 70% | Rủi ro 45%.

---

### 🛡️ PHÂN TẦNG QUẢN TRỊ & GIÁM SÁT (GOVERN TIER)
*Nhiệm vụ: Kiểm soát rủi ro tài chính, bảo mật thông tin và lấy phê duyệt từ CEO.*

#### Bước 4: Policy Engine (Màng lọc quy chế)
*   **Hành động**: Đối chiếu phương án đề xuất với các luật cứng của doanh nghiệp.
*   **Kiểm tra điều kiện**:
    *   *Ngân sách đề xuất: 48M* ➔ Dưới mức trần 50M ➔ **PASS**
    *   *Quy chế chi tiêu*: Mọi khoản chi ngân sách Marketing > 30M bắt buộc cần CEO duyệt thủ công ➔ **TRIGGER APPROVAL REQUIREMENT**
    *   *An toàn dữ liệu*: Chạy chiến dịch không vi phạm chính sách bảo mật thông tin khách hàng ➔ **PASS**

#### Bước 5: Approval Engine (Ký duyệt con người)
*   **Hành động**: Treo quy trình ở trạng thái `WAITING_APPROVAL` và gửi tờ trình đến ứng dụng của CEO.
*   **Nội dung CEO xem**: Đề xuất chi 48M chạy Ads với ROI dự kiến 3.5, mức độ rủi ro 12%.
*   **CEO phản hồi**: Bấm **[KÝ PHÊ DUYỆT]** ➔ Chuyển trạng thái sang `APPROVED`, kích hoạt luồng chạy tiếp theo.

---

### ⚡ PHÂN TẦNG THỰC THI (EXECUTE TIER)
*Nhiệm vụ: Phối hợp AI & Con người chạy việc, ghi vết kiểm toán và học từ thực tế.*

#### Bước 6: Workflow Runtime (Transactional Saga)
*   **Hành động**: Nhận kế hoạch được duyệt và bắt đầu chạy tuần tự quy trình (SOP) đã đóng gói:
    *   `Bước 1: Viết content` ➔ `Bước 2: Thiết kế banner` ➔ `Bước 3: Lên chiến dịch Ads` ➔ `Bước 4: Gửi bài báo cáo`.

#### Bước 7: Capability Router (Định tuyến năng lực)
*   **Hành động**: Ánh xạ kỹ năng của từng bước đến đúng tài nguyên:
    *   *Tác vụ soạn thảo nội dung* ➔ Giao cho **Athena AI Writer**.
    *   *Tác vụ thiết kế ảnh nghệ thuật* ➔ Giao cho **Apollo AI Designer**.
    *   *Tác vụ tối ưu SEO* ➔ Giao cho **Hermes SEO Agent**.

#### Bước 8: Worker Runtime (Thực thi sandbox)
*   **Hành động**: Khởi tạo phiên làm việc không trạng thái (Stateless Sandbox) cho Agent. Cấp tài nguyên Brand DNA và tài liệu SOP. Agent hoàn thành tác vụ, trả kết quả về bộ nhớ và dữ liệu phiên chạy lập tức được xóa sạch để bảo mật.

#### Bước 9: Audit Center (Nhật ký kiểm toán)
*   **Hành động**: Ghi lại vết toàn bộ tiến trình lịch sử bất biến:
    *   `08:21` - CEO phê duyệt tờ trình ngân sách 48M VND.
    *   `08:22` - Athena AI Writer hoàn thành viết nội dung.
    *   `08:24` - Apollo AI hoàn thành sinh hình ảnh.
    *   `08:26` - Ares Ads Agent đẩy chiến dịch lên quảng cáo.

#### Bước 10: Learning Center (Học tập & Đột biến)
*   **Hành động**: Sau một tháng chạy thực tế, đo lường KPIs thu về tăng trưởng doanh thu 17% (so với mục tiêu CEO đề ra là 20%).
*   **Đột biến tri thức**: AI phân tích nguyên nhân (kết quả Google Ads đạt hiệu suất cao, Facebook Ads kém hơn dự kiến) ➔ Tự động cập nhật SOP Marketing của doanh nghiệp: *Ưu tiên 70% ngân sách cho Google Ads trong chiến dịch tháng sau*.

---

## XI. TRIẾT LÝ PHÂN TÁCH BA TẦNG CỐT LÕI (THE 3-TIER PLATFORM TAXONOMY)

Lập trình viên khi xây dựng Bella EOS cần ghi nhớ 13 Engines thực chất được gom tụ thành 3 tầng hoạt động mạch lạc:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            1. TẦNG SUY NGHĨ (THINK)                      │
│ - Trách nhiệm: Chuyển ý chí thành hành động, phân rã KPIs và mô phỏng.    │
│ - Core: Intent ➔ Goal ➔ Decision                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                            2. TẦNG QUẢN TRỊ (GOVERN)                     │
│ - Trách nhiệm: Giám sát rủi ro, kiểm soát chính sách và lưu vết.          │
│ - Core: Policy ➔ Approval ➔ Audit                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                            3. TẦNG THỰC THI (EXECUTE)                    │
│ - Trách nhiệm: Chạy SOP phân rã, định tuyến năng lực và tự tiến hóa.      │
│ - Core: Workflow ➔ Capability Router ➔ Worker ➔ Learning                 │
└──────────────────────────────────────────────────────────────────────────┘
```

Mỗi dòng chảy dữ liệu qua Bella EOS bắt buộc phải đi qua trục **Think ➔ Govern ➔ Execute**. Đây chính là trái tim kiến trúc giúp Bella EOS thoát ly khỏi một ứng dụng Chatbot đơn thuần để trở thành một Hệ điều hành Doanh nghiệp thực thụ.

```

