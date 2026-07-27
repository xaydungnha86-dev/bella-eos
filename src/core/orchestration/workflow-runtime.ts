export interface SagaStep {
  stepId: string;
  action: () => Promise<boolean>;
  compensate: () => Promise<void>;
}

export class WorkflowRuntime {
  private static instance: WorkflowRuntime;

  private constructor() {}

  public static getInstance(): WorkflowRuntime {
    if (!WorkflowRuntime.instance) {
      WorkflowRuntime.instance = new WorkflowRuntime();
    }
    return WorkflowRuntime.instance;
  }

  /**
   * Executes tasks in a transactional Saga sequence, rolling back on failure.
   */
  public async executeSaga(sagaSteps: SagaStep[]): Promise<boolean> {
    const executed: SagaStep[] = [];
    
    for (const step of sagaSteps) {
      try {
        const ok = await step.action();
        if (!ok) {
          throw new Error(`Saga step ${step.stepId} action returned false`);
        }
        executed.push(step);
      } catch (err) {
        console.warn(`[Saga Workflow] Step ${step.stepId} failed, running compensations...`);
        // Rollback completed steps in reverse order
        for (let i = executed.length - 1; i >= 0; i--) {
          await executed[i].compensate();
        }
        return false;
      }
    }
    return true;
  }
}
