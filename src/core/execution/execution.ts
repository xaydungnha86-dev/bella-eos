import { CanonicalContextPackage } from '../../types/eom';
import { BellaKernel } from '../kernel/kernel';
import { SupabaseConnector } from '../../connectors/index';

// ─── Read API keys from localStorage (browser-side) ─────────────────────────
function getStoredKey(provider: string, key_name: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return JSON.parse(localStorage.getItem('bella_eos_integrations') || '{}')[`${provider}::${key_name}`] || '';
  } catch { return ''; }
}

function getClientKeys() {
  return {
    openai:              getStoredKey('openai',    'api_key')    || undefined,
    anthropic:           getStoredKey('anthropic', 'api_key')    || undefined,
    gemini:              getStoredKey('gemini',    'api_key')    || undefined,
    facebook_token:      getStoredKey('facebook',  'page_access_token') || undefined,
    facebook_page_id:    getStoredKey('facebook',  'page_id')   || undefined,
  };
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// ─── Step 1: Orchestrator Planning ───────────────────────────────────────────
async function callOrchestrator(contextPackage: CanonicalContextPackage): Promise<{
  plan: { plan_title: string; reasoning: string; tasks: any[] };
  provider: string;
  model: string;
  warning?: string;
}> {
  const keys = getClientKeys();
  const res = await fetch(`${getBaseUrl()}/api/orchestrator/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective: contextPackage.objective,
      context:   contextPackage,
      client_openai_key:    keys.openai,
      client_anthropic_key: keys.anthropic,
      client_gemini_key:    keys.gemini,
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Orchestrator planning failed');
  return data;
}

// ─── Step 2: Agent Runner Execution ──────────────────────────────────────────
async function callAgentRunner(tasks: any[], contextPackage: CanonicalContextPackage): Promise<{
  overall_status: string;
  total_tasks: number;
  completed: number;
  results: any[];
}> {
  const keys = getClientKeys();
  const res = await fetch(`${getBaseUrl()}/api/orchestrator/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tasks,
      context:               contextPackage,
      client_openai_key:     keys.openai,
      client_anthropic_key:  keys.anthropic,
      client_gemini_key:     keys.gemini,
      client_facebook_token: keys.facebook_token,
      client_facebook_page_id: keys.facebook_page_id,
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Agent runner failed');
  return data;
}

// ─── Internal API Gateway ─────────────────────────────────────────────────────
export class InternalApiGateway {
  /**
   * Dynamic dispatch — NO hardcoded agent/tool logic.
   *
   * Flow:
   *   1. AI Orchestrator analyzes CEO intent → generates task plan
   *   2. Agent Runner executes each task in order
   *   3. Results returned to dashboard
   */
  static async dispatchCall(
    executor: any,
    step: any,
    contextPackage: CanonicalContextPackage,
    onProgress?: (event: OrchestratorEvent) => void
  ): Promise<DispatchResult> {
    const workerId = executor.assignedWorker || executor.workerId || 'orchestrator';
    console.log(`[InternalApiGateway] Dispatch → [${step.name}] • Worker: ${workerId}`);

    if (!contextPackage?.objective) {
      throw new Error('[Security] Missing Canonical Context Package.');
    }

    BellaKernel.emitKernelEvent('TaskCreated', {
      taskId: step.id,
      workerId,
      contextTimestamp: contextPackage.timestamp
    });

    // Persist context asynchronously
    SupabaseConnector.saveCanonicalContext(contextPackage);

    // ── PHASE 1: AI Orchestrator plans execution ──────────────────────────
    onProgress?.({ phase: 'PLANNING', message: '🧠 AI Orchestrator đang phân tích intent và lập kế hoạch...', tasks: [] });

    let orchestratorResult: Awaited<ReturnType<typeof callOrchestrator>>;
    try {
      orchestratorResult = await callOrchestrator(contextPackage);
    } catch (err: any) {
      console.error('[InternalApiGateway] Orchestrator failed:', err.message);
      throw err;
    }

    const { plan, provider: planProvider, model: planModel, warning: planWarning } = orchestratorResult;
    console.log(`[InternalApiGateway] Plan generated (${planProvider}/${planModel}): ${plan.tasks.length} tasks`);
    console.log(`[InternalApiGateway] Reasoning: ${plan.reasoning}`);

    onProgress?.({
      phase: 'PLAN_READY',
      message: `📋 Kế hoạch: "${plan.plan_title}" — ${plan.tasks.length} tasks`,
      planTitle: plan.plan_title,
      planReasoning: plan.reasoning,
      tasks: plan.tasks.map(t => ({ ...t, status: 'PENDING' })),
      aiProvider: planProvider,
      aiModel: planModel,
      warning: planWarning
    });

    // ── PHASE 2: Agent Runner executes each task ──────────────────────────
    onProgress?.({ phase: 'EXECUTING', message: '⚡ Các AI Agent đang thực thi nhiệm vụ...', tasks: plan.tasks });

    let runnerResult: Awaited<ReturnType<typeof callAgentRunner>>;
    try {
      runnerResult = await callAgentRunner(plan.tasks, contextPackage);
    } catch (err: any) {
      console.error('[InternalApiGateway] Agent runner failed:', err.message);
      throw err;
    }

    BellaKernel.emitKernelEvent('TaskCompleted', {
      taskId: step.id,
      status: runnerResult.overall_status
    });

    onProgress?.({
      phase: 'COMPLETED',
      message: `✅ Hoàn tất: ${runnerResult.completed}/${runnerResult.total_tasks} tasks thành công`,
      tasks: runnerResult.results,
      summary: runnerResult
    });

    return {
      status: 'DISPATCHED',
      payload: {
        workerId,
        canonicalContext: contextPackage,
        plan: {
          title: plan.plan_title,
          reasoning: plan.reasoning,
          provider: planProvider,
          model: planModel
        },
        execution: runnerResult
      }
    };
  }
}

// ─── Execution Engine ─────────────────────────────────────────────────────────
export class ExecutionEngine {
  static ExecutionCoordinator = {
    async execute(
      executor: any,
      step: any,
      contextPackage: CanonicalContextPackage,
      onProgress?: (event: OrchestratorEvent) => void
    ) {
      console.log(`[ExecutionCoordinator] Starting task: ${step.name}`);
      const result = await InternalApiGateway.dispatchCall(executor, step, contextPackage, onProgress);

      return {
        dispatchStatus: result.status,
        executionResult: result.payload.execution.overall_status,
        plan: result.payload.plan,
        tasks: result.payload.execution.results
      };
    }
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrchestratorEvent = {
  phase: 'PLANNING' | 'PLAN_READY' | 'EXECUTING' | 'COMPLETED' | 'ERROR';
  message: string;
  planTitle?: string;
  planReasoning?: string;
  tasks?: any[];
  summary?: any;
  aiProvider?: string;
  aiModel?: string;
  warning?: string;
};

type DispatchResult = {
  status: string;
  payload: {
    workerId: string;
    canonicalContext: CanonicalContextPackage;
    plan: { title: string; reasoning: string; provider: string; model: string };
    execution: { overall_status: string; total_tasks: number; completed: number; results: any[] };
  };
};
