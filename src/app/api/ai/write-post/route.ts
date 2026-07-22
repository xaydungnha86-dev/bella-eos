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
      platform = 'facebook',
      segment,
      goal,
      client_openai_key,
      client_anthropic_key,
      client_gemini_key
    } = body as {
      objective: string;
      voiceTone?: string;
      platform?: string;
      segment?: string;
      goal?: string;
      client_openai_key?: string;
      client_anthropic_key?: string;
      client_gemini_key?: string;
    };

    if (!objective) {
      return NextResponse.json({ error: 'objective is required' }, { status: 400 });
    }

    const systemPrompt = `Bạn là AI Copywriter chuyên nghiệp cho thương hiệu dịch vụ cao cấp tại Việt Nam.
Nhiệm vụ: Viết 1 bài đăng ${platform === 'facebook' ? 'Facebook' : platform} hoàn chỉnh, sẵn sàng đăng ngay.

Quy tắc QUAN TRỌNG:
- Viết bằng tiếng Việt tự nhiên, hấp dẫn
- Tông giọng: ${voiceTone || 'Professional & Premium'}
- Phân khúc mục tiêu: ${segment || 'Khách hàng tiềm năng'}
- Mục tiêu bài viết: ${goal || objective}
- KHÔNG bao gồm tiêu đề nội bộ, mã hệ thống, hay metadata kỹ thuật
- Bắt đầu bằng hook mạnh (câu hỏi, con số, hoặc tuyên bố táo bạo)
- Kết thúc bằng CTA rõ ràng
- Thêm 3-5 hashtag phù hợp ở cuối
- Độ dài: 150-300 từ

Chỉ trả về nội dung bài đăng, không có gì khác.`;

    const userMessage = `Mục tiêu kinh doanh: "${objective}"

Hãy viết bài đăng Facebook hấp dẫn, chuyên nghiệp cho chiến dịch này.`;

    // ── Try OpenAI GPT-4o ───────────────────────────────────────────────────
    const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
    if (openaiKey) {
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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.75,
            max_tokens: 600
          })
        });
        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({
            success: true,
            content: data.choices[0].message.content.trim(),
            model: 'gpt-4o',
            provider: 'openai'
          });
        }
        console.warn('[ai/write-post] OpenAI error:', data.error?.message);
      } catch (e) { console.warn('[ai/write-post] OpenAI unavailable:', e); }
    }

    // ── Try Anthropic Claude ────────────────────────────────────────────────
    const anthropicKey = client_anthropic_key || process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
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
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }]
          })
        });
        const data = await res.json();
        if (res.ok && data.content?.[0]?.text) {
          return NextResponse.json({
            success: true,
            content: data.content[0].text.trim(),
            model: 'claude-3-5-sonnet',
            provider: 'anthropic'
          });
        }
        console.warn('[ai/write-post] Anthropic error:', data.error?.message);
      } catch (e) { console.warn('[ai/write-post] Anthropic unavailable:', e); }
    }

    // ── Try Google Gemini ───────────────────────────────────────────────────
    const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 600 }
          })
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (res.ok && text) {
          return NextResponse.json({
            success: true,
            content: text.trim(),
            model: 'gemini-2.0-flash',
            provider: 'gemini'
          });
        }
        console.warn('[ai/write-post] Gemini error:', data.error?.message);
      } catch (e) { console.warn('[ai/write-post] Gemini unavailable:', e); }
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
  // Extract key numbers from objective
  const numbers = objective.match(/\d+%|\d+\s*(triệu|tỷ|k|đ)/gi) || [];
  const hasNumber = numbers.length > 0;

  const hooks = [
    `✨ Bạn có đang tìm kiếm sự thay đổi thật sự cho ${segment || 'doanh nghiệp'} của mình?`,
    `📊 Con số không nói dối — và đây là điều chúng tôi cam kết mang lại cho bạn.`,
    `🎯 Chiến lược đúng + Thực thi đúng = Kết quả vượt mong đợi.`
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const body = `\n\n${objective}\n\nChúng tôi hiểu rằng mỗi doanh nghiệp đều có hành trình riêng. Đội ngũ chuyên gia của chúng tôi cam kết đồng hành cùng bạn từng bước — từ chiến lược đến triển khai thực tế.`;

  const cta = `\n\n💬 Để lại bình luận hoặc nhắn tin cho chúng tôi ngay hôm nay để nhận tư vấn miễn phí!\n\n#ChiếnLượcKinhDoanh #TăngTrưởng #${(segment || 'KhachHang').replace(/\s/g, '')} #BellaEOS`;

  return hook + body + cta;
}
