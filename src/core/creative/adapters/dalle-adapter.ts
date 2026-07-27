/**
 * BELLA EOS — Creative Runtime
 * adapters/dalle-adapter.ts
 *
 * DALL-E 3 adapter (OpenAI).
 * DALL-E 3 is instruction-following — prompts should be written as detailed
 * natural language descriptions, not tag lists.
 * Max effective prompt: 4000 chars (OpenAI API limit).
 * Does not support native negative prompts.
 * Supports aspect ratios: 1024x1024 (1:1), 1792x1024 (16:9), 1024x1792 (9:16).
 */

import type { CreativePlan } from '../creative-plan';
import type { PromptAdapter, PromptAdapterCapabilities } from './prompt-adapter.interface';
import { buildStandardNegative } from './prompt-adapter.interface';

export class DalleAdapter implements PromptAdapter {
  readonly modelFamily = 'dalle';
  readonly provider    = 'openai';

  readonly capabilities: PromptAdapterCapabilities = {
    supportsNegativePrompt:     false,
    supportsAspectRatio:        true,
    supportsSeed:               false,
    supportsImageReference:     false,
    supportsStyleReference:     false,
    supportsCharacterReference: false,
    supportsMotion:             false,
    maxPromptChars:             4000,
    promptFormat:               'paragraph',
    language:                   'multilingual',
  };

  render(plan: CreativePlan): string {
    // DALL-E 3 works best with descriptive, instruction-following prose
    const sections: string[] = [];

    // Opening: narrative snapshot sets the conceptual frame
    if (plan.narrativeGraph?.imageSnapshot) {
      sections.push(`Create a photorealistic commercial photograph: ${plan.narrativeGraph.imageSnapshot}`);
    } else {
      sections.push('Create a professional commercial photograph.');
    }

    // Scene description
    const sceneParts: string[] = [];
    if (plan.scene?.environment) sceneParts.push(plan.scene.environment);
    if (plan.scene?.subjectDescription) sceneParts.push(plan.scene.subjectDescription);
    if (sceneParts.length) sections.push(`The scene shows ${sceneParts.join('. ')}`);

    // Lighting and mood
    if (plan.lighting) {
      const l = plan.lighting;
      sections.push(
        `The lighting is ${[l.keyLight, l.ambientMood, l.colorTemperature].filter(Boolean).join(', ')}.`
      );
    }

    // Camera and composition
    if (plan.camera) {
      const c = plan.camera;
      sections.push(
        `Photographed with ${c.cameraBody ?? 'a professional camera'} using ${c.lens ?? '50mm lens'} ` +
        `from a ${c.angle ?? 'eye-level'} angle${c.aperture ? ` at f/${c.aperture}` : ''}.`
      );
    }

    // Color palette
    if (plan.semanticConcept?.colorMood) {
      sections.push(`The color palette features ${plan.semanticConcept.colorMood}.`);
    }

    // Copy space instruction
    if (plan.composition?.copySpacePercent) {
      sections.push(
        `Leave ${plan.composition.copySpacePercent}% empty space on the ${plan.composition.copySpaceDirection ?? 'left'} ` +
        `side of the image for text overlay.`
      );
    }

    // Technical requirements
    sections.push(
      'Do not include any text, words, letters, numbers, writing, labels, watermarks, logos, or typographic elements anywhere in the image. ' +
      'Ultra high resolution, sharp focus, professional commercial photography quality.'
    );

    return sections.join(' ').slice(0, this.capabilities.maxPromptChars);
  }

  renderNegative(_plan: CreativePlan): string {
    return ''; // DALL-E 3 does not support negative prompts
  }

  renderMetadata(plan: CreativePlan): Record<string, unknown> {
    const sizeMap: Record<string, string> = {
      '1:1':  '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '4:3':  '1024x1024', // closest supported
      '3:4':  '1024x1792', // closest supported
    };
    return {
      size:    sizeMap[plan.format ?? '16:9'] ?? '1792x1024',
      quality: 'hd',
      style:   'natural',
    };
  }
}
