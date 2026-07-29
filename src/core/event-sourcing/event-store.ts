import { supabase } from '@/lib/supabase';

export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: 'CustomerCreated' | 'BookingCreated' | 'InvoicePaid' | 'CampaignLaunched' | 'DecisionGenerated' | string;
  payload: Record<string, any>;
  timestamp: string;
  version: number;
  traceId?: string;
  idempotencyKey?: string;
}

const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && !url.includes('placeholder-url') && !key.includes('placeholder-anon-key');
};

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

  /** @internal — for testing only */
  public static resetInstance(): void {
    (EventStore as any).instance = undefined;
  }

  public async saveEvents(aggregateId: string, newEvents: DomainEvent[], expectedVersion: number): Promise<void> {
    // Idempotency check: Filter out duplicate events that have already been saved
    const uniqueEvents = newEvents.filter(evt => {
      const isDuplicate = this.events.some(
        e => e.eventId === evt.eventId || 
        (evt.idempotencyKey && e.idempotencyKey === evt.idempotencyKey)
      );
      return !isDuplicate;
    });

    if (uniqueEvents.length === 0) {
      return; // All events were duplicates, skipped idempotently
    }

    // Sync to memory fallback
    uniqueEvents.forEach(evt => {
      this.events.push(evt);
      this.applyProjection(evt);
    });

    if (isSupabaseConfigured()) {
      try {
        const dbRecords = uniqueEvents.map(evt => ({
          event_id: evt.eventId,
          aggregate_id: evt.aggregateId,
          aggregate_type: evt.aggregateType,
          event_type: evt.eventType,
          payload: evt.payload,
          timestamp: evt.timestamp,
          version: evt.version,
          trace_id: evt.traceId || null,
          idempotency_key: evt.idempotencyKey || null
        }));
        
        const { error } = await supabase.from('domain_events').insert(dbRecords);
        if (error) {
          if (error.code === '23505') {
            console.warn(`[EventStore] saveEvents: Duplicates ignored via PostgreSQL unique constraint.`);
          } else {
            console.warn(`[EventStore] saveEvents failed: ${error.message}`);
          }
        }
      } catch (err: any) {
        console.warn(`[EventStore] saveEvents exception: ${err.message || err}`);
      }
    }
  }

  public async getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('domain_events')
          .select('*')
          .eq('aggregate_id', aggregateId)
          .order('version', { ascending: true });
        
        if (!error && data) {
          return data.map(item => ({
            eventId: item.event_id,
            aggregateId: item.aggregate_id,
            aggregateType: item.aggregate_type,
            eventType: item.event_type,
            payload: typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload,
            timestamp: item.timestamp,
            version: item.version,
            traceId: item.trace_id || undefined,
            idempotencyKey: item.idempotency_key || undefined
          }));
        }
      } catch (err: any) {
        console.warn(`[EventStore] getEventsForAggregate exception: ${err.message || err}`);
      }
    }
    return this.events.filter(e => e.aggregateId === aggregateId);
  }

  public async replayEvents(timestampLimit?: string): Promise<void> {
    this.projections.clear();
    const limit = timestampLimit ? new Date(timestampLimit).getTime() : Infinity;
    
    const eventsToReplay = await this.getAllEvents();
    eventsToReplay
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

  public async getAllEvents(): Promise<DomainEvent[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('domain_events')
          .select('*')
          .order('timestamp', { ascending: true });
        
        if (!error && data) {
          return data.map(item => ({
            eventId: item.event_id,
            aggregateId: item.aggregate_id,
            aggregateType: item.aggregate_type,
            eventType: item.event_type,
            payload: typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload,
            timestamp: item.timestamp,
            version: item.version,
            traceId: item.trace_id || undefined,
            idempotencyKey: item.idempotency_key || undefined
          }));
        }
      } catch (err: any) {
        console.warn(`[EventStore] getAllEvents exception: ${err.message || err}`);
      }
    }
    return [...this.events];
  }
}
