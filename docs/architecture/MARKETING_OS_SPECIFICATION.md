# Marketing Operating System (Marketing OS) - Complete Specification

**Version**: 1.0  
**Date**: 2026-07-27  
**Status**: Proposed  
**Related**: ADR-0008 (Executive Planning Runtime), ADR-0009 (Marketing OS)

---

## Executive Summary

**Marketing OS** is a domain-specific intelligence layer that translates business strategy into executable marketing plans with **content-level precision**.

### The Problem It Solves

```
❌ BEFORE:
Business Strategy → ??? → Tasks

CEO: "Tăng doanh thu Q1 40%"
  ↓ (magic happens)
Task 1: Write a Facebook post
Task 2: Generate banner
Task 3: Publish

Problem: No marketing intelligence connecting strategy to execution
```

```
✅ AFTER:
Business Strategy → Marketing OS → Marketing Execution Plan → Tasks

CEO: "Tăng doanh thu Q1 40%"
  ↓
Marketing OS (10 phases)
  ↓
Marketing Execution Plan:
  - 3 Campaigns
  - 100 Content Cards
  - Each with: objective, persona, funnel stage, KPI, budget
  ↓
Tasks (derived from content cards)
```

---

## Core Output: Marketing Execution Plan

```typescript
interface MarketingExecutionPlan {
  // Business Context
  businessObjective: string;
  businessStrategy: BusinessStrategyBlueprint;
  planPeriod: { start: Date; end: Date; duration: string };
  
  // Marketing Targets
  targets: {
    leadTarget: 2000,           // per month
    conversionTarget: 300,      // per month
    revenueTarget: 20_000_000_000, // VND
    retentionTarget: 0.55,      // 55%
    brandAwarenessTarget: 100_000 // reach
  };
  
  // Funnel Allocation
  funnelStrategy: {
    awareness:      { weight: 35%, budget: 840M, content: 40 },
    consideration:  { weight: 30%, budget: 720M, content: 30 },
    conversion:     { weight: 20%, budget: 480M, content: 15 },
    retention:      { weight: 15%, budget: 360M, content: 15 }
  };
  
  // Channel Mix
  channelAllocation: {
    facebook:  { budget: 960M (40%), content: 40, roi: 350% },
    instagram: { budget: 600M (25%), content: 30, roi: 400% },
    tiktok:    { budget: 480M (20%), content: 20, roi: 300% },
    email:     { budget: 240M (10%), content: 20, roi: 600% },
    google:    { budget: 120M (5%),  content: 10, roi: 250% }
  };
  
  // Campaign Portfolio
  campaignPortfolio: [
    {
      id: "camp-001",
      name: "Win-back Campaign",
      objective: "Reactivate churned customers",
      budget: 800M,
      timeline: "Month 1-2",
      contentCards: 30,
      expectedRevenue: 6B,
      kpis: { conversion: 18%, reactivated: 300 }
    },
    {
      id: "camp-002",
      name: "TikTok Launch",
      objective: "Brand awareness + lead generation",
      budget: 480M,
      timeline: "Month 2-3",
      contentCards: 20,
      expectedRevenue: 5B,
      kpis: { reach: 200K, ctr: 2%, leads: 400 }
    },
    {
      id: "camp-003",
      name: "Premium Upsell",
      objective: "Increase transaction value",
      budget: 400M,
      timeline: "Month 1.5-3",
      contentCards: 25,
      expectedRevenue: 4B,
      kpis: { upsellRate: 15%, avgValue: 1.4M }
    }
  ];
  
  // Content Strategy
  contentStrategy: {
    pillars: [
      { name: "Education", weight: 30%, topics: ["Spa benefits", "Wellness tips"] },
      { name: "Transformation", weight: 25%, topics: ["Before/after", "Success stories"] },
      { name: "Behind-the-scenes", weight: 20%, topics: ["Staff expertise", "Process"] },
      { name: "Promotion", weight: 15%, topics: ["Offers", "Packages"] },
      { name: "Community", weight: 10%, topics: ["Customer stories", "Events"] }
    ],
    
    types: {
      image: 40%,
      video: 30%,
      carousel: 20%,
      text: 10%
    },
    
    formats: {
      shortForm: 50%,   // TikTok, Reels, Stories
      longForm: 20%,    // YouTube, Blog
      static: 30%       // Posts, Images
    }
  };
  
  // Content Calendar: 100 Content Cards
  contentCalendar: {
    totalCards: 100,
    byMonth: { month1: 35, month2: 35, month3: 30 },
    byFunnel: {
      awareness: 40,
      consideration: 30,
      conversion: 15,
      retention: 15
    },
    cards: ContentCard[] // 100 cards (see below)
  };
  
  // Publishing Strategy
  publishingStrategy: {
    frequency: {
      facebook: "1-2 posts/day",
      instagram: "1 post + 2-3 stories/day",
      tiktok: "3-4 videos/week",
      email: "3 emails/week"
    },
    optimalTimes: [
      { channel: "facebook", time: "12:00, 18:00, 20:00" },
      { channel: "instagram", time: "11:00, 15:00, 19:00" },
      { channel: "tiktok", time: "17:00, 20:00, 22:00" }
    ]
  };
  
  // KPI Tree
  kpiTree: {
    primary: [
      { metric: "Revenue", target: 20B, weight: 50% },
      { metric: "Leads", target: 2000/month, weight: 30% },
      { metric: "Retention", target: 55%, weight: 20% }
    ],
    secondary: [
      { metric: "Reach", target: 200K },
      { metric: "Engagement", target: 3.5% },
      { metric: "CTR", target: 2.5% }
    ],
    byContent: true // Each content card has KPI targets
  };
  
  // Tracking Plan
  trackingPlan: {
    pixels: ["Facebook Pixel", "TikTok Pixel", "Google Analytics"],
    events: ["PageView", "Lead", "Purchase", "AddToCart"],
    utmStrategy: {
      source: "facebook|instagram|tiktok|email",
      medium: "social|paid|organic|email",
      campaign: "{campaign_id}",
      content: "{content_card_id}"
    }
  };
  
  // Optimization Framework
  optimizationPlan: {
    abTests: [
      { test: "Headline A vs B", metric: "CTR", duration: "2 weeks" },
      { test: "CTA 'Book Now' vs 'Learn More'", metric: "Conversion", duration: "2 weeks" }
    ],
    iterationCycle: "Bi-weekly review → Adjust → Test",
    learningObjectives: [
      "Identify best performing content types",
      "Optimize posting times",
      "Refine audience segments"
    ]
  };
}
```

---

## The Atomic Unit: Content Card

Every piece of content is a **Content Card** with full context:

```typescript
interface ContentCard {
  // Identity
  cardId: "cc-001",
  cardName: "Win-back Email: Premium Package Offer",
  
  // Strategic Context
  campaignId: "camp-001",
  campaignName: "Win-back Campaign",
  businessObjective: "Tăng doanh thu Q1 40%",
  
  // Marketing Context
  funnelStage: "conversion",
  persona: {
    name: "Lapsed Premium Customer",
    age: "35-50",
    income: "High",
    painPoints: ["Busy schedule", "Need relaxation"],
    motivations: ["Premium quality", "Proven results"]
  },
  objective: "Reactivate 10 lapsed customers → 12M revenue",
  
  // Content Specification
  contentType: "email",
  contentPillar: "Promotion",
  topic: "Exclusive comeback offer",
  angle: "We miss you + special discount",
  
  // Creative Brief
  creativeBrief: {
    headline: "We Miss You! Exclusive 30% Off Your Favorite Package",
    keyMessage: "Your premium spa experience awaits. Limited-time offer for valued customers.",
    visualDirection: "Elegant spa interior, warm welcoming tone, gold accents",
    callToAction: "Book Your Return Visit Now",
    tone: "Warm, personal, premium",
    constraints: ["No stock photos", "Must use brand colors", "Logo bottom-right"]
  },
  
  // Publishing
  channel: "email",
  publishTime: "2026-07-29T10:00:00Z",
  timezone: "Asia/Ho_Chi_Minh",
  
  // Budget
  organicBudget: 50_000, // Email design, copywriting
  paidBudget: 0,         // Organic email
  totalBudget: 50_000,
  
  // KPIs
  kpis: {
    primary: { metric: "Conversions", target: 10 },   // 10 bookings
    secondary: [
      { metric: "Open Rate", target: 35 },            // 35%
      { metric: "Click Rate", target: 12 },           // 12%
      { metric: "Revenue", target: 12_000_000 }       // 12M VND
    ]
  },
  
  // Tracking
  tracking: {
    utmSource: "email",
    utmMedium: "winback",
    utmCampaign: "camp-001",
    utmContent: "cc-001",
    events: ["EmailOpen", "EmailClick", "Booking"]
  },
  
  // Dependencies
  dependencies: [],  // Can run immediately
  
  // Workflow
  workflow: {
    step1: "Copywriter AI → Email copy",
    step2: "Designer AI → Email template",
    step3: "Reviewer AI → Quality check",
    step4: "Publisher AI → Send via email platform",
    step5: "Analytics AI → Track results"
  },
  
  // Status
  status: "planned",
  
  // Results (populated after sending)
  results: null
}
```

---

## From Content Card to Execution

```
Content Card cc-001
  ↓
Workflow Planner creates tasks:
  ↓
Task 1: Copywriter AI
  Input: {
    objective: "Reactivate 10 lapsed customers",
    persona: "Lapsed Premium Customer",
    creativeBrief: {...},
    tone: "Warm, personal, premium"
  }
  Output: Email copy
  ↓
Task 2: Designer AI / Creative Production Runtime
  Input: {
    creativeBrief: {...},
    copy: [from Task 1],
    brand: BrandDNA
  }
  Output: Email template (HTML)
  ↓
Task 3: Reviewer AI
  Input: Email template
  Output: Quality score, approval/reject
  ↓
Task 4: Publisher AI
  Input: Approved template
  Output: Send via email platform
  ↓
Task 5: Analytics AI
  Input: Campaign results
  Output: Performance report
```

**Key Benefit**: Every task has **full context** from the content card:
- Why we're creating this (business objective)
- Who it's for (persona)
- What stage of funnel (conversion)
- What success looks like (KPIs)
- How it connects to overall strategy (campaign)

---

## Complete Example: 3-Month Marketing Execution Plan

### Month 1: Foundation + Win-back

**Week 1-2: Setup**
- Content Cards 1-15: Win-back campaign (email, Facebook ads)
  - cc-001 to cc-010: Email sequence (10 emails)
  - cc-011 to cc-015: Facebook retargeting ads (5 variations)
- Budget: 400M

**Week 3-4: Launch**
- Content Cards 16-35: Brand awareness (Facebook, Instagram)
  - cc-016 to cc-025: Educational posts (10 posts)
  - cc-026 to cc-035: Behind-the-scenes (10 posts)
- Budget: 400M

**Month 1 Totals**:
- Content Cards: 35
- Budget: 800M
- Expected: 8B revenue, 400 leads, 150 conversions

---

### Month 2: Scale + TikTok Launch

**Week 5-6: TikTok Pilot**
- Content Cards 36-50: TikTok launch (15 videos)
  - cc-036 to cc-045: Educational short videos (10)
  - cc-046 to cc-050: Viral challenges (5)
- Budget: 200M (pilot)

**Week 7-8: Premium Upsell**
- Content Cards 51-70: Premium upselling (20 pieces)
  - cc-051 to cc-060: Product showcase (10 carousels)
  - cc-061 to cc-070: Customer testimonials (10 videos)
- Budget: 400M

**Month 2 Totals**:
- Content Cards: 35
- Budget: 1000M (includes TikTok scale if pilot succeeds)
- Expected: 10B revenue, 600 leads, 180 conversions

---

### Month 3: Retention + Optimization

**Week 9-10: Loyalty Program**
- Content Cards 71-85: Retention content (15 pieces)
  - cc-071 to cc-080: Loyalty program promotion (10)
  - cc-081 to cc-085: After-care tips (5)
- Budget: 300M

**Week 11-12: Optimization**
- Content Cards 86-100: Best performers + new tests (15 pieces)
  - cc-086 to cc-095: Replicate winners (10)
  - cc-096 to cc-100: A/B tests (5)
- Budget: 300M

**Month 3 Totals**:
- Content Cards: 30
- Budget: 600M
- Expected: 6B revenue (sustained), 500 leads, 150 conversions

---

### Quarter Summary

**Total Plan**:
- Campaigns: 3 (Win-back, TikTok Launch, Premium Upsell)
- Content Cards: 100
- Budget: 2.4B VND
- Expected Revenue: 20B+ VND (goal achieved!)
- Expected ROI: 733%

**Distribution**:
```
By Funnel:
  Awareness:      40 cards (40%)
  Consideration:  30 cards (30%)
  Conversion:     15 cards (15%)
  Retention:      15 cards (15%)

By Channel:
  Facebook:    40 cards
  Instagram:   30 cards
  TikTok:      20 cards
  Email:       10 cards

By Format:
  Image:       40 cards
  Video:       35 cards
  Carousel:    15 cards
  Text/Email:  10 cards
```

---

## Integration with Architecture

### Position in v22.0

Marketing OS belongs to **Execution Capability** (domain-specific sub-layer):

```
Decision Capability
  └─ Executive Planning Runtime (AI COO)
      ↓
Execution Capability
  ├─ 🆕 Marketing Operating System (AI Marketing Manager)
  ├─ Sales Operating System (future)
  ├─ Finance Operating System (future)
  └─ HR Operating System (future)
      ↓
      Workflow Planner (tactical)
      ↓
      Task Execution
```

### Data Flow

```
Business Strategy Blueprint (from EPR)
  ↓
Marketing OS (10 phases)
  ↓
Marketing Execution Plan
  {
    campaigns: Campaign[],
    contentCards: ContentCard[]
  }
  ↓
Workflow Planner
  for each ContentCard:
    create TaskDAG
  ↓
Creative Production Runtime
  Copywriter → Designer → Reviewer → Publisher
  ↓
Analytics & Learning
  Results → Evidence → Knowledge → Improve Plan
```

---

## Benefits

### 1. Every Content Has Purpose

**Before**:
```
Task: "Write a Facebook post about spa services"
```

**After**:
```
Content Card cc-042:
  Campaign: Win-back
  Objective: Reactivate 10 lapsed customers → 12M revenue
  Persona: Lapsed Premium Customer
  Funnel: Conversion
  KPI: 10 bookings
  Budget: 500K
  Tone: Warm, personal
```

### 2. Strategic Alignment

- Every content card traces back to business objective
- Clear attribution: Revenue → Campaign → Content Card
- No "random" content

### 3. Performance Tracking

- Each card has specific KPIs
- Easy to identify what works
- Data-driven optimization

### 4. Scalability

- Template-driven: Once Marketing OS works, replicate for other domains
- Sales OS, Finance OS, HR OS follow same pattern

### 5. True Enterprise Intelligence

- From "content factory" → "strategic marketing OS"
- AI understands marketing, not just execution

---

## Implementation Priority

**Timeline**: 8 months (parallel with v22.0)

**Month 1-2**: Phases 1-3 (Diagnosis, Funnel, Channels)
**Month 3-4**: Phases 4-6 (Budget, Campaigns, Pillars)
**Month 5-6**: Phases 7-9 (Calendar, Ads, KPIs)
**Month 7-8**: Phase 10 + Integration (Optimization, Workflow)

**Dependencies**:
- Requires: Executive Planning Runtime (ADR-0008)
- Enables: Content Card-based execution
- Unblocks: True marketing intelligence

---

## Success Metrics

| Metric | Before | After Marketing OS | Improvement |
|--------|--------|-------------------|-------------|
| Content with clear KPIs | 20% | 100% | 5x |
| Strategic alignment | Low | High | Clear traceability |
| Campaign ROI | 200% | >600% | 3x |
| Content reuse rate | 10% | 60% | 6x |
| CEO marketing satisfaction | 3.8/5 | >4.7/5 | +24% |

---

*Document Version*: 1.0  
*Date*: 2026-07-27  
*Status*: Proposed  
*Next Review*: After ADR-0009 approval
