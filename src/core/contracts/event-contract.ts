/**
 * Event Contract (v1) - Immutable Event Stream Specification
 */

export interface EventContractV1<T = Record<string, any>> {
  readonly version: 'v1';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly payload: T;
  readonly timestamp: string;
  readonly traceId?: string;
}
