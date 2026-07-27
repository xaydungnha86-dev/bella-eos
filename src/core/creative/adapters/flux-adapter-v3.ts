/**
 * BELLA EOS - Flux Adapter v3
 * Optimizes ComposedPrompt for Flux.1 (SDXL-based)
 * 
 * Strategy: Tag-dense comma-separated keywords
 */

import type { PromptAdapter, ComposedPrompt } from '@/types/creative-intelligence';

export class FluxAdapterV3 implements PromptAdapter {
  
  readonly modelFamily = 'flux';
  readonly version = '3.0.0';
  
  /**
   * Render prompt for Flux.1
   * Extracts keywords and formats as comma-separated tags
   */
  render(composed: ComposedPrompt): string {
    
    const { basePrompt, technicalSpec } = composed;
    
    const keywords = [
      // Extract key subjects from base prompt
      ...this.extractKeywords(basePrompt),
      
      // Style and direction
      ...this.extractStyleKeywords(composed.metadata.brief.designDirection),
      
      // Camera keywords
      ...this.formatCameraKeywords(technicalSpec.camera),
      
      // Color and lighting
      ...this.formatColorKeywords(technicalSpec.palette),
      technicalSpec.layout.perspective,
      
      // Layout instruction
      `${technicalSpec.layout.copySpacePercent}% left side empty clean background`,
      'negative space for text',
      `${technicalSpec.layout.subjectPlacement} aligned`,
      
      // Quality markers
      'commercial photography',
      'professional lighting',
      'ultra detailed',
      '8K resolution',
      'sharp focus',
      'photorealistic',
      'high quality',
      
      // Anti-text markers
      'no text',
      'no letters',
      'no words',
      'no typography'
    ];
    
    // Deduplicate and join
    const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase().trim()))];
    
    return uniqueKeywords
      .filter(k => k.length > 0)
      .join(', ')
      .substring(0, 2000);  // Safe limit for Flux
  }
  
  /**
   * Render negative prompt
   */
  renderNegative(composed: ComposedPrompt): string {
    return composed.negativePrompt;
  }
  
  /**
   * Extract keywords from prose description
   */
  private extractKeywords(prose: string): string[] {
    const keywords: string[] = [];
    
    // Extract noun phrases (capitalized words + following lowercase words)
    const nounPhrases = prose.match(/\b[A-Z][a-z]+(?:\s+[a-z]+){0,3}\b/g) || [];
    keywords.push(...nounPhrases.slice(0, 15));
    
    // Extract quality adjectives
    const qualityWords = prose.match(/\b(luxury|premium|modern|elegant|sleek|refined|sophisticated|pristine|exquisite|professional|commercial|high-end|ultra|delicate|polished|smooth|rich|warm|soft|ambient|dramatic|cinematic|editorial)\b/gi) || [];
    keywords.push(...qualityWords);
    
    // Extract material/texture words
    const materials = prose.match(/\b(marble|glass|wood|metal|chrome|gold|silver|ceramic|stone|fabric|leather|silk|linen|cotton|bamboo|granite|porcelain)\b/gi) || [];
    keywords.push(...materials);
    
    // Extract lighting words
    const lighting = prose.match(/\b(lighting|glow|illuminated|backlit|spotlight|ambient|natural light|studio|golden hour|sunset|sunrise|volumetric|rim light)\b/gi) || [];
    keywords.push(...lighting);
    
    return keywords.slice(0, 20);  // Limit to prevent prompt overflow
  }
  
  /**
   * Extract style keywords from design direction
   */
  private extractStyleKeywords(designDirection: string): string[] {
    const keywords: string[] = [];
    
    const direction = designDirection.toLowerCase();
    
    // Style mappings
    if (direction.includes('luxury')) keywords.push('luxury style', 'premium aesthetic', 'high-end');
    if (direction.includes('minimalist')) keywords.push('minimalist', 'clean', 'simple');
    if (direction.includes('tech')) keywords.push('tech style', 'modern', 'futuristic');
    if (direction.includes('cyber')) keywords.push('cyberpunk', 'neon', 'sci-fi');
    if (direction.includes('editorial')) keywords.push('editorial', 'fashion', 'magazine quality');
    if (direction.includes('corporate')) keywords.push('corporate', 'professional', 'business');
    if (direction.includes('wellness')) keywords.push('wellness', 'spa', 'serene');
    
    return keywords;
  }
  
  /**
   * Format camera specs as keywords
   */
  private formatCameraKeywords(camera: ComposedPrompt['technicalSpec']['camera']): string[] {
    const keywords: string[] = [];
    
    // Extract camera brand
    const brand = camera.body.split(' ')[0];
    keywords.push(brand);
    
    // Extract lens focal length
    const focalMatch = camera.lens.match(/(\d+)mm/);
    if (focalMatch) {
      keywords.push(`${focalMatch[1]}mm lens`);
    }
    
    // Extract aperture
    const apertureMatch = camera.lens.match(/f\/([\d.]+)/);
    if (apertureMatch) {
      keywords.push(`f/${apertureMatch[1]}`);
    }
    
    // Depth keywords
    if (camera.depth.includes('shallow')) keywords.push('shallow depth of field', 'bokeh');
    if (camera.depth.includes('deep')) keywords.push('deep focus');
    
    return keywords;
  }
  
  /**
   * Format color palette as keywords
   */
  private formatColorKeywords(palette: ComposedPrompt['technicalSpec']['palette']): string[] {
    const keywords: string[] = [];
    
    // Color mood keywords
    keywords.push(...palette.mood);
    
    // Specific color references
    if (palette.primary.includes('06') || palette.primary.includes('0A')) {
      keywords.push('dark tones', 'deep colors');
    }
    
    if (palette.accent.includes('D4') || palette.accent.includes('FF')) {
      keywords.push('gold accents', 'warm highlights');
    }
    
    if (palette.accent.includes('00D') || palette.accent.includes('00F')) {
      keywords.push('cyan accents', 'cool highlights');
    }
    
    return keywords;
  }
  
  /**
   * Render metadata (for API parameters)
   */
  renderMetadata(composed: ComposedPrompt): Record<string, unknown> {
    // Flux size mapping
    const sizeMap: Record<string, string> = {
      '16:9': 'landscape_16_9',
      '1:1': 'square',
      '9:16': 'portrait_9_16',
      '4:3': 'landscape_4_3'
    };
    
    return {
      image_size: sizeMap[composed.technicalSpec.aspectRatio] || 'landscape_16_9',
      num_inference_steps: 4,  // Flux Schnell optimized
      guidance_scale: 3.5
    };
  }
}
