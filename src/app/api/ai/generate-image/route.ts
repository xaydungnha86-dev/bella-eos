import { NextResponse } from 'next/server';
import { PosterDesignSkill, BrandDnaContext } from '@/core/skills/poster-design-skill';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-image
 *
 * DYNAMIC ENTERPRISE GRAPHIC BANNER DESIGN ENGINE (Bella EOS Creative Worker Gateway)
 * Ingests:
 *  - Business Context (Brand DNA, Logo, Colors, Voice Tone)
 *  - Copywriter Worker Output from previous step (Dynamic Headline, Offer Badge, CTA)
 * Returns:
 *  - Dynamic SVG Commercial Poster Banner (data URL) OR DALL-E 3 / Flux.1 AI Image URL
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      prompt,
      objective = 'Spa Management Software Banner',
      headline,
      offerBadge,
      ctaText,
      copywriterContent,
      brandDna,
      client_openai_key,
      client_fal_key
    } = body as {
      prompt?: string;
      objective?: string;
      headline?: string;
      offerBadge?: string;
      ctaText?: string;
      copywriterContent?: string;
      brandDna?: BrandDnaContext;
      client_openai_key?: string;
      client_fal_key?: string;
    };

    // Extract dynamic headline & offer from Copywriter content if provided
    let dynamicHeadline = headline || 'BELLA EOS GIẢI QUYẾT TRIỆT ĐỂ BÀI TOÁN SPA';
    let dynamicBadge = offerBadge || '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
    let dynamicCta = ctaText || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';

    if (copywriterContent) {
      const lines = copywriterContent.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        dynamicHeadline = lines[0].replace(/^[#*🎯⚡👉🔥\s]+/, '').substring(0, 48);
      }
      const giftLine = lines.find(l => l.includes('🎁') || l.includes('QUÀ TẶNG') || l.includes('Demo') || l.includes('Đặc biệt'));
      if (giftLine) {
        dynamicBadge = giftLine.replace(/^[#*🎁\s]+/, '').substring(0, 48);
      }
      const ctaLine = lines.find(l => l.includes('https://') || l.includes('👉') || l.includes('Đăng ký') || l.includes('nhận'));
      if (ctaLine) {
        dynamicCta = ctaLine.replace(/^[👉*#\s]+/, '').substring(0, 32);
      }
    }

    // Build structured 4K Commercial Sales Poster Prompt via PosterDesignSkill
    const imagePrompt = prompt || PosterDesignSkill.buildSalesPosterPrompt(objective, dynamicHeadline, brandDna);

    // ── 1. Try OpenAI DALL-E 3 API ───────────────────────────────────────────
    const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        console.log('[AI Image Generator] Calling OpenAI DALL-E 3 API...');
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1792x1024',
            quality: 'standard'
          })
        });

        const data = await res.json();
        if (res.ok && data.data?.[0]?.url) {
          const generatedUrl = data.data[0].url;
          console.log('[AI Image Generator] ✅ DALL-E 3 Image Rendered:', generatedUrl);
          return NextResponse.json({
            success: true,
            provider: 'openai',
            model: 'dall-e-3',
            imageUrl: generatedUrl,
            prompt: imagePrompt
          });
        }
        console.warn('[AI Image Generator] DALL-E 3 notice:', data.error?.message);
      } catch (e) {
        console.warn('[AI Image Generator] DALL-E 3 error:', e);
      }
    }

    // ── 2. Try Fal.ai Flux.1 API ─────────────────────────────────────────────
    const falKey = client_fal_key || process.env.FAL_KEY;
    if (falKey) {
      try {
        console.log('[AI Image Generator] Calling Fal.ai Flux.1 API...');
        const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            image_size: 'landscape_16_9',
            num_inference_steps: 4
          })
        });

        const data = await res.json();
        if (res.ok && data.images?.[0]?.url) {
          const generatedUrl = data.images[0].url;
          console.log('[AI Image Generator] ✅ Fal.ai Flux Image Rendered:', generatedUrl);
          return NextResponse.json({
            success: true,
            provider: 'fal.ai',
            model: 'flux.1-schnell',
            imageUrl: generatedUrl,
            prompt: imagePrompt
          });
        }
      } catch (e) {
        console.warn('[AI Image Generator] Fal.ai error:', e);
      }
    }

    // ── 3. Dynamic Graphic Sales Poster SVG Render Engine Fallback ───────────
    // Truly designs an authentic commercial poster graphic with embedded Spa environment,
    // Enterprise logo, dynamic Copywriter headline, offer badge, and 3D Spa UI mockup.
    const dynamicSvgDataUrl = PosterDesignSkill.renderDynamicPosterSvg({
      headline: dynamicHeadline,
      offerBadge: dynamicBadge,
      ctaText: dynamicCta,
      brandDna
    });

    return NextResponse.json({
      success: true,
      provider: 'bella-graphic-design-engine',
      model: 'poster-design-skill-v2',
      imageUrl: dynamicSvgDataUrl,
      headline: dynamicHeadline,
      offerBadge: dynamicBadge,
      ctaText: dynamicCta,
      note: 'Graphic Design Engine Executed. Đã tự động đọc bối cảnh Spa, lấy Logo Bella EOS, trích xuất tiêu đề AI Copywriter ở bước trước để thiết kế Poster hoàn chỉnh.'
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
