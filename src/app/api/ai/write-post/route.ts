import { NextResponse } from 'next/server';

/**
 * POST /api/ai/write-post
 *
 * Takes a CanonicalContextPackage and produces a ready-to-publish
 * Facebook post using the AI model whose key the customer stored in Settings.
 *
 * Priority: OpenAI GPT-4o → Anthropic Claude → Gemini → built-in fallback writer
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      objective,
      voiceTone,
      brandDna,
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

    const effectiveTone = voiceTone || brandDna?.voiceTone || 'Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế';
    const effectiveSegment = segment || brandDna?.targetSegment || 'Chủ Spa & Thẩm mỹ viện cao cấp';

    const defaultSystemPrompt = `Bạn là AI Copywriter Marketing chuyên nghiệp của Bella EOS.

NHIỆM VỤ: Viết BÀI ĐĂNG FACEBOOK DUY NHẤT (single post) để thu hút khách hàng mục tiêu mua sản phẩm/dịch vụ.

ĐỐI TƯỢNG KHÁCH HÀNG: ${effectiveSegment}
TONE GIỌNG: ${effectiveTone}

CẤU TRÚC BÀI VIẾT (150-250 từ):

1. **HOOK (Câu mở đầu bắt mắt)**
   - Sử dụng emoji phù hợp
   - Đặt câu hỏi hoặc thống kê gây shock
   - Nêu bật nỗi đau/mong muốn của khách hàng

2. **BODY (Nội dung chính)**
   - Mô tả vấn đề khách hàng đang gặp phải
   - Giới thiệu giải pháp (sản phẩm/dịch vụ)
   - Nhấn mạnh lợi ích cụ thể (dùng số liệu nếu có)
   - Tạo sự tin tưởng (social proof, case study)

3. **CTA (Kêu gọi hành động)**
   - Rõ ràng, cụ thể
   - Tạo tính cấp thiết (FOMO)
   - Có emoji 👉 hoặc tương tự

4. **HASHTAGS**
   - 3-5 hashtags phù hợp với ngành hàng
   - Không dùng quá nhiều hashtags

QUAN TRỌNG:
- Viết TỰ NHIÊN, không máy móc
- Tập trung vào KHÁCH HÀNG, không tự sướng về sản phẩm
- Sử dụng emoji hợp lý (không lạm dụng)
- Nội dung NGẮN GỌN, Dễ ĐỌC (chia đoạn)
- Mục tiêu: CHUYỂN ĐỔI KHÁCH HÀNG (không phải giáo dục hay báo cáo)

CHỈ TRẢ VỀ NỘI DUNG BÀI ĐĂNG, KHÔNG CẦN TIÊU ĐỀ HAY METADATA.`;

    const effectiveSystemPrompt = systemPrompt ? systemPrompt : defaultSystemPrompt;
    const effectiveTemperature = temperature !== undefined && temperature !== null ? parseFloat(temperature as any) : 0.75;

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
    const order: (() => Promise<any | null>)[] = [];
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
    const fallbackContent = generateFallbackPost(objective, voiceTone, segment, goal);
    return NextResponse.json({
      success: true,
      content: fallbackContent,
      model: 'built-in-writer',
      provider: 'fallback',
      warning: 'Chưa có AI API Key. Nội dung được tạo bởi engine nội bộ. Cấu hình OpenAI/Claude/Gemini trong Cài đặt để có nội dung chất lượng cao hơn.'
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── Built-in Fallback Content Writer ────────────────────────────────────────
function generateFallbackPost(objective: string, tone?: string, segment?: string, goal?: string): string {
  const lower = objective.toLowerCase();
  const isSpa = lower.includes('spa') || lower.includes('thẩm mỹ') || lower.includes('beauty');
  const effectiveTone = tone || 'Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế';
  const effectiveSegment = segment || 'Chủ Spa & Thẩm mỹ viện cao cấp';

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
