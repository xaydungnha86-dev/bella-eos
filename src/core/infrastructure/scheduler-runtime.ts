/**
 * BELLA ECOS — Scheduler Runtime (L2: Functional Runtime)
 * Sprint 28 — Architecture Freeze Maturity Series
 *
 * L2 Capabilities:
 *   ✅ ISchedulerStore / InMemorySchedulerStore (Persistence Abstraction)
 *   ✅ Priority Queue — Sorted Array acting as Max-Heap by priority weight + deadline
 *   ✅ scheduleTask() — enqueue to priority-sorted queue
 *   ✅ dequeue() — pop highest priority task
 *   ✅ failTaskAndRetry() — Exponential Backoff + DLQ (Map<string,string>)
 *   ✅ checkSlaViolation() — deadline vs. now
 *   ✅ RuntimeMetrics v2.0 (shared contract)
 *   ✅ Error handling & stable public interface
 *
 * Priority weights: CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1
 * Tie-breaking: earlier deadline goes first.
 * DLQ: Map<taskId, errorReason> — intentionally simple at L2.
 */

import { RuntimeMetrics, createMetric } from '@/types/runtime-metrics';

const RUNTIME_NAME = 'SchedulerRuntime';

// ─────────────────────────────────────────────
// 1. Core Types
// ─────────────────────────────────────────────

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DLQ';

export interface SchedulableTask {
  taskId: string;
  name: string;
  priority: TaskPriority;
  retryLimit: number;       // max number of retry attempts
  retryCount: number;       // current retry count
  backoffMs: number;        // base backoff milliseconds (doubles each retry)
  timeoutMs: number;        // max allowed execution duration
  deadline: string;         // ISO 8601 — hard deadline
  status: TaskStatus;
  createdAt: string;        // ISO 8601
  lastFailedAt?: string;    // ISO 8601
}

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

// ─────────────────────────────────────────────
// 2. Persistence Abstraction — ISchedulerStore
// ─────────────────────────────────────────────

export interface ISchedulerStore {
  enqueue(task: SchedulableTask): void;
  dequeue(): SchedulableTask | undefined;   // highest priority first
  getTask(taskId: string): SchedulableTask | undefined;
  updateTask(taskId: string, updates: Partial<SchedulableTask>): boolean;
  getQueue(): SchedulableTask[];
  clear(): void;
  size(): number;
}

// ─────────────────────────────────────────────
// 3. InMemorySchedulerStore — Priority-Sorted Queue
//    Uses a sorted array maintained in O(n log n) order.
//    Dequeue is O(1). Enqueue is O(n) — appropriate for L2 scale.
//    For L3+, a proper Binary Heap can be swapped in here
//    without changing the public SchedulerRuntime API.
// ─────────────────────────────────────────────

function compareTasks(a: SchedulableTask, b: SchedulableTask): number {
  const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
  if (priorityDiff !== 0) return priorityDiff;
  // Tie-break: earlier deadline first
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
}

export class InMemorySchedulerStore implements ISchedulerStore {
  private queue: SchedulableTask[] = [];
  private taskMap: Map<string, SchedulableTask> = new Map();

  enqueue(task: SchedulableTask): void {
    this.taskMap.set(task.taskId, task);
    this.queue.push(task);
    this.queue.sort(compareTasks); // Maintain priority order
  }

  dequeue(): SchedulableTask | undefined {
    if (this.queue.length === 0) return undefined;
    const task = this.queue.shift()!;
    // Keep taskMap intact so getTask still works after dequeue
    return task;
  }

  getTask(taskId: string): SchedulableTask | undefined {
    return this.taskMap.get(taskId);
  }

  updateTask(taskId: string, updates: Partial<SchedulableTask>): boolean {
    const task = this.taskMap.get(taskId);
    if (!task) return false;
    Object.assign(task, updates);
    // Re-sort queue if priority may have changed
    this.queue.sort(compareTasks);
    return true;
  }

  getQueue(): SchedulableTask[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.taskMap.clear();
  }

  size(): number {
    return this.queue.length;
  }
}

// ─────────────────────────────────────────────
// 4. SchedulerRuntime — Public API
// ─────────────────────────────────────────────

export class SchedulerRuntime {
  private static instance: SchedulerRuntime;
  private store: ISchedulerStore;
  private metricsLog: RuntimeMetrics[] = [];

  /**
   * Dead Letter Queue — intentionally simple at L2.
   * Map<taskId, errorReason>
   * L3+ can upgrade this to a persistent event log.
   */
  private dlq: Map<string, string> = new Map();

  private constructor(store?: ISchedulerStore) {
    this.store = store ?? new InMemorySchedulerStore();
  }

  public static getInstance(store?: ISchedulerStore): SchedulerRuntime {
    if (!SchedulerRuntime.instance) {
      SchedulerRuntime.instance = new SchedulerRuntime(store);
    }
    return SchedulerRuntime.instance;
  }

  /** @internal — for testing only */
  public static resetInstance(): void {
    (SchedulerRuntime as any).instance = undefined;
  }

  // ── Metrics helpers ──

  private measure<T>(operation: string, fn: () => T): T {
    const startedAt = Date.now();
    let success = true;
    let errorCode: string | undefined;
    let result: T;
    try {
      result = fn();
    } catch (err: any) {
      success = false;
      errorCode = err?.message ?? 'UNKNOWN_ERROR';
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success, errorCode));
      throw err;
    }
    this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success));
    return result!;
  }

  public getMetrics(): RuntimeMetrics[] {
    return [...this.metricsLog];
  }

  public clearMetrics(): void {
    this.metricsLog = [];
  }

  // ── Core API ──

  /**
   * Enqueue a task into the priority-sorted queue.
   */
  public scheduleTask(task: SchedulableTask): void {
    this.measure('scheduleTask', () => {
      if (!task.taskId || !task.name) {
        throw new Error('scheduleTask: taskId and name are required');
      }
      if (!PRIORITY_WEIGHTS[task.priority]) {
        throw new Error(`scheduleTask: unknown priority "${task.priority}"`);
      }
      const enriched: SchedulableTask = {
        ...task,
        retryCount: task.retryCount ?? 0,
        status: 'PENDING',
        createdAt: task.createdAt ?? new Date().toISOString(),
      };
      this.store.enqueue(enriched);
    });
  }

  /**
   * Dequeue the highest-priority task for execution.
   */
  public dequeue(): SchedulableTask | undefined {
    return this.measure('dequeue', () => this.store.dequeue());
  }

  public getTask(taskId: string): SchedulableTask | undefined {
    return this.measure('getTask', () => {
      if (!taskId) throw new Error('getTask: taskId is required');
      return this.store.getTask(taskId);
    });
  }

  public getQueue(): SchedulableTask[] {
    return this.measure('getQueue', () => this.store.getQueue());
  }

  /**
   * failTaskAndRetry() — Exponential Backoff + DLQ.
   *
   * Logic:
   *   retryCount < retryLimit → schedule retry with backoff delay
   *   retryCount >= retryLimit → send to DLQ
   *
   * Backoff formula: backoffMs * 2^(retryCount - 1)
   * (e.g., base=1000ms → 1000, 2000, 4000, 8000...)
   */
  public failTaskAndRetry(
    taskId: string,
    error: string
  ): { status: TaskStatus; delayMs: number } {
    return this.measure('failTaskAndRetry', () => {
      if (!taskId) throw new Error('failTaskAndRetry: taskId is required');
      if (!error) throw new Error('failTaskAndRetry: error reason is required');

      const task = this.store.getTask(taskId);
      if (!task) throw new Error(`failTaskAndRetry: task "${taskId}" not found`);

      const newRetryCount = task.retryCount + 1;

      if (newRetryCount > task.retryLimit) {
        // Move to DLQ
        this.store.updateTask(taskId, {
          status: 'DLQ',
          retryCount: newRetryCount,
          lastFailedAt: new Date().toISOString(),
        });
        this.dlq.set(taskId, error);
        return { status: 'DLQ', delayMs: 0 };
      }

      // Exponential backoff: backoffMs * 2^(retryCount - 1)
      const delayMs = task.backoffMs * Math.pow(2, newRetryCount - 1);
      this.store.updateTask(taskId, {
        status: 'PENDING',
        retryCount: newRetryCount,
        lastFailedAt: new Date().toISOString(),
      });

      return { status: 'PENDING', delayMs };
    });
  }

  /**
   * checkSlaViolation() — Returns true if the task deadline has passed.
   */
  public checkSlaViolation(taskId: string): boolean {
    return this.measure('checkSlaViolation', () => {
      if (!taskId) throw new Error('checkSlaViolation: taskId is required');
      const task = this.store.getTask(taskId);
      if (!task) throw new Error(`checkSlaViolation: task "${taskId}" not found`);
      return Date.now() > new Date(task.deadline).getTime();
    });
  }

  // ── DLQ Access ──

  public getDlq(): Map<string, string> {
    return new Map(this.dlq);
  }

  public getDlqSize(): number {
    return this.dlq.size;
  }

  // ── Stats ──

  public stats(): { queued: number; dlq: number } {
    return this.measure('stats', () => ({
      queued: this.store.size(),
      dlq: this.dlq.size,
    }));
  }
}
