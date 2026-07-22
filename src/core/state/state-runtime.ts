/**
 * BELLA EOS CORE: State Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of IStateStore v1.0.
 */

import { EntityTruthState, IStateStore, StateHistoryLog, StateTransitionResult } from '@/types/state';

export class StateRuntime implements IStateStore {
  private static instance: StateRuntime;
  private states: Map<string, EntityTruthState> = new Map();
  private logs: Map<string, StateHistoryLog[]> = new Map();

  private constructor() {}

  public static getInstance(): StateRuntime {
    if (!StateRuntime.instance) {
      StateRuntime.instance = new StateRuntime();
    }
    return StateRuntime.instance;
  }

  public async getState(entityId: string): Promise<EntityTruthState | null> {
    return this.states.get(entityId) || null;
  }

  public async transition(entityId: string, event: string, payload?: any): Promise<StateTransitionResult> {
    const current = this.states.get(entityId);
    const fromState = current ? current.currentState : 'UNINITIALIZED';
    const toState = event; // Simple state transition logic

    const updatedState: EntityTruthState = {
      entityId,
      entityType: current ? current.entityType : 'GenericEntity',
      currentState: toState,
      previousState: fromState,
      version: current ? current.version + 1 : 1,
      payload: { ...current?.payload, ...payload },
      updatedAt: new Date().toISOString()
    };

    this.states.set(entityId, updatedState);

    const historyItem: StateHistoryLog = {
      transitionId: `tr-${Date.now()}`,
      entityId,
      fromState,
      toState,
      triggeredBy: 'StateRuntime',
      timestamp: new Date().toISOString()
    };

    if (!this.logs.has(entityId)) {
      this.logs.set(entityId, []);
    }
    this.logs.get(entityId)!.push(historyItem);

    return {
      success: true,
      entityId,
      fromState,
      toState,
      timestamp: historyItem.timestamp
    };
  }

  public async history(entityId: string): Promise<StateHistoryLog[]> {
    return this.logs.get(entityId) || [];
  }
}
