/**
 * BELLA EOS PLATFORM CONTRACT: Enterprise Message Contract (EnterpriseEvent<T> v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Partitioned Event Contract for Domain, Application, and Integration Events.
 */

export type EventCategory = 'DOMAIN' | 'APPLICATION' | 'INTEGRATION';

export interface EnterpriseEvent<T = any> {
  id: string;
  type: string;
  category: EventCategory;
  source: string;
  tenantId: string;
  timestamp: string;
  correlationId: string;
  causationId?: string;
  payload: T;
  metadata: Record<string, any>;
}

export type EventHandler<T = any> = (event: EnterpriseEvent<T>) => Promise<void> | void;

export interface IEventBus {
  publish<T>(event: EnterpriseEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void;
  subscribeCategory<T>(category: EventCategory, handler: EventHandler<T>): () => void;
}
