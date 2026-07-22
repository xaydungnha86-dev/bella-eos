export interface KernelEvent {
  id: string;
  eventType: 'IntentCreated' | 'GoalGenerated' | 'PlanGenerated' | 'TaskCreated' | 'TaskCompleted' | 'EvidenceVerified' | 'LearningUpdated' | string;
  payload: any;
  timestamp: string;
}

export class BellaKernel {
  private static eventsLog: KernelEvent[] = [];
  private static listeners: { [key: string]: Array<(payload: any) => void> } = {};

  static emitKernelEvent(eventType: string, payload: any): KernelEvent {
    const event: KernelEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventType,
      payload,
      timestamp: new Date().toISOString()
    };
    this.eventsLog.push(event);
    console.log(`[Bella Kernel Event Logged] Type: ${eventType}`, payload);

    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in listener for ${eventType}:`, err);
        }
      });
    }

    return event;
  }

  static on(eventType: string, cb: (payload: any) => void) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(cb);
  }

  static getLedger(): KernelEvent[] {
    return [...this.eventsLog];
  }

  static clearLedger() {
    this.eventsLog = [];
  }
}
