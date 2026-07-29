# API Key Leaked - Cách Fix ⚠️

## Vấn đề
Imagen 4.0 đang fallback về banner-image vì:

```json
{
  "error": {
    "code": 403,
    "message": "Your API key was reported as leaked. Please use another API key.",
    "status": "PERMISSION_DENIED"
  }
}
```

## Nguyên nhân
API key `AIzaSyDtqU1UQpJZYP4Ez7SRUQDoxrMsNJPF_jU` trong file `scratch/test-imagen.js` đã bị:
- ❌ Hardcode trong source code
- ❌ Commit lên Git
- ❌ Push lên GitHub (public repo)
- ❌ Google phát hiện và disable

## Giải pháp

### Bước 1: Tạo API Key Mới
1. Vào: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key"
3. Copy key mới (dạng: `AIzaSy...`)
4. Click "Edit API key" → "Restrict key"
5. Chọn "Restrict key" → Check "Generative Language API"

### Bước 2: Enable API
1. Vào: https://console.cloud.google.com/apis/library
2. Tìm "Generative Language API"
3. Click "Enable"

### Bước 3: Cập Nhật .env.local
```bash
# File: .env.local (ở root project)
GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
GOOGLE_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE  # Same key
```

**QUAN TRỌNG**: 
- ✅ `.env.local` đã có trong `.gitignore`
- ✅ KHÔNG commit file này
- ✅ KHÔNG push lên Git

### Bước 4: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
# Hoặc
yarn dev
```

### Bước 5: Test Lại
```bash
node scratch/test-imagen.js
```

**Expected output**:
```
=== MODEL: imagen-4.0-ultra-generate-001 | METHOD: predict ===
Status: 200
Success! bytesBase64Encoded length: 123456
```

---

## Alternative: Pass Key từ Frontend

Nếu không muốn dùng .env, có thể nhập trực tiếp trong UI:

1. Vào trang Settings
2. Tìm "API Keys" section
3. Nhập Gemini API key
4. Save

Key sẽ được pass qua `client_gemini_key` parameter.

---

## Security Best Practices

### ❌ KHÔNG BAO GIỜ:
- Hardcode API key trong source code
- Commit .env files
- Push API keys lên Git
- Share keys publicly

### ✅ LUÔN LUÔN:
- Dùng environment variables
- Add .env* vào .gitignore
- Rotate keys định kỳ
- Restrict keys theo API cụ thể
- Monitor key usage

---

## File Đã Fix

### `scratch/test-imagen.js`
**Before**:
```javascript
const apiKey = 'AIzaSyDtqU1UQpJZYP4Ez7SRUQDoxrMsNJPF_jU'; // ❌ LEAKED
```

**After**:
```javascript
const apiKey = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE'; // ✅ Safe
```

---

## Check .gitignore

Verify `.env.local` is ignored:
```bash
cat .gitignore | grep env
```

Should show:
```
.env*.local
.env.local
.env
```

---

## Nếu Vẫn Lỗi 403

1. **Check API đã enable chưa**:
   - Generative Language API
   - Imagen API (nếu có)

2. **Check billing**:
   - Google Cloud có enable billing chưa?
   - Có credit còn không?

3. **Check quota**:
   - Vào Quotas page
   - Xem còn quota không?

4. **Try different region**:
   - US keys vs EU keys
   - Có thể region bị restrict

---

## Fallback Flow Hiện Tại

```
Orchestrator calls /api/ai/generate-image-v4
    ↓
v4 tries Imagen 4.0 Ultra
    ↓ (403 PERMISSION_DENIED)
v4 tries Imagen 4.0 Fast
    ↓ (403 PERMISSION_DENIED)
v4 tries DALL-E 3
    ↓ (No OpenAI key)
v4 returns success: false
    ↓
Orchestrator fallback: /api/ai/banner-image
    ↓
Canvas renders SVG/PNG (current output)
```

---

## Khi Nào Có Real AI Image?

Khi **một trong các** key sau hoạt động:
- ✅ Valid Gemini/Google API key → Imagen 4.0
- ✅ Valid OpenAI API key → DALL-E 3

**Current status**: ❌ Không có valid key nào → Fallback

---

## Quick Test Command

```bash
# Test with new key
GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY node scratch/test-imagen.js

# Should see:
# Status: 200
# Success! bytesBase64Encoded length: ...
```

---

## Commit This Fix

```bash
git add scratch/test-imagen.js API_KEY_LEAKED_FIX.md
git commit -m "security: remove leaked API key from test script"
git push
```

---

## Summary

**Problem**: API key leaked → Google disabled → 403 errors → Fallback to banner-image  
**Solution**: Generate new key → Add to .env.local → Restart server → Test  
**Prevention**: Never hardcode keys, always use env vars, keep .env in .gitignore
