# 🔄 ECOS Transactional Saga Workflow Guide (L2 Maturity)

This guide documents how to design, write, and execute transaction-safe workflows in **Bella ECOS (Enterprise Cognitive Operating System)** using the transactional Saga design pattern.

---

## 1. Saga Pattern & ECOS Core Workflow Philosophy

In a distributed or multi-agent operating system, executing complex tasks step-by-step requires transaction integrity. If step 3 fails, the system must rollback steps 1 and 2 automatically.

ECOS implements this through a **Transactional Saga Engine** with **Backward Recovery** (compensating actions):
* Each step in a Saga is represented as a `SagaStep`.
* A step must declare an `action` (the forward logic) and a `compensate` (the rollback logic).
* If any action fails, the engine transitions the workflow to `COMPENSATING` state and runs all completed steps' compensation handlers in **reverse order** (LIFO) of their execution.

---

## 2. Workflow State Machine

Saga transactions transition through the following states, tracked in the `IWorkflowStore` persistence database:

```
          PENDING (Workflow defined & saved)
             │
             ▼
          RUNNING (Executing actions step-by-step)
             ├──────────────────────────┐
             ▼ (All actions succeed)    ▼ (Any action fails/throws)
          SUCCESS                  COMPENSATING (Running rollback logic)
                                        ├──────────────────────────┐
                                        ▼ (All compensations pass) ▼ (Any compensation fails)
                                   COMPENSATED                 FAILED
```

* **PENDING**: Workflow instantiated.
* **RUNNING**: Currently executing forward steps.
* **SUCCESS**: Workflow completed successfully.
* **COMPENSATING**: Rolled back successfully up to the point of failure.
* **COMPENSATED**: Rollback completed successfully. System returned to original state.
* **FAILED**: Rollback encountered a critical error during execution. Needs intervention.

---

## 3. Designing a Saga Workflow

Each step must be fully idempotent:
1. **Idempotent Actions**: If an action is retried, it must produce the same result without double-counting.
2. **Deterministic Compensations**: The compensation logic must restore the state to what it was before the action ran.

### SagaStep Definition

```typescript
export interface SagaStep {
  stepId: string;
  action: () => Promise<boolean>;
  compensate: () => Promise<void>;
}
```

---

## 4. Saga Execution and State Persistence

To run a Saga workflow, use `WorkflowRuntime.getInstance()`:

```typescript
import { WorkflowRuntime } from 'src/core/orchestration/workflow-runtime';

const workflowRuntime = WorkflowRuntime.getInstance();

const success = await workflowRuntime.executeSaga(
  'workflow-unique-id',
  'Process Order Transaction',
  [
    {
      stepId: 'reserve-stock',
      action: async () => { ... },
      compensate: async () => { ... }
    },
    {
      stepId: 'process-payment',
      action: async () => { ... },
      compensate: async () => { ... }
    }
  ]
);
```

---

## 5. Sample Implementation

Refer to the boilerplate code template located at [boilerplate-saga.ts](file:///d:/Antigravity/Projects/DN%20WORKFLOW/src/core/orchestration/templates/boilerplate-saga.ts) to jumpstart your workflow configuration.
