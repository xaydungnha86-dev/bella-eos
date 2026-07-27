/**
 * BELLA EOS — Creative Runtime
 * adapters/flux-adapter.ts
 *
 * FLUX adapter (Black Forest Labs via fal.ai).
 * FLUX responds best to dense, descriptive natural language.
 * Supports native negative prompts, image references, and style references.
 * Max effective prompt: ~2000 chars.
 */

import type { CreativePlan } from '../creative-plan';
import type { PromptAdapter, PromptAdapterCapabilities } from './prompt-adapter.interface';
import { buildCoreDescription, buildStandardNegative } from './prompt-adapter.interface';

export class FluxAdapter implements PromptAdapter {
  readonly modelFamily = 'flux';
  readonly provider    = 'fal';

  readonly capabilities: PromptAdapterCapabilities = {
    supportsNegativePrompt:     true,
    supportsAspectRatio:        true,
    supportsSeed:               true,
    supportsImageReference:     true,
    supportsStyleReference:     false,
    supportsCharacterReference: false,
    supportsMotion:             false,
    maxPromptChars:             2000,
    promptFormat:               'natural',
    language:                   'multilingual',
  };

  render(plan: CreativePlan): string {
    const parts: string[] = [];

    // 1. Narrative image snapshot
    if (plan.narrativeGraph?.imageSnapshot) {
      parts.push(plan.narrativeGraph.imageSnapshot);
    }

    // 2. Style prefix (FLUX responds well to visual style declarations upfront)
    const styleTerms = this.buildStyleTerms(plan);
    if (styleTerms) parts.push(styleTerms);

    // 3. Environment + subject
    if (plan.scene?.environment) parts.push(plan.scene.environment);
    if (plan.scene?.subjectDescription) parts.push(plan.scene.subjectDescription);

    // 4. Lighting detail
    if (plan.lighting) {
      const l = plan.lighting;
      parts.push(`${l.keyLight ?? 'professional lighting'}, ${l.ambientMood ?? ''}, ${l.colorTemperature ?? ''}`.trim().replace(/,\s*$/, ''));
    }

    // 5. Camera
    if (plan.camera) {
      const c = plan.camera;
      parts.push(`${c.cameraBody ?? 'professional camera'} ${c.lens ?? '50mm'} ${c.aperture ? `f/${c.aperture}` : ''} ${c.angle ?? ''} perspective`.trim());
    }

    // 6. Color mood from semantic concept
    if (plan.semanticConcept?.colorMood) {
      parts.push(plan.semanticConcept.colorMood);
    }

    // 7. Copy space
    if (plan.composition?.copySpacePercent) {
      parts.push(`${plan.composition.copySpacePercent}% empty copy space on ${plan.composition.copySpaceDirection ?? 'left'}`);
    }

    // 8. Quality suffix
    parts.push('ultra detailed, sharp focus, professional commercial photography, 8k resolution');

    const prompt = parts.filter(p => p.trim()).join(', ');
    return prompt.slice(0, this.capabilities.maxPromptChars);
  }

  renderNegative(plan: CreativePlan): string {
    return buildStandardNegative(plan);
  }

  renderMetadata(plan: CreativePlan): Record<string, unknown> {
    const ratioMap: Record<string, string> = {
      '16:9': '16:9', '9:16': '9:16', '1:1': '1:1', '4:3': '4:3', '3:4': '3:4',
    };
    return {
      image_size:       ratioMap[plan.format ?? '16:9'] ?? '16:9',
      num_inference_steps: 28,
      guidance_scale:   3.5,
    };
  }

  private buildStyleTerms(plan: CreativePlan): string {
    const terms: string[] = [];
    if (plan.styleId?.includes('luxury') || plan.styleId?.includes('premium')) {
      terms.push('luxury editorial aesthetic', 'premium commercial');
    } else if (plan.styleId?.includes('minimal')) {
      terms.push('clean minimalist', 'editorial clean');
    } else if (plan.styleId?.includes('cyber')) {
      terms.push('cyberpunk aesthetic', 'neon-lit');
    } else if (plan.styleId?.includes('corporate')) {
      terms.push('professional corporate', 'polished business');
    }
    if (plan.lighting?.style === 'cinematic') terms.push('cinematic lighting');
    return terms.join(', ');
  }
}
