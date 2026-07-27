/**
 * BELLA ECOS — Memory Manager Runtime (L2: Functional Runtime)
 * Sprint 28 — Architecture Freeze Maturity Series
 *
 * L2 Capabilities:
 *   ✅ Persistence Abstraction (IMemoryStore / InMemoryMemoryStore)
 *   ✅ Full CRUD: add, get, getAll, getByCategory, remove
 *   ✅ retrieve() — keyword-based contextual search (no mock)
 *   ✅ forget()   — delete a record by id
 *   ✅ importance() — rule-based scoring (deterministic, no AI needed at L2)
 *   ✅ compress() — rule-based summarization of a session's records
 *   ✅ evict()    — purge records below importance threshold
 *   ✅ Runtime Metrics: operation latency & success tracking
 *   ✅ Error handling & stable public interface
 */

import { MemoryRecord } from '../brain/memory';

// Re-export for consumers
export type { MemoryRecord };

export type MemoryCategory = MemoryRecord['category'];

// ─────────────────────────────────────────────
// 1. Runtime Metrics (imported pattern from Knowledge Graph L2)
// ─────────────────────────────────────────────

export interface RuntimeMetrics {
  operation: string;
  latencyMs: number;
  success: boolean;
  meta?: Record<string, any>;
}

// ─────────────────────────────────────────────
// 2. Persistence Abstraction — IMemoryStore
// ─────────────────────────────────────────────

export interface IMemoryStore {
  add(record: MemoryRecord): void;
  get(id: string): MemoryRecord | undefined;
  getAll(): MemoryRecord[];
  getByCategory(category: MemoryCategory): MemoryRecord[];
  remove(id: string): boolean;
  clear(): void;
  size(): number;
}

// ─────────────────────────────────────────────
// 3. InMemoryMemoryStore — Default Implementation
// ─────────────────────────────────────────────

export class InMemoryMemoryStore implements IMemoryStore {
  private records: Map<string, MemoryRecord> = new Map();

  add(record: MemoryRecord): void {
    this.records.set(record.id, record);
  }

  get(id: string): MemoryRecord | undefined {
    return this.records.get(id);
  }

  getAll(): MemoryRecord[] {
    return Array.from(this.records.values());
  }

  getByCategory(category: MemoryCategory): MemoryRecord[] {
    return this.getAll().filter(r => r.category === category);
  }

  remove(id: string): boolean {
    if (!this.records.has(id)) return false;
    this.records.delete(id);
    return true;
  }

  clear(): void {
    this.records.clear();
  }

  size(): number {
    return this.records.size;
  }
}

// ─────────────────────────────────────────────
// 4. Importance Scoring — Rule-based (deterministic, L2)
//    No LLM/AI required at L2. AI summarization is an L3+ concern.
// ─────────────────────────────────────────────

const HIGH_IMPORTANCE_KEYWORDS = [
  'budget', 'triệu', 'tỷ', 'revenue', 'doanh thu', 'roi',
  'critical', 'error', 'fail', 'urgent', 'khẩn cấp',
  'decision', 'quyết định', 'approve', 'phê duyệt',
  'ceo', 'cmo', 'cfo', 'cto', 'director', 'giám đốc',
];

const MEDIUM_IMPORTANCE_KEYWORDS = [
  'campaign', 'chiến dịch', 'booking', 'customer', 'khách hàng',
  'report', 'báo cáo', 'meeting', 'họp', 'plan', 'kế hoạch',
  'target', 'mục tiêu', 'kpi', 'metric',
];

export function scoreImportance(content: string): number {
  const lower = content.toLowerCase();
  let score = 20; // baseline

  for (const kw of HIGH_IMPORTANCE_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 15;
    }
  }
  for (const kw of MEDIUM_IMPORTANCE_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 7;
    }
  }

  return Math.min(score, 100);
}

// ─────────────────────────────────────────────
// 5. Compress — Rule-based summarization (L2)
//    Groups records by category and produces a structured digest.
//    LLM-backed compression is deferred to L3.
// ─────────────────────────────────────────────

export function compressRecords(records: MemoryRecord[]): string {
  if (records.length === 0) return '[Empty session — nothing to compress]';

  const byCategory: Record<string, string[]> = {};
  for (const r of records) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r.content);
  }

  const lines: string[] = [
    `[Compressed Memory — ${records.length} records — ${new Date().toISOString()}]`,
  ];
  for (const [cat, contents] of Object.entries(byCategory)) {
    lines.push(`• [${cat.toUpperCase()}] ${contents.length} entries:`);
    // Include first 3 per category to keep the digest concise
    contents.slice(0, 3).forEach(c => lines.push(`    – ${c.substring(0, 120)}`));
    if (contents.length > 3) lines.push(`    … (+${contents.length - 3} more)`);
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────
// 6. MemoryManager — Public API
// ─────────────────────────────────────────────

export class MemoryManager {
  private static instance: MemoryManager;
  private store: IMemoryStore;
  private metricsLog: RuntimeMetrics[] = [];

  private constructor(store?: IMemoryStore) {
    this.store = store ?? new InMemoryMemoryStore();
  }

  public static getInstance(store?: IMemoryStore): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(store);
    }
    return MemoryManager.instance;
  }

  /** @internal — for testing only */
  public static resetInstance(): void {
    (MemoryManager as any).instance = undefined;
  }

  // ── Metrics helpers ──

  private measure<T>(operation: string, fn: () => T): T {
    const start = Date.now();
    let success = true;
    let result: T;
    try {
      result = fn();
    } catch (err) {
      success = false;
      this.metricsLog.push({ operation, latencyMs: Date.now() - start, success });
      throw err;
    }
    this.metricsLog.push({ operation, latencyMs: Date.now() - start, success });
    return result!;
  }

  public getMetrics(): RuntimeMetrics[] {
    return [...this.metricsLog];
  }

  public clearMetrics(): void {
    this.metricsLog = [];
  }

  // ── CRUD ──

  /**
   * Add a new memory record. Auto-generates an id if not provided.
   */
  public add(
    category: MemoryCategory,
    content: string,
    metadata?: Record<string, any>
  ): MemoryRecord {
    return this.measure('add', () => {
      if (!category) throw new Error('add: category is required');
      if (!content || content.trim() === '') throw new Error('add: content must not be empty');

      const record: MemoryRecord = {
        id: `mem_${category.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        category,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        metadata,
      };
      this.store.add(record);
      return record;
    });
  }

  public get(id: string): MemoryRecord | undefined {
    return this.measure('get', () => {
      if (!id) throw new Error('get: id is required');
      return this.store.get(id);
    });
  }

  public getAll(): MemoryRecord[] {
    return this.measure('getAll', () => this.store.getAll());
  }

  public getByCategory(category: MemoryCategory): MemoryRecord[] {
    return this.measure('getByCategory', () => this.store.getByCategory(category));
  }

  /**
   * Remove a record by id. Returns true if deleted, false if not found.
   */
  public forget(id: string): boolean {
    return this.measure('forget', () => {
      if (!id) throw new Error('forget: id is required');
      return this.store.remove(id);
    });
  }

  // ── retrieve() — keyword-based contextual search ──

  /**
   * Search records whose content contains any of the query keywords.
   * Results are sorted by importance score (descending).
   */
  public retrieve(query: string, category?: MemoryCategory): MemoryRecord[] {
    return this.measure('retrieve', () => {
      if (!query || query.trim() === '') throw new Error('retrieve: query must not be empty');

      const keywords = query.toLowerCase().trim().split(/\s+/);
      const pool = category ? this.store.getByCategory(category) : this.store.getAll();

      const matched = pool.filter(r => {
        const lower = r.content.toLowerCase();
        return keywords.some(kw => lower.includes(kw));
      });

      // Sort by importance score descending
      return matched.sort(
        (a, b) => scoreImportance(b.content) - scoreImportance(a.content)
      );
    });
  }

  // ── importance() ──

  /**
   * Score the importance of a string (0–100).
   * Deterministic rule-based at L2.
   */
  public importance(content: string): number {
    return this.measure('importance', () => {
      if (!content) throw new Error('importance: content is required');
      return scoreImportance(content);
    });
  }

  // ── compress() ──

  /**
   * Produce a structured digest of all records in a given category (or all records).
   * Rule-based at L2 — no LLM call required.
   */
  public compress(category?: MemoryCategory): string {
    return this.measure('compress', () => {
      const records = category
        ? this.store.getByCategory(category)
        : this.store.getAll();
      return compressRecords(records);
    });
  }

  // ── evict() ──

  /**
   * Remove all records below a minimum importance threshold.
   * Returns the number of records evicted.
   */
  public evict(minImportance: number = 30): number {
    return this.measure('evict', () => {
      if (minImportance < 0 || minImportance > 100) {
        throw new Error('evict: minImportance must be between 0 and 100');
      }
      const toEvict = this.store.getAll().filter(
        r => scoreImportance(r.content) < minImportance
      );
      toEvict.forEach(r => this.store.remove(r.id));
      return toEvict.length;
    });
  }

  // ── stats() ──

  public stats(): { total: number; byCategory: Record<string, number> } {
    return this.measure('stats', () => {
      const all = this.store.getAll();
      const byCategory: Record<string, number> = {};
      all.forEach(r => {
        byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      });
      return { total: all.length, byCategory };
    });
  }
}
