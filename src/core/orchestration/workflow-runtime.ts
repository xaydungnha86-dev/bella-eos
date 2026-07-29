/**
 * BELLA ECOS — Workflow Runtime (L2: Functional Runtime)
 * Sprint 29 — Architecture Freeze Maturity Series
 * 
 * Upgraded to Level 2 (Functional Runtime) with:
 *   - IWorkflowStore / InMemoryWorkflowStore (Persistence Abstraction)
 *   - Transactional Saga Engine (SagaStep actions & compensation)
 *   - Strict Saga lifecycle states (PENDING, RUNNING, SUCCESS, COMPENSATING, COMPENSATED, FAILED)
 *   - Backward Recovery (executing compensating steps in reverse order of successfully completed steps)
 *   - Error isolation if a compensation action fails (transitions to FAILED status)
 *   - State loaders & savers: loadState(), saveState(), getState()
 *   - Simple RuntimeMetrics logging (runtime-metrics.ts integration)
 */

import { RuntimeMetrics, createMetric } from '@/types/runtime-metrics';
import { TurnRuntime, TurnTelemetry } from '../execution/turn-runtime';
import { PolicyEngine } from '../governance/policy-engine';

const RUNTIME_NAME = 'WorkflowRuntime';

// ─────────────────────────────────────────────
// 1. Core Saga Types
// ─────────────────────────────────────────────

export interface SagaStep {
  stepId: string;
  action: () => Promise<boolean>;
  compensate: () => Promise<void>;
  budgetVnd?: number;
}

export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATING' | 'COMPENSATED';

export interface WorkflowState {
  workflowId: string;
  name: string;
  status: WorkflowStatus;
  currentStepId?: string;
  steps: Array<{
    stepId: string;
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'COMPENSATED';
    error?: string;
  }>;
  startedAt: number;
  endedAt?: number;
}

// ─────────────────────────────────────────────
// 2. Persistence Abstraction — IWorkflowStore
// ─────────────────────────────────────────────

export interface IWorkflowStore {
  saveState(state: WorkflowState): void;
  getState(workflowId: string): WorkflowState | undefined;
  deleteState(workflowId: string): boolean;
  getAllStates(): WorkflowState[];
}

export class InMemoryWorkflowStore implements IWorkflowStore {
  private states: Map<string, WorkflowState> = new Map();

  saveState(state: WorkflowState): void {
    this.states.set(state.workflowId, state);
  }

  getState(workflowId: string): WorkflowState | undefined {
    return this.states.get(workflowId);
  }

  deleteState(workflowId: string): boolean {
    return this.states.delete(workflowId);
  }

  getAllStates(): WorkflowState[] {
    return Array.from(this.states.values());
  }
}

// ─────────────────────────────────────────────
// 3. WorkflowRuntime — Public L2 API
// ─────────────────────────────────────────────

export class WorkflowRuntime {
  private static instance: WorkflowRuntime;
  private store: IWorkflowStore;
  private metricsLog: RuntimeMetrics[] = [];
  private turnTelemetries: TurnTelemetry[] = [];

  private constructor(store?: IWorkflowStore) {
    this.store = store ?? new InMemoryWorkflowStore();
  }

  public static getInstance(store?: IWorkflowStore): WorkflowRuntime {
    if (!WorkflowRuntime.instance) {
      WorkflowRuntime.instance = new WorkflowRuntime(store);
    }
    return WorkflowRuntime.instance;
  }

  /** @internal — for testing only */
  public static resetInstance(): void {
    (WorkflowRuntime as any).instance = undefined;
  }

  // ── Metrics helpers ──

  private measure<T>(operation: string, fn: () => T): T {
    const startedAt = Date.now();
    let success = true;
    let errorCode: string | undefined;
    let result: T;
    try {
      result = fn();
    } catch (err: any) {
      success = false;
      errorCode = err?.message ?? 'UNKNOWN_ERROR';
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success, errorCode));
      throw err;
    }
    this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success));
    return result!;
  }

  private async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startedAt = Date.now();
    let success = true;
    let errorCode: string | undefined;
    try {
      const result = await fn();
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success));
      return result;
    } catch (err: any) {
      success = false;
      errorCode = err?.message ?? 'UNKNOWN_ERROR';
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success, errorCode));
      throw err;
    }
  }

  public getMetrics(): RuntimeMetrics[] {
    return [...this.metricsLog];
  }

  public clearMetrics(): void {
    this.metricsLog = [];
  }

  public getTurnTelemetries(): TurnTelemetry[] {
    return [...this.turnTelemetries];
  }

  public clearTurnTelemetries(): void {
    this.turnTelemetries = [];
  }

  // ── Core API ──

  /**
   * Executes tasks in a transactional Saga sequence, rolling back on failure.
   * Updates state during execution and persists via IWorkflowStore.
   */
  public async executeSaga(workflowId: string, name: string, sagaSteps: SagaStep[]): Promise<boolean> {
    return this.measureAsync('executeSaga', async () => {
      if (!workflowId || !name) {
        throw new Error('executeSaga: workflowId and name are required');
      }
      if (!sagaSteps || sagaSteps.length === 0) {
        throw new Error('executeSaga: sagaSteps must not be empty');
      }

      // Initialize state
      const state: WorkflowState = {
        workflowId,
        name,
        status: 'PENDING',
        steps: sagaSteps.map(step => ({ stepId: step.stepId, status: 'PENDING' })),
        startedAt: Date.now()
      };
      this.store.saveState(state);

      state.status = 'RUNNING';
      this.store.saveState(state);

      const executedSteps: SagaStep[] = [];
      let executionFailed = false;
      let failureError = '';

      for (const step of sagaSteps) {
        state.currentStepId = step.stepId;
        const stepState = state.steps.find(s => s.stepId === step.stepId)!;
        stepState.status = 'RUNNING';
        this.store.saveState(state);

        const turn = new TurnRuntime({
          tenantId: 'tenant-default',
          userId: 'user-default',
          workflowId: workflowId,
          taskId: step.stepId,
          provider: 'openai',
          model: 'gpt-4o'
        });

        try {
          if (step.budgetVnd !== undefined) {
            const policyResult = PolicyEngine.getInstance().checkBudgetPolicy(step.budgetVnd);
            if (!policyResult.passed) {
              throw new Error(`Policy violation: ${policyResult.reason}`);
            }
          }

          const ok = await step.action();
          if (!ok) {
            throw new Error(`Saga step "${step.stepId}" action returned false`);
          }
          stepState.status = 'SUCCESS';
          executedSteps.push(step);
          this.store.saveState(state);

          const telemetry = turn.endTurn('COMPLETED');
          this.turnTelemetries.push(telemetry);
        } catch (err: any) {
          executionFailed = true;
          failureError = err.message ?? 'Unknown execution error';
          stepState.status = 'FAILED';
          stepState.error = failureError;
          this.store.saveState(state);

          const telemetry = turn.endTurn('FAILED', failureError);
          this.turnTelemetries.push(telemetry);
          break;
        }
      }

      if (!executionFailed) {
        state.status = 'SUCCESS';
        state.endedAt = Date.now();
        state.currentStepId = undefined;
        this.store.saveState(state);
        return true;
      }

      // Execute Compensations in reverse order
      state.status = 'COMPENSATING';
      this.store.saveState(state);
      console.warn(`[Saga Workflow] Step ${state.currentStepId} failed, running compensations...`);

      let compensationFailed = false;

      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const compStep = executedSteps[i];
        const stepState = state.steps.find(s => s.stepId === compStep.stepId)!;

        try {
          await compStep.compensate();
          stepState.status = 'COMPENSATED';
          this.store.saveState(state);
        } catch (compErr: any) {
          compensationFailed = true;
          stepState.error = `Compensation failed: ${compErr.message}`;
          this.store.saveState(state);
          // Continue compensating remaining steps if possible, or stop?
          // Standard Saga design continues compensating others, but registers total failure.
        }
      }

      state.status = compensationFailed ? 'FAILED' : 'COMPENSATED';
      state.endedAt = Date.now();
      state.currentStepId = undefined;
      this.store.saveState(state);

      return false;
    });
  }

  // ── State Loaders, Savers & Accessors ──

  public loadState(workflowId: string): WorkflowState | undefined {
    return this.measure('loadState', () => {
      if (!workflowId) throw new Error('loadState: workflowId is required');
      return this.store.getState(workflowId);
    });
  }

  public saveState(state: WorkflowState): void {
    this.measure('saveState', () => {
      if (!state || !state.workflowId) throw new Error('saveState: state and workflowId are required');
      this.store.saveState(state);
    });
  }

  public getState(workflowId: string): WorkflowStatus | undefined {
    return this.measure('getState', () => {
      if (!workflowId) throw new Error('getState: workflowId is required');
      return this.store.getState(workflowId)?.status;
    });
  }
}
