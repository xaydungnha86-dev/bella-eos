/**
 * BELLA EOS — Creative Runtime
 * adapters/prompt-adapter.interface.ts
 *
 * PromptAdapter — converts a sealed CreativePlan into a model-specific prompt string.
 * Each model family has its own format, constraints, and special capabilities.
 *
 * Adapters are pure renderers: they READ from CreativePlan and return strings.
 * They never modify state. They run AFTER all planners complete.
 */

import type { CreativePlan } from '../creative-plan';

export interface PromptAdapterCapabilities {
  supportsNegativePrompt:     boolean;
  supportsAspectRatio:        boolean;
  supportsSeed:               boolean;
  supportsImageReference:     boolean;   // img2img
  supportsStyleReference:     boolean;   // Midjourney --sref
  supportsCharacterReference: boolean;   // Midjourney --cref
  supportsMotion:             boolean;   // Veo, Sora, Kling
  maxPromptChars:             number;
  promptFormat:               'natural' | 'tags' | 'paragraph' | 'weighted';
  language:                   'english-only' | 'multilingual';
}

export interface PromptAdapter {
  readonly modelFamily:  string;   // 'imagen' | 'flux' | 'dalle' | 'midjourney' | 'veo'
  readonly provider:     string;   // 'google' | 'fal' | 'openai' | 'anthropic'
  readonly capabilities: PromptAdapterCapabilities;

  /** Render the main positive prompt for this model. Always returns English. */
  render(plan: CreativePlan): string;

  /** Render the negative prompt (returns '' if not supported). */
  renderNegative(plan: CreativePlan): string;

  /** Render model-specific parameters (aspect ratio, seed, etc.). */
  renderMetadata(plan: CreativePlan): Record<string, unknown>;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Build the core visual description block shared by all adapters. */
export function buildCoreDescription(plan: CreativePlan): string {
  const parts: string[] = [];

  // Scene opener from narrative (highest priority)
  if (plan.narrativeGraph?.imageSnapshot) {
    parts.push(plan.narrativeGraph.imageSnapshot);
  }

  // Scene environment
  if (plan.scene?.environment) parts.push(plan.scene.environment);
  if (plan.scene?.subjectDescription) parts.push(plan.scene.subjectDescription);

  // Lighting
  if (plan.lighting) {
    const l = plan.lighting;
    const lightDesc = [l.keyLight, l.ambientMood, l.colorTemperature].filter(Boolean).join(', ');
    if (lightDesc) parts.push(`Lighting: ${lightDesc}`);
  }

  // Camera
  if (plan.camera) {
    const c = plan.camera;
    parts.push(`Shot on ${c.cameraBody ?? 'professional camera'}, ${c.lens ?? '50mm'}, ${c.angle ?? 'eye-level'}`);
  }

  // Style
  if (plan.styleId) {
    parts.push(`Visual style: ${plan.styleId}`);
  }

  // Semantic color mood (from SemanticConcept)
  if (plan.semanticConcept?.colorMood) {
    parts.push(`Color palette: ${plan.semanticConcept.colorMood}`);
  }

  return parts.filter(Boolean).join('. ');
}

/** Standard negative prompt shared across imagen-class models. */
export function buildStandardNegative(plan: CreativePlan): string {
  const base = [
    'text', 'words', 'letters', 'watermark', 'logo', 'signature', 'caption',
    'blurry', 'out of focus', 'noise', 'grain', 'low quality', 'pixelated',
    'oversaturated', 'distorted', 'deformed', 'ugly', 'amateur',
    'cartoon', 'anime', 'illustration', 'painting', 'sketch',
    'split image', 'collage', 'frame', 'border',
  ];

  // Add style-specific negatives
  if (plan.styleId?.includes('luxury') || plan.styleId?.includes('premium')) {
    base.push('cheap', 'plastic', 'glossy', 'fake', 'tacky');
  }
  if (plan.styleId?.includes('minimal') || plan.styleId?.includes('clean')) {
    base.push('cluttered', 'busy', 'crowded', 'noisy background');
  }

  return base.join(', ');
}
