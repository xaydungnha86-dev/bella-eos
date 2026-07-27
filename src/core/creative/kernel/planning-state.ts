/**
 * BELLA EOS — Creative Runtime
 * kernel/planning-state.ts
 *
 * PlanningState is the mutable state object shared across all planners.
 * Planners write to it via StateWriter — not via direct mutation.
 *
 * StateWriter:
 *   - Detects field override (logs warning when Planner B overwrites Planner A's output)
 *   - freeze() makes plan immutable after QualityEvaluator completes
 *
 * Phase 3 upgrade path: → StateStore with snapshot/rollback/diff support
 */

import type {
  CreativePlan,
  DecisionTraceEntry,
  PlanningWarning,
  PlanningError,
} from '../creative-plan';
import type { PlanningContext } from './planning-context';

// ── PlanningState ─────────────────────────────────────────────────────────────
export interface PlanningState {
  context:        PlanningContext;
  plan:           Partial<CreativePlan>;   // being built incrementally by planners
  decisionTrace:  DecisionTraceEntry[];
  warnings:       PlanningWarning[];
  errors:         PlanningError[];
  metrics: {
    startedAt:    string;
    plannerTimes: Record<string, number>;   // plannerName → ms elapsed
    parallelWaves: number;
  };

  // Internal — not for direct planner access
  _writtenFields: Set<string>;
  _frozen:        boolean;
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function initPlanningState(context: PlanningContext): PlanningState {
  return {
    context,
    plan: {
      objective:      context.objective,
      format:         context.format,
      medium:         context.medium,
      decisionTrace:  [],
      generatedAt:    new Date().toISOString(),
      runtimeVersion: '2.0.0',
    },
    decisionTrace:  [],
    warnings:       [],
    errors:         [],
    metrics: {
      startedAt:     new Date().toISOString(),
      plannerTimes:  {},
      parallelWaves: 0,
    },
    _writtenFields: new Set<string>(),
    _frozen:        false,
  };
}

// ── StateWriter ───────────────────────────────────────────────────────────────
/** Planners use StateWriter to write to PlanningState.plan.
 *  Never write to state.plan directly inside a Planner. */
export class StateWriter {
  constructor(
    private readonly state: PlanningState,
    private readonly plannerName: string,
  ) {}

  write<K extends keyof CreativePlan>(field: K, value: CreativePlan[K]): void {
    if (this.state._frozen) {
      console.warn(`[StateWriter] Plan is frozen — "${this.plannerName}" cannot write field "${field}"`);
      return;
    }
    if (this.state._writtenFields.has(field as string)) {
      this.state.warnings.push({
        planner:  this.plannerName,
        code:     'FIELD_OVERRIDE',
        message:  `Field "${field}" was already written by a previous planner. Overriding.`,
        severity: 'low',
      });
    }
    (this.state.plan as Record<string, unknown>)[field as string] = value;
    this.state._writtenFields.add(field as string);
  }

  /** Called by kernel after the final Quality Evaluator wave.
   *  After freeze, plan is sealed — no further writes allowed. */
  freeze(): void {
    // Sync decisionTrace from state to plan before freezing
    (this.state.plan as Record<string, unknown>)['decisionTrace'] = [...this.state.decisionTrace];
    this.state._frozen = true;
  }
}

// ── Planner helpers (import from planner-contract.ts) ─────────────────────────
/** Write a decision trace entry from inside a Planner. */
export function traceDecision(
  state:    PlanningState,
  planner:  string,
  decision: string,
  reason:   string,
  score?:   number,
): void {
  const entry: DecisionTraceEntry = { planner, decision, reason, score,
    timestamp: new Date().toISOString() };
  state.decisionTrace.push(entry);
}

/** Record a warning from inside a Planner. */
export function plannerWarn(
  state:    PlanningState,
  planner:  string,
  code:     string,
  message:  string,
  severity: 'low' | 'medium' | 'high' = 'medium',
): void {
  state.warnings.push({ planner, code, message, severity });
}

/** Record a non-fatal error from inside a Planner. */
export function plannerError(
  state:    PlanningState,
  planner:  string,
  code:     string,
  message:  string,
  fatal:    boolean = false,
): void {
  state.errors.push({ planner, code, message, fatal });
}
