/**
 * BELLA EOS — Creative Runtime
 * planners/semantic-planner.ts
 *
 * SemanticPlanner — Wave 1 (requires: campaignType).
 * Delegates to SemanticProvider. Writes semanticConcept to PlanningState.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision, plannerWarn } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';
import type { SemanticProvider } from '../semantic/semantic-provider';

export class SemanticPlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'SemanticPlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,   // true when GeminiSemanticProvider is active
    requires:        ['campaignType'],
    produces:        ['semanticConcept'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  constructor(private readonly provider: SemanticProvider) {}

  async plan(state: PlanningState): Promise<void> {
    const campaignType = state.plan.campaignType;
    if (!campaignType) {
      plannerWarn(state, 'SemanticPlanner', 'MISSING_CAMPAIGN_TYPE',
        'campaignType not resolved — IntentPlanner may not have run first', 'medium');
    }

    const concept = this.provider.analyze(
      state.context.objective,
      campaignType ?? 'generic',
      state.context.brandDna,
    );

    const writer = new StateWriter(state, 'SemanticPlanner');
    writer.write('semanticConcept', concept);

    traceDecision(state, 'SemanticPlanner', concept.conceptLabel,
      `Provider="${this.provider.providerName}" concept="${concept.conceptLabel}" confidence=${concept.intentScore}`,
      concept.intentScore);
  }
}
