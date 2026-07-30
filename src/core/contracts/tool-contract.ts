/**
 * Tool Execution Contract (v1) - Immutable Specification
 * Structured telemetry and payload schema for all tool execution outputs.
 */

export interface ToolTelemetryV1 {
  readonly latencyMs: number;
  readonly tokenCount?: number;
  readonly estimatedCostVnd?: number;
  readonly traceId: string;
  readonly auditId: string;
  readonly executedAt: string;
}

export interface ToolExecutionContractV1 {
  readonly version: 'v1';
  readonly toolId: string;
  readonly taskId: string;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'CONFIG_REQUIRED';
  readonly score: number;              // 0 - 100
  readonly confidence: number;         // 0 - 1
  readonly summary: string;
  readonly metrics: Record<string, any>;
  readonly findings: string[];
  readonly recommendations: string[];
  readonly citations: string[];
  readonly artifactUrls?: string[];
  readonly rawOutput: string;
  readonly telemetry: ToolTelemetryV1;
}
