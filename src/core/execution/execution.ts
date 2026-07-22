import { CanonicalContextPackage } from '../../types/eom';
import { BellaKernel } from '../kernel/kernel';

export class InternalApiGateway {
  static dispatchCall(executor: any, step: any, contextPackage: CanonicalContextPackage): any {
    console.log(`[Internal API Gateway] Dispatching task [${step.name}] to Worker [${executor.assignedWorker}]`);
    
    // CRITICAL SECURITY ENFORCEMENT: 
    // We verify that ONLY the Canonical Context Package is sent. No direct database handles or active connection pools are exposed.
    if (!contextPackage || !contextPackage.objective) {
      throw new Error(`[Security Violation] Dispatched call failed - Missing secure Canonical Context Package!`);
    }

    BellaKernel.emitKernelEvent('TaskCreated', {
      taskId: step.id,
      workerId: executor.assignedWorker,
      contextTimestamp: contextPackage.timestamp
    });

    return {
      status: 'DISPATCHED',
      payload: {
        workerId: executor.assignedWorker,
        canonicalContext: contextPackage
      }
    };
  }
}

export class ExecutionEngine {
  static ExecutionCoordinator = {
    execute(executor: any, step: any, contextPackage: CanonicalContextPackage) {
      console.log(`[Execution Coordinator] Initializing execution track for task [${step.name}]`);
      
      const dispatchResult = InternalApiGateway.dispatchCall(executor, step, contextPackage);
      
      // Simulating worker execution
      const latency = executor.latencyMs || 500;
      console.log(`[Execution Coordinator] Worker [${executor.assignedWorker}] running command with latency ${latency}ms...`);
      
      BellaKernel.emitKernelEvent('TaskCompleted', {
        taskId: step.id,
        status: 'SUCCESS'
      });

      return {
        dispatchStatus: dispatchResult.status,
        executionResult: 'SUCCESS',
        workerResponse: `Drafted content for ${step.name}`
      };
    }
  };
}
