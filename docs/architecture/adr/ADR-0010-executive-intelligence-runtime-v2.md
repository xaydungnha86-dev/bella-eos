# ADR-0010: Executive Intelligence Runtime (v2.0 - Revised)

* **Status**: Proposed (CRITICAL - Cognitive Architecture)
* **Date**: 2026-07-27 (Revised)
* **Author**: Enterprise Architecture Board
* **Priority**: HIGHEST
* **Impact**: TRANSFORMATIONAL - Core Cognitive Architecture
* **Supersedes**: ADR-0010 v1.0 (10-phase linear pipeline)

---

## Context

### The Fundamental Problem

After extensive review, we identified that v1.0 (10-phase linear pipeline) had **architectural flaws**:

**❌ Problem 1: Linear Pipeline ≠ Reasoning**
```
Phase1 → Phase2 → Phase3 → ... → Phase10
```
This is a **workflow**, not **reasoning**.

Real reasoning is **iterative, graph-based, with loops**:
```
Strategy → Simulate → Fail → Refine Constraints → New Strategy → Simulate → Pass
```

**❌ Problem 2: Executive Doing Operational Work**
v1.0 had Executive doing:
- KPI decomposition (should be Planning)
- Resource allocation (should be Planning)
- Timeline planning (should be Planning)
- Operational metrics (should be Domain OS)

**❌ Problem 3: Capability vs Runtime Confusion**
Executive is not a "capability" - it's a **stateful reasoning runtime** with:
- State (current reasoning context)
- Memory (past decisions, patterns)
- Reasoning graphs (causal chains)
- Simulation engine
- Feedback loops

**❌ Problem 4: Blurred Boundaries**
v1.0 mixed strategic, tactical, and operational concerns.

---

## Decision

We introduce **Executive Intelligence Runtime (EIR)** - a pure **strategic reasoning engine**.

### Name Change Rationale

| Term | Why NOT | Why YES |
|------|---------|---------|
| Executive Capability | Too generic, implies stateless | - |
| Executive Planning Runtime | Implies planning (operational) | - |
| Executive Reasoning Runtime (ERR) | Accurate but ERR acronym awkward | Good option |
| **Executive Intelligence Runtime (EIR)** | ✅ Reasoning + Intelligence + State | **SELECTED** |

**Selected**: Executive Intelligence Runtime (EIR)

---

## Architecture

### Core Principle

**EIR is a reasoning graph engine, not a linear pipeline.**

```
┌────────────────────────────────────────────────┐
│  EXECUTIVE INTELLIGENCE RUNTIME (EIR)          │
│  "Strategic Reasoning Graph Engine"            │
├────────────────────────────────────────────────┤
│                                                │
│  CEO Goal                                      │
│      │                                         │
│      ▼                                         │
│  Goal Clarification                            │
│      │                                         │
│      ▼                                         │
│  ┌─────────────────────────┐                  │
│  │  Reasoning Graph Engine │                  │
│  ├─────────────────────────┤                  │
│  │                         │                  │
│  │  Diagnosis Graph  ◄─────┼─┐                │
│  │  Constraint Graph ◄─────┼─┤                │
│  │  Opportunity Graph◄─────┼─┤                │
│  │  Strategy Graph   ◄─────┼─┤                │
│  │  Simulation Graph ◄─────┼─┤                │
│  │  Risk Graph       ◄─────┼─┘                │
│  │                         │                  │
│  │  (Graphs can loop until│                  │
│  │   convergence)          │                  │
│  └─────────────────────────┘                  │
│      │                                         │
│      ▼                                         │
│  Executive Recommendation                      │
│  {                                             │
│    goal,                                       │
│    diagnosis,                                  │
│    constraints,                                │
│    assumptions,                                │
│    alternatives,                               │
│    chosenStrategy,                             │
│    simulationSummary,                          │
│    confidence,                                 │
│    expectedOutcome,                            │
│    majorRisks,                                 │
│    successCriteria                             │
│  }                                             │
└────────────────────────────────────────────────┘
```

---

## EIR Scope: Strategic Only

### What EIR DOES (Strategic)

```typescript
interface ExecutiveRecommendation {
  // Strategic Goal
  goal: {
    what: string;           // "Increase revenue"
    howMuch: string;        // "30% = 1.5B"
    by: string;             // "Next month"
    constraints: string[];  // ["Budget 150M", "No hiring"]
  };
  
  // Strategic Diagnosis
  diagnosis: {
    currentState: string;
    rootCauses: Cause[];   // ["Retention 45%", "No upselling"]
    opportunities: string[];
  };
  
  // Strategic Constraints
  constraints: {
    budget: string;         // "150M max"
    workforce: string;      // "20% capacity"
    timeline: string;       // "4 weeks"
    market: string;         // "High season"
  };
  
  // Strategic Assumptions
  assumptions: Assumption[];
  // "Retention can improve to 60%"
  // "Weekend demand is elastic"
  
  // Strategic Alternatives
  alternatives: Strategy[];
  // Conservative, Balanced, Aggressive
  
  // Chosen Strategy
  chosenStrategy: {
    name: string;           // "Balanced Growth"
    approach: string[];     // ["Win-back", "Upsell", "Weekend", "TikTok"]
    rationale: string;
  };
  
  // Simulation Summary
  simulationSummary: {
    optimistic: number;     // 2.3B
    realistic: number;      // 1.7B
    pessimistic: number;    // 1.13B
    expectedValue: number;  // 1.706B
  };
  
  // Confidence & Risk
  confidence: number;       // 80%
  expectedOutcome: string;  // "1.7B revenue (113% of goal)"
  majorRisks: Risk[];
  
  // Success Criteria (Strategic Level)
  successCriteria: {
    primary: string;        // "Revenue >= 1.5B"
    secondary: string[];    // ["ROI > 10x", "Margin maintained"]
  };
}
```

### What EIR DOES NOT DO (Operational)

**❌ NO KPI Decomposition**
```typescript
// WRONG (in EIR):
kpiTree: {
  revenue: {
    email_open_rate: "30%",
    landing_page_ctr: "15%",
    ...
  }
}
```
→ This belongs to **Planning Runtime**

**❌ NO Resource Allocation**
```typescript
// WRONG (in EIR):
budget: {
  winback: 50M,
  upsell: 40M,
  breakdown: {
    emailPlatform: 5M,
    ...
  }
}
```
→ This belongs to **Planning Runtime**

**❌ NO Timeline Planning**
```typescript
// WRONG (in EIR):
timeline: {
  week1: ["Setup email", "Train staff"],
  week2: ["Launch campaign"],
  ...
}
```
→ This belongs to **Planning Runtime**

**❌ NO Marketing Metrics**
```typescript
// WRONG (in EIR):
metrics: {
  email_open_rate: "30%",
  ctr: "8%",
  cpa: "500K",
  ...
}
```
→ This belongs to **Marketing OS**

---

## EIR Components

### 1. Goal Clarification Engine

**Input**: CEO natural language intent  
**Output**: Structured strategic goal

```typescript
interface ClarifiedGoal {
  what: string;
  howMuch: string;
  by: string;
  baseline: number;
  target: number;
  constraints: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}
```

**Example**:
```
Input: "Tăng doanh thu spa tháng sau 30%"
Output: {
  what: "Increase spa revenue",
  howMuch: "30% = 1.5B VND",
  by: "Next month (4 weeks)",
  baseline: 5B,
  target: 6.5B,
  constraints: ["Budget 150M", "No hiring", "No price changes"],
  urgency: "high"
}
```

---

### 2. Reasoning Graph Engine

**Core Innovation**: Replace linear pipeline with **graph-based reasoning**.

```
┌────────────────────────────────────────────┐
│       REASONING GRAPH ENGINE               │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────┐                          │
│  │ Diagnosis    │◄────┐                    │
│  │ Graph        │     │                    │
│  └──────┬───────┘     │                    │
│         │             │                    │
│         ▼             │                    │
│  ┌──────────────┐     │                    │
│  │ Opportunity  │     │                    │
│  │ Graph        │     │                    │
│  └──────┬───────┘     │                    │
│         │             │                    │
│         ▼             │                    │
│  ┌──────────────┐     │                    │
│  │ Constraint   │     │                    │
│  │ Graph        │     │                    │
│  └──────┬───────┘     │                    │
│         │             │                    │
│         ▼             │                    │
│  ┌──────────────┐     │                    │
│  │ Strategy     │     │                    │
│  │ Graph        │     │                    │
│  └──────┬───────┘     │                    │
│         │             │                    │
│         ▼             │                    │
│  ┌──────────────┐     │                    │
│  │ Simulation   │     │                    │
│  │ Graph        │     │                    │
│  └──────┬───────┘     │                    │
│         │             │                    │
│         ├─────PASS────┼──────┐             │
│         │             │      │             │
│         └─────FAIL────┘      │             │
│                              │             │
│                              ▼             │
│                      ┌──────────────┐      │
│                      │ Risk Graph   │      │
│                      └──────┬───────┘      │
│                             │              │
│                             ▼              │
│                      ┌──────────────┐      │
│                      │Recommendation│      │
│                      └──────────────┘      │
└────────────────────────────────────────────┘
```

**Key Features**:
- ✅ Graphs can loop (Strategy → Simulate → Fail → Refine → Simulate)
- ✅ Graphs can be re-executed with new constraints
- ✅ Convergence condition: Strategy passes simulation
- ✅ Each graph node is stateful (stores reasoning trace)

---

### 3. Diagnosis Graph

**Purpose**: Root cause analysis

```typescript
interface DiagnosisGraph {
  currentState: BusinessState;
  symptoms: Symptom[];
  rootCauses: {
    symptom: string;
    causes: {
      level: number;      // 5 Whys depth
      cause: string;
      evidence: string[];
    }[];
    severity: 'critical' | 'high' | 'medium' | 'low';
    impact: number;       // Revenue impact
  }[];
  opportunities: {
    name: string;
    potential: number;
  }[];
}
```

**Example**:
```
Symptom: "Revenue flat at 5B/month"
  │
  ▼ Why?
Cause1: "Retention only 45% (vs 60% industry)"
  │
  ▼ Why?
Cause2: "No follow-up after visit"
  │
  ▼ Why?
Cause3: "CRM not configured for automation"
  │
  ▼ Why?
Cause4: "Team focused on acquisition, not retention"
  │
  ▼ Why?
Cause5: "Belief that new customers = growth"
  │
  ▼ ROOT CAUSE
Diagnosis: "Wrong strategic focus (acquisition over retention)"
Impact: 33B/year lost
Opportunity: "Win-back campaign → 825M/month potential"
```

---

### 4. Constraint Graph

**Purpose**: Identify what limits execution

```typescript
interface ConstraintGraph {
  budget: Constraint;
  workforce: Constraint;
  timeline: Constraint;
  technology: Constraint;
  policy: Constraint;
  market: Constraint;
}

interface Constraint {
  type: string;
  limit: string;
  current: string;
  status: 'blocking' | 'limiting' | 'acceptable';
  mitigation?: string;
}
```

**Example**:
```
Budget Constraint:
  limit: "150M"
  current: "0M allocated"
  status: "limiting" (not blocking)
  
Workforce Constraint:
  limit: "20% capacity available"
  current: "0% allocated"
  status: "acceptable"
  
Timeline Constraint:
  limit: "4 weeks"
  current: "0 weeks elapsed"
  status: "acceptable"
```

---

### 5. Opportunity Graph

**Purpose**: Generate strategic alternatives

```typescript
interface OpportunityGraph {
  possibilities: Possibility[];
  prioritization: {
    highImpactHighFeasibility: string[];
    highImpactLowFeasibility: string[];
    lowImpactHighFeasibility: string[];
    lowImpactLowFeasibility: string[];
  };
  selectedTop5: Possibility[];
}

interface Possibility {
  id: string;
  name: string;
  potential: number;      // Revenue impact
  feasibility: number;    // 0-100%
  roi: number;
  category: 'acquisition' | 'retention' | 'monetization' | 'efficiency';
}
```

**Example**:
```
20 Possibilities Generated:

High Impact + High Feasibility:
  1. Win-back (600M, 90%, ROI 1200%)
  2. Upsell (500M, 80%, ROI 1250%)
  3. Weekend (400M, 95%, ROI 1333%)

High Impact + Medium Feasibility:
  4. TikTok (400M, 60%, ROI 700%)
  5. Referral (300M, 70%, ROI 750%)

Low Impact:
  6-20. (Various small initiatives)

Selected Top 5:
  [1, 2, 3, 4, 5]
```

---

### 6. Strategy Graph

**Purpose**: Generate and evaluate strategic options

```typescript
interface StrategyGraph {
  alternatives: Strategy[];
  tradeoffs: Tradeoff[];
  reasoning: LogicChain;
  selectedStrategy: Strategy;
}

interface Strategy {
  name: string;
  initiatives: string[];
  expectedRevenue: number;
  budget: number;
  risk: 'low' | 'medium' | 'high';
  tradeoffs: string[];
}
```

**Example**:
```
Alternative A: Conservative
  initiatives: [Win-back, Upsell, Weekend]
  expectedRevenue: 1.5B (goal exactly)
  budget: 120M
  risk: LOW
  tradeoff: "No safety margin, no exploration"

Alternative B: Balanced (SELECTED)
  initiatives: [Win-back, Upsell, Weekend, TikTok]
  expectedRevenue: 1.7B (113% of goal)
  budget: 135M
  risk: MEDIUM
  tradeoff: "TikTok uncertain, but acceptable"

Alternative C: Aggressive
  initiatives: [All 5]
  expectedRevenue: 2.0B
  budget: 190M (EXCEEDS LIMIT)
  risk: HIGH
  tradeoff: "Budget overrun, execution quality risk"

Reasoning:
  Premise: Goal = 1.5B
  Premise: Conservative = 1.5B (no margin)
  Premise: TikTok adds 200M at 700% ROI
  Conclusion: Balanced optimal (1.7B with margin)
```

---

### 7. Simulation Graph

**Purpose**: Monte Carlo simulation of strategy

```typescript
interface SimulationGraph {
  strategy: Strategy;
  scenarios: Scenario[];
  expectedValue: number;
  probabilitySuccess: number;
  convergence: boolean;   // Pass/Fail
}

interface Scenario {
  name: 'optimistic' | 'realistic' | 'pessimistic';
  probability: number;
  revenue: number;
  assumptions: string[];
}
```

**Example - Iteration 1**:
```
Strategy: Balanced (Win-back + Upsell + Weekend + TikTok)

Scenario 1 (Optimistic 20%): 2.3B
Scenario 2 (Realistic 60%): 1.7B
Scenario 3 (Pessimistic 20%): 1.13B

Expected Value: 1.706B
P(Success): 80%

Convergence: PASS ✅ (EV > Goal, P(Success) > 75%)
```

**Example - Iteration with FAIL**:
```
Strategy: TikTok-Only

Scenario 1 (Optimistic 20%): 3.0B
Scenario 2 (Realistic 40%): 1.5B
Scenario 3 (Pessimistic 40%): 0.5B

Expected Value: 1.4B
P(Success): 60%

Convergence: FAIL ❌ (P(Success) < 75%)

Action: Loop back to Strategy Graph
  → Generate new alternative
  → Simulate again
```

---

### 8. Risk Graph

**Purpose**: Assess and mitigate major risks

```typescript
interface RiskGraph {
  risks: Risk[];
  overallRiskLevel: 'low' | 'medium' | 'high';
  acceptability: boolean;
}

interface Risk {
  risk: string;
  probability: number;
  impact: string;
  mitigation: string;
  residualRisk: 'low' | 'medium' | 'high';
}
```

**Example**:
```
Risk 1: TikTok underperforms
  probability: 40%
  impact: "-150M revenue"
  mitigation: "Pilot approach, GO/NO-GO at Week 2"
  residualRisk: LOW

Risk 2: Win-back conversion low
  probability: 30%
  impact: "-200M revenue"
  mitigation: "A/B test emails, improve offer if needed"
  residualRisk: MEDIUM

Overall Risk: MEDIUM
Acceptability: TRUE (acceptable for growth initiative)
```

---

### 9. Recommendation Generator

**Purpose**: Package reasoning for CEO approval

```typescript
interface ExecutiveRecommendation {
  goal: ClarifiedGoal;
  diagnosis: DiagnosisGraph;
  constraints: ConstraintGraph;
  assumptions: Assumption[];
  alternatives: Strategy[];
  chosenStrategy: Strategy;
  simulationSummary: SimulationGraph;
  confidence: number;
  expectedOutcome: string;
  majorRisks: Risk[];
  successCriteria: {
    primary: string;
    secondary: string[];
  };
  
  // Meta
  generatedAt: string;
  reasoningTrace: GraphTrace;  // Full graph execution trace
}
```

---

## Reasoning Graph Engine Implementation

### Graph Execution Model

```typescript
async function executeReasoningGraph(
  clarifiedGoal: ClarifiedGoal
): Promise<ExecutiveRecommendation> {
  
  const context = new ReasoningContext();
  
  // Phase 1: Diagnosis
  const diagnosis = await executeDiagnosisGraph(clarifiedGoal, context);
  
  // Phase 2: Opportunities
  const opportunities = await executeOpportunityGraph(diagnosis, context);
  
  // Phase 3: Constraints
  const constraints = await executeConstraintGraph(opportunities, context);
  
  // Phase 4-7: Strategy + Simulation Loop
  let converged = false;
  let strategy: Strategy;
  let simulation: SimulationGraph;
  let iteration = 0;
  const maxIterations = 5;
  
  while (!converged && iteration < maxIterations) {
    iteration++;
    
    // Generate strategy
    strategy = await executeStrategyGraph(
      opportunities,
      constraints,
      context
    );
    
    // Simulate
    simulation = await executeSimulationGraph(strategy, context);
    
    // Check convergence
    if (simulation.probabilitySuccess >= 0.75 && 
        simulation.expectedValue >= clarifiedGoal.target) {
      converged = true;
    } else {
      // Refine constraints or strategy
      constraints = await refineConstraints(simulation, constraints);
      context.addFailure(strategy, simulation);
    }
  }
  
  if (!converged) {
    throw new Error("Could not find acceptable strategy after 5 iterations");
  }
  
  // Phase 8: Risk Assessment
  const risks = await executeRiskGraph(strategy, simulation, context);
  
  // Phase 9: Generate Recommendation
  return {
    goal: clarifiedGoal,
    diagnosis,
    constraints,
    assumptions: extractAssumptions(context),
    alternatives: context.getAllStrategies(),
    chosenStrategy: strategy,
    simulationSummary: simulation,
    confidence: simulation.probabilitySuccess,
    expectedOutcome: `${simulation.expectedValue}B revenue`,
    majorRisks: risks.risks,
    successCriteria: {
      primary: `Revenue >= ${clarifiedGoal.target}B`,
      secondary: ["ROI > 10x", "Risk acceptable"]
    },
    generatedAt: new Date().toISOString(),
    reasoningTrace: context.getTrace()
  };
}
```

---

## Integration with Full Architecture

### New Flow: Reasoning → Planning → Execution

```
CEO Intent
    ↓
Goal Clarification Runtime
    ↓
Executive Intelligence Runtime (EIR)
    (Strategic Reasoning Graph)
    ↓
Executive Recommendation
    ↓
Human Approval Gate ⭐
    ↓
Decision Runtime
    (Tactical Decision)
    ↓
Planning Runtime ⭐ NEW
    (KPI / Budget / Timeline / Resource)
    ↓
Domain OS
    (Marketing / Finance / HR / Sales)
    ↓
Creative Runtime
    ↓
Execution Runtime
    ↓
Observation Runtime
    ↓
Learning Runtime
    ↓
Enterprise Knowledge Repository (EKR)
    ↓
(Feedback to EIR for future reasoning)
```

---

## Separation of Concerns

| Layer | Responsibility | Output |
|-------|----------------|--------|
| **EIR** | Strategic Reasoning | Executive Recommendation |
| **Approval** | Human decision gate | Approved/Rejected |
| **Decision** | Tactical decisions | Tactical Plan |
| **Planning** | KPI, Budget, Timeline | Operational Plan |
| **Domain OS** | Domain-specific ops | Execution Blueprint |
| **Creative** | Content production | Assets |
| **Execution** | Task orchestration | Published content |

---

## What Moved Out of EIR

### 1. KPI Decomposition → Planning Runtime

**Before (v1.0)**:
```typescript
// In EIR (WRONG)
kpiTree: {
  revenue: 6.5B,
  initiatives: [
    {
      name: "Win-back",
      target: 600M,
      kpis: {
        emailOpen: "30%",
        ctr: "8%",
        conversion: "15%"
      }
    }
  ]
}
```

**After (v2.0)**:
```typescript
// In EIR (Strategic only)
successCriteria: {
  primary: "Revenue >= 1.5B",
  secondary: ["ROI > 10x", "Risk acceptable"]
}

// In Planning Runtime (Operational)
kpiTree: {
  revenue: {
    winback: {
      customers: 66,
      emailOpen: "30%",
      ctr: "8%",
      conversion: "15%"
    }
  }
}
```

---

### 2. Resource Allocation → Planning Runtime

**Before (v1.0)**:
```typescript
// In EIR (WRONG)
resourcePlan: {
  budget: {
    winback: 50M,
    breakdown: {
      emailPlatform: 5M,
      creative: 10M,
      incentives: 35M
    }
  },
  workforce: {
    emailMarketer: "30%",
    designer: "20%"
  },
  timeline: {
    week1: ["Setup", "Design"],
    week2: ["Launch", "Monitor"]
  }
}
```

**After (v2.0)**:
```typescript
// In EIR (Strategic only)
chosenStrategy: {
  name: "Balanced",
  initiatives: ["Win-back", "Upsell", "Weekend", "TikTok"],
  budget: 135M,
  timeline: "4 weeks"
}

// In Planning Runtime (Operational)
operationalPlan: {
  budget: {
    total: 135M,
    byInitiative: {...},
    byWeek: {...},
    breakdown: {...}
  },
  workforce: {
    byRole: {...},
    byInitiative: {...}
  },
  timeline: {
    milestones: [...],
    dependencies: [...]
  }
}
```

---

### 3. Marketing Metrics → Marketing OS

**Before (v1.0)**:
```typescript
// In EIR (WRONG)
metrics: {
  email_open_rate: "30%",
  landing_page_ctr: "15%",
  facebook_cpm: "50K",
  tiktok_views: "100K"
}
```

**After (v2.0)**:
```typescript
// In EIR (Strategic only)
diagnosis: {
  currentRevenue: 5B,
  rootCauses: ["Retention 45%", "No upselling"]
}

// In Marketing OS (Operational)
campaignMetrics: {
  emailCampaign: {
    sent: 220,
    opened: 66,
    openRate: "30%",
    ...
  }
}
```

---

## Learning Feedback Loop

### Strategic Learning

**New**: Learning Runtime now feeds back to EIR

```
EIR: "Recommended Balanced strategy"
    ↓
Execution: "Actual revenue = 1.85B"
    ↓
Learning: "Variance = +150M (better than expected)"
    ↓
Analysis: "TikTok performed better (250M vs 200M expected)"
    ↓
Lesson: "TikTok pilot approach was correct"
    ↓
EKR: Store pattern
    ↓
Future EIR: "Confidence in TikTok increases from 60% → 75%"
```

**Interface**:
```typescript
interface StrategyFeedback {
  plannedStrategy: Strategy;
  actualOutcome: Outcome;
  variance: {
    expected: number;
    actual: number;
    delta: number;
    deltaPercent: number;
  };
  lessons: Lesson[];
  confidenceAdjustment: {
    [possibility: string]: number;  // Adjust future confidence
  };
}
```

---

## Consequences

### Architectural Impact

**Before (v1.0)**:
```
Executive Capability (10 linear phases)
  → Does everything (strategy + planning + ops)
  → No loops
  → Workflow-based
```

**After (v2.0)**:
```
Executive Intelligence Runtime (Reasoning Graph)
  → Pure strategic reasoning
  → Loops until convergence
  → Planning separated
  → Graph-based
```

### Code Impact

**v1.0 Code** (Linear):
```typescript
async function execute() {
  const p1 = await phase1();
  const p2 = await phase2(p1);
  const p3 = await phase3(p2);
  // ... p4-p10
  return p10;
}
```

**v2.0 Code** (Graph):
```typescript
async function execute() {
  const diagnosis = await diagnosisGraph();
  const opportunities = await opportunityGraph(diagnosis);
  const constraints = await constraintGraph(opportunities);
  
  let converged = false;
  while (!converged) {
    const strategy = await strategyGraph(opportunities, constraints);
    const simulation = await simulationGraph(strategy);
    
    if (simulation.pass) {
      converged = true;
      return buildRecommendation(strategy, simulation);
    } else {
      constraints = refineConstraints(simulation);
    }
  }
}
```

---

## Migration from v1.0

### Phase 1: Extract Planning Runtime (Month 1)
- Move KPI decomposition out of EIR
- Move resource allocation out of EIR
- Move timeline planning out of EIR
- Create Planning Runtime spec (ADR-0011)

### Phase 2: Rebuild EIR as Graph Engine (Month 2-3)
- Replace linear pipeline with graph engine
- Implement loop logic
- Implement convergence checks
- Add reasoning trace

### Phase 3: Integration (Month 4)
- Connect EIR → Approval Gate → Decision → Planning
- Test end-to-end flow
- Validate separation of concerns

### Phase 4: Learning Feedback (Month 5-6)
- Implement strategy feedback interface
- Connect Learning → EKR → EIR
- Test confidence adjustment

---

## Success Metrics

### Technical KPIs

| Metric | v1.0 Target | v2.0 Target |
|--------|-------------|-------------|
| Reasoning quality | 85% CEO approval | >90% CEO approval |
| Convergence rate | N/A (linear) | >95% within 3 iterations |
| Strategy improvement | N/A | +20% better outcomes YoY |
| Reasoning transparency | Medium | High (full graph trace) |

### Business KPIs

| Metric | Before EIR | With EIR v2.0 |
|--------|------------|---------------|
| Goal achievement | 70% | >90% |
| CEO trust | 3.8/5 | >4.8/5 |
| Strategic quality | Manual | AI COO-level |
| Planning time | Days | Hours |

---

## Conclusion

ADR-0010 v2.0 transforms Executive from a linear workflow into a **true reasoning engine**.

Key improvements:
1. ✅ **Graph-based reasoning** (not linear pipeline)
2. ✅ **Pure strategic focus** (no operational concerns)
3. ✅ **Iterative convergence** (loops until optimal)
4. ✅ **Separated Planning** (new Planning Runtime)
5. ✅ **Learning feedback** (improves over time)

This is the **cognitive architecture** that makes Bella EOS an AI COO.

---

*Document Version*: 2.0 (Revised)  
*Date*: 2026-07-27  
*Status*: Proposed - Awaiting Architecture Board Approval  
*Supersedes*: ADR-0010 v1.0  
*Related*: ADR-0011 (Planning Runtime), ADR-0007 (Capability-based Architecture)
