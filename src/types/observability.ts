/**
 * BELLA EOS OBSERVABILITY: Observability Contracts Specification
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Defines ITrace, IMetric, IAudit, IHealth, CorrelationId, and Span interfaces.
 */

export interface Span {
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  attributes: Record<string, any>;
}

export interface ITrace {
  correlationId: string;
  spans: Span[];
}

export interface IMetric {
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: string;
}

export interface IAuditLog {
  auditId: string;
  tenantId: string;
  actorId: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  timestamp: string;
}

export interface IHealthStatus {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptimeSeconds: number;
  version: string;
}
