/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Event Bus
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS Decoupled)
 *
 * Mission: Enterprise Event Bus. Decouples domain communications across ECOS.
 * Allows services to publish and subscribe to execution events (e.g. TaskFailed, TaskCompleted).
 */

export type EventCallback = (payload: any) => void;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(event: string, callback: EventCallback): void {
    const list = this.listeners.get(event) || [];
    list.push(callback);
    this.listeners.set(event, list);
  }

  public publish(event: string, payload: any): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[EventBus] Error dispatching callback for event "${event}":`, err);
        }
      });
    }
  }

  public clearListeners(): void {
    this.listeners.clear();
  }
}
