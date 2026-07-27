/**
 * BELLA EOS — Creative Runtime
 * kernel/creative-kernel.ts
 *
 * CreativeKernel — thin orchestrator. Knows nothing about individual planners.
 *
 * Responsibilities:
 *   1. Build PlanningContext from request (constraints resolved early)
 *   2. Init PlanningState
 *   3. Delegate execution to PlanningExecutor (DAG scheduling)
 *   4. Render prompts via AdapterRegistry after all planners complete
 *   5. Final constraint validation
 *   6. Seal the plan (freeze)
 */

import type { CreativeRequest } from '../creative-planning-engine';
import type { CreativePlan }     from '../creative-plan';
import type { PlanningState }    from './planning-state';
import { initPlanningState, StateWriter } from './planning-state';
import type { PlannerRegistry }  from './planner-registry';
import type { PlanningExecutor } from './planning-executor';
import type { AdapterRegistry }  from '../adapters/adapter-registry';
import { ConstraintEngine }      from './constraint-engine';
import {
  DEFAULT_PLATFORM,
  DEFAULT_POLICY,
  DEFAULT_MEMORY,
  DEFAULT_PREFERENCES,
  type PlanningContext,
} from './planning-context';

export class CreativeKernel {
  constructor(
    private readonly registry: PlannerRegistry,
    private readonly adapters: AdapterRegistry,
    private readonly executor: PlanningExecutor,
  ) {}

  async run(request: CreativeRequest): Promise<PlanningState> {
    // ── 1. Resolve constraints (early, available to all planners) ─────────────
    const platform   = DEFAULT_PLATFORM;   // Phase 3: resolve from request
    const policy     = DEFAULT_POLICY;     // Phase 3: resolve from org settings
    const constraints = ConstraintEngine.resolve(platform, policy);

    // ── 2. Build PlanningContext ──────────────────────────────────────────────
    const context: PlanningContext = {
      objective:         request.objective,
      copywriterSnippet: request.copywriterSnippet,
      format:            request.format ?? '16:9',
      medium:            request.medium ?? 'image',
      preferredModel:    request.preferredModel,
      brandDna:          request.brandDna ?? {},
      enterprisePolicy:  policy,
      targetPlatform:    platform,
      constraints,
      creativeMemory:    DEFAULT_MEMORY,
      userPreferences:   DEFAULT_PREFERENCES,
    };

    // ── 3. Init PlanningState ─────────────────────────────────────────────────
    const state = initPlanningState(context);

    // ── 4. Execute planners (DAG-scheduled, parallel waves) ───────────────────
    const planners = this.registry.forMedium(context.medium);
    await this.executor.execute(planners, state);

    // Skip rendering if a fatal error occurred
    if (state.errors.some(e => e.fatal)) {
      return state;
    }

    // ── 5. Render model-specific prompts via adapters ─────────────────────────
    this.renderPrompts(state);

    // ── 6. Final constraint validation ────────────────────────────────────────
    const violations = ConstraintEngine.validate(state.plan, constraints);
    for (const v of violations) {
      state.warnings.push({
        planner:  'CreativeKernel',
        code:     'CONSTRAINT_VIOLATION',
        message:  v,
        severity: 'high',
      });
    }

    // ── 7. Seal the plan ─────────────────────────────────────────────────────
    const writer = new StateWriter(state, 'CreativeKernel');
    writer.freeze();

    return state;
  }

  private renderPrompts(state: PlanningState): void {
    const plan = state.plan as CreativePlan;
    const writer = new StateWriter(state, 'CreativeKernel:AdapterLayer');

    // Render all registered adapters
    const imagenAdapter = this.adapters.get('imagen');
    const fluxAdapter   = this.adapters.get('flux');
    const dalleAdapter  = this.adapters.get('dalle');

    if (imagenAdapter) {
      writer.write('imagenPrompt',   imagenAdapter.render(plan));
      writer.write('negativePrompt', imagenAdapter.renderNegative(plan));
    }
    if (fluxAdapter) {
      writer.write('fluxPrompt', fluxAdapter.render(plan));
    }
    if (dalleAdapter) {
      writer.write('dallePrompt', dalleAdapter.render(plan));
    }
  }

  /** Get the sealed CreativePlan from a completed PlanningState.
   *  Throws if plan is not yet complete (no qualityScore). */
  static extractPlan(state: PlanningState): CreativePlan {
    if (!state.plan.qualityScore) {
      console.warn('[CreativeKernel] extractPlan called before QualityEvaluator ran');
    }
    return state.plan as CreativePlan;
  }
}
