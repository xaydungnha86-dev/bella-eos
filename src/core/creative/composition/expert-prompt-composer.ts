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
    
    console.log('[ExpertPromptComposer] 🎨 Variation directive:', variationModifiers.directive);
    console.log('[ExpertPromptComposer] 🎨 Visual treatments applied');
    
    // Add random creative constraint to force uniqueness
    const randomConstraints = [
      'Feature a unique architectural element or background detail that was not in previous designs',
      'Use a completely different product arrangement or spatial composition from typical spa imagery',
      'Incorporate an unexpected color accent or material texture (e.g., copper, jade, marble veining)',
      'Show the scene from an unusual viewpoint that reveals a fresh perspective',
      'Include a subtle seasonal or time-of-day element (morning dew, evening glow, seasonal flowers)',
      'Feature different types of spa elements (stones, candles, towels, plants) in a new configuration'
    ];
    const randomConstraint = randomConstraints[Math.floor(Math.random() * randomConstraints.length)];
    
    return `Create a professional marketing banner for ${brandName} (${businessContext.industry} industry).

**CREATIVE VARIATION DIRECTIVE**: ${variationModifiers.directive}

**UNIQUENESS CONSTRAINT**: ${randomConstraint}
IMPORTANT: This image MUST look distinctly different from standard spa photography. Apply the variation directive and uniqueness constraint to ensure visual novelty.

VISUAL SCENE:
${heroSubject} placed in ${environmentDescription}. The scene should evoke ${emotionalTone} emotions. Lighting: ${lightingMood}. Color mood: ${colorMood} with emphasis on ${primaryColorName} and ${accentColorName} tones.

${variationModifiers.visualGuidance}

LAYOUT & COMPOSITION:
- Horizontal banner format in 16:9 aspect ratio
- Rule of thirds composition
- Main subject positioned on the RIGHT SIDE occupying majority of canvas
- LEFT SIDE features text overlay with subtle dark gradient
- Top section includes logo and promotional badge
- Bottom section has prominent call-to-action button

TEXT CONTENT TO RENDER (IMPORTANT - AI MUST INCLUDE THESE TEXTS):

1. TOP-LEFT LOGO BADGE:
   Text: "${brandName.toUpperCase()}"
   Style: Small rounded badge with ${accentColorName} background
   Typography: Bold sans-serif, white text
   Position: Upper left corner with comfortable margin

2. TOP-RIGHT PROMOTIONAL BADGE:
   Text: "${textContent.badge}"
   Style: Rounded badge with white background
   Typography: Bold sans-serif, ${primaryColorName} text
   Position: Upper right corner with comfortable margin

3. MAIN HEADLINE (MOST PROMINENT):
   Text: "${textContent.headline}"
   Typography: Extra bold sans-serif (very large size), white color
   Text effects: Strong drop shadow for readability
   Position: Left-center area, vertically centered
   Layout: Allow text wrapping if needed, maximum two lines
   CRITICAL: This headline must be LARGE, BOLD, and CLEARLY READABLE

4. KEY BENEFITS (THREE BULLET POINTS):
   Text line 1: "✓ ${textContent.bullets[0]}"
   Text line 2: "✓ ${textContent.bullets[1]}"
   Text line 3: "✓ ${textContent.bullets[2]}"
   Typography: Regular sans-serif (medium size), white color
   Position: Below headline, left-aligned with comfortable left margin
   Spacing: Adequate vertical gap between each benefit line
   Style: Each line starts with checkmark symbol (✓) followed by benefit text

5. CALL-TO-ACTION BUTTON:
   Text: "${textContent.cta}"
   Style: Large rounded button with gradient background (vibrant pink to red gradient)
   Typography: Bold sans-serif (large size), white text, uppercase
   Position: Bottom center with comfortable bottom margin
   Effects: Subtle glow to make button stand out
   Icon: Include right arrow symbol (→) at the end

VISUAL HIERARCHY & SIZING:
- Headline: Largest and most prominent element (dominant visual weight)
- Hero subject: Secondary focus (occupies right side of composition)
- Bullet points: Medium emphasis (supporting details)
- CTA button: Strong visual call-out (bright colors, clear contrast)
- Badges: Subtle presence (upper corners, smaller scale)

TECHNICAL REQUIREMENTS:
- High resolution 4K quality output
- Professional studio lighting
- Text rendering: Anti-aliased, crisp, professional quality
- Contrast: Ensure all text stands out clearly against background (excellent readability)
- Color depth: Rich 24-bit RGB

COLOR PALETTE:
- Primary brand color: ${colors.primary} (${primaryColorName} tone)
- Accent brand color: ${colors.accent} (${accentColorName} tone)
- Text color: Pure white with dark shadow for contrast
- Background overlay: Dark gradient for text readability

PHOTOGRAPHY STYLE:
- Professional commercial photography aesthetic
- Studio quality lighting setup
- Sharp focus on main subject
- Shallow depth of field for background elements
- Clean, uncluttered composition
- Premium, high-end look matching ${brandName} brand identity

ATMOSPHERE & MOOD:
${creativeBrief.visualStory}. The overall feeling should communicate ${emotionalTone}, with ${colorMood} color atmosphere and ${lightingMood} lighting that creates depth and dimension.

CRITICAL DESIGN PRINCIPLES:
- ALL TEXT MUST BE CLEARLY RENDERED AND READABLE
- NO PLACEHOLDER TEXT - use exact text content provided above
- Maintain brand color scheme throughout
- Professional graphic design quality expected
- Text should integrate naturally with visual scene
- Ensure proper visual hierarchy and contrast
- DO NOT include dimension annotations, pixel measurements, or technical specifications in the visible image`;
  }
  
  /**
   * Build layout instructions with variation
   */
  private static buildLayoutInstructions(brief: CreativeBrief): string {
    // Rotate through different layout patterns for visual diversity
    const layoutVariants = [
      {
        name: 'split_left_text',
        description: '40% left side: Text overlay zone (dark gradient), 60% right side: Hero visual',
        textPosition: 'LEFT',
        visualRatio: '40/60'
      },
      {
        name: 'split_right_text',
        description: '60% left side: Hero visual, 40% right side: Text overlay zone (dark gradient)',
        textPosition: 'RIGHT',
        visualRatio: '60/40'
      },
      {
        name: 'centered_hero',
        description: 'Center: Large hero visual, Text overlay bottom 30% with gradient backdrop',
        textPosition: 'BOTTOM_OVERLAY',
        visualRatio: 'full_bleed'
      },
      {
        name: 'diagonal_split',
        description: 'Diagonal divide from top-left to bottom-right, text on lower triangle, visual on upper',
        textPosition: 'DIAGONAL_LOWER',
        visualRatio: 'diagonal_45deg'
      },
      {
        name: 'magazine_style',
        description: 'Full background visual, Text overlay in top-left 40% with strong gradient box',
        textPosition: 'TOP_LEFT_OVERLAY',
        visualRatio: 'full_bleed'
      }
    ];
    
    // Use variation seed or time-based index to select layout
    const layoutIndex = Math.floor(Date.now() / 1000) % layoutVariants.length;
    const selectedLayout = layoutVariants[layoutIndex];
    
    return `Layout Style: ${selectedLayout.name} (Composition Rule: ${brief.compositionRule || 'rule_of_thirds'})

**${selectedLayout.description}**

Layout Structure:
- ${selectedLayout.textPosition === 'LEFT' ? '40% LEFT: Text overlay zone with dark gradient (rgba(0,0,0,0.7))\n- 60% RIGHT: Hero visual / product showcase' : ''}
- ${selectedLayout.textPosition === 'RIGHT' ? '60% LEFT: Hero visual / product showcase\n- 40% RIGHT: Text overlay zone with dark gradient (rgba(0,0,0,0.7))' : ''}
- ${selectedLayout.textPosition === 'BOTTOM_OVERLAY' ? 'Full width hero visual\n- Bottom 30%: Text overlay with gradient backdrop (rgba(0,0,0,0.6) to transparent)' : ''}
- ${selectedLayout.textPosition === 'DIAGONAL_LOWER' ? 'Diagonal split at 45 degrees\n- Upper triangle: Hero visual\n- Lower triangle: Text overlay with solid background' : ''}
- ${selectedLayout.textPosition === 'TOP_LEFT_OVERLAY' ? 'Full bleed background visual\n- Top-left 40%: Text overlay in strong gradient box (rgba(0,0,0,0.8))' : ''}
- Top strip: Logo badge (top-left 20px)
- Offer badge: Top-right or integrated with headline
- CTA button: ${selectedLayout.textPosition === 'BOTTOM_OVERLAY' ? 'Centered bottom' : 'Within text zone, visually prominent'}
- Vertical rhythm: Logo → Headline → Bullets → CTA
- Breathing space: Minimum 40-60px margins on all sides`;
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
