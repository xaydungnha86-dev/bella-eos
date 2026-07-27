export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: 'CustomerCreated' | 'BookingCreated' | 'InvoicePaid' | 'CampaignLaunched' | 'DecisionGenerated' | string;
  payload: Record<string, any>;
  timestamp: string;
  version: number;
}

export class EventStore {
  private static instance: EventStore;
  private events: DomainEvent[] = [];
  private projections: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): EventStore {
    if (!EventStore.instance) {
      EventStore.instance = new EventStore();
    }
    return EventStore.instance;
  }

  public saveEvents(aggregateId: string, newEvents: DomainEvent[], expectedVersion: number): void {
    newEvents.forEach(evt => {
      this.events.push(evt);
      // Automatically apply projection
      this.applyProjection(evt);
    });
  }

  public getEventsForAggregate(aggregateId: string): DomainEvent[] {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  public replayEvents(timestampLimit?: string): void {
    this.projections.clear();
    const limit = timestampLimit ? new Date(timestampLimit).getTime() : Infinity;
    this.events
      .filter(e => new Date(e.timestamp).getTime() <= limit)
      .forEach(e => this.applyProjection(e));
  }

  public getProjection(key: string): any {
    return this.projections.get(key);
  }

  private applyProjection(evt: DomainEvent): void {
    if (evt.eventType === 'BookingCreated') {
      const count = this.projections.get('bookings_count') || 0;
      this.projections.set('bookings_count', count + 1);
    }
    if (evt.eventType === 'InvoicePaid') {
      const revenue = this.projections.get('total_revenue') || 0;
      this.projections.set('total_revenue', revenue + (evt.payload.amountVnd || 0));
    }
  }

  public getAllEvents(): DomainEvent[] {
    return [...this.events];
  }
}
