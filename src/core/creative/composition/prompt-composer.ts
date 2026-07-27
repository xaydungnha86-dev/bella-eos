/**
 * BELLA EOS - Prompt Composer
 * Layer 3: Prompt Composition (Visual Language Synthesis)
 * 
 * Responsibility: Transform Creative Brief into rich visual prompt
 * Uses LLM to compose natural photographic language
 */

import type { 
  CreativeBrief,
  ComposedPrompt,
  CameraProfile,
  ColorPalette,
  LayoutSpec,
  ImageFormat
} from '@/types/creative-intelligence';

export class PromptComposer {
  
  /**
   * Compose visual prompt from Creative Brief
   */
  async compose(
    brief: CreativeBrief, 
    format: ImageFormat | string
  ): Promise<ComposedPrompt> {
    
    console.log('[PromptComposer] Composing visual prompt from brief...');
    
    // Normalize format
    const normalizedFormat: ImageFormat = typeof format === 'string' 
      ? { aspectRatio: format as any }
      : format;
    
    // Compose base visual prompt using LLM
    const basePrompt = await this.composeVisualLanguage(brief);
    
    // Derive technical specifications
    const technicalSpec = this.deriveTechnicalSpec(brief, normalizedFormat);
    
    // Compose negative prompt
    const negativePrompt = this.composeNegativePrompt(brief);
    
    console.log('[PromptComposer] Prompt composed:', {
      basePromptLength: basePrompt.length,
      cameraBody: technicalSpec.camera.body,
      aspectRatio: technicalSpec.aspectRatio
    });
    
    return {
      basePrompt,
      technicalSpec,
      negativePrompt,
      metadata: {
        brief,
        format: normalizedFormat,
        composedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Compose visual language using LLM
   */
  private async composeVisualLanguage(brief: CreativeBrief): Promise<string> {
    
    const composerPrompt = `You are a professional AI Art Director specializing in commercial photography prompts.

## CREATIVE BRIEF
Campaign Goal: ${brief.campaignGoal}
Target Audience: ${brief.targetAudience}
Emotional Tone: ${brief.emotionalTone}
Visual Story: ${brief.visualStory}
Design Direction: ${brief.designDirection}

## EXECUTION DETAILS
Hero Subject: ${brief.heroSubject}
Environment: ${brief.environmentDescription}
Color Mood: ${brief.colorMood}
Lighting Mood: ${brief.lightingMood}
Composition: ${brief.compositionRule}

## KEY MESSAGE
${brief.keyMessage}

## THINGS TO AVOID
${brief.avoidances.map(a => `- ${a}`).join('\n')}

## YOUR TASK
Write a rich, detailed, photographic-quality visual prompt description for an AI image generator.

CRITICAL RULES:
1. Write in natural, flowing commercial photography language (NOT bullet points or lists)
2. Focus ONLY on VISUAL elements - what the camera actually sees
3. Include atmospheric details (lighting quality, textures, mood, depth)
4. Specify composition clearly (subject placement, negative space for text overlay)
5. DO NOT include any text, words, letters, typography, or marketing copy in the description
6. DO NOT mention the poster headline or any written content
7. Be SPECIFIC with visual details (not "flowers" but "delicate white orchid arrangement")
8. Length: 250-400 words of pure visual description
9. Remember: 60% of LEFT side will have text overlay - keep that area clean and minimal

STRUCTURE YOUR RESPONSE AS:
1. Scene setting and environment (2-3 sentences)
2. Hero subject details (2-3 sentences)
3. Lighting and atmosphere (1-2 sentences)
4. Composition and layout (1-2 sentences)
5. Material textures and depth (1-2 sentences)

Output ONLY the visual prompt. No preamble, no metadata, no JSON, no markdown - just the flowing description.`;

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      
      if (!apiKey) {
        return this.composeFallbackPrompt(brief);
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: composerPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      const visualPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return visualPrompt.trim() || this.composeFallbackPrompt(brief);
      
    } catch (error) {
      console.warn('[PromptComposer] LLM composition failed, using fallback:', error);
      return this.composeFallbackPrompt(brief);
    }
  }
  
  /**
   * Fallback prompt composition (rule-based)
   */
  private composeFallbackPrompt(brief: CreativeBrief): string {
    
    const parts = [
      `A high-quality commercial photographic background depicting ${brief.heroSubject}.`,
      `Setting: ${brief.environmentDescription}.`,
      `The scene is bathed in ${brief.lightingMood}, creating a ${brief.colorMood} atmosphere.`,
      `The composition follows ${brief.compositionRule.replace(/_/g, ' ')}, with the left 60% of the canvas deliberately left as clean negative space for text overlay placement.`,
      `The hero visual subject is positioned on the right side of the frame, drawing the eye naturally from left to right.`,
      `Premium materials and textures are rendered with ultra-high detail.`,
      `The depth of field is carefully controlled to create visual hierarchy and focus.`,
      `This is professional commercial photography at the highest standard, suitable for premium brand marketing.`
    ];
    
    return parts.join(' ');
  }
  
  /**
   * Derive technical specifications from creative brief
   */
  private deriveTechnicalSpec(
    brief: CreativeBrief,
    format: ImageFormat
  ): ComposedPrompt['technicalSpec'] {
    
    // Select camera profile based on design direction
    const camera = this.selectCameraProfile(brief.designDirection);
    
    // Derive color palette from brief
    const palette = this.deriveColorPalette(brief.colorMood, brief.designDirection);
    
    // Derive layout specs
    const layout = this.deriveLayoutSpec(brief.compositionRule, format);
    
    return {
      camera,
      palette,
      layout,
      quality: this.deriveQualityLevel(brief.designDirection),
      aspectRatio: format.aspectRatio
    };
  }
  
  /**
   * Select camera profile based on design direction
   */
  private selectCameraProfile(designDirection: string): CameraProfile {
    
    const direction = designDirection.toLowerCase();
    
    if (direction.includes('luxury') || direction.includes('premium') || direction.includes('wellness')) {
      return {
        body: 'Hasselblad H6D-100c',
        lens: '85mm f/2.0',
        depth: 'shallow depth of field, sharp focus on subject',
        quality: 'medium format, ultra-high resolution, cinematic photography'
      };
    }
    
    if (direction.includes('editorial') || direction.includes('fashion')) {
      return {
        body: 'Phase One XF IQ4',
        lens: '110mm f/2.8',
        depth: 'selective focus with beautiful bokeh',
        quality: 'editorial photography, tack sharp, professional grade'
      };
    }
    
    if (direction.includes('tech') || direction.includes('modern') || direction.includes('cyber')) {
      return {
        body: 'Sony A7R V',
        lens: '50mm f/1.4',
        depth: 'crisp focus with dynamic perspective',
        quality: 'clean commercial photography, ultra-detailed'
      };
    }
    
    if (direction.includes('corporate') || direction.includes('professional')) {
      return {
        body: 'Nikon Z9',
        lens: '85mm f/2.2',
        depth: 'professional depth of field',
        quality: 'corporate photography standard, clean and authoritative'
      };
    }
    
    if (direction.includes('architectural') || direction.includes('real estate')) {
      return {
        body: 'Canon EOS R5',
        lens: 'Tilt-shift 24mm f/3.5',
        depth: 'deep focus, architectural perspective control',
        quality: 'architectural photography, perfectly straight lines'
      };
    }
    
    // Default: versatile commercial photography
    return {
      body: 'Canon EOS R5',
      lens: '85mm f/2.2',
      depth: 'professional depth of field',
      quality: 'commercial photography standard, photorealistic'
    };
  }
  
  /**
   * Derive color palette from mood and direction
   */
  private deriveColorPalette(
    colorMood: string,
    designDirection: string
  ): ColorPalette {
    
    const moodLower = colorMood.toLowerCase();
    const directionLower = designDirection.toLowerCase();
    
    // Luxury/Premium palettes
    if (moodLower.includes('warm') || directionLower.includes('luxury') || directionLower.includes('wellness')) {
      return {
        primary: '#061E17',  // Deep forest green
        accent: '#D4AF37',   // Royal gold
        neutral: '#F5F5F0',  // Warm white
        mood: ['warm', 'premium', 'trustworthy', 'elegant']
      };
    }
    
    // Tech/Modern palettes
    if (directionLower.includes('tech') || directionLower.includes('cyber') || directionLower.includes('modern')) {
      return {
        primary: '#0A0E27',  // Deep tech blue
        accent: '#00D9FF',   // Cyan
        neutral: '#F8F9FA',  // Cool white
        mood: ['cool', 'innovative', 'futuristic', 'precise']
      };
    }
    
    // Corporate/Professional palettes
    if (directionLower.includes('corporate') || directionLower.includes('professional')) {
      return {
        primary: '#1A1A2E',  // Corporate navy
        accent: '#0F4C81',   // Professional blue
        neutral: '#FFFFFF',  // Pure white
        mood: ['professional', 'trustworthy', 'stable', 'authoritative']
      };
    }
    
    // Default: balanced premium
    return {
      primary: '#061E17',
      accent: '#D4AF37',
      neutral: '#F5F5F0',
      mood: ['balanced', 'premium', 'versatile']
    };
  }
  
  /**
   * Derive layout specifications
   */
  private deriveLayoutSpec(
    compositionRule: CreativeBrief['compositionRule'],
    format: ImageFormat
  ): LayoutSpec {
    
    // Base layout on composition rule
    switch (compositionRule) {
      case 'golden_ratio':
        return {
          copySpacePercent: 62,
          subjectPlacement: 'right',
          rule: 'golden_ratio',
          perspective: 'slightly elevated angle, phi ratio composition',
          leadingLines: 'natural flow lines guiding eye from left negative space to right focal point'
        };
      
      case 'centered':
        return {
          copySpacePercent: 50,
          subjectPlacement: 'center',
          rule: 'centered',
          perspective: 'perfectly level, symmetrical composition',
          leadingLines: 'radial balance from center outward'
        };
      
      case 'asymmetric':
        return {
          copySpacePercent: 65,
          subjectPlacement: 'right',
          rule: 'asymmetric',
          perspective: 'dynamic angle with intentional imbalance',
          leadingLines: 'diagonal tension lines creating visual interest'
        };
      
      case 'diagonal':
        return {
          copySpacePercent: 55,
          subjectPlacement: 'right',
          rule: 'diagonal',
          perspective: '15-degree tilt, dynamic diagonal composition',
          leadingLines: 'strong diagonal lines from lower left to upper right'
        };
      
      case 'frame_within_frame':
        return {
          copySpacePercent: 58,
          subjectPlacement: 'right',
          rule: 'frame_within_frame',
          perspective: 'layered depth with natural framing elements',
          leadingLines: 'architectural or natural elements creating frame'
        };
      
      case 'rule_of_thirds':
      default:
        return {
          copySpacePercent: 60,
          subjectPlacement: 'right',
          rule: 'rule_of_thirds',
          perspective: 'slight 5-degree upward tilt, aspirational and intimate',
          leadingLines: 'surface edges and light gradients guiding eye from left to right third'
        };
    }
  }
  
  /**
   * Derive quality level from design direction
   */
  private deriveQualityLevel(designDirection: string): ComposedPrompt['technicalSpec']['quality'] {
    
    const direction = designDirection.toLowerCase();
    
    if (direction.includes('luxury') || direction.includes('premium') || direction.includes('editorial')) {
      return 'ultra_high';
    }
    
    if (direction.includes('cinematic') || direction.includes('fashion')) {
      return 'cinematic';
    }
    
    if (direction.includes('tech') || direction.includes('corporate')) {
      return 'high';
    }
    
    return 'high';
  }
  
  /**
   * Compose negative prompt from brief avoidances
   */
  private composeNegativePrompt(brief: CreativeBrief): string {
    
    const universalNegatives = [
      'text',
      'words',
      'letters',
      'typography',
      'font',
      'written language',
      'logo',
      'brand name',
      'watermark',
      'signature',
      'stamp',
      'label',
      'deformed anatomy',
      'extra limbs',
      'duplicate objects',
      'motion blur',
      'camera shake',
      'out-of-focus foreground',
      'low quality',
      'pixelated',
      'jpeg artifact',
      'noise',
      'grain',
      'bad composition',
      'tilted horizon',
      'cropped poorly'
    ];
    
    // Add brief-specific avoidances
    const briefNegatives = brief.avoidances.map(avoid => {
      // Convert descriptive avoidances to keywords
      return avoid.toLowerCase()
        .replace(/generic\s+stock\s+photos?/g, 'generic stock photo, posed people')
        .replace(/too\s+much\s+text/g, 'text overlay, written words')
        .replace(/low\s+quality/g, 'low resolution, blurry')
        .replace(/cluttered/g, 'cluttered, messy, chaotic')
        .replace(/clinical/g, 'clinical, sterile, cold')
        .trim();
    });
    
    // Combine and deduplicate
    const allNegatives = [...universalNegatives, ...briefNegatives.join(', ').split(',')];
    const uniqueNegatives = [...new Set(allNegatives.map(n => n.trim()))];
    
    return uniqueNegatives.join(', ');
  }
}
