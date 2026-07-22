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

    const defaultSystemPrompt = `Bạn là AI Copywriter cấp cao của hệ sinh thái Bella Enterprise (Bella EOS & Bella EIP).
Nhiệm vụ: Dựa trên Bản kế hoạch Marketing chiến lược (Lộ trình Tuần W1-W4 và Lịch Ngày), soạn thảo BỘ NỘI DUNG TRUYỀN THÔNG CHI TIẾT THEO TUẦN VÀ THEO NGÀY (CONTENT CALENDAR) với khung giờ đăng bài cụ thể để gửi qua Hermes Publisher lập lịch tự động.

BẮT BUỘC TRẢ VỀ BỘ LỊCH NỘI DUNG 4 TUẦN CHI TIẾT THEO CẤU TRÚC SAU:

📅 [BELLA EOS CONTENT WORKER] BỘ LỊCH NỘI DUNG TRUYỀN THÔNG CHI TIẾT THEO TUẦN / THEO NGÀY (CONTENT CALENDAR THÁNG 8)

---
### 📌 BÀI VIẾT TUẦN 1 (W1 - KÍCH HOẠT NHẬN DIỆN & PAIN POINTS)
- ⏰ **Lịch đăng bài tự động**: 09:00 AM — Thứ Hai, Ngày 04/08/2026
- 🎯 **Chủ đề truyền thông**: Giải phóng 80% thời gian vận hành & Thất thoát tài chính Spa.
- 📝 **Nội dung xuất bản (Post Body)**:
🔥 BẠN ĐANG TỐN 8 GIỜ MỖI NGÀY ĐỂ QUẢN LÝ THỦ CÔNG SPA CỦA MÌNH?
[Soạn nội dung bài viết chi tiết 150-250 từ nhắm vào đối tượng ${effectiveSegment}, nêu bật nỗi đau & giải pháp Bella EOS]
👉 Đăng ký dùng thử bản Demo Bella EOS ngay hôm nay!
#BellaEOS #QuanLySpa #TietKiemChiPhi #DemoMienPhi

---
### 📌 BÀI VIẾT TUẦN 2 (W2 - SOCIAL PROOF & CASE STUDY 1,200+ SPA)
- ⏰ **Lịch đăng bài tự động**: 14:30 PM — Thứ Tư, Ngày 13/08/2026
- 🎯 **Chủ đề truyền thông**: Chứng minh năng lực thực tế — Hơn 1,200+ Spa nâng cao 300% hiệu suất cùng Bella EOS.
- 📝 **Nội dung xuất bản (Post Body)**:
🏆 BÍ QUYẾT NÂNG CAO 300% HIỆU SUẤT CỦA HƠN 1,200+ CHỦ SPA TRÊN TOÀN QUỐC!
[Soạn nội dung bài viết chi tiết 150-250 từ]
👉 Trải nghiệm hệ thống AI Agent tự động vận hành Bella EOS!
#BellaEOS #CaseStudy #HieuSuatSpa #KiemSoatEOM

---
### 📌 BÀI VIẾT TUẦN 3 (W3 - URGENCY OFFER DEMO MIỄN PHÍ)
- ⏰ **Lịch đăng bài tự động**: 19:30 PM — Thứ Sáu, Ngày 22/08/2026
- 🎯 **Chủ đề truyền thông**: Đặc quyền giới hạn dành riêng cho 50 Spa đăng ký trải nghiệm sớm nhất.
- 📝 **Nội dung xuất bản (Post Body)**:
🎁 ĐẶC QUYỀN THÁNG 8: TẶNG BẢN DÙNG THỬ DEMO MỞ RỘNG CHO 50 SPA ĐẦU TIÊN!
[Soạn nội dung bài viết chi tiết 150-250 từ]
👉 Bấm vào link để giữ suất trải nghiệm miễn phí!
#BellaEOS #UudaiThang8 #DemoFree #SpaTech

---
### 📌 BÀI VIẾT TUẦN 4 (W4 - RETARGETING & AI WORKFORCE)
- ⏰ **Lịch đăng bài tự động**: 10:00 AM — Thứ Ba, Ngày 26/08/2026
- 🎯 **Chủ đề truyền thông**: Đột phá chuyển đổi & Tự động hóa tiếp thị đa kênh cùng 12+ AI Agents.
- 📝 **Nội dung xuất bản (Post Body)**:
⚡ BẠN ĐÃ SẴN SÀNG ĐỂ AI AGENTS TỰ ĐỘNG VẬN HÀNH MARKETING CHO SPA CỦA MÌNH?
[Soạn nội dung bài viết chi tiết 150-250 từ]
👉 Khám phá ngay giải pháp Bella EOS Platform!
#BellaEOS #AIAgents #TuDongHoaSpa #MarketingTuDong`;

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
    return `📅 [BELLA EOS CONTENT WORKER] BỘ LỊCH NỘI DUNG TRUYỀN THÔNG CHI TIẾT THEO TUẦN / THEO NGÀY (CONTENT CALENDAR THÁNG 8)

---
### 📌 BÀI VIẾT TUẦN 1 (W1 - KÍCH HOẠT NHẬN DIỆN & PAIN POINTS)
- ⏰ **Lịch đăng bài tự động**: 09:00 AM — Thứ Hai, Ngày 04/08/2026
- 🎯 **Chủ đề**: Giải phóng 80% thời gian vận hành & Thất thoát tài chính Spa.
- 📝 **Nội dung xuất bản (Post Body)**:
🔥 BẠN ĐANG TỐN 8 GIỜ MỖI NGÀY ĐỂ QUẢN LÝ THỦ CÔNG SPA CỦA MÌNH?

Quản lý lịch hẹn trùng lặp, dòng tiền thất thoát cuối tháng và nhân sự tiếp thị biến động đang là "cơn ác mộng" âm thầm bào mòn lợi nhuận của các chủ cơ sở làm đẹp.

✨ Giải pháp đột phá Bella EOS xuất hiện mang đến Hệ điều hành Doanh nghiệp AI thông minh — Tự động hóa 100% quy trình từ đặt lịch, kiểm toán tài chính EOM chống thất thoát đến điều hành tiếp thị đa kênh.

👉 Đăng ký trải nghiệm bản Demo miễn phí ngay hôm nay để làm chủ công nghệ AI hàng đầu!
#BellaEOS #QuanLySpa #TietKiemChiPhi #DemoMienPhi #TuDongHoaSpa

---
### 📌 BÀI VIẾT TUẦN 2 (W2 - SOCIAL PROOF & CASE STUDY 1,200+ SPA)
- ⏰ **Lịch đăng bài tự động**: 14:30 PM — Thứ Tư, Ngày 13/08/2026
- 🎯 **Chủ đề**: Chứng minh năng lực thực tế — 1,200+ Spa nâng cao 300% hiệu suất cùng Bella EOS.
- 📝 **Nội dung xuất bản (Post Body)**:
🏆 BÍ QUYẾT NÂNG CAO 300% HIỆU SUẤT CỦA HƠN 1,200+ CHỦ SPA TRÊN TOÀN QUỐC!

Không chỉ là lời hứa, Bella EOS đã và đang phục vụ hơn 1,200+ cơ sở Spa/TMV tối ưu hóa vận hành thực tế. Tự động hóa xếp lịch khách hàng, kiểm soát doanh thu minh bạch và giữ chân khách hàng tự động qua Zalo/Facebook.

✨ Bạn muốn chuyển đổi số cho cơ sở của mình mà không cần tốn chi phí phòng tiếp thị?

👉 Trải nghiệm ngay lực lượng 12+ AI Agents tự động vận hành Bella EOS!
#BellaEOS #CaseStudy #HieuSuatSpa #KiemSoatEOM #SpaManagement

---
### 📌 BÀI VIẾT TUẦN 3 (W3 - URGENCY OFFER DEMO MIỄN PHÍ)
- ⏰ **Lịch đăng bài tự động**: 19:30 PM — Thứ Sáu, Ngày 22/08/2026
- 🎯 **Chủ đề**: Đặc quyền giới hạn dành riêng cho 50 Spa đăng ký trải nghiệm sớm nhất.
- 📝 **Nội dung xuất bản (Post Body)**:
🎁 ĐẶC QUYỀN THÁNG 8: TẶNG BẢN DÙNG THỬ DEMO MỞ RỘNG CHO 50 SPA ĐẦU TIÊN!

Nhằm hỗ trợ các chủ Spa gia tăng doanh thu bứt phá trong quý 3, Bella EOS dành tặng 50 suất trải nghiệm toàn bộ tính năng cao cấp của Hệ thống Quản lý AI hoàn toàn miễn phí.

⏳ Số lượng ưu đãi có hạn và chỉ áp dụng đến hết ngày 31/08/2026.

👉 Bấm vào liên kết bên dưới để nhận suất ưu đãi đặc quyền ngay bây giờ!
#BellaEOS #UudaiThang8 #DemoFree #SpaTech #NhanDienThuongHieu

---
### 📌 BÀI VIẾT TUẦN 4 (W4 - RETARGETING & AI WORKFORCE)
- ⏰ **Lịch đăng bài tự động**: 10:00 AM — Thứ Ba, Ngày 26/08/2026
- 🎯 **Chủ đề**: Đột phá chuyển đổi & Tự động hóa tiếp thị đa kênh cùng 12+ AI Agents.
- 📝 **Nội dung xuất bản (Post Body)**:
⚡ BẠN ĐÃ SẴN SÀNG ĐỂ AI AGENTS TỰ ĐỘNG VẬN HÀNH MARKETING CHO SPA CỦA MÌNH?

Từ phân tích yêu cầu CEO, soạn bài viết tiếp thị, thiết kế Banner 4K đến xuất bản tự động trên Fanpage — Tất cả được thực thi khép kín bởi lực lượng AI Workforce thông minh Bella EOS.

🚀 Hãy bắt đầu hành trình tự động hóa tiếp thị chuẩn doanh nghiệp ngay hôm nay!

👉 Khám phá ngay giải pháp Bella EOS Platform!
#BellaEOS #AIAgents #TuDongHoaSpa #MarketingTuDong #ChuyenDoiSoSpa`;
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
