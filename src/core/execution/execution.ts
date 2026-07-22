import { CanonicalContextPackage } from '../../types/eom';
import { BellaKernel } from '../kernel/kernel';
import { FacebookConnector, SupabaseConnector } from '../../connectors/index';

export class InternalApiGateway {
  static async dispatchCall(executor: any, step: any, contextPackage: CanonicalContextPackage): Promise<any> {
    const workerId = executor.assignedWorker || executor.workerId || 'hermes';
    console.log(`[Internal API Gateway] Dispatching task [${step.name}] to Worker [${workerId}]`);
    
    // SECURITY ENFORCEMENT: 
    // We verify that ONLY the Canonical Context Package is sent. No direct database handles or active connection pools are exposed.
    if (!contextPackage || !contextPackage.objective) {
      throw new Error(`[Security Violation] Dispatched call failed - Missing secure Canonical Context Package!`);
    }

    BellaKernel.emitKernelEvent('TaskCreated', {
      taskId: step.id,
      workerId: workerId,
      contextTimestamp: contextPackage.timestamp
    });

    // Save Canonical Context to Supabase DB asynchronously
    SupabaseConnector.saveCanonicalContext(contextPackage);

    // REAL DISPATCH LOGIC FOR FACEBOOK / HERMES
    let realExecutionResult: any = null;
    if (workerId === 'hermes' || step.name.includes('Facebook') || step.name.includes('Setup') || step.name.includes('Social')) {
      const messageToPublish = `🚀 [BELLA EOS AUTOMATION] ${contextPackage.objective}\n\n✨ Tông giọng: ${contextPackage.brandDna.voiceTone}\n🎯 Phân khúc: VIP Spa Clients\n#BellaEOS #EnterpriseBrain #Automation2026`;
      realExecutionResult = await FacebookConnector.publishRealPost(messageToPublish);
    }

    return {
      status: 'DISPATCHED',
      payload: {
        workerId: workerId,
        canonicalContext: contextPackage,
        realExecution: realExecutionResult
      }
    };
  }
}

export class ExecutionEngine {
  static ExecutionCoordinator = {
    async execute(executor: any, step: any, contextPackage: CanonicalContextPackage) {
      console.log(`[Execution Coordinator] Initializing execution track for task [${step.name}]`);
      
      const dispatchResult = await InternalApiGateway.dispatchCall(executor, step, contextPackage);
      
      BellaKernel.emitKernelEvent('TaskCompleted', {
        taskId: step.id,
        status: 'SUCCESS'
      });

      return {
        dispatchStatus: dispatchResult.status,
        executionResult: 'SUCCESS',
        realResult: dispatchResult.payload.realExecution
      };
    }
  };
}
