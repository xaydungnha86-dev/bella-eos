/**
 * BELLA EOS PLATFORM SERVICES: Storage Domain Implementations
 * Specification: v18.1 & v20.1 BELLA EOS CONSTITUTION
 * 
 * Implements IMetadataStore, IBlobStore, IVectorStore, ICacheStore, and IGraphStore.
 * Enforces dual-mode behavior: attempts to write to Supabase, but falls back to
 * high-performance in-memory simulation for local testing/chaos resilience.
 */

import { IMetadataStore, IBlobStore, IVectorStore, ICacheStore, IGraphStore } from './storage-interfaces';
import { supabase } from '@/lib/supabase';

// Checks if Supabase is actually configured or if it is using placeholder credentials
const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && !url.includes('placeholder-url') && !key.includes('placeholder-anon-key');
};

// =========================================================================
// 1. IMetadataStore Implementation
// =========================================================================
export class SupabaseMetadataStore implements IMetadataStore {
  private static instance: SupabaseMetadataStore;
  private memoryDb: Map<string, Map<string, Record<string, any>>> = new Map();

  private constructor() {}

  public static getInstance(): SupabaseMetadataStore {
    if (!SupabaseMetadataStore.instance) {
      SupabaseMetadataStore.instance = new SupabaseMetadataStore();
    }
    return SupabaseMetadataStore.instance;
  }

  private getTableMap(table: string): Map<string, Record<string, any>> {
    if (!this.memoryDb.has(table)) {
      this.memoryDb.set(table, new Map());
    }
    return this.memoryDb.get(table)!;
  }

  public async insert(table: string, record: Record<string, any>): Promise<string> {
    const id = record.id || `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullRecord = { ...record, id, created_at: record.created_at || new Date().toISOString() };
    
    // Always sync to memory fallback
    this.getTableMap(table).set(id, fullRecord);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from(table).insert(fullRecord).select('id').single();
        if (error) {
          console.warn(`[IMetadataStore] Supabase insert failed: ${error.message}. Kept in-memory.`);
        } else if (data) {
          return data.id;
        }
      } catch (err: any) {
        console.warn(`[IMetadataStore] Supabase insert exception: ${err.message || err}. Kept in-memory.`);
      }
    }
    return id;
  }

  public async findById(table: string, id: string): Promise<Record<string, any> | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        if (!error && data) {
          return data;
        }
      } catch (err: any) {
        console.warn(`[IMetadataStore] Supabase findById exception: ${err.message || err}. Querying memory.`);
      }
    }
    return this.getTableMap(table).get(id) || null;
  }

  public async query(table: string, filter: Record<string, any>): Promise<Record<string, any>[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from(table).select('*').match(filter);
        if (!error && data) {
          return data;
        }
      } catch (err: any) {
        console.warn(`[IMetadataStore] Supabase query exception: ${err.message || err}. Querying memory.`);
      }
    }

    // Memory query implementation
    const records = Array.from(this.getTableMap(table).values());
    return records.filter(rec => {
      for (const [key, value] of Object.entries(filter)) {
        if (rec[key] !== value) return false;
      }
      return true;
    });
  }

  public async update(table: string, id: string, updates: Record<string, any>): Promise<boolean> {
    const memoryTable = this.getTableMap(table);
    const existing = memoryTable.get(id) || {};
    memoryTable.set(id, { ...existing, ...updates, id, updated_at: new Date().toISOString() });

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from(table).update(updates).eq('id', id);
        if (error) {
          console.warn(`[IMetadataStore] Supabase update failed: ${error.message}.`);
          return true; // Return true as in-memory succeeded
        }
        return true;
      } catch (err: any) {
        console.warn(`[IMetadataStore] Supabase update exception: ${err.message || err}.`);
      }
    }
    return true;
  }

  public async delete(table: string, id: string): Promise<boolean> {
    const deleted = this.getTableMap(table).delete(id);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
          console.warn(`[IMetadataStore] Supabase delete failed: ${error.message}.`);
        }
      } catch (err: any) {
        console.warn(`[IMetadataStore] Supabase delete exception: ${err.message || err}.`);
      }
    }
    return deleted;
  }
}

// =========================================================================
// 2. IBlobStore Implementation
// =========================================================================
export class SupabaseBlobStore implements IBlobStore {
  private static instance: SupabaseBlobStore;
  private memoryBlobs: Map<string, { content: Buffer | string; contentType?: string }> = new Map();

  private constructor() {}

  public static getInstance(): SupabaseBlobStore {
    if (!SupabaseBlobStore.instance) {
      SupabaseBlobStore.instance = new SupabaseBlobStore();
    }
    return SupabaseBlobStore.instance;
  }

  public async uploadBlob(path: string, content: Buffer | string, contentType?: string): Promise<string> {
    this.memoryBlobs.set(path, { content, contentType });

    if (isSupabaseConfigured()) {
      try {
        // Upload to default bucket 'documents'
        const bucket = 'documents';
        const fileBody = content instanceof Buffer ? content : Buffer.from(content);
        const { error } = await supabase.storage.from(bucket).upload(path, fileBody, {
          contentType: contentType || 'application/octet-stream',
          upsert: true
        });
        if (error) {
          console.warn(`[IBlobStore] Supabase storage upload failed: ${error.message}. Saved in memory.`);
        }
      } catch (err: any) {
        console.warn(`[IBlobStore] Supabase storage upload exception: ${err.message || err}. Saved in memory.`);
      }
    }
    return path;
  }

  public async downloadBlob(path: string): Promise<Buffer | string | null> {
    if (isSupabaseConfigured()) {
      try {
        const bucket = 'documents';
        const { data, error } = await supabase.storage.from(bucket).download(path);
        if (!error && data) {
          // Convert Blob to Buffer for Node.js environment
          const arrayBuffer = await data.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      } catch (err: any) {
        console.warn(`[IBlobStore] Supabase storage download exception: ${err.message || err}. Retrieving from memory.`);
      }
    }

    const blob = this.memoryBlobs.get(path);
    return blob ? blob.content : null;
  }

  public async deleteBlob(path: string): Promise<boolean> {
    const deleted = this.memoryBlobs.delete(path);
    if (isSupabaseConfigured()) {
      try {
        const bucket = 'documents';
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) {
          console.warn(`[IBlobStore] Supabase storage remove failed: ${error.message}.`);
        }
      } catch (err: any) {
        console.warn(`[IBlobStore] Supabase storage remove exception: ${err.message || err}.`);
      }
    }
    return deleted;
  }
}

// =========================================================================
// 3. IVectorStore Implementation
// =========================================================================
export class SupabaseVectorStore implements IVectorStore {
  private static instance: SupabaseVectorStore;
  private memoryVectors: Map<string, { vector: number[]; payload: Record<string, any> }> = new Map();

  private constructor() {}

  public static getInstance(): SupabaseVectorStore {
    if (!SupabaseVectorStore.instance) {
      SupabaseVectorStore.instance = new SupabaseVectorStore();
    }
    return SupabaseVectorStore.instance;
  }

  public async upsertVector(id: string, vector: number[], payload: Record<string, any>): Promise<boolean> {
    this.memoryVectors.set(id, { vector, payload });

    if (isSupabaseConfigured()) {
      try {
        // Upsert into document_chunks table
        const dbRecord = {
          id,
          document_id: payload.document_id,
          version_id: payload.version_id,
          chunk_index: payload.chunk_index,
          content: payload.content || '',
          embedding: vector,
          metadata: payload,
          created_at: new Date().toISOString()
        };
        const { error } = await supabase.from('document_chunks').upsert(dbRecord);
        if (error) {
          console.warn(`[IVectorStore] Supabase vector upsert failed: ${error.message}. Kept in memory.`);
        }
      } catch (err: any) {
        console.warn(`[IVectorStore] Supabase vector upsert exception: ${err.message || err}. Kept in memory.`);
      }
    }
    return true;
  }

  public async searchVector(
    vector: number[],
    topK: number = 5,
    threshold: number = 0.0
  ): Promise<Array<{ id: string; score: number; payload: Record<string, any> }>> {
    
    if (isSupabaseConfigured()) {
      try {
        // Call the RPC function match_chunks defined in migration 002
        const { data, error } = await supabase.rpc('match_chunks', {
          query_embedding: vector,
          match_threshold: threshold,
          match_count: topK
        });

        if (!error && data) {
          return (data as any[]).map(item => ({
            id: item.id,
            score: item.similarity,
            payload: item.metadata
          }));
        } else if (error) {
          console.warn(`[IVectorStore] Supabase RPC match_chunks failed: ${error.message}. Searching memory.`);
        }
      } catch (err: any) {
        console.warn(`[IVectorStore] Supabase RPC search exception: ${err.message || err}. Searching memory.`);
      }
    }

    // In-memory Cosine Similarity fallback search
    const results: Array<{ id: string; score: number; payload: Record<string, any> }> = [];
    
    const dotProduct = (a: number[], b: number[]): number => {
      let product = 0;
      for (let i = 0; i < a.length; i++) {
        product += a[i] * b[i];
      }
      return product;
    };

    const magnitude = (a: number[]): number => {
      let sum = 0;
      for (let i = 0; i < a.length; i++) {
        sum += a[i] * a[i];
      }
      return Math.sqrt(sum);
    };

    const cosineSimilarity = (a: number[], b: number[]): number => {
      const magA = magnitude(a);
      const magB = magnitude(b);
      if (magA === 0 || magB === 0) return 0;
      return dotProduct(a, b) / (magA * magB);
    };

    for (const [id, item] of this.memoryVectors.entries()) {
      // Calculate score between the query vector and our stored vector
      const score = cosineSimilarity(vector, item.vector);
      if (score >= threshold) {
        results.push({ id, score, payload: item.payload });
      }
    }

    // Sort descending and limit to topK
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  public async deleteVector(id: string): Promise<boolean> {
    const deleted = this.memoryVectors.delete(id);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('document_chunks').delete().eq('id', id);
        if (error) {
          console.warn(`[IVectorStore] Supabase vector delete failed: ${error.message}.`);
        }
      } catch (err: any) {
        console.warn(`[IVectorStore] Supabase vector delete exception: ${err.message || err}.`);
      }
    }
    return deleted;
  }
}

// =========================================================================
// 4. ICacheStore Implementation
// =========================================================================
export class LocalCacheStore implements ICacheStore {
  private static instance: LocalCacheStore;
  private cache: Map<string, { value: any; expiresAt?: number }> = new Map();

  private constructor() {}

  public static getInstance(): LocalCacheStore {
    if (!LocalCacheStore.instance) {
      LocalCacheStore.instance = new LocalCacheStore();
    }
    return LocalCacheStore.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// =========================================================================
// 5. IGraphStore Implementation
// =========================================================================
export class LocalGraphStore implements IGraphStore {
  private static instance: LocalGraphStore;
  private triples: Array<{ subject: string; predicate: string; object: string; props?: Record<string, any> }> = [];

  private constructor() {}

  public static getInstance(): LocalGraphStore {
    if (!LocalGraphStore.instance) {
      LocalGraphStore.instance = new LocalGraphStore();
    }
    return LocalGraphStore.instance;
  }

  public async addTriple(subject: string, predicate: string, object: string, props?: Record<string, any>): Promise<boolean> {
    // Prevent duplicate triples
    const exists = this.triples.some(t => t.subject === subject && t.predicate === predicate && t.object === object);
    if (!exists) {
      this.triples.push({ subject, predicate, object, props });
    }
    return true;
  }

  public async getTriples(subject?: string, predicate?: string, object?: string): Promise<Array<{ subject: string; predicate: string; object: string; props?: Record<string, any> }>> {
    return this.triples.filter(t => {
      if (subject && t.subject !== subject) return false;
      if (predicate && t.predicate !== predicate) return false;
      if (object && t.object !== object) return false;
      return true;
    });
  }
}
