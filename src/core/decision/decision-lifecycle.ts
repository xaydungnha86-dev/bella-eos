import { EicStatus } from '../contracts/executive-intelligence-contract';

export type DecisionState = EicStatus | 'SUPERSEDED' | 'MERGED' | 'SPLIT' | 'EXPIRED' | 'ROLLED_BACK';

export class DecisionLifecycleManager {
  private static instance: DecisionLifecycleManager;
  private states: Map<string, DecisionState> = new Map();


  private constructor() {}

  public static getInstance(): DecisionLifecycleManager {
    if (!DecisionLifecycleManager.instance) {
      DecisionLifecycleManager.instance = new DecisionLifecycleManager();
    }
    return DecisionLifecycleManager.instance;
  }

  public transitionDecision(decisionId: string, state: DecisionState): void {
    const oldState = this.states.get(decisionId) || 'CREATED';
    this.states.set(decisionId, state);
    console.log(`[Decision Lifecycle] Transitioned ${decisionId} from ${oldState} to ${state}`);
  }

  public getDecisionState(decisionId: string): DecisionState {
    return this.states.get(decisionId) || 'CREATED';
  }
}
