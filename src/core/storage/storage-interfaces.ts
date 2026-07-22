/**
 * BELLA EOS PLATFORM CONTRACT: Storage Domain Interfaces (v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Abstract persistence interfaces isolating Brain Runtimes from raw DB SDKs.
 */

export interface IMetadataStore {
  insert(table: string, record: Record<string, any>): Promise<string>;
  findById(table: string, id: string): Promise<Record<string, any> | null>;
  query(table: string, filter: Record<string, any>): Promise<Record<string, any>[]>;
  update(table: string, id: string, updates: Record<string, any>): Promise<boolean>;
  delete(table: string, id: string): Promise<boolean>;
}

export interface IVectorStore {
  upsertVector(id: string, vector: number[], payload: Record<string, any>): Promise<boolean>;
  searchVector(vector: number[], topK?: number, threshold?: number): Promise<Array<{ id: string; score: number; payload: Record<string, any> }>>;
  deleteVector(id: string): Promise<boolean>;
}

export interface IBlobStore {
  uploadBlob(path: string, content: Buffer | string, contentType?: string): Promise<string>;
  downloadBlob(path: string): Promise<Buffer | string | null>;
  deleteBlob(path: string): Promise<boolean>;
}

export interface IGraphStore {
  addTriple(subject: string, predicate: string, object: string, props?: Record<string, any>): Promise<boolean>;
  getTriples(subject?: string, predicate?: string, object?: string): Promise<Array<{ subject: string; predicate: string; object: string; props?: Record<string, any> }>>;
}

export interface ICacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}
