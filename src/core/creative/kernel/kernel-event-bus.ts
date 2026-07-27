/**
 * BELLA EOS — Creative Runtime
 * kernel/kernel-event-bus.ts
 *
 * Typed event bus for Creative Runtime lifecycle events.
 * Default is NULL_BUS (zero cost, no-op). Attach handlers for observability.
 *
 * Phase 4 integration: SSE streaming
 *   bus.on('planner:before', e => stream.write(`data: Running ${e.plannerName}...\n\n`))
 *   bus.on('quality:passed', () => stream.write(`data: ✓ Quality gate passed\n\n`))
 */

export type KernelEventType =
  | 'kernel:started'
  | 'kernel:completed'
  | 'wave:started'
  | 'wave:completed'
  | 'planner:before'
  | 'planner:after'
  | 'planner:failed'
  | 'planner:skipped'
  | 'constraint:violated'
  | 'quality:passed'
  | 'quality:warn'
  | 'quality:failed';

export interface KernelEvent {
  type:         KernelEventType;
  plannerName?: string;
  waveIndex?:   number;
  data?:        Record<string, unknown>;
  timestamp:    string;
}

type EventHandler = (event: KernelEvent) => void;

export class KernelEventBus {
  private readonly handlers = new Map<KernelEventType | '*', EventHandler[]>();

  on(type: KernelEventType | '*', handler: EventHandler): this {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
    return this;
  }

  off(type: KernelEventType | '*', handler: EventHandler): this {
    const list = this.handlers.get(type) ?? [];
    const idx = list.indexOf(handler);
    if (idx !== -1) list.splice(idx, 1);
    return this;
  }

  emit(event: KernelEvent): void {
    const specific = this.handlers.get(event.type) ?? [];
    const wildcard = this.handlers.get('*') ?? [];
    for (const h of [...specific, ...wildcard]) {
      try { h(event); } catch { /* handler errors never propagate to kernel */ }
    }
  }

  // ── Convenience emitters ──────────────────────────────────────────────────
  emitPlanner(
    type: 'planner:before' | 'planner:after' | 'planner:failed' | 'planner:skipped',
    plannerName: string,
    data?: Record<string, unknown>,
  ): void {
    this.emit({ type, plannerName, data, timestamp: now() });
  }

  emitWave(type: 'wave:started' | 'wave:completed', waveIndex: number, planners?: string[]): void {
    this.emit({ type, waveIndex, data: planners ? { planners } : undefined, timestamp: now() });
  }

  emitQuality(verdict: 'pass' | 'warn' | 'regenerate', score: number): void {
    const type: KernelEventType =
      verdict === 'pass' ? 'quality:passed' :
      verdict === 'warn' ? 'quality:warn'   : 'quality:failed';
    this.emit({ type, data: { verdict, score }, timestamp: now() });
  }
}

// ── NULL_BUS — zero-cost no-op default ───────────────────────────────────────
class NullEventBus extends KernelEventBus {
  override emit(_event: KernelEvent): void {}
  override emitPlanner(_type: never, _name: string): void {}
  override emitWave(_type: never, _i: number): void {}
  override emitQuality(_v: never, _s: number): void {}
}

export const NULL_BUS: KernelEventBus = new NullEventBus();

function now() { return new Date().toISOString(); }
