import { NextResponse } from 'next/server';
import type { FacebookBrief } from '@/core/creative/brief-analyzer';

/**
 * POST /api/ai/write-post
 *
 * Takes a CanonicalContextPackage (or a pre-analyzed FacebookBrief) and produces
 * a ready-to-publish Facebook post in strict 5-block format:
 *   1. HOOK — emoji + pain trigger
 *   2. BODY — benefits + numbers (2-3 short paragraphs)
 *   3. PROOF — 1 social proof line
 *   4. CTA — urgency call-to-action
 *   5. HASHTAGS — 5-8 relevant tags
 *
 * Priority: Gemini → OpenAI GPT-4o → Anthropic Claude → built-in fallback
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
    const effectiveSegment  = brief?.audienceRole || segment || brandDna?.targetSegment || 'Khách hàng mục tiêu';
    const effectiveBrand    = brief?.brandName || 'Bella EOS';
    const effectiveUSP      = brief?.usp      || `Giải pháp tối ưu từ ${effectiveBrand}`;
    const effectivePain     = brief?.painPoint || 'Quy trình thủ công tốn thời gian và chi phí';
    const effectiveHook     = brief?.emotionalHook || 'Bạn có muốn tối ưu hoàn toàn quy trình vận hành?';
    const effectiveBenefits = brief?.keyBenefits?.join('\n') || '✅ Tối ưu quy trình\n✅ Tiết kiệm chi phí\n✅ Tăng doanh thu';
    const effectiveCTA      = brief?.ctaText  || 'Liên hệ tư vấn miễn phí ngay hôm nay';
    const effectiveHashtags = brief?.primaryHashtags?.join(' ') || `#${effectiveBrand.replace(/\s+/g, '')} #KinhDoanh`;

    // Void unused vars to avoid lint warnings
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
  • Ví dụ: "✅ 1,200+ doanh nghiệp tin dùng — doanh thu tăng bình quân 30%+"

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

    const userMessage = `Mục tiêu chiến dịch: "${objective}"

Tone giọng: ${effectiveTone}
Đối tượng mục tiêu: ${effectiveSegment}

Hãy viết BÀI ĐĂNG FACEBOOK thu hút khách hàng mục tiêu này.`;

    const tryOpenAI = async () => {
      const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
      if (!openaiKey) return null;
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
            max_tokens: 600
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
        console.warn('[ai/write-post] OpenAI error:', data.error?.message);
      } catch (e) { console.warn('[ai/write-post] OpenAI unavailable:', e); }
      return null;
    };

    const tryAnthropic = async () => {
      const anthropicKey = client_anthropic_key || process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) return null;
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 600,
            system: effectiveSystemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            temperature: effectiveTemperature
          })
        });
        const data = await res.json();
        if (res.ok && data.content?.[0]?.text) {
          return {
            success: true,
            content: data.content[0].text.trim(),
            model: 'claude-3-5-sonnet',
            provider: 'anthropic'
          };
        }
        console.warn('[ai/write-post] Anthropic error:', data.error?.message);
      } catch (e) { console.warn('[ai/write-post] Anthropic unavailable:', e); }
      return null;
    };

    const tryGemini = async () => {
      const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!geminiKey) return null;
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
            provider: 'gemini'
          };
        }
        console.warn('[ai/write-post] Gemini error:', data.error?.message);
      } catch (e) { console.warn('[ai/write-post] Gemini unavailable:', e); }
      return null;
    };

    // Determine engine order
    type ProviderResult = { success: boolean; content: string; model: string; provider: string } | null;
    const order: (() => Promise<ProviderResult>)[] = [];
    if (model === 'gpt-4o') {
      order.push(tryOpenAI, tryAnthropic, tryGemini);
    } else if (model === 'claude-3-5-sonnet') {
      order.push(tryAnthropic, tryOpenAI, tryGemini);
    } else if (model === 'gemini-2.5-flash') {
      order.push(tryGemini, tryOpenAI, tryAnthropic);
    } else {
      order.push(tryOpenAI, tryAnthropic, tryGemini);
    }

    for (const fn of order) {
      const result = await fn();
      if (result) return NextResponse.json(result);
    }

    // ── Built-in Fallback Writer (no AI key needed) ─────────────────────────
    console.info('[ai/write-post] No AI key available — using built-in fallback writer.');
    const fallbackContent = generateFallbackPost(objective);
    return NextResponse.json({
      success: true,
      content: fallbackContent,
      model: 'built-in-writer',
      provider: 'fallback',
      warning: 'Chưa có AI API Key. Nội dung được tạo bởi engine nội bộ. Cấu hình OpenAI/Claude/Gemini trong Cài đặt để có nội dung chất lượng cao hơn.'
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ─── Built-in Fallback Content Writer ────────────────────────────────────────
function generateFallbackPost(objective: string): string {
  const lower = objective.toLowerCase();
  const isSpa = lower.includes('spa') || lower.includes('thẩm mỹ') || lower.includes('beauty');

  if (isSpa) {
    return `🔥 BẠN ĐANG TỐN 8 GIỜ MỖI NGÀY ĐỂ QUẢN LÝ THỦ CÔNG SPA CỦA MÌNH?

Quản lý lịch hẹn trùng lặp, dòng tiền thất thoát cuối tháng và nhân sự tiếp thị biến động đang là "cơn ác mộng" âm thầm bào mòn lợi nhuận của các chủ cơ sở làm đẹp.

✨ Giải pháp đột phá Bella EOS xuất hiện mang đến Hệ điều hành Doanh nghiệp AI thông minh:

✅ Tự động hóa 100% quy trình từ đặt lịch → kiểm toán tài chính → điều phối tiếp thị đa kênh
✅ Giải phóng 80% thời gian vận hành, tăng 300% hiệu suất quản lý
✅ Hơn 1,200+ Spa trên toàn quốc đã tin dùng và đạt kết quả vượt trội

👉 Đăng ký trải nghiệm bản Demo miễn phí ngay hôm nay để làm chủ công nghệ AI hàng đầu!

#BellaEOS #QuanLySpa #TietKiemChiPhi #DemoMienPhi #TuDongHoaSpa`;
  }

  // Generic business offer fallback
  return `🚀 BẠN ĐANG TÌM GIẢI PHÁP ĐỂ TĂNG TRƯỞNG DOANH THU BỀN VỮNG?

Tối ưu hóa quy trình vận hành, tăng năng suất làm việc và kiểm soát chi phí hiệu quả là yếu tố then chốt giúp doanh nghiệp bứt phá trong môi trường cạnh tranh khốc liệt.

✨ Bella EOS - Hệ sinh thái công nghệ quản trị AI-Native mang đến:

✅ Tự động hóa 80% công việc điều phối & lập kế hoạch
✅ Quản lý dữ liệu tập trung, theo dõi KPI & ROI thời gian thực
✅ Tối ưu chi phí vận hành & tăng tốc độ thực thi chiến dịch

👉 Đăng ký tư vấn và trải nghiệm giải pháp ngay hôm nay!

#BellaEOS #NenTangVatHanh #ChuyenDoiSo #QuanTriDoanhNghiep #TốiƯuDoanhThu`;
}
