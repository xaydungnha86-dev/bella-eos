/**
 * BELLA EOS INFRASTRUCTURE: Partitioned Enterprise Event Bus
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Implements IEventBus for Domain, Application, and Integration Events.
 */

import { EnterpriseEvent, EventCategory, EventHandler, IEventBus } from '@/types/events';

export class EnterpriseEventBus implements IEventBus {
  private static instance: EnterpriseEventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private categoryHandlers: Map<EventCategory, Set<EventHandler>> = new Map();
  private eventHistory: EnterpriseEvent[] = [];

  private constructor() {}

  public static getInstance(): EnterpriseEventBus {
    if (!EnterpriseEventBus.instance) {
      EnterpriseEventBus.instance = new EnterpriseEventBus();
    }
    return EnterpriseEventBus.instance;
  }

  public async publish<T>(event: EnterpriseEvent<T>): Promise<void> {
    this.eventHistory.push(event);

    // Dispatch to specific eventType handlers
    const typeSet = this.handlers.get(event.type);
    if (typeSet) {
      for (const handler of typeSet) {
        await handler(event);
      }
    }

    // Dispatch to Category handlers
    const catSet = this.categoryHandlers.get(event.category);
    if (catSet) {
      for (const handler of catSet) {
        await handler(event);
      }
    }
  }

  public subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  public subscribeCategory<T>(category: EventCategory, handler: EventHandler<T>): () => void {
    if (!this.categoryHandlers.has(category)) {
      this.categoryHandlers.set(category, new Set());
    }
    this.categoryHandlers.get(category)!.add(handler as EventHandler);

    return () => {
      this.categoryHandlers.get(category)?.delete(handler as EventHandler);
    };
  }

  public getHistory(filter?: { type?: string; category?: EventCategory }): EnterpriseEvent[] {
    return this.eventHistory.filter(e => {
      if (filter?.type && e.type !== filter.type) return false;
      if (filter?.category && e.category !== filter.category) return false;
      return true;
    });
  }
}
