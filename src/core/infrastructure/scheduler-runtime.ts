export interface SchedulableTask {
  taskId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryLimit: number;
  backoffMs: number;
  timeoutMs: number;
  deadline: string;
}

export class SchedulerRuntime {
  private static instance: SchedulerRuntime;
  private queue: SchedulableTask[] = [];

  private constructor() {}

  public static getInstance(): SchedulerRuntime {
    if (!SchedulerRuntime.instance) {
      SchedulerRuntime.instance = new SchedulerRuntime();
    }
    return SchedulerRuntime.instance;
  }

  public scheduleTask(task: SchedulableTask): void {
    this.queue.push(task);
    // Sort queue by priority
    const priorityWeights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    this.queue.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
  }

  public checkSlaViolation(task: SchedulableTask): boolean {
    const deadlineTime = new Date(task.deadline).getTime();
    return Date.now() > deadlineTime;
  }

  public getQueue(): SchedulableTask[] {
    return [...this.queue];
  }
}
