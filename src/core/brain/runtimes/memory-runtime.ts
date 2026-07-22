/**
 * BELLA EOS BRAIN: Memory Runtime
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Concrete implementation of MemoryAPI v1.0.
 */

import { BusinessMemory, MemoryAPI, MemorySearchQuery, MemoryVersionHistory } from '@/types/memory';

export class MemoryRuntime implements MemoryAPI {
  private static instance: MemoryRuntime;
  private memoryStore: Map<string, BusinessMemory> = new Map();
  private links: Map<string, Array<{ targetId: string; relation: string }>> = new Map();
  private versionHistories: Map<string, MemoryVersionHistory> = new Map();

  private constructor() {}

  public static getInstance(): MemoryRuntime {
    if (!MemoryRuntime.instance) {
      MemoryRuntime.instance = new MemoryRuntime();
    }
    return MemoryRuntime.instance;
  }

  public async store(memoryInput: Omit<BusinessMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const memory: BusinessMemory = {
      ...memoryInput,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryStore.set(id, memory);

    // Record Initial Version
    this.versionHistories.set(id, {
      memoryId: id,
      versions: [
        {
          version: 1,
          content: memory.content,
          updatedAt: now,
          updatedBy: 'MemoryRuntime',
        },
      ],
    });

    return id;
  }

  public async retrieve(id: string): Promise<BusinessMemory | null> {
    return this.memoryStore.get(id) || null;
  }

  public async search(query: MemorySearchQuery): Promise<BusinessMemory[]> {
    const results: BusinessMemory[] = [];
    for (const mem of this.memoryStore.values()) {
      if (mem.tenantId !== query.tenantId) continue;
      if (query.category && mem.category !== query.category) continue;
      if (query.queryText && !mem.content.toLowerCase().includes(query.queryText.toLowerCase())) {
        continue;
      }
      results.push(mem);
    }
    return results.slice(0, query.limit || 10);
  }

  public async forget(id: string): Promise<boolean> {
    return this.memoryStore.delete(id);
  }

  public async link(sourceId: string, targetId: string, relation: string): Promise<boolean> {
    if (!this.links.has(sourceId)) {
      this.links.set(sourceId, []);
    }
    this.links.get(sourceId)!.push({ targetId, relation });
    return true;
  }

  public async version(id: string): Promise<MemoryVersionHistory> {
    return this.versionHistories.get(id) || { memoryId: id, versions: [] };
  }
}
