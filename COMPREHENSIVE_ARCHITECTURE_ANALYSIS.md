# COMPREHENSIVE ARCHITECTURE ANALYSIS - DN WORKFLOW (BELLA EOS)

**Date**: 2026-07-27  
**Status**: CRITICAL ISSUES IDENTIFIED  
**Version**: v3.0 (Reasoning-Based Architecture)

---

## 🎯 EXECUTIVE SUMMARY

DN WORKFLOW is an **enterprise-grade B2B SaaS marketing automation platform** built for Bella EOS - a SOFTWARE company that provides AI-powered spa management solutions. The system has **3 critical bugs** preventing proper operation:

### Critical Issues:
1. **Content Context Error**: AI generates spa service content instead of software company messaging
2. **LLM Bypass**: Fallback logic running (0.85 confidence) instead of LLM reasoning (0.95 confidence)
3. **Image URL Extraction Failure**: Schema URLs extracted instead of `/temp-banners/*.png` paths

---

## 🏗️ ARCHITECTURAL OVERVIEW

### Core Paradigm: Reasoning-Based Cognitive Architecture

```
CEO Intent → Strategic Reasoning → Tactical Planning → Operational Execution → Learning
```

### 5 Core Domains (ADR-0001):

1. **Bella Kernel**: Pure runtime engine, event store, zero business logic
2. **Enterprise Storage**: Abstraction layer (Metadata, Vector, Blob, Graph, Cache)
3. **Enterprise Brain**: Cognitive centers (Memory, Knowledge, Context, Reasoning, Learning)
4. **Orchestration**: Strategic intent decomposition (Intent → Goal → Strategy → Planning → Workflow)
5. **Execution**: Stateless worker management & Internal API Gateway

---

## 📊 DATA FLOW ARCHITECTURE

### Complete Pipeline:

```
User Input (Natural Language)
  ↓
[POST /api/orchestrator/run] Orchestration Runtime
  ↓
Business Context Aggregation (Layer 1)
  ├─ Enterprise Context (ERP, CRM, Budget)
  ├─ Brand DNA (Identity, Values, Visual)
  ├─ Knowledge Context (Domain Facts, Trends)
  └─ Campaign Memory (Success/Failure Patterns)
  ↓
Creative Director Agent (Layer 2 - LLM Reasoning)
  ├─ Compose Reasoning Prompt (with Company DNA injection)
  ├─ Call LLM (Gemini/OpenAI/Anthropic)
  ├─ Parse Creative Brief JSON
  └─ FALLBACK: generateFallbackBrief() if LLM fails
  ↓
Creative Brief
  ├─ campaignGoal
  ├─ posterHeadline
  ├─ heroSubject (CRITICAL: defines visual content)
  ├─ designDirection
  └─ confidenceScore
  ↓
Prompt Composer (Layer 3)
  ├─ Compose Base Prompt
  ├─ Add Technical Specs (camera, lighting, composition)
  └─ Generate Negative Prompt
  ↓
Model Adapter (Layer 4)
  ├─ Adapt prompt for Imagen 4
  ├─ Adapt prompt for DALL-E 3
  ├─ Adapt prompt for Flux.1
  └─ Generate model-specific prompts
  ↓
[POST /api/ai/generate-image-v3] Image Generation
  ├─ Try Imagen 4 (requires paid Gemini API key)
  ├─ Try Gemini Native Image
  ├─ Try OpenAI DALL-E 3
  ├─ Try Fal.ai Flux.1 Schnell
  └─ Fallback: SVG generation
  ↓
Generated Image → Saved to /public/temp-banners/gen_*.png
  ↓
[tool_publish_facebook] Facebook Publishing
  ├─ Extract content from task outputs
  ├─ extractUrl() regex to find image path ← BUG HERE
  ├─ Call Hermes MCP Server
  └─ [POST /api/facebook/publish] Publish to Facebook
```

---

## 🔍 ROOT CAUSE ANALYSIS

### Issue #1: Content Focuses on "Spa Services" Instead of "Software"

**Symptom**: Headlines like "QUẢN TRỊ SPA CHUYÊN NGHIỆP VỚI AI" instead of "PHẦN MỀM QUẢN TRỊ SPA"

**Root Cause**: Fallback brief generation logic in `creative-director-agent.ts` (lines 483-550)

**Code Location**:
```typescript
// src/core/creative/reasoning/creative-director-agent.ts:483-550
private generateFallbackBrief(context: BusinessContextPackage): CreativeBrief {
  // ...
  heroSubject: 'premium glass cosmetic jars with gold caps on polished marble surface...'
  // ❌ WRONG: Shows spa PRODUCTS not SOFTWARE
}
```

**Why It Happens**:
1. LLM reasoning fails (or API key missing)
2. System falls back to rule-based brief generation
3. Fallback logic has hardcoded spa product imagery
4. No detection of "Bella EOS = SOFTWARE company" in fallback path

**Evidence from Logs**:
```
[API v4] Confidence: 0.85  ← FALLBACK (not 0.95 from LLM)
```

---

### Issue #2: LLM Not Running (Fallback Active)

**Symptom**: Confidence 0.85 instead of 0.95

**Root Cause**: Missing or invalid Gemini API key

**Code Location**:
```typescript
// src/core/creative/reasoning/creative-director-agent.ts:140-167
const reasoning = await this.callLLMReasoning(reasoningPromptWithVariability, clientKeys);
// If this fails, catch block triggers fallback
```

**Why It Happens**:
1. `.env.local` may not have `GEMINI_API_KEY` configured
2. API key may be invalid or rate-limited
3. LLM call throws error → catch block → fallback logic
4. No clear error logging showing WHY LLM failed

**Evidence**:
- Confidence 0.85 = fallback (line 156)
- Confidence 0.95 = LLM success (line 218)

---

### Issue #3: Image URL Extraction Fails

**Symptom**: URL extracted as `https://schema.bellaeos.com/v1/ExecutiveIntelligenceContract.json` instead of `/temp-banners/gen_v4_*.png`

**Root Cause**: `extractUrl()` regex in `src/app/api/orchestrator/run/route.ts` (line 505)

**Code Location**:
```typescript
// src/app/api/orchestrator/run/route.ts:505-511
const extractUrl = (str: string): string => {
  if (!str) return '';
  // Match full URLs, data URIs, OR relative paths starting with /
  const match = str.match(/(https?:\/\/[^\s\n"']+|data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+|\/[\w\-\/\.]+\.(?:png|jpg|jpeg|gif|webp))/);
  return match ? match[0] : '';
};
```

**Why It Happens**:
1. Regex matches `https://` URLs BEFORE checking for image paths
2. Task outputs contain schema URLs (from EOS system contracts)
3. Regex greedily matches first `https://` URL found
4. Actual image path `/temp-banners/gen_*.png` is ignored

**How to Fix**:
```typescript
// PRIORITIZE image paths over generic URLs
const extractUrl = (str: string): string => {
  if (!str) return '';
  
  // FIRST: Try to match relative image paths
  const imagePath = str.match(/\/temp-banners\/[^\s"']+\.(?:png|jpg|jpeg|gif|webp)/);
  if (imagePath) return imagePath[0];
  
  // SECOND: Try data URIs
  const dataUri = str.match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/);
  if (dataUri) return dataUri[0];
  
  // THIRD: Try full URLs (but filter out schema URLs)
  const fullUrl = str.match(/https?:\/\/[^\s\n"']+\.(?:png|jpg|jpeg|gif|webp)/);
  if (fullUrl) return fullUrl[0];
  
  return '';
};
```

---

## 🧬 COMPANY DNA SYSTEM

### Architecture:

```
CompanyDNALoader (Singleton)
  ├─ Priority 1: Load from Supabase
  ├─ Priority 2: Load from .kiro/company-dna.json
  └─ Priority 3: Default template
```

### Current State:

**File**: `.kiro/company-dna.json`

```json
{
  "type": "software",
  "brandName": "Bella EOS",
  "industry": "B2B SaaS - Spa Management Software",
  "targetMarket": "Spa owners, salon managers, wellness center directors"
}
```

**Integration Point**: `creative-director-agent.ts:110-120`

```typescript
const companyDNASnippet = await getCompanyDNASnippet();
// Auto-injected into LLM prompt BEFORE CEO Objective
```

### Problem:

Company DNA is correctly loaded and injected into LLM prompt, BUT:
1. LLM is not running (fallback active)
2. Fallback logic does not read Company DNA
3. Fallback hardcodes spa product imagery

---

## 🔧 TECHNICAL COMPONENTS

### 1. Creative Intelligence Engine (4 Layers)

**File**: `src/core/creative/creative-intelligence-engine.ts`

**Layer 1: Business Context Aggregation** (lines 35-57)
- Aggregates enterprise context (ERP, CRM, budget)
- Loads brand DNA
- Fetches knowledge context (domain facts, trends)
- Retrieves campaign memory (success/failure patterns)

**Layer 2: Creative Reasoning** (lines 59-80)
- CreativeDirectorAgent.reason()
- Composes LLM prompt with Company DNA
- Calls Gemini/OpenAI/Anthropic
- Parses JSON creative brief
- Falls back to rule-based generation on failure

**Layer 3: Prompt Composition** (lines 82-98)
- PromptComposer.compose()
- Adds technical specs (camera, lighting, composition)
- Generates negative prompts
- Formats for image generation

**Layer 4: Model Adaptation** (lines 100-115)
- AdapterRegistryV3
- Generates model-specific prompts for:
  - Imagen 4
  - DALL-E 3
  - Flux.1
  - Gemini Native

---

### 2. Creative Director Agent

**File**: `src/core/creative/reasoning/creative-director-agent.ts`

**Key Methods**:

1. **`reason()`** (lines 16-157)
   - Main entry point
   - Checks content history
   - Composes reasoning prompt
   - Calls LLM or falls back

2. **`composeReasoningPrompt()`** (lines 159-500)
   - AUTO-LOADS Company DNA (line 169)
   - Injects enterprise context
   - Adds brand identity
   - Includes campaign memory
   - Adds content variation constraints
   - Returns 800+ line prompt

3. **`callLLMReasoning()`** (lines 600-660)
   - Tries Gemini → OpenAI → Anthropic
   - Returns confidence 0.95 on success

4. **`generateFallbackBrief()`** (lines 483-550)
   - ❌ HARDCODED spa product imagery
   - ❌ Does NOT read Company DNA
   - ❌ Returns confidence 0.85

5. **`applyFallbackVariation()`** (lines 591-650)
   - Rotates headlines/benefits
   - Uses ContentHistoryTracker
   - Recently updated to avoid "spa services" language

---

### 3. Image Generation Pipeline

**File**: `src/app/api/ai/generate-image-v3/route.ts`

**Model Waterfall**:
1. **Imagen 4** (lines 70-140)
   - `imagen-4.0-generate-001` (Standard)
   - `imagen-4.0-fast-generate-001` (Fast)
   - `imagen-4.0-ultra-generate-001` (Ultra - best quality)
   - Requires paid Gemini API key

2. **Gemini Native Image** (lines 142-180)
   - Legacy fallback
   - Free tier available

3. **OpenAI DALL-E 3** (lines 182-230)
   - Requires OpenAI API key
   - High quality

4. **Fal.ai Flux.1 Schnell** (lines 232-280)
   - Fast generation
   - Requires Fal API key

5. **Bella SVG Engine** (lines 339-380)
   - Final fallback
   - Calls `/api/ai/banner-image`
   - Generates SVG with text overlay

**Image Storage**: `/public/temp-banners/gen_*.png`

---

### 4. Facebook Publishing Workflow

**File**: `src/app/api/orchestrator/run/route.ts`

**Function**: `tool_publish_facebook()` (lines 437-636)

**Process**:
1. Extract content from task outputs (lines 515-550)
   - Priority: eos_content_worker task
   - Fallback: Any valid content (skip reports/analysis)

2. Extract image URL (lines 551-585)
   - Call `extractUrl()` on all input fields
   - Search task outputs for URLs
   - ❌ BUG: Regex matches schema URLs first
   - Fallback: Default banner URL

3. Call Hermes MCP Server (lines 588-600)
   - `hermes_publish_facebook_post` tool
   - Passes: message, media_url, access_token, page_id

4. Generate schedule matrix (lines 602-618)
   - 4-week campaign schedule
   - W1: Pain Points, W2: Social Proof, W3: Demo Offer, W4: AI Workforce

5. Call REST API (lines 620-636)
   - POST to `/api/facebook/publish`
   - Returns post ID and URL

---

### 5. Configuration Management

**Environment Variables** (`.env.local`):
```bash
# AI Models
GEMINI_API_KEY=           # Google Gemini (Imagen 4, Gemini Flash)
OPENAI_API_KEY=           # OpenAI (DALL-E 3, GPT-4)
FAL_KEY=                  # Fal.ai (Flux.1)

# Facebook Publishing
FACEBOOK_ACCESS_TOKEN=    # Long-lived page access token
FACEBOOK_PAGE_ID=         # Target page ID

# Database
SUPABASE_URL=            # Supabase project URL
SUPABASE_ANON_KEY=       # Supabase anonymous key

# Feature Flags
ENABLE_IMAGEN=true       # Enable Imagen 4 generation
ENABLE_CANVAS_OVERLAY=true  # Enable canvas text overlay
```

**Company DNA** (`.kiro/company-dna.json`):
```json
{
  "type": "software",
  "brandName": "Bella EOS",
  "tagline": "AI-Powered Spa Management Platform",
  "industry": "B2B SaaS - Spa Management Software",
  "foundedYear": 2020,
  "targetMarket": "Spa owners, salon managers, wellness center directors",
  "coreProducts": [
    {
      "name": "Bella EOS Platform",
      "category": "AI Operations Management",
      "description": "Comprehensive spa management software with AI automation"
    }
  ],
  "brandVoice": "professional, innovative, results-driven, empowering",
  "visualStyle": "modern, clean, technology-forward"
}
```

---

## 📈 CONTENT VARIATION SYSTEM

### ContentHistoryTracker (Singleton)

**File**: `src/core/creative/reasoning/content-history-tracker.ts`

**Purpose**: Ensure varied content across generations

**Methods**:
- `addContent(content)`: Save generated content
- `getRecentHeadlines(n)`: Get last N headlines
- `getStats()`: Get generation statistics
- `isHeadlineSimilar(headline)`: Check for duplicates

**Storage**: In-memory (cleared on restart)

**Integration**: 
- Line 33 in `creative-director-agent.ts`: Check history before generation
- Line 153 in `creative-director-agent.ts`: Save new content after generation

---

## 🎨 BRAND IDENTITY SYSTEM

**File**: `docs/BELLA_EOS_BRAND_IDENTITY.md`

### Critical Definitions:

**What Bella EOS IS**:
- ✅ B2B SaaS software company
- ✅ Builds AI-powered management platforms
- ✅ Sells TO spa owners (not services to spa customers)
- ✅ Product: Bella EOS Platform (software)

**What Bella EOS is NOT**:
- ❌ A spa or salon
- ❌ A beauty service provider
- ❌ A cosmetics retailer

### Visual Guidelines:

**CORRECT Visuals**:
- Software UI mockups showing Bella EOS dashboard
- Device screens (laptop, tablet) displaying platform
- Analytics dashboards with charts/graphs/KPIs
- Booking calendars and scheduling interfaces
- Business context: Spa manager using laptop

**WRONG Visuals** (Must Avoid):
- Spa products (cosmetic jars, lotions)
- Beauty treatments (facials, massages)
- Spa interiors without technology
- Orchids, towels, candles as primary focus

---

## 🔐 SECURITY & ISOLATION

### Domain Isolation (ADR-0001):

1. **Kernel Domain**: Pure runtime, ZERO business logic
2. **Storage Domain**: Abstract storage layer (prevents vendor lock-in)
3. **Brain Domain**: Cognitive functions (Memory, Knowledge, Reasoning)
4. **Orchestration Domain**: Strategic planning (Intent → Strategy → Workflow)
5. **Execution Domain**: Stateless workers

**Consequence**: Can replace ANY component (AI model, database, ERP) without affecting core system

---

### Context Security (ADR-0004):

**Threat Model**:
- Session hijacking
- Prompt injection
- Data leakage across tenants

**Mitigation**:
- Stateless workers (no context persistence)
- Tenant isolation in execution
- Sandboxed reasoning agents

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Infrastructure:

```
Next.js App (Vercel/Self-hosted)
  ├─ API Routes (/api/*)
  ├─ Page Routes (/app/*)
  └─ Public Assets (/public/*)

External Services:
  ├─ Supabase (PostgreSQL + Storage)
  ├─ Google AI (Gemini + Imagen 4)
  ├─ OpenAI (GPT-4 + DALL-E 3)
  ├─ Fal.ai (Flux.1)
  └─ Facebook Graph API
```

### Docker Support:

**Files**:
- `Dockerfile`: Production container
- `docker-compose.yml`: Development stack
- `.dockerignore`: Exclude node_modules, .next, .git

---

## 📊 PERFORMANCE METRICS

### Observed Timings:

- **Layer 1 (Context Aggregation)**: 50-100ms
- **Layer 2 (Creative Reasoning)**: 
  - LLM: 3-8 seconds (Gemini Flash)
  - Fallback: 10-20ms
- **Layer 3 (Prompt Composition)**: 20-50ms
- **Layer 4 (Model Adaptation)**: 10-30ms
- **Image Generation**: 
  - Imagen 4: 15-30 seconds
  - DALL-E 3: 10-20 seconds
  - Flux.1: 5-10 seconds
  - SVG Fallback: 100-200ms
- **Facebook Publishing**: 500-1500ms

**Total Pipeline**: 20-50 seconds (with LLM + image generation)

---

## 🐛 BUG SUMMARY & FIXES

### Bug #1: Content Context Error

**File**: `src/core/creative/reasoning/creative-director-agent.ts`

**Problem**: 
- Line 483-550: `generateFallbackBrief()` hardcodes spa product imagery
- Does not read Company DNA
- Generates "spa services" content instead of "software company" messaging

**Fix**:
1. Load Company DNA in fallback path
2. Detect `type: "software"` from Company DNA
3. Generate software-focused heroSubject:
   ```typescript
   heroSubject: 'MacBook displaying Bella EOS dashboard with analytics...'
   ```
4. Update fallback headlines to emphasize SOFTWARE benefits

---

### Bug #2: LLM Bypass

**File**: `src/core/creative/reasoning/creative-director-agent.ts`

**Problem**:
- Line 140-167: LLM call fails silently
- Catch block triggers fallback without clear error logging
- Confidence 0.85 instead of 0.95

**Fix**:
1. Add detailed error logging in catch block
2. Check if Gemini API key exists in `.env.local`
3. Verify API key is valid (not expired, not rate-limited)
4. If API key missing, show warning to user

---

### Bug #3: Image URL Extraction

**File**: `src/app/api/orchestrator/run/route.ts`

**Problem**:
- Line 505: `extractUrl()` regex matches schema URLs before image paths
- Returns `https://schema.bellaeos.com/...` instead of `/temp-banners/gen_*.png`

**Fix**:
Rewrite `extractUrl()` to prioritize image paths:

```typescript
const extractUrl = (str: string): string => {
  if (!str) return '';
  
  // FIRST: Try relative image paths
  const imagePath = str.match(/\/temp-banners\/[^\s"']+\.(?:png|jpg|jpeg|gif|webp)/);
  if (imagePath) return imagePath[0];
  
  // SECOND: Try data URIs
  const dataUri = str.match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/);
  if (dataUri) return dataUri[0];
  
  // THIRD: Try full image URLs (filter out non-image URLs)
  const fullUrl = str.match(/https?:\/\/[^\s\n"']+\.(?:png|jpg|jpeg|gif|webp)/);
  if (fullUrl) return fullUrl[0];
  
  return '';
};
```

---

## 📋 RECOMMENDED ACTION PLAN

### Phase 1: Immediate Fixes (HIGH PRIORITY)

**1.1 Fix Image URL Extraction** (15 minutes)
- File: `src/app/api/orchestrator/run/route.ts` (line 505)
- Replace `extractUrl()` regex to prioritize `/temp-banners/*.png`
- Test: Generate content → verify correct image URL extracted

**1.2 Add LLM Error Logging** (10 minutes)
- File: `src/core/creative/reasoning/creative-director-agent.ts` (line 160)
- Add console.error() in catch block with error details
- Log: "LLM call failed, falling back to rule-based generation. Error: {error}"

**1.3 Verify Gemini API Key** (5 minutes)
- Check `.env.local` has `GEMINI_API_KEY`
- Test API key with simple API call
- If missing/invalid, add warning message to user

---

### Phase 2: Content Context Fix (MEDIUM PRIORITY)

**2.1 Update Fallback Brief Generation** (30 minutes)
- File: `src/core/creative/reasoning/creative-director-agent.ts` (line 483)
- Load Company DNA in `generateFallbackBrief()`
- Detect `type: "software"` from DNA
- Generate software-focused visuals:
  ```typescript
  if (companyDNA?.type === 'software') {
    heroSubject = 'MacBook Pro displaying Bella EOS dashboard...';
    posterHeadline = 'PHẦN MỀM QUẢN TRỊ SPA THÔNG MINH';
  } else {
    // existing fallback logic
  }
  ```

**2.2 Strengthen LLM Prompt** (20 minutes)
- File: `src/core/creative/reasoning/creative-director-agent.ts` (line 250)
- Make Company DNA section MORE prominent
- Add CRITICAL WARNING:
  ```
  ⚠️ CRITICAL: Bella EOS is a SOFTWARE company, NOT a spa.
  DO NOT generate imagery of spa products, treatments, or services.
  ALWAYS show software interface, dashboard, or business context.
  ```

**2.3 Add Validation Layer** (30 minutes)
- File: `src/core/creative/reasoning/creative-director-agent.ts` (line 200)
- After parsing LLM response, validate `heroSubject`
- If contains "cosmetic jars", "massage", "facial", "treatment" → REJECT
- Force regeneration or fallback to software-focused brief

---

### Phase 3: Testing & Verification (LOW PRIORITY)

**3.1 End-to-End Test** (30 minutes)
- Objective: "Tăng doanh thu với phần mềm Bella EOS"
- Expected:
  - Confidence: 0.95 (LLM used)
  - Headline: Contains "PHẦN MỀM" or "HỆ THỐNG" or "PLATFORM"
  - heroSubject: Contains "laptop", "dashboard", "interface", "screen"
  - Image: Shows software UI or business context
  - Image URL: Starts with `/temp-banners/`
  - Facebook: Post published successfully

**3.2 Content Variation Test** (20 minutes)
- Run 5 consecutive generations
- Verify:
  - Headlines are different
  - Benefits are different
  - CTAs are different
  - Images look visually distinct

**3.3 Fallback Path Test** (15 minutes)
- Remove Gemini API key temporarily
- Run generation
- Expected:
  - Clear warning: "LLM unavailable, using fallback"
  - Confidence: 0.85
  - Content: Still focuses on SOFTWARE (not spa services)
  - Image: Still generated successfully

---

## 🎯 SUCCESS CRITERIA

After fixes, system should demonstrate:

1. **Content Focus** ✅
   - Headlines mention "PHẦN MỀM", "HỆ THỐNG", or "PLATFORM"
   - Benefits focus on software features (automation, analytics, efficiency)
   - No mentions of spa services without "phần mềm" context

2. **LLM Activation** ✅
   - Confidence score: 0.95
   - Clear logging: "✓ LLM reasoning completed"
   - Fallback only triggers on API failure (with clear error message)

3. **Image Publishing** ✅
   - Image URL extracted correctly: `/temp-banners/gen_*.png`
   - Facebook post published with image attached
   - No schema URLs in extraction logs

4. **Content Variation** ✅
   - 5 consecutive generations produce different headlines
   - Different key benefits each time
   - Different CTAs
   - Visually distinct images

---

## 📚 KEY FILES REFERENCE

### Core Implementation:
- `src/core/creative/creative-intelligence-engine.ts` - Master orchestrator
- `src/core/creative/reasoning/creative-director-agent.ts` - LLM reasoning + fallback
- `src/core/company/company-dna-loader.ts` - Company DNA singleton
- `src/app/api/orchestrator/run/route.ts` - Workflow orchestration + Facebook publishing
- `src/app/api/ai/generate-image-v3/route.ts` - Image generation pipeline

### Configuration:
- `.env.local` - API keys and feature flags
- `.kiro/company-dna.json` - Company brand identity
- `next.config.ts` - Next.js configuration

### Documentation:
- `docs/BELLA_EOS_BRAND_IDENTITY.md` - Brand positioning
- `docs/architecture/BELLA_EOS_V3_COGNITIVE_ARCHITECTURE.md` - Cognitive architecture
- `docs/architecture/adr/ADR-0001-domain-isolation.md` - Domain isolation
- `docs/architecture/adr/ADR-0005-company-dna.md` - Company DNA system

---

## 🔄 ARCHITECTURE EVOLUTION

### Current: v3.0 (Reasoning-Based)

```
Strategic Reasoning → Tactical Planning → Operational Execution
```

### Previous: v22.0 (Capability-Based)

```
Intent → Capabilities → Execution
```

### Migration Status:

✅ **Implemented**:
- Executive Intelligence Runtime (reasoning)
- Company DNA system
- Creative Intelligence Engine (4 layers)
- Content variation tracking
- Multi-model image generation

🚧 **In Progress**:
- Planning Runtime (KPI decomposition, budget allocation)
- Marketing OS (capability-based execution)
- Observation Runtime (learning from results)

📅 **Planned**:
- Enterprise Knowledge Repository (graph-based)
- Multi-agent deliberation
- Strategic simulation engine

---

## 🎓 LESSONS LEARNED

1. **Fallback Logic Must Match Primary Logic**
   - Fallback paths should read same configuration (Company DNA)
   - Hardcoded fallback logic creates inconsistent behavior

2. **Silent Failures Are Dangerous**
   - LLM errors must be logged clearly
   - Users need visibility when fallback is active

3. **Regex Ordering Matters**
   - URL extraction regex must prioritize specific patterns over generic
   - Test regex with actual data (schema URLs, image paths, data URIs)

4. **Brand Context Is Critical**
   - B2B SaaS vs B2C service distinction must be enforced
   - Visual guidelines must be programmatically validated

5. **Content Variation Requires History**
   - In-memory tracking works for MVP
   - Production needs persistent storage for long-term uniqueness

---

**END OF ANALYSIS**

*Generated: 2026-07-27*  
*Author: Kiro AI Architecture Analyzer*  
*Status: Ready for implementation of recommended fixes*
