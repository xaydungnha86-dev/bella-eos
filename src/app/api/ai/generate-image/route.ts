import { NextResponse } from 'next/server';
import { PosterDesignSkill, BrandDnaContext } from '@/core/skills/poster-design-skill';
import { CreativePlanningEngine } from '@/core/creative/creative-planning-engine';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function saveBase64Image(base64Data: string): string {
  try {
    const dir = path.join(process.cwd(), 'public', 'temp-banners');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filename = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const filepath = path.join(dir, filename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);
    return `/temp-banners/${filename}`;
  } catch (err) {
    console.error('Failed to save base64 image locally:', err);
    return '';
  }
}

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
      const cleanContent = copywriterContent.replace(/^[\s\-*•]*📅[^\n]*\n+/gmi, '').replace(/^[\s\-*•]*###?[^\n]*\n+/gmi, '');
      const lines = cleanContent.split('\n').map(l => l.trim()).filter(Boolean);
      const headlineCandidate = lines.find(l => 
        !l.includes('CONTENT WORKER') && 
        !l.includes('CONTENT CALENDAR') && 
        !l.includes('BỘ LỊCH NỘI DUNG') && 
        !l.match(/^(?:---|###|📌|⏰|🎯|📝|📅|- ⏰|- 🎯|- 📝|Lịch đăng|Chủ đề)/i) &&
        l.length > 8
      );
      if (headlineCandidate) {
        dynamicHeadline = headlineCandidate.replace(/^[#*🎯⚡👉🔥•\-\s]+/, '').replace(/\**/g, '').trim().substring(0, 48);
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

    // ── Build CreativePlan via the Creative Planning Engine ──────────────────
    // The engine runs all 11 pipeline stages and returns a structured plan.
    // Each AI model gets its own optimized prompt from the plan.
    const creativePlan = await CreativePlanningEngine.planAsync({
      objective,
      copywriterSnippet: dynamicHeadline,
      brandDna,
      format: '16:9',
      medium: 'image',
    });
    const imagePrompt   = prompt || creativePlan.imagenPrompt;  // Imagen default
    const negativePrompt = creativePlan.negativePrompt;
    console.log(`[Creative Planning Engine] Style: ${creativePlan.styleId} | LuxuryLevel: ${creativePlan.luxuryLevel} | PromptLen: ${imagePrompt.length}ch`);

    const buildOverlayUrl = (aiImageUrl: string) => {
      const baseUrl = getBaseUrl();
      let resolvedBg = aiImageUrl;
      
      // If it's a raw base64 data URL (e.g. data:image/jpeg;base64,...), save it locally to a file to keep URL short
      if (aiImageUrl.startsWith('data:image')) {
        const base64Data = aiImageUrl.split(';base64,')[1];
        const localPath = saveBase64Image(base64Data);
        if (localPath) {
          resolvedBg = localPath;
        }
      }

      // ── Derive dynamic iPad mockup content from objective ──────────────────
      const lo = objective.toLowerCase();
      let metricTitle = 'TIẾN TRÌNH CHIẾN DỊCH';
      let metricValue = '+25.8% 📈';
      let widgetTitle = 'HOẠT ĐỘNG GẦN ĐÂY';
      let feedLog1 = '🟢 AI Planning: Active';
      let feedLog2 = '📊 Analytics: Synced';
      let statusText = 'STATUS: OPERATIONAL 100%';

      if (lo.includes('spa') || lo.includes('thẩm mỹ') || lo.includes('làm đẹp')) {
        metricTitle = 'DOANH THU SPA THÁNG NÀY';
        metricValue = '+25.8% 📈';
        widgetTitle = 'LỊCH KTV SPA REALTIME';
        feedLog1 = '🌿 Phòng VIP #01 (Chờ KTV)';
        feedLog2 = '🌿 Thảo Dược #03 (Active)';
        statusText = 'STATUS: SPA OPERATIONAL 100%';
      } else if (lo.includes('bất động sản') || lo.includes('căn hộ') || lo.includes('chung cư')) {
        metricTitle = 'TỶ LỆ LẤY CĂN (BOOKED)';
        metricValue = '84.2% 🏢';
        widgetTitle = 'PHÂN KHU ĐANG MỞ BÁN';
        feedLog1 = '🏢 Phân khu Centric (Còn 15 căn)';
        feedLog2 = '🏢 Phân khu Premium (Đã khóa cọc)';
        statusText = 'STATUS: AGENT ACTIVE 100%';
      } else if (lo.includes('thời trang') || lo.includes('boutique') || lo.includes('shop')) {
        metricTitle = 'DOANH SỐ ĐƠN HÀNG';
        metricValue = '1,248 🛍️';
        widgetTitle = 'TỒN KHO HỆ THỐNG';
        feedLog1 = '🛍️ Áo Blazer (Sẵn sàng - 42 chiếc)';
        feedLog2 = '🛍️ Áo Hoodies (Sắp hết - 5 chiếc)';
        statusText = 'STATUS: SYNCED 100%';
      } else if (lo.includes('tuyển dụng') || lo.includes('recruitment') || lo.includes('hr')) {
        metricTitle = 'HỒ SƠ ĐÃ NHẬN';
        metricValue = '248 🧑‍💼';
        widgetTitle = 'PIPELINE TUYỂN DỤNG';
        feedLog1 = '🧑‍💼 Vòng phỏng vấn: 12 ứng viên';
        feedLog2 = '✅ Đã offer: 3 vị trí';
        statusText = 'STATUS: HR PIPELINE ACTIVE';
      } else if (lo.includes('công nghệ') || lo.includes('ai') || lo.includes('software') || lo.includes('digital')) {
        metricTitle = 'AI PERFORMANCE INDEX';
        metricValue = '99.2% 🤖';
        widgetTitle = 'AI SYSTEM MONITOR';
        feedLog1 = '🤖 LLM Engine: Running';
        feedLog2 = '📡 Data Pipeline: Synced';
        statusText = 'STATUS: AI SYSTEM ACTIVE';
      }

      const params = new URLSearchParams({
        bg: resolvedBg,
        headline: dynamicHeadline,
        badge: dynamicBadge,
        cta: dynamicCta,
        b1: dynamicBullets[0],
        b2: dynamicBullets[1],
        b3: dynamicBullets[2],
        brandName,
        objective,
        metricTitle,
        metricValue,
        widgetTitle,
        feedLog1,
        feedLog2,
        statusText,
        t: String(Date.now()),
      });
      return `${baseUrl}/api/ai/banner-image?${params.toString()}`;
    };

    const tryImagen = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) return null;

      const modelsToTry: string[] = [];
      if (model && (model.toLowerCase().includes('imagen') || model.toLowerCase().includes('google-imagen'))) {
        modelsToTry.push(model);
      }
      const defaults = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001'
      ];
      defaults.forEach(d => {
        if (!modelsToTry.includes(d)) modelsToTry.push(d);
      });

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
                outputMimeType: 'image/jpeg',
                negativePrompt: negativePrompt
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
              imageUrl: buildOverlayUrl(dataUrl),
              prompt: imagePrompt,
              warning: (model && model !== 'default' && model !== modelId) 
                ? `Tự động chuyển đổi từ model cấu hình [${model}] sang [${modelId}] do không khả dụng.` 
                : undefined
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

      const modelsToTry: string[] = [];
      if (model && (model.toLowerCase().includes('gemini') || model.toLowerCase().includes('image')) && !model.toLowerCase().includes('imagen')) {
        modelsToTry.push(model);
      }
      const defaults = [
        'gemini-3.1-flash-image',
        'gemini-3-pro-image',
        'gemini-2.5-flash-image'
      ];
      defaults.forEach(d => {
        if (!modelsToTry.includes(d)) modelsToTry.push(d);
      });
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
              imageUrl: buildOverlayUrl(dataUrl),
              prompt: imagePrompt,
              warning: (model && model !== 'default' && model !== modelId) 
                ? `Tự động chuyển đổi từ model cấu hình [${model}] sang [${modelId}] do không khả dụng.` 
                : undefined
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
            // DALL-E 3 gets its own model-optimized prompt (descriptive paragraph + avoidance clause)
            prompt: prompt ? `${imagePrompt}. Avoid: ${negativePrompt}.` : creativePlan.dallePrompt,
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
            imageUrl: buildOverlayUrl(generatedUrl),
            prompt: imagePrompt,
            warning: (model && model !== 'default' && model !== 'dall-e-3') 
              ? `Tự động chuyển đổi từ model cấu hình [${model}] sang [dall-e-3] do không khả dụng.` 
              : undefined
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
            // Flux receives tag-dense keyword prompt optimized by FluxOptimizer
            prompt: prompt ? imagePrompt : creativePlan.fluxPrompt,
            image_size: 'landscape_16_9',
            num_inference_steps: 4,
            negative_prompt: negativePrompt
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
            imageUrl: buildOverlayUrl(generatedUrl),
            prompt: imagePrompt,
            warning: (model && model !== 'default' && model !== 'flux.1-schnell') 
              ? `Tự động chuyển đổi từ model cấu hình [${model}] sang [flux.1-schnell] do không khả dụng.` 
              : undefined
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
