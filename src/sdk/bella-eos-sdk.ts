/**
 * Bella EOS TypeScript SDK (v1)
 * API-First SDK for external consumers (React UI, Bella EIP, Mobile, CLI).
 */

import { CanonicalContextPackageV1 } from '../core/contracts/context-contract';
import { ExplainableDecisionContractV1 } from '../core/contracts/decision-contract';
import { ToolExecutionContractV1 } from '../core/contracts/tool-contract';

export interface ExecuteGoalOptions {
  objective: string;
  brandDna?: Record<string, any>;
  approvedBudgetVnd?: number;
  apiKeys?: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
  };
}

export interface ExecuteGoalResult {
  contextPackage: CanonicalContextPackageV1;
  decision: ExplainableDecisionContractV1;
  executiveSummary: string;
  tasksCount: number;
}

export class BellaEosSDK {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  public async executeCouncilMeeting(options: ExecuteGoalOptions): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/orchestrator/council`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objective: options.objective,
        context: {
          brandDna: options.brandDna,
          approvedBudgetLimitVnd: options.approvedBudgetVnd
        },
        client_gemini_key: options.apiKeys?.gemini,
        client_openai_key: options.apiKeys?.openai
      })
    });

    if (!res.ok) {
      throw new Error(`[BellaEosSDK] Council API HTTP Error: ${res.status}`);
    }

    return await res.json();
  }

  public async planGoal(options: ExecuteGoalOptions): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/orchestrator/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: options.objective,
        budgetVnd: options.approvedBudgetVnd,
        client_gemini_key: options.apiKeys?.gemini,
        client_openai_key: options.apiKeys?.openai
      })
    });

    if (!res.ok) {
      throw new Error(`[BellaEosSDK] Plan API HTTP Error: ${res.status}`);
    }

    return await res.json();
  }
}
