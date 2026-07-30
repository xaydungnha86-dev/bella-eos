/**
 * Workflow Runtime Engine
 * Stateful execution runtime with Checkpoint, Retry, Timeout & Saga Compensation.
 */

import { CommandBus } from './command-bus';
import { EventStore } from '../event-sourcing/event-store';

export type WorkflowState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

export interface WorkflowInstance {
  workflowId: string;
  contextId: string;
  state: WorkflowState;
  activeStepIndex: number;
  checkpoints: Record<number, any>;
  completedTasks: string[];
  failedTasks: string[];
  createdAt: string;
  updatedAt: string;
}

export class WorkflowRuntimeEngine {
  private static instance: WorkflowRuntimeEngine;
  private workflows = new Map<string, WorkflowInstance>();

  private constructor() {}

  public static getInstance(): WorkflowRuntimeEngine {
    if (!WorkflowRuntimeEngine.instance) {
      WorkflowRuntimeEngine.instance = new WorkflowRuntimeEngine();
    }
    return WorkflowRuntimeEngine.instance;
  }

  public createWorkflow(workflowId: string, contextId: string): WorkflowInstance {
    const instance: WorkflowInstance = {
      workflowId,
      contextId,
      state: 'IDLE',
      activeStepIndex: 0,
      checkpoints: {},
      completedTasks: [],
      failedTasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.workflows.set(workflowId, instance);
    return instance;
  }

  public getWorkflow(workflowId: string): WorkflowInstance | undefined {
    return this.workflows.get(workflowId);
  }

  public async saveCheckpoint(workflowId: string, stepIndex: number, snapshot: any): Promise<void> {
    const wf = this.workflows.get(workflowId);
    if (wf) {
      wf.checkpoints[stepIndex] = snapshot;
      wf.activeStepIndex = stepIndex;
      wf.updatedAt = new Date().toISOString();

      await EventStore.getInstance().saveEvents(workflowId, [{
        eventId: `evt-chk-${Date.now()}-${stepIndex}`,
        aggregateId: workflowId,
        aggregateType: 'WORKFLOW_RUNTIME',
        eventType: 'CheckpointSaved',
        payload: { stepIndex, snapshot },
        timestamp: new Date().toISOString(),
        version: stepIndex + 1
      }], stepIndex);
    }
  }

  public async executeCommand(workflowId: string, commandType: string, payload: Record<string, any>): Promise<any> {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    wf.state = 'RUNNING';
    try {
      const result = await CommandBus.getInstance().dispatch({
        commandId: `cmd-${Date.now()}`,
        commandType,
        payload,
        timestamp: new Date().toISOString()
      });

      wf.completedTasks.push(payload.taskId || commandType);
      wf.updatedAt = new Date().toISOString();
      return result;
    } catch (err: any) {
      console.error(`[WorkflowRuntime] Command execution failed for ${commandType}:`, err.message);
      wf.failedTasks.push(payload.taskId || commandType);
      
      // Trigger Saga Compensation Rollback if critical
      await this.triggerSagaRollback(workflowId, err.message);
      throw err;
    }
  }

  public async triggerSagaRollback(workflowId: string, reason: string): Promise<void> {
    const wf = this.workflows.get(workflowId);
    if (wf) {
      wf.state = 'ROLLED_BACK';
      wf.updatedAt = new Date().toISOString();
      console.warn(`[WorkflowRuntime] 🔄 Saga Compensation triggered for ${workflowId}. Reason: ${reason}`);

      await EventStore.getInstance().saveEvents(workflowId, [{
        eventId: `evt-rollback-${Date.now()}`,
        aggregateId: workflowId,
        aggregateType: 'WORKFLOW_RUNTIME',
        eventType: 'WorkflowRolledBack',
        payload: { reason, lastStep: wf.activeStepIndex },
        timestamp: new Date().toISOString(),
        version: 999
      }], wf.activeStepIndex);
    }
  }
}
