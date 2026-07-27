/**
 * BELLA EOS - Adapter Registry v3
 * Layer 4: Model Adaptation (Format Optimization)
 * 
 * Registry for model-specific prompt adapters
 * Each adapter knows how to optimize prompts for its target AI model
 */

import type { PromptAdapter, ComposedPrompt } from '@/types/creative-intelligence';
import { ImagenAdapterV3 } from './imagen-adapter-v3';
import { DalleAdapterV3 } from './dalle-adapter-v3';
import { FluxAdapterV3 } from './flux-adapter-v3';

export class AdapterRegistryV3 {
  private static adapters: Map<string, PromptAdapter> = new Map();
  
  static {
    // Register all adapters
    this.register(new ImagenAdapterV3());
    this.register(new DalleAdapterV3());
    this.register(new FluxAdapterV3());
  }
  
  static register(adapter: PromptAdapter): void {
    this.adapters.set(adapter.modelFamily, adapter);
  }
  
  static get(modelFamily: string): PromptAdapter | undefined {
    return this.adapters.get(modelFamily);
  }
  
  static has(modelFamily: string): boolean {
    return this.adapters.has(modelFamily);
  }
  
  static getAll(): PromptAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  static getSupportedModels(): string[] {
    return Array.from(this.adapters.keys());
  }
}
