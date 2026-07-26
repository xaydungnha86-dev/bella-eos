/**
 * BELLA EOS E-COS: Enterprise Memory Lifecycle Manager
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Mission: Memory Lifecycle Engine. Manages cognitive memory aging:
 * - Hot Memory: 0 to 30 days (Full raw detail inside context prompt).
 * - Warm Memory: 31 to 180 days (Summarized operational context).
 * - Cold Memory: > 180 days (Archived deep store, retrieved on-demand).
 * - Tier 4 Wisdom: Permanent distilled executive principles (`IWisdom`).
 */

export type MemoryLifecycleTier = 'HOT' | 'WARM' | 'COLD' | 'WISDOM';

export interface ManagedMemoryRecord {
  recordId: string;
  tenantId: string;
  content: string;
  ageInDays: number;
  currentTier: MemoryLifecycleTier;
}

export class MemoryLifecycleManager {
  private static instance: MemoryLifecycleManager;

  private constructor() {}

  public static getInstance(): MemoryLifecycleManager {
    if (!MemoryLifecycleManager.instance) {
      MemoryLifecycleManager.instance = new MemoryLifecycleManager();
    }
    return MemoryLifecycleManager.instance;
  }

  public classifyTier(ageInDays: number, isWisdomDistilled: boolean = false): MemoryLifecycleTier {
    if (isWisdomDistilled) return 'WISDOM';
    if (ageInDays <= 30) return 'HOT';
    if (ageInDays <= 180) return 'WARM';
    return 'COLD';
  }

  public processLifecycleTransition(record: ManagedMemoryRecord): ManagedMemoryRecord {
    record.currentTier = this.classifyTier(record.ageInDays);
    return record;
  }
}
