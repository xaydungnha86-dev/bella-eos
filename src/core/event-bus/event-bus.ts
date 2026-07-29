import { RuntimeEvent } from '@/types/runtime-contract';

export type EventCallback = (event: RuntimeEvent) => void | Promise<void>;

export class EnterpriseEventBus {
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribes to events matching a naming pattern.
   * Wildcards like "*" (match anything within one segment) or "**" (recursive)
   * can be approximated by standard pattern mappings. We support basic wildcard matching:
   * e.g., "marketing.*" matches "marketing.campaign.finished"
   */
  subscribe(pattern: string, callback: EventCallback): void {
    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Set());
    }
    this.subscribers.get(pattern)!.add(callback);
    console.log(`[Event Bus] Subscribed callback to pattern: "${pattern}"`);
  }

  /**
   * Unsubscribes a callback from a pattern.
   */
  unsubscribe(pattern: string, callback: EventCallback): void {
    if (this.subscribers.has(pattern)) {
      this.subscribers.get(pattern)!.delete(callback);
    }
  }

  /**
   * Publishes an event to all subscribers matching the event name.
   */
  async publish(event: RuntimeEvent): Promise<void> {
    console.log(`[Event Bus] Publishing event: "${event.name}" (ID: ${event.eventId})`);
    
    const matchedCallbacks: Set<EventCallback> = new Set();

    for (const [pattern, callbacks] of this.subscribers.entries()) {
      if (this.matchPattern(event.name, pattern)) {
        for (const cb of callbacks) {
          matchedCallbacks.add(cb);
        }
      }
    }

    const promises = Array.from(matchedCallbacks).map(async (cb) => {
      try {
        await cb(event);
      } catch (err) {
        console.error(`[Event Bus] Subscriber callback threw error for event "${event.name}":`, err);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Helper pattern matching.
   * e.g., "marketing.*" matches "marketing.campaign" or "marketing.campaign.run"
   * "goal.created" matches "goal.*"
   */
  private matchPattern(eventName: string, pattern: string): boolean {
    if (pattern === '*') return true;
    
    // Replace dots with escaped dots and asterisk with wildcard regex matcher
    const regexPattern = '^' + pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*') + '$';
      
    const regex = new RegExp(regexPattern);
    return regex.test(eventName);
  }
}
