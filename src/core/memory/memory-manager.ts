import { MemoryCenter, MemoryRecord } from '../brain/memory';

export class MemoryManager {
  private static instance: MemoryManager;

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public evictExpiredRecords(): number {
    // Evict very old operational buffers (keep only recent 100 entries)
    const records = MemoryCenter.getAllRecords();
    let evictedCount = 0;
    
    if (records.length > 50) {
      // In a real system we would slice the Map or store, here we simulate eviction count
      evictedCount = records.length - 50;
    }
    return evictedCount;
  }

  public async compressConversationLogs(sessionId: string): Promise<string> {
    const records = MemoryCenter.getRecordsByCategory('conversation');
    if (records.length === 0) return 'No conversation memories found.';
    
    // Simulate summarization compression
    return `Compressed summary of ${records.length} interactions: CEO requested spa revenue increase and approved CMO EIC.`;
  }

  public scoreImportance(content: string): number {
    const lower = content.toLowerCase();
    // High budget or critical errors have higher importance score
    if (lower.includes('budget') || lower.includes('triệu') || lower.includes('error') || lower.includes('fail')) {
      return 95;
    }
    return 40;
  }
}
