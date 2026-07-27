/**
 * BELLA ECOS — Shared Runtime Metrics Contract (v2.0)
 * Sprint 28 — Architecture Freeze Maturity Series
 *
 * Chuẩn hóa dùng chung cho toàn bộ 15 Kernel Primitives:
 *   Knowledge, Memory, Planning, Scheduler, Workflow,
 *   Decision, Security, Economics, Evolution, ...
 */

export interface RuntimeMetrics {
  runtime: string;       // Tên primitive (e.g. 'PlanningEngine', 'SchedulerRuntime')
  operation: string;     // Tên hàm (e.g. 'plan', 'validate', 'scheduleTask')
  startedAt: number;     // Unix timestamp ms
  endedAt: number;       // Unix timestamp ms
  latencyMs: number;     // endedAt - startedAt
  success: boolean;
  errorCode?: string;    // Optional: mã lỗi khi success = false
}

export function createMetric(
  runtime: string,
  operation: string,
  startedAt: number,
  success: boolean,
  errorCode?: string
): RuntimeMetrics {
  const endedAt = Date.now();
  return {
    runtime,
    operation,
    startedAt,
    endedAt,
    latencyMs: endedAt - startedAt,
    success,
    errorCode,
  };
}
