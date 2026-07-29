# ADR-0010: Executive Capability - The Thinking Layer

* **Status**: Proposed (CRITICAL - Missing Cognitive Core)
* **Date**: 2026-07-27
* **Author**: Enterprise Architecture Board
* **Priority**: HIGHEST
* **Impact**: TRANSFORMATIONAL - Defines AI COO vs AI Assistant

---

## Context

### The Fundamental Gap

After implementing all capabilities (Knowledge, Decision, Creative, Execution, Learning, Governance, Intelligence), we still have a **critical cognitive gap**:

```
❌ CURRENT FLOW:

CEO: "Tăng doanh thu spa tháng sau 30%"
    ↓
(Magic happens?)
    ↓
Business Context Package
    ↓
Creative Brief
    ↓
Generate Banner
```

**Problem**: System jumps from CEO intent to tactics **without executive thinking**.

### What's Missing: The COO Thought Process

**A real COO doesn't immediately execute. A real COO THINKS:**

```
CEO: "Tăng doanh thu 30%"
    ↓
COO thinks:
  "Tăng doanh thu bằng cách nào?"
    → 20 possibilities
    → Khách mới? Khách cũ? Upsell? Giá? Chi nhánh?
    ↓
  "Cái nào khả thi nhất?"
    → Analyze current state
    → Check constraints
    → Evaluate tradeoffs
    ↓
  "1.5 tỷ thêm đến từ đâu?"
    → 40% khách cũ
    → 35% khách mới
    → 25% upsell
    ↓
  "Khách mới từ đâu?"
    → Facebook ROAS = 6
    → TikTok ROAS = 2
    → Google ROAS = 4
    → Decision: Focus Facebook, optimize TikTok
    ↓
  "Facebook content mix?"
    → Analyze past performance
    → 4 Branding, 3 Educational, 3 Sale, 2 Community
    ↓
  "Ads allocation?"
    → Which posts to boost
    → Budget per post
    → Audience per campaign
    ↓
THEN: Brief Creative Director
```

**This thinking process is completely missing in Bella EOS.**

### Current Architecture Skips 3 Critical Thinking Layers

```
❌ CURRENT (Shallow):

CEO Objective
    ↓
Business Context (data aggregation)
    ↓
Creative Strategy (already tactical)
    ↓
Creative Brief
```

```
✅ SHOULD BE (Deep):

CEO Objective
    ↓
🔴 LAYER 1: EXECUTIVE THINKING (MISSING!)
    "Why? What? How? Constraints? Tradeoffs?"
    ↓
🔴 LAYER 2: BUSINESS STRATEGY (MISSING!)
    "Revenue decomposition, source allocation"
    ↓
🔴 LAYER 3: FUNCTIONAL STRATEGY (MISSING!)
    "Marketing → Channels → Content mix"
    ↓
Creative Strategy (now informed by above)
    ↓
Creative Brief
```

---

## Decision

We introduce **Executive Capability** - the **cognitive core** and **thinking layer** of Bella EOS.

This is not just another capability. This is **the capability that makes Bella an AI COO** instead of an AI assistant.

### Position in Architecture

```
┌────────────────────────────────────────────────┐
│               CEO INTENT                       │
│     "Tăng doanh thu tháng sau 30%"             │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│   🆕 EXECUTIVE CAPABILITY (Thinking Layer)     │
│         "AI COO Brain"                         │
│                                                │
│  Phase 1: Goal Clarification                  │
│    "What does CEO really want?"               │
│                                                │
│  Phase 2: Business Diagnosis                  │
│    "Why is revenue where it is?"              │
│                                                │
│  Phase 3: Opportunity Discovery               │
│    "What are 20 ways to increase revenue?"    │
│                                                │
│  Phase 4: Constraint Analysis                 │
│    "What limits us?"                          │
│                                                │
│  Phase 5: Tradeoff Debate                     │
│    "What are we willing to sacrifice?"        │
│                                                │
│  Phase 6: Strategic Reasoning                 │
│    "What's the smartest approach?"            │
│                                                │
│  Phase 7: Executive Simulation                │
│    "What happens if we do this?"              │
│                                                │
│  Phase 8: KPI Decomposition                   │
│    "How do we measure success?"               │
│                                                │
│  Phase 9: Resource Allocation                 │
│    "How do we distribute budget/people?"      │
│                                                │
│  Phase 10: Executive Approval                 │
│    "CEO, this is what I recommend"            │
└────────────────────────────────────────────────┘
                     ↓
          Executive Reasoning Package
          {
            clarifiedGoal: string,
            rootCauses: Cause[],
            opportunities: Opportunity[],
            constraints: Constraint[],
            tradeoffs: Tradeoff[],
            recommendedStrategy: Strategy,
            kpiTree: KPITree,
            resourcePlan: ResourcePlan,
            approval: ApprovalRequest
          }
                     ↓
┌────────────────────────────────────────────────┐
│    DECISION CAPABILITY                         │
│    (Strategic planning, simulation)            │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│    MARKETING OS                                │
│    (Marketing operationalization)              │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│    CREATIVE CAPABILITY                         │
│    (Content creation)                          │
└────────────────────────────────────────────────┘
```

---

## Executive Capability Specification

### The Thinking Hierarchy

```
Executive Capability IS the thinking layer that asks:

LEVEL 1 - CLARITY:
  "What does CEO really want?"
  "Is this goal specific enough?"
  "What's the real intent behind this request?"

LEVEL 2 - DIAGNOSIS:
  "Why is current state what it is?"
  "What's causing the problem?"
  "What data do I need to understand this?"

LEVEL 3 - POSSIBILITIES:
  "What are ALL possible approaches?"
  "What have others done?"
  "What are unconventional options?"

LEVEL 4 - FEASIBILITY:
  "What blocks us?"
  "What resources do we have?"
  "What can't we do?"

LEVEL 5 - TRADEOFFS:
  "What must we sacrifice?"
  "What's the cost of each option?"
  "What risks are we taking?"

LEVEL 6 - REASONING:
  "What's the BEST approach?"
  "Why this over alternatives?"
  "What's the logic?"

LEVEL 7 - SIMULATION:
  "What happens if...?"
  "Best case? Worst case?"
  "What could go wrong?"

LEVEL 8 - METRICS:
  "How do we measure success?"
  "What are leading indicators?"
  "What's the KPI tree?"

LEVEL 9 - RESOURCES:
  "Who does what?"
  "How much budget where?"
  "What's the timeline?"

LEVEL 10 - APPROVAL:
  "CEO, here's my analysis"
  "Here's what I recommend"
  "Here's why"
  "Do you approve?"
```

### Architecture

```
Executive Capability
├── Goal Clarification Runtime
│   ├── Intent Parser
│   ├── Ambiguity Detector
│   ├── Context Extractor
│   └── Goal Refiner
│
├── Business Diagnosis Runtime
│   ├── Current State Analyzer
│   ├── Root Cause Engine (5 Whys, Fishbone)
│   ├── Performance Gap Identifier
│   └── Evidence Gatherer
│
├── Opportunity Discovery Runtime
│   ├── Possibility Generator (20+ options)
│   ├── Historical Pattern Matcher
│   ├── Market Opportunity Scanner
│   └── Innovation Suggester
│
├── Constraint Analysis Runtime
│   ├── Resource Constraint Checker
│   ├── Capability Constraint Checker
│   ├── Time Constraint Checker
│   ├── Policy Constraint Checker
│   └── Market Constraint Checker
│
├── Tradeoff Debate Runtime
│   ├── Cost-Benefit Analyzer
│   ├── Risk-Return Mapper
│   ├── Sacrifice Identifier
│   └── Tradeoff Matrix Builder
│
├── Strategic Reasoning Runtime
│   ├── Logic Chain Builder
│   ├── Assumption Validator
│   ├── Alternative Evaluator
│   └── Best Option Selector
│
├── Executive Simulation Runtime
│   ├── Scenario Generator
│   ├── Outcome Predictor
│   ├── Risk Simulator
│   └── Sensitivity Analyzer
│
├── KPI Decomposition Runtime
│   ├── Goal-to-KPI Mapper
│   ├── KPI Tree Builder
│   ├── Leading Indicator Identifier
│   └── Attribution Model Builder
│
├── Resource Allocation Runtime
│   ├── Budget Allocator
│   ├── Headcount Planner
│   ├── Timeline Planner
│   └── Priority Sequencer
│
└── Executive Approval Runtime
    ├── Recommendation Packager
    ├── Rationale Explainer
    ├── Risk Discloser
    └── Approval Request Generator
```

---

## Phase-by-Phase Detailed Specification

### Phase 1: Goal Clarification

**Purpose**: Understand what CEO REALLY wants

```typescript
interface GoalClarification {
  originalStatement: string;
  
  clarificationQuestions: {
    question: string;
    why: string;
    options: string[];
  }[];
  
  clarifiedGoal: {
    what: string;        // "Increase revenue"
    howMuch: string;     // "30% = 1.5B VND"
    by: string;          // "Next month"
    why: string;         // "Q1 target pressure"
    constraints: string[]; // "Within current budget"
  };
  
  ambiguities: {
    detected: string[];
    resolved: boolean;
    assumptions: string[];
  };
  
  context: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    stakeholders: string[];
    dependencies: string[];
  };
}

async function clarifyGoal(
  ceoStatement: string
): Promise<GoalClarification> {
  
  // Detect ambiguities
  const ambiguities = detectAmbiguities(ceoStatement);
  
  // Generate clarification questions
  const questions = generateClarificationQuestions(ambiguities);
  
  // If CEO available, ask questions
  // If not, make reasonable assumptions
  const clarified = await resolveClarifications(questions);
  
  // Extract structured goal
  const structuredGoal = extractStructuredGoal(clarified);
  
  return {
    originalStatement: ceoStatement,
    clarificationQuestions: questions,
    clarifiedGoal: structuredGoal,
    ambiguities,
    context: extractContext(structuredGoal)
  };
}
```

**Example**:

```
CEO: "Tăng doanh thu spa tháng sau 30%"

Clarification Process:
  
  Detected Ambiguities:
    1. "Tháng sau" = which month exactly?
    2. "30%" = on top of which baseline?
    3. Sustainable or one-time spike?
    4. Any budget constraints?
    5. Any method constraints? (e.g., no price increase)
  
  Clarification Questions:
    Q1: "Tháng sau là tháng 8/2026?"
        → Assume: Yes (default next calendar month)
    
    Q2: "30% compared to July 2026 or average?"
        → Assume: Compared to July 2026 (last month)
    
    Q3: "One-time campaign or sustainable growth?"
        → Critical: Ask CEO if available
        → If not: Assume sustainable (better default)
    
    Q4: "What's the budget limit?"
        → Check EKR for standard budget
        → Assume: 10% of target revenue = 150M
    
    Q5: "Any constraints? (price, discounts, hiring...)"
        → Check company policies
        → Assume: No hiring, no permanent price changes

Clarified Goal:
  What: Increase spa revenue
  How Much: 30% = 1.5B VND additional
  Baseline: July 2026 revenue (5B)
  Target: 6.5B in August 2026
  Timeline: 4 weeks
  Urgency: High (end-of-month deadline)
  Budget: 150M (10% of target)
  Constraints:
    - No new hires (takes too long)
    - No permanent price changes (brand risk)
    - Use existing channels (no new setup time)
    - Sustainable approach (repeatable)
```

---

### Phase 2: Business Diagnosis

**Purpose**: Understand WHY current state is what it is (root cause analysis)

```typescript
interface BusinessDiagnosis {
  currentState: {
    revenue: number;
    customers: number;
    avgTransaction: number;
    retention: number;
    newCustomerRate: number;
    metrics: Record<string, number>;
  };
  
  rootCauses: {
    symptom: string;
    impact: number; // in revenue
    causes: {
      level: number;  // 5 Whys depth
      cause: string;
      evidence: string[];
    }[];
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
  
  performanceGaps: {
    metric: string;
    current: number;
    industry: number;
    gap: number;
    opportunity: number; // revenue potential
  }[];
  
  diagnosis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

async function diagnose(
  clarifiedGoal: GoalClarification
): Promise<BusinessDiagnosis> {
  
  // Gather current state from EKR
  const currentState = await EKR.getBusinessMetrics({
    domain: 'revenue',
    timeRange: 'last_3_months'
  });
  
  // Identify symptoms
  const symptoms = identifySymptoms(currentState, clarifiedGoal);
  
  // For each symptom, do 5 Whys root cause analysis
  const rootCauses = await Promise.all(
    symptoms.map(symptom => fiveWhysAnalysis(symptom))
  );
  
  // Compare to industry benchmarks
  const gaps = await identifyPerformanceGaps(currentState);
  
  // SWOT analysis
  const diagnosis = conductSWOTAnalysis(currentState, rootCauses, gaps);
  
  return {
    currentState,
    rootCauses,
    performanceGaps: gaps,
    diagnosis
  };
}

async function fiveWhysAnalysis(symptom: string) {
  const whys = [];
  let currentWhy = symptom;
  
  for (let level = 1; level <= 5; level++) {
    const cause = await askWhy(currentWhy);
    const evidence = await gatherEvidence(cause);
    
    whys.push({ level, cause, evidence });
    currentWhy = cause;
  }
  
  return {
    symptom,
    causes: whys,
    severity: calculateSeverity(whys)
  };
}
```

**Example**:

```
Current State Analysis:
  Revenue: 5B/month
  Customers: 400/month
  Avg Transaction: 12.5M
  Retention: 45%
  New Customer Rate: 60% (240 new, 160 returning)

Root Cause Analysis:

SYMPTOM 1: Low Retention (45% vs 60% industry)
  
  Why 1: Why is retention only 45%?
    → 220 customers (55%) don't return
    Evidence: CRM data, last 3 months
  
  Why 2: Why don't they return?
    → No follow-up communication after visit
    Evidence: 
      - 0 post-visit emails sent
      - 0 loyalty program
      - No satisfaction survey
  
  Why 3: Why no follow-up system?
    → CRM not configured for automation
    Evidence: CRM logs show manual-only mode
  
  Why 4: Why not configured?
    → Team focused on new customer acquisition
    Evidence: Marketing budget 90% acquisition, 10% retention
  
  Why 5: Why focused on acquisition?
    → Belief that "new customers = growth"
    Evidence: Marketing strategy doc from 2025
  
  ROOT CAUSE: Wrong strategic focus (acquisition over retention)
  IMPACT: 220 churned × 12.5M × 12 months = 33B annual loss
  SEVERITY: CRITICAL 🔴
  
  Fix Opportunity: Win-back campaign
  Potential Recovery: 220 × 30% = 66 customers × 12.5M = 825M/month

SYMPTOM 2: Flat Transaction Value (12.5M for 2 years)
  
  Why 1: Why is AOV stuck at 12.5M?
    → All customers buy entry-level package
    Evidence: Sales data shows 85% buy "Basic Massage"
  
  Why 2: Why don't they upgrade?
    → Staff doesn't offer upsells
    Evidence: 
      - 0 upsell attempts logged in CRM
      - Sales training last done 2024
  
  Why 3: Why no upselling?
    → No commission structure for upsells
    Evidence: Compensation plan is flat salary
  
  Why 4: Why no commission?
    → Management concern about pushy sales
    Evidence: Policy memo from 2024
  
  Why 5: Why that concern?
    → One customer complaint in 2023
    Evidence: Overreaction to single incident
  
  ROOT CAUSE: Fear-based policy blocking revenue growth
  IMPACT: 400 customers × 20% upsell rate × 5M extra = 400M/month lost
  SEVERITY: HIGH 🔴
  
  Fix Opportunity: Upsell training + incentive
  Potential: 400M/month

SYMPTOM 3: Weekend Underutilization (60%)
  
  Why 1: Why only 60% booked on weekends?
    → Not enough promotion
    Evidence: Social media posts mostly weekdays
  
  Why 2: Why not promote weekends?
    → Assumption that "people prefer weekdays"
    Evidence: No data to support this
  
  Why 3: Why that assumption?
    → Historical pattern (but never tested)
    Evidence: Weekend bookings were 60% for 2 years
  
  Why 4: Why never tested?
    → No A/B testing culture
    Evidence: Marketing runs on intuition
  
  Why 5: Why no testing?
    → Lack of marketing analytics capability
    Evidence: No analytics tool, no data analyst
  
  ROOT CAUSE: Data-blind marketing
  IMPACT: 40% capacity × 100 slots × 12.5M = 500M/month lost
  SEVERITY: MEDIUM 🟡
  
  Fix Opportunity: Weekend promotion campaign
  Potential: 400M/month (conservative 32 slots)

Performance Gaps:

┌─────────────────────────────────────────────────────┐
│ Metric          Current  Industry  Gap    Opportunity│
├─────────────────────────────────────────────────────┤
│ Retention       45%      60%       -15%   825M/month │
│ Upsell Rate     0%       15%       -15%   400M/month │
│ Weekend Util    60%      85%       -25%   400M/month │
│ Referral Rate   5%       20%       -15%   300M/month │
│ Email Open      0%       25%       -25%   N/A        │
└─────────────────────────────────────────────────────┘

Total Opportunity: 1.925B/month 🎯

SWOT Diagnosis:

Strengths:
  ✅ High new customer acquisition (240/month)
  ✅ Facebook ROAS = 6 (very good)
  ✅ Strong service quality (no complaints)
  ✅ Good location and facilities

Weaknesses:
  🔴 No retention system (critical)
  🔴 No upselling culture
  🔴 Underutilized capacity (weekends)
  🔴 No marketing analytics
  🔴 Fear-based policies

Opportunities:
  🎯 Win-back churned customers (825M potential)
  🎯 Upsell premium services (400M potential)
  🎯 Weekend campaigns (400M potential)
  🎯 Referral program (300M potential)
  🎯 TikTok channel (untapped)

Threats:
  ⚠️  New competitors opening nearby
  ⚠️  Economic slowdown affecting discretionary spend
  ⚠️  Seasonality (summer vs winter demand)

DIAGNOSIS CONCLUSION:
  Primary Issue: Retention broken → losing 33B/year
  Secondary Issue: No upselling → leaving 4.8B/year on table
  Tertiary Issue: Capacity underused → 6B/year waste
  
  Good News: Acquisition working well (Facebook)
  Strategy: Fix retention FIRST, then upsell, then capacity
```

---

### Phase 3: Opportunity Discovery

**Purpose**: Generate ALL possible approaches (divergent thinking)

```typescript
interface OpportunityDiscovery {
  possibilities: {
    id: string;
    name: string;
    description: string;
    potential: number;      // revenue impact
    feasibility: number;    // 0-100%
    timeToImpact: string;   // "1 week", "1 month"
    cost: number;
    roi: number;
    category: 'acquisition' | 'retention' | 'monetization' | 'efficiency';
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  
  prioritization: {
    highImpactHighFeasibility: string[];  // Do first
    highImpactLowFeasibility: string[];   // Invest to enable
    lowImpactHighFeasibility: string[];   // Quick wins
    lowImpactLowFeasibility: string[];    // Ignore
  };
  
  selectedTop5: {
    id: string;
    rationale: string;
  }[];
}

async function discoverOpportunities(
  diagnosis: BusinessDiagnosis
): Promise<OpportunityDiscovery> {
  
  // Generate possibilities from multiple sources
  const possibilities = [
    ...generateFromRootCauses(diagnosis.rootCauses),
    ...generateFromGaps(diagnosis.performanceGaps),
    ...generateFromHistoricalData(),
    ...generateFromIndustryBenchmarks(),
    ...generateFromInnovation(),
  ];
  
  // Score each possibility
  const scored = await Promise.all(
    possibilities.map(p => scorePossibility(p))
  );
  
  // Prioritize using Impact-Feasibility matrix
  const prioritized = prioritizeUsingMatrix(scored);
  
  // Select top 5
  const top5 = selectTop5(prioritized);
  
  return {
    possibilities: scored,
    prioritization: prioritized,
    selectedTop5: top5
  };
}
```

**Example**:

```
20 Possible Approaches to Increase Revenue 30%:

HIGH IMPACT, HIGH FEASIBILITY (Do First 🎯):

1. Win-back Campaign (Churned Customers)
   Description: Email + offer to 220 churned customers
   Potential: 600M (66 customers × 12.5M × 70% lifetime)
   Feasibility: 90% (email list exists, offer ready)
   Time to Impact: 1 week
   Cost: 50M (design + incentive)
   ROI: 1200%
   Risk: Low
   Rationale: Addresses ROOT CAUSE #1 (retention)

2. Premium Upsell Program
   Description: Train staff, add incentives, create premium packages
   Potential: 500M (400 customers × 12% upsell × 10M extra)
   Feasibility: 80% (packages exist, need training)
   Time to Impact: 2 weeks
   Cost: 40M (training + materials)
   ROI: 1250%
   Risk: Low
   Rationale: Addresses ROOT CAUSE #2 (flat AOV)

3. Weekend Promotion Campaign
   Description: Social ads + limited-time weekend offer
   Potential: 400M (32 extra bookings × 12.5M)
   Feasibility: 95% (immediate launch possible)
   Time to Impact: 3 days
   Cost: 30M (ads + design)
   ROI: 1333%
   Risk: Low
   Rationale: Addresses ROOT CAUSE #3 (underutilized)

HIGH IMPACT, MEDIUM FEASIBILITY (Invest to Enable 🚀):

4. TikTok Channel Launch
   Description: Create TikTok account, run pilot campaign
   Potential: 400M (32 new customers × 12.5M)
   Feasibility: 60% (no account yet, learning curve)
   Time to Impact: 2 weeks
   Cost: 30M (content + ads)
   ROI: 1333% (if works)
   Risk: Medium (algorithm uncertain)
   Rationale: Diversify acquisition channels

5. Referral Program
   Description: Incentivize customers to refer friends
   Potential: 300M (24 new customers × 12.5M)
   Feasibility: 70% (need to design program)
   Time to Impact: 2 weeks
   Cost: 40M (incentives + system)
   ROI: 750%
   Risk: Medium (adoption uncertain)
   Rationale: Low-cost acquisition channel

LOW IMPACT, HIGH FEASIBILITY (Quick Wins 🎁):

6. Email Newsletter (Existing Customers)
   Description: Weekly spa tips + promotions
   Potential: 100M (retention boost)
   Feasibility: 90%
   Time to Impact: 1 week
   Cost: 5M
   ROI: 2000%
   Risk: Low
   Rationale: Re-engage existing customers

7. Google My Business Optimization
   Description: Update photos, hours, services
   Potential: 80M (local SEO boost)
   Feasibility: 95%
   Time to Impact: 3 days
   Cost: 2M
   ROI: 4000%
   Risk: Low
   Rationale: Free visibility

LOW IMPACT, MEDIUM FEASIBILITY (Consider Later 💤):

8. Livestream Events
9. Influencer Partnerships
10. Seasonal Packages
11. Corporate Wellness Contracts
12. Mobile App

LOW IMPACT, LOW FEASIBILITY (Ignore ❌):

13. Open New Location (takes 6 months)
14. Hire More Staff (takes 3 months)
15. Price Increase (brand risk)
16. Deep Discounts (margin risk)
17. Franchise Model (too complex)
18. Acquisition of Competitor (too expensive)
19. Spa Equipment Upgrade (no capacity issue)
20. Expand to Hotels (different business)

PRIORITIZATION MATRIX:

                  HIGH FEASIBILITY
                        │
        7 📧            │         1 🎯 Win-back
        6 📍            │         2 💎 Upsell
                        │         3 📅 Weekend
  ──────────────────────┼────────────────────────
        11 🎁           │         4 🎵 TikTok
        10 📦           │         5 🤝 Referral
        9 🤳            │         
        8 📺            │         
                        │
                  LOW FEASIBILITY

SELECTED TOP 5 FOR EXECUTION:

#1: Win-back Campaign
   Why: Highest ROI (1200%), addresses critical retention issue,
        immediate impact, very low risk
   
#2: Premium Upsell
   Why: High ROI (1250%), solves root cause of flat revenue,
        sustainable growth driver
   
#3: Weekend Promotion
   Why: Highest feasibility (95%), quick win, low cost,
        immediate revenue boost
   
#4: TikTok Pilot
   Why: High potential (400M), strategic exploration of new channel,
        acceptable risk with pilot approach
   
#5: Referral Program
   Why: Long-term growth driver, low acquisition cost,
        builds community, compounds over time

TOTAL POTENTIAL:
  Conservative (70% success): 1.6B ✅ Exceeds 1.5B goal
  Realistic (80% success): 1.9B ✅ 27% above goal
  Optimistic (95% success): 2.2B ✅ 47% above goal

RATIONALE FOR NOT SELECTING:
  - #13-20: Too slow, too risky, or wrong strategic fit
  - #6-7: Include as supporting tactics, not main initiatives
  - #8-12: Good ideas but not urgent for this goal
```



---

### Phase 4: Constraint Analysis

**Purpose**: Identify what LIMITS execution (reality check)

```typescript
interface ConstraintAnalysis {
  constraints: {
    type: 'budget' | 'workforce' | 'time' | 'technology' | 'policy' | 'market';
    description: string;
    impact: string;
    severity: 'blocker' | 'significant' | 'minor';
    mitigatable: boolean;
    mitigation?: string;
  }[];
  
  feasibilityAssessment: {
    opportunityId: string;
    feasible: boolean;
    blockedBy: string[];
    modifications: string[];
  }[];
  
  recommendation: {
    proceedWith: string[];
    deferUntil: string[];
    eliminate: string[];
  };
}

async function analyzeConstraints(
  opportunities: OpportunityDiscovery
): Promise<ConstraintAnalysis> {
  
  // Check budget constraints
  const budgetConstraints = await checkBudgetLimits();
  
  // Check workforce capacity
  const workforceConstraints = await checkWorkforceCapacity();
  
  // Check timeline feasibility
  const timeConstraints = checkTimeline(opportunities);
  
  // Check technology readiness
  const techConstraints = await checkTechnologyStack();
  
  // Check policy compliance
  const policyConstraints = await checkPolicies();
  
  // Check market conditions
  const marketConstraints = await checkMarketConditions();
  
  // For each opportunity, assess if constraints block it
  const feasibility = opportunities.selectedTop5.map(opp => 
    assessFeasibility(opp, allConstraints)
  );
  
  return {
    constraints: allConstraints,
    feasibilityAssessment: feasibility,
    recommendation: generateRecommendation(feasibility)
  };
}
```

**Example**:

```
CONSTRAINT ANALYSIS:

1. BUDGET CONSTRAINTS:
   Available: 150M
   Needed for Top 5:
     - Win-back: 50M
     - Upsell: 40M
     - Weekend: 30M
     - TikTok: 30M
     - Referral: 40M
   Total Need: 190M
   Gap: -40M ❌
   
   Severity: SIGNIFICANT
   Mitigation: 
     - Option A: Defer Referral (saves 40M) → Total 150M ✅
     - Option B: Reduce TikTok to pilot only (15M) → Total 165M (still over)
     - Option C: Negotiate budget increase
   
   Recommendation: Defer Referral, proceed with top 4

2. WORKFORCE CONSTRAINTS:
   Sales Team: 10 people
   Current Utilization: 80%
   Available Capacity: 20% = 2 FTE equivalent
   
   New Customers from Initiatives: 
     - Win-back: +66 customers
     - TikTok: +32 customers
   Total: +98 customers
   
   Service Capacity Needed: 98 × 2 hours = 196 hours
   Available: 2 FTE × 160 hours/month = 320 hours ✅
   
   Severity: MINOR (within capacity)
   Mitigation: Not needed
   
   Upsell Training Load:
     - 10 staff × 8 hours = 80 hours training
     - Timeline: 2 weeks ✅
   
   Recommendation: Proceed, capacity sufficient

3. TIMELINE CONSTRAINTS:
   Goal: 4 weeks
   
   Initiative Timelines:
     Week 1:
       - Win-back setup: 3 days ✅
       - Weekend launch: 2 days ✅
       - TikTok setup: 5 days ✅
       - Upsell design: 5 days ✅
     
     Week 2:
       - Win-back emails sent ✅
       - Weekend ads running ✅
       - TikTok pilot content ✅
       - Upsell training start ✅
     
     Week 3:
       - Win-back follow-ups ✅
       - Weekend optimization ✅
       - TikTok ads launch ✅
       - Upsell training complete ✅
     
     Week 4:
       - All initiatives running ✅
       - Optimization and scale ✅
   
   Severity: MINOR (all fit within 4 weeks)
   Recommendation: Proceed with phased rollout

4. TECHNOLOGY CONSTRAINTS:
   Current Stack:
     ✅ CRM: Yes (basic)
     ✅ Email Platform: Yes
     ✅ Facebook Business: Yes
     ✅ Instagram: Yes
     ❌ TikTok Business Account: No
     ❌ Marketing Automation: No
     ❌ Analytics Platform: Basic Google Analytics only
   
   Initiative Tech Requirements:
     Win-back: 
       - Need: Email platform ✅
       - Need: Customer segmentation ⚠️ (manual workaround)
     
     Upsell:
       - Need: CRM tracking ✅
       - Need: Sales dashboard ❌ (can build simple sheet)
     
     Weekend:
       - Need: Facebook Ads ✅
       - Need: Booking system ✅
     
     TikTok:
       - Need: TikTok Business Account ❌
       - Setup Time: 3 days
       - Severity: MINOR (quick setup)
     
   Severity: MINOR (workarounds available)
   Mitigation: Setup TikTok account in Week 1
   Recommendation: Proceed with workarounds

5. POLICY CONSTRAINTS:
   Checked Company Policies:
     ✅ No hiring without 3-month approval (bypassed by using existing staff)
     ✅ No price changes without board approval (not changing prices)
     ✅ Discounts up to 25% allowed (win-back offers within limit)
     ✅ Marketing spend up to 15% revenue approved (150M = 10% ✅)
     ⚠️ New channel launch needs CMO approval (TikTok)
   
   Severity: MINOR (one approval needed)
   Mitigation: Request CMO approval for TikTok pilot
   Recommendation: Proceed pending CMO approval

6. MARKET CONSTRAINTS:
   Economic Conditions: Stable
   Competitor Activity: 2 new spas opening Q3 (threat)
   Seasonality: August = high demand month ✅
   Consumer Sentiment: Positive for wellness spending ✅
   
   Severity: MINOR (favorable conditions)
   Recommendation: Proceed, timing is good

FEASIBILITY ASSESSMENT:

#1: Win-back Campaign
   Blocked by: None
   Modifications: Use manual segmentation instead of automation
   Feasibility: 90% → 85% (slight reduction due to manual work)
   Decision: PROCEED ✅

#2: Premium Upsell
   Blocked by: None
   Modifications: Build simple tracking spreadsheet
   Feasibility: 80% → 75%
   Decision: PROCEED ✅

#3: Weekend Promotion
   Blocked by: None
   Modifications: None needed
   Feasibility: 95% → 95%
   Decision: PROCEED ✅

#4: TikTok Pilot
   Blocked by: No account (3-day setup), CMO approval needed
   Modifications: Reduce to pilot (15M instead of 30M)
   Feasibility: 60% → 65% (pilot reduces risk)
   Decision: PROCEED with pilot ✅

#5: Referral Program
   Blocked by: Budget constraint (-40M)
   Modifications: Defer to Month 2
   Feasibility: 70% → 0% (not this month)
   Decision: DEFER ⏸️

FINAL RECOMMENDATION:

PROCEED WITH (4 initiatives):
  1. Win-back Campaign (50M)
  2. Premium Upsell (40M)
  3. Weekend Promotion (30M)
  4. TikTok Pilot (15M)
  Total: 135M ✅ (within 150M budget)

DEFER UNTIL MONTH 2:
  5. Referral Program (40M)
  
ELIMINATE:
  None (all top 5 are good, just budget-constrained)

CONSTRAINTS SUMMARY:
  🟢 Workforce: Sufficient capacity
  🟢 Timeline: All fit within 4 weeks
  🟢 Technology: Workarounds available
  🟢 Policy: One approval needed (TikTok)
  🟢 Market: Favorable conditions
  🟡 Budget: Tight but manageable with top 4
```

---

### Phase 5: Tradeoff Debate

**Purpose**: Understand what we SACRIFICE with each choice

```typescript
interface TradeoffAnalysis {
  options: {
    name: string;
    description: string;
    benefits: string[];
    costs: string[];
    sacrifices: string[];
    risks: string[];
    expectedValue: number;
  }[];
  
  tradeoffMatrix: {
    dimension: string;
    optionA: string;
    optionB: string;
    winner: 'A' | 'B' | 'tie';
    rationale: string;
  }[];
  
  recommendedOption: string;
  rationale: string;
}
```

**Example**:

```
TRADEOFF ANALYSIS:

Given constraints, we have 3 strategic options:

OPTION A: Conservative (Top 3 only)
  Initiatives: Win-back + Upsell + Weekend
  Budget: 120M
  Expected Revenue: 1.5B (exactly goal)
  Risk: LOW
  
  Benefits:
    ✅ Hits goal with high confidence
    ✅ Well under budget (30M buffer)
    ✅ No untested channels
    ✅ Team can focus on execution
  
  Costs:
    ❌ No exploration of new channels
    ❌ No safety margin if one underperforms
    ❌ Missed TikTok opportunity
  
  Sacrifices:
    - Future growth (no new channel testing)
    - Learning opportunity (TikTok)
    - Upside potential (capped at 1.5B)
  
  Risks:
    ⚠️ If one initiative underperforms by 20%, miss goal
    ⚠️ Competitors may capture TikTok audience first

OPTION B: Balanced (Top 4 with TikTok Pilot)
  Initiatives: Win-back + Upsell + Weekend + TikTok Pilot
  Budget: 135M
  Expected Revenue: 1.75B (17% above goal)
  Risk: MEDIUM
  
  Benefits:
    ✅ Exceeds goal with safety margin
    ✅ Tests TikTok for future scaling
    ✅ Diversifies acquisition channels
    ✅ Still within budget (15M buffer)
  
  Costs:
    ⚠️ TikTok uncertain (60% confidence)
    ⚠️ Team needs to learn new platform
    ⚠️ Slightly higher complexity
  
  Sacrifices:
    - Budget buffer (135M vs 120M)
    - Some team attention to learning curve
    - Referral program deferred
  
  Risks:
    ⚠️ TikTok may not work (waste 15M)
    ⚠️ Team spread across 4 initiatives
    ⚠️ But even without TikTok, still hits goal

OPTION C: Aggressive (All 5 - requires budget increase)
  Initiatives: All top 5
  Budget: 190M (need +40M approval)
  Expected Revenue: 2.0B (33% above goal)
  Risk: HIGH
  
  Benefits:
    ✅ Maximum upside potential
    ✅ Tests both TikTok and Referral
    ✅ Sets up strong Q2
  
  Costs:
    ❌ Exceeds budget by 40M
    ❌ Needs emergency approval (time-consuming)
    ❌ Team potentially overextended
    ❌ Higher complexity and coordination
  
  Sacrifices:
    - Budget discipline
    - Q2 marketing budget (borrowed)
    - Focus (spread too thin)
    - Execution quality risk
  
  Risks:
    🔴 Budget approval may be denied or delayed
    🔴 Team overwhelm → execution quality drops
    🔴 If initiatives interfere, total could be < sum of parts

TRADEOFF MATRIX:

┌──────────────────────────────────────────────────────────┐
│ Dimension        │ Conservative │ Balanced  │ Aggressive │
├──────────────────────────────────────────────────────────┤
│ Goal Achievement │ 100%         │ 117% ✅   │ 133%       │
│ Risk             │ Low ✅       │ Medium    │ High       │
│ Budget           │ 120M ✅      │ 135M      │ 190M ❌    │
│ Team Capacity    │ Comfortable✅│ Stretched │ Overload❌ │
│ Learning         │ None ❌      │ TikTok ✅ │ Both       │
│ Future Options   │ Limited ❌   │ Opened ✅ │ Opened     │
│ Execution Quality│ High ✅      │ High      │ Medium ❌  │
│ CEO Confidence   │ Medium       │ High ✅   │ Low        │
└──────────────────────────────────────────────────────────┘

HEAD-TO-HEAD: Conservative vs Balanced

Revenue Safety:
  Conservative: Hits goal exactly → if 1 underperforms, miss
  Balanced: 17% buffer → can absorb 1 underperformance
  Winner: Balanced ✅

Budget Risk:
  Conservative: 30M buffer (20% safety)
  Balanced: 15M buffer (10% safety)
  Winner: Conservative ✅ (but Balanced still acceptable)

Strategic Value:
  Conservative: No learning, no new channels
  Balanced: TikTok pilot opens future growth path
  Winner: Balanced ✅

Execution Risk:
  Conservative: 3 initiatives (very manageable)
  Balanced: 4 initiatives (manageable)
  Winner: Tie (both manageable)

Expected Value:
  Conservative: 1.5B × 0.85 confidence = 1.275B
  Balanced: 1.75B × 0.80 confidence = 1.4B
  Winner: Balanced ✅

TikTok Value Analysis:
  Cost: 15M
  Potential: 200M (pilot scale, conservative)
  Probability: 60%
  Expected Value: 200M × 0.6 = 120M
  ROI: (120M - 15M) / 15M = 700% ✅
  
  Strategic Value (not quantified):
    - Learn TikTok before competitors
    - Data for Month 2 scaling decision
    - Younger demographic access
  
  Conclusion: TikTok worth the risk

HEAD-TO-HEAD: Balanced vs Aggressive

Revenue Upside:
  Balanced: 1.75B
  Aggressive: 2.0B (+250M)
  Winner: Aggressive (but...)

Budget Feasibility:
  Balanced: Within limit ✅
  Aggressive: Needs approval ❌
  Winner: Balanced ✅

Execution Quality:
  Balanced: 4 initiatives (team can handle)
  Aggressive: 5 initiatives (team spread thin)
  Winner: Balanced ✅

Approval Timeline:
  Balanced: No approval needed → launch immediately
  Aggressive: Need approval → 1 week delay → lost revenue
  Winner: Balanced ✅

Risk-Adjusted Value:
  Balanced: 1.75B × 80% = 1.4B
  Aggressive: 2.0B × 60% (lower confidence) = 1.2B ❌
  Winner: Balanced ✅

Conclusion: Aggressive sacrifices too much execution quality for marginal upside

RECOMMENDATION: Option B (Balanced)

Rationale:
  1. Exceeds goal with safety margin (1.75B vs 1.5B)
  2. Within budget constraints (135M vs 150M limit)
  3. Manageable team capacity (4 initiatives)
  4. Strategic learning (TikTok pilot)
  5. High confidence (80% probability of success)
  6. Best risk-adjusted expected value (1.4B)
  7. No approval delays (immediate execution)

Sacrifices Accepted:
  - Referral program deferred to Month 2 ✅ (acceptable)
  - 15M budget buffer reduced ✅ (still safe)
  - Slightly higher risk than Conservative ✅ (mitigated by pilot approach)

Sacrifices NOT Accepted:
  ❌ Budget overrun (Aggressive)
  ❌ Team overload (Aggressive)
  ❌ Low execution quality (Aggressive)
  ❌ No upside potential (Conservative)
  ❌ No strategic learning (Conservative)
```


---

### Phase 6: Strategic Reasoning

**Purpose**: Build the LOGIC CHAIN that justifies the recommendation

```typescript
interface StrategicReasoning {
  premises: {
    id: string;
    statement: string;
    evidence: string[];
    confidence: number;
  }[];
  
  logicChain: {
    step: number;
    statement: string;
    basedOn: string[]; // premise IDs
    conclusion: string;
  }[];
  
  alternatives: {
    name: string;
    whyNotSelected: string;
  }[];
  
  recommendation: {
    option: string;
    confidence: number;
    rationale: string;
  };
}
```

**Example**:

```
STRATEGIC REASONING CHAIN:

PREMISES (Evidence-Based Facts):

P1: Goal = +1.5B revenue in 4 weeks
    Evidence: CEO directive
    Confidence: 100%

P2: Current retention = 45% (vs 60% industry)
    Evidence: CRM data, 3-month average
    Confidence: 95%

P3: Win-back can recover 600M with 85% confidence
    Evidence: 
      - 220 churned customers in CRM
      - Industry benchmark: 30% reactivation rate
      - 66 customers × 12.5M × 70% LTV = 577M ≈ 600M
    Confidence: 85%

P4: Upsell can generate 500M with 75% confidence
    Evidence:
      - 400 active customers
      - Industry benchmark: 12% upsell rate
      - Premium package: +10M average
      - 48 upsells × 10M × 95% LTV = 456M ≈ 500M
    Confidence: 75%

P5: Weekend promotion can generate 400M with 90% confidence
    Evidence:
      - 40% unused weekend capacity = 40 slots
      - Conservative: Fill 80% = 32 slots
      - 32 slots × 12.5M = 400M
    Confidence: 90%

P6: TikTok pilot can generate 200M with 60% confidence
    Evidence:
      - Similar spa TikTok accounts: 2-5% CTR
      - Conservative: 2% CTR, 2% conversion
      - Pilot budget: 15M → 25 customers → 312M LTV
      - Discounted for learning curve: 200M
    Confidence: 60%

P7: Budget limit = 150M
    Evidence: CFO approval, historical marketing budget
    Confidence: 100%

P8: Team capacity = 20% available (2 FTE equivalent)
    Evidence: HR capacity report
    Confidence: 95%

P9: Timeline = 4 weeks
    Evidence: CEO directive, month-end goal
    Confidence: 100%

LOGIC CHAIN:

Step 1: Conservative Approach Analysis
  IF Win-back (600M) + Upsell (500M) + Weekend (400M)
  THEN Total = 1.5B (exactly goal)
  Based on: P1, P3, P4, P5
  
  Conclusion: Conservative approach CAN hit goal, BUT...

Step 2: Risk Assessment of Conservative
  IF any ONE initiative underperforms by 20%
  THEN Total drops below 1.5B → MISS goal
  Based on: P3, P4, P5 (confidence not 100%)
  
  Example:
    If Win-back = 480M (20% under)
    Then Total = 1.38B ❌ (miss by 120M)
  
  Conclusion: Conservative has NO safety margin

Step 3: TikTok Value Proposition
  Cost: 15M
  Potential: 200M × 60% confidence = 120M expected value
  Net Benefit: 120M - 15M = 105M
  ROI: 700%
  Based on: P6, P7
  
  Strategic Value (not quantified):
    - Opens new acquisition channel
    - Learns platform before competitors
    - Data for Month 2 scaling
  
  Conclusion: TikTok ROI justifies 15M investment

Step 4: Balanced Approach Analysis
  IF Conservative (1.5B) + TikTok (200M expected)
  THEN Total = 1.7B potential
  Safety Margin: 200M (13% buffer)
  Based on: Steps 1, 3
  
  Conclusion: Balanced approach exceeds goal with buffer

Step 5: Budget Feasibility Check
  Balanced Cost: 120M + 15M = 135M
  Budget Limit: 150M (P7)
  Buffer: 15M (10%)
  Based on: P7
  
  Conclusion: Balanced is within budget ✅

Step 6: Team Capacity Check
  4 initiatives vs 20% capacity (P8)
  Win-back: 5% capacity
  Upsell: 8% capacity (training)
  Weekend: 3% capacity
  TikTok: 5% capacity (learning)
  Total: 21% (slightly over 20%)
  Based on: P8
  
  Mitigation: Acceptable 5% overtime for 1 month
  Conclusion: Team can handle 4 initiatives ✅

Step 7: Timeline Feasibility Check
  All 4 initiatives can launch within 4 weeks (P9)
  Phased rollout eliminates bottlenecks
  Based on: P9, constraint analysis
  
  Conclusion: Timeline feasible ✅

Step 8: Risk-Adjusted Expected Value
  Win-back: 600M × 85% = 510M
  Upsell: 500M × 75% = 375M
  Weekend: 400M × 90% = 360M
  TikTok: 200M × 60% = 120M
  Total Expected: 1.365B
  Based on: P3, P4, P5, P6
  
  Probability to exceed 1.5B goal:
    Even if TikTok fails (0M), Total = 1.245B base
    Need ONE initiative to exceed by 20% → 80% probability ✅
  
  Conclusion: High confidence (80%) to exceed goal

Step 9: Alternative Evaluation
  Aggressive (All 5 initiatives):
    Budget: 190M > 150M limit ❌ (violates P7)
    Team: 26% > 20% capacity ❌ (violates P8)
    Quality: Execution risk increases
  
  Conservative (Top 3 only):
    Revenue: 1.5B exactly (no buffer)
    Risk: If one underperforms → miss goal
    Learning: No new channel exploration
  
  Balanced (Top 4):
    Budget: 135M < 150M ✅
    Team: 21% ≈ 20% ✅ (acceptable)
    Revenue: 1.7B with buffer ✅
    Learning: TikTok pilot ✅
  
  Conclusion: Balanced dominates both alternatives

Step 10: Final Reasoning
  GIVEN:
    - Goal = 1.5B (P1)
    - Budget = 150M (P7)
    - Timeline = 4 weeks (P9)
    - Team = 20% capacity (P8)
  
  AND GIVEN:
    - Conservative hits goal BUT no margin
    - TikTok adds 200M expected value at 700% ROI
    - Balanced total = 1.365B expected (above goal even discounted)
    - Balanced fits budget and team capacity
  
  THEREFORE:
    Balanced (Top 4 with TikTok Pilot) is optimal strategy
  
  Confidence: 80%
  
  Rationale:
    1. Exceeds goal with safety margin
    2. Within all resource constraints
    3. Best risk-adjusted expected value
    4. Opens strategic growth channel
    5. Acceptable tradeoffs
    6. No approval delays

ALTERNATIVES CONSIDERED AND WHY NOT SELECTED:

Conservative (Win-back + Upsell + Weekend):
  Why Not:
    - No safety margin (single point of failure)
    - Misses strategic TikTok opportunity
    - Lower expected value (1.275B vs 1.4B)
    - No exploration of new channels
  
  When Would Choose:
    - If team capacity was truly maxed
    - If risk tolerance was extremely low
    - If TikTok was not available

Aggressive (All 5 including Referral):
  Why Not:
    - Exceeds budget (needs approval → delay)
    - Team overload (26% vs 20% capacity)
    - Lower confidence due to execution risk
    - Worse risk-adjusted value (1.2B vs 1.4B)
  
  When Would Choose:
    - If budget limit was 200M
    - If team capacity was 30%
    - If timeline was 6 weeks

TikTok Excluded (Only Top 3):
  Why Not:
    - Misses 700% ROI opportunity
    - No new channel learning
    - Lower strategic value
    - Same safety margin concern as Conservative
  
  When Would Choose:
    - If TikTok was blocked by policy
    - If CMO explicitly rejected
    - If team had no digital marketing skill

RECOMMENDATION:

Option: Balanced Strategy (Top 4 with TikTok Pilot)

Confidence: 80%

Rationale:
  This is the only option that simultaneously:
    ✅ Exceeds revenue goal with buffer (1.7B vs 1.5B)
    ✅ Fits within budget constraint (135M vs 150M)
    ✅ Respects team capacity (21% ≈ 20%)
    ✅ Meets timeline (4 weeks, phased)
    ✅ Opens strategic growth option (TikTok)
    ✅ Maximizes risk-adjusted value (1.4B expected)
    ✅ No approval delays
  
  The logic is sound, evidence-based, and defensible.
```


---

### Phase 7: Executive Simulation

**Purpose**: Predict what HAPPENS if we execute the plan

```typescript
interface ExecutiveSimulation {
  scenarios: {
    name: string;
    probability: number;
    assumptions: string[];
    outcomes: {
      metric: string;
      value: number;
    }[];
    narrative: string;
  }[];
  
  expectedValue: number;
  
  probabilityOfSuccess: {
    hitGoal: number;        // P(revenue >= 1.5B)
    exceed20pct: number;    // P(revenue >= 1.8B)
    doubleGoal: number;     // P(revenue >= 3B)
    missGoal: number;       // P(revenue < 1.5B)
  };
  
  sensitivityAnalysis: {
    variable: string;
    impact: string;
  }[];
}
```

**Example**:

```
EXECUTIVE SIMULATION:

SCENARIO 1: Optimistic (20% probability)
  "Everything goes better than expected"
  
  Assumptions:
    - Win-back conversion: 35% (vs 30% baseline)
    - Upsell adoption: 15% (vs 12% baseline)
    - Weekend utilization: 95% (vs 85% baseline)
    - TikTok works well: ROAS = 5
  
  Outcomes:
    Win-back: 700M (vs 600M baseline) +17%
    Upsell: 625M (vs 500M baseline) +25%
    Weekend: 475M (vs 400M baseline) +19%
    TikTok: 500M (vs 200M baseline) +150%
    ────────────────────────────────────
    Total: 2.3B ✅✅ (+53% above goal)
  
  KPIs:
    Revenue: 7.3B (vs 6.5B goal)
    Customers: 584 (vs 400 current)
    ROAS: 17:1 (excellent)
  
  Narrative:
    "Win-back email hits perfect timing and message.
     Staff excels at upselling with new training.
     Weekend promotion goes viral.
     TikTok algorithm favors our content.
     Revenue exceeds expectations by 53%."
  
  Probability: 20%
  Risk: None (all upside)

SCENARIO 2: Realistic (60% probability)
  "Things go as planned"
  
  Assumptions:
    - Win-back conversion: 30% (baseline)
    - Upsell adoption: 12% (baseline)
    - Weekend utilization: 85% (baseline)
    - TikTok works: ROAS = 3
  
  Outcomes:
    Win-back: 600M (baseline)
    Upsell: 500M (baseline)
    Weekend: 400M (baseline)
    TikTok: 200M (baseline)
    ────────────────────────────────────
    Total: 1.7B ✅ (+13% above goal)
  
  KPIs:
    Revenue: 6.7B (vs 6.5B goal)
    Customers: 498 (vs 400 current)
    ROAS: 12.6:1 (good)
  
  Narrative:
    "All initiatives perform as modeled.
     Win-back reactivates 30% as expected.
     Upselling works with training.
     Weekend ads fill 80% of slots.
     TikTok pilot validates channel.
     Revenue exceeds goal comfortably."
  
  Probability: 60%
  Risk: Low

SCENARIO 3: Pessimistic (20% probability)
  "Things go wrong"
  
  Assumptions:
    - Win-back conversion: 20% (vs 30% baseline)
    - Upsell adoption: 8% (vs 12% baseline)
    - Weekend utilization: 70% (vs 85% baseline)
    - TikTok fails: ROAS = 1 (break-even)
  
  Outcomes:
    Win-back: 400M (vs 600M) -33% ❌
    Upsell: 333M (vs 500M) -33% ❌
    Weekend: 350M (vs 400M) -13% ⚠️
    TikTok: 50M (vs 200M) -75% ❌
    ────────────────────────────────────
    Total: 1.13B ⚠️ (-25% below goal)
  
  KPIs:
    Revenue: 6.13B (vs 6.5B goal) MISS
    Customers: 440 (growth but below target)
    ROAS: 8.4:1 (acceptable but disappointing)
  
  What Went Wrong:
    - Win-back: Offer not compelling, timing off
    - Upsell: Staff resistance, customers hesitant
    - Weekend: Weather impact, competition
    - TikTok: Algorithm changes, poor content fit
  
  Narrative:
    "Multiple initiatives underperform.
     Win-back emails have low open rates.
     Customers reject upsell offers.
     Rainy weekends hurt bookings.
     TikTok content doesn't resonate.
     Revenue misses goal by 25%."
  
  Probability: 20%
  Risk: Goal miss, but still +13% growth

EXPECTED VALUE CALCULATION:

EV = (0.20 × 2.3B) + (0.60 × 1.7B) + (0.20 × 1.13B)
   = 460M + 1.02B + 226M
   = 1.706B

Expected Revenue: 6.7B (vs 6.5B goal) ✅
Expected Growth: +34% (vs 30% goal) ✅
Confidence to Hit Goal: 80%

PROBABILITY OF SUCCESS:

P(Revenue >= 1.5B goal):
  Optimistic: 100% × 20% = 20%
  Realistic: 100% × 60% = 60%
  Pessimistic: 0% × 20% = 0%
  Total: 80% ✅

P(Revenue >= 1.8B, 20% above goal):
  Optimistic: 100% × 20% = 20%
  Realistic: 0% × 60% = 0%
  Pessimistic: 0% × 20% = 0%
  Total: 20%

P(Revenue >= 3B, double goal):
  0% (not in any scenario)

P(Revenue < 1.5B, miss goal):
  20% (pessimistic only)

Confidence Level: 80% to hit or exceed goal ✅

SENSITIVITY ANALYSIS:

"If X changes by 10%, what happens to total revenue?"

┌─────────────────────────────────────────────────┐
│ Variable               Impact on Total Revenue  │
├─────────────────────────────────────────────────┤
│ Win-back Conversion    ±200M (±12%) 🔴 HIGH    │
│ Upsell Rate            ±167M (±10%) 🔴 HIGH    │
│ Weekend Utilization    ±40M (±2%) 🟡 MEDIUM    │
│ TikTok ROAS            ±20M (±1%) 🟢 LOW       │
│ Customer Churn         ±150M (±9%) 🔴 HIGH     │
│ Avg Transaction Value  ±170M (±10%) 🔴 HIGH    │
│ Marketing Budget       ±80M (±5%) 🟡 MEDIUM    │
└─────────────────────────────────────────────────┘

KEY INSIGHTS:

1. Win-back is HIGHEST IMPACT variable (±12%)
   → Must nail email copy, offer, and timing
   → Mitigation: A/B test 3 email variants

2. Upsell Rate is SECOND HIGHEST (±10%)
   → Staff training is critical
   → Mitigation: Role-play, incentives, tracking

3. TikTok is LOWEST IMPACT (±1%)
   → Pilot approach is smart (limits downside)
   → Even if fails, doesn't jeopardize goal
   → Upside: If works, massive future potential

4. Goal Achievement is ROBUST:
   → Need 2+ major failures to miss goal
   → 80% confidence is appropriate

RISK TRIGGERS (What to Watch):

Week 1 Red Flags:
  🚨 Win-back email open rate < 20% (vs 30% expected)
     Action: Resend with different subject line
  
  🚨 Upsell training attendance < 80%
     Action: Make training mandatory

Week 2 Red Flags:
  🚨 Win-back conversion < 15% (vs 30% expected)
     Action: Increase incentive, extend offer
  
  🚨 Weekend booking rate < 60% (vs 85% expected)
     Action: Boost ad spend, add urgency

Week 3 Red Flags:
  🚨 TikTok CTR < 1% (vs 2% expected)
     Action: Pivot content strategy or pause
  
  🚨 Cumulative revenue < 400M
     Action: Escalate to CEO, discuss backup plan

Week 4 Red Flags:
  🚨 Projected total < 1.3B
     Action: Emergency discount campaign

MONTE CARLO SIMULATION (1000 runs):

Distribution of Outcomes:
  < 1.0B: ████ 5%
  1.0-1.2B: ████████ 10%
  1.2-1.5B: ██████ 5%
  1.5-1.7B: ████████████████████████████████ 40% ← Mode
  1.7-2.0B: ████████████████████ 25%
  2.0-2.3B: ████████████ 12%
  > 2.3B: ██ 3%

Median: 1.68B ✅
Mean: 1.71B ✅
90th Percentile: 2.1B
10th Percentile: 1.2B ⚠️

Probability Distribution:
  P(goal achieved): 80% ✅
  P(exceed 20%): 40%
  P(exceed 50%): 15%
  P(miss goal): 20%

Confidence: HIGH (80%) ✅

CONCLUSION:

The Balanced Strategy has:
  ✅ 80% confidence to hit goal
  ✅ Expected value 13% above goal (1.7B vs 1.5B)
  ✅ Robust to single failures (need 2+ to miss)
  ✅ Clear risk triggers for mid-course correction
  ✅ Low downside (TikTok capped at 15M)
  ✅ High upside potential (20% chance of 2.3B+)

Recommendation: PROCEED with monitoring plan
```


---

### Phase 8: KPI Decomposition

**Purpose**: Define HOW we measure success at every level

```typescript
interface KPIDecomposition {
  primaryGoal: {
    metric: string;
    target: number;
    baseline: number;
    timeframe: string;
  };
  
  kpiTree: {
    level: number;
    metric: string;
    target: number;
    owner: string;
    formula: string;
    parents: string[];
    children: string[];
  }[];
  
  leadingIndicators: {
    metric: string;
    checkFrequency: string;
    threshold: number;
    actionIfMiss: string;
  }[];
  
  attributionModel: {
    initiative: string;
    contribution: number; // percentage
    measurement: string;
  }[];
}
```

**Example**:

```
KPI TREE DECOMPOSITION:

LEVEL 0: NORTH STAR (CEO)
┌─────────────────────────────────────────┐
│ Spa Revenue (August 2026)              │
│ Target: 6.5B (+30%)                    │
│ Baseline: 5B (July 2026)               │
│ Owner: CEO                              │
│ Timeframe: 4 weeks                      │
└─────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┐
    │             │             │              │
LEVEL 1: STRATEGIC INITIATIVES (COO)
┌──────────────┐ ┌───────────┐ ┌────────────┐ ┌─────────────┐
│ Win-back     │ │ Upsell    │ │ Weekend    │ │ TikTok      │
│ +600M (40%) │ │ +500M(33%)│ │ +400M(27%) │ │ +200M(13%) │
│ Owner: CMO   │ │ Owner:CSO │ │ Owner: CMO │ │ Owner: CMO  │
└──────────────┘ └───────────┘ └────────────┘ └─────────────┘

LEVEL 2: TACTICAL METRICS (Managers)

Win-back Initiative (+600M):
┌────────────────────────────────────────────────┐
│ Reactivated Customers                          │
│ Target: 66 customers                           │
│ Formula: 220 churned × 30% conversion          │
│ Owner: Email Marketing Manager                 │
├────────────────────────────────────────────────┤
│ ├─ Email Open Rate: >30%                       │
│ ├─ Email CTR: >8%                              │
│ ├─ Landing Page Conversion: >15%               │
│ ├─ Offer Redemption: >90%                      │
│ └─ Lifetime Value per Customer: 9.1M           │
└────────────────────────────────────────────────┘

Upsell Initiative (+500M):
┌────────────────────────────────────────────────┐
│ Premium Customers                              │
│ Target: 48 customers (12% of 400)              │
│ Formula: 400 active × 12% upsell rate          │
│ Owner: Sales Manager                           │
├────────────────────────────────────────────────┤
│ ├─ Staff Training Completion: 100%             │
│ ├─ Upsell Attempts per Staff: >5/day           │
│ ├─ Upsell Conversion Rate: 12%                 │
│ ├─ Premium Package Avg Value: 22.5M            │
│ └─ Customer Satisfaction: >4.5/5               │
└────────────────────────────────────────────────┘

Weekend Initiative (+400M):
┌────────────────────────────────────────────────┐
│ Weekend Bookings                               │
│ Target: +32 bookings (60% → 85%)               │
│ Formula: 40 unused slots × 80% fill            │
│ Owner: Operations Manager                      │
├────────────────────────────────────────────────┤
│ ├─ Ad Impressions: >50K                        │
│ ├─ Ad CTR: >3%                                 │
│ ├─ Booking Conversion: >25%                    │
│ ├─ Weekend Utilization: 85%                    │
│ └─ ROAS: >10:1                                 │
└────────────────────────────────────────────────┘

TikTok Initiative (+200M):
┌────────────────────────────────────────────────┐
│ TikTok Customers                               │
│ Target: 16 customers (pilot)                   │
│ Formula: 100K views × 2% CTR × 2% conv × 40%  │
│ Owner: Digital Marketing Manager               │
├────────────────────────────────────────────────┤
│ ├─ Video Views: >100K                          │
│ ├─ Engagement Rate: >5%                        │
│ ├─ Profile Visits: >2K                         │
│ ├─ Click-through Rate: >2%                     │
│ ├─ Lead Form Submissions: >40                  │
│ └─ Conversion Rate: >40%                       │
└────────────────────────────────────────────────┘

LEVEL 3: OPERATIONAL METRICS (Specialists)

Email Campaign (Win-back):
  - Subject Line A/B Test Winner: TBD
  - Send Time Optimization: 9 AM Tuesday
  - Personalization: First name + last visit
  - Offer: 20% discount + free upgrade
  - Follow-up Sequence: Day 1, 3, 7
  - Unsubscribe Rate: <1%

Sales Training (Upsell):
  - Training Hours: 8 hours/staff
  - Role-play Sessions: 3 per staff
  - Certification Rate: 100%
  - Quiz Score: >85%
  - Shadow Sessions: 2 per staff
  - Commission Structure: 5% of premium delta

Weekend Ads (Weekend):
  - Ad Spend: 20M
  - Platforms: Facebook + Instagram
  - Audience: 25-45F, high income, 5km radius
  - Creative Variants: 3 (A/B test)
  - Landing Page Load Time: <2s
  - Booking Flow Completion: >60%

TikTok Content (TikTok):
  - Video Production: 12 videos (3/week)
  - Content Mix: 40% education, 30% transformation, 30% promo
  - Hashtags: #spalife #wellness #selfcare + trending
  - Posting Times: 7 PM daily
  - Engagement Response Time: <1 hour
  - Creator Collaboration: 2 micro-influencers

LEADING INDICATORS (Early Warning System):

Week 1 (Setup Phase):
  ✅ Win-back email list cleaned: 220 contacts
  ✅ Upsell training scheduled: 10 staff enrolled
  ✅ Weekend ad creative approved: 3 variants
  ✅ TikTok account verified: Business account live
  
  🚨 Red Flag Threshold:
     - Email list < 200 → clean more aggressively
     - Training attendance < 8/10 → make mandatory
     - Ad approval delayed → escalate to CEO

Week 2 (Launch Phase):
  📊 Win-back open rate: Track daily, target >30%
  📊 Upsell training completion: Target 100% by Friday
  📊 Weekend booking rate: Track hourly, target +5/day
  📊 TikTok video views: Track daily, target 10K+/video
  
  🚨 Red Flag Threshold:
     - Open rate < 20% → resend with new subject
     - Training < 80% complete → CEO intervention
     - Bookings < 3/day → increase ad spend
     - Views < 5K/video → pivot content strategy

Week 3 (Optimization Phase):
  📊 Win-back conversion: Target 30%, acceptable 20%
  📊 Upsell conversion: Target 12%, acceptable 8%
  📊 Weekend utilization: Target 85%, acceptable 75%
  📊 TikTok CTR: Target 2%, acceptable 1.5%
  
  🚨 Red Flag Threshold:
     - Conversion < 15% → improve offer
     - Upsell < 6% → add incentives
     - Utilization < 70% → emergency promotion
     - CTR < 1% → stop TikTok, reallocate budget

Week 4 (Scale Phase):
  📊 Total revenue: Target 1.5B+, acceptable 1.3B+
  📊 Customer acquisition cost: Target <500K, acceptable <800K
  📊 ROAS: Target >10:1, acceptable >8:1
  📊 Customer satisfaction: Target >4.5/5
  
  🚨 Red Flag Threshold:
     - Revenue < 1.2B → emergency discount campaign
     - CAC > 1M → pause underperforming channel
     - ROAS < 6:1 → review all ads
     - Satisfaction < 4.0 → quality review

ATTRIBUTION MODEL:

How do we know which initiative drove which revenue?

Method 1: Direct Attribution (where possible)
  - Win-back: Customers tagged "win-back" in CRM
  - TikTok: UTM source = TikTok
  - Weekend: Booking timestamp = Sat/Sun
  
Method 2: Incremental Attribution (baseline comparison)
  - Upsell: Compare upsell rate Aug vs July
    If July = 0%, Aug = 12% → all incremental
  
Method 3: Statistical Attribution (for overlap)
  - If customer came from win-back AND booked weekend
    Split credit: 50% win-back, 50% weekend
  
Method 4: Last-touch Attribution (default)
  - If ambiguous, credit the last campaign interaction

Expected Attribution:
  Win-back: 35% of total (direct CRM tag)
  Upsell: 30% of total (incremental sales tracking)
  Weekend: 20% of total (timestamp + promo code)
  TikTok: 12% of total (UTM tracking)
  Organic: 3% of total (no attribution)

KPI DASHBOARD (Real-time Monitoring):

┌────────────────────────────────────────────────────────────┐
│ GOAL: 6.5B Revenue (Target) | 5B Baseline                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Week 1  [██████████──────────────] 300M / 1.5B (20%)     │
│ Week 2  [████████████████────────] 700M / 1.5B (47%)     │
│ Week 3  [████████████████████────] 1.1B / 1.5B (73%)     │
│ Week 4  [████████████████████████] 1.6B / 1.5B (107%) ✅ │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Initiative  | Target  | Actual  | Progress | Status       │
├────────────────────────────────────────────────────────────┤
│ Win-back    | 600M    | 550M    | 92%      | 🟡 On Track  │
│ Upsell      | 500M    | 480M    | 96%      | 🟢 Excellent │
│ Weekend     | 400M    | 420M    | 105%     | 🟢 Excellent │
│ TikTok      | 200M    | 150M    | 75%      | 🟡 Acceptable│
└────────────────────────────────────────────────────────────┘

SUMMARY:

Primary Goal: +1.5B revenue ✅
  └─ Win-back: +600M (40%)
       └─ Reactivated: 66 customers
            └─ Open 30%, CTR 8%, Convert 15%
  └─ Upsell: +500M (33%)
       └─ Premium: 48 customers
            └─ Training 100%, Attempts 5/day, Convert 12%
  └─ Weekend: +400M (27%)
       └─ Bookings: +32
            └─ Impressions 50K, CTR 3%, Convert 25%
  └─ TikTok: +200M (13%)
       └─ Customers: 16
            └─ Views 100K, Engagement 5%, CTR 2%

Leading Indicators: Week 1-4 checkpoints
Attribution Model: Direct + Incremental + Last-touch
Dashboard: Real-time progress tracking
```


---

### Phase 9: Resource Allocation

**Purpose**: Distribute budget, people, and time optimally

```typescript
interface ResourceAllocation {
  budget: {
    total: number;
    byInitiative: {
      initiative: string;
      amount: number;
      percentage: number;
      breakdown: Record<string, number>;
    }[];
    buffer: number;
  };
  
  workforce: {
    total: number; // FTE
    byInitiative: {
      initiative: string;
      ftePct: number;
      roles: {
        role: string;
        ftePct: number;
        people: string[];
      }[];
    }[];
  };
  
  timeline: {
    phase: string;
    weeks: string;
    milestones: {
      initiative: string;
      milestone: string;
      deadline: string;
      dependencies: string[];
    }[];
  }[];
  
  dependencies: {
    initiative: string;
    dependsOn: string[];
    blockingFor: string[];
  }[];
}
```

**Example**:

```
BUDGET ALLOCATION:

Total Available: 150M
Total Planned: 135M (90%)
Buffer: 15M (10%)

By Initiative:
┌──────────────────────────────────────────────────────┐
│ Initiative   │ Budget  │ % of Total │ ROI  │ Priority│
├──────────────────────────────────────────────────────┤
│ Win-back     │ 50M     │ 33%        │1200% │ #1      │
│ Upsell       │ 40M     │ 27%        │1250% │ #2      │
│ Weekend      │ 30M     │ 20%        │1333% │ #3      │
│ TikTok       │ 15M     │ 10%        │ 700% │ #4      │
│ Buffer       │ 15M     │ 10%        │  -   │ Reserve │
├──────────────────────────────────────────────────────┤
│ TOTAL        │ 150M    │ 100%       │1150% │ Avg     │
└──────────────────────────────────────────────────────┘

Win-back Budget Breakdown (50M):
  Email Platform: 5M (10%)
    - SendGrid Pro: 3M
    - Email templates: 2M
  
  Creative Assets: 10M (20%)
    - Copywriter: 3M
    - Designer: 4M
    - Photography: 3M
  
  Incentives: 35M (70%)
    - 20% discount: 25M (assumed redemption)
    - Free upgrade value: 10M

Upsell Budget Breakdown (40M):
  Training: 15M (37.5%)
    - Trainer fees: 8M
    - Materials: 3M
    - Certification: 2M
    - Role-play coaching: 2M
  
  Marketing Materials: 10M (25%)
    - Premium package brochures: 4M
    - Digital assets: 3M
    - In-spa signage: 3M
  
  System Setup: 15M (37.5%)
    - CRM customization: 5M
    - Commission tracking: 5M
    - Sales dashboard: 5M

Weekend Budget Breakdown (30M):
  Advertising: 20M (67%)
    - Facebook Ads: 12M
    - Instagram Ads: 8M
  
  Creative Production: 5M (17%)
    - Video ads: 3M
    - Image ads: 2M
  
  Staff Incentives: 5M (17%)
    - Weekend overtime premium: 3M
    - Performance bonuses: 2M

TikTok Budget Breakdown (15M):
  Content Creation: 7M (47%)
    - Video production: 4M (12 videos)
    - Creator fees: 2M
    - Props/equipment: 1M
  
  Advertising: 8M (53%)
    - TikTok Ads: 6M
    - Influencer partnerships: 2M

Buffer Reserve (15M):
  Purpose: Handle underperformance or opportunities
  Trigger Conditions:
    - If Week 3 revenue < 900M → deploy 10M boost
    - If TikTok works well → scale with 15M
    - If all initiatives struggling → emergency campaign
  
  Decision Authority: CEO approval required

WORKFORCE ALLOCATION:

Total Available Capacity: 20% (2 FTE equivalent)
Total Planned: 21% (slightly over, acceptable for 1 month)

By Initiative:
┌────────────────────────────────────────────────────────┐
│ Initiative   │ FTE %  │ Key Roles                      │
├────────────────────────────────────────────────────────┤
│ Win-back     │ 5%     │ Email Marketer (3%)            │
│              │        │ Designer (2%)                  │
│              │        │                                │
│ Upsell       │ 8%     │ Sales Trainer (4%)             │
│              │        │ Sales Team (10 people × 0.4%)  │
│              │        │                                │
│ Weekend      │ 3%     │ Ads Manager (2%)               │
│              │        │ Operations (1%)                │
│              │        │                                │
│ TikTok       │ 5%     │ Video Creator (3%)             │
│              │        │ Social Media Manager (2%)      │
├────────────────────────────────────────────────────────┤
│ TOTAL        │ 21%    │ 13 people involved             │
└────────────────────────────────────────────────────────┘

Detailed Workforce Plan:

Win-back Team (5% capacity):
  - Email Marketing Manager (30% time)
    Tasks: Campaign setup, segmentation, scheduling
    Timeline: Week 1-4
  
  - Copywriter (20% time)
    Tasks: Email copy, landing page, offer design
    Timeline: Week 1 only
  
  - Designer (20% time)
    Tasks: Email templates, landing page, visuals
    Timeline: Week 1 only

Upsell Team (8% capacity):
  - Sales Trainer (40% time)
    Tasks: Training design, delivery, certification
    Timeline: Week 1-2 (full-time), Week 3-4 (support)
  
  - Sales Manager (20% time)
    Tasks: Program oversight, tracking, coaching
    Timeline: Week 1-4
  
  - 10 Sales Staff (4% each = 0.4% total)
    Tasks: Training (Week 2), upselling (Week 3-4)
    Timeline: 8 hours training + ongoing selling

Weekend Team (3% capacity):
  - Ads Manager (20% time)
    Tasks: Campaign setup, optimization, monitoring
    Timeline: Week 1-4
  
  - Operations Manager (10% time)
    Tasks: Weekend staffing, capacity planning
    Timeline: Week 1 (setup), Week 2-4 (monitoring)

TikTok Team (5% capacity):
  - Video Creator (30% time)
    Tasks: 12 videos production (3/week)
    Timeline: Week 1-4
  
  - Social Media Manager (20% time)
    Tasks: Account setup, posting, engagement, ads
    Timeline: Week 1-4

Management Oversight:
  - CMO (5% time)
    Oversees: Win-back, Weekend, TikTok
    Weekly reviews: Monday 9 AM
  
  - CSO (Chief Sales Officer) (5% time)
    Oversees: Upsell
    Weekly reviews: Tuesday 9 AM
  
  - CEO (2% time)
    Oversees: Overall progress
    Weekly reviews: Friday 2 PM

TIMELINE & MILESTONES:

WEEK 1: SETUP PHASE (Days 1-7)
┌────────────────────────────────────────────────────────┐
│ Mon 1 │ • Kickoff meeting (all teams)                  │
│       │ • Win-back: Clean email list                   │
│       │ • Upsell: Design training program              │
│ ───────────────────────────────────────────────────────│
│ Tue 2 │ • Win-back: Write email copy                   │
│       │ • Weekend: Create ad creatives                 │
│       │ • TikTok: Set up business account              │
│ ───────────────────────────────────────────────────────│
│ Wed 3 │ • Win-back: Design landing page                │
│       │ • Upsell: Schedule training sessions           │
│       │ • TikTok: Produce first 3 videos               │
│ ───────────────────────────────────────────────────────│
│ Thu 4 │ • Win-back: A/B test setup                     │
│       │ • Weekend: Launch ads (soft launch)            │
│       │ • Upsell: Print materials                      │
│ ───────────────────────────────────────────────────────│
│ Fri 5 │ • Win-back: LAUNCH emails (9 AM)              │
│       │ • Weekend: Optimize ads based on data          │
│       │ • CEO Review: Progress check                   │
│ ───────────────────────────────────────────────────────│
│ Sat 6 │ • Weekend: Monitor bookings real-time          │
│       │ • TikTok: Post video #1                        │
│ ───────────────────────────────────────────────────────│
│ Sun 7 │ • Win-back: Analyze open/click rates           │
│       │ • Weekend: Adjust for next weekend             │
└────────────────────────────────────────────────────────┘

Milestones Week 1:
  ✅ Win-back emails sent: 220 contacts
  ✅ Weekend ads live: 3 variants
  ✅ Upsell training scheduled: 10 staff
  ✅ TikTok account verified: Business account

Key Dependencies Week 1:
  - Win-back email → depends on list cleaning (Day 1)
  - TikTok ads → depends on account approval (Day 3)
  - Upsell training → depends on materials (Day 4)

WEEK 2: LAUNCH & LEARN PHASE (Days 8-14)
┌────────────────────────────────────────────────────────┐
│ Mon 8 │ • Win-back: Follow-up email sequence           │
│       │ • Upsell: Training Day 1 (8 hours)             │
│       │ • TikTok: Analyze video #1 performance         │
│ ───────────────────────────────────────────────────────│
│ Tue 9 │ • Upsell: Training Day 2 (8 hours)             │
│       │ • Win-back: Check conversion rate              │
│       │ • TikTok: Post videos #2, #3                   │
│ ───────────────────────────────────────────────────────│
│ Wed 10│ • Upsell: Certification exam                   │
│       │ • Win-back: Optimize offer if needed           │
│       │ • TikTok: Launch TikTok Ads (pilot)            │
│ ───────────────────────────────────────────────────────│
│ Thu 11│ • Upsell: Role-play coaching                   │
│       │ • Weekend: Scale ads (increase budget)         │
│ ───────────────────────────────────────────────────────│
│ Fri 12│ • Win-back: Final follow-up email              │
│       │ • Upsell: Training complete ✅                 │
│       │ • CEO Review: Week 2 results                   │
│ ───────────────────────────────────────────────────────│
│Sat 13 │ • Weekend: Peak performance expected           │
│       │ • TikTok: Engagement monitoring                │
│ ───────────────────────────────────────────────────────│
│Sun 14 │ • Win-back: Calculate Week 2 revenue           │
│       │ • Upsell: Prepare for Monday launch            │
└────────────────────────────────────────────────────────┘

Milestones Week 2:
  ✅ Win-back conversion: >20% (target 30%)
  ✅ Upsell training: 100% completion
  ✅ Weekend bookings: +15 (halfway to +32 goal)
  ✅ TikTok engagement: >3% (target 5%)

Key Dependencies Week 2:
  - Upsell launch → depends on training completion (Fri 12)
  - TikTok scale → depends on pilot results (Wed 10)
  - Weekend optimization → depends on Week 1 data (Mon 8)

WEEK 3: OPTIMIZE & SCALE PHASE (Days 15-21)
┌────────────────────────────────────────────────────────┐
│ Mon 15│ • Upsell: GO LIVE (sales team starts)          │
│       │ • Win-back: Nurture converted customers        │
│       │ • TikTok: Scale if CTR >1.5%                   │
│ ───────────────────────────────────────────────────────│
│ Tue 16│ • Upsell: Track first day conversions          │
│       │ • Weekend: Prepare Week 3 campaign             │
│ ───────────────────────────────────────────────────────│
│ Wed 17│ • Upsell: Coaching session (address issues)    │
│       │ • TikTok: Pivot content if not working         │
│ ───────────────────────────────────────────────────────│
│ Thu 18│ • Win-back: Re-engage non-openers              │
│       │ • Upsell: Celebrate early wins (motivation)    │
│ ───────────────────────────────────────────────────────│
│ Fri 19│ • CEO Review: Week 3 progress                  │
│       │ • GO/NO-GO decision on TikTok scale            │
│ ───────────────────────────────────────────────────────│
│Sat 20 │ • Weekend: Third weekend campaign              │
│       │ • All: Monitor cumulative revenue              │
│ ───────────────────────────────────────────────────────│
│Sun 21 │ • Assessment: Are we on track for 1.5B?        │
│       │ • Deploy buffer budget if needed               │
└────────────────────────────────────────────────────────┘

Milestones Week 3:
  ✅ Win-back total: 400M+ (target 600M, 67% done)
  ✅ Upsell conversions: 30+ (target 48, 63% done)
  ✅ Weekend total: 270M+ (target 400M, 68% done)
  ✅ TikTok leads: 25+ (target 40, 63% done)

🚨 RED FLAG CHECK:
  IF cumulative revenue < 900M by Sun 21:
    → Emergency CEO meeting
    → Deploy 10M buffer for Week 4 boost
    → Consider emergency discount campaign

WEEK 4: FINAL PUSH PHASE (Days 22-28)
┌────────────────────────────────────────────────────────┐
│ Mon 22│ • All: Final push messaging                    │
│       │ • Upsell: Intensify efforts                    │
│       │ • TikTok: Final ad spend (if working)          │
│ ───────────────────────────────────────────────────────│
│ Tue 23│ • Win-back: Last chance offer (urgency)        │
│       │ • Weekend: Prepare final weekend               │
│ ───────────────────────────────────────────────────────│
│ Wed 24│ • Upsell: Mid-week conversion push             │
│       │ • Monitor: Project final numbers               │
│ ───────────────────────────────────────────────────────│
│ Thu 25│ • Weekend: Launch final weekend campaign       │
│       │ • All: Optimize based on real-time data        │
│ ───────────────────────────────────────────────────────│
│ Fri 26│ • CEO Review: Near-final numbers               │
│       │ • Win-back: Close-out emails                   │
│ ───────────────────────────────────────────────────────│
│Sat 27 │ • Weekend: FINAL WEEKEND PUSH                  │
│       │ • All teams: All-hands-on-deck                 │
│ ───────────────────────────────────────────────────────│
│Sun 28 │ • FINAL COUNT: Total revenue                   │
│       │ • Success celebration or debrief               │
│       │ • Lessons learned documentation                │
└────────────────────────────────────────────────────────┘

Milestones Week 4:
  ✅ Win-back: 600M total (100% of target)
  ✅ Upsell: 480M+ (96%+ of target)
  ✅ Weekend: 400M+ (100%+ of target)
  ✅ TikTok: 150M+ (75%+ of target)
  ✅ TOTAL: 1.63B+ (109%+ of goal) ✅

DEPENDENCIES MAP:

Win-back → Weekend: No dependency (parallel)
Win-back → Upsell: No dependency (parallel)
Win-back → TikTok: No dependency (parallel)

Upsell → Weekend: No dependency (parallel)
Upsell → TikTok: No dependency (parallel)

Weekend → TikTok: No dependency (parallel)

Critical Path: Upsell (longest setup time = 2 weeks training)
  → Start Upsell Week 1 to have it live by Week 3

Parallel Execution:
  - Win-back can launch Week 1 Day 5
  - Weekend can launch Week 1 Day 4
  - TikTok can launch Week 1 Day 6
  - Upsell launches Week 3 Day 1

No blocking dependencies → all can proceed simultaneously ✅

RESOURCE CONFLICTS & RESOLUTION:

Potential Conflict #1: Designer
  Needed by: Win-back (Week 1), Weekend (Week 1), TikTok (Week 1-4)
  Resolution: 
    - Win-back: Priority #1 (Days 1-3)
    - Weekend: Priority #2 (Days 4-5)
    - TikTok: Video creator handles (separate person)

Potential Conflict #2: Budget Buffer
  Needed by: Emergency response OR TikTok scaling
  Resolution:
    - Week 3 decision point
    - If on track → scale TikTok (15M)
    - If behind → emergency campaign (10M)
    - CEO approval required

Potential Conflict #3: Sales Team Attention
  Needed by: Regular customers + Upsell training + Win-back customers
  Resolution:
    - Training: Week 2 only (block calendar)
    - Win-back customers: Staggered return (spread over 4 weeks)
    - Regular customers: Maintain service (upsell is add-on, not replacement)

SUMMARY:

Budget: 135M allocated, 15M buffer
Workforce: 21% capacity (13 people, acceptable for 1 month)
Timeline: 4 weeks, phased rollout, no blocking dependencies
Critical Path: Upsell training (2 weeks) → start immediately
Conflicts: Resolved via prioritization and sequencing
Flexibility: 15M buffer for emergencies or opportunities
```


---

### Phase 10: Executive Approval Request

**Purpose**: Present to CEO for GO/NO-GO decision

```typescript
interface ExecutiveApproval {
  executiveSummary: {
    goal: string;
    recommendation: string;
    expectedResult: string;
    confidence: number;
    investment: number;
    roi: number;
  };
  
  rationale: {
    problemStatement: string;
    solutionApproach: string;
    whyThisOption: string;
    evidenceBase: string[];
  };
  
  riskAssessment: {
    risks: {
      risk: string;
      probability: number;
      impact: string;
      mitigation: string;
    }[];
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
  
  alternativesConsidered: {
    option: string;
    pros: string[];
    cons: string[];
    whyNotSelected: string;
  }[];
  
  approvalRequest: {
    approveStrategy: boolean;
    approveBudget: number;
    approveTimeline: string;
    approveRiskLevel: string;
    specialApprovals: string[];
  };
  
  nextSteps: {
    ifApproved: string[];
    timeline: string;
    firstCheckpoint: string;
  };
}
```

**Example**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
             EXECUTIVE APPROVAL REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO:       CEO
FROM:     AI COO (Executive Capability)
DATE:     August 1, 2026
RE:       Revenue Growth Strategy - August 2026
STATUS:   AWAITING APPROVAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY

Goal:
  Increase spa revenue by 30% (+1.5B VND) in August 2026
  From: 5B baseline (July 2026)
  To: 6.5B target

Recommendation:
  Balanced Growth Strategy
  4 simultaneous initiatives (Win-back, Upsell, Weekend, TikTok pilot)

Expected Result:
  1.7B additional revenue (113% of goal)
  Total August revenue: 6.7B
  Growth: 34% (vs 30% goal)

Confidence:
  80% probability to hit or exceed 1.5B goal
  Expected value: 1.706B (risk-adjusted)

Investment:
  135M (90% of 150M approved budget)
  15M buffer reserved for contingencies

ROI:
  1162% return on investment
  For every 1M invested → 11.6M return

Risk Level:
  MEDIUM (acceptable for growth initiative)
  Mitigated through phased approach and monitoring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RATIONALE

Problem Statement:
  
  Revenue is flat despite strong customer acquisition.
  
  Root Causes (Evidence-Based):
    1. Customer retention broken (45% vs 60% industry)
       → 220 customers churning monthly
       → 33B/year revenue leak
    
    2. Zero upselling culture
       → Flat 12.5M transaction value for 2 years
       → 4.8B/year opportunity cost
    
    3. Weekend capacity underutilized (60% vs 85% optimal)
       → 6B/year wasted capacity
  
  Impact: Leaving 43.8B/year on the table ❌

Solution Approach:
  
  Instead of only acquiring new customers (which we do well),
  we SIMULTANEOUSLY:
    1. Win back churned customers (low-hanging fruit)
    2. Monetize existing customers better (upsell)
    3. Fill unused capacity (weekend promotion)
    4. Test new acquisition channel (TikTok pilot)
  
  This is a BALANCED portfolio:
    - 75% proven tactics (Win-back, Upsell, Weekend)
    - 25% strategic exploration (TikTok)

Why This Option:
  
  We evaluated 20 possible approaches.
  
  We considered 3 strategic options:
    - Conservative (Top 3 only): Hits goal exactly, no margin
    - Balanced (Top 4): Exceeds goal, explores TikTok
    - Aggressive (All 5): Budget overrun, execution risk
  
  Balanced wins on:
    ✅ Best risk-adjusted expected value (1.4B vs 1.275B/1.2B)
    ✅ Safety margin (200M buffer if one initiative underperforms)
    ✅ Strategic learning (TikTok opens new channel)
    ✅ Within budget (135M vs 150M limit)
    ✅ Manageable execution (4 initiatives vs 3/5)
    ✅ No approval delays (can start immediately)

Evidence Base:
  
  This recommendation is built on 10 layers of analysis:
    [1] Goal clarification (resolved ambiguities)
    [2] Business diagnosis (5 Whys root cause analysis)
    [3] Opportunity discovery (20+ options evaluated)
    [4] Constraint analysis (budget, workforce, timeline, tech)
    [5] Tradeoff debate (3 options compared)
    [6] Strategic reasoning (logic chain validated)
    [7] Executive simulation (Monte Carlo, 1000 runs)
    [8] KPI decomposition (leading indicators defined)
    [9] Resource allocation (budget, people, timeline)
    [10] This approval request
  
  Not a gut feeling. Not a guess.
  This is a CEO-quality strategic plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RISK ASSESSMENT

Primary Risks:

RISK #1: TikTok Pilot Underperforms
  Probability: 40%
  Impact: -150M revenue (vs -200M expected)
  
  Mitigation:
    - Pilot approach (15M, not 30M)
    - Week 2 GO/NO-GO decision point
    - If not working, stop and reallocate budget
    - Even without TikTok, other 3 hit 1.5B goal ✅
  
  Residual Risk: LOW

RISK #2: Win-back Conversion Lower Than Expected
  Probability: 30%
  Impact: -200M revenue (600M → 400M)
  
  Mitigation:
    - A/B test 3 email subject lines
    - Improve offer if Week 1 open rate < 20%
    - Follow-up sequence over 3 weeks
    - Re-engage non-openers with different message
  
  Residual Risk: MEDIUM

RISK #3: Upsell Adoption Slow
  Probability: 25%
  Impact: -200M revenue (500M → 300M)
  
  Mitigation:
    - Intensive training (8 hours, certification required)
    - Commission structure (5% of premium delta)
    - Daily coaching and tracking
    - Celebrate early wins
  
  Residual Risk: MEDIUM

RISK #4: Weekend Weather Impact
  Probability: 20%
  Impact: -50M revenue (bad weather = lower bookings)
  
  Mitigation:
    - Promote indoor services
    - Backup offers (reschedule incentive)
    - Insurance in ad spend (can boost if needed)
  
  Residual Risk: LOW

RISK #5: Team Overload (21% vs 20% capacity)
  Probability: 15%
  Impact: Execution quality drops, morale issues
  
  Mitigation:
    - Acceptable 5% overtime for 1 month only
    - Clear priorities and sequencing
    - Manager oversight and support
    - No additional projects this month
  
  Residual Risk: LOW

RISK #6: Budget Overrun
  Probability: 10%
  Impact: Exceed 150M limit
  
  Mitigation:
    - 15M buffer (10% safety margin)
    - Strict budget tracking
    - TikTok capped at 15M (no auto-scale)
    - CEO approval needed for buffer deployment
  
  Residual Risk: VERY LOW

Overall Risk Level: MEDIUM

Risk-Adjusted Success Probability:
  Even accounting for ALL risks:
    - 80% confidence to hit goal ✅
    - Expected value: 1.706B
    - Worst realistic case: 1.13B (still +13% growth)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTERNATIVES CONSIDERED

We did NOT jump to this recommendation.
We systematically evaluated alternatives.

OPTION A: Conservative Strategy
  Initiatives: Win-back + Upsell + Weekend (top 3 only)
  Budget: 120M
  Expected: 1.5B (exactly goal)
  Confidence: 85%
  
  Pros:
    ✅ Lower complexity (3 vs 4 initiatives)
    ✅ Bigger budget buffer (30M vs 15M)
    ✅ Slightly higher per-initiative confidence
    ✅ Zero untested channels
  
  Cons:
    ❌ No safety margin (if one underperforms → miss goal)
    ❌ No strategic exploration (TikTok)
    ❌ Lower expected value (1.275B vs 1.4B)
    ❌ Misses 700% ROI opportunity
  
  Why NOT Selected:
    Single point of failure. If Win-back converts at 20%
    instead of 30%, we miss the goal entirely.
    Conservative is not appropriate when we can afford
    to explore TikTok at 700% ROI with only 15M risk.

OPTION B: Balanced Strategy (RECOMMENDED)
  Initiatives: Win-back + Upsell + Weekend + TikTok Pilot
  Budget: 135M
  Expected: 1.7B (113% of goal)
  Confidence: 80%
  
  [This is the recommendation - details above]

OPTION C: Aggressive Strategy
  Initiatives: All 5 (including Referral Program)
  Budget: 190M (EXCEEDS 150M LIMIT ❌)
  Expected: 2.0B (133% of goal)
  Confidence: 60% (lower due to execution risk)
  
  Pros:
    ✅ Highest upside potential (2.0B)
    ✅ Tests both TikTok and Referral
    ✅ Sets up Q2 with more channels
  
  Cons:
    ❌ Budget overrun by 40M (needs approval → delay)
    ❌ Team overload (26% vs 20% capacity)
    ❌ Execution quality risk (spread too thin)
    ❌ Lower confidence (60% vs 80%)
    ❌ Worse risk-adjusted value (1.2B vs 1.4B)
  
  Why NOT Selected:
    Violates budget constraint. Even if we got approval,
    the team cannot execute 5 initiatives well in 1 month.
    Risk-adjusted value is LOWER than Balanced option.
    Trading execution quality for marginal upside is bad bet.

OPTION D: TikTok-Only Strategy
  Initiative: Focus all resources on TikTok launch
  Budget: 150M (full budget)
  Expected: 2.5B (if works)
  Confidence: 40% (very uncertain)
  
  Why NOT Considered Seriously:
    Too risky. TikTok is unproven channel.
    40% × 2.5B = 1.0B expected value ❌
    Worse than Balanced (1.4B expected).
    Puts all eggs in uncertain basket.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APPROVAL REQUESTED

I am requesting your approval for the following:

[ ] APPROVE STRATEGY:
    Balanced Growth Strategy (Top 4 initiatives)
    - Win-back Campaign
    - Premium Upsell Program
    - Weekend Promotion
    - TikTok Pilot

[ ] APPROVE BUDGET:
    135M investment (90% of 150M limit)
    15M buffer (reserved for contingencies)
    Breakdown:
      - Win-back: 50M
      - Upsell: 40M
      - Weekend: 30M
      - TikTok: 15M
      - Buffer: 15M

[ ] APPROVE TIMELINE:
    4 weeks (August 1-28, 2026)
    Phased rollout:
      - Week 1: Setup
      - Week 2: Launch & Learn
      - Week 3: Optimize & Scale
      - Week 4: Final Push

[ ] APPROVE RISK LEVEL:
    MEDIUM risk level
    80% confidence to hit goal
    Mitigations in place for all major risks

[ ] APPROVE SPECIAL ITEMS:
    - CMO to approve TikTok pilot (policy requirement)
    - Deploy 15M buffer only with CEO approval
    - Sales team 5% overtime acceptable for August
    - Week 3 GO/NO-GO review for TikTok scale

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS IF APPROVED

Immediate Actions (Week 1, Day 1-2):
  1. CMO requests TikTok account approval
  2. Email team cleans Win-back list (220 contacts)
  3. Upsell trainer designs 8-hour program
  4. Weekend team creates 3 ad variants
  5. Finance team tracks budget in real-time

Weekly Checkpoints:
  - Monday 9 AM: CMO review (Win-back, Weekend, TikTok)
  - Tuesday 9 AM: CSO review (Upsell)
  - Friday 2 PM: CEO review (Overall progress)

First Major Checkpoint:
  - Date: Friday, August 5 (end of Week 1)
  - What: Review setup completion and initial metrics
  - Metrics to Check:
    • Win-back emails sent: 220 ✅
    • Upsell training scheduled: 10 staff ✅
    • Weekend ads live: 3 variants ✅
    • TikTok account verified ✅
  
  - If Issues: Address immediately before Week 2 launch

Weekly Revenue Targets:
  - Week 1: 300M (20% of goal)
  - Week 2: 700M (47% of goal)
  - Week 3: 1.1B (73% of goal)
  - Week 4: 1.6B+ (107%+ of goal) ✅

Escalation Triggers:
  🚨 Week 2: Revenue < 500M → CEO meeting
  🚨 Week 3: Revenue < 900M → Deploy buffer
  🚨 Week 4: Revenue < 1.3B → Emergency campaign

Success Communication:
  - Weekly progress reports (sent Friday 5 PM)
  - Real-time dashboard (accessible anytime)
  - Final results presentation (September 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT HAPPENS IF YOU SAY NO

If you reject this plan, we need to discuss:

1. What concerns you? (so I can address or revise)
2. Which option would you prefer instead?
   - More conservative? (Option A)
   - More aggressive? (Option C)
   - Completely different approach?
3. What would change your mind?
   - Higher confidence threshold?
   - Lower budget?
   - Remove TikTok?
4. What's the alternative to hitting 30% growth in August?

I am confident this is the optimal plan given:
  - Your goal (30% growth in 1 month)
  - Our constraints (150M budget, 20% team capacity)
  - Our capabilities (strong acquisition, weak retention)
  - Market conditions (August high season)

But I work for you. This is YOUR business.

If you have reservations, let's discuss them.
I can revise the plan or explain my reasoning further.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR DECISION

[ ] APPROVE - Proceed with Balanced Strategy as proposed

[ ] APPROVE WITH MODIFICATIONS - I want to change:
    _______________________________________________________
    _______________________________________________________

[ ] DEFER - I need more information about:
    _______________________________________________________
    _______________________________________________________

[ ] REJECT - My concerns are:
    _______________________________________________________
    _______________________________________________________

CEO Signature: ___________________  Date: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF EXECUTIVE APPROVAL REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## OUTPUT: Executive Reasoning Package

After CEO approval, Executive Capability outputs:

```typescript
interface ExecutiveReasoningPackage {
  // Phase 1: Goal Clarification
  clarifiedGoal: {
    what: "Increase spa revenue",
    howMuch: "1.5B VND (30%)",
    by: "August 2026 (4 weeks)",
    baseline: "5B (July 2026)",
    target: "6.5B",
    constraints: [
      "Budget 150M max",
      "No hiring",
      "No price changes",
      "Use existing channels"
    ],
    urgency: "HIGH",
    stakeholders: ["CEO", "CMO", "CSO", "CFO"]
  },
  
  // Phase 2: Business Diagnosis
  diagnosis: {
    currentRevenue: "5B/month",
    rootCauses: [
      {
        symptom: "Low retention (45% vs 60%)",
        impact: "33B/year loss",
        severity: "CRITICAL"
      },
      {
        symptom: "No upselling",
        impact: "4.8B/year opportunity cost",
        severity: "HIGH"
      },
      {
        symptom: "Weekend underutilization (60% vs 85%)",
        impact: "6B/year waste",
        severity: "MEDIUM"
      }
    ],
    opportunities: [
      { name: "Win-back", potential: "825M/month" },
      { name: "Upsell", potential: "400M/month" },
      { name: "Weekend", potential: "400M/month" }
    ]
  },
  
  // Phase 3: Opportunity Discovery
  possibilities: [
    {
      id: "win-back",
      potential: 600,
      feasibility: 90,
      roi: 1200,
      selected: true,
      rationale: "Addresses critical retention issue"
    },
    {
      id: "upsell",
      potential: 500,
      feasibility: 80,
      roi: 1250,
      selected: true,
      rationale: "Solves flat AOV problem"
    },
    {
      id: "weekend",
      potential: 400,
      feasibility: 95,
      roi: 1333,
      selected: true,
      rationale: "Quick win, fills capacity"
    },
    {
      id: "tiktok-pilot",
      potential: 200,
      feasibility: 60,
      roi: 700,
      selected: true,
      rationale: "Strategic exploration, acceptable risk"
    },
    {
      id: "referral",
      potential: 300,
      feasibility: 70,
      roi: 750,
      selected: false,
      rationale: "Deferred due to budget constraint"
    }
  ],
  
  // Phase 4: Constraint Analysis
  constraints: {
    budget: { limit: 150, needed: 135, buffer: 15, status: "OK" },
    workforce: { limit: "20%", needed: "21%", status: "ACCEPTABLE" },
    timeline: { limit: "4 weeks", needed: "4 weeks", status: "OK" },
    technology: { tiktokAccount: "NEEDS_SETUP", others: "OK" },
    policy: { cmoApproval: "REQUIRED_FOR_TIKTOK" },
    market: { conditions: "FAVORABLE", seasonality: "HIGH_DEMAND" }
  },
  
  // Phase 5: Tradeoff Analysis
  tradeoffs: {
    conservative: {
      revenue: 1.5,
      risk: "LOW",
      tradeoff: "No exploration, no margin"
    },
    balanced: {
      revenue: 1.7,
      risk: "MEDIUM",
      tradeoff: "TikTok uncertain, but acceptable"
    },
    aggressive: {
      revenue: 2.0,
      risk: "HIGH",
      tradeoff: "Budget overrun, execution quality risk"
    },
    selected: "balanced"
  },
  
  // Phase 6: Strategic Reasoning
  reasoning: {
    selectedOption: "Balanced Strategy (Top 4)",
    confidence: 80,
    rationale: "Best risk-adjusted value, safety margin, strategic learning",
    logicChain: [
      "Goal = 1.5B",
      "Conservative = 1.5B (no margin)",
      "TikTok adds 200M at 700% ROI",
      "Balanced = 1.7B with buffer",
      "Fits budget and capacity",
      "Therefore: Balanced optimal"
    ],
    expectedValue: 1.706
  },
  
  // Phase 7: Executive Simulation
  simulation: {
    optimistic: { probability: 0.20, revenue: 2.3 },
    realistic: { probability: 0.60, revenue: 1.7 },
    pessimistic: { probability: 0.20, revenue: 1.13 },
    expectedValue: 1.706,
    probabilitySuccess: 0.80,
    medianOutcome: 1.68,
    percentile90: 2.1,
    percentile10: 1.2
  },
  
  // Phase 8: KPI Decomposition
  kpiTree: {
    primary: {
      metric: "Revenue",
      target: 6.5,
      baseline: 5.0
    },
    initiatives: [
      {
        name: "Win-back",
        target: 600,
        kpis: [
          { metric: "Email Open", target: "30%" },
          { metric: "Conversion", target: "15%" },
          { metric: "Customers", target: 66 }
        ]
      },
      {
        name: "Upsell",
        target: 500,
        kpis: [
          { metric: "Training", target: "100%" },
          { metric: "Upsell Rate", target: "12%" },
          { metric: "Premium AOV", target: "22.5M" }
        ]
      },
      {
        name: "Weekend",
        target: 400,
        kpis: [
          { metric: "Utilization", target: "85%" },
          { metric: "Bookings", target: "+32" },
          { metric: "ROAS", target: ">10:1" }
        ]
      },
      {
        name: "TikTok",
        target: 200,
        kpis: [
          { metric: "Views", target: ">100K" },
          { metric: "CTR", target: ">2%" },
          { metric: "Customers", target: 16 }
        ]
      }
    ],
    leadingIndicators: {
      week1: ["Emails sent", "Training scheduled", "Ads live", "TikTok verified"],
      week2: ["Open >30%", "Training done", "Bookings +15", "Engagement >3%"],
      week3: ["Convert >20%", "Upsell >8%", "Utilization >75%", "CTR >1.5%"],
      week4: ["Revenue >1.3B", "CAC <800K", "ROAS >8:1", "CSAT >4.0"]
    }
  },
  
  // Phase 9: Resource Allocation
  resourcePlan: {
    budget: {
      total: 135,
      byInitiative: {
        winback: 50,
        upsell: 40,
        weekend: 30,
        tiktok: 15
      },
      buffer: 15
    },
    workforce: {
      total: "21% capacity",
      byInitiative: {
        winback: "5%",
        upsell: "8%",
        weekend: "3%",
        tiktok: "5%"
      }
    },
    timeline: {
      week1: "Setup phase",
      week2: "Launch & Learn",
      week3: "Optimize & Scale",
      week4: "Final Push"
    },
    dependencies: "None blocking (all parallel)"
  },
  
  // Phase 10: Approval
  approval: {
    recommendation: "Balanced Growth Strategy",
    confidence: 80,
    risks: [
      {
        risk: "TikTok underperforms",
        probability: 40,
        mitigation: "Pilot approach, week 2 GO/NO-GO"
      },
      {
        risk: "Win-back conversion low",
        probability: 30,
        mitigation: "A/B test, improve offer"
      }
    ],
    requestedApproval: [
      "Strategy (Balanced, Top 4)",
      "Budget (135M + 15M buffer)",
      "Timeline (4 weeks)",
      "Risk Level (MEDIUM)"
    ],
    nextSteps: [
      "CMO approve TikTok",
      "Clean email list",
      "Design training",
      "Create ads",
      "Weekly CEO reviews"
    ]
  },
  
  // Meta
  generatedAt: "2026-08-01T09:00:00Z",
  generatedBy: "Executive Capability v1.0",
  approvedBy: null, // filled after CEO approval
  approvedAt: null
}
```

This package is then passed to:
  → **Decision Capability** (for strategic planning)
  → **Marketing OS** (for operationalization)
  → **Creative Capability** (for content creation)
  → **Execution Capability** (for task orchestration)


---

## Consequences

### What This Changes

**BEFORE Executive Capability**:
```
CEO: "Tăng doanh thu 30%"
  ↓
(Black box)
  ↓
Business Context Package
  ↓
Creative Brief
  ↓
Banner
```

**Problem**: System jumps from intent to tactics without strategic thinking.

**AFTER Executive Capability**:
```
CEO: "Tăng doanh thu 30%"
  ↓
Executive Capability THINKS (10 phases)
  1. Clarify goal
  2. Diagnose root causes
  3. Discover 20+ possibilities
  4. Analyze constraints
  5. Debate tradeoffs
  6. Reason through logic
  7. Simulate scenarios
  8. Decompose KPIs
  9. Allocate resources
  10. Request approval
  ↓
Executive Reasoning Package
  ↓
Decision Capability (tactical planning)
  ↓
Marketing OS (operationalization)
  ↓
Creative Capability (content creation)
  ↓
Execution Capability (task orchestration)
```

**Result**: Every action has strategic traceability back to CEO goal.

---

### Architectural Impact

**New Capability Added**: Executive Capability (Capability #8)

**Position**: FIRST capability invoked (before Decision, Marketing OS, Creative)

**Updated v22.0 Capabilities**:
```
1. Knowledge        - Store & retrieve facts
2. Decision         - Tactical planning & simulation
3. Creative         - Content production pipeline
4. Execution        - Task orchestration
5. Learning         - Continuous improvement
6. Governance       - Policy & compliance
7. Intelligence     - Market signals
8. 🆕 Executive     - Strategic thinking & reasoning (NEW)
```

**Flow Integration**:
```
┌─────────────────────────────────────────────────┐
│          CEO INTENT LAYER                       │
│    "Vague business goal from CEO"               │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    🆕 EXECUTIVE CAPABILITY (Thinking)           │
│    "COO-level strategic reasoning"              │
│    Output: Executive Reasoning Package          │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    DECISION CAPABILITY (Planning)               │
│    "Tactical planning & simulation"             │
│    Output: Business Strategy Blueprint          │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    MARKETING OS (Operationalization)            │
│    "Marketing execution plan"                   │
│    Output: 100 Content Cards                    │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    CREATIVE CAPABILITY (Creation)               │
│    "Content production pipeline"                │
│    Output: Banners, copy, videos                │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    EXECUTION CAPABILITY (Execution)             │
│    "Task orchestration & workers"               │
│    Output: Published content                    │
└─────────────────────────────────────────────────┘
```

**Key Difference**:
- **Before**: CEO → (magic) → Tactics
- **After**: CEO → Executive → Decision → Marketing OS → Creative → Execution

---

### Strategic Impact

| Dimension | Before | After |
|-----------|--------|-------|
| **CEO Input** | Must specify HOW | Only specify WHAT |
| **Strategic Quality** | Manual (CEO does thinking) | AI COO-level |
| **Goal Achievement** | 70% (often miss) | >90% (strategic) |
| **Planning Time** | Days (CEO bottleneck) | Hours (automated) |
| **Traceability** | None (why this banner?) | Full (banner → KPI → strategy → goal) |
| **CEO Trust** | 3.8/5 (execution assistant) | >4.8/5 (strategic partner) |
| **Market Position** | "AI automation tool" | "AI COO for enterprises" |

---

### Technical Impact

**New Contracts**:
```typescript
// Tier 2 Contract (Adaptive)
interface ExecutiveReasoningPackage {
  clarifiedGoal: GoalClarification;
  diagnosis: BusinessDiagnosis;
  possibilities: OpportunityDiscovery;
  constraints: ConstraintAnalysis;
  tradeoffs: TradeoffAnalysis;
  reasoning: StrategicReasoning;
  simulation: ExecutiveSimulation;
  kpiTree: KPIDecomposition;
  resourcePlan: ResourceAllocation;
  approval: ExecutiveApproval;
  
  // Meta
  generatedAt: ISO8601;
  generatedBy: "executive-capability";
  approvedBy: string | null;
  approvedAt: ISO8601 | null;
}
```

**New API Endpoint**:
```typescript
// POST /api/executive/reason
async function executeExecutiveReasoning(
  ceoIntent: string,
  context: BusinessContext
): Promise<ExecutiveReasoningPackage> {
  
  // Phase 1: Clarify
  const clarified = await clarifyGoal(ceoIntent);
  
  // Phase 2: Diagnose
  const diagnosis = await diagnose(clarified);
  
  // Phase 3: Discover
  const opportunities = await discoverOpportunities(diagnosis);
  
  // Phase 4: Constrain
  const constraints = await analyzeConstraints(opportunities);
  
  // Phase 5: Tradeoff
  const tradeoffs = await analyzeTradeoffs(opportunities, constraints);
  
  // Phase 6: Reason
  const reasoning = await strategicReasoning(tradeoffs);
  
  // Phase 7: Simulate
  const simulation = await simulateScenarios(reasoning);
  
  // Phase 8: KPIs
  const kpiTree = await decomposeKPIs(reasoning, simulation);
  
  // Phase 9: Resources
  const resourcePlan = await allocateResources(kpiTree);
  
  // Phase 10: Approval
  const approval = await generateApprovalRequest(
    clarified,
    diagnosis,
    opportunities,
    constraints,
    tradeoffs,
    reasoning,
    simulation,
    kpiTree,
    resourcePlan
  );
  
  return {
    clarifiedGoal: clarified,
    diagnosis,
    possibilities: opportunities,
    constraints,
    tradeoffs,
    reasoning,
    simulation,
    kpiTree,
    resourcePlan,
    approval,
    generatedAt: new Date().toISOString(),
    generatedBy: "executive-capability",
    approvedBy: null,
    approvedAt: null
  };
}
```

**Storage in EKR**:
```
EKR Structure:

/executive-reasoning/
  ├─ 2026-08-revenue-goal/
  │   ├─ reasoning.json (full package)
  │   ├─ approval.json (CEO signature)
  │   ├─ execution-log.json (what actually happened)
  │   └─ retrospective.json (lessons learned)
  └─ ...
```

**Integration Points**:
- **Input**: CEO intent (natural language)
- **Data Source**: EKR (business metrics, historical patterns)
- **Output**: Executive Reasoning Package → Decision Capability
- **Feedback Loop**: Actual results → Learning Capability → improve reasoning

---

### Business Impact

**What This Enables**:

1. **CEO Can Delegate Strategic Thinking**
   - Before: CEO must figure out HOW to achieve goal
   - After: CEO states goal, AI COO figures out HOW

2. **Every Content Has Strategic Purpose**
   - Before: "Make a Facebook banner" (why?)
   - After: Banner → Content Card → Campaign → KPI → Strategy → CEO Goal

3. **Measurable ROI on Every Initiative**
   - Before: "We spent 50M on marketing" (did it work?)
   - After: "Win-back spent 50M, generated 600M, ROI 1200%"

4. **Continuous Learning from Execution**
   - Before: Run campaign, forget lessons
   - After: Compare planned vs actual → learn → improve next reasoning

5. **Transparent Decision-Making**
   - Before: Black box ("AI decided")
   - After: Full audit trail (why this strategy? here's the 10-phase reasoning)

**Competitive Differentiation**:

| Competitor | Bella with Executive Capability |
|------------|--------------------------------|
| Automation tools (Zapier, n8n) | Execute tasks | Think → Plan → Execute |
| Marketing AI (Jasper, Copy.ai) | Generate content | Strategy → Content |
| Analytics (Google Analytics) | Show data | Data → Insights → Decisions |
| Consultants (McKinsey) | Human-speed | AI-speed (hours not weeks) |

**Market Position Shift**:
- **Before**: "AI marketing automation"
- **After**: "AI Chief Operating Officer for enterprises"

---

## Implementation Plan

### Priority: HIGHEST (Critical Missing Piece)

This is the **#1 capability** that differentiates Bella as AI COO vs AI assistant.

---

### Timeline: 6 Months

**Month 1-2: Foundation (Phases 1-3)**
- Phase 1: Goal Clarification Runtime
  - Ambiguity detector
  - Clarification question generator
  - Assumption validator
  
- Phase 2: Business Diagnosis Runtime
  - 5 Whys root cause engine
  - Performance gap analyzer
  - SWOT generator
  
- Phase 3: Opportunity Discovery Runtime
  - Possibility generator (20+ options)
  - Historical pattern matcher
  - Innovation suggester

**Month 3-4: Strategic Core (Phases 4-6)**
- Phase 4: Constraint Analysis Runtime
  - Budget/workforce/timeline checkers
  - Technology readiness validator
  - Policy compliance checker
  
- Phase 5: Tradeoff Debate Runtime
  - Cost-benefit analyzer
  - Risk-return mapper
  - Tradeoff matrix builder
  
- Phase 6: Strategic Reasoning Runtime
  - Logic chain constructor
  - Premise validator
  - Alternative evaluator

**Month 5-6: Execution Planning (Phases 7-10)**
- Phase 7: Executive Simulation Runtime
  - Scenario generator
  - Monte Carlo simulator
  - Sensitivity analyzer
  
- Phase 8: KPI Decomposition Runtime
  - Goal-to-KPI tree builder
  - Leading indicator identifier
  - Attribution modeler
  
- Phase 9: Resource Allocation Runtime
  - Budget allocator
  - Timeline planner
  - Dependency resolver
  
- Phase 10: Executive Approval Runtime
  - Report generator
  - Risk disclosure
  - Approval request packager

---

### Integration with Existing Systems

**Phase 1 (Month 1)**: Standalone Prototype
- Build Executive Capability as isolated service
- Test with synthetic CEO intents
- Validate reasoning quality
- No integration yet

**Phase 2 (Month 2-3)**: EKR Integration
- Connect to EKR for business data
- Read historical patterns
- Write reasoning packages
- Test with real company data

**Phase 3 (Month 4-5)**: Decision Capability Integration
- Executive Reasoning Package → Decision Capability
- Decision Capability consumes structured strategy
- Test end-to-end: CEO intent → Strategy → Plan

**Phase 4 (Month 6)**: Full Pipeline Integration
- Executive → Decision → Marketing OS → Creative → Execution
- CEO dashboard for approval
- Real-time monitoring
- Feedback loop: Actual vs Planned

---

### Success Metrics

**Month 2 (Foundation):**
- ✅ Can clarify ambiguous CEO intent (95% success rate)
- ✅ Can identify root causes using 5 Whys
- ✅ Can generate 20+ possibilities for any business goal

**Month 4 (Strategic Core):**
- ✅ Can analyze constraints (budget, workforce, timeline)
- ✅ Can evaluate tradeoffs (3+ options with pros/cons)
- ✅ Can build logic chain (validated reasoning)

**Month 6 (Full Capability):**
- ✅ Can generate complete Executive Reasoning Package
- ✅ CEO approval rate >80% (CEO trusts recommendations)
- ✅ Goal achievement rate >90% (vs 70% before)
- ✅ Planning time <4 hours (vs days manually)

**Post-Launch (Month 7+):**
- ✅ Bella positions as "AI COO" not "AI assistant"
- ✅ CEO trust score >4.5/5 (vs 3.8/5 before)
- ✅ Every content has strategic traceability
- ✅ ROI measurable for every initiative

---

### Risks & Mitigations

**Risk #1: Reasoning Quality Not CEO-Level**
- Mitigation: Extensive prompt engineering with real CEO examples
- Validation: Have real CEOs grade reasoning quality
- Fallback: Human-in-loop for initial months

**Risk #2: Integration Complexity**
- Mitigation: Build standalone first, integrate incrementally
- Validation: Test each integration point separately
- Fallback: Keep Executive Capability as opt-in feature

**Risk #3: CEO Doesn't Trust AI Reasoning**
- Mitigation: Full transparency (show all 10 phases)
- Validation: A/B test: AI reasoning vs human CEO planning
- Fallback: "Advisor mode" (AI suggests, CEO decides)

**Risk #4: Performance (Reasoning Takes Too Long)**
- Mitigation: Optimize LLM prompts, parallel phase execution
- Validation: Target <4 hours for full 10-phase reasoning
- Fallback: Progressive disclosure (show Phase 1-3 first)

---

## Conclusion

**Executive Capability is the missing cognitive core of Bella EOS.**

Without it:
- Bella is a smart assistant (executes well)
- CEO must do all strategic thinking
- No traceability (why this banner?)
- 70% goal achievement

With it:
- Bella is an AI COO (thinks + executes)
- CEO states goal, AI figures out how
- Full traceability (banner → strategy → goal)
- >90% goal achievement

This is the **#1 capability** that defines Bella's market position:

| Without Executive Capability | With Executive Capability |
|------------------------------|---------------------------|
| AI Marketing Automation | AI Chief Operating Officer |
| Competitor: Jasper, Copy.ai | Competitor: McKinsey, BCG |
| "Tell me what to do" | "Tell me your goal" |
| Tactical value | Strategic value |
| $500/month SaaS | $50K/month enterprise platform |

**Recommendation**: Prioritize Executive Capability as Sprint 29 goal.

This is not an incremental improvement. This is a **transformational** shift in what Bella EOS is.

---

*Document Status*: **COMPLETE** ✅  
*ADR Status*: Proposed (Awaiting Architecture Board Approval)  
*Date*: 2026-07-27  
*Next Step*: Present to Architecture Board for approval
