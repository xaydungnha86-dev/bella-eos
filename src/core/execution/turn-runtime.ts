/**
 * BELLA EOS PLATFORM CONTRACT: Turn Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages the state, tokens, latency, tool execution, and telemetry of a single execution turn.
 */

import { ToolExecutionResult } from './tool-protocol';

export interface TurnTelemetry {
  turnId: string;
  tenantId: string;
  userId: string;
  workflowId?: string;
  taskId?: string;
  traceId?: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  apiCallsCount: number;
  toolCalls: ToolExecutionResult[];
  retryCount: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  provider: string;
  model: string;
  exitReason: 'COMPLETED' | 'FAILED' | 'INTERRUPTED' | 'TIMEOUT';
  error?: string;
}

export class TurnRuntime {
  private telemetry: TurnTelemetry;

  constructor(params: {
    tenantId: string;
    userId: string;
    workflowId?: string;
    taskId?: string;
    traceId?: string;
    provider: string;
    model: string;
  }) {
    this.telemetry = {
      turnId: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: params.tenantId,
      userId: params.userId,
      workflowId: params.workflowId,
      taskId: params.taskId,
      traceId: params.traceId,
      startTime: Date.now(),
      apiCallsCount: 0,
      toolCalls: [],
      retryCount: 0,
      tokensUsed: { prompt: 0, completion: 0, total: 0 },
      provider: params.provider,
      model: params.model,
      exitReason: 'COMPLETED',
    };
  }

  public getTurnId(): string {
    return this.telemetry.turnId;
  }

  public recordApiCall(promptTokens: number, completionTokens: number): void {
    this.telemetry.apiCallsCount++;
    this.telemetry.tokensUsed.prompt += promptTokens;
    this.telemetry.tokensUsed.completion += completionTokens;
    this.telemetry.tokensUsed.total += (promptTokens + completionTokens);
  }

  public recordToolCall(toolResult: ToolExecutionResult): void {
    this.telemetry.toolCalls.push(toolResult);
  }

  public recordRetry(): void {
    this.telemetry.retryCount++;
  }

  public endTurn(exitReason: TurnTelemetry['exitReason'], error?: string): TurnTelemetry {
    this.telemetry.endTime = Date.now();
    this.telemetry.latencyMs = this.telemetry.endTime - this.telemetry.startTime;
    this.telemetry.exitReason = exitReason;
    this.telemetry.error = error;
    
    console.log(`[TurnTelemetry] Turn ${this.telemetry.turnId} completed in ${this.telemetry.latencyMs}ms. Exit reason: ${exitReason}. Total tokens: ${this.telemetry.tokensUsed.total}`);
    
    return this.telemetry;
  }

  public getTelemetry(): TurnTelemetry {
    return { ...this.telemetry };
  }
}
