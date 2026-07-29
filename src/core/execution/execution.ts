import { CanonicalContextPackage } from '../../types/eom';
import { BellaKernel } from '../kernel/kernel';
import { SupabaseConnector } from '../../connectors/index';
import { GoalVerificationEngine, VerificationReport } from '../orchestration/orchestration';

// ─── Read API keys from localStorage (browser-side) ─────────────────────────
function getStoredKey(provider: string, key_name: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return JSON.parse(localStorage.getItem('bella_eos_integrations') || '{}')[`${provider}::${key_name}`] || '';
  } catch { return ''; }
}

function getClientKeys() {
  console.log('[getClientKeys] Reading from localStorage...');
  const rawStorage = typeof window !== 'undefined' ? localStorage.getItem('bella_eos_integrations') : null;
  console.log('[getClientKeys] Raw storage:', rawStorage?.substring(0, 100));
  
  const keys = {
    openai:              getStoredKey('openai',    'api_key')    || undefined,
    anthropic:           getStoredKey('anthropic', 'api_key')    || undefined,
    gemini:              getStoredKey('gemini',    'api_key')    || undefined,
    facebook_token:      getStoredKey('facebook',  'page_access_token') || undefined,
    facebook_page_id:    getStoredKey('facebook',  'page_id')   || undefined,
  };
  
  console.log('[getClientKeys] Parsed keys:');
  console.log('[getClientKeys]   - gemini:', keys.gemini ? `YES (${keys.gemini.substring(0, 20)}...)` : 'NO');
  
  return keys;
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
async function callAgentRunner(tasks: any[], contextPackage: CanonicalContextPackage, approvedTasks?: string[], clientKeys?: any): Promise<{
  overall_status: string;
  total_tasks: number;
  completed: number;
  results: any[];
  awaitingApprovalTaskId?: string;
}> {
  console.log('[AgentRunner] ==================== ENTERING callAgentRunner ====================');
  console.log('[AgentRunner] Received tasks:', tasks?.length || 0);
  
  // Use passed clientKeys instead of localStorage
  const keys = clientKeys || getClientKeys();
  
  // DEBUG: Log keys
  console.log('[AgentRunner] 🔑 Client Keys Check:');
  console.log('[AgentRunner]   - OpenAI:', keys.openai ? `YES (${keys.openai.substring(0, 15)}...)` : 'NO ❌');
  console.log('[AgentRunner]   - Gemini:', keys.gemini ? `YES (${keys.gemini.substring(0, 15)}...)` : 'NO ❌');
  console.log('[AgentRunner]   - Anthropic:', keys.anthropic ? `YES (${keys.anthropic.substring(0, 15)}...)` : 'NO ❌');
  
  let agentConfigs = {};
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('bella_eos_agent_configs');
      if (saved) agentConfigs = JSON.parse(saved);
    } catch {}
  }

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
      agent_configs:         agentConfigs,
      approved_tasks:        approvedTasks
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Agent runner failed');
  return data;
}

// ─── Internal API Gateway ─────────────────────────────────────────────────────
export class InternalApiGateway {
  /**
   * Dynamic dispatch with Goal Verification Audit & Connection Tracking.
   */
    static async dispatchCall(
    executor: any,
    step: any,
    contextPackage: CanonicalContextPackage,
    onProgress?: (event: OrchestratorEvent) => void,
    approvedTasks?: string[],
    existingTasks?: any[]
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

    let planTasks = existingTasks;
    let planTitle = 'Kế hoạch đã phân bổ';
    let planReasoning = 'Thực thi lại các tác vụ sau khi CEO phê duyệt';
    let planProvider = 'bella-eos-kernel';
    let planModel = 'orchestrator-v1';
    let planWarning: string | undefined = undefined;

    if (!planTasks || planTasks.length === 0) {
      // ── PHASE 1: AI Orchestrator plans execution ──────────────────────────
      onProgress?.({ phase: 'PLANNING', message: '🧠 AI Orchestrator đang phân tích intent và lập kế hoạch...', tasks: [] });

      let orchestratorResult: Awaited<ReturnType<typeof callOrchestrator>>;
      try {
        orchestratorResult = await callOrchestrator(contextPackage);
      } catch (err: any) {
        console.warn('[InternalApiGateway] Orchestrator failed:', err.message);
        throw err;
      }

      const { plan, provider, model, warning } = orchestratorResult;
      planTasks = plan.tasks;
      planTitle = plan.plan_title;
      planReasoning = plan.reasoning;
      planProvider = provider;
      planModel = model;
      planWarning = warning;

      console.log(`[InternalApiGateway] Plan generated (${planProvider}/${planModel}): ${planTasks.length} tasks`);

      onProgress?.({
        phase: 'PLAN_READY',
        message: `📋 Kế hoạch: "${planTitle}" — ${planTasks.length} tasks`,
        planTitle,
        planReasoning,
        tasks: planTasks.map(t => ({ ...t, status: t.status || 'PENDING' })),
        aiProvider: planProvider,
        aiModel: planModel,
        warning: planWarning
      });
    }

    // ── PHASE 2: Agent Runner executes each task ──────────────────────────
    console.log('[InternalApiGateway] 🚀 About to call Agent Runner with', planTasks.length, 'tasks');
    onProgress?.({ phase: 'EXECUTING', message: '⚡ Các AI Agent đang thực thi nhiệm vụ...', tasks: planTasks });

    // Get client keys from localStorage (browser-side)
    const clientKeys = getClientKeys();
    
    console.log('[InternalApiGateway] 🔑 Passing keys to Agent Runner:');
    console.log('[InternalApiGateway]   - OpenAI:', clientKeys.openai ? 'YES ✅' : 'NO ❌');
    console.log('[InternalApiGateway]   - Gemini:', clientKeys.gemini ? 'YES ✅' : 'NO ❌');
    console.log('[InternalApiGateway]   - Anthropic:', clientKeys.anthropic ? 'YES ✅' : 'NO ❌');

    let runnerResult: Awaited<ReturnType<typeof callAgentRunner>>;
    try {
      console.log('[InternalApiGateway] 🔄 Calling callAgentRunner...');
      runnerResult = await callAgentRunner(planTasks, contextPackage, approvedTasks, clientKeys);
      console.log('[InternalApiGateway] ✅ Agent Runner completed:', runnerResult.overall_status);
    } catch (err: any) {
      console.error('[InternalApiGateway] ❌ Agent runner failed:', err);
      console.error('[InternalApiGateway] Stack:', err.stack);
      throw err;
    }

    // ── PHASE 3: Goal Verification & Connection Audit ──────────────────────
    const verificationReport = GoalVerificationEngine.auditExecutionResults(
      contextPackage.objective,
      runnerResult.results
    );

    BellaKernel.emitKernelEvent('TaskCompleted', {
      taskId: step.id,
      status: runnerResult.overall_status,
      verification: verificationReport.status
    });

    onProgress?.({
      phase: 'COMPLETED',
      message: `✅ Thực thi xong: ${runnerResult.completed}/${runnerResult.total_tasks} tasks hoàn thành.`,
      tasks: runnerResult.results,
      summary: runnerResult,
      verificationReport
    });

    onProgress?.({
      phase: 'VERIFIED',
      message: verificationReport.verificationSummary,
      tasks: runnerResult.results,
      summary: runnerResult,
      verificationReport
    });

    return {
      status: 'DISPATCHED',
      payload: {
        workerId,
        canonicalContext: contextPackage,
        plan: {
          title: planTitle,
          reasoning: planReasoning,
          provider: planProvider,
          model: planModel
        },
        execution: runnerResult,
        verificationReport
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
        tasks: result.payload.execution.results,
        verificationReport: result.payload.verificationReport
      };
    }
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrchestratorEvent = {
  phase: 'PLANNING' | 'PLAN_READY' | 'EXECUTING' | 'COMPLETED' | 'VERIFIED' | 'ERROR';
  message: string;
  planTitle?: string;
  planReasoning?: string;
  tasks?: any[];
  summary?: any;
  aiProvider?: string;
  aiModel?: string;
  warning?: string;
  verificationReport?: VerificationReport;
};

type DispatchResult = {
  status: string;
  payload: {
    workerId: string;
    canonicalContext: CanonicalContextPackage;
    plan: { title: string; reasoning: string; provider: string; model: string };
    execution: { overall_status: string; total_tasks: number; completed: number; results: any[] };
    verificationReport: VerificationReport;
  };
};
