/**
 * BELLA EOS CORE: Scheduler Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Handles Cron, Delay, Retry, Timeout, Dead-Letter-Queue (DLQ), and Compensation workflows.
 */

export interface ScheduledJob {
  jobId: string;
  taskName: string;
  cronPattern?: string;
  delayMs?: number;
  maxRetries: number;
  retryCount: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DLQ';
  createdAt: string;
}

export class SchedulerRuntime {
  private static instance: SchedulerRuntime;
  private jobs: Map<string, ScheduledJob> = new Map();
  private dlq: ScheduledJob[] = [];

  private constructor() {}

  public static getInstance(): SchedulerRuntime {
    if (!SchedulerRuntime.instance) {
      SchedulerRuntime.instance = new SchedulerRuntime();
    }
    return SchedulerRuntime.instance;
  }

  public scheduleJob(taskName: string, delayMs = 0, cronPattern?: string): ScheduledJob {
    const jobId = `job-${Date.now()}`;
    const job: ScheduledJob = {
      jobId,
      taskName,
      cronPattern,
      delayMs,
      maxRetries: 3,
      retryCount: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, job);
    return job;
  }

  public failJobAndRetry(jobId: string, error: string): ScheduledJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.retryCount++;
    if (job.retryCount >= job.maxRetries) {
      job.status = 'DLQ';
      this.dlq.push(job);
    } else {
      job.status = 'PENDING';
    }
    return job;
  }

  public getDLQ(): ScheduledJob[] {
    return this.dlq;
  }
}
