/**
 * BELLA EOS PLATFORM CORE: Event Bus Singleton for Bounded Context
 * Part of Task Governance Bounded Context v5.4
 */

import { DomainEvent } from './domain-events';

export type EventListener<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventListener[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => {
      const list = this.listeners.get(eventType) || [];
      this.listeners.set(eventType, list.filter(l => l !== listener));
    };
  }

  public subscribeToAll(listener: EventListener): () => void {
    return this.subscribe('*', listener);
  }

  public publish(event: DomainEvent): void {
    // 1. Dispatch to exact match listeners
    const exactListeners = this.listeners.get(event.eventType) || [];
    exactListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error(`[EventBus] Error in listener for event ${event.eventType}:`, err);
      }
    });

    // 2. Dispatch to wildcard/catch-all listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error(`[EventBus] Error in wildcard listener for event ${event.eventType}:`, err);
      }
    });
  }
}
