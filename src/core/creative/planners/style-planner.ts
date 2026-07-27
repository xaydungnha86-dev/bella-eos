/**
 * BELLA EOS — Creative Runtime
 * planners/style-planner.ts
 *
 * StylePlanner — Wave 1 (requires: campaignType, runs parallel with SemanticPlanner).
 * Selects styleId and palette from StyleLibrary based on luxuryLevel + campaignType.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';
import { STYLE_LIBRARY } from '../style-library';

const STYLE_SELECTION: Array<{
  campaignTypes: string[];
  minLuxury: number;
  maxLuxury: number;
  styleId: string;
}> = [
  { campaignTypes: ['spa/wellness', 'luxury-brand'],   minLuxury: 4, maxLuxury: 5, styleId: 'luxury' },
  { campaignTypes: ['real-estate'],                    minLuxury: 4, maxLuxury: 5, styleId: 'luxury' },
  { campaignTypes: ['fashion'],                        minLuxury: 3, maxLuxury: 5, styleId: 'fashion' },
  { campaignTypes: ['tech/ai', 'startup'],             minLuxury: 2, maxLuxury: 4, styleId: 'cyberpunk' },
  { campaignTypes: ['startup'],                        minLuxury: 3, maxLuxury: 5, styleId: 'cyberpunk' },
  { campaignTypes: ['finance'],                        minLuxury: 2, maxLuxury: 4, styleId: 'corporate' },
  { campaignTypes: ['health/fitness'],                 minLuxury: 1, maxLuxury: 3, styleId: 'nature' },
  { campaignTypes: ['education', 'event'],             minLuxury: 1, maxLuxury: 3, styleId: 'corporate' },
];

export class StylePlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'StylePlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        ['campaignType'],
    produces:        ['styleId', 'styleGraph', 'palette'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const campaignType = state.plan.campaignType ?? 'generic';
    const luxuryLevel  = (state.plan.luxuryLevel as number | undefined) ?? 3;
    const constraints  = state.context.constraints;

    // Check enterprise policy first
    const allowedStyles = constraints.allowedStyleIds;

    let selectedId = 'corporate'; // default

    for (const rule of STYLE_SELECTION) {
      if (
        rule.campaignTypes.includes(campaignType) &&
        luxuryLevel >= rule.minLuxury &&
        luxuryLevel <= rule.maxLuxury
      ) {
        // Respect enterprise policy
        if (!allowedStyles || allowedStyles.includes(rule.styleId)) {
          selectedId = rule.styleId;
          break;
        }
      }
    }

    // Fallback: use first allowed style from enterprise policy
    if (allowedStyles?.length && !allowedStyles.includes(selectedId)) {
      selectedId = allowedStyles[0];
    }

    const styleGraph = STYLE_LIBRARY[selectedId] ?? STYLE_LIBRARY['corporate'];
    const brandDna = state.context.brandDna;
    const palette = {
      primary:   brandDna.brandColors?.primary  || styleGraph.palette.dominant || '#061E17',
      accent:    brandDna.brandColors?.accent    || styleGraph.palette.highlight || '#D4AF37',
      neutral:   brandDna.brandColors?.neutral   || styleGraph.palette.surface || '#F5F5F0',
      surface:   styleGraph.palette.surface || '#0D0D0D',
    };

    const writer = new StateWriter(state, 'StylePlanner');
    writer.write('styleId',    selectedId);
    writer.write('styleGraph', styleGraph as any);
    writer.write('palette',    palette as any);

    traceDecision(state, 'StylePlanner', selectedId,
      `campaignType="${campaignType}" luxuryLevel=${luxuryLevel} → styleId="${selectedId}"`,
      85);
  }
}
