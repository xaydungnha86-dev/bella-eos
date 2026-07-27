# Creative Intelligence Engine v3 - Quick Start

## TL;DR

v3 replaces template-based prompts with AI creative reasoning. Headlines are synthesized for posters (not copied from Facebook). Domain-agnostic (no hardcoded templates).

## Enable v3

```bash
# .env.local
CREATIVE_INTELLIGENCE_VERSION=v3
```

Restart server. That's it.

## Test v3

```bash
# Unit test (no server needed)
npx tsx scratch/test-creative-intelligence-v3.ts

# Integration test (server must be running)
npm run dev
npx tsx scratch/test-v3-integration.ts
```

## Key Differences: v2 vs v3

| Feature | v2 (Template) | v3 (AI Reasoning) |
|---------|--------------|-------------------|
| **Domain handling** | Hardcoded `if (spa)` | LLM understands context |
| **Headline source** | Copy from Facebook | Synthesized for poster |
| **Extensibility** | Add new domain = edit code | Works with ANY domain |
| **Reasoning** | None | Explainable chain |
| **Confidence** | N/A | 0.0-1.0 score |
| **Performance** | ~20ms | ~1000ms (with LLM) |
| **Fallback** | N/A | Rule-based if LLM fails |

## Example Output

### v2 Template
```typescript
headline: "5 Sai Lầm Khiến Spa Mất Khách VIP"  // Copied from Facebook
prompt: "Professional spa interior with luxury ambiance..."  // Template
```

### v3 AI Reasoning
```typescript
creativeBrief: {
  campaignGoal: "Drive demo bookings from premium spa owners",
  posterHeadline: "AI VẬN HÀNH SPA THẾ HỆ MỚI",  // Synthesized
  targetAudience: "Premium Spa Owners & Beauty Studio Managers",
  emotionalTone: "aspirational, serene, trustworthy",
  designDirection: "luxury wellness tech aesthetic",
  reasoningChain: [
    "CEO objective focuses on 20% customer growth...",
    "Target segment is spa owners, not end customers...",
    "Headline must convey innovation and reliability..."
  ],
  confidenceScore: 0.92
}

prompts: {
  imagen: "Create a photorealistic luxury spa wellness room...",  // 1324 chars
  dalle: "A premium spa interior featuring modern AI technology...",  // 1553 chars
  flux: "masterpiece, luxury spa, glass surfaces, orchid flowers..."  // 766 chars
}
```

## Architecture (4 Layers)

```
Layer 1: Business Context
  Input: CEO objective, copywriter content, ERP, CRM, Brand DNA
  Output: Structured context package
  Duration: ~20ms

Layer 2: Creative Reasoning (LLM)
  Input: Context package
  Output: Creative Brief (campaign goal, headline, audience, tone)
  Duration: ~800ms (or fallback ~5ms)
  
Layer 3: Prompt Composition
  Input: Creative Brief
  Output: Base visual prompt (camera, lighting, composition)
  Duration: ~2ms

Layer 4: Model Adaptation
  Input: Base prompt
  Output: Imagen/DALL-E/Flux-specific prompts
  Duration: ~1ms
```

## API Endpoints

### v2 (Legacy)
```
POST /api/ai/generate-image
```

### v3 (New)
```
POST /api/ai/generate-image-v3
```

### v2 with Feature Flag → v3
```
POST /api/ai/generate-image  
# (automatically routes to v3 if CREATIVE_INTELLIGENCE_VERSION=v3)
```

## Files Changed

### Core Implementation (NEW)
- `src/types/creative-intelligence.ts` - Type contracts
- `src/core/creative/creative-intelligence-engine.ts` - Main orchestrator
- `src/core/creative/context/business-context-aggregator.ts` - Layer 1
- `src/core/creative/reasoning/creative-director-agent.ts` - Layer 2
- `src/core/creative/composition/prompt-composer.ts` - Layer 3
- `src/core/creative/adapters/*.ts` - Layer 4

### Integration (MODIFIED)
- `src/app/api/ai/generate-image/route.ts` - Added feature flag routing
- `src/app/api/ai/generate-image-v3/route.ts` - New v3 endpoint

### Testing
- `scratch/test-creative-intelligence-v3.ts` - Unit tests
- `scratch/test-v3-integration.ts` - Integration tests

### Documentation
- `docs/CREATIVE_INTELLIGENCE_V3_MIGRATION.md` - Full migration guide
- `docs/CREATIVE_INTELLIGENCE_V3_DEPLOYMENT.md` - Deployment guide
- `CREATIVE_INTELLIGENCE_V3_SUMMARY.md` - Implementation summary
- `CREATIVE_V3_QUICK_START.md` - This file

## Troubleshooting

### "No Gemini API key found"
**Symptom:** Logs show fallback to rule-based generation  
**Impact:** Lower confidence (0.75 vs 0.95)  
**Fix:** Add `GEMINI_API_KEY` or `GOOGLE_API_KEY` to `.env.local`  
**Workaround:** Fallback still works, just less creative

### "Headline still copied from Facebook"
**Check:** Is v3 actually being called?  
**Verify:** Look for log `[CreativeIntelligenceEngine] Starting 4-layer...`  
**Cause:** May be calling v2 endpoint without feature flag

### "TypeScript errors"
**Run:** `npx tsc --noEmit`  
**Status:** Should show 0 errors (all fixed)

## Rollback

Remove from `.env.local`:
```bash
# CREATIVE_INTELLIGENCE_VERSION=v3
```

Restart server. System reverts to v2 instantly.

## Performance Tips

1. **Use Gemini API** for best quality (0.95 confidence)
2. **Fallback is fast** (~25ms) if LLM unavailable
3. **Cache creative briefs** for identical objectives (future)
4. **Monitor confidence scores** to detect LLM failures

## Next Steps

1. Deploy v3 to staging
2. Enable feature flag
3. Test with 5 different domains (spa, real estate, fashion, tech, etc.)
4. Compare headline quality vs v2
5. Validate reasoning chains make sense
6. Collect CEO feedback
7. Enable in production after 48h validation

## Support

- Full docs: `docs/CREATIVE_INTELLIGENCE_V3_MIGRATION.md`
- Architecture: `CREATIVE_INTELLIGENCE_V3_SUMMARY.md`
- Deployment: `docs/CREATIVE_INTELLIGENCE_V3_DEPLOYMENT.md`
