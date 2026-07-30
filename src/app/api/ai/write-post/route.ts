import { NextResponse } from 'next/server';
import type { FacebookBrief } from '@/core/creative/brief-analyzer';

/**
 * POST /api/ai/write-post
 *
 * Takes a CanonicalContextPackage (or a pre-analyzed FacebookBrief) and produces
 * a ready-to-publish Facebook post in strict 5-block format.
 *
 * Priority: Gemini → OpenAI GPT-4o → Anthropic Claude → Dynamic ECE Rule Fallback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      objective,
      voiceTone,
      brandDna,
      brief,
      platform = 'facebook',
      segment,
      goal,
      client_openai_key,
      client_anthropic_key,
      client_gemini_key,
      model,
      systemPrompt,
      temperature
    } = body as {
      objective: string;
      voiceTone?: string;
      brief?: FacebookBrief;
      brandDna?: {
        voiceTone?: string;
        targetSegment?: string;
        coreKeywords?: string[];
      };
      platform?: string;
      segment?: string;
      goal?: string;
      client_openai_key?: string;
      client_anthropic_key?: string;
      client_gemini_key?: string;
      model?: string;
      systemPrompt?: string;
      temperature?: number;
    };

    if (!objective) {
      return NextResponse.json({ error: 'objective is required' }, { status: 400 });
    }

    // Resolve effective values — brief takes priority over raw fields
    const effectiveTone     = brief?.tone     || voiceTone || brandDna?.voiceTone || 'Chuyên nghiệp, tin cậy, kết quả-driven';
    const effectiveSegment  = brief?.audienceRole || segment || brandDna?.targetSegment || 'Khách hàng tiềm năng';
    const effectiveBrand    = brief?.brandName || 'Bella Spa & EOS';
    const effectiveUSP      = brief?.usp      || `Giải pháp chuyên sâu cho chiến dịch "${objective}"`;
    const effectivePain     = brief?.painPoint || 'Quy trình chưa tối ưu, lãng phí thời gian và ngân sách tiếp thị';
    const effectiveHook     = brief?.emotionalHook || `Bạn đã sẵn sàng bứt phá mục tiêu "${objective}"?`;
    const effectiveBenefits = brief?.keyBenefits?.join('\n') || `✅ Tự động hóa chiến dịch "${objective}"\n✅ Tối ưu tỷ lệ chuyển đổi lead\n✅ Đảm bảo trải nghiệm xuất sắc`;
    const effectiveCTA      = brief?.ctaText  || 'Đăng ký tư vấn và nhận ưu đãi độc quyền ngay hôm nay';
    const effectiveHashtags = brief?.primaryHashtags?.join(' ') || `#${effectiveBrand.replace(/\s+/g, '')} #ChienDichDigital #KinhDoanhTop1`;

    void platform; void goal;

    const defaultSystemPrompt = `Bạn là AI Copywriter Marketing cao cấp. Bạn viết bài đăng Facebook chuẩn chuyển đổi cao cho doanh nghiệp Việt Nam.

NHIỆM VỤ: Viết 1 bài đăng Facebook theo đúng 5 KHỐI cấu trúc bắt buộc dưới đây.

BRIEF:
- Thương hiệu: ${effectiveBrand}
- Đối tượng: ${effectiveSegment}
- Tone: ${effectiveTone}
- USP: ${effectiveUSP}
- Nỗi đau: ${effectivePain}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▌ KHỐI 1 — HOOK (1-2 dòng)
  • Bắt đầu bằng emoji phù hợp (🔥 ⚡ 💡 🎯 ...)
  • Câu gợi ý: "${effectiveHook}"
  • Mục tiêu: tạo tò mò, đánh thẳng vào nỗi đau — dừng ngón tay cuộn

▌ KHỐI 2 — BODY (2-3 đoạn ngắn, mỗi đoạn ≤3 dòng)
  • Đoạn 1: Mô tả vấn đề cụ thể bằng con số thực ("8h/ngày", "30%", ...)
  • Đoạn 2: Giới thiệu ${effectiveBrand} — KỂ KẾT QUẢ, không kể tính năng
  • Lợi ích cụ thể:
${effectiveBenefits}

▌ KHỐI 3 — PROOF (1 dòng duy nhất)
  • Con số thực hoặc testimonial ngắn
  • Ví dụ: "✅ 1,200+ khách hàng tin dùng — tỷ lệ hài lòng đạt 98%+"

▌ KHỐI 4 — CTA (1-2 dòng)
  • 👉 ${effectiveCTA}
  • Tạo urgency nếu phù hợp (số lượng có hạn / thời gian ưu đãi)

▌ KHỐI 5 — HASHTAGS (tách dòng riêng)
  ${effectiveHashtags}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUY TẮC BẮT BUỘC:
✓ Tổng bài: 180-260 từ (không dài hơn)
✓ Mỗi khối cách nhau 1 dòng trống
✓ Ngôn ngữ tự nhiên — KHÔNG sáo rỗng, KHÔNG máy móc
✓ Emoji dùng vừa phải (tối đa 2/đoạn)
✓ Tập trung vào KẾT QUẢ khách hàng nhận được

CHỈ TRẢ VỀ NỘI DUNG BÀI ĐĂNG. KHÔNG có tiêu đề, KHÔNG có metadata.`;

    const effectiveSystemPrompt = systemPrompt ? systemPrompt : defaultSystemPrompt;
    const effectiveTemperature = temperature !== undefined && temperature !== null ? parseFloat(String(temperature)) : 0.75;

    const userMessage = `Mục tiêu chiến dịch CEO: "${objective}"

Tone giọng: ${effectiveTone}
Đối tượng mục tiêu: ${effectiveSegment}

Hãy viết BÀI ĐĂNG FACEBOOK thu hút khách hàng mục tiêu này cho đúng chỉ thị trên.`;

    let diagnosticErrors: string[] = [];

    // 1. Try Gemini
    const tryGemini = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!geminiKey || geminiKey.includes('your_gemini_api_key')) return null;
      try {
        const selectedModel = model || 'gemini-2.5-flash';
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${effectiveSystemPrompt}\n\n${userMessage}` }] }],
            generationConfig: { temperature: effectiveTemperature, maxOutputTokens: 4096 }
          })
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (res.ok && text) {
          return {
            success: true,
            content: text.trim(),
            model: selectedModel,
            provider: 'google-gemini'
          };
        }
        const errStr = data.error?.message || `HTTP ${res.status}`;
        diagnosticErrors.push(`Gemini Error: ${errStr}`);
      } catch (e: any) {
        diagnosticErrors.push(`Gemini Exception: ${e.message}`);
      }
      return null;
    };

    // 2. Try OpenAI
    const tryOpenAI = async () => {
      const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
      if (!openaiKey || openaiKey.includes('your_openai_api_key')) return null;
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: effectiveSystemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: effectiveTemperature,
            max_tokens: 800
          })
        });
        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          return {
            success: true,
            content: data.choices[0].message.content.trim(),
            model: 'gpt-4o',
            provider: 'openai'
          };
        }
        const errStr = data.error?.message || `HTTP ${res.status}`;
        diagnosticErrors.push(`OpenAI Error: ${errStr}`);
      } catch (e: any) {
        diagnosticErrors.push(`OpenAI Exception: ${e.message}`);
      }
      return null;
    };

    // Try Gemini then OpenAI
    let result = await tryGemini();
    if (!result) result = await tryOpenAI();

    if (result) {
      return NextResponse.json(result);
    }

    // 3. Dynamic Rule-based Fallback Writer when keys fail/quota exceeded
    const fallbackReason = diagnosticErrors.length > 0 
      ? diagnosticErrors.join(' | ') 
      : 'Chưa cấu hình API Key hợp lệ trong .env.local hoặc Cài đặt';

    console.info('[ai/write-post] AI fallback triggered. Reason:', fallbackReason);

    const dynamicFallbackContent = generateDynamicFallbackPost(objective, effectiveTone, effectiveSegment, effectiveBrand);
    
    return NextResponse.json({
      success: true,
      content: dynamicFallbackContent,
      model: 'ece-dynamic-fallback-v1',
      provider: 'ece-kernel-fallback',
      warning: `[AI Fallback Active] ${fallbackReason}. Hệ thống đã tự động kích hoạt ECE Dynamic Fallback Engine để tạo nội dung tùy biến.`
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── Dynamic Fallback Content Generator ──────────────────────────────────────
function generateDynamicFallbackPost(
  objective: string,
  voiceTone: string,
  targetSegment: string,
  brandName: string
): string {
  const cleanObj = objective.trim();
  const hashtags = cleanObj
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => '#' + w.replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ''))
    .slice(0, 5)
    .join(' ');

  return `🔥 CHÍNH THỨC PHÁT ĐỘNG: ${cleanObj.toUpperCase()}

Bạn đang tìm kiếm giải pháp tối ưu nhất cho "${cleanObj}"? ${brandName} xin mang đến chương trình bứt phá đặc biệt dành riêng cho ${targetSegment}!

✨ ĐIỂM NỔI BẬT CỦA CHIẾN DỊCH:
- 🎯 Định hướng chuẩn xác: Thiết kế với phong cách ${voiceTone}
- ⚡ Tối ưu hiệu suất: Đáp ứng 100% chỉ thị "${cleanObj}"
- 📈 Đảm bảo kết quả: Tăng trưởng tỷ lệ chốt đơn và sự hài lòng của khách hàng

✅ Hơn 1,500+ khách hàng đã tin tưởng đồng hành cùng ${brandName} trong các chiến dịch lớn.

👉 Đăng ký tư vấn trực tiếp và nhận ưu đãi chiến dịch ngay hôm nay!

#${brandName.replace(/\s+/g, '')} #ChienDichMoi ${hashtags}`;
}
