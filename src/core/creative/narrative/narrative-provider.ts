/**
 * BELLA EOS — Creative Runtime
 * narrative/narrative-provider.ts
 *
 * NarrativeProvider interface — generates a NarrativeGraph from SemanticConcept.
 * Phase 2 default: TemplateNarrativeProvider (pre-crafted archetypes, 0ms)
 * Phase 3 upgrade: GeminiNarrativeProvider (LLM-generated full story arc)
 */

import type { NarrativeGraph, SemanticConcept } from '../creative-plan';

export interface NarrativeProvider {
  readonly providerName: string;
  generate(
    concept:      SemanticConcept,
    styleId:      string,
    campaignType: string,
  ): NarrativeGraph;
}
