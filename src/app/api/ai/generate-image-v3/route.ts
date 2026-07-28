import { NextResponse } from 'next/server';
import { CreativeIntelligenceEngine } from '@/core/creative/creative-intelligence-engine';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-image-v3
 * 
 * BELLA EOS CREATIVE INTELLIGENCE ENGINE v3
 * 4-Layer Architecture:
 * - Layer 1: Business Context Aggregation
 * - Layer 2: Creative Reasoning (LLM)
 * - Layer 3: Prompt Composition
 * - Layer 4: Model Adaptation
 * 
 * Priority Waterfall:
 * 1. Google Imagen 3
 * 2. Gemini Native Image
 * 3. OpenAI DALL-E 3
 * 4. Fal.ai Flux.1 Schnell
 * 5. Bella SVG Fallback
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

    console.log('[API v3] ═══════════════════════════════════════════');
    console.log('[API v3] Creative Intelligence Engine v3 - Request received');
    console.log('[API v3] Objective:', objective.substring(0, 80));
    console.log('[API v3] Has copywriter content:', !!copywriterContent);
    console.log('[API v3] Brand:', brandDna?.brandName || 'BELLA EOS');
    console.log('[API v3] ═══════════════════════════════════════════');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREATIVE INTELLIGENCE PIPELINE
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

    const { creativeBrief, composedPrompt, modelPrompts } = creativeOutput;

    console.log('[API v3] ═══════════════════════════════════════════');
    console.log('[API v3] Creative Intelligence Pipeline Complete');
    console.log('[API v3] Headline:', creativeBrief.posterHeadline);
    console.log('[API v3] Design Direction:', creativeBrief.designDirection);
    console.log('[API v3] Confidence:', creativeBrief.confidenceScore);
    console.log('[API v3] Available prompts:', Object.keys(modelPrompts));
    console.log('[API v3] ═══════════════════════════════════════════');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MODEL SELECTION & EXECUTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Determine execution order based on preferred model
    // ENABLED: Imagen 4 image generation (requires paid Gemini API key)
    const tryImagen = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) return null;

      const imagePrompt = modelPrompts.imagen || composedPrompt.basePrompt;

      // Imagen 4 models (2026 - requires paid API key)
      const modelsToTry = [
        'imagen-4.0-generate-001',      // Imagen 4 Standard
        'imagen-4.0-fast-generate-001', // Imagen 4 Fast
        'imagen-4.0-ultra-generate-001' // Imagen 4 Ultra (best quality)
      ];

      for (const modelId of modelsToTry) {
        try {
          console.log(`[API v3] Trying Imagen 4 (${modelId})...`);
          
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instances: [{ prompt: imagePrompt }],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: format,
                  outputMimeType: 'image/jpeg'
                  // NOTE: negativePrompt no longer supported in Imagen 4
                }
              })
            }
          );

          const data = await res.json();
          
          if (res.ok && data.predictions?.[0]?.bytesBase64Encoded) {
            const mimeType = data.predictions[0].mimeType || 'image/jpeg';
            const base64Data = data.predictions[0].bytesBase64Encoded;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            
            console.log(`[API v3] ✓ Imagen 4 (${modelId}) succeeded`);
            
            return {
              success: true,
              provider: 'google-imagen-4',
              model: modelId,
              imageUrl: saveBase64ToPublic(dataUrl),
              creativeBrief: {
                headline: creativeBrief.posterHeadline,
                campaignGoal: creativeBrief.campaignGoal,
                designDirection: creativeBrief.designDirection,
                confidence: creativeBrief.confidenceScore
              },
              reasoning: creativeBrief.reasoningChain,
              prompt: imagePrompt.substring(0, 200) + '...',
              pipelineVersion: '3.0.0'
            };
          }
          
          console.warn(`[API v3] Imagen 4 (${modelId}) failed:`, data.error?.message || 'Unknown error');
        } catch (e) {
          console.warn(`[API v3] Imagen 4 (${modelId}) error:`, e);
        }
      }
      return null;
    };

    const tryGeminiImage = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) return null;

      const imagePrompt = modelPrompts.imagen || composedPrompt.basePrompt;

      // Gemini 3.x image models (2026)
      const geminiImageModels = [
        'gemini-3.1-flash-image',       // Nano Banana 2
        'gemini-3-pro-image',           // Nano Banana Pro
        'gemini-2.5-flash-image'        // Gemini 2.5 with image
      ];

      for (const model of geminiImageModels) {
        try {
          console.log(`[API v3] Trying Gemini Image (${model})...`);
          
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Generate a high quality ${format} marketing banner image: ${imagePrompt}`
                  }]
                }]
              })
            }
          );

          const data = await res.json();
          const part = data.candidates?.[0]?.content?.parts?.[0];
          
          if (res.ok && part?.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Data = part.inlineData.data;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            
            console.log(`[API v3] ✓ Gemini Image (${model}) succeeded`);
            
            return {
              success: true,
              provider: 'google-gemini-image',
              model: model,
              imageUrl: saveBase64ToPublic(dataUrl),
              creativeBrief: {
                headline: creativeBrief.posterHeadline,
                campaignGoal: creativeBrief.campaignGoal,
                designDirection: creativeBrief.designDirection,
                confidence: creativeBrief.confidenceScore
              },
              reasoning: creativeBrief.reasoningChain,
              prompt: imagePrompt.substring(0, 200) + '...',
              pipelineVersion: '3.0.0'
            };
          }
          
          console.warn(`[API v3] Gemini Image (${model}) failed:`, data.error?.message || 'Unknown error');
        } catch (e) {
          console.warn(`[API v3] Gemini Image (${model}) error:`, e);
        }
      }
      return null;
    };

    const tryDalle = async () => {
      const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
      if (!openaiKey) return null;

      const dallePrompt = modelPrompts.dalle || composedPrompt.basePrompt;

      try {
        console.log('[API v3] Trying OpenAI DALL-E 3...');
        
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: dallePrompt,
            n: 1,
            size: format === '1:1' ? '1024x1024' : '1792x1024',
            quality: 'hd'
          })
        });

        const data = await res.json();
        
        if (res.ok && data.data?.[0]?.url) {
          const generatedUrl = data.data[0].url;
          
          console.log('[API v3] ✓ DALL-E 3 succeeded');
          
          return {
            success: true,
            provider: 'openai',
            model: 'dall-e-3',
            imageUrl: generatedUrl,
            creativeBrief: {
              headline: creativeBrief.posterHeadline,
              campaignGoal: creativeBrief.campaignGoal,
              designDirection: creativeBrief.designDirection,
              confidence: creativeBrief.confidenceScore
            },
            reasoning: creativeBrief.reasoningChain,
            prompt: dallePrompt.substring(0, 200) + '...',
            pipelineVersion: '3.0.0'
          };
        }
      } catch (e) {
        console.warn('[API v3] DALL-E 3 error:', e);
      }
      return null;
    };

    const tryFlux = async () => {
      const falKey = client_fal_key || process.env.FAL_KEY;
      if (!falKey) return null;

      const fluxPrompt = modelPrompts.flux || composedPrompt.basePrompt;
      const negativePrompt = composedPrompt.negativePrompt;

      try {
        console.log('[API v3] Trying Fal.ai Flux.1...');
        
        const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt: fluxPrompt,
            image_size: format === '1:1' ? 'square' : 'landscape_16_9',
            num_inference_steps: 4,
            negative_prompt: negativePrompt
          })
        });

        const data = await res.json();
        
        if (res.ok && data.images?.[0]?.url) {
          const generatedUrl = data.images[0].url;
          
          console.log('[API v3] ✓ Flux.1 succeeded');
          
          return {
            success: true,
            provider: 'fal.ai',
            model: 'flux.1-schnell',
            imageUrl: generatedUrl,
            creativeBrief: {
              headline: creativeBrief.posterHeadline,
              campaignGoal: creativeBrief.campaignGoal,
              designDirection: creativeBrief.designDirection,
              confidence: creativeBrief.confidenceScore
            },
            reasoning: creativeBrief.reasoningChain,
            prompt: fluxPrompt.substring(0, 200) + '...',
            pipelineVersion: '3.0.0'
          };
        }
      } catch (e) {
        console.warn('[API v3] Flux.1 error:', e);
      }
      return null;
    };

    // Execute waterfall
    const providers = [tryImagen, tryGeminiImage, tryDalle, tryFlux];
    
    for (const provider of providers) {
      const result = await provider();
      if (result) {
        console.log('[API v3] ═══════════════════════════════════════════');
        console.log(`[API v3] ✓ Success with ${result.provider}`);
        console.log('[API v3] ═══════════════════════════════════════════');
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CANVAS COMPOSITION: Add text overlay to AI-generated background
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        try {
          console.log('[API v3] Starting Canvas composition...');
          console.log('[API v3] Background:', result.imageUrl.substring(0, 100));
          
          const { CanvasCompositor } = await import('@/core/creative/composition/canvas-compositor');
          
          // backgroundImagePath là relative path /temp-banners/xxx.png
          const composited = await CanvasCompositor.compose({
            backgroundImagePath: result.imageUrl, // /temp-banners/xxx.png
            creativeBrief,
            brandDna: brandDna || {
              brandName: 'BELLA EOS',
              brandColors: { primary: '#061E17', accent: '#D4AF37' }
            },
            format: format as any
          });
          
          // Save composited image
          const compositedDataUrl = `data:${composited.format};base64,${composited.imageBuffer.toString('base64')}`;
          const finalImageUrl = saveBase64ToPublic(compositedDataUrl);
          
          console.log('[API v3] ✓ Canvas composition complete');
          console.log('[API v3] Final banner:', finalImageUrl);
          
          return NextResponse.json({
            ...result,
            imageUrl: finalImageUrl,
            model: `${result.model} + canvas-overlay`,
            pipelineVersion: '3.1.0-canvas',
            compositionMethod: 'ai-background + canvas-typography'
          });
          
        } catch (e) {
          console.error('[API v3] Canvas composition failed:', e);
          console.log('[API v3] Falling back to raw AI image');
          // Return raw image without overlay
          return NextResponse.json(result);
        }
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FALLBACK: SVG GENERATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log('[API v3] All AI providers failed, using SVG fallback...');

    const baseUrl = getBaseUrl();
    const svgUrl = `${baseUrl}/api/ai/banner-image?${new URLSearchParams({
      headline: creativeBrief.posterHeadline || 'GIẢI PHÁP TỐI ƯU',
      badge: creativeBrief.posterHeadline || 'GIẢI PHÁP TỐI ƯU',
      cta: 'ĐĂNG KÝ TRẢI NGHIỆM NGAY',
      brandName: brandDna?.brandName || 'BELLA EOS',
      objective: objective,
      t: String(Date.now())
    }).toString()}`;
    
    console.log('[API v3] SVG fallback URL:', svgUrl);

    return NextResponse.json({
      success: true,
      provider: 'bella-svg-engine',
      model: 'svg-fallback-v3',
      imageUrl: svgUrl,
      creativeBrief: {
        headline: creativeBrief.posterHeadline,
        campaignGoal: creativeBrief.campaignGoal,
        designDirection: creativeBrief.designDirection,
        confidence: creativeBrief.confidenceScore
      },
      reasoning: creativeBrief.reasoningChain,
      note: 'AI providers unavailable, generated with local SVG engine',
      pipelineVersion: '3.0.0'
    });

  } catch (err: any) {
    console.error('[API v3] Fatal error:', err);
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
    
    const filename = `gen_v3_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const filepath = path.join(dir, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);
    
    return `/temp-banners/${filename}`;
  } catch (err) {
    console.error('[API v3] Failed to save base64 image:', err);
    return dataUrl;
  }
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
