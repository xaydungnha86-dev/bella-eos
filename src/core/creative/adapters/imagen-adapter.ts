/**
 * BELLA EOS — Creative Runtime
 * adapters/imagen-adapter.ts
 *
 * Imagen 3 adapter (Google DeepMind).
 * Constraints:
 *   - English only (hard requirement)
 *   - Natural paragraph format (no tags)
 *   - Max ~2000 chars (effective limit ~1500 for best results)
 *   - No native negative prompt support (use avoid_entities parameter instead)
 *   - Supports aspect_ratio: 1:1, 3:4, 4:3, 9:16, 16:9
 */

import type { CreativePlan } from '../creative-plan';
import type { PromptAdapter, PromptAdapterCapabilities } from './prompt-adapter.interface';
import { buildCoreDescription, buildStandardNegative } from './prompt-adapter.interface';

export class ImagenAdapter implements PromptAdapter {
  readonly modelFamily = 'imagen';
  readonly provider    = 'google';

  readonly capabilities: PromptAdapterCapabilities = {
    supportsNegativePrompt:     false,  // Imagen uses avoid_entities, not negative prompt
    supportsAspectRatio:        true,
    supportsSeed:               true,
    supportsImageReference:     false,
    supportsStyleReference:     false,
    supportsCharacterReference: false,
    supportsMotion:             false,
    maxPromptChars:             1800,
    promptFormat:               'natural',
    language:                   'english-only',
  };

  render(plan: CreativePlan): string {
    const parts: string[] = [];

    // 1. Narrative image snapshot (highest signal — sets the scene)
    if (plan.narrativeGraph?.imageSnapshot) {
      parts.push(plan.narrativeGraph.imageSnapshot);
    } else if (plan.scene?.environment) {
      parts.push(plan.scene.environment);
    }

    // 2. Subject
    if (plan.scene?.subjectDescription) {
      parts.push(plan.scene.subjectDescription);
    }

    // 3. Lighting
    if (plan.lighting) {
      const { keyLight, ambientMood, colorTemperature, softness } = plan.lighting;
      const lightParts = [keyLight, ambientMood, colorTemperature, softness].filter(Boolean);
      if (lightParts.length) parts.push(`Lighting: ${lightParts.join(', ')}.`);
    }

    // 4. Camera
    if (plan.camera) {
      const { cameraBody, lens, angle, aperture } = plan.camera;
      const camParts = [
        cameraBody && `Shot on ${cameraBody}`,
        lens,
        aperture && `f/${aperture}`,
        angle && `${angle} angle`,
      ].filter(Boolean);
      if (camParts.length) parts.push(camParts.join(', ') + '.');
    }

    // 5. Color and mood
    if (plan.semanticConcept?.colorMood) {
      parts.push(`Color palette: ${plan.semanticConcept.colorMood}.`);
    }

    // 6. Copy space
    if (plan.composition?.copySpacePercent) {
      const direction = plan.composition.copySpaceDirection ?? 'left';
      parts.push(`Clear ${plan.composition.copySpacePercent}% copy space on the ${direction} side.`);
    }

    // 7. Quality tags (Imagen responds well to these)
    parts.push(
      'Photorealistic. Professional commercial photography. Ultra high resolution.',
      'Sharp focus. Premium quality. NO text, NO watermarks, NO overlaid graphics.'
    );

    const prompt = parts.filter(Boolean).join(' ');
    return prompt.slice(0, this.capabilities.maxPromptChars);
  }

  renderNegative(_plan: CreativePlan): string {
    // Imagen 3 does not use negative prompts directly.
    // The avoid_entities array is passed in renderMetadata instead.
    return '';
  }

  renderMetadata(plan: CreativePlan): Record<string, unknown> {
    const aspectRatioMap: Record<string, string> = {
      '16:9': '16:9', '9:16': '9:16', '1:1': '1:1', '4:3': '4:3', '3:4': '3:4',
    };
    return {
      aspect_ratio:   aspectRatioMap[plan.format ?? '16:9'] ?? '16:9',
      avoid_entities: buildStandardNegative(plan).split(', ').slice(0, 20),
    };
  }
}
