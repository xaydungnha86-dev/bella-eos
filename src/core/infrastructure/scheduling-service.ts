/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Scheduling Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 * 
 * Mission: Enterprise Cron & Business Calendar Manager. Orchestrates cron tasks, recurring
 * business events, holidays, and working hour restrictions.
 */

export interface ScheduledTask {
  taskId: string;
  cronExpression: string;
  registeredServiceId: string;
  isGatedByWorkingHours: boolean;
  status: 'ACTIVE' | 'PAUSED';
}

export class EnterpriseSchedulingService {
  private static instance: EnterpriseSchedulingService;
  private tasks: Map<string, ScheduledTask> = new Map();

  private constructor() {
    this.registerSchedule('task-watchlist-scan', '*/5 * * * *', 'srv-mir-watchlist', false);
    this.registerSchedule('task-qbr-review', '0 0 1 */3 *', 'srv-esr-qbr', true);
  }

  public static getInstance(): EnterpriseSchedulingService {
    if (!EnterpriseSchedulingService.instance) {
      EnterpriseSchedulingService.instance = new EnterpriseSchedulingService();
    }
    return EnterpriseSchedulingService.instance;
  }

  public registerSchedule(taskId: string, cronExpression: string, registeredServiceId: string, isGatedByWorkingHours: boolean): ScheduledTask {
    const task: ScheduledTask = {
      taskId,
      cronExpression,
      registeredServiceId,
      isGatedByWorkingHours,
      status: 'ACTIVE',
    };
    this.tasks.set(taskId, task);
    return task;
  }

  public getSchedule(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  public getActiveTasksCount(): number {
    return this.tasks.size;
  }
}
