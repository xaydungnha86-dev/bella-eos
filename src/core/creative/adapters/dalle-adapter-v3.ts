/**
 * BELLA EOS - DALL-E 3 Adapter v3
 * Optimizes ComposedPrompt for OpenAI DALL-E 3
 * 
 * Strategy: Descriptive paragraph + explicit spatial instructions + avoidance clause
 */

import type { PromptAdapter, ComposedPrompt } from '@/types/creative-intelligence';

export class DalleAdapterV3 implements PromptAdapter {
  
  readonly modelFamily = 'dalle';
  readonly version = '3.0.0';
  
  /**
   * Render prompt for DALL-E 3
   * Uses paragraph format with explicit spatial instructions
   */
  render(composed: ComposedPrompt): string {
    
    const { basePrompt, technicalSpec } = composed;
    
    // Opening statement
    const intro = 'A high-quality commercial photographic background image for a marketing campaign banner.';
    
    // Main visual description (from LLM)
    const mainDescription = basePrompt;
    
    // Explicit spatial instruction for text overlay
    const spatialInstruction = `The composition reserves the left ${technicalSpec.layout.copySpacePercent}% of the image as clean, uncluttered negative space specifically for text overlay placement. The hero visual subject is positioned on the ${technicalSpec.layout.subjectPlacement} side of the frame, creating a balanced ${technicalSpec.layout.rule.replace(/_/g, ' ')} composition.`;
    
    // Technical photography note
    const technicalNote = this.formatTechnicalSpec(technicalSpec);
    
    // Explicit avoidance instruction
    const avoidance = 'Do not include any text, words, letters, numbers, typography, labels, watermarks, logos, brand names, or written language anywhere in the image. The image must be purely visual with no textual elements.';
    
    return [
      intro,
      mainDescription,
      spatialInstruction,
      technicalNote,
      avoidance
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Render negative prompt (DALL-E 3 doesn't officially support this, but included for completeness)
   */
  renderNegative(composed: ComposedPrompt): string {
    return composed.negativePrompt;
  }
  
  /**
   * Format technical specifications
   */
  private formatTechnicalSpec(spec: ComposedPrompt['technicalSpec']): string {
    const { camera, quality } = spec;
    
    const parts = [
      `Photographed on ${camera.body} with ${camera.lens}`,
      camera.depth,
      this.formatQualityNote(quality)
    ];
    
    return parts.filter(Boolean).join(', ') + '.';
  }
  
  /**
   * Format quality note for DALL-E 3
   */
  private formatQualityNote(quality: string): string {
    const notes: Record<string, string> = {
      'ultra_high': 'ultra-high resolution, photorealistic quality',
      'cinematic': 'cinematic photography quality',
      'editorial': 'editorial photography standard',
      'high': 'professional photography quality',
      'standard': 'commercial photography standard'
    };
    
    return notes[quality] || notes['high'];
  }
  
  /**
   * Render metadata (for API parameters)
   */
  renderMetadata(composed: ComposedPrompt): Record<string, unknown> {
    // DALL-E 3 size mapping
    const sizeMap: Record<string, string> = {
      '16:9': '1792x1024',
      '1:1': '1024x1024',
      '9:16': '1024x1792',
      '4:3': '1792x1024'  // Closest available
    };
    
    return {
      model: 'dall-e-3',
      size: sizeMap[composed.technicalSpec.aspectRatio] || '1792x1024',
      quality: 'hd',
      n: 1
    };
  }
}
