/**
 * BELLA EOS TRANSACTIONAL SAGA TEMPLATE
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * This is a boilerplate template for defining and running a transactional Saga workflow.
 */

import { SagaStep, WorkflowRuntime } from '../workflow-runtime';

/**
 * Example function showing how to construct and execute a Saga transaction.
 */
export async function executeExampleTransaction(workflowId: string): Promise<boolean> {
  const workflowRuntime = WorkflowRuntime.getInstance();

  // Track transaction side-effects for demonstration purposes
  const transactionState = {
    step1Done: false,
    step2Done: false,
  };

  // Define steps with actions and corresponding compensation handlers (Backward Recovery)
  const steps: SagaStep[] = [
    {
      stepId: 'step-1-acquire-resource',
      action: async () => {
        console.log('[Saga] Executing Step 1: Acquiring Resource...');
        // Perform action (e.g. state write, db save)
        transactionState.step1Done = true;
        return true; // Return false to simulate intentional failure
      },
      compensate: async () => {
        console.log('[Saga] Rolling back Step 1: Releasing Resource...');
        // Revert action (compensation)
        transactionState.step1Done = false;
      }
    },
    {
      stepId: 'step-2-write-ledger',
      action: async () => {
        console.log('[Saga] Executing Step 2: Writing Ledger...');
        transactionState.step2Done = true;
        return true;
      },
      compensate: async () => {
        console.log('[Saga] Rolling back Step 2: Reverting Ledger Entry...');
        transactionState.step2Done = false;
      }
    },
    {
      stepId: 'step-3-publish-message',
      action: async () => {
        console.log('[Saga] Executing Step 3: Publishing Notification...');
        // For demonstration, let's return false to trigger rollback
        // Change to true for standard successful runs
        const triggerFailure = true; 
        if (triggerFailure) {
          throw new Error('Simulation of transient execution failure');
        }
        return true;
      },
      compensate: async () => {
        console.log('[Saga] Rolling back Step 3: Sending Cancellation Notification...');
      }
    }
  ];

  try {
    // executeSaga coordinates status, runs actions, and rolls back in reverse order if any step fails
    const success = await workflowRuntime.executeSaga(
      workflowId,
      'Boilerplate Saga Example Workflow',
      steps
    );
    
    console.log(`[Saga] Saga Execution Finished. Result: ${success ? 'SUCCESS' : 'COMPENSATED/FAILED'}`);
    return success;
  } catch (error) {
    console.error('[Saga] Critical error starting workflow:', error);
    return false;
  }
}
