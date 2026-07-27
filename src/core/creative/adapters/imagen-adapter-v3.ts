/**
 * BELLA EOS - Imagen Adapter v3
 * Optimizes ComposedPrompt for Google Imagen 3
 * 
 * Strategy: Natural commercial photographic language
 * Max length: ~1800 chars (Imagen API limit)
 */

import type { PromptAdapter, ComposedPrompt } from '@/types/creative-intelligence';

export class ImagenAdapterV3 implements PromptAdapter {
  
  readonly modelFamily = 'imagen';
  readonly version = '3.0.0';
  
  /**
   * Render prompt for Google Imagen 3
   * Combines base prompt + technical specs in flowing prose
   */
  render(composed: ComposedPrompt): string {
    
    const { basePrompt, technicalSpec } = composed;
    
    const parts = [
      // Base visual description (from LLM)
      basePrompt,
      
      // Technical camera specs
      this.formatTechnicalSpec(technicalSpec),
      
      // Layout instruction
      this.formatLayoutInstruction(technicalSpec.layout),
      
      // Quality markers
      this.formatQualityMarkers(technicalSpec.quality)
    ];
    
    return parts
      .filter(Boolean)
      .join('. ')
      .replace(/\.\s*\./g, '.')  // Remove double periods
      .replace(/\s+/g, ' ')      // Normalize spaces
      .trim()
      .substring(0, 1800);       // Imagen API limit
  }
  
  /**
   * Render negative prompt
   */
  renderNegative(composed: ComposedPrompt): string {
    return composed.negativePrompt;
  }
  
  /**
   * Format technical camera specifications
   */
  private formatTechnicalSpec(spec: ComposedPrompt['technicalSpec']): string {
    const { camera } = spec;
    return `Photographed on ${camera.body} with ${camera.lens}, ${camera.depth}, ${camera.quality}`;
  }
  
  /**
   * Format layout instruction for text overlay space
   */
  private formatLayoutInstruction(layout: ComposedPrompt['technicalSpec']['layout']): string {
    return `Composition: ${layout.copySpacePercent}% of the left canvas is reserved as clean negative space for text overlay, hero subject is ${layout.subjectPlacement}-aligned following ${layout.rule.replace(/_/g, ' ')}, ${layout.perspective}`;
  }
  
  /**
   * Format quality markers
   */
  private formatQualityMarkers(quality: string): string {
    const markers: Record<string, string> = {
      'ultra_high': 'unbelievably photorealistic, 8K resolution, raytraced reflections, professional color grading',
      'cinematic': 'cinematic photography, film grain texture, professional color science',
      'editorial': 'editorial photography quality, fashion magazine standard, tack sharp',
      'high': 'professional commercial photography, high detail, clean execution',
      'standard': 'commercial photography standard'
    };
    
    return markers[quality] || markers['high'];
  }
  
  /**
   * Render metadata (for API parameters)
   */
  renderMetadata(composed: ComposedPrompt): Record<string, unknown> {
    return {
      aspectRatio: composed.technicalSpec.aspectRatio,
      outputMimeType: 'image/jpeg',
      sampleCount: 1
    };
  }
}
