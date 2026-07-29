import { NextResponse } from 'next/server';
import { CreativeIntelligenceEngine } from '@/core/creative/creative-intelligence-engine';
import { ExpertPromptComposer } from '@/core/creative/composition/expert-prompt-composer';
import { ImageHistoryTracker } from '@/core/creative/memory/image-history-tracker';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-image-v4
 * 
 * BELLA EOS CREATIVE INTELLIGENCE ENGINE v4
 * **NEW APPROACH: AI RENDERS EVERYTHING INCLUDING TEXT**
 * 
 * Architecture:
 * - Layer 1: Business Context Aggregation
 * - Layer 2: Creative Reasoning (LLM) - Reads business data
 * - Layer 3: Expert Design Prompt (LLM) - Generates prompts like professional designer
 * - Layer 4: Model Generation - AI renders COMPLETE banner (background + text)
 * 
 * Supported AI Models:
 * - Imagen 4.0 Ultra (Google) - Highest quality, best text rendering
 * - Imagen 4.0 Fast (Google) - Faster generation, good quality
 * - DALL-E 3 (OpenAI) - Fallback option
 * 
 * NO CANVAS COMPOSITOR - AI does all text rendering
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      objective = 'Create marketing banner',
      copywriterContent,
      brandDna,
      format = '16:9',
      tenantId = 'default',
      model,
      client_openai_key,
      client_gemini_key,
      client_fal_key,
    } = body;

    console.log('[API v4] ═══════════════════════════════════════════');
    console.log('[API v4] Creative Intelligence Engine v4 - AI renders text');
    console.log('[API v4] Objective:', objective.substring(0, 80));
    console.log('[API v4] Brand:', brandDna?.identity?.brandName || brandDna?.brandName || 'BELLA EOS');
    console.log('[API v4] ═══════════════════════════════════════════');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: BUSINESS CONTEXT AGGREGATION + CREATIVE REASONING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const engine = new CreativeIntelligenceEngine();
    const creativeOutput = await engine.generate({
      objective,
      copywriterSnippet: copywriterContent,
      brandDna,
      format: format as any,
      medium: 'image',
      tenantId,
      preferredModel: model,
      clientKeys: {
        gemini: client_gemini_key,
        openai: client_openai_key,
        anthropic: undefined
      }
    });

    const { creativeBrief } = creativeOutput;

    console.log('[API v4] ✓ Creative Brief generated');
    console.log('[API v4] Headline:', creativeBrief.posterHeadline);
    console.log('[API v4] Key Benefits:', creativeBrief.keyBenefits);
    console.log('[API v4] CTA:', creativeBrief.callToAction);
    console.log('[API v4] Confidence:', creativeBrief.confidenceScore);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: EXPERT DESIGN PROMPT COMPOSITION
    // Generate professional-grade prompt that tells AI exactly how to render text
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Normalize brandDna structure
    const normalizedBrandDna = {
      identity: brandDna?.identity || {
        brandName: brandDna?.brandName || 'BELLA EOS',
        targetSegment: brandDna?.targetSegment || 'Enterprise clients'
      },
      voice: brandDna?.voice || {
        tone: brandDna?.voiceTone || 'Professional & Premium'
      },
      visual: brandDna?.visual || {
        style: brandDna?.visualStyle || brandDna?.designStyle || 'Modern Minimalist',
        colors: brandDna?.colors || brandDna?.brandColors || {
          primary: '#061E17',
          accent: '#D4AF37'
        }
      }
    };

    const expertPrompt = await ExpertPromptComposer.compose(
      creativeBrief,
      {
        objective,
        industry: 'general_business', // TODO: Extract from context
        brandName: normalizedBrandDna.identity.brandName,
        targetAudience: normalizedBrandDna.identity.targetSegment
      },
      {
        brandName: normalizedBrandDna.identity.brandName,
        voiceTone: normalizedBrandDna.voice.tone,
        visualStyle: normalizedBrandDna.visual.style,
        colors: normalizedBrandDna.visual.colors
      }
    );

    console.log('[API v4] ═══════════════════════════════════════════');
    console.log('[API v4] ✓ Expert Design Prompt Composed');
    console.log('[API v4] Text to render:');
    console.log('[API v4]   - Headline:', expertPrompt.textContent.headline);
    console.log('[API v4]   - Bullets:', expertPrompt.textContent.bullets.length);
    console.log('[API v4]   - CTA:', expertPrompt.textContent.cta);
    console.log('[API v4]   - Badge:', expertPrompt.textContent.badge);
    console.log('[API v4] Prompt length:', expertPrompt.mainPrompt.length, 'chars');
    console.log('[API v4] ═══════════════════════════════════════════');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: AI GENERATION (WITH TEXT RENDERING)
    // AI models render EVERYTHING in one go
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Try Imagen 4.0 (Google's actual image generation API via Gemini API)
    const tryImagenWithText = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) {
        console.log('[API v4] No Google API key - skipping Imagen 4.0');
        return null;
      }

      // Imagen 4.0 models available via Gemini API
      const imagenModels = [
        'imagen-4.0-ultra-generate-001',  // Highest quality
        'imagen-4.0-fast-generate-001'    // Faster generation
      ];

      for (const modelName of imagenModels) {
        try {
          console.log(`[API v4] Trying ${modelName} with text rendering...`);
          
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instances: [{
                  prompt: expertPrompt.mainPrompt
                }],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: format === '1:1' ? '1:1' : '16:9',
                  negativePrompt: 'blurry, low quality, distorted text, watermark, ugly, distorted',
                  // Imagen 4.0 parameters for variation
                  guidanceScale: 10,  // Lower = more creative (default 12)
                  seed: Math.floor(Math.random() * 1000000)  // Random seed for variation
                }
              })
            }
          );

          const data = await res.json();
          
          if (res.ok && data.predictions?.[0]?.bytesBase64Encoded) {
            const base64Data = data.predictions[0].bytesBase64Encoded;
            const dataUrl = `data:image/png;base64,${base64Data}`;
            const savedUrl = saveBase64ToPublic(dataUrl);
            
            console.log('[API v4] ═══════════════════════════════════════════');
            console.log(`[API v4] ✓ SUCCESS with ${modelName}`);
            console.log('[API v4] Image saved:', savedUrl);
            console.log('[API v4] ═══════════════════════════════════════════');
            
            // Save to image history
            const visualDescription = `${creativeBrief.heroSubject} in ${creativeBrief.environmentDescription}, ${creativeBrief.colorMood} colors, ${creativeBrief.lightingMood} lighting`;
            
            ImageHistoryTracker.getInstance().addImage({
              id: `img_${Date.now()}`,
              timestamp: Date.now(),
              imageUrl: savedUrl,
              visualDescription,
              creativeBrief: {
                headline: creativeBrief.posterHeadline,
                heroSubject: creativeBrief.heroSubject,
                environmentDescription: creativeBrief.environmentDescription,
                colorMood: creativeBrief.colorMood,
                lightingMood: creativeBrief.lightingMood
              }
            });
            
            console.log('[API v4] ✓ Image added to history tracker');
            
            return NextResponse.json({
              success: true,
              provider: 'google-imagen',
              model: modelName,
              imageUrl: savedUrl,
              creativeBrief: {
                headline: creativeBrief.posterHeadline,
                keyBenefits: creativeBrief.keyBenefits,
                callToAction: creativeBrief.callToAction,
                campaignGoal: creativeBrief.campaignGoal,
                confidence: creativeBrief.confidenceScore
              },
              textContent: expertPrompt.textContent,
              compositionMethod: 'ai-renders-everything',
              pipelineVersion: '4.0.0',
              note: 'Imagen 4.0 generated complete banner including text'
            });
          }
          
          console.warn(`[API v4] ${modelName} failed:`, data.error?.message || JSON.stringify(data).substring(0, 200));
        } catch (e: any) {
          console.warn(`[API v4] ${modelName} error:`, e.message);
        }
      }
      return null;
    };

    const tryDalleWithText = async () => {
      const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
      if (!openaiKey) return null;

      try {
        console.log('[API v4] Trying DALL-E 3 with text rendering...');
        
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: expertPrompt.mainPrompt,
            n: 1,
            size: format === '1:1' ? '1024x1024' : '1792x1024',
            quality: 'hd'
          })
        });

        const data = await res.json();
        
        if (res.ok && data.data?.[0]?.url) {
          const generatedUrl = data.data[0].url;
          
          console.log('[API v4] ═══════════════════════════════════════════');
          console.log('[API v4] ✓ SUCCESS with DALL-E 3');
          console.log('[API v4] ═══════════════════════════════════════════');
          
          return NextResponse.json({
            success: true,
            provider: 'openai',
            model: 'dall-e-3',
            imageUrl: generatedUrl,
            creativeBrief: {
              headline: creativeBrief.posterHeadline,
              keyBenefits: creativeBrief.keyBenefits,
              callToAction: creativeBrief.callToAction,
              campaignGoal: creativeBrief.campaignGoal,
              confidence: creativeBrief.confidenceScore
            },
            textContent: expertPrompt.textContent,
            compositionMethod: 'ai-renders-everything',
            pipelineVersion: '4.0.0',
            note: 'DALL-E 3 generated complete banner including text'
          });
        }
      } catch (e: any) {
        console.warn('[API v4] DALL-E 3 error:', e.message);
      }
      return null;
    };

    // Execute waterfall: Imagen 3 → DALL-E 3
    const result = await tryImagenWithText() || await tryDalleWithText();
    
    if (result) {
      return result;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FALLBACK: Return prompt for debugging
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log('[API v4] All AI providers failed');

    return NextResponse.json({
      success: false,
      error: 'No AI provider available',
      expertPrompt: {
        preview: expertPrompt.mainPrompt.substring(0, 500),
        fullLength: expertPrompt.mainPrompt.length,
        textContent: expertPrompt.textContent
      },
      creativeBrief: {
        headline: creativeBrief.posterHeadline,
        keyBenefits: creativeBrief.keyBenefits,
        callToAction: creativeBrief.callToAction
      },
      pipelineVersion: '4.0.0',
      note: 'Configure API keys (Gemini or OpenAI) to generate images'
    }, { status: 200 }); // Return 200 to see debugging info

  } catch (err: any) {
    console.error('[API v4] Fatal error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

function saveBase64ToPublic(dataUrl: string): string {
  try {
    if (!dataUrl.startsWith('data:image')) return dataUrl;
    
    const base64Data = dataUrl.split(';base64,')[1];
    const dir = path.join(process.cwd(), 'public', 'temp-banners');
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // FIXED: Add strong uniqueness - timestamp + 2 random components + counter
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substring(2, 10);
    const random2 = Math.random().toString(36).substring(2, 10);
    const filename = `gen_v4_${timestamp}_${random1}_${random2}.png`;
    const filepath = path.join(dir, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);
    
    console.log('[API v4] Image saved to:', `/temp-banners/${filename}`);
    
    return `/temp-banners/${filename}`;
  } catch (err) {
    console.error('[API v4] Failed to save base64 image:', err);
    return dataUrl;
  }
}
