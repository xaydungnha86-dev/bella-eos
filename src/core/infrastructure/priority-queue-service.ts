/**
 * BELLA EOS CORE: Priority Queue Service
 * Specification: v21.0 - Resource Scheduling
 * 
 * Implements a prioritized task queue with concurrency limits (MAX_CONCURRENCY)
 * and priority weighting (CRITICAL > HIGH > MEDIUM > LOW).
 */

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface QueueItem<T = any> {
  id: string;
  priority: Priority;
  createdAt: number;
  payload: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export class PriorityQueueService {
  private static instance: PriorityQueueService;
  private queue: QueueItem[] = [];
  private activeCount = 0;
  private maxConcurrency = 3; // Default concurrency limit
  private completedCount = 0;

  private constructor() {}

  public static getInstance(): PriorityQueueService {
    if (!PriorityQueueService.instance) {
      PriorityQueueService.instance = new PriorityQueueService();
    }
    return PriorityQueueService.instance;
  }

  public setMaxConcurrency(limit: number): void {
    this.maxConcurrency = limit;
    this.processQueue();
  }

  public getStats() {
    return {
      queueLength: this.queue.length,
      activeCount: this.activeCount,
      completedCount: this.completedCount,
      maxConcurrency: this.maxConcurrency
    };
  }

  public clear(): void {
    this.queue = [];
    this.activeCount = 0;
  }

  /**
   * Enqueues a payload task and returns a Promise that resolves when the task finishes.
   */
  public enqueue<T>(id: string, priority: Priority, payload: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem<T> = {
        id,
        priority,
        createdAt: Date.now(),
        payload,
        resolve,
        reject
      };

      this.queue.push(item);
      this.sortQueue();
      this.processQueue();
    });
  }

  private sortQueue(): void {
    const weights: Record<Priority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    this.queue.sort((a, b) => {
      const diff = weights[b.priority] - weights[a.priority];
      if (diff !== 0) return diff;
      return a.createdAt - b.createdAt; // FIFO for same priority
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift()!;
    this.activeCount++;

    try {
      const result = await item.payload();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      this.activeCount--;
      this.completedCount++;
      this.processQueue(); // Trigger next execution loop
    }
  }
}
