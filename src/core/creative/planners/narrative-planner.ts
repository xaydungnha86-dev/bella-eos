/**
 * BELLA EOS — Creative Runtime
 * planners/narrative-planner.ts
 *
 * NarrativePlanner — Wave 2 (requires: semanticConcept, styleId).
 * Delegates to NarrativeProvider. Writes narrativeGraph to PlanningState.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision, plannerWarn } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';
import type { NarrativeProvider } from '../narrative/narrative-provider';

export class NarrativePlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'NarrativePlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        ['semanticConcept', 'styleId'],
    produces:        ['narrativeGraph'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  constructor(private readonly provider: NarrativeProvider) {}

  async plan(state: PlanningState): Promise<void> {
    const concept = state.plan.semanticConcept;
    if (!concept) {
      plannerWarn(state, 'NarrativePlanner', 'MISSING_SEMANTIC_CONCEPT',
        'semanticConcept not found — skipping narrative generation', 'medium');
      return;
    }

    const graph = this.provider.generate(
      concept,
      state.plan.styleId ?? 'corporate-clean',
      state.plan.campaignType ?? 'generic',
    );

    const writer = new StateWriter(state, 'NarrativePlanner');
    writer.write('narrativeGraph', graph);

    traceDecision(state, 'NarrativePlanner', graph.arc,
      `Provider="${this.provider.providerName}" arc="${graph.arc}" snapshot="${graph.imageSnapshot.slice(0, 60)}..."`,
      90);
  }
}
