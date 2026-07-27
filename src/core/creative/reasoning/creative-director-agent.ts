/**
 * BELLA EOS - Creative Director Agent
 * Layer 2: Creative Reasoning (AI Understanding)
 * 
 * Responsibility: Use LLM to UNDERSTAND business context and REASON about creative strategy
 * This is the AI "brain" that thinks like a creative director
 */

import type { 
  BusinessContextPackage, 
  CreativeBrief 
} from '@/types/creative-intelligence';

export class CreativeDirectorAgent {
  
  /**
   * Reason about business context and generate Creative Brief using LLM
   */
  async reason(context: BusinessContextPackage): Promise<CreativeBrief> {
    
    console.log('[CreativeDirectorAgent] Starting creative reasoning...');
    
    // Compose LLM reasoning prompt
    const reasoningPrompt = this.composeReasoningPrompt(context);
    
    // Call LLM for creative reasoning
    const reasoning = await this.callLLMReasoning(reasoningPrompt);
    
    // Parse structured output
    let brief: CreativeBrief;
    try {
      brief = JSON.parse(reasoning.structuredOutput);
      // Check if the parsed result is empty or missing required fields
      if (!brief.campaignGoal || !brief.posterHeadline) {
        throw new Error('Parsed brief is incomplete');
      }
    } catch (parseError) {
      console.error('[CreativeDirectorAgent] Failed to parse LLM response:', parseError);
      // Fallback to rule-based brief
      brief = this.generateFallbackBrief(context);
    }
    
    // Add metadata
    brief.confidenceScore = reasoning.confidence || 0.75;
    brief.reasoningChain = reasoning.reasoningChain || [];
    brief.generatedAt = new Date().toISOString();
    
    // Validate brief
    this.validateBrief(brief);
    
    console.log('[CreativeDirectorAgent] Creative Brief generated:', {
      goal: brief.campaignGoal,
      headline: brief.posterHeadline,
      confidence: brief.confidenceScore
    });
    
    return brief;
  }
  
  /**
   * Compose comprehensive reasoning prompt for LLM
   */
  private composeReasoningPrompt(context: BusinessContextPackage): string {
    
    const { ceoObjective, enterpriseContext, copywriterContent, brandDNA, campaignMemory, knowledgeContext } = context;
    
    // Extract key info
    const industryCategory = knowledgeContext.domainFacts[0]?.category || 'general_business';
    const targetAudience = brandDNA.identity.targetSegment;
    const budget = enterpriseContext.budget.totalBudget.toLocaleString('vi-VN');
    const duration = enterpriseContext.budget.duration;
    
    return `You are a Senior Creative Director at an enterprise marketing agency with 15+ years of experience.

Your task is to deeply understand the business objective and create a strategic creative brief for an image campaign banner.

## CEO OBJECTIVE
${ceoObjective}

## BUSINESS CONTEXT
- Industry: ${industryCategory}
- Target Audience: ${targetAudience}
- Budget: ${budget} VND
- Campaign Duration: ${duration}
- Revenue Target: ${enterpriseContext.erp.revenue.target.toLocaleString('vi-VN')} VND
- Current Customers: ${enterpriseContext.erp.customers.total}
- Lead Conversion Rate: ${(enterpriseContext.crm.leads.conversionRate * 100).toFixed(1)}%

## BRAND IDENTITY
- Brand Name: ${brandDNA.identity.brandName}
- Mission: ${brandDNA.identity.mission}
- Brand Values: ${brandDNA.values.join(', ')}
- Voice & Tone: ${brandDNA.voice.tone}
- Visual Style: ${brandDNA.visual.style}
- Color Palette: Primary ${brandDNA.visual.colors.primary}, Accent ${brandDNA.visual.colors.accent}

## COPYWRITER CONTENT (from Task #1 - Facebook Post)
${copywriterContent ? `
Key Messages: ${copywriterContent.keyMessages.join('; ')}
Tone: ${copywriterContent.tone}

CRITICAL NOTE: This content is for a FACEBOOK POST, not a poster. 
The poster headline should be DIFFERENT - optimized for visual medium, shorter, punchier, and more visual-first.
Do NOT copy the Facebook headline. CREATE A NEW ONE specifically for poster format.
` : 'No copywriter content available. Create original messaging.'}

## CAMPAIGN MEMORY (Past Performance)
### Successful Patterns:
${campaignMemory.successfulPatterns.map(p => `- ${p.description} (Success Rate: ${((p.successRate || 0) * 100).toFixed(0)}%)`).join('\n')}

### Patterns to Avoid:
${campaignMemory.avoidPatterns.map(p => `- ${p.description} (Poor Performance: ${((p.successRate || 0) * 100).toFixed(0)}%)`).join('\n')}

### Performance Insights:
${campaignMemory.performanceInsights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

## INDUSTRY KNOWLEDGE
### Domain Facts:
${knowledgeContext.domainFacts.map(f => `- ${f.statement}`).join('\n')}

### Industry Trends:
${knowledgeContext.industryTrends.map(t => `- ${t.name} (${t.direction}, relevance: ${(t.relevance * 100).toFixed(0)}%)`).join('\n')}

## YOUR TASK
Create a comprehensive Creative Brief with the following JSON structure:

{
  "campaignGoal": "Clear, specific goal statement (what business outcome are we driving?)",
  "targetAudience": "Detailed audience profile (who are we talking to? what do they care about?)",
  "emotionalTone": "Desired emotional response (comma-separated keywords: e.g., aspirational, trustworthy, innovative)",
  "visualStory": "One-sentence visual narrative (what story does the image tell?)",
  "designDirection": "Overall aesthetic direction (e.g., luxury wellness tech, modern editorial, cyberpunk corporate)",
  "posterHeadline": "CRITICAL: Create a NEW headline optimized for POSTER medium. Should be 3-8 words, punchy, visual-first, benefit-driven. NOT the Facebook post headline.",
  "heroSubject": "Main visual subject that should dominate the image (be specific: e.g., 'premium glass cosmetic jars on polished marble surface' NOT just 'spa products')",
  "environmentDescription": "Setting and background atmosphere (where does this scene take place? what's the mood?)",
  "colorMood": "Color psychology direction (what emotions should colors evoke?)",
  "lightingMood": "Lighting atmosphere (e.g., golden hour warmth, soft studio glow, dramatic shadows)",
  "compositionRule": "Layout strategy - choose ONE: rule_of_thirds, golden_ratio, centered, asymmetric, diagonal, frame_within_frame",
  "keyMessage": "Single most important message to communicate (if viewer remembers only ONE thing, what should it be?)",
  "avoidances": ["List 3-5 specific things to avoid in the visual (e.g., 'generic stock photos of people', 'too much text overlay', 'clinical sterile atmosphere')"],
  "successMetrics": ["List 3-5 ways to measure if this creative is successful (e.g., 'CTR > 3%', 'Demo bookings > 50', 'Brand recall improvement')"]
}

## CRITICAL RULES FOR YOU:
1. **POSTER HEADLINE IS NOT FACEBOOK HEADLINE**: Do NOT copy headlines from the Facebook post. Create a completely NEW headline optimized for visual poster format.
2. **UNDERSTAND BEFORE DECIDING**: Think deeply about the business objective, audience psychology, and what would make them stop scrolling.
3. **BE SPECIFIC WITH VISUALS**: Don't say "spa products" - say "premium glass cosmetic jars on polished marble surface". Specificity creates better AI images.
4. **CONSIDER PAST PERFORMANCE**: Learn from successful and failed patterns mentioned above.
5. **BALANCE BRAND DNA WITH INNOVATION**: Respect brand guidelines but don't be afraid to innovate if needed for impact.
6. **THINK ABOUT COMPOSITION**: Remember that 60% of the left side will have text overlay - plan the visual accordingly.

## REASONING PROCESS (Internal - explain your thinking):
Before generating the JSON output, think through:
1. What is the REAL business goal here? (not just what CEO said, but what they actually need)
2. What would make the TARGET AUDIENCE stop scrolling and click?
3. What EMOTION should this image evoke?
4. What VISUAL STORY supports the business goal?
5. How can we be DIFFERENT from competitors while staying true to brand?

Output format:
First, explain your reasoning in 3-5 bullet points starting with "REASONING:".
Then output ONLY valid JSON. No markdown, no code blocks, just raw JSON.`;
  }
  
  /**
   * Call LLM for creative reasoning
   */
  private async callLLMReasoning(prompt: string): Promise<{
    structuredOutput: string;
    confidence: number;
    reasoningChain: string[];
  }> {
    
    try {
      // Use Gemini Pro for reasoning
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      
      if (!apiKey) {
        console.warn('[CreativeDirectorAgent] No Gemini API key found, using fallback');
        throw new Error('No API key');
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract reasoning chain (before JSON)
      const reasoningMatch = fullText.match(/REASONING:([\s\S]*?)(?=\{)/);
      const reasoningText = reasoningMatch ? reasoningMatch[1].trim() : '';
      const reasoningChain = reasoningText
        .split('\n')
        .map((line: string) => line.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean);
      
      // Extract JSON (after reasoning)
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      const structuredOutput = jsonMatch ? jsonMatch[0] : fullText;
      
      return {
        structuredOutput,
        confidence: 0.85,
        reasoningChain
      };
      
    } catch (error) {
      console.warn('[CreativeDirectorAgent] LLM call failed, using rule-based fallback:', error);
      // Return empty structured response - let the caller handle fallback
      return {
        structuredOutput: '{}',
        confidence: 0.0,
        reasoningChain: ['LLM call failed', 'Will use fallback generation']
      };
    }
  }
  
  /**
   * Generate fallback brief using rules (if LLM fails)
   */
  private generateFallbackBrief(context: BusinessContextPackage): CreativeBrief {
    
    const { ceoObjective, brandDNA, enterpriseContext } = context;
    const lowerObj = ceoObjective.toLowerCase();
    
    // Domain-based defaults
    let campaignGoal = `Drive business growth: ${ceoObjective}`;
    let targetAudience = brandDNA.identity.targetSegment;
    let emotionalTone = brandDNA.voice.tone;
    let designDirection = brandDNA.visual.style;
    let posterHeadline = `GIẢI PHÁP TỐI ƯU CÙNG ${brandDNA.identity.brandName}`;
    let heroSubject = 'premium product showcase with clean surfaces';
    let environmentDescription = 'modern professional setting with soft lighting';
    
    if (lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp')) {
      campaignGoal = 'Drive demo bookings from premium spa owners for AI management platform';
      targetAudience = 'Premium Spa Owners & Beauty Studio Managers';
      emotionalTone = 'aspirational, serene, trustworthy, sophisticated';
      designDirection = 'luxury wellness tech aesthetic';
      posterHeadline = 'AI VẬN HÀNH SPA THẾ HỆ MỚI';
      heroSubject = 'premium glass cosmetic jars on polished marble surface with soft orchid flowers';
      environmentDescription = 'luxury spa wellness room with frosted glass, warm ambient lighting, natural stone accent wall';
    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ')) {
      campaignGoal = 'Drive qualified property investor leads for premium residential project';
      targetAudience = 'High-net-worth property investors and home buyers';
      emotionalTone = 'aspirational, trustworthy, elegant, modern';
      designDirection = 'premium real estate architectural showcase';
      posterHeadline = 'CĂN HỘ CAO CẤP ĐẲ ĐĂNG VÀNG';
      heroSubject = 'luxury modern architectural villa exterior at golden hour with glass curtain wall';
      environmentDescription = 'premium residential exterior with breathtaking architecture, golden hour sunset backdrop';
    }
    
    return {
      campaignGoal,
      targetAudience,
      emotionalTone,
      visualStory: `A compelling visual narrative that captures ${campaignGoal}`,
      designDirection,
      posterHeadline,
      heroSubject,
      environmentDescription,
      colorMood: 'warm, premium, trustworthy',
      lightingMood: 'soft ambient with warm highlights',
      compositionRule: 'rule_of_thirds',
      keyMessage: posterHeadline,
      avoidances: [
        'generic stock photos',
        'too much text overlay',
        'low quality imagery',
        'cluttered composition'
      ],
      successMetrics: [
        'CTR > 3%',
        `Conversions > ${Math.floor(enterpriseContext.budget.totalBudget / 1_000_000)}`,
        'Brand recall improvement'
      ],
      confidenceScore: 0.65,
      reasoningChain: ['Fallback rule-based generation due to LLM unavailability'],
      generatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Validate brief completeness and quality
   */
  private validateBrief(brief: CreativeBrief): void {
    
    const required = [
      'campaignGoal',
      'targetAudience',
      'emotionalTone',
      'visualStory',
      'designDirection',
      'posterHeadline',
      'heroSubject',
      'environmentDescription'
    ];
    
    for (const field of required) {
      if (!brief[field as keyof CreativeBrief]) {
        console.warn(`[CreativeDirectorAgent] Missing required field: ${field}`);
      }
    }
    
    // Validate headline is not too long
    if (brief.posterHeadline && brief.posterHeadline.length > 60) {
      console.warn('[CreativeDirectorAgent] Poster headline is too long:', brief.posterHeadline);
    }
    
    // Validate avoidances array
    if (!Array.isArray(brief.avoidances) || brief.avoidances.length === 0) {
      brief.avoidances = ['generic imagery', 'low quality', 'cluttered composition'];
    }
    
    // Validate successMetrics array
    if (!Array.isArray(brief.successMetrics) || brief.successMetrics.length === 0) {
      brief.successMetrics = ['CTR > 3%', 'Conversions > 50'];
    }
  }
}
