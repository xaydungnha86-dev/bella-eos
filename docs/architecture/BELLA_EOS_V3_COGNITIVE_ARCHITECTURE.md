# BELLA EOS v3.0 - COGNITIVE ARCHITECTURE

**Version**: 3.0 (Reasoning-Based)  
**Date**: 2026-07-27  
**Status**: Proposed  
**Supersedes**: v22.0 (Capability-Based)  
**Paradigm Shift**: Workflow → Reasoning

---

## 🎯 EXECUTIVE SUMMARY

Bella EOS v3.0 represents a **paradigm shift** from workflow-based to **reasoning-based cognitive architecture**.

### Key Innovation

**v22.0** (Capability-Based):
```
CEO Intent → Capabilities → Execution
```
- Still workflow-driven
- No strategic thinking layer
- Linear execution

**v3.0** (Reasoning-Based):
```
CEO Intent → Strategic Reasoning → Tactical Decision → Operational Planning → Execution
```
- Reasoning-first
- Graph-based iteration
- Converges to optimal strategy

---

## 🏗️ ARCHITECTURE OVERVIEW

### The Complete Flow

```
┌──────────────────────────────────────────────────┐
│              CEO INTENT LAYER                    │
│   "Tăng doanh thu spa tháng sau 30%"             │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│       GOAL CLARIFICATION RUNTIME                 │
│   Natural Language → Structured Goal             │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│  🆕 EXECUTIVE INTELLIGENCE RUNTIME (EIR)         │
│       "Strategic Reasoning Graph Engine"         │
│                                                  │
│  Diagnosis → Constraint → Opportunity            │
│       ↓          ↓           ↓                   │
│  Strategy ←──────┴───────────┘                   │
│       ↓                                          │
│  Simulation                                      │
│   │                                              │
│   ├─PASS──→ Risk → Recommendation                │
│   │                                              │
│   └─FAIL──→ Refine → Strategy (loop)             │
│                                                  │
│  Output: Executive Recommendation                │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│          HUMAN APPROVAL GATE                     │
│   CEO reviews recommendation                     │
│   Approve / Reject / Modify                      │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│          DECISION RUNTIME                        │
│   Tactical decisions                             │
│   Multi-agent deliberation                       │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│  🆕 PLANNING RUNTIME (PLR)                       │
│       "Operational Planning Engine"              │
│                                                  │
│  ├─ KPI Decomposition                            │
│  ├─ Budget Allocation                            │
│  ├─ Timeline Planning                            │
│  ├─ Resource Allocation                          │
│  └─ Owner Assignment                             │
│                                                  │
│  Output: Operational Plan                        │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│            DOMAIN OS LAYER                       │
│   Marketing OS / Finance OS / Sales OS / HR OS   │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│          CREATIVE RUNTIME                        │
│   Content Production Pipeline                    │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│          EXECUTION RUNTIME                       │
│   Task Orchestration & Workers                   │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│          OBSERVATION RUNTIME                     │
│   Monitor actual results                         │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│          LEARNING RUNTIME                        │
│   Strategic Feedback                             │
│   Planned vs Actual                              │
│   Confidence Adjustment                          │
└──────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────┐
│   ENTERPRISE KNOWLEDGE REPOSITORY (EKR)          │
│   Facts → Knowledge Graph → Reasoning Graphs     │
└──────────────────────────────────────────────────┘
```

---

## 🔄 THE THREE LAYERS

### Layer 1: REASONING (Strategic)

**Runtime**: Executive Intelligence Runtime (EIR)

**Purpose**: Strategic thinking & reasoning

**Input**: CEO goal (natural language)

**Process**: Reasoning Graph Engine
- Diagnosis → Root cause analysis
- Constraint → What limits us
- Opportunity → 20+ possibilities
- Strategy → Generate alternatives
- Simulation → Monte Carlo
- Loop until convergence
- Risk → Assessment
- Recommendation → Package for CEO

**Output**: Executive Recommendation
```typescript
{
  goal: "Increase revenue 1.5B",
  chosenStrategy: "Balanced (Win-back + Upsell + Weekend + TikTok)",
  expectedRevenue: 1.7B,
  confidence: 80%,
  majorRisks: [...]
}
```

**Characteristics**:
- ✅ Graph-based (not linear)
- ✅ Iterative (loops)
- ✅ Strategic only (no operations)

---

### Layer 2: PLANNING (Operational)

**Runtime**: Planning Runtime (PLR)

**Purpose**: Translate strategy into executable plan

**Input**: Executive Recommendation

**Process**:
- KPI Decomposition
- Budget Allocation
- Timeline Planning
- Resource Allocation
- Owner Assignment

**Output**: Operational Plan
```typescript
{
  kpiTree: {
    revenue: {
      winback: { emailOpen: "30%", ctr: "8%", ... },
      ...
    }
  },
  budgetPlan: { winback: 50M, breakdown: {...}, ... },
  timelinePlan: { week1: [...], week2: [...], ... },
  resourcePlan: { workforce: {...}, assets: {...}, ... },
  ownershipMap: { ... }
}
```

**Characteristics**:
- ✅ Operational only (no strategy)
- ✅ Detailed (KPIs, budget, timeline, people)
- ✅ Executable (ready for Domain OS)

---

### Layer 3: EXECUTION (Tactical)

**Runtimes**: Domain OS, Creative, Execution

**Purpose**: Execute the plan

**Input**: Operational Plan

**Process**:
- Domain OS: Domain-specific operations
- Creative: Content production
- Execution: Task orchestration

**Output**: Published content, campaign results

**Characteristics**:
- ✅ Tactical only (no strategy or planning)
- ✅ Focuses on quality execution

---

## 🧠 EXECUTIVE INTELLIGENCE RUNTIME (EIR)

### Core Innovation: Reasoning Graph Engine

**NOT a linear pipeline**:
```
❌ Phase1 → Phase2 → Phase3 → ... → Phase10
```

**Graph-based reasoning**:
```
✅ Strategy → Simulate → Fail → Refine → Strategy → Simulate → Pass
```

### Graph Nodes

```
┌─────────────────────────────────────┐
│   REASONING GRAPH ENGINE            │
├─────────────────────────────────────┤
│                                     │
│  Diagnosis ────────┐                │
│                    │                │
│  Constraint ───────┤                │
│                    │                │
│  Opportunity ──────┤                │
│                    ▼                │
│               Strategy              │
│                    │                │
│                    ▼                │
│               Simulation            │
│                │      │             │
│             PASS    FAIL            │
│                │      │             │
│                │      └──→ Refine   │
│                │           (loop)   │
│                ▼                    │
│               Risk                  │
│                │                    │
│                ▼                    │
│          Recommendation             │
└─────────────────────────────────────┘
```

### Loop Example

**Iteration 1**:
```
Strategy: Aggressive (All 5 initiatives, 190M budget)
  ↓
Simulation: EV = 1.2B, P(Success) = 60%
  ↓
Convergence: FAIL (budget exceeds 150M, P(Success) < 75%)
  ↓
Action: Refine constraints (defer Referral, 135M budget)
```

**Iteration 2**:
```
Strategy: Balanced (Top 4 initiatives, 135M budget)
  ↓
Simulation: EV = 1.706B, P(Success) = 80%
  ↓
Convergence: PASS ✅
  ↓
Output: Recommendation
```

**Key Insight**: Real reasoning requires loops, not linear steps.

---

## 📋 PLANNING RUNTIME (PLR)

### Purpose

**Extract operational concerns from EIR**.

### What Moved from EIR to PLR

| Concern | Was in EIR v1.0 | Now in PLR v3.0 |
|---------|-----------------|-----------------|
| KPI Decomposition | ❌ Strategic layer | ✅ PLR |
| Resource Allocation | ❌ Strategic layer | ✅ PLR |
| Timeline Planning | ❌ Strategic layer | ✅ PLR |
| Budget Breakdown | ❌ Strategic layer | ✅ PLR |
| Owner Assignment | ❌ Strategic layer | ✅ PLR |

### EIR Output (Strategic)

```typescript
{
  chosenStrategy: "Balanced",
  budget: 135M,          // Total only
  timeline: "4 weeks"    // Duration only
}
```

### PLR Output (Operational)

```typescript
{
  budgetPlan: {
    total: 135M,
    byInitiative: {
      winback: 50M,
      breakdown: {
        emailPlatform: 5M,
        creative: 10M,
        incentives: 35M
      }
    }
  },
  timelinePlan: {
    week1: {
      day1: ["Clean list", "Kickoff"],
      day2: ["Write copy", "Design ads"]
    }
  }
}
```

---

## 📊 COMPARISON: v22 vs v3

| Aspect | v22.0 (Capability) | v3.0 (Reasoning) |
|--------|-------------------|------------------|
| **Paradigm** | Workflow-based | Reasoning-based |
| **Top Layer** | Capabilities | Reasoning → Planning → Execution |
| **Thinking** | None (jumps to tactics) | EIR (Reasoning Graph) |
| **Loops** | No | Yes (Strategy ↔ Simulation) |
| **Strategic/Operational Separation** | Mixed | Clean (EIR / PLR / Domain OS) |
| **Planning** | Scattered | Unified (PLR) |
| **Convergence** | N/A | Explicit criteria |
| **Reasoning Trace** | No | Yes (full graph trace) |
| **Learning Feedback** | Partial | Complete (to EIR) |

---

## 🔍 LAYER RESPONSIBILITIES

### Executive Intelligence Runtime (EIR)

**ONLY Strategic**:
- ✅ Root cause analysis
- ✅ Opportunity discovery
- ✅ Strategy generation
- ✅ Simulation & confidence
- ✅ Risk assessment

**NOT Operational**:
- ❌ KPI decomposition
- ❌ Budget breakdown
- ❌ Timeline details
- ❌ Resource assignment
- ❌ Marketing metrics

### Planning Runtime (PLR)

**ONLY Operational**:
- ✅ KPI tree (email open, CTR, conversion)
- ✅ Budget breakdown (line items)
- ✅ Timeline (day-by-day)
- ✅ Resource allocation (people, assets)
- ✅ Owner assignment (accountability)

**NOT Strategic**:
- ❌ Strategy selection
- ❌ Opportunity discovery
- ❌ Risk assessment

### Domain OS

**ONLY Domain-Specific**:
- ✅ Marketing campaigns
- ✅ Channel-specific logic
- ✅ Content calendar
- ✅ Campaign metrics

**NOT Strategic or Planning**:
- ❌ Strategy reasoning
- ❌ KPI decomposition

---

## 🎓 LEARNING FEEDBACK LOOP

### New: Strategic Learning

**v22.0** (Partial):
```
Execution → Evidence → Patterns → Playbooks
```
Learning was only at tactical level.

**v3.0** (Complete):
```
EIR: "Recommended Balanced strategy (TikTok confidence 60%)"
  ↓
Execution: "Actual TikTok revenue = 250M (vs 200M expected)"
  ↓
Learning: "TikTok performed 25% better than expected"
  ↓
Lesson: "TikTok pilot approach was correct, confidence increase"
  ↓
EKR: Store strategic pattern
  ↓
Future EIR: "TikTok confidence adjusted 60% → 75%"
```

**Interface**:
```typescript
interface StrategyFeedback {
  plannedStrategy: Strategy;
  actualOutcome: Outcome;
  variance: { expected: number; actual: number; delta: number };
  lessons: Lesson[];
  confidenceAdjustment: Record<string, number>;
}

// Learning Runtime sends to EIR
await eir.adjustConfidence({
  possibility: "TikTok pilot",
  oldConfidence: 0.60,
  newConfidence: 0.75,
  reason: "Outperformed by 25%",
  evidence: [...]
});
```

**Impact**: EIR gets smarter over time.

---

## 🎯 SUCCESS CRITERIA

### Technical KPIs

| Metric | v22.0 | v3.0 Target |
|--------|-------|-------------|
| Reasoning quality | N/A | >90% CEO approval |
| Convergence rate | N/A | >95% within 3 iterations |
| Strategic/operational separation | 60% | 100% |
| Reasoning transparency | Low | High (full graph trace) |
| Learning effectiveness | 70% | >90% (includes strategic) |

### Business KPIs

| Metric | Before | v3.0 Target |
|--------|--------|-------------|
| Goal achievement | 70% | >90% |
| CEO trust | 3.8/5 | >4.8/5 |
| Planning time | Days | Hours |
| Strategic quality | Manual (CEO) | AI COO-level |
| Adaptability | Low | High (self-improving) |

---

## 📅 MIGRATION TIMELINE

### Month 1-2: Foundation
- Extract Planning Runtime from EIR v1.0
- Build PLR engines (KPI, Budget, Timeline, Resource, Owner)
- Separate strategic from operational

### Month 3-4: Reasoning Graph
- Replace linear pipeline with graph engine
- Implement loop logic (Strategy ↔ Simulation)
- Implement convergence criteria
- Add reasoning trace

### Month 5-6: Integration & Learning
- Connect EIR → Approval → Decision → PLR → Domain OS
- Implement strategic feedback (Learning → EIR)
- Test convergence and confidence adjustment
- Full end-to-end validation

### Month 7: Testing & Documentation
- Comprehensive test suite
- Document graph engine
- Developer training
- User guides

### Month 8: Production Rollout
- Phased deployment
- Monitor convergence rate
- Track goal achievement
- Collect CEO feedback

---

## 🔑 KEY INNOVATIONS

### 1. Reasoning Graph (vs Linear Pipeline)

**Before**:
```
Phase1 → Phase2 → Phase3 → ... → Phase10
```
Fixed, workflow-based, no loops.

**After**:
```
Strategy → Simulate → FAIL → Refine → Simulate → PASS
```
Adaptive, reasoning-based, loops until optimal.

---

### 2. Strategic/Operational Separation

**Before**:
```
Executive Capability does everything:
- Strategy ✅
- KPIs ❌ (should be Planning)
- Budget ❌ (should be Planning)
- Timeline ❌ (should be Planning)
```

**After**:
```
EIR: Strategy only
PLR: KPIs, Budget, Timeline, Resource, Owner
Domain OS: Domain-specific operations
```

---

### 3. Learning Feedback to Reasoning

**Before**:
```
Learning → Playbooks (tactical only)
```

**After**:
```
Learning → EKR → EIR (strategic confidence adjustment)
```

EIR learns from outcomes and improves future reasoning.

---

### 4. Convergence-Driven

**Before**:
```
Execute phases → Done (no quality check)
```

**After**:
```
Execute graph → Check convergence
  → IF PASS: Done
  → IF FAIL: Refine and loop
```

Guaranteed quality through convergence criteria.

---

## 🎬 COMPLETE EXAMPLE

### Input

```
CEO: "Tăng doanh thu spa tháng sau 30%"
```

### Layer 1: Reasoning (EIR)

```
Goal Clarification:
  → "Increase revenue 1.5B in 4 weeks, baseline 5B"

Reasoning Graph (2 iterations):

Iteration 1:
  Diagnosis: Retention 45%, no upselling, weekend underutilized
  Opportunities: [Win-back, Upsell, Weekend, TikTok, Referral]
  Constraints: Budget 150M, workforce 20%, timeline 4 weeks
  Strategy: Aggressive (All 5, 190M)
  Simulation: EV 1.2B, P(Success) 60%
  Convergence: FAIL (budget overrun, low confidence)

Iteration 2:
  Refine: Defer Referral, budget 135M
  Strategy: Balanced (Top 4)
  Simulation: EV 1.706B, P(Success) 80%
  Convergence: PASS ✅

Risk: TikTok uncertain (40%), Win-back low (30%)
      Overall: MEDIUM, Acceptable

Recommendation:
  Strategy: Balanced
  Budget: 135M
  Timeline: 4 weeks
  Expected: 1.7B (113% of goal)
  Confidence: 80%
```

### Human Approval

```
CEO reviews recommendation
  → Approves ✅
```

### Layer 2: Planning (PLR)

```
KPI Decomposition:
  Revenue +1.5B
    ├─ Win-back +600M (66 customers, 30% open, 15% convert)
    ├─ Upsell +500M (48 customers, 12% rate)
    ├─ Weekend +400M (+32 bookings, 85% util)
    └─ TikTok +200M (16 customers, 100K views, 2% CTR)

Budget Allocation:
  Win-back: 50M (5M email, 10M creative, 35M incentive)
  Upsell: 40M (15M training, 10M materials, 15M system)
  Weekend: 30M (20M ads, 5M creative, 5M staff)
  TikTok: 15M (7M content, 8M ads)

Timeline:
  Week 1: Setup
  Week 2: Launch & Learn
  Week 3: Optimize & Scale
  Week 4: Final Push

Resource:
  Email Manager: 30%
  Sales Team: 8%
  Ads Manager: 20%
  Video Creator: 30%

Owners:
  Win-back: CMO
  Upsell: CSO
  Weekend: CMO
  TikTok: CMO
```

### Layer 3: Execution

```
Marketing OS:
  → Create 50 content cards
  → Schedule campaigns

Creative Runtime:
  → Generate banners, videos, landing pages

Execution Runtime:
  → Orchestrate tasks
  → Assign to AI/human workers
  → Publish content

Observation:
  → Track actual results

Learning:
  → Planned: 1.7B
  → Actual: 1.85B (+8.8%)
  → Lessons:
     - TikTok performed better (250M vs 200M)
     - Win-back conversion higher (35% vs 30%)
  → Confidence Adjustment:
     - TikTok: 60% → 75%
     - Win-back: 85% → 92%
  → Store in EKR for future EIR reasoning
```

---

## 🏁 CONCLUSION

Bella EOS v3.0 is a **cognitive architecture**, not just a workflow platform.

Key transformations:
1. ✅ **Reasoning-first** (graph-based, not linear)
2. ✅ **Strategic/Operational separation** (EIR / PLR / Domain OS)
3. ✅ **Convergence-driven** (loops until optimal)
4. ✅ **Self-improving** (learning feeds back to reasoning)
5. ✅ **Transparent** (full reasoning trace)

This is the architecture that makes Bella an **AI Chief Operating Officer**.

---

*Document Version*: 3.0  
*Date*: 2026-07-27  
*Status*: Proposed - Awaiting Architecture Board Approval  
*Supersedes*: v22.0 (Capability-Based Architecture)  
*Related*:
- ADR-0010 v2.0 (Executive Intelligence Runtime)
- ADR-0011 (Planning Runtime)
- REASONING_GRAPH_ENGINE.md
