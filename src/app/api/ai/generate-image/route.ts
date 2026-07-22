import { NextResponse } from 'next/server';
import { PosterDesignSkill, BrandDnaContext } from '@/core/skills/poster-design-skill';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/generate-image
 *
 * DYNAMIC ENTERPRISE GRAPHIC BANNER DESIGN ENGINE (Bella EOS Creative Worker Gateway)
 * Priority Pipeline:
 *  1. Google Gemini Imagen 3 API (Highest 4K Photorealistic AI Image Model)
 *  2. OpenAI DALL-E 3 API
 *  3. Fal.ai Flux.1 Schnell
 *  4. Bella Dynamic Graphic PNG Engine (/api/ai/banner-image)
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
      client_gemini_key,
      client_fal_key,
      model
    } = body as {
      prompt?: string;
      objective?: string;
      headline?: string;
      offerBadge?: string;
      ctaText?: string;
      copywriterContent?: string;
      brandDna?: BrandDnaContext;
      client_openai_key?: string;
      client_gemini_key?: string;
      client_fal_key?: string;
      model?: string;
    };

    // Extract dynamic headline & offer from Copywriter content if provided
    const lowerObj = objective.toLowerCase();
    const brandName = brandDna?.brandName || 'BELLA EOS';
    
    let dynamicHeadline = headline || `GIẢI PHÁP TỐI ƯU CÙNG ${brandName}`;
    let dynamicBadge = offerBadge || '🎁 DEMO / TRẢI NGHIỆM MIỄN PHÍ CÙNG CHUYÊN GIA';
    let dynamicCta = ctaText || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';
    let dynamicBullets: string[] = [
      '⚡ Tối ưu hiệu suất vận hành doanh nghiệp',
      '📈 Tự động hóa quy trình quản lý thông minh',
      '🎯 Hỗ trợ chuyên nghiệp từ chuyên gia'
    ];

    if (lowerObj.includes('spa') || lowerObj.includes('làm đẹp') || lowerObj.includes('thẩm mỹ')) {
      dynamicHeadline = headline || 'BELLA EOS GIẢI QUYẾT TRIỆT ĐỂ BÀI TOÁN SPA';
      dynamicBadge = offerBadge || '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
      dynamicCta = ctaText || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';
      dynamicBullets = [
        '⚡ Tối ưu xếp lịch & phân ca KTV Spa',
        '📈 Báo cáo doanh thu thời gian thực',
        '🎯 Giữ chân 95% khách hàng VIP'
      ];
    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ') || lowerObj.includes('chung cư') || lowerObj.includes('nhà đất')) {
      dynamicHeadline = headline || `MỞ BÁN CĂN HỘ CAO CẤP ${brandName.toUpperCase()}`;
      dynamicBadge = offerBadge || '🎁 NHẬN BẢNG GIÁ & CHÍNH SÁCH MỚI NHẤT';
      dynamicCta = ctaText || 'LIÊN HỆ NGAY';
      dynamicBullets = [
        '⚡ Vị trí đắc địa trung tâm thành phố',
        '📈 Hỗ trợ lãi suất 0% & chiết khấu cực sâu',
        '🎯 Tiện ích 5 sao: Bể bơi vô cực, Sky Bar'
      ];
    } else if (lowerObj.includes('thời trang') || lowerObj.includes('quần áo') || lowerObj.includes('boutique') || lowerObj.includes('shop')) {
      dynamicHeadline = headline || `BỘ SƯU TẬP THỜI TRANG ĐỘC QUYỀN`;
      dynamicBadge = offerBadge || '🎁 GIẢM 20% + FREE SHIP ĐƠN ĐẦU TIÊN';
      dynamicCta = ctaText || 'MUA NGAY';
      dynamicBullets = [
        '⚡ Thiết kế độc quyền dẫn đầu xu hướng',
        '📈 Chất liệu organic cao cấp thân thiện làn da',
        '🎯 Đổi trả dễ dàng trong vòng 7 ngày'
      ];
    }

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

      // Find lines that look like bullet points (starting with common bullet chars or numbers)
      const bulletLines = lines
        .filter(l => l.match(/^[•\-*+✓✔✨⚡📈🎯]/) || l.match(/^[0-9]+[\.\)\s]/))
        .map(l => l.replace(/^[•\-*+✓✔✨⚡📈🎯\s]+|^[0-9]+[\.\)\s]+/, '').trim().substring(0, 48));
      
      if (bulletLines.length >= 2) {
        dynamicBullets = bulletLines.slice(0, 3);
        while (dynamicBullets.length < 3) {
          dynamicBullets.push('🌿 Giải pháp tối ưu hóa toàn diện');
        }
      }
    }

    // Build structured 4K Commercial Sales Poster Prompt via PosterDesignSkill
    const imagePrompt = prompt || PosterDesignSkill.buildSalesPosterPrompt(objective, dynamicHeadline, brandDna);

    const tryImagen = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) return null;

      const modelsToTry = [
        'imagen-4.0-generate-001',
        'imagen-4.0-fast-generate-001',
        'imagen-3.0-generate-002'
      ];
      for (const modelId of modelsToTry) {
        try {
          console.log(`[AI Image Generator] Calling Google Imagen API (${modelId})...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [
                { prompt: imagePrompt }
              ],
              parameters: {
                sampleCount: 1,
                aspectRatio: '16:9',
                outputMimeType: 'image/jpeg'
              }
            })
          });

          const data = await res.json();
          if (res.ok && data.predictions?.[0]?.bytesBase64Encoded) {
            const mimeType = data.predictions[0].mimeType || 'image/jpeg';
            const base64Data = data.predictions[0].bytesBase64Encoded;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            console.log(`[AI Image Generator] ✅ Google Imagen API (${modelId}) Image Rendered Successfully!`);
            return {
              success: true,
              provider: 'google-gemini',
              model: modelId,
              imageUrl: dataUrl,
              prompt: imagePrompt
            };
          }
          console.warn(`[AI Image Generator] Google Imagen API (${modelId}) notice:`, data.error?.message || data);
        } catch (e) {
          console.warn(`[AI Image Generator] Google Imagen API (${modelId}) error:`, e);
        }
      }
      return null;
    };
    const tryGeminiImage = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) return null;

      const modelsToTry = [
        'gemini-3.1-flash-image',
        'gemini-3-pro-image',
        'gemini-2.5-flash-image'
      ];
      for (const modelId of modelsToTry) {
        try {
          console.log(`[AI Image Generator] Calling Google Gemini Native Image API (${modelId})...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Generate a high quality 16:9 marketing banner image for: ${imagePrompt}` }] }]
            })
          });

          const data = await res.json();
          const part = data.candidates?.[0]?.content?.parts?.[0];
          if (res.ok && part?.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Data = part.inlineData.data;
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            console.log(`[AI Image Generator] ✅ Google Gemini Native Image API (${modelId}) Image Rendered Successfully!`);
            return {
              success: true,
              provider: 'google-gemini-native',
              model: modelId,
              imageUrl: dataUrl,
              prompt: imagePrompt
            };
          }
          console.warn(`[AI Image Generator] Google Gemini Native Image API (${modelId}) notice:`, data.error?.message || data);
        } catch (e) {
          console.warn(`[AI Image Generator] Google Gemini Native Image API (${modelId}) error:`, e);
        }
      }
      return null;
    };

    const tryDalle = async () => {
      const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
      if (!openaiKey) return null;
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
          return {
            success: true,
            provider: 'openai',
            model: 'dall-e-3',
            imageUrl: generatedUrl,
            prompt: imagePrompt
          };
        }
        console.warn('[AI Image Generator] DALL-E 3 notice:', data.error?.message);
      } catch (e) {
        console.warn('[AI Image Generator] DALL-E 3 error:', e);
      }
      return null;
    };

    const tryFlux = async () => {
      const falKey = client_fal_key || process.env.FAL_KEY;
      if (!falKey) return null;
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
          return {
            success: true,
            provider: 'fal.ai',
            model: 'flux.1-schnell',
            imageUrl: generatedUrl,
            prompt: imagePrompt
          };
        }
      } catch (e) {
        console.warn('[AI Image Generator] Fal.ai error:', e);
      }
      return null;
    };

    // Determine execution order
    const order: (() => Promise<any | null>)[] = [];
    if (model === 'google-imagen-3') {
      order.push(tryImagen, tryGeminiImage, tryDalle, tryFlux);
    } else if (model === 'dall-e-3') {
      order.push(tryDalle, tryImagen, tryGeminiImage, tryFlux);
    } else if (model === 'flux.1-schnell') {
      order.push(tryFlux, tryImagen, tryGeminiImage, tryDalle);
    } else if (model === 'bella-graphic-v4') {
      // Direct jump to graphic engine, bypass AI generators
    } else {
      order.push(tryImagen, tryGeminiImage, tryDalle, tryFlux);
    }

    for (const fn of order) {
      const result = await fn();
      if (result) return NextResponse.json(result);
    }

    const baseUrl = getBaseUrl();
    const dynamicPngBannerUrl = `${baseUrl}/api/ai/banner-image?headline=${encodeURIComponent(dynamicHeadline)}&badge=${encodeURIComponent(dynamicBadge)}&cta=${encodeURIComponent(dynamicCta)}&b1=${encodeURIComponent(dynamicBullets[0])}&b2=${encodeURIComponent(dynamicBullets[1])}&b3=${encodeURIComponent(dynamicBullets[2])}&brandName=${encodeURIComponent(brandName)}&objective=${encodeURIComponent(objective)}&t=${Date.now()}`;

    return NextResponse.json({
      success: true,
      provider: 'bella-graphic-design-engine',
      model: 'poster-design-skill-v4-structural-mutation',
      imageUrl: dynamicPngBannerUrl,
      headline: dynamicHeadline,
      offerBadge: dynamicBadge,
      ctaText: dynamicCta,
      note: `Graphic Design Engine Executed. Đã tự động đọc bối cảnh chiến dịch của thương hiệu ${brandName}, trích xuất tiêu đề AI Copywriter từ Task #1 để render Banner PNG hoàn chỉnh.`
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
