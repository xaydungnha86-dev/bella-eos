# FIX COPYWRITER & API KEY INTEGRATION

## 📅 Date: 2026-07-27
## 🎯 Objective: Fix 2 critical issues blocking Creative Intelligence v3

---

## ✅ ISSUE 1: Gemini API Key Not Passed from UI to LLM

### Problem
User inputs Gemini API key in Settings UI → Saved to `localStorage` → But **Creative Director Agent** (Layer 2 LLM reasoning) only reads from `process.env`, not from client keys.

**Data Flow (BEFORE):**
```
UI Settings → localStorage (✅ saved)
    ↓
API Route → Reads client_gemini_key (✅)
    ↓
Creative Intelligence Engine (❌ NOT passed)
    ↓
Creative Director Agent → Only reads process.env (❌ FAILS)
    ↓
Fallback to rule-based (0.75 confidence)
```

### Solution Implemented

#### 1. Updated Type Definition
**File:** `src/types/creative-intelligence.ts`

Added `clientKeys` to `CreativeRequest` interface:
```typescript
export interface CreativeRequest {
  // ... existing fields
  clientKeys?: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
  };
}
```

#### 2. Updated Creative Intelligence Engine
**File:** `src/core/creative/creative-intelligence-engine.ts`

Pass `clientKeys` to Creative Director Agent:
```typescript
const creativeBrief = await creativeDirector.reason(businessContext, request.clientKeys);
```

#### 3. Updated Creative Director Agent
**File:** `src/core/creative/reasoning/creative-director-agent.ts`

- Accept `clientKeys` parameter in `reason()` method
- Pass to `callLLMReasoning()` method
- Prioritize client key over environment variable:

```typescript
const apiKey = clientKeys?.gemini || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
```

#### 4. Updated API Route
**File:** `src/app/api/ai/generate-image-v3/route.ts`

Pass client keys from request to engine:
```typescript
const creativeOutput = await engine.generate({
  // ... other params
  clientKeys: {
    gemini: client_gemini_key,
    openai: client_openai_key,
    anthropic: undefined
  }
});
```

### Result
Now API keys entered in UI Settings flow correctly:
```
UI Settings → localStorage (✅)
    ↓
API Route → client_gemini_key (✅)
    ↓
Engine → clientKeys (✅)
    ↓
Agent → Uses clientKeys.gemini FIRST (✅)
    ↓
LLM reasoning with 0.85+ confidence (✅)
```

---

## ✅ ISSUE 2: Copywriter Generates Wrong Content Type

### Problem
Copywriter API generates **Content Calendar** (4-week planning document with W1-W4 structure) instead of **single marketing post** for customer acquisition.

**Output (BEFORE):**
```
📅 [BELLA EOS CONTENT WORKER] BỘ LỊCH NỘI DUNG TRUYỀN THÔNG...

### 📌 BÀI VIẾT TUẦN 1 (W1 - KÍCH HOẠT NHẬN DIỆN)
- ⏰ Lịch đăng bài tự động: 09:00 AM — Thứ Tư, Ngày 04/02/2026
- 🎯 Chủ đề truyền thông: ...
- 📝 Nội dung xuất bản (Post Body): ...

### 📌 BÀI VIẾT TUẦN 2 (W2 - SOCIAL PROOF)
...
```

This is **planning documentation**, NOT customer-facing marketing copy.

### Solution Implemented

#### 1. Rewrote System Prompt
**File:** `src/app/api/ai/write-post/route.ts`

**BEFORE:** Instructed AI to generate weekly content calendar with scheduling metadata

**AFTER:** Instruct AI to generate single marketing post with clear structure:

```typescript
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
```

#### 2. Simplified User Message
**BEFORE:** Generic instruction
```typescript
const userMessage = `Mục tiêu chỉ thị của CEO: "${objective}"

Hãy viết bài đăng Facebook truyền thông cho đối tượng khách hàng mục tiêu để đạt mục tiêu trên.`;
```

**AFTER:** Specific, actionable instruction
```typescript
const userMessage = `Mục tiêu chiến dịch: "${objective}"

Tone giọng: ${effectiveTone}
Đối tượng mục tiêu: ${effectiveSegment}

Hãy viết BÀI ĐĂNG FACEBOOK thu hút khách hàng mục tiêu này.`;
```

#### 3. Updated Fallback Writer
Rewrote `generateFallbackPost()` to output single marketing post instead of 4-week calendar.

**Example Output (AFTER):**
```
🔥 BẠN ĐANG TỐN 8 GIỜ MỖI NGÀY ĐỂ QUẢN LÝ THỦ CÔNG SPA CỦA MÌNH?

Quản lý lịch hẹn trùng lặp, dòng tiền thất thoát cuối tháng và nhân sự tiếp thị biến động đang là "cơn ác mộng" âm thầm bào mòn lợi nhuận của các chủ cơ sở làm đẹp.

✨ Giải pháp đột phá Bella EOS xuất hiện mang đến Hệ điều hành Doanh nghiệp AI thông minh:

✅ Tự động hóa 100% quy trình từ đặt lịch → kiểm toán tài chính → điều phối tiếp thị đa kênh
✅ Giải phóng 80% thời gian vận hành, tăng 300% hiệu suất quản lý
✅ Hơn 1,200+ Spa trên toàn quốc đã tin dùng và đạt kết quả vượt trội

👉 Đăng ký trải nghiệm bản Demo miễn phí ngay hôm nay để làm chủ công nghệ AI hàng đầu!

#BellaEOS #QuanLySpa #TietKiemChiPhi #DemoMienPhi #TuDongHoaSpa
```

#### 4. Removed Unused Helper Functions
Deleted 3 functions no longer needed:
- `getVietnameseDayOfWeek()` - Generated Vietnamese day names
- `parseMonthAndYear()` - Extracted month/year from objective
- `generateWeeklyDates()` - Generated 4-week scheduling dates

These were only used for Content Calendar generation.

### Result
Copywriter now generates **customer-facing marketing copy** that:
- ✅ Targets specific audience pain points
- ✅ Uses conversational, engaging tone
- ✅ Includes clear call-to-action
- ✅ Optimized for conversion (not education)
- ✅ Single post format (not multi-week calendar)

---

## 🧪 TESTING

### TypeScript Compilation
```bash
npx tsc --noEmit
```
✅ **Result:** No errors

### Manual Testing Required

1. **Test API Key Flow:**
   - Go to `/settings`
   - Enter Gemini API key in "Google Gemini" section
   - Save key
   - Run workflow with objective
   - Check logs for `[CreativeDirectorAgent] ✓ Success with gemini-...`

2. **Test Copywriter Output:**
   - Run workflow
   - Check Task #1 output (Facebook post content)
   - Verify output is single post, NOT content calendar
   - Verify content is marketing-focused, NOT technical documentation

3. **Test Image Generation:**
   - After API key is set, images should use Imagen/DALL-E
   - No more purple SVG fallback
   - Check logs for `[API v3] ✓ Google Imagen (...) succeeded`

---

## 📦 FILES CHANGED

### Core Engine (API Key Fix)
1. `src/types/creative-intelligence.ts` - Added clientKeys to interface
2. `src/core/creative/creative-intelligence-engine.ts` - Pass clientKeys to Agent
3. `src/core/creative/reasoning/creative-director-agent.ts` - Accept & use clientKeys
4. `src/app/api/ai/generate-image-v3/route.ts` - Pass clientKeys from request

### Copywriter (Content Quality Fix)
5. `src/app/api/ai/write-post/route.ts` - Rewrote prompts & removed calendar logic

---

## 🚀 DEPLOYMENT NOTES

1. **No Breaking Changes:** All changes are backward compatible
2. **Environment Variables Still Work:** If `GEMINI_API_KEY` is set in `.env.local`, it still works (as fallback)
3. **UI Keys Take Priority:** Client keys from UI Settings are now used first
4. **Immediate Effect:** Changes take effect on next page reload (no DB migration needed)

---

## 🐛 KNOWN ISSUES & NEXT STEPS

### If Gemini Key Still Fails:
1. Open DevTools Console (F12)
2. Run: `JSON.parse(localStorage.getItem('bella_eos_integrations'))`
3. Check if `gemini::api_key` exists
4. If missing, key wasn't saved properly - re-enter in `/settings`

### If Content Still Wrong:
- Check which LLM model is responding (logs show provider/model)
- Fallback writer has been updated, so worst-case output is still improved
- If using custom systemPrompt in agent config, it overrides the new prompt

---

## 📊 EXPECTED IMPROVEMENTS

| Metric | Before | After |
|--------|--------|-------|
| **Creative Brief Confidence** | 0.75 (rule-based) | 0.85+ (LLM reasoning) |
| **Content Type** | Technical calendar | Marketing copy |
| **Content Length** | 500+ words (4 posts) | 150-250 words (1 post) |
| **API Key Source** | Only `.env.local` | UI Settings → localStorage → API |
| **Image Quality** | SVG fallback | Imagen/DALL-E (real AI) |

---

## ✅ CHECKLIST

- [x] Fix Gemini API key propagation (UI → Agent)
- [x] Rewrite copywriter system prompt
- [x] Update fallback writer
- [x] Remove unused date generation code
- [x] TypeScript compilation passes
- [ ] User tests with real Gemini key
- [ ] Verify image generation works
- [ ] Verify content quality improved

---

**Status:** ✅ **CODE COMPLETE** - Ready for user testing
