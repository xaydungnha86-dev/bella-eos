/**
 * BELLA EOS — Creative Runtime
 * quality/quality-evaluator.ts
 *
 * QualityEvaluator — implements Planner, registered LAST in PlannerRegistry.
 * Reads the fully-populated CreativePlan and scores 5 dimensions.
 *
 * Verdicts:
 *   overall >= 80  → pass
 *   overall 60–79  → warn (proceed, log warnings)
 *   overall < 60   → regenerate (kernel may retry — Phase 3 ExecutionPolicy)
 *
 * Phase 3 upgrade: LLM-powered scoring, ExecutionPolicy-driven retry.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';
import type { QualityScore, StyleConflict } from '../creative-plan';

// Style compatibility matrix (rule-based stub — Phase 3: full KB)
const STYLE_COMPAT: Record<string, Record<string, number>> = {
  luxury:       { minimal: 95, premium: 98, corporate: 87, nature: 78, cyberpunk: 63, fashion: 82 },
  premium:      { luxury: 98, minimal: 90, corporate: 85, nature: 75, cyberpunk: 60, fashion: 80 },
  minimal:      { luxury: 95, premium: 90, corporate: 88, nature: 80, cyberpunk: 55, fashion: 85 },
  corporate:    { luxury: 87, minimal: 88, premium: 85, nature: 72, cyberpunk: 50, fashion: 65 },
  nature:       { luxury: 78, minimal: 80, corporate: 72, cyberpunk: 45, fashion: 70, premium: 75 },
  cyberpunk:    { luxury: 63, minimal: 55, corporate: 50, nature: 45, fashion: 70, premium: 60 },
  fashion:      { luxury: 82, minimal: 85, corporate: 65, nature: 70, cyberpunk: 70, premium: 80 },
};

export class QualityEvaluator implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'QualityEvaluator',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     5,
    usesExternalApi: false,
    requires:        [
      'semanticConcept', 'styleGraph', 'narrativeGraph',
      'composition', 'lighting', 'camera', 'scene',
      'imagenPrompt',
    ],
    produces:        ['qualityScore'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const plan = state.plan;
    const constraints = state.context.constraints;

    const conflicts: StyleConflict[] = [];

    // ── Dimension 1: Semantic Consistency ────────────────────────────────────
    let semanticConsistency = 70;
    if (plan.semanticConcept && plan.narrativeGraph) {
      // If narrative exists and semantic exists, assume high consistency
      semanticConsistency = Math.min(100, 70 + plan.semanticConcept.intentScore * 0.3);
    } else if (plan.semanticConcept) {
      semanticConsistency = 65;
    }

    // ── Dimension 2: Brand Consistency ───────────────────────────────────────
    let brandConsistency = 75;
    const brandDna = state.context.brandDna;
    if (brandDna?.primaryColor && plan.palette?.primary) {
      // Rough check: brand color present in palette
      brandConsistency = plan.palette.primary === brandDna.primaryColor ? 95 : 70;
    }

    // ── Dimension 3: Visual Consistency (style compatibility) ─────────────────
    let visualConsistency = 85;
    if (plan.styleId && plan.lighting?.style) {
      const compat = STYLE_COMPAT[plan.styleId]?.[plan.lighting.style];
      if (compat !== undefined && compat < 75) {
        conflicts.push({
          dimension:  'lighting-style',
          elementA:   plan.styleId,
          elementB:   plan.lighting.style,
          score:      compat,
          resolution: `${plan.styleId} takes visual precedence`,
        });
        visualConsistency = Math.min(visualConsistency, compat + 10);
      }
    }

    // ── Dimension 4: Composition Completeness ────────────────────────────────
    let compositionCompleteness = 60;
    if (plan.composition) compositionCompleteness += 25;
    if (plan.camera) compositionCompleteness += 10;
    if (plan.lighting) compositionCompleteness += 5;
    compositionCompleteness = Math.min(100, compositionCompleteness);

    // ── Dimension 5: Prompt Readiness ────────────────────────────────────────
    let promptReadiness = 50;
    if (plan.imagenPrompt && plan.imagenPrompt.length > 50) promptReadiness += 30;
    if (plan.imagenPrompt && plan.imagenPrompt.length <= constraints.maxPromptChars) promptReadiness += 20;
    if (plan.narrativeGraph?.imageSnapshot) promptReadiness += 10;

    // ── Overall ──────────────────────────────────────────────────────────────
    const overall = Math.round(
      semanticConsistency   * 0.25 +
      brandConsistency      * 0.20 +
      visualConsistency     * 0.25 +
      compositionCompleteness * 0.15 +
      promptReadiness       * 0.15
    );

    const verdict: QualityScore['verdict'] =
      overall >= 80 ? 'pass' :
      overall >= 60 ? 'warn' :
      'regenerate';

    const qualityScore: QualityScore = {
      semanticConsistency,
      brandConsistency,
      visualConsistency,
      compositionCompleteness,
      promptReadiness,
      overall,
      conflicts,
      verdict,
    };

    const writer = new StateWriter(state, 'QualityEvaluator');
    writer.write('qualityScore', qualityScore);

    traceDecision(state, 'QualityEvaluator', verdict,
      `Overall ${overall}/100 — semantic:${Math.round(semanticConsistency)} brand:${Math.round(brandConsistency)} visual:${Math.round(visualConsistency)} composition:${Math.round(compositionCompleteness)} prompt:${Math.round(promptReadiness)}`,
      overall);

    // Emit quality event via bus (accessed through executor — Phase 4)
    if (verdict === 'warn') {
      state.warnings.push({
        planner:  'QualityEvaluator',
        code:     'QUALITY_WARN',
        message:  `Quality score ${overall}/100 — proceeding with warnings`,
        severity: 'medium',
      });
    }
    if (verdict === 'regenerate') {
      state.warnings.push({
        planner:  'QualityEvaluator',
        code:     'QUALITY_REGENERATE',
        message:  `Quality score ${overall}/100 below threshold — regenerate recommended (Phase 3: ExecutionPolicy retry)`,
        severity: 'high',
      });
    }
  }
}
