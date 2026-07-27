# Gemini API Setup Guide

## Why Gemini API?

Creative Intelligence Engine v3 uses Google's Gemini AI for:
- **Layer 2: Creative Reasoning** - Understanding business context and generating creative briefs
- **Layer 3: Prompt Composition** - Synthesizing visual language from creative concepts

Without Gemini API, the system falls back to rule-based generation with lower quality.

| Feature | With Gemini | Without (Fallback) |
|---------|-------------|-------------------|
| **Context understanding** | ✅ Semantic | ❌ Keyword matching |
| **Domain flexibility** | ✅ Any domain | ⚠️ Hardcoded domains |
| **Headline quality** | ✅ Creative synthesis | ⚠️ Template-based |
| **Confidence score** | 0.85-0.95 | 0.65-0.75 |

---

## Step 1: Get API Key

### Option A: Google AI Studio (Recommended)
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click **"Get API key"** or **"Create API key"**
4. Select project or create new one
5. Copy the API key (starts with `AIza...`)

### Option B: Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Enable **Generative Language API**
3. Go to **APIs & Services → Credentials**
4. Create **API Key**
5. Copy the key

---

## Step 2: Add to Environment

### Development (.env.local)
```bash
# Add to .env.local (create if doesn't exist)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OR use GOOGLE_API_KEY (both work)
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Production
```bash
# Vercel
vercel env add GEMINI_API_KEY
# Enter your key when prompted

# Docker
docker run -e GEMINI_API_KEY=your_key ...

# VPS/Server
export GEMINI_API_KEY=your_key
# Or add to .env.production
```

---

## Step 3: Verify Setup

### Test 1: Check API Key
```bash
# Windows CMD
echo %GEMINI_API_KEY%

# Windows PowerShell
echo $env:GEMINI_API_KEY

# Linux/Mac
echo $GEMINI_API_KEY
```

Should output your API key (not `%GEMINI_API_KEY%` or empty)

### Test 2: Test API Call
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

Should return JSON with `"text": "Hello!..."` (not 400/403 error)

### Test 3: Run Unit Tests
```bash
npx tsx scratch/test-creative-intelligence-v3.ts
```

Look for:
```
✅ [CreativeDirectorAgent] ✓ Success with gemini-1.5-flash
✅ Confidence Score: 0.85 (or higher)
```

---

## Model Fallback Chain

System tries models in this order:

1. **gemini-2.0-flash-exp** (experimental, fastest, free during preview)
2. **gemini-1.5-flash** (stable, fast, recommended)
3. **gemini-1.5-pro** (highest quality, slower)
4. **gemini-pro** (legacy, still supported)
5. **Rule-based fallback** (no API call, lower quality)

If model 1 fails → tries model 2 → etc.

---

## Troubleshooting

### Error: "No Gemini API key found"
**Cause:** Environment variable not set  
**Fix:** 
```bash
# Check .env.local exists and contains:
GEMINI_API_KEY=your_key
```

Restart dev server after adding:
```bash
npm run dev
```

### Error: "Gemini API error: 400"
**Cause:** Invalid API key or model name  
**Fix:**
1. Verify key at https://aistudio.google.com/app/apikey
2. Regenerate if expired
3. Check logs for which model failed
4. System will auto-fallback to working model

### Error: "Gemini API error: 403"
**Cause:** API not enabled or quota exceeded  
**Fix:**
1. Enable Generative Language API in Google Cloud Console
2. Check quota limits
3. Upgrade to paid plan if needed (usually not required for dev)

### Error: "Gemini API error: 429"
**Cause:** Rate limit exceeded  
**Fix:**
- Free tier: 60 requests/minute
- Wait 1 minute or upgrade plan
- System will use fallback automatically

### Logs show multiple model failures
**Cause:** All models tried and failed  
**Expected:** System uses rule-based fallback (0.75 confidence)  
**Impact:** Lower quality but still functional  
**Fix:** Check API key and network connectivity

---

## Cost & Quota

### Free Tier (Google AI Studio)
- **60 requests/minute**
- **1,500 requests/day**
- **1 million tokens/month** (input + output)

For Creative Intelligence v3:
- ~500 tokens per creative brief generation
- ~2,000 free briefs/month
- **Cost: $0** for most dev/staging use cases

### Paid Tier (if needed)
- Gemini 1.5 Flash: **$0.075 per 1M input tokens**
- Gemini 1.5 Pro: **$1.25 per 1M input tokens**
- Creative brief: ~$0.0001 per generation (Flash)

**Recommendation:** Start with free tier, upgrade only if hitting limits.

---

## Best Practices

### Security
- ❌ Never commit API keys to Git
- ✅ Use `.env.local` (in `.gitignore`)
- ✅ Rotate keys periodically
- ✅ Use environment-specific keys (dev/staging/prod)

### Performance
- ✅ gemini-1.5-flash is recommended (fast + good quality)
- ⚠️ gemini-1.5-pro only if quality is critical (slower)
- ✅ Fallback works automatically, no manual intervention

### Monitoring
```bash
# Check logs for model used
[CreativeDirectorAgent] ✓ Success with gemini-1.5-flash

# Check confidence score
Confidence Score: 0.85  # LLM-powered
Confidence Score: 0.75  # Fallback (rule-based)
```

---

## FAQ

**Q: Do I need Gemini API for v3 to work?**  
A: No. System has automatic fallback to rule-based generation. But quality is lower.

**Q: Which model should I use?**  
A: System auto-selects. Recommended: `gemini-1.5-flash` (fast + good).

**Q: What if API key expires?**  
A: System falls back to rule-based automatically. Regenerate key and restart.

**Q: Can I use OpenAI instead?**  
A: Not yet. Planned for future update. Currently Gemini-only.

**Q: Is Gemini API free forever?**  
A: Free tier (60 req/min) is permanent. Subject to Google's terms.

**Q: How do I know if LLM is working?**  
A: Check logs for `✓ Success with gemini-X` and confidence score >0.8.

---

## Support

- **API Issues:** https://ai.google.dev/docs/gemini_api_overview
- **Quota Limits:** https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
- **Pricing:** https://ai.google.dev/pricing

For Creative Intelligence v3 issues, see:
- `docs/CREATIVE_INTELLIGENCE_V3_MIGRATION.md`
- `CREATIVE_V3_QUICK_START.md`
