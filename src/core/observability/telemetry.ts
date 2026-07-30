/**
 * Enterprise Telemetry & Observability Engine
 * Tracks Trace IDs, P95 Latencies, LLM Costs, and Execution Replays.
 */

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  operationName: string;
  startTimeMs: number;
  endTimeMs?: number;
  durationMs?: number;
  status: 'OK' | 'ERROR';
  metadata: Record<string, any>;
}

export class TelemetryEngine {
  private static instance: TelemetryEngine;
  private spans: TelemetrySpan[] = [];

  private constructor() {}

  public static getInstance(): TelemetryEngine {
    if (!TelemetryEngine.instance) {
      TelemetryEngine.instance = new TelemetryEngine();
    }
    return TelemetryEngine.instance;
  }

  public startSpan(operationName: string, traceId?: string, metadata: Record<string, any> = {}): { spanId: string; end: (status?: 'OK' | 'ERROR') => void } {
    const activeTraceId = traceId || `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const spanId = `sp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const startTimeMs = Date.now();

    const span: TelemetrySpan = {
      traceId: activeTraceId,
      spanId,
      operationName,
      startTimeMs,
      status: 'OK',
      metadata
    };

    this.spans.push(span);

    return {
      spanId,
      end: (status: 'OK' | 'ERROR' = 'OK') => {
        span.endTimeMs = Date.now();
        span.durationMs = span.endTimeMs - startTimeMs;
        span.status = status;
      }
    };
  }

  public getTraceSpans(traceId: string): TelemetrySpan[] {
    return this.spans.filter(s => s.traceId === traceId);
  }

  public getP95LatencyMs(operationName?: string): number {
    const filtered = operationName ? this.spans.filter(s => s.operationName === operationName && s.durationMs !== undefined) : this.spans.filter(s => s.durationMs !== undefined);
    if (filtered.length === 0) return 0;

    const durations = filtered.map(s => s.durationMs!).sort((a, b) => a - b);
    const idx = Math.floor(durations.length * 0.95);
    return durations[idx];
  }
}
