/**
 * BELLA EOS PLATFORM CONTRACT: Tool Execution Protocol
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Enforces standardized outputs for Tool executions, preventing hanging runs and unexpected format drift.
 */

export type ToolExecutionStatus = 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'INTERRUPTED' | 'CANCELLED';

export interface ToolExecutionResult {
  toolName: string;
  status: ToolExecutionStatus;
  output: any;
  error?: string;
  executionMs: number;
  timestamp: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute(args: Record<string, any>): Promise<any>;
}
