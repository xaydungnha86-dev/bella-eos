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

    const defaultSystemPrompt = `Bạn là AI Copywriter chuyên nghiệp cho giải pháp Bella Enterprise (Bella EOS & Bella EIP) tại Việt Nam.

CONTEXT DOANH NGHIỆP & BRAND DNA (INPUT BẮT BUỘC):
- Tông giọng thương hiệu (Voice Tone): ${effectiveTone}
- Phân khúc khách hàng mục tiêu: ${effectiveSegment}
- Yêu cầu phong cách: Soạn bài chuẩn xác theo Tông Giọng Thương Hiệu ("${effectiveTone}"), từ ngữ tinh tế, thể hiện đẳng cấp doanh nghiệp.

Quy tắc BẮT BUỘC:
1. "Mục tiêu kinh doanh" truyền vào là chỉ thị NỘI BỘ của CEO (Ví dụ: "Tăng 20% Spa demo... với ngân sách 50M").
2. TUYỆT ĐỐI KHÔNG in lại ngân sách nội bộ (50 triệu, budget,...) hay các chỉ tiêu quản trị nội bộ vào bài viết tiếp thị công khai.
3. Soạn bài viết tiếp thị tuân thủ RÕ RÀNG TÔNG GIỌNG THƯƠNG HIỆU ("${effectiveTone}").
4. Chuyển đổi chỉ thị thành OFFER DÀNH CHO KHÁCH HÀNG (Đăng ký trải nghiệm Demo miễn phí phần mềm quản lý Spa thông minh Bella EOS).
5. Bắt đầu bằng hook thu hút đúng đối tượng khách hàng mục tiêu (${effectiveSegment}).
6. Thân bài nêu rõ lợi ích giải pháp: tối ưu vận hành, tự động đặt lịch, quản lý doanh thu.
7. Kết thúc bằng Kêu gọi hành động (CTA) đăng ký Demo rõ ràng.
8. Thêm 3-5 hashtag chuẩn (#BellaEOS #QuanLySpa #DemoMiễnPhí #SpaManagement).
9. Độ dài: 150-250 từ.

Chỉ trả về nội dung bài đăng Facebook hoàn chỉnh, không kèm lời giải thích.`;

    const effectiveSystemPrompt = systemPrompt ? systemPrompt : defaultSystemPrompt;
    const effectiveTemperature = temperature !== undefined && temperature !== null ? parseFloat(temperature as any) : 0.75;

    const userMessage = `Mục tiêu chỉ thị của CEO: "${objective}"

Hãy viết bài đăng Facebook truyền thông cho đối tượng khách hàng mục tiêu để đạt mục tiêu trên.`;

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

  if (isSpa) {
    return `🌿 [ĐĂNG KÝ TRẢI NGHIỆM DEMO MIỄN PHÍ] GIẢI PHÁP QUẢN LÝ SPA THÔNG MINH BELLA EOS

Bạn đang là Chủ Spa hay Quản lý Thẩm mỹ viện đang gặp khó khăn trong việc:
⚡ Tối ưu lịch hẹn kỹ thuật viên & giảm 90% thời gian xếp lịch?
📊 Kiểm soát doanh thu, chi phí và hoa hồng nhân sự chính xác theo thời gian thực?
🎯 Tự động hóa chăm sóc khách hàng cũ & thu hút khách hàng mới?

Bella EOS giải quyết triệt để mọi bài toán vận hành Spa bằng công nghệ AI-Native hiện đại nhất!

🎁 QUÀ TẶNG ĐẶC BIỆT THÁNG NÀY:
• 1 Buổi trải nghiệm Demo 1-1 trực tiếp cùng Chuyên gia Vận hành
• Bộ tài liệu độc quyền "Quy Trình Chuẩn Hóa Vận Hành Spa Chuyên Nghiệp"

👉 Đăng ký nhận Demo ngay hôm nay tại: https://bella.vn/demo-spa

#BellaEOS #QuanLySpa #SpaManagement #GiaiPhapSpa #DemoMienPhi #TuDongHoaSpa`;
  }

  // Generic business offer fallback
  return `🚀 BỨT PHÁ DOANH THU VỚI NỀN TẢNG ĐỒNG HÀNH VẬN HÀNH THÔNG MINH BELLA EOS

Bạn đang tìm kiếm giải pháp giúp tối ưu hóa quy trình vận hành và tăng trưởng doanh thu bền vững cho doanh nghiệp?

Bella EOS mang đến hệ sinh thái công nghệ quản trị AI-Native toàn diện:
✅ Tự động hóa 80% công việc điều phối & lập kế hoạch
✅ Quản lý dữ liệu tập trung, theo dõi KPI & ROI thời gian thực
✅ Tối ưu hóa chi phí vận hành & tăng tốc độ thực thi chiến dịch

👉 Đăng ký tư vấn và trải nghiệm giải pháp ngay hôm nay!

#BellaEOS #NenTangVatHanh #ChuyenDoiSo #QuanTriDoanhNghiep #TốiƯuDoanhThu`;
}
