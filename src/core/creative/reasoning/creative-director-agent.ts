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
import { ImageHistoryTracker } from '../memory/image-history-tracker';
import { ContentHistoryTracker } from '../memory/content-history-tracker';
import { getCompanyDNASnippet } from '@/core/company/company-dna-loader';

export class CreativeDirectorAgent {
  
  /**
   * Reason about business context and generate Creative Brief using LLM
   */
  async reason(context: BusinessContextPackage, clientKeys?: { gemini?: string; openai?: string; anthropic?: string }): Promise<CreativeBrief> {
    
    console.log('[CreativeDirectorAgent] Starting creative reasoning...');
    console.log('[CreativeDirectorAgent] 📊 Input context received:', {
      ceoObjective: context.ceoObjective?.substring(0, 100) || 'N/A',
      brandName: context.brandDNA?.identity?.brandName || 'N/A',
      hasCopywriterContent: !!context.copywriterContent,
      industryCategory: context.knowledgeContext?.domainFacts?.[0]?.category || 'N/A'
    });
    
    // Check content history before generating prompt
    const contentTracker = ContentHistoryTracker.getInstance();
    const contentStats = contentTracker.getStats();
    console.log('[CreativeDirectorAgent] Content history stats:', contentStats);
    
    if (contentStats.total > 0) {
      const recentHeadlines = contentTracker.getRecentHeadlines(3);
      console.log('[CreativeDirectorAgent] 📝 Previous headlines:', recentHeadlines);
    }
    
    // Compose LLM reasoning prompt (with auto-injected Company DNA)
    const reasoningPrompt = await this.composeReasoningPrompt(context);
    
    // Debug: Check if content constraints are in prompt
    if (reasoningPrompt.includes('CONTENT HISTORY')) {
      console.log('[CreativeDirectorAgent] ✓ Content constraints injected into prompt');
    } else {
      console.warn('[CreativeDirectorAgent] ⚠️ Content constraints NOT found in prompt!');
    }
    
    // Debug: Check if contextual understanding is in prompt
    if (reasoningPrompt.includes('CRITICAL CONTEXT UNDERSTANDING')) {
      console.log('[CreativeDirectorAgent] ✓ Contextual understanding section present');
    } else {
      console.error('[CreativeDirectorAgent] ❌ Contextual understanding section MISSING!');
    }
    
    // Log prompt snippet for verification
    const promptPreview = reasoningPrompt.substring(0, 500);
    console.log('[CreativeDirectorAgent] 📄 Prompt preview (first 500 chars):', promptPreview);
    
    // FIXED: Add variability seed to ensure different outputs each time
    const variabilitySeed = Date.now() + Math.random() * 1000000;
    const reasoningPromptWithVariability = reasoningPrompt + `\n\n## VARIABILITY REQUIREMENT
CRITICAL: This generation must be UNIQUE. Use seed: ${variabilitySeed}
- Do NOT generate identical headlines/visuals to previous runs
- Explore DIFFERENT angles, metaphors, and visual stories each time
- Be creative and diverse in your approach`;
    
    // Call LLM for creative reasoning
    const reasoning = await this.callLLMReasoning(reasoningPromptWithVariability, clientKeys);
    
    // Parse structured output
    let brief: CreativeBrief;
    try {
      let jsonString = reasoning.structuredOutput;
      
      // FIXED: Handle LLM responses that include "REASONING:" prefix
      if (jsonString.includes('REASONING:')) {
        console.log('[CreativeDirectorAgent] Detected REASONING prefix, extracting JSON...');
        // Find JSON block after REASONING
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log('[CreativeDirectorAgent] ✓ Extracted JSON from response');
        }
      }
      
      // Try to extract JSON from markdown code blocks
      if (jsonString.includes('```')) {
        const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1].trim();
          console.log('[CreativeDirectorAgent] ✓ Extracted JSON from code block');
        }
      }
      
      brief = JSON.parse(jsonString);
      
      // Check if the parsed result is empty or missing required fields
      if (!brief.campaignGoal || !brief.posterHeadline) {
        throw new Error('Parsed brief is incomplete');
      }
      
      console.log('[CreativeDirectorAgent] ✓ Successfully parsed LLM response');
    } catch (parseError) {
      console.error('[CreativeDirectorAgent] Failed to parse LLM response:', parseError);
      console.warn('[CreativeDirectorAgent] Using fallback brief generation...');
      // Fallback to rule-based brief with variation
      brief = this.generateFallbackBrief(context);
      brief = this.applyFallbackVariation(brief, context);
    }
    
    // Add metadata
    brief.confidenceScore = reasoning.confidence || 0.75;
    brief.reasoningChain = reasoning.reasoningChain || [];
    brief.generatedAt = new Date().toISOString();
    
    // Validate brief
    this.validateBrief(brief);
    
    // Save to content history for future variation
    ContentHistoryTracker.getInstance().addContent({
      id: `content_${Date.now()}`,
      timestamp: Date.now(),
      campaignGoal: brief.campaignGoal,
      headline: brief.posterHeadline,
      keyBenefits: brief.keyBenefits || [],
      callToAction: brief.callToAction || ''
    });
    
    console.log('[CreativeDirectorAgent] Creative Brief generated:', {
      goal: brief.campaignGoal,
      headline: brief.posterHeadline,
      confidence: brief.confidenceScore
    });
    console.log('[CreativeDirectorAgent] ✓ Content saved to history tracker');
    
    return brief;
  }
  
  /**
   * Compose comprehensive reasoning prompt for LLM
   * (AUTO-INJECTS COMPANY DNA)
   */
  private async composeReasoningPrompt(context: BusinessContextPackage): Promise<string> {
    
    const { ceoObjective, enterpriseContext, copywriterContent, brandDNA, campaignMemory, knowledgeContext } = context;
    
    // AUTO-LOAD COMPANY DNA
    const companyDNASnippet = await getCompanyDNASnippet().catch(err => {
      console.warn('[CreativeDirectorAgent] Failed to load Company DNA:', err);
      return ''; // Fallback to empty if load fails
    });
    
    if (companyDNASnippet) {
      console.log('[CreativeDirectorAgent] ✓ Company DNA loaded and injected into prompt');
    }
    
    // Extract key info
    const industryCategory = knowledgeContext.domainFacts[0]?.category || 'general_business';
    const targetAudience = brandDNA.identity.targetSegment;
    const budget = enterpriseContext.budget.totalBudget.toLocaleString('vi-VN');
    const duration = enterpriseContext.budget.duration;
    
    return `You are a Senior Creative Director at an enterprise marketing agency with 15+ years of experience.

Your task is to deeply understand the business objective and create a strategic creative brief for an image campaign banner.

${companyDNASnippet ? `${companyDNASnippet}\n\n` : ''}

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

## IMAGE HISTORY - MUST BE DIFFERENT FROM THESE
${this.getImageHistoryConstraints()}

## CONTENT HISTORY - VARY YOUR MESSAGING
${this.getContentHistoryConstraints()}

## YOUR TASK
Create a comprehensive Creative Brief with the following JSON structure:

**CRITICAL CONTEXT UNDERSTANDING**:
Before creating the brief, ANALYZE the business objective deeply:

1. **Product Type Detection**:
   - If objective mentions "Bella EOS", "phần mềm", "hệ thống", "platform", "AI" → This is SOFTWARE/SaaS product
   - If software for spa/salon → MUST show software interface, dashboard, or screen mockup
   - If software for retail → MUST show POS system, inventory screens
   - If software for any industry → MUST include product demonstration visuals

2. **Visual Strategy Based on Product**:
   - Software products: Show UI mockup, dashboard screenshots, app interface on devices
   - Physical products: Show actual product in lifestyle context
   - Services: Show results/outcomes, before-after, customer satisfaction

3. **Creative Variation Mandate**:
   - Each generation MUST explore DIFFERENT marketing angles
   - Rotate through: feature-focused, benefit-focused, transformation-focused, social proof-focused
   - Vary emotional appeals: aspiration, urgency, trust, innovation, growth

{
  "campaignGoal": "Clear, specific goal statement (what business outcome are we driving?)",
  "productType": "software | physical_product | service (detect based on objective)",
  "visualStrategy": "Specific strategy: 'software_demo_ui', 'product_lifestyle', 'transformation_story', etc.",
  "targetAudience": "Detailed audience profile (who are we talking to? what do they care about?)",
  "emotionalTone": "Desired emotional response (comma-separated keywords: e.g., aspirational, trustworthy, innovative)",
  "visualStory": "One-sentence visual narrative (what story does the image tell?)",
  "designDirection": "Overall aesthetic direction (e.g., luxury wellness tech, modern editorial, cyberpunk corporate)",
  "posterHeadline": "CRITICAL: Create a COMPLETELY NEW headline. NOT 'AI VẬN HÀNH SPA' anymore! Try: 'QUẢN TRỊ SPA CHUYÊN NGHIỆP', 'HỆ THỐNG BELLA EOS', 'NÂNG TẦM SPA VIỆT', 'DOANH THU X2 VỚI AI', etc. 3-8 words, punchy, visual-first, benefit-driven.",
  "keyBenefits": ["List exactly 3 DIFFERENT benefits each time. Rotate through: operational efficiency, revenue growth, customer experience, staff productivity, competitive advantage, cost reduction, scalability, insights & analytics. Each 4-8 words maximum, action-oriented."],
  "callToAction": "VARY the CTA! Rotate: 'Nhận tư vấn miễn phí', 'Demo trực tiếp 15 phút', 'Dùng thử 30 ngày', 'Xem case study', 'Tải brochure', 'Đặt lịch gặp', 'Nhận báo giá', 'Tham quan showroom'",
  "heroSubject": "CRITICAL FOR SOFTWARE: If this is software (Bella EOS), MUST include: 'laptop/tablet/phone screen displaying [software name] dashboard interface with [specific features visible: analytics charts, booking calendar, customer data, revenue reports]'. Be VERY specific about what's on screen. If physical product, describe the product itself.",
  "environmentDescription": "Setting and background atmosphere. For software: modern office, co-working space, spa reception with computer. For products: lifestyle setting matching target audience.",
  "colorMood": "Color psychology direction (what emotions should colors evoke?)",
  "lightingMood": "Lighting atmosphere (e.g., golden hour warmth, soft studio glow, dramatic shadows)",
  "compositionRule": "Layout strategy - choose ONE: rule_of_thirds, golden_ratio, centered, asymmetric, diagonal, frame_within_frame",
  "keyMessage": "Single most important message to communicate (if viewer remembers only ONE thing, what should it be?)",
  "avoidances": ["List 3-5 specific things to avoid in the visual"],
  "successMetrics": ["List 3-5 ways to measure if this creative is successful"]
}

**EXAMPLES OF GOOD vs BAD heroSubject**:

❌ BAD (generic spa imagery):
"premium glass cosmetic jars on polished marble surface"
→ This shows products, NOT software!

✅ GOOD (software demo):
"MacBook Pro displaying Bella EOS dashboard with colorful analytics charts showing revenue growth, appointment calendar filled with bookings, and customer satisfaction metrics, placed on modern spa reception desk"

❌ BAD (too vague):
"spa products with orchids"

✅ GOOD (specific software context):
"iPad showing Bella EOS booking interface with drag-and-drop staff scheduling, held by spa manager in modern wellness center, background shows happy customers"

## CREATIVE VARIATION SEED
Variation ID: ${this.generateVariationSeed()}
Generation timestamp: ${Date.now()}

**CRITICAL DIRECTIVE FOR THIS SPECIFIC GENERATION:**
To ensure visual AND messaging uniqueness, you MUST incorporate these variation strategies:

### Visual Variation:
- **Perspective Shift**: Try unusual camera angles (bird's eye, extreme close-up, dutch angle, worm's eye view)
- **Time of Day**: Vary lighting (golden hour, blue hour, midday brightness, twilight glow, nighttime ambiance)
- **Style Variation**: Experiment with visual styles (photorealistic, minimalist flat design, cinematic drama, editorial magazine, tech-forward gradient)
- **Subject Variation**: If showing software, vary the device (laptop, tablet, phone, large monitor) and what's visible on screen
- **Color Temperature**: Shift warm vs cool tones (warm golden, cool blue-teal, neutral balanced, vibrant saturated, muted pastel)
- **Depth of Field**: Vary focus (shallow depth with blur, deep focus, selective focus on key element)

### Messaging Variation (CRITICAL - MUST CHANGE!):
- **Headline Angle**: Rotate through different value propositions:
  - Generation 1: Technology/Innovation focus ("AI VẬN HÀNH...")
  - Generation 2: Business Results focus ("DOANH THU TĂNG 2X...", "TIẾT KIỆM 40% CHI PHÍ...")
  - Generation 3: Customer Experience focus ("KHÁCH HÀNG TRUNG THÀNH HƠN...")
  - Generation 4: Competitive Advantage ("DẪN ĐẦU THỊ TRƯỜNG SPA...")
  - Generation 5: Transformation story ("CHUYỂN ĐỔI SỐ TOÀN DIỆN...")

- **Benefit Angles**: Rotate through value dimensions:
  - Operations: scheduling, automation, efficiency
  - Finance: revenue, cost savings, ROI
  - Customer: satisfaction, retention, experience
  - Staff: productivity, engagement, communication
  - Growth: scalability, expansion, market share
  - Insights: analytics, reporting, forecasting

**CRITICAL RULES**:
1. If objective mentions "Bella EOS" or any software → heroSubject MUST include device screen showing software interface
2. Each headline MUST use DIFFERENT opening words (not just "AI VẬN HÀNH" every time)
3. Each set of benefits MUST highlight DIFFERENT business outcomes
4. Each CTA MUST offer DIFFERENT value (not always "đăng ký trải nghiệm")

## CRITICAL RULES FOR YOU:
1. **POSTER HEADLINE IS NOT FACEBOOK HEADLINE**: Do NOT copy headlines from the Facebook post. Create a completely NEW headline optimized for visual poster format.
2. **UNDERSTAND BEFORE DECIDING**: Think deeply about the business objective, audience psychology, and what would make them stop scrolling.
3. **BE SPECIFIC WITH VISUALS**: Don't say "spa products" - say "premium glass cosmetic jars on polished marble surface". Specificity creates better AI images.
4. **CONSIDER PAST PERFORMANCE**: Learn from successful and failed patterns mentioned above.
5. **BALANCE BRAND DNA WITH INNOVATION**: Respect brand guidelines but don't be afraid to innovate if needed for impact.
6. **THINK ABOUT COMPOSITION**: Remember that 60% of the left side will have text overlay - plan the visual accordingly.
7. **ENSURE VISUAL UNIQUENESS**: Each generation MUST look distinctly different from previous ones. Use the variation seed above to inject creative diversity while maintaining brand consistency.

## REASONING PROCESS (Internal - explain your thinking):
Before generating the JSON output, think through:
1. What is the REAL business goal here? (not just what CEO said, but what they actually need)
2. What would make the TARGET AUDIENCE stop scrolling and click?
3. What EMOTION should this image evoke?
4. What VISUAL STORY supports the business goal?
5. How can we be DIFFERENT from competitors while staying true to brand?

## OUTPUT FORMAT - CRITICAL!

**YOU MUST OUTPUT ONLY PURE JSON. NO OTHER TEXT.**

Do NOT include:
- ❌ "REASONING:" prefix
- ❌ Markdown code blocks
- ❌ Explanatory text before or after JSON
- ❌ Comments inside JSON

Just output the raw JSON object directly, starting with { and ending with }.

Example of CORRECT output:
{
  "campaignGoal": "...",
  "productType": "...",
  ...
}

Example of WRONG output (DO NOT DO THIS):
REASONING: First I analyzed...
(with markdown code fencing around the JSON)

**START YOUR RESPONSE WITH { AND END WITH }**`;
  }
  
  /**
   * Call LLM for creative reasoning
   */
  private async callLLMReasoning(prompt: string, clientKeys?: { gemini?: string; openai?: string; anthropic?: string }): Promise<{
    structuredOutput: string;
    confidence: number;
    reasoningChain: string[];
  }> {
    
    try {
      // Use Gemini Pro for reasoning
      const apiKey = clientKeys?.gemini || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      
      if (!apiKey) {
        console.warn('[CreativeDirectorAgent] No Gemini API key found, using fallback');
        throw new Error('No API key');
      }
      
      // Try multiple Gemini models in order of preference
      // Updated for 2026: Use latest stable models
      const models = [
        'gemini-2.5-flash',       // Newest stable (2026)
        'gemini-2.5-pro',         // Pro version
        'gemini-3-flash-preview', // Experimental 3.x
        'gemini-flash-latest',    // Always latest stable
        'gemini-pro-latest'       // Latest Pro
      ];
      
      let lastError: Error | null = null;
      
      for (const modelName of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }],
                generationConfig: {
                  temperature: 0.8, // INCREASED from 0.7 for more variability
                  maxOutputTokens: 2048,
                  topP: 0.95,       // Add nucleus sampling for diversity
                  topK: 40,         // Add top-k sampling for diversity
                }
              })
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.warn(`[CreativeDirectorAgent] ${modelName} failed (${response.status}):`, errorText.substring(0, 200));
            lastError = new Error(`Gemini API error: ${response.status}`);
            continue; // Try next model
          }
          
          const data = await response.json();
          const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          console.log(`[CreativeDirectorAgent] ✓ Success with ${modelName}`);
          
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
        } catch (modelError) {
          console.warn(`[CreativeDirectorAgent] ${modelName} exception:`, modelError);
          lastError = modelError as Error;
          continue;
        }
      }
      
      // All models failed
      throw lastError || new Error('All Gemini models failed');
      
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
    
    // Priority 1: Enterprise platform marketing (about BELLA EOS itself)
    if (lowerObj.includes('bella eos') || lowerObj.includes('platform') || lowerObj.includes('eic') || lowerObj.includes('enterprise ai')) {
      campaignGoal = 'Position BELLA EOS as the leading AI platform for enterprise operations';
      targetAudience = 'C-level executives, business owners, decision makers';
      emotionalTone = 'authoritative, innovative, trustworthy, premium';
      designDirection = 'enterprise tech showcase with AI elements';
      posterHeadline = 'AI VẬN HÀNH DOANH NGHIỆP THẾ HỆ MỚI';
      heroSubject = 'modern AI command center dashboard with holographic displays and data visualization';
      environmentDescription = 'futuristic enterprise office with glass surfaces, blue ambient lighting, floating UI panels';
    }
    // Priority 2: B2B Software for Spa/beauty business (BELLA EOS selling TO spas)
    else if (lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp') || lowerObj.includes('salon')) {
      campaignGoal = 'Drive demo bookings from spa owners for Bella EOS management software platform';
      targetAudience = 'Premium Spa Owners, Beauty Studio Managers, Wellness Center Directors';
      emotionalTone = 'professional, innovative, results-driven, empowering';
      designDirection = 'modern B2B software showcase - technology enabling business success';
      posterHeadline = 'PHẦN MỀM QUẢN TRỊ SPA THÔNG MINH';
      heroSubject = 'modern MacBook Pro displaying Bella EOS software dashboard with revenue analytics charts, appointment scheduling interface, and customer management data, placed on professional spa reception desk';
      environmentDescription = 'contemporary spa business office setting with computer workstation, natural lighting, minimal professional decor, subtle wellness elements (plants, clean aesthetic) in soft focus background';
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
      keyBenefits: this.generateDefaultKeyBenefits(lowerObj),
      callToAction: this.generateDefaultCTA(lowerObj),
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
   * Generate fallback with variation (rotate headlines, benefits, CTAs)
   * IMPROVED: Use content from copywriter post to create contextual variations
   */
  private applyFallbackVariation(brief: CreativeBrief, context: BusinessContextPackage): CreativeBrief {
    const tracker = ContentHistoryTracker.getInstance();
    const history = tracker.getStats();
    const variationIndex = history.total % 5; // Rotate through 5 variants
    
    const lowerObj = context.ceoObjective.toLowerCase();
    const isSpaContext = lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp');
    
    // Extract insights from copywriter content if available
    const copywriterMessages = context.copywriterContent?.keyMessages || [];
    const hasCopywriterContent = copywriterMessages.length > 0;
    
    console.log('[CreativeDirectorAgent] 🎨 Applying fallback variation #' + variationIndex);
    console.log('[CreativeDirectorAgent] 📝 Has copywriter content:', hasCopywriterContent);
    
    if (isSpaContext) {
      // IMPROVED: Generate headlines dynamically based on copywriter content
      let headlineVariants: string[];
      
      if (hasCopywriterContent) {
        // Extract key themes from copywriter messages
        const themes = this.extractThemesFromContent(copywriterMessages);
        console.log('[CreativeDirectorAgent] 📊 Extracted themes:', themes);
        
        // Generate contextual headlines
        headlineVariants = [
          this.generateHeadlineFromTheme(themes, 'technology'),
          this.generateHeadlineFromTheme(themes, 'results'),
          this.generateHeadlineFromTheme(themes, 'efficiency'),
          this.generateHeadlineFromTheme(themes, 'growth'),
          this.generateHeadlineFromTheme(themes, 'innovation')
        ];
      } else {
        // Fallback to generic rotation
        headlineVariants = [
          'PHẦN MỀM QUẢN TRỊ SPA THÔNG MINH',
          'HỆ THỐNG BELLA EOS - TỰ ĐỘNG HÓA VẬN HÀNH',
          'DOANH THU TĂNG 2X NHỜ CÔNG NGHỆ AI',
          'NỀN TẢNG QUẢN LÝ SPA CHUYÊN NGHIỆP',
          'ỨNG DỤNG AI CHO CHỦ SPA HIỆN ĐẠI'
        ];
      }
      
      // Generate benefits dynamically
      let benefitSets: string[][];
      
      if (hasCopywriterContent) {
        benefitSets = this.generateBenefitsFromContent(copywriterMessages, variationIndex);
      } else {
        benefitSets = [
          ['⚡ Phần mềm tự động xếp lịch KTV', '📊 Dashboard phân tích thời gian thực', '💰 Tăng doanh thu 150% trong 6 tháng'],
          ['🖥️ Quản lý đa chi nhánh trên 1 nền tảng', '📱 Ứng dụng mobile quản trị mọi lúc', '🤖 AI dự báo doanh thu chính xác'],
          ['⏱️ Tiết kiệm 40 giờ/tháng quản lý thủ công', '📈 Báo cáo tự động gửi email hàng ngày', '🎯 Phân tích khách hàng bằng AI'],
          ['💻 Phần mềm cloud - không cần cài đặt', '🔒 Bảo mật chuẩn enterprise', '🚀 Triển khai trong 1 ngày'],
          ['📊 Hệ thống CRM tích hợp sẵn', '💳 Thanh toán online tự động', '📞 Hỗ trợ 24/7 bằng tiếng Việt']
        ];
      }
      
      // TRULY RANDOM headline selection (not fixed index)
      const randomHeadlineIndex = Math.floor(Math.random() * headlineVariants.length);
      
      // TRULY RANDOM benefit set selection (not fixed index)
      const randomBenefitIndex = Math.floor(Math.random() * benefitSets.length);
      
      // TRULY RANDOM CTA selection
      const ctaVariants = [
        'Demo phần mềm 15 phút',
        'Dùng thử miễn phí 30 ngày',
        'Xem video giới thiệu',
        'Nhận báo giá chi tiết',
        'Đặt lịch tư vấn 1-1',
        'Trải nghiệm ngay hôm nay',
        'Liên hệ tư vấn miễn phí',
        'Đăng ký demo online',
        'Nhận ưu đãi đặc biệt',
        'Tìm hiểu thêm ngay',
        'Bắt đầu dùng thử',
        'Đặt lịch hẹn tư vấn',
        'Xem case study thực tế',
        'Tải catalog sản phẩm',
        'Chat với chuyên viên'
      ];
      
      const randomCTAIndex = Math.floor(Math.random() * ctaVariants.length);
      
      brief.posterHeadline = headlineVariants[randomHeadlineIndex];
      brief.keyBenefits = benefitSets[randomBenefitIndex];
      brief.callToAction = ctaVariants[randomCTAIndex];
      
      console.log('[CreativeDirectorAgent] ✓ Generated variation:');
      console.log('[CreativeDirectorAgent]   Headline:', brief.posterHeadline, `[${randomHeadlineIndex + 1}/${headlineVariants.length}]`);
      console.log('[CreativeDirectorAgent]   Benefits:', brief.keyBenefits.join(' | '));
      console.log('[CreativeDirectorAgent]   CTA:', brief.callToAction, `[${randomCTAIndex + 1}/${ctaVariants.length}]`);
      
      // Vary hero subject device - ALWAYS show SOFTWARE on screen
      const deviceVariants = [
        'MacBook Pro displaying Bella EOS dashboard',
        'iPad Pro showing Bella EOS mobile app interface',
        'dual monitor setup displaying Bella EOS analytics platform',
        'laptop computer with Bella EOS scheduling system visible',
        'tablet device showing Bella EOS revenue reporting dashboard'
      ];
      
      brief.heroSubject = `${deviceVariants[variationIndex]} with colorful data visualizations, business intelligence charts, and management interface clearly visible, positioned on modern spa business office desk`;
    }
    
    return brief;
  }
  
  /**
   * Extract themes from copywriter content
   */
  private extractThemesFromContent(messages: string[]): {
    hasTechnology: boolean;
    hasResults: boolean;
    hasEfficiency: boolean;
    hasGrowth: boolean;
    hasInnovation: boolean;
    hasCustomer: boolean;
    specificNumbers: string[];
  } {
    const combinedText = messages.join(' ').toLowerCase();
    
    return {
      hasTechnology: /phần mềm|hệ thống|ai|tự động|công nghệ|digital|app|platform/.test(combinedText),
      hasResults: /tăng|doanh thu|lợi nhuận|hiệu quả|kết quả|đạt được/.test(combinedText),
      hasEfficiency: /tiết kiệm|nhanh|tối ưu|giảm|hiệu suất|tự động/.test(combinedText),
      hasGrowth: /phát triển|mở rộng|tăng trưởng|scale|lớn mạnh/.test(combinedText),
      hasInnovation: /mới|đột phá|tiên tiến|sáng tạo|innovation|hiện đại/.test(combinedText),
      hasCustomer: /khách hàng|customer|trải nghiệm|hài lòng|chăm sóc/.test(combinedText),
      specificNumbers: combinedText.match(/\d+[%x×]?/g) || []
    };
  }
  
  /**
   * Generate contextual headline based on theme - TRULY RANDOM
   */
  private generateHeadlineFromTheme(themes: any, focusTheme: string): string {
    const { specificNumbers } = themes;
    
    // Expanded headline pool - 40+ variations
    const allHeadlines = {
      technology: [
        'PHẦN MỀM AI QUẢN TRỊ SPA',
        'HỆ THỐNG BELLA EOS',
        'CÔNG NGHỆ QUẢN LÝ THẾ HỆ MỚI',
        'GIẢI PHÁP QUẢN TRỊ SPA TOÀN DIỆN',
        'PHẦN MỀM QUẢN LÝ SPA CHUYÊN NGHIỆP',
        'NỀN TẢNG ĐIỀU HÀNH SPA THÔNG MINH',
        'SPA 4.0 VỚI CÔNG NGHỆ AI',
        'QUẢN TRỊ SPA HIỆN ĐẠI',
      ],
      results: [
        'DOANH THU TĂNG VƯỢT KẾ HOẠCH',
        'TĂNG DOANH SỐ 150% TRONG 6 THÁNG',
        'DOANH THU X2 VỚI BELLA EOS',
        'LỢI NHUẬN TĂNG 3 LẦN',
        'HIỆU QUẢ KINH DOANH TĂNG CAO',
        'ROI RÕ RÀNG SAU 3 THÁNG',
        'DOANH SỐ VƯỢT MỤC TIÊU',
        'KẾT QUẢ VƯỢT TRỘI',
      ],
      efficiency: [
        'TỐI ƯU VẬN HÀNH SPA TỰ ĐỘNG',
        'TIẾT KIỆM 40% THỜI GIAN QUẢN LÝ',
        'QUẢN TRỊ SPA THÔNG MINH HIỆU QUẢ',
        'TỰ ĐỘNG HÓA TOÀN BỘ WORKFLOW',
        'VẬN HÀNH ĐƠN GIẢN HƠN BAO GIỜ HẾT',
        'QUẢN LÝ DỄ DÀNG - CHÍNH XÁC - NHANH',
        'GIẢM 50% CÔNG VIỆC THỪA',
        'HIỆU SUẤT VẬN HÀNH TỐI ĐA',
      ],
      growth: [
        'MỞ RỘNG SPA DỄ DÀNG VỚI BELLA',
        'NỀN TẢNG PHÁT TRIỂN BỀN VỮNG',
        'SCALE SPA TỪ 1 LÊN 100 CHI NHÁNH',
        'CHUỖI SPA CHUYÊN NGHIỆP',
        'TĂNG TRƯỞNG KHÔNG GIỚI HẠN',
        'PHÁT TRIỂN SPA ĐA CHI NHÁNH',
        'NÂNG TẦM SPA VIỆT',
        'MỞ RỘNG QUY MÔ NHANH CHÓNG',
      ],
      innovation: [
        'CHUYỂN ĐỔI SỐ SPA HIỆN ĐẠI',
        'SPA 4.0 VỚI CÔNG NGHỆ AI',
        'NÂNG TẦM SPA VIỆT',
        'ĐỔI MỚI TOÀN DIỆN VỚI BELLA EOS',
        'SPA THỜI ĐẠI MỚI',
        'TƯƠNG LAI QUẢN TRỊ SPA ĐÃ ĐẾN',
        'CÔNG NGHỆ QUẢN TRỊ ĐẲNG CẤP MỚI',
        'ĐỘT PHÁ VẬN HÀNH SPA',
      ]
    };
    
    // Get headlines for this theme
    let headlines = allHeadlines[focusTheme as keyof typeof allHeadlines] || allHeadlines.technology;
    
    // If we have numbers in content, add dynamic headlines for results theme
    if (specificNumbers && specificNumbers.length > 0 && focusTheme === 'results') {
      const number = specificNumbers[0];
      headlines = [
        `TĂNG DOANH THU ${number}% VỚI AI`,
        `DOANH SỐ TĂNG ${number}% TRONG 6 THÁNG`,
        `HIỆU QUẢ TĂNG ${number}% CÙNG BELLA`,
        `${number}% TĂNG TRƯỞNG BỀN VỮNG`,
        `DOANH THU +${number}% VỚI BELLA EOS`,
        ...headlines
      ];
    }
    
    // TRULY RANDOM selection using Math.random()
    const randomIndex = Math.floor(Math.random() * headlines.length);
    const selected = headlines[randomIndex];
    
    console.log(`[CreativeDirectorAgent] 🎲 Random headline (${focusTheme}): "${selected}" [${randomIndex + 1}/${headlines.length}]`);
    
    return selected;
  }
  
  /**
   * Generate benefits from copywriter content - TRULY RANDOM
   */
  private generateBenefitsFromContent(messages: string[], index: number): string[][] {
    const themes = this.extractThemesFromContent(messages);
    
    // All available benefits - 25 items across 5 categories
    const benefitPool: Record<string, string[]> = {
      tech: [
        '⚡ Phần mềm AI tự động xếp lịch',
        '🖥️ Dashboard quản lý trực quan',
        '📱 App mobile quản trị mọi lúc',
        '🤖 Phân tích dự báo bằng AI',
        '💻 Hệ thống cloud an toàn'
      ],
      efficiency: [
        '⏱️ Tiết kiệm 40 giờ/tháng',
        '⚡ Tự động hóa 80% công việc',
        '📊 Báo cáo tức thời không cần Excel',
        '🎯 Xếp ca KTV tối ưu tự động',
        '📈 Tracking hiệu suất real-time'
      ],
      results: [
        '💰 Tăng doanh thu 150% trong 6 tháng',
        '📈 ROI rõ ràng sau 3 tháng',
        '🎯 Conversion tăng 40%',
        '💎 Giá trị khách hàng tăng 2X',
        '🚀 Doanh số tăng ổn định'
      ],
      support: [
        '📞 Hỗ trợ 24/7 tiếng Việt',
        '🎓 Đào tạo miễn phí nhân viên',
        '🔧 Cài đặt trong 1 ngày',
        '🛡️ Bảo mật chuẩn enterprise',
        '🔄 Cập nhật tính năng liên tục'
      ],
      scale: [
        '🏢 Quản lý đa chi nhánh dễ dàng',
        '📊 Scale không giới hạn',
        '🌐 Mở rộng toàn quốc',
        '💼 Phù hợp từ 1-100 chi nhánh',
        '🚀 Tăng trưởng bền vững'
      ]
    };
    
    // TRULY RANDOM category selection
    const categories = ['tech', 'efficiency', 'results', 'support', 'scale'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // TRULY RANDOM benefit selection from that category
    const categoryBenefits = benefitPool[randomCategory];
    const shuffled = [...categoryBenefits].sort(() => Math.random() - 0.5);
    const selectedBenefits = shuffled.slice(0, 3);
    
    console.log(`[CreativeDirectorAgent] 🎲 Random benefits (${randomCategory}): ${selectedBenefits.length} selected from ${categoryBenefits.length} available`);
    
    // Return 5 DIFFERENT random sets (not fixed rotation)
    return Array.from({ length: 5 }, () => {
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const catBenefits = benefitPool[randomCat];
      const shuffledCat = [...catBenefits].sort(() => Math.random() - 0.5);
      return shuffledCat.slice(0, 3);
    });
  }
  
  /**
   * Get content history constraints for messaging variation
   */
  private getContentHistoryConstraints(): string {
    const tracker = ContentHistoryTracker.getInstance();
    const constraints = tracker.generateContentConstraints();
    
    if (constraints.headlineConstraints.length === 0) {
      return 'No previous content - you have full creative freedom for messaging.';
    }
    
    console.log('[CreativeDirectorAgent] 📝 Applying content variation constraints');
    console.log('[CreativeDirectorAgent] 📝 Previous headlines:', constraints.headlineConstraints.length);
    console.log('[CreativeDirectorAgent] 📝 Previous CTAs:', constraints.ctaConstraints.length);
    
    return `
${constraints.overallGuidance}

### HEADLINE CONSTRAINTS:
${constraints.headlineConstraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### KEY BENEFITS CONSTRAINTS:
${constraints.benefitConstraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### CALL-TO-ACTION CONSTRAINTS:
${constraints.ctaConstraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**CRITICAL**: Your posterHeadline, keyBenefits, and callToAction MUST be fresh and different from all previous versions listed above.
`;
  }

  /**
   * Get image history constraints to avoid repetition
   */
  private getImageHistoryConstraints(): string {
    const tracker = ImageHistoryTracker.getInstance();
    const constraints = tracker.generateAvoidConstraints();
    
    if (constraints.length === 0) {
      return 'No previous images yet - you have full creative freedom for the first generation.';
    }
    
    console.log('[CreativeDirectorAgent] 🚫 Applying', constraints.length, 'avoid constraints from history');
    
    return `
**CRITICAL: These are RECENT images we've already created. Your new design MUST be visually different:**

${constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**Your creative brief MUST result in an image that looks distinctly different from the above.**
Think: different subject arrangement, different environment, different color palette, different lighting style.
`;
  }

  /**
   * Generate variation seed for creative diversity
   */
  private generateVariationSeed(): string {
    const strategies = [
      'bird-eye-aerial-view',
      'extreme-macro-closeup', 
      'dutch-angle-dynamic',
      'worm-eye-upward',
      'golden-hour-warmth',
      'blue-hour-coolness',
      'midday-brightness',
      'twilight-ambiance',
      'photorealistic-detail',
      'minimalist-flat',
      'cinematic-drama',
      'editorial-magazine',
      'tech-gradient',
      'hero-single-focus',
      'cluster-arrangement',
      'lifestyle-in-use',
      'detail-texture-shot',
      'warm-golden-tone',
      'cool-blue-teal',
      'vibrant-saturated',
      'muted-pastel',
      'shallow-depth-blur',
      'deep-focus-sharp'
    ];
    
    const randomIndex = Math.floor(Math.random() * strategies.length);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    const seed = `${strategies[randomIndex]}_${timestamp}_${randomSuffix}`;
    console.log('[CreativeDirectorAgent] 🎨 Variation seed generated:', seed);
    console.log('[CreativeDirectorAgent] 🎨 Selected strategy:', strategies[randomIndex]);
    
    return seed;
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
    
    // Ensure keyBenefits array exists
    if (!Array.isArray(brief.keyBenefits) || brief.keyBenefits.length === 0) {
      brief.keyBenefits = this.generateDefaultKeyBenefits('');
    }
    
    // Ensure callToAction exists
    if (!brief.callToAction) {
      brief.callToAction = 'Đăng ký trải nghiệm ngay';
    }
  }

  /**
   * Generate domain-specific key benefits for fallback
   */
  private generateDefaultKeyBenefits(objectiveLower: string): string[] {
    if (objectiveLower.includes('spa') || objectiveLower.includes('thẩm mỹ') || objectiveLower.includes('làm đẹp')) {
      return [
        'Tối ưu xếp lịch & phân ca KTV',
        'Báo cáo doanh thu thời gian thực',
        'Giữ chân 95% khách hàng VIP'
      ];
    }
    
    if (objectiveLower.includes('nhà hàng') || objectiveLower.includes('restaurant') || objectiveLower.includes('f&b')) {
      return [
        'Quản lý đặt bàn & thực đơn',
        'Tối ưu chi phí nguyên liệu',
        'Tăng 40% hiệu suất phục vụ'
      ];
    }
    
    if (objectiveLower.includes('bất động sản') || objectiveLower.includes('real estate')) {
      return [
        'Quản lý danh mục BĐS toàn diện',
        'Tự động hóa marketing đa kênh',
        'Phân tích xu hướng thị trường'
      ];
    }
    
    // Generic enterprise
    return [
      'Tự động hóa 80% vận hành',
      'Theo dõi KPI thời gian thực',
      'Tăng 300% hiệu suất làm việc'
    ];
  }

  /**
   * Generate domain-specific CTA for fallback
   */
  private generateDefaultCTA(objectiveLower: string): string {
    if (objectiveLower.includes('demo') || objectiveLower.includes('trải nghiệm')) {
      return 'Đăng ký trải nghiệm ngay';
    }
    
    if (objectiveLower.includes('ưu đãi') || objectiveLower.includes('giảm giá')) {
      return 'Nhận ưu đãi đặc biệt';
    }
    
    if (objectiveLower.includes('tư vấn') || objectiveLower.includes('liên hệ')) {
      return 'Đặt lịch tư vấn miễn phí';
    }
    
    // Default
    return 'Đăng ký trải nghiệm ngay';
  }
}
