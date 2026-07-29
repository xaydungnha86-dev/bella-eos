/**
 * BELLA EOS ORCHESTRATION: Real-Time Workflow Event Streamer (SSE Foundation)
 * Emits execution events dynamically during Saga transaction lifecycles.
 */

import { EventEmitter } from 'events';

export type WorkflowEventType =
  | 'WORKFLOW_STARTED'
  | 'STEP_STARTED'
  | 'STEP_COMPLETED'
  | 'STEP_FAILED'
  | 'COMPENSATION_STARTED'
  | 'COMPENSATION_COMPLETED'
  | 'OCC_CONFLICT'
  | 'WORKFLOW_RESUMED'
  | 'WORKFLOW_COMPLETED';

export interface WorkflowStreamEvent {
  eventId: string;
  workflowId: string;
  workflowName: string;
  type: WorkflowEventType;
  stepId?: string;
  timestamp: string;
  details?: Record<string, any>;
  traceId?: string;
}

export class WorkflowEventStreamer extends EventEmitter {
  private static instance: WorkflowEventStreamer;
  private eventHistory: WorkflowStreamEvent[] = [];

  private constructor() {
    super();
    this.setMaxListeners(50);
  }

  public static getInstance(): WorkflowEventStreamer {
    if (!WorkflowEventStreamer.instance) {
      WorkflowEventStreamer.instance = new WorkflowEventStreamer();
    }
    return WorkflowEventStreamer.instance;
  }

  public static resetInstance(): void {
    if (WorkflowEventStreamer.instance) {
      WorkflowEventStreamer.instance.removeAllListeners();
      WorkflowEventStreamer.instance.eventHistory = [];
    }
    WorkflowEventStreamer.instance = new WorkflowEventStreamer();
  }

  /**
   * Broadcasts a workflow event to all active SSE subscribers.
   */
  public emitEvent(
    workflowId: string,
    workflowName: string,
    type: WorkflowEventType,
    stepId?: string,
    details?: Record<string, any>,
    traceId?: string
  ): WorkflowStreamEvent {
    const streamEvent: WorkflowStreamEvent = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      workflowId,
      workflowName,
      type,
      stepId,
      timestamp: new Date().toISOString(),
      details,
      traceId
    };

    this.eventHistory.push(streamEvent);
    this.emit('workflow-event', streamEvent);
    this.emit(`workflow:${workflowId}`, streamEvent);

    console.log(`[SSE Streamer] 📡 Emitted event [${type}] for Workflow [${workflowId}] Step [${stepId || 'N/A'}]`);

    return streamEvent;
  }

  /**
   * Retrieves recent event history for a given workflow or globally.
   */
  public getHistory(workflowId?: string): WorkflowStreamEvent[] {
    if (workflowId) {
      return this.eventHistory.filter(e => e.workflowId === workflowId);
    }
    return [...this.eventHistory];
  }
}
