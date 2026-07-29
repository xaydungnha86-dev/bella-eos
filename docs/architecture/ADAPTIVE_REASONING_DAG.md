# Adaptive Reasoning DAG - Multi-Path Feedback Architecture

**Version**: 1.0 (Upgrade from v3.0)  
**Date**: 2026-07-27  
**Status**: Proposed Enhancement  
**Supersedes**: Simple loop-back in REASONING_GRAPH_ENGINE.md

---

## Problem with Simple Loop

### Current Architecture (v3.0)

```
Strategy → Simulation → FAIL → Strategy (always loops back here)
```

**Limitation**: Assumes problem is always in Strategy node.

**Reality**: Problem could be in:
- ❌ **Diagnosis** (wrong root cause)
- ❌ **Constraint** (missed critical limit)
- ❌ **Opportunity** (insufficient alternatives)
- ❌ **Strategy** (poor combination)

**Solution**: Intelligent multi-path feedback based on failure analysis.

---

## Adaptive DAG Architecture

### Full DAG with Multi-Path Feedback

```
                      Goal
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
      ┌──────────┐          ┌──────────┐
      │Diagnosis │◄─────┐   │Constraint│◄─────┐
      └────┬─────┘      │   └────┬─────┘      │
           │            │        │            │
           │            │        │            │
           └────────┬───┴────────┘            │
                    ▼                         │
              ┌──────────┐                    │
              │Opportunity│◄───────────────────┤
              └────┬─────┘                    │
                   │                          │
          ┌────────┴────────┐                 │
          ▼                 ▼                 │
    ┌──────────┐      ┌──────────┐           │
    │StrategyA │      │StrategyB │           │
    └────┬─────┘      └────┬─────┘           │
         │                 │                 │
         └────────┬─────────┘                │
                  ▼                          │
            ┌──────────┐                     │
            │Simulation│                     │
            └────┬─────┘                     │
                 │                          │
          ┌──────┴──────┐                   │
          ▼             ▼                   │
       PASS          FAIL                   │
          │             │                   │
          │     ┌───────┴───────┐           │
          │     ▼       ▼       ▼           │
          │  Retry   Retry   Retry          │
          │  Diag.   Const.  Opport.        │
          │     │       │       │           │
          │     └───────┴───────┴───────────┘
          │
          ▼
     ┌──────────┐
     │   Risk   │
     └────┬─────┘
          │
          ▼
  ┌──────────────┐
  │Recommendation│
  └──────────────┘
```

**Key Features**:
1. ✅ **Parallel Exploration**: Diagnosis and Constraint run in parallel
2. ✅ **Branch Points**: Multiple strategies generated in parallel
3. ✅ **Intelligent Retry**: Failure analysis determines which node to retry
4. ✅ **Cycle Prevention**: DAG structure + max iterations prevent infinite loops

---

## Failure Analysis Engine

### Interface

```typescript
interface FailureAnalysis {
  reason: FailureReason;
  evidence: string[];
  recommendedRetryNode: NodeType;
  confidence: number;
  secondaryOptions: {
    node: NodeType;
    confidence: number;
  }[];
}

enum FailureReason {
  WRONG_DIAGNOSIS = "diagnosis",
  MISSED_CONSTRAINT = "constraint",
  INSUFFICIENT_OPPORTUNITIES = "opportunity",
  POOR_STRATEGY = "strategy",
  SIMULATION_ERROR = "simulation"
}

type NodeType = 'diagnosis' | 'constraint' | 'opportunity' | 'strategy' | 'simulation';
```

---

### Symptom Detection

#### 1. Wrong Diagnosis Symptoms

```typescript
function detectWrongDiagnosis(
  simulation: SimulationResult,
  context: ReasoningContext
): Symptom {
  const symptoms: string[] = [];
  let score = 0;
  
  // Symptom 1: ALL strategies fail (80% weight)
  const allFailed = context.getAllStrategies()
    .every(s => !s.simulation.convergence);
  if (allFailed) {
    symptoms.push("All strategies failed → likely wrong root cause");
    score += 0.8;
  }
  
  // Symptom 2: Expected value FAR below goal (60% weight)
  const evGap = (context.goal.target - simulation.expectedValue) / context.goal.target;
  if (evGap > 0.5) {
    symptoms.push(`EV ${Math.round(evGap * 100)}% below goal → diagnosis may be wrong`);
    score += 0.6;
  }
  
  // Symptom 3: Opportunities don't address root causes (70% weight)
  const opportunities = context.getOpportunities();
  const rootCauses = context.getDiagnosis().rootCauses;
  const addressed = opportunities.filter(o => 
    rootCauses.some(rc => o.addresses.includes(rc.id))
  );
  const coverageRate = addressed.length / rootCauses.length;
  if (coverageRate < 0.5) {
    symptoms.push(`Only ${Math.round(coverageRate * 100)}% root causes addressed`);
    score += 0.7;
  }
  
  // Symptom 4: Diagnosis age > 1 iteration (40% weight)
  if (context.getDiagnosisAge() > 1) {
    symptoms.push("Diagnosis not refreshed → may be stale");
    score += 0.4;
  }
  
  return {
    type: FailureReason.WRONG_DIAGNOSIS,
    symptoms,
    score: Math.min(score, 1.0),
    retryNode: 'diagnosis'
  };
}
```

**Example Detection**:
```
Iteration 1: Diagnosed "poor acquisition"
  → Generated acquisition-focused opportunities
  → All strategies failed (EV = 0.8B vs 1.5B goal)

Analysis:
  ✅ All strategies failed (score +0.8)
  ✅ EV 47% below goal (score +0.6)
  ✅ Churn data shows 55% (not in diagnosis) (score +0.7)
  
  Total Score: 0.93 → HIGH confidence wrong diagnosis
  
Recommendation: Retry Diagnosis Node
```

---

#### 2. Missed Constraint Symptoms

```typescript
function detectMissedConstraint(
  simulation: SimulationResult,
  context: ReasoningContext
): Symptom {
  const symptoms: string[] = [];
  let score = 0;
  
  // Symptom 1: Strategy violates implicit constraint (90% weight)
  const strategy = context.getCurrentStrategy();
  const constraints = context.getConstraints();
  
  if (strategy.budget > constraints.budget.limit) {
    symptoms.push(`Budget ${strategy.budget}M exceeds ${constraints.budget.limit}M limit`);
    score += 0.9;
  }
  
  if (strategy.workforce > constraints.workforce.limit) {
    symptoms.push(`Workforce ${strategy.workforce}% exceeds ${constraints.workforce.limit}%`);
    score += 0.9;
  }
  
  // Symptom 2: Simulation reveals hidden bottleneck (80% weight)
  if (simulation.failureReason?.includes("capacity")) {
    symptoms.push("Capacity bottleneck revealed in simulation");
    score += 0.8;
  }
  
  if (simulation.failureReason?.includes("timeline")) {
    symptoms.push("Timeline infeasible → dependency constraint missed");
    score += 0.8;
  }
  
  // Symptom 3: External constraint violation (70% weight)
  if (simulation.failureReason?.includes("policy")) {
    symptoms.push("Policy violation → compliance constraint missed");
    score += 0.7;
  }
  
  // Symptom 4: Constraint count very low (50% weight)
  if (Object.keys(constraints).length < 4) {
    symptoms.push(`Only ${Object.keys(constraints).length} constraints checked → likely incomplete`);
    score += 0.5;
  }
  
  return {
    type: FailureReason.MISSED_CONSTRAINT,
    symptoms,
    score: Math.min(score, 1.0),
    retryNode: 'constraint'
  };
}
```

**Example Detection**:
```
Iteration 2: Strategy needs 30% workforce
  → Constraint only checked budget (missed workforce)
  → Simulation reveals: team can't handle 30%

Analysis:
  ✅ Workforce 30% exceeds 20% limit (score +0.9)
  ✅ Simulation failed on "capacity" (score +0.8)
  
  Total Score: 0.85 → HIGH confidence missed constraint
  
Recommendation: Retry Constraint Node (add workforce check)
```

---

#### 3. Insufficient Opportunities Symptoms

```typescript
function detectInsufficientOpportunities(
  simulation: SimulationResult,
  context: ReasoningContext
): Symptom {
  const symptoms: string[] = [];
  let score = 0;
  
  // Symptom 1: Best strategy STILL below goal (70% weight)
  const bestStrategy = context.getBestStrategy();
  const gap = (context.goal.target - bestStrategy.expectedValue) / context.goal.target;
  if (gap > 0.2) {
    symptoms.push(`Best strategy ${Math.round((1 - gap) * 100)}% of goal → opportunity set weak`);
    score += 0.7;
  }
  
  // Symptom 2: Few high-impact opportunities (60% weight)
  const opportunities = context.getOpportunities();
  const highImpact = opportunities.filter(o => o.potential > context.goal.target * 0.3);
  if (highImpact.length < 3) {
    symptoms.push(`Only ${highImpact.length} high-impact options (need 3+)`);
    score += 0.6;
  }
  
  // Symptom 3: Opportunities clustered in one category (50% weight)
  const categories = [...new Set(opportunities.map(o => o.category))];
  if (categories.length < 3) {
    symptoms.push(`Only ${categories.length} categories → lack diversity`);
    score += 0.5;
  }
  
  // Symptom 4: Total opportunity count low (40% weight)
  if (opportunities.length < 10) {
    symptoms.push(`Only ${opportunities.length} opportunities generated (need 20+)`);
    score += 0.4;
  }
  
  return {
    type: FailureReason.INSUFFICIENT_OPPORTUNITIES,
    symptoms,
    score: Math.min(score, 1.0),
    retryNode: 'opportunity'
  };
}
```

**Example Detection**:
```
Iteration 1: Only 5 opportunities
  → Best strategy = 1.2B (vs 1.5B goal)
  → All retention-focused (no acquisition)

Analysis:
  ✅ Best strategy 80% of goal (score +0.7)
  ✅ Only 2 high-impact options (score +0.6)
  ✅ Only 1 category (retention) (score +0.5)
  ✅ Only 5 opportunities (score +0.4)
  
  Total Score: 0.88 → HIGH confidence insufficient opportunities
  
Recommendation: Retry Opportunity Node (generate 20+ across categories)
```

---

#### 4. Poor Strategy Symptoms

```typescript
function detectPoorStrategy(
  simulation: SimulationResult,
  context: ReasoningContext
): Symptom {
  const symptoms: string[] = [];
  let score = 0;
  
  // Symptom 1: Internal strategy conflict (80% weight)
  if (simulation.failureReason?.includes("conflict")) {
    symptoms.push("Strategy has internal conflicts → poor combination");
    score += 0.8;
  }
  
  // Symptom 2: High risk reduces value significantly (70% weight)
  const riskAdjustedValue = simulation.riskAdjustedValue || simulation.expectedValue;
  const riskPenalty = 1 - (riskAdjustedValue / simulation.rawValue);
  if (riskPenalty > 0.4) {
    symptoms.push(`Risk reduces value by ${Math.round(riskPenalty * 100)}% → too aggressive`);
    score += 0.7;
  }
  
  // Symptom 3: Few alternatives explored (60% weight)
  const strategies = context.getAllStrategies();
  if (strategies.length < 3) {
    symptoms.push(`Only ${strategies.length} alternatives → explore more combinations`);
    score += 0.6;
  }
  
  // Symptom 4: Strategy doesn't use best opportunities (50% weight)
  const strategy = context.getCurrentStrategy();
  const opportunities = context.getOpportunities();
  const topOpportunities = opportunities
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);
  const usedTopOps = strategy.initiatives.filter(i => 
    topOpportunities.some(o => o.id === i)
  );
  if (usedTopOps.length < 3) {
    symptoms.push(`Only using ${usedTopOps.length}/5 top ROI opportunities`);
    score += 0.5;
  }
  
  return {
    type: FailureReason.POOR_STRATEGY,
    symptoms,
    score: Math.min(score, 1.0),
    retryNode: 'strategy'
  };
}
```

**Example Detection**:
```
Iteration 3: Strategy combines conflicting initiatives
  → Simulation reveals resource contention
  → Risk-adjusted value drops 50%

Analysis:
  ✅ Strategy conflict detected (score +0.8)
  ✅ Risk penalty 50% (score +0.7)
  
  Total Score: 0.75 → HIGH confidence poor strategy
  
Recommendation: Retry Strategy Node (remove conflicting initiatives)
```

---

## Adaptive Loop Execution

### Master Loop with Intelligent Retry

```typescript
async function executeAdaptiveDAG(
  goal: ClarifiedGoal
): Promise<ExecutiveRecommendation> {
  
  const context = new ReasoningContext(goal);
  const maxIterations = 10;
  let iteration = 0;
  
  // Initial forward pass
  let diagnosis = await executeDiagnosisNode(goal, context);
  let constraints = await executeConstraintNode(goal, context);
  let opportunities = await executeOpportunityNode(diagnosis, constraints, context);
  
  while (iteration < maxIterations) {
    iteration++;
    
    // Generate strategy
    const strategy = await executeStrategyNode(opportunities, constraints, context);
    
    // Simulate
    const simulation = await executeSimulationNode(strategy, context);
    
    // Check convergence
    if (simulation.convergence) {
      // PASS → proceed to risk assessment
      const risks = await executeRiskNode(strategy, simulation, context);
      return buildRecommendation(context);
    }
    
    // FAIL → Analyze failure
    const failureAnalysis = await analyzeFailure(simulation, context);
    
    context.recordFailure({
      iteration,
      strategy,
      simulation,
      analysis: failureAnalysis
    });
    
    // Intelligent retry based on analysis
    switch (failureAnalysis.recommendedRetryNode) {
      case 'diagnosis':
        console.log(`[Iteration ${iteration}] Retrying Diagnosis (confidence ${failureAnalysis.confidence})`);
        diagnosis = await executeDiagnosisNode(goal, context, { fresh: true });
        // Re-run downstream nodes
        opportunities = await executeOpportunityNode(diagnosis, constraints, context);
        break;
        
      case 'constraint':
        console.log(`[Iteration ${iteration}] Retrying Constraint (confidence ${failureAnalysis.confidence})`);
        constraints = await executeConstraintNode(goal, context, { 
          addMissing: failureAnalysis.evidence 
        });
        break;
        
      case 'opportunity':
        console.log(`[Iteration ${iteration}] Retrying Opportunity (confidence ${failureAnalysis.confidence})`);
        opportunities = await executeOpportunityNode(diagnosis, constraints, context, {
          generateMore: true,
          diversify: true
        });
        break;
        
      case 'strategy':
        console.log(`[Iteration ${iteration}] Retrying Strategy (confidence ${failureAnalysis.confidence})`);
        // Strategy retry is implicit in next loop iteration
        break;
    }
  }
  
  throw new Error(`Did not converge after ${maxIterations} iterations`);
}
```

---

### Failure Analysis Aggregator

```typescript
async function analyzeFailure(
  simulation: SimulationResult,
  context: ReasoningContext
): Promise<FailureAnalysis> {
  
  // Run all symptom detectors in parallel
  const [
    diagnosisSymptom,
    constraintSymptom,
    opportunitySymptom,
    strategySymptom
  ] = await Promise.all([
    detectWrongDiagnosis(simulation, context),
    detectMissedConstraint(simulation, context),
    detectInsufficientOpportunities(simulation, context),
    detectPoorStrategy(simulation, context)
  ]);
  
  // Rank by confidence score
  const ranked = [
    diagnosisSymptom,
    constraintSymptom,
    opportunitySymptom,
    strategySymptom
  ].sort((a, b) => b.score - a.score);
  
  const winner = ranked[0];
  
  return {
    reason: winner.type,
    evidence: winner.symptoms,
    recommendedRetryNode: winner.retryNode,
    confidence: winner.score,
    secondaryOptions: ranked.slice(1, 3).map(s => ({
      node: s.retryNode,
      confidence: s.score
    }))
  };
}
```

---

## Complete Example: Multi-Path Retry

### Scenario: "Tăng doanh thu spa 30%"

#### Iteration 1: Wrong Diagnosis

```
[Forward Pass]
Diagnosis: "Revenue flat due to POOR ACQUISITION"
  Root Cause: Not enough new customers
  Evidence: New customer rate 60/month

Constraint: Budget 150M, Workforce 20%

Opportunity: (Acquisition-focused)
  1. Facebook Ads scale
  2. Google Ads launch
  3. TikTok channel
  4. Influencer partnerships
  5. Referral program

Strategy: Aggressive Acquisition
  Initiatives: [Facebook, Google, TikTok, Influencer, Referral]
  Budget: 180M (EXCEEDS 150M!)
  Expected: 1.0B

Simulation:
  EV: 0.8B (53% of 1.5B goal)
  P(Success): 35%
  Convergence: FAIL ❌
```

```
[Failure Analysis]
Wrong Diagnosis Symptoms:
  ✅ All strategies failed (score +0.8)
  ✅ EV 47% below goal (score +0.6)
  ✅ Historical data shows churn 55% (not in diagnosis) (score +0.7)
  ✅ Opportunities don't address churn (score +0.7)
  Total: 0.95

Missed Constraint Symptoms:
  ✅ Budget 180M > 150M limit (score +0.9)
  Total: 0.9

Insufficient Opportunity Symptoms:
  - Best strategy 67% of goal (score +0.7)
  Total: 0.7

Poor Strategy Symptoms:
  - Budget violation (already caught by constraint)
  Total: 0.3

WINNER: Wrong Diagnosis (0.95)
SECOND: Missed Constraint (0.9)

Recommendation: Retry Diagnosis Node (primary)
               Also flag constraint check needed
```

#### Iteration 2: Re-Diagnosis + Fix Constraint

```
[Retry Diagnosis]
Diagnosis: "Revenue flat due to HIGH CHURN (55%)"
  Root Cause: No retention system
  Evidence:
    - 220 customers churned last 3 months
    - 0 follow-up emails
    - 0 loyalty program
    - Industry retention 60% vs our 45%

[Re-run Constraint with Flag]
Constraint: Budget 150M, Workforce 20%, Policy: No discounts >25%
  (Added policy constraint based on previous budget violation)

[Re-run Opportunity]
Opportunity: (Retention-focused)
  1. Win-back campaign (600M potential)
  2. Loyalty program (300M potential)
  3. Upsell program (500M potential)
  4. Weekend promotion (400M potential)
  5. Email nurture (100M potential)

Strategy: Retention-First
  Initiatives: [Win-back, Upsell, Weekend]
  Budget: 120M ✅
  Expected: 1.5B

Simulation:
  EV: 1.5B (100% of goal)
  P(Success): 75% (JUST at threshold)
  Convergence: BORDERLINE ⚠️
```

```
[Failure Analysis]
Wrong Diagnosis: 0.1 (low)
Missed Constraint: 0.2 (low)
Insufficient Opportunity: 0.65 (medium)
  - Only 75% confidence (borderline)
  - Only 3 high-impact options used
  - Suggested: Add TikTok for buffer
Poor Strategy: 0.4 (low-medium)

WINNER: Insufficient Opportunity (0.65)

Recommendation: Retry Opportunity Node (add more options for safety margin)
```

#### Iteration 3: Expand Opportunities

```
[Retry Opportunity]
Opportunity: (Expanded to 10 options)
  1. Win-back campaign (600M)
  2. Upsell program (500M)
  3. Weekend promotion (400M)
  4. TikTok pilot (200M) ⭐ NEW
  5. Referral program (300M) ⭐ NEW
  6. Loyalty tiers (250M)
  7. VIP program (150M)
  8. Community events (100M)
  9. Partnership (200M)
  10. Mobile app (150M)

Strategy: Balanced
  Initiatives: [Win-back, Upsell, Weekend, TikTok-pilot]
  Budget: 135M ✅
  Expected: 1.7B

Simulation:
  EV: 1.706B (114% of goal)
  P(Success): 80%
  Convergence: PASS ✅
```

```
[Success]
Iterations: 3
Retries: 
  - Iteration 1 → 2: Diagnosis (wrong root cause)
  - Iteration 2 → 3: Opportunity (insufficient options)

Final Recommendation:
  Strategy: Balanced (Win-back + Upsell + Weekend + TikTok pilot)
  Expected: 1.7B
  Confidence: 80%
  
Reasoning Trace:
  [1] Initial diagnosis was wrong (acquisition vs retention)
  [2] Re-diagnosed correctly (retention issue)
  [3] Expanded opportunity set for safety margin
  [4] Converged on balanced strategy
```

---

## Benefits of Adaptive DAG

| Feature | Simple Loop | Adaptive DAG |
|---------|-------------|--------------|
| **Retry Target** | Always Strategy | Any node (intelligent) |
| **Failure Detection** | Generic | Symptom-based |
| **Root Cause** | Not identified | Explicitly identified |
| **Convergence Speed** | Slower | Faster (fixes right node) |
| **Reasoning Quality** | Medium | High (self-correcting) |
| **Transparency** | Basic | Full trace of retries |

---

## Implementation

### ReasoningContext Enhancement

```typescript
class ReasoningContext {
  private diagnosisAge: number = 0;
  private constraintAge: number = 0;
  private opportunityAge: number = 0;
  
  private failures: FailureRecord[] = [];
  
  // Track node freshness
  markDiagnosisRefreshed() {
    this.diagnosisAge = 0;
  }
  
  incrementNodeAges() {
    this.diagnosisAge++;
    this.constraintAge++;
    this.opportunityAge++;
  }
  
  getDiagnosisAge(): number {
    return this.diagnosisAge;
  }
  
  // Track failures for pattern analysis
  recordFailure(failure: FailureRecord) {
    this.failures.push(failure);
  }
  
  getFailurePattern(): string[] {
    return this.failures.map(f => f.analysis.reason);
  }
  
  // Prevent infinite loops on same node
  getNodeRetryCount(node: NodeType): number {
    return this.failures.filter(f => 
      f.analysis.recommendedRetryNode === node
    ).length;
  }
}
```

---

## Success Metrics

| Metric | Simple Loop | Adaptive DAG Target |
|--------|-------------|---------------------|
| Average iterations | 3-5 | 2-4 |
| Convergence rate | 85% | >95% |
| Wrong diagnosis caught | 20% | >80% |
| Missed constraint caught | 30% | >85% |
| Reasoning quality | 80% | >90% |

---

## Conclusion

Adaptive Reasoning DAG transforms EIR from a **simple loop** into a **self-correcting reasoning system**.

Key improvements:
1. ✅ **Multi-path feedback** (not just Strategy retry)
2. ✅ **Symptom-based detection** (identifies WHERE reasoning broke)
3. ✅ **Intelligent retry** (loops to appropriate node)
4. ✅ **Self-correcting** (fixes upstream errors)
5. ✅ **Faster convergence** (fixes root cause, not symptoms)

This is the **cognitive architecture** that makes Bella truly intelligent.

---

*Document Version*: 1.0  
*Date*: 2026-07-27  
*Status*: Proposed Enhancement to v3.0  
*Impact*: CRITICAL - Transforms simple loop into intelligent reasoning
