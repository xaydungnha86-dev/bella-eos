/**
 * API Route: POST /api/ai/content-pipeline
 *
 * Orchestrates the complete content creation flow:
 *   Stage 0: BriefAnalyzer   — parse raw request → FacebookBrief
 *   Stage 1A: CopywriterV2   — generate Facebook post caption (runs in parallel with 1B)
 *   Stage 1B: ImageDirector  — compose image prompt from brief
 *   Stage 2: ImageGenerator  — call Imagen3 / Gemini to generate image
 *
 * Response: { brief, caption, imagePrompt, imageUrl, timings }
 */

import { NextRequest, NextResponse } from 'next/server';
import { BriefAnalyzer, type FacebookBrief } from '@/core/creative/brief-analyzer';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PipelineRequest {
  request:            string;
  format?:            '1:1' | '4:5' | '16:9' | '9:16';
  client_gemini_key?: string;
  client_openai_key?: string;
  client_anthropic_key?: string;
  skipImage?:         boolean;   // return only caption without generating image
}

interface PipelineResponse {
  success:      boolean;
  brief:        FacebookBrief;
  caption:      string;
  captionModel: string;
  imagePrompt:  string;
  imageUrl:     string | null;
  imageError?:  string;
  timings: {
    briefinMs:  number;
    captionMs:  number;
    imageMs:    number;
    totalMs:    number;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Build the system + user prompt for the copywriter from a FacebookBrief */
function buildCopywriterPrompt(brief: FacebookBrief): { system: string; user: string } {
  const system = `Bạn là AI Copywriter Marketing cao cấp. Bạn viết bài đăng Facebook chuẩn chuyển đổi cho thương hiệu B2B & B2C tại Việt Nam.

NHIỆM VỤ: Viết 1 bài đăng Facebook hoàn chỉnh theo cấu trúc 5 khối bắt buộc dưới đây.

THÔNG TIN BRIEF:
- Thương hiệu: ${brief.brandName}
- Loại chiến dịch: ${brief.campaignType}
- Đối tượng: ${brief.targetAudience}
- Tone giọng: ${brief.tone}
- USP: ${brief.usp}
- Nỗi đau khách hàng: ${brief.painPoint}
- Câu hook gợi ý: ${brief.emotionalHook}
- Lợi ích chính:
${brief.keyBenefits.map(b => `  • ${b}`).join('\n')}
- CTA: ${brief.ctaText}
- Hashtags: ${brief.primaryHashtags.join(' ')}

CẤU TRÚC BÀI VIẾT (tuân thủ nghiêm ngặt):

▌ KHỐI 1 — HOOK (1-2 dòng)
  • Bắt đầu bằng emoji phù hợp
  • Đặt câu hỏi hoặc nêu con số gây shock ngay lập tức
  • Đánh thẳng vào nỗi đau: "${brief.emotionalHook}"
  • Dừng lại ở đây — tạo tò mò để đọc tiếp

▌ KHỐI 2 — BODY (2-3 đoạn ngắn, mỗi đoạn ≤ 3 dòng)
  • Đoạn 1: Nêu vấn đề cụ thể — dùng số liệu nếu có ("8 giờ/ngày", "30%", ...)
  • Đoạn 2: Giới thiệu giải pháp ${brief.brandName} — không kể tính năng, KỂ KẾT QUẢ
  • Đoạn 3 (optional): Dẫn chứng / social proof ngắn gọn

▌ KHỐI 3 — PROOF (1 dòng)
  • 1 dòng duy nhất: con số thực tế hoặc testimonial ngắn
  • Ví dụ: "✅ 1,200+ doanh nghiệp đã tin dùng và tăng doanh thu 30%+"

▌ KHỐI 4 — CTA (1-2 dòng)
  • 👉 ${brief.ctaText}
  • Tạo tính cấp thiết nếu phù hợp (số lượng có hạn / thời gian ưu đãi)

▌ KHỐI 5 — HASHTAGS (5-8 tags)
  • ${brief.primaryHashtags.join(' ')}

NGUYÊN TẮC VIẾT:
✓ Tổng bài: 180-260 từ (không dài hơn)
✓ Ngôn ngữ tự nhiên, không máy móc, không hoa mỹ sáo rỗng
✓ Mỗi đoạn cách nhau 1 dòng trống
✓ Dùng emoji hợp lý (tối đa 1-2 emoji/đoạn)
✓ Tập trung vào KẾT QUẢ khách hàng nhận được, không phải tính năng
✓ Kết thúc bằng hashtags tách dòng riêng

CHỈ TRẢ VỀ NỘI DUNG BÀI ĐĂNG. KHÔNG có tiêu đề, KHÔNG có metadata, KHÔNG có giải thích.`;

  const user = `Viết bài đăng Facebook cho: "${brief.rawRequest}"

Áp dụng đúng 5 khối cấu trúc đã hướng dẫn. Tone: ${brief.tone}.`;

  return { system, user };
}

/** Build the Imagen3 / Gemini image prompt from a FacebookBrief */
function buildImagePrompt(brief: FacebookBrief): string {
  const formatDimensions: Record<string, string> = {
    '1:1':  '1080x1080px square',
    '4:5':  '1080x1350px portrait',
    '16:9': '1920x1080px landscape banner',
    '9:16': '1080x1920px vertical story',
  };

  const dimension = formatDimensions[brief.imageFormat] || '1080x1080px';

  const copySpaceSide = brief.imageFormat === '1:1' ? 'left 55%' : 'left half';

  return `Commercial marketing background image for Facebook post. ${brief.heroSubjectHint}. \
Setting and atmosphere: ${brief.colorMood}. \
Composition: ${copySpaceSide} of the canvas is deliberately kept clean and empty as negative space \
for text overlay — do NOT place any subject or decoration in that area. \
The visual subject is positioned on the right side using rule of thirds. \
Lighting: soft studio lighting with professional commercial photography quality. \
Style: ${brief.imageStyle.replace(/_/g, ' ')}, photorealistic, ultra detailed, ${dimension}, \
no text, no letters, no words, no watermark, no logo anywhere in the image. \
Color palette: ${brief.colorMood}. Shot on Sony A7R V, 50mm f/1.8 lens, shallow depth of field.`;
}

/** Call Gemini Imagen3 to generate an image and return public URL */
async function generateImageWithGemini(
  imagePrompt: string,
  apiKey: string
): Promise<string> {
  const models = [
    'imagen-3.0-generate-001',
    'imagen-3.0-fast-generate-001',
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: imagePrompt }],
            parameters: {
              sampleCount:  1,
              aspectRatio:  '1:1',
              safetySetting: 'block_only_high',
              personGeneration: 'dont_allow',
            },
          }),
          signal: AbortSignal.timeout(28_000),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.warn(`[content-pipeline] ${model} failed (${response.status}):`, err.slice(0, 200));
        continue;
      }

      const data = await response.json();
      const b64  = data.predictions?.[0]?.bytesBase64Encoded;
      const mime = data.predictions?.[0]?.mimeType || 'image/png';

      if (b64) {
        // Return as data URI — frontend can display directly or upload to storage
        return `data:${mime};base64,${b64}`;
      }
    } catch (e) {
      console.warn(`[content-pipeline] ${model} exception:`, e);
    }
  }

  throw new Error('All Imagen models failed or timed out');
}

/** Call the existing write-post route internally (or inline logic for speed) */
async function generateCaption(
  brief: FacebookBrief,
  keys: { gemini?: string; openai?: string; anthropic?: string }
): Promise<{ content: string; model: string }> {
  const { system, user } = buildCopywriterPrompt(brief);

  // Try Gemini first (fastest for VN copywriting)
  const geminiKey = keys.gemini;
  if (geminiKey) {
    try {
      const model  = 'gemini-2.5-flash';
      const res    = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(12_000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { content: text.trim(), model };
      }
    } catch { /* fallthrough */ }
  }

  // Try OpenAI
  const openaiKey = keys.openai;
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body:    JSON.stringify({
          model:       'gpt-4o-mini',
          messages:    [{ role: 'system', content: system }, { role: 'user', content: user }],
          temperature: 0.75,
          max_tokens:  700,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return { content: text.trim(), model: 'gpt-4o-mini' };
      }
    } catch { /* fallthrough */ }
  }

  // Try Anthropic
  const anthropicKey = keys.anthropic;
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-api-key':       anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-3-5-haiku-20241022',
          max_tokens: 700,
          system,
          messages:   [{ role: 'user', content: user }],
        }),
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) return { content: text.trim(), model: 'claude-3-5-haiku' };
      }
    } catch { /* fallthrough */ }
  }

  // Built-in fallback
  return {
    content:  buildFallbackCaption(brief),
    model:    'built-in-fallback',
  };
}

function buildFallbackCaption(brief: FacebookBrief): string {
  return `${brief.emotionalHook}

${brief.painPoint}.

✨ ${brief.usp}:

${brief.keyBenefits.join('\n')}

✅ Hơn 1,000+ khách hàng đã tin dùng và đạt kết quả vượt trội.

👉 ${brief.ctaText}

${brief.primaryHashtags.join(' ')}`;
}

// ── Route Handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const totalStart = Date.now();

  try {
    const body: PipelineRequest = await req.json();

    if (!body.request || typeof body.request !== 'string' || body.request.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: '`request` field is required (min 5 chars)' },
        { status: 400 }
      );
    }

    const keys = {
      gemini:    body.client_gemini_key    || process.env.GEMINI_API_KEY    || process.env.GOOGLE_API_KEY,
      openai:    body.client_openai_key    || process.env.OPENAI_API_KEY,
      anthropic: body.client_anthropic_key || process.env.ANTHROPIC_API_KEY,
    };

    // ── Stage 0: Brief Analysis ────────────────────────────────────────────────
    const briefStart = Date.now();
    const brief      = BriefAnalyzer.analyze(body.request.trim());
    if (body.format) brief.imageFormat = body.format;
    const briefinMs  = Date.now() - briefStart;

    console.log(`[content-pipeline] Brief analyzed in ${briefinMs}ms:`, {
      campaignType: brief.campaignType,
      audience:     brief.audienceRole,
      imageStyle:   brief.imageStyle,
      confidence:   brief.confidence,
    });

    // ── Stage 1A + 1B: Caption + Image Prompt in Parallel ─────────────────────
    const imagePrompt  = buildImagePrompt(brief);
    const captionStart = Date.now();

    const [captionResult] = await Promise.all([
      generateCaption(brief, keys),
    ]);

    const captionMs = Date.now() - captionStart;

    console.log(`[content-pipeline] Caption generated in ${captionMs}ms via ${captionResult.model}`);

    // ── Stage 2: Image Generation ──────────────────────────────────────────────
    let imageUrl:   string | null = null;
    let imageError: string | undefined;
    const imageStart = Date.now();

    if (!body.skipImage && keys.gemini) {
      try {
        imageUrl = await generateImageWithGemini(imagePrompt, keys.gemini);
        console.log(`[content-pipeline] Image generated in ${Date.now() - imageStart}ms`);
      } catch (e) {
        imageError = e instanceof Error ? e.message : 'Image generation failed';
        console.warn('[content-pipeline] Image generation error:', imageError);
      }
    } else if (!keys.gemini) {
      imageError = 'GEMINI_API_KEY not configured — image generation skipped';
    }

    const imageMs  = Date.now() - imageStart;
    const totalMs  = Date.now() - totalStart;

    const response: PipelineResponse = {
      success:      true,
      brief,
      caption:      captionResult.content,
      captionModel: captionResult.model,
      imagePrompt,
      imageUrl,
      imageError,
      timings: { briefinMs, captionMs, imageMs, totalMs },
    };

    console.log(`[content-pipeline] ✅ Complete in ${totalMs}ms`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[content-pipeline] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error:   error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service:     'Bella EOS Content Pipeline v1.0',
    description: 'Brief Analysis → Caption → Image in one call',
    endpoint:    'POST /api/ai/content-pipeline',
    body: {
      request:            'string (raw marketing request in Vietnamese)',
      format:             "'1:1' | '4:5' | '16:9' | '9:16' (default: '1:1')",
      skipImage:          'boolean (default: false)',
      client_gemini_key:  'string? (optional, uses env fallback)',
      client_openai_key:  'string? (optional)',
      client_anthropic_key: 'string? (optional)',
    },
  });
}
