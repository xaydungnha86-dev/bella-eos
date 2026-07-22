/**
 * BELLA EOS PLATFORM CONTRACT: Cognitive Memory API Interface (MemoryAPI v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Sole memory interface accessible by Brain Centers.
 */

export type MemoryCategory = 'WORKING' | 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL' | 'BUSINESS';

export interface BusinessMemory {
  id: string;
  tenantId: string;
  category: MemoryCategory;
  content: string;
  embeddings?: number[];
  tags: string[];
  importanceScore: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MemorySearchQuery {
  tenantId: string;
  category?: MemoryCategory;
  queryText?: string;
  vector?: number[];
  tags?: string[];
  limit?: number;
  minScore?: number;
}

export interface MemoryVersionHistory {
  memoryId: string;
  versions: Array<{
    version: number;
    content: string;
    updatedAt: string;
    updatedBy: string;
  }>;
}

export interface MemoryAPI {
  store(memory: Omit<BusinessMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  retrieve(id: string): Promise<BusinessMemory | null>;
  search(query: MemorySearchQuery): Promise<BusinessMemory[]>;
  forget(id: string): Promise<boolean>;
  link(sourceId: string, targetId: string, relation: string): Promise<boolean>;
  version(id: string): Promise<MemoryVersionHistory>;
}
