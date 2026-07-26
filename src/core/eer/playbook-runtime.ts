/**
 * BELLA EOS EIER / EER: Enterprise Playbook Runtime (Runtime 12)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME
 * 
 * Mission: Executable Playbook Generation Engine. Transforms distilled patterns into
 * executable trigger-action playbooks (e.g. IF ROAS < 1.5 THEN Reduce Budget 30% AND Replace Creative AND Schedule 48h Review).
 */

import { IPlaybook, PlaybookActionStep, PlaybookTriggerCondition } from '@/types/playbook';

export class PlaybookRuntime {
  private static instance: PlaybookRuntime;
  private playbookStore: Map<string, IPlaybook> = new Map();

  private constructor() {
    this.seedDefaultPlaybooks();
  }

  public static getInstance(): PlaybookRuntime {
    if (!PlaybookRuntime.instance) {
      PlaybookRuntime.instance = new PlaybookRuntime();
    }
    return PlaybookRuntime.instance;
  }

  private seedDefaultPlaybooks(): void {
    const defaultPlaybook: IPlaybook = {
      id: 'pb-roas-recovery',
      title: 'Low ROAS Campaign Auto-Recovery Playbook',
      description: 'Auto-executes recovery steps when campaign ROAS falls below 1.5 threshold',
      triggerCondition: { metric: 'ROAS', operator: '<', threshold: 1.5 },
      actionSequence: [
        { stepNumber: 1, actionType: 'ADJUST_BUDGET', targetComponent: 'CampaignManager', parameters: { reducePercentage: 30 } },
        { stepNumber: 2, actionType: 'REPLACE_CREATIVE', targetComponent: 'MarketingAgent', parameters: { creativeStyle: 'AuthenticVideoReview' } },
        { stepNumber: 3, actionType: 'SCHEDULE_REVIEW', targetComponent: 'SchedulerRuntime', parameters: { delayHours: 48 } },
      ],
      reviewScheduleHours: 48,
      status: 'ACTIVE',
      executionCount: 12,
      successRate: 0.92,
      owner: 'EER_PLAYBOOK_RUNTIME',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.playbookStore.set(defaultPlaybook.id, defaultPlaybook);
  }

  public generatePlaybook(
    title: string,
    trigger: PlaybookTriggerCondition,
    actions: PlaybookActionStep[],
    owner: string = 'EER_PLAYBOOK_RUNTIME'
  ): IPlaybook {
    const id = `pb-${Date.now()}`;
    const playbook: IPlaybook = {
      id,
      title,
      description: `Auto-generated Playbook for ${trigger.metric} ${trigger.operator} ${trigger.threshold}`,
      triggerCondition: trigger,
      actionSequence: actions,
      reviewScheduleHours: 48,
      status: 'ACTIVE',
      executionCount: 0,
      successRate: 1.0,
      owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.playbookStore.set(id, playbook);
    return playbook;
  }

  public evaluatePlaybooks(metricName: string, value: number): IPlaybook[] {
    const triggered: IPlaybook[] = [];

    for (const pb of Array.from(this.playbookStore.values())) {
      if (pb.status !== 'ACTIVE') continue;
      if (pb.triggerCondition.metric.toLowerCase() === metricName.toLowerCase()) {
        let isTriggered = false;
        const thresh = pb.triggerCondition.threshold;
        switch (pb.triggerCondition.operator) {
          case '<': isTriggered = value < thresh; break;
          case '<=': isTriggered = value <= thresh; break;
          case '>': isTriggered = value > thresh; break;
          case '>=': isTriggered = value >= thresh; break;
          case '==': isTriggered = value === thresh; break;
        }

        if (isTriggered) {
          pb.executionCount++;
          pb.updatedAt = new Date().toISOString();
          triggered.push(pb);
        }
      }
    }

    return triggered;
  }

  public listPlaybooks(): IPlaybook[] {
    return Array.from(this.playbookStore.values());
  }
}
