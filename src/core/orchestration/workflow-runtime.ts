/**
 * BELLA ECOS — Workflow Runtime (L2: Functional Runtime)
 * Sprint 29/30 — Architecture Freeze Maturity Series
 * 
 * Upgraded to Level 2 (Functional Runtime) with:
 *   - IWorkflowStore / InMemoryWorkflowStore / SupabaseWorkflowStore (Persistence Abstraction)
 *   - Optimistic Concurrency Control (OCC) using state versions to prevent race conditions
 *   - Crash Recovery (resumeWorkflow method resuming from saved checkpoints)
 *   - Trace/Correlation ID propagation for end-to-end observability
 *   - Transactional Saga Engine (SagaStep actions & compensation)
 *   - Strict Saga lifecycle states (PENDING, RUNNING, SUCCESS, COMPENSATING, COMPENSATED, FAILED)
 *   - Backward Recovery (executing compensating steps in reverse order of successfully completed steps)
 *   - Error isolation if a compensation action fails (transitions to FAILED status)
 *   - State loaders & savers: loadState(), saveState(), getState()
 *   - Simple RuntimeMetrics logging (runtime-metrics.ts integration)
 *   - Supabase Persistence and in-memory dual fallback
 */

import { RuntimeMetrics, createMetric } from '@/types/runtime-metrics';
import { TurnRuntime, TurnTelemetry } from '../execution/turn-runtime';
import { PolicyEngine } from '../governance/policy-engine';
import { supabase } from '@/lib/supabase';
import { WorkflowEventStreamer } from './workflow-event-streamer';

const RUNTIME_NAME = 'WorkflowRuntime';

const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && !url.includes('placeholder-url') && !key.includes('placeholder-anon-key');
};

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
  version?: number;
  traceId?: string;
  sopId?: string;
  sopVersion?: string;
}

// ─────────────────────────────────────────────
// 2. Persistence Abstraction — IWorkflowStore
// ─────────────────────────────────────────────

export interface IWorkflowStore {
  saveState(state: WorkflowState): Promise<void>;
  getState(workflowId: string): Promise<WorkflowState | undefined>;
  deleteState(workflowId: string): Promise<boolean>;
  getAllStates(): Promise<WorkflowState[]>;
}

export class InMemoryWorkflowStore implements IWorkflowStore {
  private states: Map<string, WorkflowState> = new Map();

  async saveState(state: WorkflowState): Promise<void> {
    const existing = this.states.get(state.workflowId);
    if (existing) {
      const currentVer = existing.version ?? 1;
      const stateVer = state.version ?? 1;
      if (stateVer !== currentVer) {
        throw new Error(`Concurrency conflict: version mismatch. Expected ${currentVer}, got ${stateVer}`);
      }
      state.version = currentVer + 1;
    } else {
      state.version = 1;
    }
    this.states.set(state.workflowId, { ...state });
  }

  // Directly set state without version checks (useful for seeding/loading)
  public saveStateDirect(state: WorkflowState): void {
    this.states.set(state.workflowId, { ...state });
  }

  async getState(workflowId: string): Promise<WorkflowState | undefined> {
    const s = this.states.get(workflowId);
    return s ? { ...s } : undefined;
  }

  async deleteState(workflowId: string): Promise<boolean> {
    return this.states.delete(workflowId);
  }

  async getAllStates(): Promise<WorkflowState[]> {
    return Array.from(this.states.values()).map(s => ({ ...s }));
  }
}

export class SupabaseWorkflowStore implements IWorkflowStore {
  private memoryFallback = new InMemoryWorkflowStore();

  async saveState(state: WorkflowState): Promise<void> {
    const existing = await this.memoryFallback.getState(state.workflowId);

    // Sync to memory fallback which does the local version check
    await this.memoryFallback.saveState(state);

    if (isSupabaseConfigured()) {
      try {
        const currentVersion = state.version ?? 1;
        const dbRecord = {
          workflow_id: state.workflowId,
          name: state.name,
          status: state.status,
          current_step_id: state.currentStepId || null,
          steps: state.steps,
          started_at: state.startedAt,
          ended_at: state.endedAt || null,
          version: currentVersion + 1,
          trace_id: state.traceId || null,
          updated_at: new Date().toISOString()
        };

        if (existing) {
          // Optimistic update
          const { error, data } = await supabase
            .from('workflow_states')
            .update(dbRecord)
            .eq('workflow_id', state.workflowId)
            .eq('version', currentVersion)
            .select();
          
          if (error) {
            console.warn(`[SupabaseWorkflowStore] saveState update failed: ${error.message}`);
          }
          if (!error && (!data || data.length === 0)) {
            throw new Error(`Concurrency conflict on database update for workflow ${state.workflowId}. Version has changed.`);
          }
        } else {
          // Insert new record
          const { error } = await supabase
            .from('workflow_states')
            .insert({ ...dbRecord, version: 1 });
          if (error) {
            console.warn(`[SupabaseWorkflowStore] saveState insert failed: ${error.message}`);
          }
        }
      } catch (err: any) {
        console.warn(`[SupabaseWorkflowStore] saveState exception: ${err.message || err}`);
        throw err;
      }
    }
  }

  async getState(workflowId: string): Promise<WorkflowState | undefined> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('workflow_states')
          .select('*')
          .eq('workflow_id', workflowId)
          .single();
        if (!error && data) {
          const mapped: WorkflowState = {
            workflowId: data.workflow_id,
            name: data.name,
            status: data.status as WorkflowStatus,
            currentStepId: data.current_step_id || undefined,
            steps: typeof data.steps === 'string' ? JSON.parse(data.steps) : data.steps,
            startedAt: Number(data.started_at),
            endedAt: data.ended_at ? Number(data.ended_at) : undefined,
            version: Number(data.version),
            traceId: data.trace_id || undefined
          };
          this.memoryFallback.saveStateDirect(mapped);
          return mapped;
        }
      } catch (err: any) {
        console.warn(`[SupabaseWorkflowStore] getState exception: ${err.message || err}`);
      }
    }
    return this.memoryFallback.getState(workflowId);
  }

  async deleteState(workflowId: string): Promise<boolean> {
    const deleted = await this.memoryFallback.deleteState(workflowId);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('workflow_states')
          .delete()
          .eq('workflow_id', workflowId);
        if (error) {
          console.warn(`[SupabaseWorkflowStore] deleteState failed: ${error.message}`);
        }
      } catch (err: any) {
        console.warn(`[SupabaseWorkflowStore] deleteState exception: ${err.message || err}`);
      }
    }
    return deleted;
  }

  async getAllStates(): Promise<WorkflowState[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('workflow_states')
          .select('*');
        if (!error && data) {
          return data.map(item => ({
            workflowId: item.workflow_id,
            name: item.name,
            status: item.status as WorkflowStatus,
            currentStepId: item.current_step_id || undefined,
            steps: typeof item.steps === 'string' ? JSON.parse(item.steps) : item.steps,
            startedAt: Number(item.started_at),
            endedAt: item.ended_at ? Number(item.ended_at) : undefined,
            version: Number(item.version),
            traceId: item.trace_id || undefined
          }));
        }
      } catch (err: any) {
        console.warn(`[SupabaseWorkflowStore] getAllStates exception: ${err.message || err}`);
      }
    }
    return this.memoryFallback.getAllStates();
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
    this.store = store ?? new SupabaseWorkflowStore();
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
  public async executeSaga(
    workflowId: string,
    name: string,
    sagaSteps: SagaStep[],
    traceId?: string,
    sopId?: string,
    sopVersion?: string
  ): Promise<boolean> {
    return this.measureAsync('executeSaga', async () => {
      if (!workflowId || !name) {
        throw new Error('executeSaga: workflowId and name are required');
      }
      if (!sagaSteps || sagaSteps.length === 0) {
        throw new Error('executeSaga: sagaSteps must not be empty');
      }

      // Initialize state with immutable SOP version reference
      const state: WorkflowState = {
        workflowId,
        name,
        status: 'PENDING',
        steps: sagaSteps.map(step => ({ stepId: step.stepId, status: 'PENDING' })),
        startedAt: Date.now(),
        version: 1,
        traceId,
        sopId,
        sopVersion
      };
      await this.store.saveState(state);

      state.status = 'RUNNING';
      await this.store.saveState(state);
      WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'WORKFLOW_STARTED', undefined, { totalSteps: sagaSteps.length }, state.traceId);

      const executedSteps: SagaStep[] = [];
      let executionFailed = false;
      let failureError = '';

      for (const step of sagaSteps) {
        state.currentStepId = step.stepId;
        const stepState = state.steps.find(s => s.stepId === step.stepId)!;
        stepState.status = 'RUNNING';
        await this.store.saveState(state);
        WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'STEP_STARTED', step.stepId, { budgetVnd: step.budgetVnd }, state.traceId);

        const turn = new TurnRuntime({
          tenantId: 'tenant-default',
          userId: 'user-default',
          workflowId: workflowId,
          taskId: step.stepId,
          traceId: state.traceId,
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
          await this.store.saveState(state);
          WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'STEP_COMPLETED', step.stepId, undefined, state.traceId);

          const telemetry = turn.endTurn('COMPLETED');
          this.turnTelemetries.push(telemetry);
        } catch (err: any) {
          executionFailed = true;
          failureError = err.message ?? 'Unknown execution error';
          stepState.status = 'FAILED';
          stepState.error = failureError;
          await this.store.saveState(state);
          WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'STEP_FAILED', step.stepId, { error: failureError }, state.traceId);

          const telemetry = turn.endTurn('FAILED', failureError);
          this.turnTelemetries.push(telemetry);
          break;
        }
      }

      if (!executionFailed) {
        state.status = 'SUCCESS';
        state.endedAt = Date.now();
        state.currentStepId = undefined;
        await this.store.saveState(state);
        WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'WORKFLOW_COMPLETED', undefined, { status: 'SUCCESS' }, state.traceId);
        return true;
      }

      // Execute Compensations in reverse order
      state.status = 'COMPENSATING';
      await this.store.saveState(state);
      WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'COMPENSATION_STARTED', undefined, { failedStepId: state.currentStepId }, state.traceId);
      console.warn(`[Saga Workflow] Step ${state.currentStepId} failed, running compensations...`);

      let compensationFailed = false;

      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const compStep = executedSteps[i];
        const stepState = state.steps.find(s => s.stepId === compStep.stepId)!;

        try {
          await compStep.compensate();
          stepState.status = 'COMPENSATED';
          await this.store.saveState(state);
          WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'COMPENSATION_COMPLETED', compStep.stepId, undefined, state.traceId);
        } catch (compErr: any) {
          compensationFailed = true;
          stepState.error = `Compensation failed: ${compErr.message}`;
          await this.store.saveState(state);
        }
      }

      state.status = compensationFailed ? 'FAILED' : 'COMPENSATED';
      state.endedAt = Date.now();
      state.currentStepId = undefined;
      await this.store.saveState(state);
      WorkflowEventStreamer.getInstance().emitEvent(workflowId, name, 'WORKFLOW_COMPLETED', undefined, { status: state.status }, state.traceId);

      return false;
    });
  }

  /**
   * Resumes an interrupted workflow from its last saved state checkpoint.
   */
  public async resumeWorkflow(workflowId: string, sagaSteps: SagaStep[]): Promise<boolean> {
    return this.measureAsync('resumeWorkflow', async () => {
      const state = await this.store.getState(workflowId);
      if (!state) {
        throw new Error(`resumeWorkflow: workflow state not found for ${workflowId}`);
      }

      if (state.status === 'SUCCESS') {
        return true;
      }
      if (state.status === 'COMPENSATED') {
        return false;
      }

      state.status = 'RUNNING';
      await this.store.saveState(state);

      const executedSteps: SagaStep[] = [];
      let executionFailed = false;
      let failureError = '';

      for (const step of sagaSteps) {
        state.currentStepId = step.stepId;
        let stepState = state.steps.find(s => s.stepId === step.stepId);
        if (!stepState) {
          stepState = { stepId: step.stepId, status: 'PENDING' };
          state.steps.push(stepState);
        }

        // If the step is already marked SUCCESS, skip action execution but track for compensations
        if (stepState.status === 'SUCCESS') {
          executedSteps.push(step);
          continue;
        }

        stepState.status = 'RUNNING';
        await this.store.saveState(state);

        const turn = new TurnRuntime({
          tenantId: 'tenant-default',
          userId: 'user-default',
          workflowId: workflowId,
          taskId: step.stepId,
          traceId: state.traceId,
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
          await this.store.saveState(state);

          const telemetry = turn.endTurn('COMPLETED');
          this.turnTelemetries.push(telemetry);
        } catch (err: any) {
          executionFailed = true;
          failureError = err.message ?? 'Unknown execution error';
          stepState.status = 'FAILED';
          stepState.error = failureError;
          await this.store.saveState(state);

          const telemetry = turn.endTurn('FAILED', failureError);
          this.turnTelemetries.push(telemetry);
          break;
        }
      }

      if (!executionFailed) {
        state.status = 'SUCCESS';
        state.endedAt = Date.now();
        state.currentStepId = undefined;
        await this.store.saveState(state);
        return true;
      }

      // Execute Compensations in reverse order
      state.status = 'COMPENSATING';
      await this.store.saveState(state);
      console.warn(`[Saga Workflow] Step ${state.currentStepId} failed, running compensations...`);

      let compensationFailed = false;

      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const compStep = executedSteps[i];
        const stepState = state.steps.find(s => s.stepId === compStep.stepId)!;

        try {
          await compStep.compensate();
          stepState.status = 'COMPENSATED';
          await this.store.saveState(state);
        } catch (compErr: any) {
          compensationFailed = true;
          stepState.error = `Compensation failed: ${compErr.message}`;
          await this.store.saveState(state);
        }
      }

      state.status = compensationFailed ? 'FAILED' : 'COMPENSATED';
      state.endedAt = Date.now();
      state.currentStepId = undefined;
      await this.store.saveState(state);

      return false;
    });
  }

  // ── State Loaders, Savers & Accessors ──

  public async loadState(workflowId: string): Promise<WorkflowState | undefined> {
    return this.measureAsync('loadState', async () => {
      if (!workflowId) throw new Error('loadState: workflowId is required');
      return this.store.getState(workflowId);
    });
  }

  public async saveState(state: WorkflowState): Promise<void> {
    return this.measureAsync('saveState', async () => {
      if (!state || !state.workflowId) throw new Error('saveState: state and workflowId are required');
      await this.store.saveState(state);
    });
  }

  public async getState(workflowId: string): Promise<WorkflowStatus | undefined> {
    return this.measureAsync('getState', async () => {
      if (!workflowId) throw new Error('getState: workflowId is required');
      const s = await this.store.getState(workflowId);
      return s?.status;
    });
  }
}
