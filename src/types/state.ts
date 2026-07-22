/**
 * BELLA EOS PLATFORM CONTRACT: State Management Contract (IStateStore v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages Current Truth State for Workflows, Payments, Risks, and Approvals.
 */

export interface EntityTruthState {
  entityId: string;
  entityType: string;
  currentState: string;
  previousState?: string;
  version: number;
  payload: Record<string, any>;
  updatedAt: string;
}

export interface StateTransitionResult {
  success: boolean;
  entityId: string;
  fromState: string;
  toState: string;
  timestamp: string;
  error?: string;
}

export interface StateHistoryLog {
  transitionId: string;
  entityId: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  timestamp: string;
}

export interface IStateStore {
  getState(entityId: string): Promise<EntityTruthState | null>;
  transition(entityId: string, event: string, payload?: any): Promise<StateTransitionResult>;
  history(entityId: string): Promise<StateHistoryLog[]>;
}
