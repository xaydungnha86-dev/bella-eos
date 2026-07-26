/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Scheduler Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Cross-Cutting Scheduling & SLA Platform Service. Manages execution calendars,
 * reminders, warning gates, and escalation notifications based on priority SLA profiles.
 */

export interface SlaProfile {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  responseTimeHours: number;
}

export class EnterpriseSchedulerService {
  private static instance: EnterpriseSchedulerService;

  private readonly slaProfiles: Record<SlaProfile['priority'], number> = {
    HIGH: 2,
    MEDIUM: 24,
    LOW: 72,
  };

  private constructor() {}

  public static getInstance(): EnterpriseSchedulerService {
    if (!EnterpriseSchedulerService.instance) {
      EnterpriseSchedulerService.instance = new EnterpriseSchedulerService();
    }
    return EnterpriseSchedulerService.instance;
  }

  public calculateSlaRemainingHours(createdAtStr: string, priority: SlaProfile['priority'], relativeTime: Date = new Date()): number {
    const limit = this.slaProfiles[priority];
    const created = new Date(createdAtStr);
    const elapsedMs = relativeTime.getTime() - created.getTime();
    const elapsedHours = elapsedMs / (60 * 60 * 1000);

    return Math.max(0, limit - elapsedHours);
  }

  public evaluateDeadline(dueDateStr: string, relativeTime: Date): { overdue: boolean; diffHours: number } {
    const due = new Date(dueDateStr);
    const diffMs = due.getTime() - relativeTime.getTime();
    const diffHours = diffMs / (60 * 60 * 1000);

    return {
      overdue: diffHours < 0,
      diffHours: Math.abs(diffHours),
    };
  }
}
