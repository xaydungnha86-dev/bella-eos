/**
 * BELLA EOS — Creative Runtime
 * semantic/semantic-provider.ts
 *
 * SemanticProvider interface — decouples Bella EOS from any specific AI provider.
 * Phase 2 default: RuleSemanticProvider (keyword table, 0ms, no API cost)
 * Phase 3 upgrade: GeminiSemanticProvider (LLM-powered, ~1s, ~$0.001/call)
 */

import type { SemanticConcept } from '../creative-plan';
import type { BrandDnaContext } from '../creative-plan';

export interface SemanticProvider {
  readonly providerName: string;
  analyze(
    objective:    string,
    campaignType: string,
    brandDna?:    BrandDnaContext,
  ): SemanticConcept;
}
