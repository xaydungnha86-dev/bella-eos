# KIẾN TRÚC TẠO ẢNH MARKETING BANNER - BELLA EOS

**Version**: 4.0.0  
**Last Updated**: 2026-01-26  
**Author**: Bella EOS AI Team  
**Status**: PRODUCTION

---

## 📋 MỤC LỤC

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Luồng xử lý chi tiết](#2-luồng-xử-lý-chi-tiết)
3. [Layer 1: Business Context Aggregation](#3-layer-1-business-context-aggregation)
4. [Layer 2: Creative Reasoning (LLM)](#4-layer-2-creative-reasoning-llm)
5. [Layer 3: Expert Prompt Composition](#5-layer-3-expert-prompt-composition)
6. [Layer 4: AI Image Generation](#6-layer-4-ai-image-generation)
7. [Cấu trúc thư mục & files](#7-cấu-trúc-thư-mục--files)
8. [Troubleshooting & Best Practices](#8-troubleshooting--best-practices)

---

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1. Triết lý thiết kế

**Vấn đề cần giải quyết**:
- CEO nhập mục tiêu đơn giản: "Chiến dịch spa cao cấp tháng 1"
- Hệ thống cần tạo banner marketing chuyên nghiệp với:
  - Headline thu hút
  - 3 bullet points lợi ích
  - Call-to-action rõ ràng
  - Hình ảnh phù hợp với ngành nghề
  - Thiết kế đúng brand identity

**Giải pháp**: 4-Layer AI Architecture

```
CEO Input: "Chiến dịch spa cao cấp tháng 1"
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Business Context Aggregation                          │
│ - Thu thập dữ liệu doanh nghiệp (doanh thu, khách hàng)        │
│ - Phân tích ngành nghề (spa/restaurant/real estate)            │
│ - Trích xuất brand DNA (logo, màu sắc, tone giọng)             │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Creative Reasoning (LLM - Gemini 2.5 Flash)           │
│ - Đọc business context                                          │
│ - Suy luận chiến lược creative                                  │
│ - Tạo Creative Brief với:                                       │
│   + posterHeadline: "AI VẬN HÀNH SPA THẾ HỆ MỚI"              │
│   + keyBenefits: [3 lợi ích]                                    │
│   + callToAction: "ĐĂNG KÝ TRẢI NGHIỆM NGAY"                   │
│   + visualDirection: Mô tả hình ảnh cần tạo                     │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Expert Prompt Composition                             │
│ - Đọc Creative Brief                                            │
│ - Tạo prompt chi tiết NHƯ MỘT DESIGNER CHUYÊN NGHIỆP          │
│ - Mô tả CHÍNH XÁC cách AI cần render text                      │
│ - Output: Prompt 800-2000 words với spec đầy đủ                │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: AI Image Generation (Gemini 3.1 Flash Image)          │
│ - Nhận expert prompt                                            │
│ - Render TOÀN BỘ banner (background + text)                    │
│ - Output: PNG 1200x630px                                        │
└─────────────────────────────────────────────────────────────────┘
    ↓
Output: /temp-banners/gen_v4_xxx.png
```

### 1.2. So sánh với kiến trúc cũ (v3)

| Tiêu chí | v3 (Canvas Overlay) | v4 (AI Full Render) |
|----------|---------------------|---------------------|
| Background | AI-generated | AI-generated |
| Text overlay | Canvas + SVG (Sharp) | **AI renders natively** |
| Flexibility | Giới hạn bởi SVG | **Unlimited** |
| Quality | Tốt | **Xuất sắc** |
| Maintenance | Cần code thay đổi | **Chỉ update prompt** |
| Dependencies | Sharp, Node Canvas | **Không cần** |
| Speed | 22s (20s AI + 2s Canvas) | **20s (AI only)** |



---

## 2. LUỒNG XỬ LÝ CHI TIẾT

### 2.1. Entry Point

**File**: `src/app/api/orchestrator/run/route.ts`

```typescript
// Task 3 trong workflow: Generate Media Creative
async function tool_generate_media_creative(
  input: any, 
  clientKeys?: any, 
  taskOutputs?: Record<string, string>, 
  context?: any
): Promise<ToolResult>
```

**Input nhận được**:
- `input.objective`: Mục tiêu CEO (VD: "Chiến dịch spa cao cấp tháng 1")
- `input.content_from`: Reference đến Task 2 (Facebook post content)
- `clientKeys.gemini`: API key của client
- `taskOutputs`: Output từ các task trước
- `context.brandDna`: Thông tin brand (logo, màu sắc, tone)

**Flow**:
1. Trích xuất `copywriterContent` từ `taskOutputs['t2']`
2. Phân tích domain (spa/restaurant/real estate) từ content
3. **OVERRIDE objective** nếu content chứa domain rõ ràng
4. Gọi API v4: `POST /api/ai/generate-image-v4`



### 2.2. API v4 Endpoint

**File**: `src/app/api/ai/generate-image-v4/route.ts`

```typescript
POST /api/ai/generate-image-v4

// Request Body
{
  objective: string,           // CEO objective
  copywriterContent: string,   // Facebook post từ Task 2
  brandDna: {
    identity: { brandName, targetSegment },
    voice: { tone },
    visual: { style, colors: { primary, accent } }
  },
  format: '16:9',
  client_gemini_key: string,   // Gemini API key
  client_openai_key?: string   // Fallback DALL-E
}
```

**Output**:
```json
{
  "success": true,
  "provider": "google-gemini",
  "model": "gemini-3.1-flash-image",
  "imageUrl": "/temp-banners/gen_v4_xxx.png",
  "creativeBrief": {
    "headline": "AI VẬN HÀNH SPA THẾ HỆ MỚI",
    "keyBenefits": ["...", "...", "..."],
    "callToAction": "ĐĂNG KÝ TRẢI NGHIỆM NGAY"
  },
  "textContent": { /* text được render */ },
  "compositionMethod": "ai-renders-everything",
  "pipelineVersion": "4.0.0"
}
```



---

## 3. LAYER 1: BUSINESS CONTEXT AGGREGATION

**File**: `src/core/creative/creative-intelligence-engine.ts`

### 3.1. Chức năng

Thu thập toàn bộ business context để LLM có đủ thông tin suy luận:

```typescript
interface BusinessContextPackage {
  ceoObjective: string;
  
  enterpriseContext: {
    erp: { revenue, customers, campaigns },
    crm: { leads, conversionRate },
    budget: { totalBudget, duration }
  };
  
  copywriterContent: {
    rawText: string,              // Facebook post từ Task 2
    extractedEntities: [...],
    tone: string,
    keyMessages: string[]
  };
  
  brandDNA: {
    identity: { brandName, mission, targetSegment },
    voice: { tone, personality },
    visual: { style, colors }
  };
  
  campaignMemory: {
    successfulPatterns: [...],    // Patterns đã thành công
    avoidPatterns: [...],          // Patterns cần tránh
    performanceInsights: [...]
  };
  
  knowledgeContext: {
    domainFacts: [...],            // Kiến thức về ngành
    industryTrends: [...]
  };
}
```

### 3.2. Demo Data vs Production Data

**Hiện tại** (MVP): Sử dụng mock data để demo
**Tương lai** (Production): Kết nối real ERP/CRM/Database



---

## 4. LAYER 2: CREATIVE REASONING (LLM)

**File**: `src/core/creative/reasoning/creative-director-agent.ts`

### 4.1. Vai trò

Đóng vai **Creative Director chuyên nghiệp** - đọc business context và suy luận chiến lược creative.

### 4.2. LLM Model

- **Primary**: Gemini 2.5 Flash (text reasoning)
- **Fallback**: Gemini 2.5 Pro → Gemini 3 Flash Preview

### 4.3. System Prompt

```
You are a Senior Creative Director with 15+ years experience.

BUSINESS CONTEXT:
- Industry: spa_wellness
- Target: Premium spa owners
- Budget: 100,000,000 VND
- Revenue Target: 500,000,000 VND
- Current Customers: 1,289

BRAND DNA:
- Name: BELLA EOS
- Mission: AI platform for spa management
- Voice: Premium, Professional, Elegant
- Colors: Forest Green (#061E17), Royal Gold (#D4AF37)

COPYWRITER CONTENT (from Task #1):
[Facebook post về spa management...]

YOUR TASK:
Create a Creative Brief with this JSON structure:

{
  "campaignGoal": "Business outcome we're driving",
  "posterHeadline": "NEW headline for POSTER (NOT Facebook headline)",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "callToAction": "Action-oriented CTA (4-6 words)",
  "heroSubject": "Main visual (specific: 'premium glass jars...')",
  "environmentDescription": "Setting (luxury spa room...)",
  "colorMood": "Emotions colors evoke",
  "lightingMood": "Lighting atmosphere"
}
```



### 4.4. Output: Creative Brief

```typescript
interface CreativeBrief {
  // Strategic
  campaignGoal: string;
  targetAudience: string;
  emotionalTone: string;
  
  // Narrative
  visualStory: string;
  designDirection: string;
  
  // Execution (KEY FIELDS!)
  posterHeadline: string;        // "AI VẬN HÀNH SPA THẾ HỆ MỚI"
  keyBenefits: string[];         // ["Benefit 1", "Benefit 2", "Benefit 3"]
  callToAction: string;          // "ĐĂNG KÝ TRẢI NGHIỆM NGAY"
  
  heroSubject: string;           // "Premium glass cosmetic jars..."
  environmentDescription: string; // "Luxury spa wellness room..."
  colorMood: string;
  lightingMood: string;
  compositionRule: string;       // "rule_of_thirds"
  
  // Guidance
  avoidances: string[];
  successMetrics: string[];
  
  // Metadata
  confidenceScore: number;       // 0.85
  reasoningChain: string[];
  generatedAt: string;
}
```

### 4.5. Fallback Logic

Nếu LLM fail (no API key, timeout, error):
- Dùng **rule-based generation** theo domain
- Spa → headlines về spa management
- Restaurant → headlines về F&B operations
- Real Estate → headlines về property investment



---

## 5. LAYER 3: EXPERT PROMPT COMPOSITION

**File**: `src/core/creative/composition/expert-prompt-composer.ts`

### 5.1. Vai trò

Transform Creative Brief thành **expert design prompt** mà AI image model có thể hiểu và render chính xác.

### 5.2. Input

```typescript
ExpertPromptComposer.compose(
  creativeBrief,           // From Layer 2
  {
    objective,
    industry: 'spa_wellness',
    brandName: 'BELLA EOS',
    targetAudience: 'Premium spa owners'
  },
  {
    brandName: 'BELLA EOS',
    voiceTone: 'Professional & Premium',
    visualStyle: 'Minimalist Glassmorphism',
    colors: { primary: '#061E17', accent: '#D4AF37' }
  }
)
```

### 5.3. Output Structure

```typescript
interface ExpertDesignPrompt {
  mainPrompt: string;          // 800-2000 words detailed prompt
  layoutInstructions: string;
  typographySpec: string;
  textContent: {
    headline: "AI VẬN HÀNH SPA THẾ HỆ MỚI",
    bullets: ["...", "...", "..."],
    cta: "ĐĂNG KÝ TRẢI NGHIỆM NGAY",
    badge: "🎁 DEMO MIỄN PHÍ"
  };
  negativePrompt: string;
  confidence: number;
}
```



### 5.4. Main Prompt Structure

**CRITICAL**: Prompt KHÔNG chứa số pixel để tránh AI render annotations

```
Create a professional marketing banner for BELLA EOS (spa_wellness industry).

VISUAL SCENE:
Premium glass cosmetic jars on polished marble surface with soft orchid flowers,
placed in luxury spa wellness room with frosted glass, warm ambient lighting,
natural stone accent wall. Evoke aspirational, serene, sophisticated emotions.
Lighting: golden hour warmth. Color mood: warm, premium, trustworthy with 
emphasis on deep forest green and royal gold tones.

LAYOUT & COMPOSITION:
- Horizontal banner format in 16:9 aspect ratio
- Rule of thirds composition
- Main subject positioned on RIGHT SIDE occupying majority of canvas
- LEFT SIDE features text overlay with subtle dark gradient
- Top section includes logo and promotional badge
- Bottom section has prominent call-to-action button

TEXT CONTENT TO RENDER:

1. TOP-LEFT LOGO BADGE:
   Text: "BELLA EOS"
   Style: Small rounded badge with royal gold background
   Typography: Bold sans-serif, white text
   Position: Upper left corner with comfortable margin

2. TOP-RIGHT PROMOTIONAL BADGE:
   Text: "🎁 DEMO MIỄN PHÍ"
   Style: Rounded badge with white background
   Typography: Bold sans-serif, forest green text
   Position: Upper right corner with comfortable margin

3. MAIN HEADLINE (MOST PROMINENT):
   Text: "AI VẬN HÀNH SPA THẾ HỆ MỚI"
   Typography: Extra bold sans-serif (very large size), white color
   Text effects: Strong drop shadow for readability
   Position: Left-center area, vertically centered
   CRITICAL: This headline must be LARGE, BOLD, and CLEARLY READABLE

4. KEY BENEFITS (THREE BULLET POINTS):
   Text line 1: "✓ Tối ưu xếp lịch & phân ca KTV"
   Text line 2: "✓ Báo cáo doanh thu thời gian thực"
   Text line 3: "✓ Giữ chân 95% khách hàng VIP"
   Typography: Regular sans-serif (medium size), white color
   Position: Below headline, left-aligned with comfortable left margin
   Spacing: Adequate vertical gap between each benefit line

5. CALL-TO-ACTION BUTTON:
   Text: "ĐĂNG KÝ TRẢI NGHIỆM NGAY →"
   Style: Large rounded button with gradient (vibrant pink to red)
   Typography: Bold sans-serif (large size), white text, uppercase
   Position: Bottom center with comfortable bottom margin
   Effects: Subtle glow to make button stand out

CRITICAL DESIGN PRINCIPLES:
- ALL TEXT MUST BE CLEARLY RENDERED AND READABLE
- NO PLACEHOLDER TEXT
- Maintain brand color scheme
- Professional graphic design quality
- Text integrates naturally with visual scene
- DO NOT include dimension annotations, pixel measurements, or technical specs
```



### 5.5. Negative Prompt

Để tránh AI render sai:

```
blurry text, unreadable text, distorted text, misspelled words,
placeholder text, lorem ipsum, watermark, low quality, pixelated,
amateur design, cluttered composition, generic stock photos,
bad typography, poor contrast, oversaturated colors,
visible pixel measurements, dimension annotations,
technical specifications visible, px numbers, size labels,
measurement overlays, grid lines, ruler marks
```

### 5.6. Dynamic Content Generation

#### Badge Text
```typescript
generateOfferBadge(objective: string): string {
  if (objective.includes('demo')) return '🎁 DEMO MIỄN PHÍ';
  if (objective.includes('giảm giá')) return '🔥 ƯU ĐÃI ĐẶC BIỆT';
  if (objective.includes('tư vấn')) return '💎 TƯ VẤN MIỄN PHÍ';
  return '🎁 NHẬN ƯU ĐÃI';
}
```

#### Default Bullets (by industry)
```typescript
generateDefaultBullets(industry: string): string[] {
  if (industry === 'spa') return [
    'Tối ưu xếp lịch & quản lý KTV',
    'Báo cáo doanh thu tự động',
    'Tăng 95% giữ chân khách VIP'
  ];
  
  if (industry === 'restaurant') return [
    'Quản lý đặt bàn thông minh',
    'Tối ưu chi phí nguyên liệu',
    'Tăng 40% hiệu suất phục vụ'
  ];
  
  // ... more industries
}
```



---

## 6. LAYER 4: AI IMAGE GENERATION

**File**: `src/app/api/ai/generate-image-v4/route.ts`

### 6.1. Model Waterfall Strategy

Try các models theo thứ tự cho đến khi succeed:

```typescript
1. Gemini 3.1 Flash Image     // Best for text rendering (2026)
2. Gemini 3 Pro Image         // Higher quality
3. Gemini 2.5 Flash Image     // Fallback
4. DALL-E 3                   // If Gemini fails
```

### 6.2. Gemini Image API Call

```typescript
async function tryGeminiWithText() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: expertPrompt.mainPrompt }]
        }],
        generationConfig: {
          temperature: 0.4,  // Lower for precise text rendering
          candidateCount: 1
        }
      })
    }
  );
  
  const data = await res.json();
  const imageBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  // Save to /public/temp-banners/
  const savedUrl = saveBase64ToPublic(imageBase64);
  return savedUrl; // "/temp-banners/gen_v4_xxx.png"
}
```



### 6.3. Image Storage

```typescript
function saveBase64ToPublic(dataUrl: string): string {
  const base64Data = dataUrl.split(';base64,')[1];
  const dir = path.join(process.cwd(), 'public', 'temp-banners');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filename = `gen_v4_${Date.now()}_${randomId()}.png`;
  const filepath = path.join(dir, filename);
  const buffer = Buffer.from(base64Data, 'base64');
  
  fs.writeFileSync(filepath, buffer);
  
  return `/temp-banners/${filename}`;
}
```

**Lưu ý**:
- Images lưu tại `public/temp-banners/`
- Tên file: `gen_v4_{timestamp}_{randomId}.png`
- Public URL: `/temp-banners/gen_v4_xxx.png`
- **TODO**: Implement cleanup job xóa ảnh cũ (>7 days)

### 6.4. DALL-E 3 Fallback

Nếu Gemini fail, thử DALL-E 3:

```typescript
async function tryDalleWithText() {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: expertPrompt.mainPrompt,
      n: 1,
      size: '1792x1024',  // 16:9 landscape
      quality: 'hd'
    })
  });
  
  return data.data[0].url; // Direct URL from OpenAI
}
```



---

## 7. CẤU TRÚC THƯ MỤC & FILES

```
DN WORKFLOW/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── orchestrator/
│   │       │   ├── plan/
│   │       │   │   └── route.ts          # Tạo task plan
│   │       │   └── run/
│   │       │       └── route.ts          # Execute tasks
│   │       │                             # → tool_generate_media_creative()
│   │       │
│   │       └── ai/
│   │           ├── generate-image-v4/
│   │           │   └── route.ts          # V4 API (AI renders everything)
│   │           │
│   │           └── generate-image-v3/
│   │               └── route.ts          # V3 API (Canvas overlay - deprecated)
│   │
│   ├── core/
│   │   └── creative/
│   │       ├── creative-intelligence-engine.ts
│   │       │                             # Layer 1: Business Context
│   │       │
│   │       ├── reasoning/
│   │       │   └── creative-director-agent.ts
│   │       │                             # Layer 2: LLM Creative Reasoning
│   │       │
│   │       └── composition/
│   │           ├── expert-prompt-composer.ts
│   │           │                         # Layer 3: Expert Prompt
│   │           │
│   │           └── canvas-compositor.ts
│   │                                     # Deprecated (v3 only)
│   │
│   └── types/
│       └── creative-intelligence.ts      # TypeScript interfaces
│
├── public/
│   └── temp-banners/                     # Generated images stored here
│       ├── gen_v4_xxx.png
│       └── gen_v3_xxx.png
│
└── docs/
    └── IMAGE_GENERATION_ARCHITECTURE.md  # This document
```



---

## 8. TROUBLESHOOTING & BEST PRACTICES

### 8.1. Common Issues

#### Issue 1: Text bị mờ hoặc không đọc được

**Nguyên nhân**: AI model không render text tốt với prompt hiện tại

**Giải pháp**:
1. Tăng emphasis trong prompt: "CRITICAL: Text must be LARGE and BOLD"
2. Giảm temperature (0.4 → 0.2) để stable hơn
3. Thử model khác (Gemini 3 Pro Image có quality tốt hơn)
4. Fallback về v3 (Canvas overlay) nếu cần

#### Issue 2: AI render số pixel (18px, 60px...)

**Nguyên nhân**: Prompt chứa technical measurements

**Giải pháp**:
- ✅ Dùng: "very large size", "comfortable margin"
- ❌ Tránh: "52px", "100px from edge"
- Thêm vào negative prompt: "visible pixel measurements, dimension annotations"

#### Issue 3: Hình ảnh không đúng ngành nghề

**Nguyên nhân**: Objective detection sai hoặc prompt không rõ ràng

**Giải pháp**:
- Check code phát hiện domain trong `tool_generate_media_creative()`
- Đảm bảo `copywriterContent` được analyze đúng
- Update domain detection keywords



#### Issue 4: Creative Brief không có keyBenefits/callToAction

**Nguyên nhân**: LLM không generate đầy đủ fields

**Giải pháp**:
- Check `validateBrief()` trong creative-director-agent.ts
- Nếu missing → dùng `generateDefaultKeyBenefits()` và `generateDefaultCTA()`
- Fallback logic đã được implement

#### Issue 5: Task 1 (Markdown Report) vẫn xuất hiện

**Nguyên nhân**: Đang xem workflow cũ (đã tạo trước khi disable Task 1)

**Giải pháp**:
- Tạo workflow **HOÀN TOÀN MỚI** với objective khác
- Clear browser cache: Ctrl+Shift+R
- Restart dev server nếu cần

### 8.2. Best Practices

#### Viết Prompt

✅ **DO**:
- Dùng ngôn ngữ tự nhiên: "large size", "comfortable margin"
- Mô tả visual hierarchy: "most prominent", "secondary focus"
- Specific về visual: "premium glass jars on marble" not "spa products"
- Emphasis quan trọng: "CRITICAL", "MUST", "CLEARLY"

❌ **DON'T**:
- Dùng số pixel: "52px", "100px margin"
- Dùng technical terms: "rgba(0,0,0,0.3)"
- Quá chung chung: "nice image", "good design"



#### Testing Changes

**Quy trình test đúng**:

1. **Code changes** → Save files
2. **Wait for hot-reload** (Next.js tự động compile)
3. **Hard refresh browser**: Ctrl+Shift+R
4. **Tạo workflow MỚI** (không dùng lại workflow cũ)
5. **Check server logs** để debug
6. **Kiểm tra output** trong UI

**Common mistake**: Test trên workflow cũ → vẫn thấy output cũ

#### Debugging

**Server logs quan trọng**:
```
[API v4] Creative Intelligence Engine v4
[API v4] ✓ Creative Brief generated
[API v4] Headline: ...
[API v4] ✓ Expert Design Prompt Composed
[API v4] Prompt length: 2847 chars
[API v4] Trying gemini-3.1-flash-image...
[API v4] ✓ SUCCESS with gemini-3.1-flash-image
```

**Browser DevTools**:
- Network tab → Check API requests/responses
- Console tab → Check React errors
- Application tab → Clear storage if needed



### 8.3. Performance Optimization

#### Caching Strategy (TODO)

```typescript
// Cache Creative Brief for same objective
const briefCacheKey = `brief_${md5(objective + brandName)}`;
const cachedBrief = await redis.get(briefCacheKey);

if (cachedBrief) {
  // Skip Layer 2, use cached brief
  return JSON.parse(cachedBrief);
}

// Generate new brief
const brief = await CreativeDirectorAgent.reason(...);
await redis.set(briefCacheKey, JSON.stringify(brief), 'EX', 3600);
```

#### Image Cleanup Job

```typescript
// Cron job: Delete images older than 7 days
async function cleanupOldImages() {
  const dir = path.join(process.cwd(), 'public', 'temp-banners');
  const files = fs.readdirSync(dir);
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    
    if (now - stats.mtimeMs > SEVEN_DAYS) {
      fs.unlinkSync(filepath);
      console.log(`[Cleanup] Deleted old image: ${file}`);
    }
  }
}
```



### 8.4. Future Enhancements

#### 1. Multi-language Support

```typescript
// Detect language from objective
const language = detectLanguage(objective); // 'vi' | 'en' | 'zh'

// Generate bullets in detected language
if (language === 'en') {
  bullets = [
    'Optimize scheduling & staff allocation',
    'Real-time revenue reports',
    'Retain 95% VIP customers'
  ];
}
```

#### 2. A/B Testing Variants

```typescript
// Generate 3 variants with different headlines
const variants = await Promise.all([
  generateImage({ headline: variant1 }),
  generateImage({ headline: variant2 }),
  generateImage({ headline: variant3 })
]);

// Return all 3 for user to choose
return { variants };
```

#### 3. Brand Logo Upload

```typescript
// Upload logo image
const logoUrl = await uploadBrandLogo(file);

// Include in prompt
prompt += `
Logo: Render the brand logo from ${logoUrl} in top-left corner
Style: Maintain original logo design, subtle placement
`;
```



#### 4. Video Generation

Extend to video banners:

```typescript
// Use Veo 3.1 for video generation
const videoPrompt = `
Based on the static banner, create a 5-second video:
- Camera: Slow zoom in on hero subject
- Text: Fade in headline and bullets sequentially
- CTA: Pulse animation on button
- Music: Soft ambient spa music
`;

const videoUrl = await generateWithVeo(videoPrompt);
```

---

## 9. APPENDIX

### 9.1. TypeScript Interfaces

**Full type definitions** tại: `src/types/creative-intelligence.ts`

Key interfaces:
- `BusinessContextPackage`
- `CreativeBrief`
- `ExpertDesignPrompt`
- `CreativeOutput`

### 9.2. API Keys Required

| Service | Key Format | Usage |
|---------|-----------|-------|
| Gemini API | `AIzaSy...` (39 chars) | Image generation + Creative reasoning |
| OpenAI | `sk-proj-...` | DALL-E 3 fallback |
| Anthropic | `sk-ant-...` | (Optional) Claude for reasoning |

**Lưu ý**: User cần có **paid Gemini API key** với 50+ models enabled.



### 9.3. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12 | Initial release with template-based generation |
| 2.0.0 | 2026-01-10 | Introduced Creative Intelligence Engine (4 layers) |
| 3.0.0 | 2026-01-20 | Added Canvas Compositor for text overlay |
| 3.1.0 | 2026-01-25 | Fixed Canvas XML parse errors, removed emojis from SVG |
| **4.0.0** | **2026-01-26** | **AI renders everything (no Canvas), Expert Prompt Composer** |

### 9.4. Contributors

- **AI Architecture**: Bella EOS AI Team
- **Implementation**: Kiro AI Assistant
- **Product Owner**: CEO Bella EOS

---

## 10. QUICK START GUIDE

### Để thay đổi text overlay:

1. **Nếu muốn thay đổi bullets**:
   - Edit: `src/core/creative/composition/expert-prompt-composer.ts`
   - Method: `generateDefaultBullets()`
   - Hoặc: Update Creative Director prompt để generate better bullets

2. **Nếu muốn thay đổi CTA**:
   - Edit: `src/core/creative/composition/expert-prompt-composer.ts`
   - Method: `generateOfferBadge()` và `generateDefaultCTA()`

3. **Nếu muốn thay đổi layout**:
   - Edit: `src/core/creative/composition/expert-prompt-composer.ts`
   - Method: `buildMainPrompt()` - section "LAYOUT & COMPOSITION"

4. **Nếu muốn thay đổi visual style**:
   - Edit: Creative Director prompt trong `creative-director-agent.ts`
   - Hoặc: Update brand DNA trong database

### Để debug:

```bash
# Check server logs
npm run dev
# Look for [API v4] logs

# Check generated images
ls public/temp-banners/

# Test API directly
curl -X POST http://localhost:3000/api/ai/generate-image-v4 \
  -H "Content-Type: application/json" \
  -d '{"objective":"Test spa campaign","client_gemini_key":"..."}'
```

---

**END OF DOCUMENT**

For questions or issues, contact: Bella EOS Development Team
