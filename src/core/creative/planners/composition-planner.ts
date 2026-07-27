/**
 * BELLA EOS — Creative Runtime
 * planners/composition-planner.ts
 *
 * CompositionPlanner — Wave 3 parallel with ScenePlanner (requires: narrativeGraph, styleId).
 * Determines copy space, visual flow, and grid system.
 * Constraint-aware: reads constraints.maxHeadlineChars + maxImageTextRatio from context.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';

export class CompositionPlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'CompositionPlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        ['narrativeGraph', 'styleId'],
    produces:        ['composition'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const constraints  = state.context.constraints;
    const copySnippet  = state.context.copywriterSnippet ?? '';
    const format       = state.context.format;
    const styleId      = state.plan.styleId ?? 'corporate-clean';

    // ── Copy Space Calculation ───────────────────────────────────────────────
    const headlineLength = copySnippet.length;
    let baseCopySpace =
      headlineLength > 60 ? 70 :
      headlineLength > 35 ? 60 :
      headlineLength > 0  ? 50 :
      40;

    // Platform constraint: Google Ads = max 20% text area → max 20% copy space
    const maxCopySpace = constraints.maxImageTextRatio
      ? Math.floor(constraints.maxImageTextRatio * 100)
      : 70;

    const copySpacePercent  = Math.min(baseCopySpace, maxCopySpace);

    // ── Copy Space Direction ─────────────────────────────────────────────────
    const copySpaceDirection = this.selectDirection(format, styleId);

    // ── Visual Flow ───────────────────────────────────────────────────────────
    const visualFlow = this.selectFlow(styleId, format);

    // ── Grid System ───────────────────────────────────────────────────────────
    const gridSystem =
      styleId.includes('luxury') || styleId.includes('editorial') ? 'golden-ratio' :
      styleId.includes('minimal') || styleId.includes('corporate') ? 'rule-of-thirds' :
      '12-col';

    const writer = new StateWriter(state, 'CompositionPlanner');
    writer.write('composition', {
      copySpacePercent,
      copySpaceDirection,
      visualFlow,
      gridSystem,
      safeZone: constraints.safeZone,
    } as any);

    traceDecision(state, 'CompositionPlanner',
      `${copySpacePercent}% ${copySpaceDirection}`,
      `headline=${headlineLength}chars platform_max=${maxCopySpace}% → ${copySpacePercent}% on ${copySpaceDirection}. Flow: ${visualFlow}`,
      85);
  }

  private selectDirection(format: string, styleId: string): string {
    if (format === '9:16') return 'bottom';     // vertical: text at bottom
    if (styleId.includes('editorial')) return 'right'; // editorial: text right
    return 'left';                               // default: text left
  }

  private selectFlow(styleId: string, format: string): string {
    if (styleId.includes('luxury') || styleId.includes('premium')) return 'z-pattern';
    if (styleId.includes('editorial') || styleId.includes('fashion')) return 'diagonal';
    if (format === '1:1') return 'center-focal';
    return 'f-pattern';
  }
}
