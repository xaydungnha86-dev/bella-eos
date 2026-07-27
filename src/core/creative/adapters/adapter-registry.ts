/**
 * BELLA EOS — Creative Runtime
 * adapters/adapter-registry.ts
 *
 * AdapterRegistry — lookup-only store for PromptAdapters.
 * Mirrors the pattern of PlannerRegistry: register once, query by model family.
 */

import type { PromptAdapter } from './prompt-adapter.interface';
import type { CreativePlan } from '../creative-plan';

export class AdapterRegistry {
  private readonly map = new Map<string, PromptAdapter>();

  register(adapter: PromptAdapter): this {
    this.map.set(adapter.modelFamily, adapter);
    return this;
  }

  get(modelFamily: string): PromptAdapter | undefined {
    return this.map.get(modelFamily);
  }

  has(modelFamily: string): boolean {
    return this.map.has(modelFamily);
  }

  getAll(): PromptAdapter[] {
    return Array.from(this.map.values());
  }

  /**
   * Render prompts for all registered adapters and return as a map.
   * Used by CreativeKernel to populate all prompt fields on CreativePlan.
   */
  renderAll(plan: CreativePlan): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [family, adapter] of this.map) {
      try {
        result[`${family}Prompt`] = adapter.render(plan);
        if (adapter.capabilities.supportsNegativePrompt) {
          result[`${family}NegativePrompt`] = adapter.renderNegative(plan);
        }
      } catch (err) {
        console.error(`[AdapterRegistry] Adapter "${family}" render failed:`, err);
        result[`${family}Prompt`] = '';
      }
    }
    return result;
  }

  /** Manifest for diagnostics. */
  manifest(): AdapterManifestEntry[] {
    return this.getAll().map(a => ({
      modelFamily:            a.modelFamily,
      provider:               a.provider,
      maxPromptChars:         a.capabilities.maxPromptChars,
      promptFormat:           a.capabilities.promptFormat,
      supportsNegativePrompt: a.capabilities.supportsNegativePrompt,
      supportsMotion:         a.capabilities.supportsMotion,
    }));
  }
}

export interface AdapterManifestEntry {
  modelFamily:            string;
  provider:               string;
  maxPromptChars:         number;
  promptFormat:           string;
  supportsNegativePrompt: boolean;
  supportsMotion:         boolean;
}
