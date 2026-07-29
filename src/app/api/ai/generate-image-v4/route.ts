import { NextResponse } from 'next/server';
import { CreativeIntelligenceEngine } from '@/core/creative/creative-intelligence-engine';
import { ExpertPromptComposer } from '@/core/creative/composition/expert-prompt-composer';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-image-v4
 * 
 * BELLA EOS CREATIVE INTELLIGENCE ENGINE v4
 * Uses Google Gemini Interactions API for native image generation
 * 
 * Models:
 * - gemini-3.1-flash-image (Nano Banana 2) - Best balance
 * - gemini-2.5-flash-image (Nano Banana) - Legacy
 * - DALL-E 3 (OpenAI) - Fallback
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
    console.log('[API v4] Creative Intelligence Engine v4 - Interactions API');
    console.log('[API v4] Objective:', objective.substring(0, 80));
    console.log('[API v4] Brand:', brandDna?.identity?.brandName || brandDna?.brandName || 'BELLA EOS');
    console.log('[API v4] Keys:', {
      gemini: client_gemini_key ? `YES (${client_gemini_key.substring(0, 20)}...)` : 'NO',
      openai: client_openai_key ? 'YES' : 'NO'
    });
    console.log('[API v4] ═══════════════════════════════════════════');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: CREATIVE REASONING
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
    console.log('[API v4] ✓ Creative Brief:', creativeBrief.posterHeadline);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: EXPERT PROMPT COMPOSITION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
        industry: 'general_business',
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

    console.log('[API v4] ✓ Prompt composed:', expertPrompt.mainPrompt.length, 'chars');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: AI GENERATION VIA INTERACTIONS API
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Try Google Imagen API (predict endpoint)
    const tryImagen = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) {
        console.log('[API v4] No Gemini key for Imagen');
        return null;
      }

      const models = [
        'imagen-4.0-ultra-generate-001',
        'imagen-4.0-generate-001',
        'imagen-4.0-fast-generate-001',
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001'
      ];

      for (const modelName of models) {
        try {
          console.log(`[API v4] Trying Imagen (${modelName})...`);
          
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instances: [{ prompt: expertPrompt.mainPrompt }],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: format === '1:1' ? '1:1' : '16:9',
                  outputMimeType: 'image/png'
                }
              })
            }
          );

          const data = await res.json();
          
          if (!res.ok) {
            console.error(`[API v4] Imagen (${modelName}) error:`, JSON.stringify(data).substring(0, 300));
            continue;
          }

          const b64 = data.predictions?.[0]?.bytesBase64Encoded;
          if (b64) {
            const dataUrl = `data:image/png;base64,${b64}`;
            const savedUrl = saveBase64ToPublic(dataUrl);
            
            console.log(`[API v4] ✓ SUCCESS: ${savedUrl}`);
            
            return NextResponse.json({
              success: true,
              provider: 'google-imagen',
              model: modelName,
              imageUrl: savedUrl,
              creativeBrief: {
                headline: creativeBrief.posterHeadline,
                keyBenefits: creativeBrief.keyBenefits,
                callToAction: creativeBrief.callToAction
              },
              note: `${modelName} generated image via predict API`
            });
          }
          
          console.warn(`[API v4] Imagen (${modelName}): No image in response`);
        } catch (e: any) {
          console.error(`[API v4] Imagen (${modelName}) exception:`, e.message);
        }
      }
      return null;
    };

    // Try DALL-E 3
    const tryDallE = async () => {
      const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
      if (!openaiKey) return null;

      try {
        console.log('[API v4] Trying DALL-E 3...');
        
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
          console.log('[API v4] ✓ DALL-E 3 success');
          
          return NextResponse.json({
            success: true,
            provider: 'openai',
            model: 'dall-e-3',
            imageUrl: data.data[0].url,
            creativeBrief: {
              headline: creativeBrief.posterHeadline,
              keyBenefits: creativeBrief.keyBenefits,
              callToAction: creativeBrief.callToAction
            }
          });
        }
      } catch (e: any) {
        console.error('[API v4] DALL-E exception:', e.message);
      }
      return null;
    };

    // Execute waterfall
    const result = await tryImagen() || await tryDallE();
    
    if (result) {
      return result;
    }

    // Fallback to error response
    console.log('[API v4] All providers failed');
    return NextResponse.json({
      success: false,
      error: 'No AI provider available',
      creativeBrief: {
        headline: creativeBrief.posterHeadline,
        keyBenefits: creativeBrief.keyBenefits
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error('[API v4] Fatal error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

function saveBase64ToPublic(dataUrl: string): string {
  try {
    if (!dataUrl.startsWith('data:image')) return dataUrl;

    const base64Data = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filename = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const publicDir = path.join(process.cwd(), 'public', 'temp-banners');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filepath = path.join(publicDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    return `/temp-banners/${filename}`;
  } catch (e: any) {
    console.error('[saveBase64ToPublic] Error:', e.message);
    return dataUrl;
  }
}
