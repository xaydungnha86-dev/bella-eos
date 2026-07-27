/**
 * BELLA EOS — Creative Runtime
 * kernel/planning-executor.ts
 *
 * PlanningExecutor = DAG scheduling + parallel wave execution + event emission.
 * Completely separate from PlannerRegistry (lookup) and CreativeKernel (orchestration).
 *
 * Algorithm:
 *   1. Filter planners by medium capability
 *   2. Build dependency graph from planner {requires / produces} declarations
 *   3. Topological sort (Kahn's algorithm) → execution waves
 *   4. Per wave: run all independent planners in parallel (Promise.allSettled)
 *   5. Emit KernelEventBus events at each lifecycle point
 *
 * Phase 3 upgrade: ExecutionPolicy (retry, fallback, conditional, loop)
 * Phase 3 upgrade: StateStore (snapshot before each wave, rollback on failure)
 */

import type { Planner } from './planner-contract';
import type { PlanningState } from './planning-state';
import type { KernelEventBus } from './kernel-event-bus';
import { NULL_BUS } from './kernel-event-bus';
import type { CreativePlan } from '../creative-plan';

export class PlanningExecutor {
  constructor(private readonly bus: KernelEventBus = NULL_BUS) {}

  async execute(planners: Planner[], state: PlanningState): Promise<void> {
    this.bus.emit({ type: 'kernel:started', timestamp: now() });

    const waves = this.buildExecutionWaves(planners, state.context.medium);
    state.metrics.parallelWaves = waves.length;

    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      const waveNames = wave.map(p => p.meta.plannerName);
      this.bus.emitWave('wave:started', i, waveNames);

      // Run all planners in wave concurrently; allSettled never rejects
      const results = await Promise.allSettled(
        wave.map(p => this.runOne(p, state))
      );

      // Collect any promise-level errors (shouldn't happen, but guard anyway)
      results.forEach((r, idx) => {
        if (r.status === 'rejected') {
          state.errors.push({
            planner: wave[idx]?.meta.plannerName ?? 'unknown',
            code: 'EXECUTOR_SETTLE_ERROR',
            message: String(r.reason),
            fatal: false,
          });
        }
      });

      this.bus.emitWave('wave:completed', i);

      // Abort remaining waves if a fatal error occurred
      if (state.errors.some(e => e.fatal)) {
        console.error(`[PlanningExecutor] Fatal error after wave ${i}. Aborting.`);
        break;
      }
    }

    if (state.plan.qualityScore) {
      this.bus.emitQuality(state.plan.qualityScore.verdict, state.plan.qualityScore.overall);
    }

    this.bus.emit({
      type: 'kernel:completed',
      data: {
        waves:    waves.length,
        warnings: state.warnings.length,
        errors:   state.errors.length,
      },
      timestamp: now(),
    });
  }

  // ── Private: run a single planner ──────────────────────────────────────────
  private async runOne(planner: Planner, state: PlanningState): Promise<void> {
    this.bus.emitPlanner('planner:before', planner.meta.plannerName);
    const start = Date.now();

    try {
      await planner.plan(state);
      const elapsed = Date.now() - start;
      state.metrics.plannerTimes[planner.meta.plannerName] = elapsed;
      this.bus.emitPlanner('planner:after', planner.meta.plannerName, { ms: elapsed });
    } catch (err) {
      const elapsed = Date.now() - start;
      state.metrics.plannerTimes[planner.meta.plannerName] = elapsed;
      state.errors.push({
        planner: planner.meta.plannerName,
        code:    'PLANNER_EXCEPTION',
        message: String(err),
        fatal:   false,
      });
      this.bus.emitPlanner('planner:failed', planner.meta.plannerName, {
        error: String(err), ms: elapsed,
      });
    }
  }

  // ── DAG: Topological sort → waves ─────────────────────────────────────────
  /**
   * Kahn's algorithm on the {requires → produces} bipartite graph.
   * Planners in the same wave have no inter-dependencies → run in parallel.
   *
   * Example waves (image medium):
   *   Wave 0: [IntentPlanner]
   *   Wave 1: [SemanticPlanner, StylePlanner]       ← both require campaignType
   *   Wave 2: [NarrativePlanner, CameraPlanner]     ← require semanticConcept
   *   Wave 3: [ScenePlanner, CompositionPlanner]    ← require narrativeGraph + styleGraph
   *   Wave 4: [LightingPlanner]                     ← requires scene
   *   Wave 5: [QualityEvaluator]                    ← requires all
   */
  private buildExecutionWaves(planners: Planner[], medium: CreativePlan['medium']): Planner[][] {
    // 1. Capability filter (already done by registry.forMedium, but guard here)
    const eligible = planners.filter(p => this.capabilityMatch(p, medium));

    // 2. Build: field → planner that produces it
    const producedBy = new Map<string, string>(); // field → plannerName
    for (const p of eligible) {
      for (const field of p.meta.produces) {
        producedBy.set(field, p.meta.plannerName);
      }
    }

    // 3. Build: plannerName → set of plannerNames it depends on
    const deps = new Map<string, Set<string>>();
    for (const p of eligible) {
      const d = new Set<string>();
      for (const req of p.meta.requires) {
        const dep = producedBy.get(req);
        if (dep && dep !== p.meta.plannerName) d.add(dep);
      }
      deps.set(p.meta.plannerName, d);
    }

    // 4. Kahn's topological sort → waves
    const byName = new Map(eligible.map(p => [p.meta.plannerName, p]));
    const remaining = new Set(eligible.map(p => p.meta.plannerName));
    const waves: Planner[][] = [];

    while (remaining.size > 0) {
      // Collect all nodes whose dependencies are already resolved
      const wave = [...remaining].filter(name =>
        [...(deps.get(name) ?? new Set())].every(dep => !remaining.has(dep))
      );

      if (wave.length === 0) {
        // Cycle detected — add remaining planners in arbitrary order to avoid deadlock
        console.warn('[PlanningExecutor] Dependency cycle detected. Adding remaining planners sequentially.');
        waves.push([...remaining].map(n => byName.get(n)!).filter(Boolean));
        break;
      }

      waves.push(wave.map(n => byName.get(n)!).filter(Boolean));
      wave.forEach(n => remaining.delete(n));
    }

    return waves;
  }

  private capabilityMatch(planner: Planner, medium: CreativePlan['medium']): boolean {
    const c = planner.meta.capabilities;
    switch (medium) {
      case 'video':        return c.supportsVideo;
      case 'slide':        return c.supportsSlide;
      case 'landing_page': return c.supportsLanding;
      default:             return c.supportsImage;
    }
  }
}

function now() { return new Date().toISOString(); }
