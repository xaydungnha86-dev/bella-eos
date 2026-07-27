# Creative Intelligence Engine v3 - Deployment Guide

## Overview

Creative Intelligence Engine v3 replaces the template-based prompt generation system with a 4-layer AI reasoning architecture that understands business context and generates creative briefs.

## Architecture Changes

### OLD (v2) - Template Concatenation
```
CEO Objective
    ↓
Parse Domain (if spa → template A, if real estate → template B)
    ↓
Parse Copywriter (copy headline directly)
    ↓
Template Rules (hardcoded strings)
    ↓
Prompt Concatenation
```

**Problems:**
- Domain-specific hardcoded templates
- Headlines copied from Facebook posts (wrong medium)
- No creative understanding
- Not extensible to new industries

### NEW (v3) - AI Creative Reasoning
```
CEO Objective
    ↓
Layer 1: Business Context Aggregation
    ↓
Layer 2: Creative Reasoning (LLM-powered)
    ↓
Layer 3: Prompt Composition
    ↓
Layer 4: Model Adaptation (Imagen/DALL-E/Flux)
```

**Benefits:**
- Domain-agnostic (works with ANY industry)
- Headlines synthesized for poster medium
- LLM-powered creative director agent
- Explainable reasoning chains
- Model-specific optimization

## Deployment Strategy

### Phase 1: Gradual Rollout (Recommended)

Enable v3 with feature flag:

```bash
# .env.local
CREATIVE_INTELLIGENCE_VERSION=v3
```

This routes `/api/ai/generate-image` → `/api/ai/generate-image-v3` automatically.

**Advantages:**
- Zero code changes in orchestrator
- Easy A/B testing
- Instant rollback by removing env var
- Both v2 and v3 remain functional

### Phase 2: Direct Integration

Update orchestrator to call v3 directly:

```typescript
// src/app/api/orchestrator/run/route.ts
const res = await fetch(`${getBaseUrl()}/api/ai/generate-image-v3`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    objective,
    copywriterContent,
    client_gemini_key: geminiKey,
    brandDna
  })
});
```

### Phase 3: v2 Deprecation

After validating v3 quality:

1. Remove v2 code from `/api/ai/generate-image/route.ts`
2. Rename v3 endpoint to main endpoint
3. Archive CreativePlanningEngine v2
4. Update documentation

## API Changes

### Request (unchanged)
```typescript
POST /api/ai/generate-image-v3

{
  objective: string;
  copywriterContent?: string;
  brandDna?: {
    brandName: string;
    primaryColor: string;
    accentColor: string;
  };
  client_gemini_key?: string;
  client_openai_key?: string;
  client_fal_key?: string;
}
```

### Response (enhanced)
```typescript
{
  success: boolean;
  imageUrl: string;
  provider: string;
  model: string;
  
  // NEW in v3
  creativeBrief: {
    campaignGoal: string;
    posterHeadline: string;          // Synthesized for poster
    targetAudience: string;
    emotionalTone: string;
    designDirection: string;
    confidenceScore: number;
    reasoningChain: string[];        // Explainable AI
  };
  
  prompts: {
    imagen: string;
    dalle: string;
    flux: string;
  };
  
  metadata: {
    pipelineDuration: number;
    layers: {
      layer1_context: string;
      layer2_reasoning: string;
      layer3_composition: string;
      layer4_adaptation: string;
    }
  }
}
```

## Testing

### Unit Tests
```bash
npx tsx scratch/test-creative-intelligence-v3.ts
```

Tests all 4 layers with mock LLM fallback.

### Integration Tests
```bash
# Start dev server
npm run dev

# In another terminal
npx tsx scratch/test-v3-integration.ts
```

Tests full workflow from API endpoint to creative brief generation.

### Production Validation

Compare v2 vs v3 output quality:

```typescript
// Test same objective through both versions
const v2 = await fetch('/api/ai/generate-image', { body: testData });
const v3 = await fetch('/api/ai/generate-image-v3', { body: testData });

// Compare:
// - Headline quality (v3 should be poster-optimized)
// - Prompt richness (v3 should be more descriptive)
// - Domain handling (v3 works without hardcoded templates)
```

## Performance

### v2 (Template-Based)
- Execution time: ~15-25ms
- No LLM calls
- Deterministic output

### v3 (AI-Powered)
- Execution time (with LLM): ~800-1500ms
- Execution time (fallback): ~25-35ms
- Creative quality: Higher
- Cost: +$0.0001-0.0003 per image (Gemini API)

**Optimization:** v3 uses Gemini 2.0 Flash Exp (free tier) for creative reasoning.

## Rollback Plan

If v3 causes issues:

### Immediate Rollback (30 seconds)
```bash
# Remove from .env.local
# CREATIVE_INTELLIGENCE_VERSION=v3

# Restart server
```

### Full Rollback (if v3 integrated directly)
1. Revert orchestrator changes
2. Point back to `/api/ai/generate-image` (v2 still exists)
3. Monitor logs for errors

## Monitoring

Key metrics to track:

- **Creative Brief Quality Score** (`creativeBrief.confidenceScore`)
- **LLM Reasoning Failures** (falls back to rule-based)
- **API Response Time** (`metadata.pipelineDuration`)
- **Headline Transformation Success** (poster vs Facebook)
- **User Feedback** (CEO satisfaction with generated images)

## Support

### Logs
```
[CreativeIntelligenceEngine] Starting 4-layer creative intelligence pipeline...
[CIE] ═══ Layer 1: Business Context Aggregation ═══
[CIE] ═══ Layer 2: Creative Reasoning (LLM) ═══
[CreativeDirectorAgent] Starting creative reasoning...
```

### Common Issues

**Issue: LLM call fails**
- Symptom: `No Gemini API key found, using fallback`
- Solution: v3 automatically falls back to rule-based brief generation
- Impact: Lower confidence score (0.75 vs 0.95)

**Issue: Headline still copied from Facebook**
- Symptom: `posterHeadline === facebookHeadline`
- Solution: Check Layer 2 reasoning logs
- Root cause: Fallback brief generation

**Issue: Domain not recognized**
- Symptom: Generic creative brief
- Solution: v3 is domain-agnostic, relies on LLM understanding
- Expected: Works for ANY industry without hardcoding

## Migration Checklist

- [ ] Deploy v3 code
- [ ] Set `CREATIVE_INTELLIGENCE_VERSION=v3` in production
- [ ] Monitor logs for 24 hours
- [ ] Compare 10 v2 vs v3 outputs
- [ ] Collect CEO feedback
- [ ] Validate image quality metrics
- [ ] Update Dashboard UI to show Creative Brief (optional)
- [ ] Document any domain-specific edge cases
- [ ] Schedule v2 deprecation after 2 weeks validation

## Future Enhancements

### Short-term (Sprint 30-31)
- [ ] Add Dashboard UI panel for Creative Brief visualization
- [ ] Integrate with EnterpriseAuditRuntime for reasoning chain logs
- [ ] Add A/B testing metrics (v2 vs v3 click-through rates)
- [ ] Cache creative briefs for identical objectives

### Long-term (Q2 2026)
- [ ] Multi-modal reasoning (image + video)
- [ ] Brand voice fine-tuning per client
- [ ] Creative brief human-in-the-loop approval
- [ ] Industry-specific creative director agents

## Contact

For questions or issues:
- Technical: Review `docs/CREATIVE_INTELLIGENCE_V3_MIGRATION.md`
- Architecture: See `CREATIVE_INTELLIGENCE_V3_SUMMARY.md`
- Support: Check logs and fallback behavior
