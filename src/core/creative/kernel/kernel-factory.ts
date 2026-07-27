/**
 * BELLA EOS — Creative Runtime
 * kernel/kernel-factory.ts
 *
 * Default Creative Runtime factory.
 * Wires: PlannerRegistry + AdapterRegistry + PlanningExecutor → CreativeKernel.
 *
 * To add a Phase 3 planner:
 *   registry.register(new AssetPlanner())   ← 1 line, zero other changes
 *
 * To swap semantic provider:
 *   new SemanticPlanner(new GeminiSemanticProvider())  ← 1 line
 *
 * To attach SSE streaming:
 *   createDefaultKernel(myEventBus)
 */

import { PlannerRegistry }            from './planner-registry';
import { PlanningExecutor }            from './planning-executor';
import { AdapterRegistry }             from '../adapters/adapter-registry';
import { CreativeKernel }              from './creative-kernel';
import { NULL_BUS, type KernelEventBus } from './kernel-event-bus';

// Planners
import { IntentPlanner }               from '../planners/intent-planner';
import { SemanticPlanner }             from '../planners/semantic-planner';
import { StylePlanner }                from '../planners/style-planner';
import { NarrativePlanner }            from '../planners/narrative-planner';
import { CameraPlanner }               from '../planners/camera-planner';
import { ScenePlanner }                from '../planners/scene-planner';
import { LightingPlanner }             from '../planners/lighting-planner';
import { CompositionPlanner }          from '../planners/composition-planner';
import { QualityEvaluator }            from '../quality/quality-evaluator';

// Providers
import { RuleSemanticProvider }        from '../semantic/rule-semantic-provider';
import { TemplateNarrativeProvider }   from '../narrative/template-narrative-provider';

// Adapters
import { ImagenAdapter }               from '../adapters/imagen-adapter';
import { FluxAdapter }                 from '../adapters/flux-adapter';
import { DalleAdapter }                from '../adapters/dalle-adapter';

/** Create the default Creative Runtime kernel.
 *  @param bus Optional event bus for observability (SSE, logging, telemetry).
 *             Defaults to NULL_BUS (zero-cost no-op). */
export function createDefaultKernel(bus: KernelEventBus = NULL_BUS): CreativeKernel {
  // ── Planner Registry ───────────────────────────────────────────────────────
  // Registration order determines DAG resolution order for planners in the same wave.
  // Wave membership is determined by requires/produces, not registration order.
  const registry = new PlannerRegistry()
    // Wave 0 — no dependencies
    .register(new IntentPlanner())
    // Wave 1 — requires: campaignType (parallel)
    .register(new SemanticPlanner(new RuleSemanticProvider()))   // swap: GeminiSemanticProvider
    .register(new StylePlanner())
    // Wave 2 — requires: semanticConcept + styleId (parallel)
    .register(new NarrativePlanner(new TemplateNarrativeProvider()))  // swap: GeminiNarrativeProvider
    .register(new CameraPlanner())
    // Wave 3 — requires: narrativeGraph + styleId (parallel)
    .register(new ScenePlanner())
    .register(new CompositionPlanner())
    // Wave 4 — requires: scene + styleId
    .register(new LightingPlanner())
    // Wave 5 — requires: ALL (final gate)
    .register(new QualityEvaluator());

    // ─── Phase 3 additions (uncomment when ready) ──────────────────────────
    // .register(new AssetPlanner())          // requires: campaignType, produces: assetPlan
    // .register(new LayoutPlanner())         // requires: composition, produces: layoutGraph
    // ─── Phase 4 additions ─────────────────────────────────────────────────
    // .register(new TypographyPlanner())     // requires: styleId, brandDna
    // .register(new MotionPlanner())         // requires: narrativeGraph (video only)
    // .register(new AccessibilityPlanner())  // requires: composition, scene

  // ── Adapter Registry ───────────────────────────────────────────────────────
  const adapters = new AdapterRegistry()
    .register(new ImagenAdapter())
    .register(new FluxAdapter())
    .register(new DalleAdapter());
    // Phase 3: .register(new MidjourneyAdapter())
    // Phase 4: .register(new VeoAdapter())

  // ── Executor ───────────────────────────────────────────────────────────────
  const executor = new PlanningExecutor(bus);

  return new CreativeKernel(registry, adapters, executor);
}

// ── Singleton for server-side use ─────────────────────────────────────────────
// Lazily initialized — safe in Next.js edge/serverless environment
let _defaultKernel: CreativeKernel | undefined;

export function getDefaultKernel(): CreativeKernel {
  if (!_defaultKernel) {
    _defaultKernel = createDefaultKernel();
  }
  return _defaultKernel;
}
