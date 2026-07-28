# IMAGE GENERATION - QUICK REFERENCE

## 🎯 Luồng chính (4 bước)

```
CEO Input → Layer 1 (Context) → Layer 2 (LLM Brief) → Layer 3 (Prompt) → Layer 4 (AI Render)
```

## 📁 Files quan trọng

| File | Chức năng | Khi nào sửa |
|------|-----------|-------------|
| `src/app/api/orchestrator/run/route.ts` | Entry point, gọi v4 API | Thay đổi workflow logic |
| `src/app/api/ai/generate-image-v4/route.ts` | V4 API endpoint | Thay đổi model selection |
| `src/core/creative/reasoning/creative-director-agent.ts` | LLM creative reasoning | Thay đổi creative strategy |
| `src/core/creative/composition/expert-prompt-composer.ts` | Tạo prompt cho AI | **Thay đổi text/layout** |
| `src/types/creative-intelligence.ts` | TypeScript types | Thêm fields mới |

## 🔧 Thay đổi thường gặp

### 1. Thay đổi bullets mặc định

File: `expert-prompt-composer.ts`
```typescript
private static generateDefaultBullets(industry: string): string[] {
  if (industry === 'spa') return [
    'Bullet 1 mới',  // ← EDIT HERE
    'Bullet 2 mới',
    'Bullet 3 mới'
  ];
}
```

### 2. Thay đổi CTA text

```typescript
private static generateDefaultCTA(objective: string): string {
  if (objective.includes('demo')) return 'CTA mới';  // ← EDIT
}
```

### 3. Thay đổi layout prompt

Method: `buildMainPrompt()` trong `expert-prompt-composer.ts`

**Lưu ý**: 
- ✅ Dùng "large size", "comfortable margin"  
- ❌ KHÔNG dùng "52px", "100px"



## 🐛 Debug Checklist

**Vấn đề**: Text không hiển thị hoặc bị mờ
- [ ] Check server logs: `[API v4] ✓ SUCCESS`?
- [ ] Check model: Gemini 3.1 Flash Image?
- [ ] Try lower temperature: 0.4 → 0.2
- [ ] Check prompt có measurements không? (18px, 60px)

**Vấn đề**: Task 1 vẫn hiển thị markdown report
- [ ] Tạo workflow **MỚI** (không dùng cũ)
- [ ] Clear browser cache: Ctrl+Shift+R
- [ ] Check code: Task 1 có bị comment out?

**Vấn đề**: React duplicate key error (t5)
- [ ] Check `plan/route.ts`: Athena task có `task_id: 't6'`?
- [ ] Restart dev server

## 🚀 Test Workflow

1. Hard refresh: `Ctrl + Shift + R`
2. Tạo workflow MỚI: "Marketing spa Q1 2026"
3. Check output:
   - Task 1 = Content (Facebook post)
   - Task 2 = Creative (Banner)
   - Task 3 = Publisher
4. Kiểm tra banner:
   - Headline rõ ràng?
   - 3 bullets hiển thị?
   - CTA button có text?
   - KHÔNG có số pixel?

## 📊 API Models

**Text Reasoning**:
- Gemini 2.5 Flash (primary)
- Gemini 2.5 Pro (fallback)

**Image Generation**:
1. Gemini 3.1 Flash Image ✅ (best)
2. Gemini 3 Pro Image
3. Gemini 2.5 Flash Image
4. DALL-E 3 (OpenAI fallback)

## 💡 Pro Tips

- **Testing**: Luôn tạo workflow mới để test changes
- **Prompt**: Dùng natural language, tránh technical specs
- **Debugging**: Check server logs TRƯỚC KHI sửa code
- **Performance**: Images lưu local, cần cleanup job

---

**Full docs**: `docs/IMAGE_GENERATION_ARCHITECTURE.md`
