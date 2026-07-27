/**
 * BELLA EOS — Creative Runtime
 * semantic/gemini-semantic-provider.ts
 *
 * STUB — Phase 3 upgrade target.
 * Swap into kernel-factory.ts to enable LLM-powered semantic analysis.
 *
 * When activated:
 *   - Uses Gemini Flash (~1s, ~$0.001/call)
 *   - Generates richer SemanticConcepts from freeform objectives
 *   - Falls back to RuleSemanticProvider on API error
 */

import type { SemanticConcept, BrandDnaContext } from '../creative-plan';
import type { SemanticProvider } from './semantic-provider';
import { RuleSemanticProvider } from './rule-semantic-provider';

export class GeminiSemanticProvider implements SemanticProvider {
  readonly providerName = 'gemini-flash';

  private readonly fallback = new RuleSemanticProvider();

  analyze(objective: string, campaignType: string, brandDna?: BrandDnaContext): SemanticConcept {
    // TODO Phase 3: call Gemini Flash with structured output schema
    // const response = await geminiFlash.generate({
    //   prompt: buildSemanticPrompt(objective, campaignType, brandDna),
    //   outputSchema: SemanticConceptSchema,
    // });
    // return { ...response, providerName: this.providerName };

    console.warn('[GeminiSemanticProvider] STUB — falling back to RuleSemanticProvider');
    const result = this.fallback.analyze(objective, campaignType, brandDna);
    return { ...result, providerName: this.providerName };
  }
}
