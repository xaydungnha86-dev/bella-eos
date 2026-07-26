/**
 * BELLA EOS ERL: Reliability Timeline
 * Specification: ERL Observability Engine
 * 
 * Mission: Log real-time system alerts, self-healing actions, and deployment states in chronological order.
 */

import { IReliabilityTimelineEvent } from '@/types/erl';

export class ReliabilityTimeline {
  private static instance: ReliabilityTimeline;
  private events: IReliabilityTimelineEvent[] = [];

  private constructor() {
    this.seedTimeline();
  }

  public static getInstance(): ReliabilityTimeline {
    if (!ReliabilityTimeline.instance) {
      ReliabilityTimeline.instance = new ReliabilityTimeline();
    }
    return ReliabilityTimeline.instance;
  }

  public logEvent(type: IReliabilityTimelineEvent['type'], description: string): void {
    this.events.push({
      timestamp: new Date().toISOString(),
      type,
      description
    });
  }

  public getEvents(): IReliabilityTimelineEvent[] {
    return this.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private seedTimeline(): void {
    const now = new Date();
    
    const tMinus10 = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const tMinus8 = new Date(now.getTime() - 8 * 60 * 1000).toISOString();
    const tMinus7 = new Date(now.getTime() - 7 * 60 * 1000).toISOString();

    this.events.push(
      {
        timestamp: tMinus10,
        type: 'METRIC_DROP',
        description: 'Retriever Recall drops to 83% for Marketing capability.'
      },
      {
        timestamp: tMinus8,
        type: 'HEALING_ACTION',
        description: 'Auto Improvement activated: RAG TopK increased from 5 to 8.'
      },
      {
        timestamp: tMinus7,
        type: 'ERI_RECOVERY',
        description: 'Retriever Recall recovered to 98%. Marketing ERI restored.'
      }
    );
  }
}
