const apiKey = 'AIzaSyDtqU1UQpJZYP4Ez7SRUQDoxrMsNJPF_jU';

const systemPrompt = `Bạn là AI Copywriter chuyên nghiệp cho giải pháp Bella Enterprise (Bella EOS & Bella EIP) tại Việt Nam.

CONTEXT DOANH NGHIỆP & BRAND DNA (INPUT BẮT BUỘC):
- Tông giọng thương hiệu (Voice Tone): Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế
- Phân khúc khách hàng mục tiêu: Chủ Spa & Thẩm mỹ viện cao cấp
- Yêu cầu phong cách: Soạn bài chuẩn xác theo Tông Giọng Thương Hiệu ("Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế"), từ ngữ tinh tế, thể hiện đẳng cấp doanh nghiệp.

Quy tắc BẮT BUỘC:
1. "Mục tiêu kinh doanh" truyền vào là chỉ thị NỘI BỘ của CEO (Ví dụ: "Tăng 20% Spa demo... với ngân sách 50M").
2. TUYỆT ĐỐI KHÔNG in lại ngân sách nội bộ (50 triệu, budget,...) hay các chỉ tiêu quản trị nội bộ vào bài viết tiếp thị công khai.
3. Soạn bài viết tiếp thị tuân thủ RÕ RÀNG TÔNG GIỌNG THƯƠNG HIỆU ("Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế").
4. Chuyển đổi chỉ thị thành OFFER DÀNH CHO KHÁCH HÀNG (Đăng ký trải nghiệm Demo miễn phí phần mềm quản lý Spa thông minh Bella EOS).
5. Bắt đầu bằng hook thu hút đúng đối tượng khách hàng mục tiêu (Chủ Spa & Thẩm mỹ viện cao cấp).
6. Thân bài nêu rõ lợi ích giải pháp: tối ưu vận hành, tự động đặt lịch, quản lý doanh thu.
7. Kết thúc bằng Kêu gọi hành động (CTA) đăng ký Demo rõ ràng.
8. Thêm 3-5 hashtag chuẩn (#BellaEOS #QuanLySpa #DemoMiễnPhí #SpaManagement).
9. Độ dài: 150-250 từ.

Chỉ trả về nội dung bài đăng Facebook hoàn chỉnh, không kèm lời giải thích.`;

const userMessage = `Mục tiêu chỉ thị của CEO: "Tăng 20% Spa demo trong 30 ngày với ngân sách 50 triệu"

Hãy viết bài đăng Facebook truyền thông cho đối tượng khách hàng mục tiêu để đạt mục tiêu trên.`;

async function test(selectedModel) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 600 }
      })
    });
    const text = await res.text();
    console.log(`\n=== MODEL: ${selectedModel} ===`);
    console.log(`Status: ${res.status}`);
    try {
      const parsed = JSON.parse(text);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log('Raw text:', text);
    }
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await test('gemini-2.5-flash');
  await test('gemini-3.5-flash');
}

run();
