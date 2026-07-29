/**
 * BELLA EOS - Expert Design Prompt Composer
 * Layer 3.5: Professional Design Prompt Synthesis
 * 
 * Responsibility: Transform Creative Brief into expert-level design prompts
 * that tell AI models EXACTLY how to render text, layout, and visuals
 * like a professional graphic designer would.
 * 
 * This replaces Canvas Compositor - AI now renders EVERYTHING including text.
 */

import type { CreativeBrief } from '@/types/creative-intelligence';

export interface ExpertDesignPrompt {
  mainPrompt: string;           // Full detailed prompt for AI model (500-800 words)
  layoutInstructions: string;   // Specific layout & composition rules
  typographySpec: string;       // Font, size, weight, color specifications
  textContent: {
    headline: string;
    bullets: string[];
    cta: string;
    badge: string;
  };
  negativePrompt: string;
  confidence: number;
}

export class ExpertPromptComposer {
  
  /**
   * Compose expert-level design prompt that includes EVERYTHING:
   * - Visual scene description
   * - Text content and positioning
   * - Typography specifications
   * - Layout rules
   * - Color scheme
   */
  static async compose(
    creativeBrief: CreativeBrief,
    businessContext: {
      objective: string;
      industry: string;
      brandName: string;
      targetAudience: string;
      keyMetrics?: {
        revenue?: string;
        customers?: number;
        growthRate?: string;
      };
    },
    brandDna: {
      brandName: string;
      voiceTone: string;
      visualStyle: string;
      colors: {
        primary: string;
        accent: string;
      };
    }
  ): Promise<ExpertDesignPrompt> {
    
    console.log('[ExpertPromptComposer] Composing expert design prompt...');
    
    // Extract key data
    const { posterHeadline, keyBenefits, callToAction, heroSubject, environmentDescription, colorMood, lightingMood } = creativeBrief;
    const { brandName } = brandDna;
    
    // Ensure we have all required text content
    const bullets = keyBenefits || this.generateDefaultBullets(businessContext.industry);
    const cta = callToAction || 'ĐĂNG KÝ NGAY';
    const badge = this.generateOfferBadge(businessContext.objective);
    
    // Compose main prompt with text rendering instructions
    const mainPrompt = this.buildMainPrompt({
      creativeBrief,
      businessContext,
      brandDna,
      textContent: {
        headline: posterHeadline,
        bullets,
        cta,
        badge
      }
    });
    
    // Layout instructions
    const layoutInstructions = this.buildLayoutInstructions(creativeBrief);
    
    // Typography specifications
    const typographySpec = this.buildTypographySpec(brandDna, creativeBrief);
    
    // Negative prompt
    const negativePrompt = this.buildNegativePrompt(creativeBrief);
    
    console.log('[ExpertPromptComposer] ✓ Expert prompt composed');
    console.log(`[ExpertPromptComposer] Headline: "${posterHeadline}"`);
    console.log(`[ExpertPromptComposer] Bullets: ${bullets.length} items`);
    console.log(`[ExpertPromptComposer] CTA: "${cta}"`);
    
    return {
      mainPrompt,
      layoutInstructions,
      typographySpec,
      textContent: {
        headline: posterHeadline,
        bullets,
        cta,
        badge
      },
      negativePrompt,
      confidence: creativeBrief.confidenceScore || 0.85
    };
  }
  
  /**
   * Build comprehensive main prompt with text rendering instructions
   */
  private static buildMainPrompt(params: {
    creativeBrief: CreativeBrief;
    businessContext: any;
    brandDna: any;
    textContent: {
      headline: string;
      bullets: string[];
      cta: string;
      badge: string;
    };
  }): string {
    
    const { creativeBrief, businessContext, brandDna, textContent } = params;
    const { heroSubject, environmentDescription, colorMood, lightingMood, emotionalTone } = creativeBrief;
    const { brandName, colors } = brandDna;
    
    // Convert hex colors to descriptive names
    const primaryColorName = this.hexToColorName(colors.primary);
    const accentColorName = this.hexToColorName(colors.accent);
    
    // Generate variation modifiers for creative diversity
    const variationModifiers = this.generateVariationModifiers();
    
    console.log('[ExpertPromptComposer] 🎨 Variation applied for natural diversity');
    console.log('[ExpertPromptComposer] 🎨 AI has creative freedom for layout');
    
    // Add strong variation seed for visual diversity
    const variationSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    return `Create a professional marketing banner for ${brandName} (${businessContext.industry} industry).

**VARIATION SEED**: ${variationSeed}
**CREATIVE DIRECTIVE**: Create a unique visual composition that feels fresh and different from previous designs. Use your artistic judgment to arrange elements in an aesthetically pleasing way.

VISUAL SCENE:
${heroSubject} placed in ${environmentDescription}. The scene should evoke ${emotionalTone} emotions. 
- Lighting: ${lightingMood}
- Color mood: ${colorMood} with emphasis on ${primaryColorName} and ${accentColorName} tones
- Visual story: ${creativeBrief.visualStory}

${variationModifiers.visualGuidance}

FORMAT & QUALITY:
- Horizontal banner in 16:9 aspect ratio (1792x1024px or similar)
- High resolution 4K quality
- Professional commercial photography aesthetic
- Sharp focus with appropriate depth of field
- Clean, premium composition

TEXT CONTENT TO INCLUDE (render these texts clearly and elegantly):

1. LOGO BADGE: "${brandName.toUpperCase()}"
   Small badge with ${accentColorName} background, white text

2. PROMOTIONAL BADGE: "${textContent.badge}"
   Badge with white or accent background

3. MAIN HEADLINE: "${textContent.headline}"
   Large, bold, dominant text - this is the HERO element
   White color with shadow for readability

4. KEY BENEFITS:
   - ✓ ${textContent.bullets[0]}
   - ✓ ${textContent.bullets[1]}
   - ✓ ${textContent.bullets[2]}
   Medium size, clean typography, checkmarks included

5. CALL-TO-ACTION: "${textContent.cta}"
   Prominent button with vibrant gradient (pink to red)
   Bold uppercase white text with arrow symbol →

LAYOUT FREEDOM:
You have complete creative freedom to arrange these elements. Choose text positions (left, right, center, overlay) that create the most beautiful and effective composition. Ensure excellent readability with appropriate contrast, gradients, or overlays as needed.

DESIGN PRINCIPLES:
- Professional graphic design quality
- Clear visual hierarchy (headline dominant → benefits → CTA)
- Excellent text legibility (crisp rendering, strong contrast)
- Natural integration of text with visual scene
- Comfortable margins and breathing space
- Brand colors: ${colors.primary} and ${colors.accent}

IMPORTANT:
- Render ALL text content clearly (no placeholder text)
- Create unique composition different from standard layouts
- Ensure professional quality matching ${brandName} premium brand identity
- DO NOT show dimension annotations, measurements, or technical specs`;
  }
  
  /**
   * Build layout instructions - simplified to let AI create natural variations
   */
  private static buildLayoutInstructions(brief: CreativeBrief): string {
    // Add variation seed to encourage different layouts each time
    const variationSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    console.log('[ExpertPromptComposer] 🎨 Layout variation seed:', variationSeed);
    
    return `Layout Approach: Natural creative freedom with professional composition rules

**VARIATION SEED**: ${variationSeed}
Use this seed to create a unique layout composition that differs from previous generations.

Layout Guidelines (AI has creative freedom):
- Horizontal banner format in 16:9 aspect ratio
- Professional composition following design best practices
- Balance between visual elements and text content
- Clear visual hierarchy with main subject and text overlay areas
- Text should be clearly readable with appropriate contrast
- Use dark gradients or overlays where needed for text legibility
- All required elements must be included: Logo, Offer badge, Headline, Bullets, CTA button
- Maintain breathing space with comfortable margins
- Create visual flow guiding eye through: Logo → Headline → Benefits → Call-to-Action

AI Creative Freedom:
- Choose optimal text positioning (left, right, center, overlay) based on visual composition
- Arrange text elements in the most aesthetically pleasing way
- Adjust gradient overlays to ensure text readability while maintaining visual appeal
- Position hero subject/product to create dynamic and engaging composition
- Use typography hierarchy to guide viewer attention naturally`;
  }
  
  /**
   * Build typography specifications
   */
  private static buildTypographySpec(brandDna: any, brief: CreativeBrief): string {
    return `Typography System:
- Headline: Sans-serif Bold, 52px, White, Heavy shadow
- Subheadline: Sans-serif Regular, 28px, White 90% opacity
- Body (bullets): Sans-serif Regular, 22px, White 95% opacity
- CTA: Sans-serif Bold, 24px, White, All caps
- Badge: Sans-serif Bold, 16-18px, Brand colors

Font Pairing: Modern sans-serif for clean, professional look
Hierarchy: Clear size differentiation (52px → 28px → 22px → 18px)
Readability: All text has drop shadow or background for contrast`;
  }
  
  /**
   * Build negative prompt
   */
  private static buildNegativePrompt(brief: CreativeBrief): string {
    const baseNegative = [
      'blurry text',
      'unreadable text',
      'distorted text',
      'misspelled words',
      'incorrect text',
      'placeholder text',
      'lorem ipsum',
      'watermark',
      'low quality',
      'pixelated',
      'amateur design',
      'cluttered composition',
      'too many elements',
      'generic stock photos',
      'bad typography',
      'poor contrast',
      'oversaturated colors',
      'noisy background',
      'visible pixel measurements',
      'dimension annotations',
      'technical specifications visible',
      'px numbers',
      'size labels',
      'measurement overlays',
      'grid lines',
      'ruler marks'
    ];
    
    // Add brief-specific avoidances
    const customAvoidances = brief.avoidances || [];
    
    return [...baseNegative, ...customAvoidances].join(', ');
  }
  
  /**
   * Generate variation modifiers to ensure each generation is visually unique
   */
  private static generateVariationModifiers(): { directive: string; visualGuidance: string } {
    const perspectives = [
      { directive: 'Slightly elevated perspective (eye level + 15 degrees)', guidance: 'Camera positioned at a subtle elevated angle showing both surface and slight depth' },
      { directive: 'Ground level perspective with upward tilt', guidance: 'Low angle camera looking slightly upward, creating sense of scale and presence' },
      { directive: 'Top-down perspective with 30-degree tilt', guidance: 'Overhead view with angled perspective, revealing spatial arrangement and context' },
      { directive: 'Straight-on eye-level perspective', guidance: 'Direct frontal view at natural eye level, creating intimate connection with subject' },
      { directive: 'Diagonal composition with dynamic angle', guidance: 'Subject positioned on diagonal axis, creating visual movement and energy' }
    ];
    
    const lightingStyles = [
      'Soft diffused studio lighting from top-left, creating gentle shadows and form definition',
      'Dramatic side lighting creating strong contrast and depth, shadows falling toward right',
      'Three-point lighting setup with key light, fill light, and subtle rim light for professional polish',
      'Natural window light simulation with soft edge shadows and warm quality',
      'Backlit setup with rim lighting creating glowing edges and depth separation'
    ];
    
    const depthStyles = [
      'Shallow depth of field (f/2.8) with subject in sharp focus and background softly blurred',
      'Medium depth of field (f/5.6) with subject crisp and background context partially visible',
      'Deep focus (f/11) with entire scene sharp from foreground to background',
      'Selective focus on hero element with gradual falloff creating visual hierarchy',
      'Bokeh background with circular blur creating premium aesthetic and focus isolation'
    ];
    
    const colorTemperatures = [
      'Warm color temperature (3200K) with golden orange undertones creating inviting atmosphere',
      'Cool color temperature (6500K) with blue-teal undertones creating modern tech feel',
      'Neutral balanced temperature (5500K) with accurate natural color representation',
      'Slightly warm (4500K) with subtle peachy undertones creating approachable premium feel',
      'Cool-neutral (6000K) with crisp clean quality suggesting precision and sophistication'
    ];
    
    const compositionVariations = [
      'Rule of thirds with subject on right third vertical line, creating balanced asymmetry',
      'Golden ratio spiral composition with subject at focal point for natural visual flow',
      'Centered symmetrical composition creating strong presence and authority',
      'Asymmetric balance with visual weight on right, text space on left creating dynamic tension',
      'Z-pattern composition guiding eye from top-left through center to bottom-right'
    ];
    
    // Randomly select one from each category
    const selectedPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];
    const selectedLighting = lightingStyles[Math.floor(Math.random() * lightingStyles.length)];
    const selectedDepth = depthStyles[Math.floor(Math.random() * depthStyles.length)];
    const selectedColorTemp = colorTemperatures[Math.floor(Math.random() * colorTemperatures.length)];
    const selectedComposition = compositionVariations[Math.floor(Math.random() * compositionVariations.length)];
    
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      directive: `Generation ID: ${uniqueId} - Use the following specific visual treatments to ensure uniqueness: ${selectedPerspective.directive}`,
      visualGuidance: `
SPECIFIC VISUAL TREATMENT FOR THIS GENERATION:
- Camera Angle: ${selectedPerspective.guidance}
- Lighting Setup: ${selectedLighting}
- Depth of Field: ${selectedDepth}
- Color Temperature: ${selectedColorTemp}
- Composition Rule: ${selectedComposition}

These specific choices ensure this generation will be visually distinct from previous outputs while maintaining professional quality and brand consistency.`
    };
  }

  /**
   * Generate offer badge text based on objective
   */
  private static generateOfferBadge(objective: string): string {
    const lower = objective.toLowerCase();
    
    if (lower.includes('demo') || lower.includes('trải nghiệm')) {
      return '🎁 DEMO MIỄN PHÍ';
    }
    if (lower.includes('giảm') || lower.includes('ưu đãi') || lower.includes('khuyến mãi')) {
      return '🔥 ƯU ĐÃI ĐẶC BIỆT';
    }
    if (lower.includes('tư vấn') || lower.includes('liên hệ')) {
      return '💎 TƯ VẤN MIỄN PHÍ';
    }
    if (lower.includes('đăng ký') || lower.includes('register')) {
      return '⚡ ĐĂNG KÝ NGAY';
    }
    
    return '🎁 NHẬN ƯU ĐÃI';
  }
  
  /**
   * Generate default bullets if not provided
   */
  private static generateDefaultBullets(industry: string): string[] {
    const lower = industry.toLowerCase();
    
    if (lower.includes('spa') || lower.includes('beauty') || lower.includes('wellness')) {
      return [
        'Tối ưu xếp lịch & quản lý KTV',
        'Báo cáo doanh thu tự động',
        'Tăng 95% giữ chân khách VIP'
      ];
    }
    
    if (lower.includes('restaurant') || lower.includes('f&b') || lower.includes('food')) {
      return [
        'Quản lý đặt bàn thông minh',
        'Tối ưu chi phí nguyên liệu',
        'Tăng 40% hiệu suất phục vụ'
      ];
    }
    
    if (lower.includes('real estate') || lower.includes('property')) {
      return [
        'Quản lý danh mục BĐS hiệu quả',
        'Tự động marketing đa kênh',
        'Phân tích thị trường AI'
      ];
    }
    
    return [
      'Tự động hóa 80% quy trình',
      'Theo dõi KPI thời gian thực',
      'Tăng 300% năng suất'
    ];
  }
  
  /**
   * Convert hex color to descriptive name
   */
  private static hexToColorName(hex: string): string {
    const colorMap: Record<string, string> = {
      '#061E17': 'deep forest green',
      '#D4AF37': 'royal gold',
      '#000000': 'black',
      '#FFFFFF': 'white',
      '#E91E63': 'vibrant pink',
      '#2196F3': 'bright blue',
      '#4CAF50': 'emerald green',
      '#FF5722': 'coral orange',
      '#9C27B0': 'royal purple',
      '#795548': 'warm brown'
    };
    
    // Return mapped name or analyze hex
    if (colorMap[hex.toUpperCase()]) {
      return colorMap[hex.toUpperCase()];
    }
    
    // Simple color detection
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    if (r > 200 && g > 200 && b > 200) return 'light neutral';
    if (r < 50 && g < 50 && b < 50) return 'dark neutral';
    if (r > g && r > b) return 'red';
    if (g > r && g > b) return 'green';
    if (b > r && b > g) return 'blue';
    if (r > 150 && g > 150) return 'yellow/gold';
    
    return 'neutral';
  }
}
