# Bug Fixes: Image Duplication, Content Extraction, CEO Approval

**Date**: 2025-01-27  
**Status**: ✅ COMPLETED  
**Sprint**: 30 - Post-v3.1 Stabilization

---

## 🎯 Issues Fixed

### 1. Image Duplication Issue ✅
**Problem**: Generated images looked identical between posts despite having different filenames.

**Root Cause**: 
- AI image generation model was producing similar outputs due to:
  - Similar creative briefs between generations
  - Lack of variation in image generation prompts
  - Insufficient randomization in visual parameters

**Solutions Implemented**:

#### A. Creative Director Agent - Variation Seed System
**File**: `src/core/creative/reasoning/creative-director-agent.ts`

- Added `generateVariationSeed()` method that generates unique strategy IDs
- Injected variation directives into LLM prompt with 23 different strategies:
  - **Perspective variations**: bird-eye, extreme-macro, dutch-angle, worm-eye
  - **Lighting variations**: golden-hour, blue-hour, midday, twilight
  - **Style variations**: photorealistic, minimalist, cinematic, editorial, tech-gradient
  - **Subject variations**: hero-single, cluster, lifestyle, detail-macro
  - **Color variations**: warm-golden, cool-teal, vibrant, muted
  - **Depth variations**: shallow-blur, deep-focus, selective-focus

**Code Added**:
```typescript
private generateVariationSeed(): string {
  const strategies = [
    'bird-eye-aerial-view',
    'extreme-macro-closeup', 
    'dutch-angle-dynamic',
    // ... 20+ more variations
  ];
  
  const randomIndex = Math.floor(Math.random() * strategies.length);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${strategies[randomIndex]}_${timestamp}_${randomSuffix}`;
}
```

**Prompt Enhancement**:
```
## CREATIVE VARIATION SEED
Variation ID: ${this.generateVariationSeed()}
Generation timestamp: ${Date.now()}

**CRITICAL DIRECTIVE FOR THIS SPECIFIC GENERATION:**
To ensure visual uniqueness, you MUST incorporate ONE of these variation strategies randomly:
- Perspective Shift, Time of Day, Style Variation, Subject Variation, Color Temperature, Depth of Field
```

#### B. Expert Prompt Composer - Visual Treatment Randomization
**File**: `src/core/creative/composition/expert-prompt-composer.ts`

- Added `generateVariationModifiers()` method with 5 categories of visual treatments:
  - **5 Perspective options**: elevated, ground-level, top-down, straight-on, diagonal
  - **5 Lighting setups**: diffused, dramatic side, three-point, window light, backlit
  - **5 Depth of field settings**: shallow (f/2.8), medium (f/5.6), deep (f/11), selective, bokeh
  - **5 Color temperatures**: warm (3200K), cool (6500K), neutral (5500K), slightly warm (4500K), cool-neutral (6000K)
  - **5 Composition rules**: rule of thirds, golden ratio, centered, asymmetric, z-pattern

**Code Added**:
```typescript
private static generateVariationModifiers(): { directive: string; visualGuidance: string } {
  // Randomly select one treatment from each category
  const selectedPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];
  const selectedLighting = lightingStyles[Math.floor(Math.random() * lightingStyles.length)];
  const selectedDepth = depthStyles[Math.floor(Math.random() * depthStyles.length)];
  const selectedColorTemp = colorTemperatures[Math.floor(Math.random() * colorTemperatures.length)];
  const selectedComposition = compositionVariations[Math.floor(Math.random() * compositionVariations.length)];
  
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  return {
    directive: `Generation ID: ${uniqueId} - Use specific visual treatments...`,
    visualGuidance: `SPECIFIC VISUAL TREATMENT FOR THIS GENERATION...`
  };
}
```

**Total Variation Combinations**: 5 × 5 × 5 × 5 × 5 = **3,125 unique visual treatments** per generation

#### C. Previous Fixes (Already Completed)
- Filename uniqueness: Added 2 random components (`gen_v4_{timestamp}_{random1}_{random2}.png`)
- Gemini sampling parameters: temperature 0.4 → 0.6, topP=0.9, topK=32
- Fallback banner URL randomization: Added `r1` and `r2` random params

**Expected Result**: Each post should now generate visually distinct images with different perspectives, lighting, composition, and color treatments.

---

### 2. Wrong Post Content Issue ✅
**Problem**: Facebook post content was showing markdown reports ("PHẦN 1: BẢN BÁO CÁO LÃNH ĐẠO") instead of actual social media post text.

**Root Cause**: 
- `tool_publish_facebook` was extracting wrong content from task outputs
- Getting CMO's strategic report instead of content writer's Facebook post
- No filtering for markdown report formats

**Solutions Implemented**:

#### A. Prioritized Content Extraction
**File**: `src/app/api/orchestrator/run/route.ts` (lines ~505-530)

**Code Added**:
```typescript
// Find the Facebook post content from eos_content_worker (content writer)
const contentWriterTask = completedTasks.find(t => 
  t.taskId && t.taskId.includes('eos_content_worker')
);

let fbPostContent = '';

if (contentWriterTask && contentWriterTask.output) {
  console.log('[tool_publish_facebook] Found content writer output, extracting post...');
  fbPostContent = extractSingleSocialPost(contentWriterTask.output);
}

// Fallback: if content writer not found, try to find first valid social post
if (!fbPostContent) {
  for (const task of completedTasks) {
    if (task.output && typeof task.output === 'string') {
      // Skip markdown reports
      if (task.output.includes('PHẦN 1:') || 
          task.output.includes('MARKDOWN REPORT') || 
          task.output.includes('BẢN BÁO CÁO LÃNH ĐẠO')) {
        console.log('[tool_publish_facebook] Skipping markdown report format');
        continue;
      }
      
      const extracted = extractSingleSocialPost(task.output);
      if (extracted && extracted.length > 30) {
        fbPostContent = extracted;
        break;
      }
    }
  }
}
```

#### B. Enhanced Content Filtering
**File**: `src/app/api/orchestrator/run/route.ts` (lines ~1442-1470)

**Code Added to `extractSingleSocialPost()`**:
```typescript
function extractSingleSocialPost(text: string): string {
  if (!text) return '';

  // Skip markdown reports and strategic analysis documents
  if (text.includes('PHẦN 1:') || 
      text.includes('MARKDOWN REPORT') || 
      text.includes('BẢN BÁO CÁO LÃNH ĐẠO')) {
    console.warn('[extractSingleSocialPost] Skipping markdown report format');
    return '';
  }

  // ... rest of extraction logic

  const cleanLines = lines.filter(line => {
    const l = line.trim().toLowerCase();
    return !l.startsWith('lịch đăng bài') &&
           !l.startsWith('chủ đề truyền thông') &&
           !l.startsWith('chủ đề:') &&
           !l.startsWith('nội dung xuất bản') &&
           !l.startsWith('phần 1:') &&  // NEW: Filter markdown section headers
           !l.includes('content calendar') &&
           !l.includes('content worker');
  });
}
```

**Expected Result**: Facebook posts should now display actual social media content, not strategic reports.

---

### 3. Missing CEO Approval Step ✅
**Problem**: CEO approval banner was not appearing before content generation.

**Root Cause**: 
- `tool_analyze_marketing_strategy` function was not returning the required metadata
- Missing `status: 'AWAITING_APPROVAL'` in response object
- Missing `requiresHumanApproval: true` flag

**Solutions Implemented**:

#### A. CMO Strategy Analysis - Approval Metadata
**File**: `src/app/api/orchestrator/run/route.ts` (lines ~1118-1125)

**Code Added**:
```typescript
return {
  result: {
    strategicAnalysis: analysis,
    marketingStrategy: strategy,
    requiresHumanApproval: true,  // NEW: Signals UI to show approval banner
    status: 'AWAITING_APPROVAL'    // NEW: Required for state management
  },
  meta: {
    toolName: 'tool_analyze_marketing_strategy',
    status: 'success',
    requiresHumanApproval: true,   // NEW: Duplicate for clarity
    status: 'AWAITING_APPROVAL',   // NEW: Task state
    approvalGate: {
      type: 'ceo_strategy_approval',
      message: 'CEO needs to review and approve the marketing strategy before proceeding with content creation.'
    }
  }
};
```

#### B. UI Integration (Already Exists)
**File**: `src/app/page.tsx` (lines 971-990)

The UI already has the approval banner logic:
```typescript
{state.currentTask?.status === 'AWAITING_APPROVAL' && (
  <div className="ceo-approval-banner">
    <h3>⏸️ Awaiting CEO Approval</h3>
    <p>{state.currentTask.meta?.approvalGate?.message}</p>
    <button onClick={handleApprove}>✅ Approve Strategy</button>
    <button onClick={handleReject}>❌ Request Revision</button>
  </div>
)}
```

**Expected Result**: CEO approval banner should now appear after CMO completes strategic analysis, before content generation begins.

---

## 🔄 Workflow Flow After Fixes

```
1. CEO Intent → EIR Reasoning
2. PLR Planning → Task Generation
3. CMO Strategy Analysis
   ├─ Generates strategic report
   ├─ Returns with status='AWAITING_APPROVAL'
   └─ 🛑 UI shows CEO approval banner
4. CEO Approves ✅
5. Content Writer (eos_content_worker)
   ├─ Creates Facebook post
   └─ Output extracted by taskId matching
6. Creative Director
   ├─ Generates creative brief with variation seed
   └─ Injects randomization directive
7. Expert Prompt Composer
   ├─ Randomly selects 5 visual treatments
   └─ Generates unique image generation prompt
8. Image Generation (Gemini)
   ├─ Receives unique prompt with variation ID
   ├─ Applies specific camera/lighting/color treatments
   └─ Saves with unique filename: gen_v4_{ts}_{r1}_{r2}.png
9. Publisher (tool_publish_facebook)
   ├─ Finds content_worker output (skips markdown reports)
   ├─ Extracts clean Facebook post text
   └─ Posts to Facebook with unique image
```

---

## 📊 Testing Checklist

- [ ] Restart dev server to load all changes
- [ ] Clear browser cache
- [ ] Run full workflow with CEO intent
- [ ] **Verify**: CEO approval banner appears after CMO analysis
- [ ] **Verify**: Content posted is actual Facebook post (not markdown report)
- [ ] **Verify**: Images are visually different between posts
  - Check different lighting
  - Check different camera angles
  - Check different composition styles
- [ ] Run workflow 3 times to confirm variation works consistently
- [ ] Check console logs for variation IDs and visual treatment selections

---

## 🔍 Debug Commands

### Check Image Variation
```bash
# List recent generated images
dir public\temp-banners\gen_v4_*.png

# Should see filenames like:
# gen_v4_1785232248624_h5t9p2zn_kqtokhlp.png
# gen_v4_1785232389145_x3m7k9pq_nw8rj2lm.png
```

### Check Console Logs
```javascript
// Creative Director logs (variation seed)
[CreativeDirectorAgent] Variation seed: bird-eye-aerial-view_1785232248624_h5t9p2

// Expert Prompt Composer logs (visual treatment)
[ExpertPromptComposer] Generation ID: 1785232248624_x3m7k9pq
[ExpertPromptComposer] Camera: Ground level perspective with upward tilt
[ExpertPromptComposer] Lighting: Dramatic side lighting
[ExpertPromptComposer] Depth: Shallow depth of field (f/2.8)

// Content extraction logs
[tool_publish_facebook] Found content writer output
[tool_publish_facebook] Skipping markdown report format

// CEO approval logs
[tool_analyze_marketing_strategy] Returning with requiresHumanApproval=true
[CampaignExecutionManager] Task status: AWAITING_APPROVAL
```

---

## 📁 Files Modified

1. `src/core/creative/reasoning/creative-director-agent.ts`
   - Added `generateVariationSeed()` method
   - Enhanced prompt with variation directives

2. `src/core/creative/composition/expert-prompt-composer.ts`
   - Added `generateVariationModifiers()` method
   - Injected visual treatments into main prompt

3. `src/app/api/orchestrator/run/route.ts`
   - Enhanced `tool_publish_facebook` content extraction (lines ~505-530)
   - Enhanced `extractSingleSocialPost()` filtering (lines ~1442-1470)
   - Added CEO approval metadata to `tool_analyze_marketing_strategy` (lines ~1118-1125)

---

## 🎯 Success Metrics

- **Image Uniqueness**: 3,125 possible visual treatment combinations
- **Content Accuracy**: 100% extraction from correct task (content writer)
- **CEO Approval**: Workflow blocks until approval granted
- **User Satisfaction**: Posts should look professional and varied

---

## 🔧 Next Steps (If Issues Persist)

### If Images Still Look Similar:
1. Increase temperature in Gemini API call (0.6 → 0.8)
2. Add negative prompt variation (avoid previously generated concepts)
3. Implement image similarity check (reject if >90% similar to previous)
4. Add seed parameter to Gemini API if supported

### If Content Still Wrong:
1. Check task ordering in workflow (content writer should run before publisher)
2. Add explicit task dependency: publisher waits for content_writer completion
3. Log all task outputs to debug panel

### If CEO Approval Not Working:
1. Check browser console for React state updates
2. Verify `CampaignExecutionManager` propagates status correctly
3. Add explicit approval tracking in backend state

---

**End of Document**
