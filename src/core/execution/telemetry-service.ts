/**
 * BELLA EOS PLATFORM CORE: Telemetry Service & Whitelist Filter Adapter
 * Part of Task Governance Bounded Context v5.4
 */

import { EventBus } from './event-bus';
import { DomainEvent } from './domain-events';
import { PersistenceAdapter } from './persistence-adapter';

export interface TelemetryLogEntry {
  logId: string;
  eventType: string;
  aggregateId: string;
  tenantId: string;
  actor: string;
  timestamp: string;
  payloadSummary: string;
}

export const TelemetryPolicy = {
  allowedEventTypes: new Set([
    'AssignmentCreated',
    'AssignmentReported',
    'AssignmentVerified',
    'AssignmentFailed',
    'WorkflowCompleted',
    'WorkflowFailed',
    'ApprovalRequested',
    'ApprovalCompleted',
    'OutcomeCalculated',
    'LedgerRecorded'
  ])
};

export class TelemetryService {
  private logKey = 'bella_eos_telemetry_logs';

  constructor(private adapter: PersistenceAdapter) {}

  public logEvent(event: DomainEvent): void {
    const payloadStr = JSON.stringify(event.payload || {});
    const summary = payloadStr.length > 100 ? `${payloadStr.substring(0, 100)}...` : payloadStr;

    const logEntry: TelemetryLogEntry = {
      logId: `log-${Math.random().toString(36).substring(2, 9)}`,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      tenantId: event.metadata.tenantId,
      actor: event.metadata.actor,
      timestamp: event.metadata.occurredAt,
      payloadSummary: summary
    };

    console.log(`[TelemetryService] [${event.metadata.occurredAt}] [${event.eventType}] tenant: ${event.metadata.tenantId}, actor: ${event.metadata.actor}`);

    const logs: TelemetryLogEntry[] = this.adapter.load(this.logKey) || [];
    logs.push(logEntry);
    
    // Maintain maximum log buffer size of 500 lines to prevent memory bloat
    if (logs.length > 500) {
      logs.shift();
    }
    
    this.adapter.save(this.logKey, logs);
  }

  public getLogs(): TelemetryLogEntry[] {
    return this.adapter.load(this.logKey) || [];
  }

  public clearLogs(): void {
    this.adapter.save(this.logKey, []);
  }
}

export class TelemetryAdapter {
  constructor(
    private eventBus: EventBus,
    private telemetryService: TelemetryService
  ) {}

  public initialize(): void {
    this.eventBus.subscribeToAll((event: DomainEvent) => {
      // Whitelist evaluation
      if (TelemetryPolicy.allowedEventTypes.has(event.eventType)) {
        this.telemetryService.logEvent(event);
      }
    });
  }
}
