/**
 * BELLA EOS — Creative Runtime
 * narrative/gemini-narrative-provider.ts
 *
 * STUB — Phase 3 upgrade target.
 * Swap into kernel-factory.ts for LLM-generated dynamic narrative arcs.
 */

import type { NarrativeGraph, SemanticConcept } from '../creative-plan';
import type { NarrativeProvider } from './narrative-provider';
import { TemplateNarrativeProvider } from './template-narrative-provider';

export class GeminiNarrativeProvider implements NarrativeProvider {
  readonly providerName = 'gemini';
  private readonly fallback = new TemplateNarrativeProvider();

  generate(concept: SemanticConcept, styleId: string, campaignType: string): NarrativeGraph {
    // TODO Phase 3: call Gemini with structured NarrativeGraph output schema
    console.warn('[GeminiNarrativeProvider] STUB — falling back to TemplateNarrativeProvider');
    const result = this.fallback.generate(concept, styleId, campaignType);
    return { ...result, providerName: this.providerName };
  }
}
