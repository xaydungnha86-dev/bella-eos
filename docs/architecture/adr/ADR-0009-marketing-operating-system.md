# ADR-0009: Marketing Operating System (Marketing OS)

* **Status**: Proposed (Critical - Domain Operating System Layer)
* **Date**: 2026-07-27
* **Author**: Enterprise Architecture Board
* **Priority**: HIGH
* **Impact**: HIGH - Adds domain intelligence layer
* **Depends On**: ADR-0008 (Executive Planning Runtime)

---

## Context

### The Missing Domain Intelligence Layer

After Executive Planning Runtime (EPR), we have a strategic blueprint:

```
❌ CURRENT GAP:

Executive Planning Runtime
  Output: Business Strategy Blueprint
  {
    objective: "Tăng doanh thu Q1 40%",
    initiatives: [Win-back, TikTok, Premium...],
    budget: 2.4B,
    timeline: 3 months
  }
    ↓
    ??? (GAP: How to operationalize marketing?)
    ↓
Workflow Planner
    Task 1: Write Facebook post
    Task 2: Generate banner
    Task 3: Publish
```

**Problem**: We jump from **business strategy** to **individual tasks** without **marketing operationalization**.

### What's Missing

A **domain-specific operating system** that translates business strategy into domain execution plan.

```
✅ SHOULD BE:

Business Strategy Blueprint
    ↓
🔴 MARKETING OPERATING SYSTEM (MISSING!)
    ├─ Marketing Diagnosis
    ├─ Funnel Strategy
    ├─ Channel Allocation
    ├─ Budget Optimization
    ├─ Campaign Portfolio Design
    ├─ Content Pillar Definition
    ├─ Content Calendar Planning
    ├─ Advertising Plan
    ├─ KPI Tree Construction
    └─ Optimization Framework
    ↓
Marketing Execution Plan
{
  monthlyLeadTarget: 1000,
  channelAllocation: {Facebook: 40%, TikTok: 30%, ...},
  campaignPortfolio: [Campaign A, B, C],
  contentCalendar: [20 content cards],
  each card: {
    objective, persona, funnelStage,
    contentType, CTA, publishTime,
    creativeBrief, budget, KPI
  }
}
    ↓
Workflow Planner
    Campaign A → 20 Content Cards → Tasks
    ↓
Execution
```

### Root Cause

**Bella EOS currently lacks domain-specific intelligence layers.**

Current architecture assumes **generic workflow planning** is enough. But real enterprises have **domain expertise** (Marketing, Sales, Finance, HR...) that needs to be operationalized.

**Generic workflow planning cannot answer**:
- What funnel stage should this content target?
- Which persona should we focus on?
- What's the optimal posting frequency?
- How should budget be allocated across channels?
- What KPIs should each piece of content track?

These require **Marketing domain intelligence**.

---

## Decision

We introduce **Marketing Operating System (Marketing OS)** - a domain-specific intelligence layer between business strategy and execution.

### Position in Architecture

```
┌────────────────────────────────────────────────┐
│            CEO OBJECTIVE                       │
│      "Tăng doanh thu Q1 40%"                   │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│     EXECUTIVE PLANNING RUNTIME (EPR)           │
│            "AI COO"                            │
│  → Business diagnosis                          │
│  → Strategic options                           │
│  → Executive deliberation                      │
│  → Execution blueprint                         │
└────────────────────────────────────────────────┘
                     ↓
           Business Strategy Blueprint
           {
             initiatives: [Win-back, TikTok...],
             budget: 2.4B,
             timeline: Q1
           }
                     ↓
┌────────────────────────────────────────────────┐
│   🆕 MARKETING OPERATING SYSTEM (Marketing OS) │
│         "AI Marketing Manager"                 │
│                                                │
│  Phase 1: Marketing Diagnosis                 │
│  Phase 2: Funnel Strategy Planning            │
│  Phase 3: Channel Allocation                  │
│  Phase 4: Budget Optimization                 │
│  Phase 5: Campaign Portfolio Design           │
│  Phase 6: Content Pillar Definition           │
│  Phase 7: Content Calendar Planning           │
│  Phase 8: Advertising Plan                    │
│  Phase 9: KPI Tree Construction               │
│  Phase 10: Optimization Framework             │
└────────────────────────────────────────────────┘
                     ↓
         Marketing Execution Plan
         {
           campaigns: [Campaign A, B, C],
           contentCards: [Card 1..100],
           each card: {
             objective, persona, funnelStage,
             contentType, CTA, publishTime,
             creativeBrief, budget, KPI
           }
         }
                     ↓
┌────────────────────────────────────────────────┐
│          WORKFLOW PLANNER                      │
│  (Tactical task decomposition)                │
│  Campaign → Content Cards → Tasks             │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│      CREATIVE PRODUCTION PIPELINE              │
│  Content Card → Copywriter → Creative →       │
│  Designer → Reviewer → Publisher → Analytics  │
└────────────────────────────────────────────────┘
```

---

## Marketing Operating System Specification

### Architecture

```
Marketing Operating System (Marketing OS)
├── Phase 1: Marketing Diagnosis Engine
│   ├── Current Funnel Analyzer
│   ├── Channel Performance Analyzer
│   ├── Audience Segmentation Analyzer
│   └── Content Gap Identifier
│
├── Phase 2: Funnel Strategy Planner
│   ├── Funnel Stage Allocator
│   ├── Conversion Goal Setter
│   └── Audience Journey Mapper
│
├── Phase 3: Channel Allocation Engine
│   ├── Channel Performance Predictor
│   ├── Channel Mix Optimizer
│   └── Channel Budget Allocator
│
├── Phase 4: Budget Optimization Engine
│   ├── ROI-Based Budget Allocator
│   ├── Campaign Budget Optimizer
│   └── Contingency Reserve Manager
│
├── Phase 5: Campaign Portfolio Designer
│   ├── Campaign Theme Generator
│   ├── Campaign Timeline Planner
│   └── Campaign Dependency Mapper
│
├── Phase 6: Content Pillar Definer
│   ├── Content Theme Identifier
│   ├── Content Type Allocator
│   └── Content Format Mixer
│
├── Phase 7: Content Calendar Planner
│   ├── Publishing Schedule Optimizer
│   ├── Content Frequency Calculator
│   └── Posting Time Optimizer
│
├── Phase 8: Advertising Plan Generator
│   ├── Ad Campaign Designer
│   ├── Targeting Strategy Planner
│   └── Bidding Strategy Optimizer
│
├── Phase 9: KPI Tree Constructor
│   ├── Objective-to-KPI Mapper
│   ├── KPI Target Calculator
│   └── Attribution Model Definer
│
└── Phase 10: Optimization Framework Builder
    ├── A/B Test Planner
    ├── Performance Monitoring Setup
    └── Continuous Improvement Loop
```

### Core Concepts

#### 1. Marketing Execution Plan

```typescript
interface MarketingExecutionPlan {
  // Meta
  planId: string;
  businessObjective: string;
  businessStrategy: BusinessStrategyBlueprint;
  planPeriod: { start: Date; end: Date };
  
  // Targets
  targets: {
    leadTarget: number;
    conversionTarget: number;
    revenueTarget: number;
    customerAcquisitionTarget: number;
    brandAwarenessTarget: number;
  };
  
  // Funnel Strategy
  funnelStrategy: {
    awareness: { weight: number; budget: number; content: number };
    consideration: { weight: number; budget: number; content: number };
    conversion: { weight: number; budget: number; content: number };
    retention: { weight: number; budget: number; content: number };
  };
  
  // Channel Allocation
  channelAllocation: {
    facebook: ChannelPlan;
    instagram: ChannelPlan;
    tiktok: ChannelPlan;
    google: ChannelPlan;
    email: ChannelPlan;
    website: ChannelPlan;
  };
  
  // Budget
  budgetAllocation: {
    totalBudget: number;
    contentCreation: number;
    advertising: number;
    tools: number;
    contingency: number;
    byChannel: Record<string, number>;
    byCampaign: Record<string, number>;
  };
  
  // Campaigns
  campaignPortfolio: Campaign[];
  
  // Content Strategy
  contentStrategy: {
    pillars: ContentPillar[];
    types: ContentTypeMix;
    formats: ContentFormatMix;
    tone: ToneGuidelines;
  };
  
  // Content Calendar
  contentCalendar: {
    monthlyCards: number;
    weeklyCards: number;
    contentCards: ContentCard[];
  };
  
  // Publishing
  publishingStrategy: {
    frequency: { daily: number; weekly: number; monthly: number };
    optimalTimes: OptimalTime[];
    distribution: DistributionPlan;
  };
  
  // Advertising
  advertisingPlan: {
    campaigns: AdCampaign[];
    targeting: TargetingStrategy;
    bidding: BiddingStrategy;
    creative: AdCreativeGuidelines;
  };
  
  // KPIs
  kpiTree: {
    primary: KPI[];
    secondary: KPI[];
    operational: KPI[];
    attribution: AttributionModel;
  };
  
  // Tracking
  trackingPlan: {
    events: TrackingEvent[];
    pixels: Pixel[];
    utmStrategy: UTMStrategy;
    dashboards: Dashboard[];
  };
  
  // Optimization
  optimizationPlan: {
    abTests: ABTest[];
    learningObjectives: LearningObjective[];
    iterationCycles: IterationCycle[];
  };
}
```

#### 2. Content Card

The atomic unit of marketing execution:

```typescript
interface ContentCard {
  // Identity
  cardId: string;
  cardName: string;
  
  // Strategic Context
  campaignId: string;
  campaignName: string;
  businessObjective: string;
  
  // Marketing Context
  funnelStage: 'awareness' | 'consideration' | 'conversion' | 'retention';
  persona: Persona;
  objective: string; // "Generate 50 leads", "Drive 100 website visits"
  
  // Content Specification
  contentType: 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'article';
  contentPillar: string;
  topic: string;
  angle: string;
  
  // Creative Brief
  creativeBrief: {
    headline: string;
    keyMessage: string;
    visualDirection: string;
    callToAction: string;
    tone: string;
    constraints: string[];
  };
  
  // Publishing
  channel: Channel;
  publishTime: Date;
  timezone: string;
  
  // Budget
  organicBudget: number;
  paidBudget: number;
  totalBudget: number;
  
  // Targeting (if paid)
  targeting?: {
    audience: AudienceSegment;
    demographics: Demographics;
    interests: string[];
    behaviors: string[];
  };
  
  // KPIs
  kpis: {
    primary: { metric: string; target: number };
    secondary: { metric: string; target: number }[];
  };
  
  // Tracking
  tracking: {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    events: string[];
  };
  
  // Dependencies
  dependencies: string[]; // Other content card IDs
  
  // Status
  status: 'planned' | 'in_production' | 'review' | 'approved' | 'published' | 'analyzing';
  
  // Results (populated after publishing)
  results?: {
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
  };
}
```

---

## Phase-by-Phase Specification


### Phase 1: Marketing Diagnosis

**Input**: Business Strategy Blueprint

**Purpose**: Understand current marketing state

```typescript
interface MarketingDiagnosis {
  currentFunnelState: {
    awareness: { traffic: number; sources: string[]; cost: number };
    consideration: { leads: number; quality: number; conversionRate: number };
    conversion: { sales: number; avgValue: number; conversionRate: number };
    retention: { churnRate: number; ltv: number; repeatRate: number };
  };
  
  channelPerformance: {
    [channel: string]: {
      reach: number;
      engagement: number;
      cost: number;
      roi: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  
  audienceSegments: {
    [segment: string]: {
      size: number;
      value: number;
      engagement: number;
      priority: number;
    };
  };
  
  contentGaps: {
    underservedStages: FunnelStage[];
    underservedPersonas: Persona[];
    underservedTopics: string[];
    opportunities: ContentOpportunity[];
  };
  
  competitorAnalysis: {
    competitors: Competitor[];
    shareOfVoice: number;
    contentGap: string[];
    differentiationOpportunities: string[];
  };
}

async function diagnoseMarketing(
  businessStrategy: BusinessStrategyBlueprint
): Promise<MarketingDiagnosis> {
  
  // Query EKR for historical marketing data
  const funnelData = await ekr.query({ domain: 'marketing', type: 'funnel' });
  const channelData = await ekr.query({ domain: 'marketing', type: 'channels' });
  
  // Analyze funnel health
  const funnelState = analyzeFunnel(funnelData);
  
  // Analyze channel performance
  const channelPerformance = analyzeChannels(channelData);
  
  // Segment analysis
  const segments = analyzeAudience(funnelData, channelData);
  
  // Identify gaps
  const contentGaps = identifyContentGaps(funnelState, segments);
  
  // Competitive intelligence (from MIR)
  const competitorAnalysis = await getCompetitorAnalysis();
  
  return {
    currentFunnelState: funnelState,
    channelPerformance,
    audienceSegments: segments,
    contentGaps,
    competitorAnalysis
  };
}
```

**Output Example**:
```
Marketing Diagnosis:

Current Funnel State:
  Awareness: 
    ✅ Traffic: 50K/month
    ⚠️  Top-of-funnel content: Sparse
    🔴 Cost per visitor: 20K VND (high)
  
  Consideration:
    ⚠️  Leads: 1,500/month (below target 2,000)
    ✅ Lead quality: 70% qualified
    ⚠️  Conversion to MQL: 40% (target 50%)
  
  Conversion:
    🔴 Sales: 200/month (target 300)
    ✅ Avg value: 1.2M VND
    🔴 Conversion rate: 13% (target 15%)
  
  Retention:
    🔴 Churn rate: 55% (very high)
    ⚠️  LTV: 5M VND (below potential)
    🔴 Repeat rate: 30% (target 50%)

Channel Performance:
  Facebook:
    Reach: 30K, Engagement: 2.5%, Cost: 500K, ROI: 180%
    Status: ⚠️  Declining engagement
  
  Instagram:
    Reach: 15K, Engagement: 3.8%, Cost: 300K, ROI: 220%
    Status: ✅ Stable, high engagement
  
  TikTok:
    Reach: 0 (not active), ROI: N/A
    Status: 🔴 Opportunity: High-growth channel unused
  
  Email:
    Reach: 5K, Open: 25%, Click: 8%, ROI: 450%
    Status: ✅ High ROI but underutilized

Audience Segments:
  1. Premium Seekers (30% revenue, 20% volume)
     Priority: HIGH - High value, underserved
  
  2. Budget-Conscious (15% revenue, 40% volume)
     Priority: MEDIUM - High volume, lower value
  
  3. First-Timers (25% revenue, 30% volume)
     Priority: HIGH - High potential, high churn
  
  4. Loyalists (30% revenue, 10% volume)
     Priority: HIGH - High LTV, need retention content

Content Gaps:
  🔴 Awareness stage: 60% content gap
     - Lack of educational content
     - No viral/trending content
     - Missing influencer partnerships
  
  ⚠️  Consideration stage: 30% content gap
     - Need more comparison content
     - Lack of testimonials/reviews
     - Missing FAQ content
  
  ✅ Conversion stage: Well-covered
     - Good promotional content
     - Clear CTAs
  
  🔴 Retention stage: 70% content gap
     - No loyalty content
     - Missing after-care content
     - No upsell content

Competitor Analysis:
  - Competitor A: 40% share of voice (we have 25%)
  - They dominate: Educational content, TikTok
  - We dominate: Premium positioning, Instagram
  - Opportunity: TikTok (they have 100K followers, we have 0)
```

---

### Phase 2: Funnel Strategy Planning

**Input**: Marketing Diagnosis + Business Strategy

**Purpose**: Decide where to focus marketing efforts

```typescript
interface FunnelStrategy {
  allocation: {
    awareness: { weight: number; budget: number; contentCount: number };
    consideration: { weight: number; budget: number; contentCount: number };
    conversion: { weight: number; budget: number; contentCount: number };
    retention: { weight: number; budget: number; contentCount: number };
  };
  
  conversionGoals: {
    [stage: string]: {
      inputMetric: string;
      inputTarget: number;
      outputMetric: string;
      outputTarget: number;
      conversionRate: number;
    };
  };
  
  audienceJourneys: {
    [persona: string]: {
      stages: JourneyStage[];
      touchpoints: number;
      avgDuration: number;
      keyContent: string[];
    };
  };
  
  priorityAreas: {
    area: string;
    rationale: string;
    impact: number;
    effort: number;
  }[];
}

async function planFunnelStrategy(
  diagnosis: MarketingDiagnosis,
  businessStrategy: BusinessStrategyBlueprint
): Promise<FunnelStrategy> {
  
  // Identify biggest leaks in funnel
  const leaks = identifyFunnelLeaks(diagnosis.currentFunnelState);
  
  // Decide allocation based on business goals + current state
  const allocation = optimizeFunnelAllocation(
    businessStrategy,
    diagnosis,
    leaks
  );
  
  // Set conversion goals for each stage
  const conversionGoals = setConversionGoals(allocation, businessStrategy);
  
  // Map customer journeys
  const journeys = mapCustomerJourneys(diagnosis.audienceSegments);
  
  // Prioritize focus areas
  const priorities = prioritizeFocusAreas(leaks, allocation);
  
  return {
    allocation,
    conversionGoals,
    audienceJourneys: journeys,
    priorityAreas: priorities
  };
}
```

**Output Example**:
```
Funnel Strategy:

Allocation Decision:
  Awareness: 35% budget, 40% content
    Rationale: Top-of-funnel weak, need brand awareness
    Budget: 840M VND, Content: 40 pieces
  
  Consideration: 30% budget, 30% content
    Rationale: Moderate gap, need nurturing
    Budget: 720M VND, Content: 30 pieces
  
  Conversion: 20% budget, 15% content
    Rationale: Already strong, maintain
    Budget: 480M VND, Content: 15 pieces
  
  Retention: 15% budget, 15% content
    Rationale: Critical gap, high-value improvement
    Budget: 360M VND, Content: 15 pieces

Conversion Goals:
  Awareness → Consideration:
    Input: 50K visitors/month
    Target: 60K visitors/month (+20%)
    Output: 2,000 leads/month
    Conversion Rate: 3.3% (currently 3%)
  
  Consideration → Conversion:
    Input: 2,000 leads/month
    Output: 300 sales/month
    Conversion Rate: 15% (currently 13%)
  
  Conversion → Retention:
    Input: 300 customers/month
    Output: 135 retained (45% retention)
    Target: 165 retained (55% retention)

Customer Journeys:

  Premium Seekers:
    Stage 1: Awareness (Instagram ad) → Visit website
    Stage 2: Consideration (Email series) → Download brochure
    Stage 3: Conversion (Phone consultation) → Book service
    Stage 4: Retention (Loyalty program) → Repeat booking
    Avg Duration: 14 days, Touchpoints: 8

  First-Timers:
    Stage 1: Awareness (TikTok video) → Follow account
    Stage 2: Consideration (Educational content) → Trust building
    Stage 3: Conversion (Discount offer) → First booking
    Stage 4: Retention (Welcome series) → Upgrade to regular
    Avg Duration: 7 days, Touchpoints: 5

Priority Focus Areas:
  1. Awareness Gap (Impact: 9/10, Effort: 7/10)
     → Launch TikTok channel, viral content strategy
  
  2. Retention Gap (Impact: 10/10, Effort: 6/10)
     → Loyalty program, after-care content
  
  3. Consideration Conversion (Impact: 7/10, Effort: 5/10)
     → Testimonial content, comparison guides
```

---

### Phase 3: Channel Allocation

**Input**: Funnel Strategy + Diagnosis

**Purpose**: Decide channel mix and budget per channel

```typescript
interface ChannelAllocation {
  channels: {
    [channel: string]: {
      budget: number;
      budgetPercentage: number;
      organicBudget: number;
      paidBudget: number;
      contentCount: number;
      frequency: string;
      funnelStages: FunnelStage[];
      expectedReach: number;
      expectedROI: number;
      priority: 'primary' | 'secondary' | 'experimental';
    };
  };
  
  channelSynergies: {
    [combo: string]: {
      effect: string;
      multiplier: number;
    };
  };
  
  newChannels: {
    channel: string;
    rationale: string;
    pilotBudget: number;
    successCriteria: string[];
  }[];
}

async function allocateChannels(
  funnelStrategy: FunnelStrategy,
  diagnosis: MarketingDiagnosis
): Promise<ChannelAllocation> {
  
  // Score each channel on performance
  const channelScores = scoreChannels(diagnosis.channelPerformance);
  
  // Optimize budget allocation
  const budgetAllocation = optimizeChannelBudget(
    channelScores,
    funnelStrategy.allocation
  );
  
  // Identify synergies
  const synergies = identifyChannelSynergies(channelScores);
  
  // Recommend new channels
  const newChannels = recommendNewChannels(diagnosis, funnelStrategy);
  
  return {
    channels: budgetAllocation,
    channelSynergies: synergies,
    newChannels
  };
}
```

**Output Example**:
```
Channel Allocation:

Facebook (Primary):
  Budget: 960M (40%), Organic: 160M, Paid: 800M
  Content: 40 posts/month
  Frequency: 1-2 posts/day
  Stages: Awareness (60%), Consideration (30%), Conversion (10%)
  Expected Reach: 100K/month
  Expected ROI: 350%
  
Instagram (Primary):
  Budget: 600M (25%), Organic: 300M, Paid: 300M
  Content: 30 posts/month + 20 stories
  Frequency: 1 post/day, 2-3 stories/day
  Stages: Awareness (40%), Consideration (40%), Retention (20%)
  Expected Reach: 60K/month
  Expected ROI: 400%

TikTok (Experimental → Primary):
  Budget: 480M (20%), Organic: 180M, Paid: 300M
  Content: 20 videos/month
  Frequency: 3-4 videos/week
  Stages: Awareness (90%), Consideration (10%)
  Expected Reach: 200K/month (if successful)
  Expected ROI: 300% (uncertain, needs validation)
  
  Pilot Phase (Month 1-2):
    Budget: 200M (test)
    Success Criteria:
      - CTR > 2%
      - Cost per follower < 5K VND
      - Engagement rate > 5%
    If success: Scale to 480M in Month 3

Email (Secondary):
  Budget: 240M (10%), Organic: 200M, Paid: 40M
  Content: 12 newsletters + 8 campaigns
  Frequency: 3 emails/week
  Stages: Consideration (50%), Conversion (30%), Retention (20%)
  Expected Reach: 10K/month
  Expected ROI: 600%

Google Ads (Secondary):
  Budget: 120M (5%), Paid only
  Content: 5 ad groups
  Stages: Conversion (80%), Consideration (20%)
  Expected Reach: 20K/month
  Expected ROI: 250%

Channel Synergies:
  Facebook + Instagram:
    Effect: Cross-posting amplification
    Multiplier: 1.3x reach
  
  TikTok + Instagram Reels:
    Effect: Content repurposing
    Multiplier: 1.5x efficiency
  
  Email + Facebook Retargeting:
    Effect: Nurture + conversion boost
    Multiplier: 2x conversion rate
```

---

### Phase 4: Budget Optimization

**Input**: Channel Allocation + Funnel Strategy

**Purpose**: Optimize budget distribution for maximum ROI

```typescript
interface BudgetOptimization {
  totalBudget: number;
  
  byObjective: {
    awareness: number;
    consideration: number;
    conversion: number;
    retention: number;
  };
  
  byChannel: {
    [channel: string]: number;
  };
  
  byCampaign: {
    [campaign: string]: number;
  };
  
  byType: {
    contentCreation: number;
    advertising: number;
    tools: number;
    contingency: number;
  };
  
  phasing: {
    month1: number;
    month2: number;
    month3: number;
  };
  
  contingencyTriggers: {
    condition: string;
    action: string;
    budget: number;
  }[];
}
```

**Output Example**:
```
Budget Optimization:

Total Budget: 2.4B VND

By Objective:
  Awareness:      840M (35%)
  Consideration:  720M (30%)
  Conversion:     480M (20%)
  Retention:      360M (15%)

By Channel:
  Facebook:   960M (40%)
  Instagram:  600M (25%)
  TikTok:     480M (20%)
  Email:      240M (10%)
  Google:     120M (5%)

By Campaign (derived later in Phase 5):
  Win-back Campaign:        800M
  TikTok Launch Campaign:   480M
  Premium Upsell Campaign:  400M
  Loyalty Program:          360M
  Brand Awareness:          360M

By Type:
  Content Creation:  720M (30%) - AI creative, design, video
  Advertising:      1440M (60%) - Paid ads, boosting
  Tools & Tech:      120M (5%)  - Software, analytics
  Contingency:       120M (5%)  - Reserve for pivots

Phasing (Gate-based release):
  Month 1:  800M (33%) - Win-back + Setup
    Gate: Win-back conversion ≥ 18%
  
  Month 2: 1000M (42%) - TikTok Pilot + Premium
    Gate: TikTok CTR ≥ 2%
  
  Month 3:  600M (25%) - Scale + Retention
    Gate: Overall progress ≥ 60% target

Contingency Triggers:
  IF TikTok pilot fails (CTR < 2%):
    → Reallocate 280M to Facebook + Instagram
  
  IF Win-back underperforms (conversion < 15%):
    → Activate Plan B: Referral program (300M)
  
  IF budget overrun > 10%:
    → Freeze contingency, reduce TikTok Phase 2
```

