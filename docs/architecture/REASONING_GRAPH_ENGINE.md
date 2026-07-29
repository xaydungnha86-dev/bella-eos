# Reasoning Graph Engine - Core Architecture

**Version**: 1.0  
**Date**: 2026-07-27  
**Status**: Specification  
**Part of**: Executive Intelligence Runtime (EIR)

---

## Overview

The **Reasoning Graph Engine** is the core of Executive Intelligence Runtime.

It replaces linear pipelines with **graph-based iterative reasoning**.

---

## Core Concept

### Linear Pipeline (OLD ❌)

```
Phase1 → Phase2 → Phase3 → ... → Phase10
```

**Problems**:
- No loops (can't retry if strategy fails)
- No branches (can't explore alternatives)
- Workflow-based (not reasoning-based)
- Fixed sequence (can't adapt to context)

---

### Simple Reasoning Graph (v2.0 - Good but Limited)

```
Strategy → Simulation → FAIL → Refine → Strategy → Simulation → PASS
```

**Problem**: Loop only goes back to Strategy.

**What if the real problem is**:
- ❌ Diagnosis was wrong (misidentified root cause)
- ❌ Constraint was incomplete (missed a critical limit)
- ❌ Opportunity set was insufficient (didn't explore enough)

**Limitation**: Can't fix upstream reasoning errors.

---

### Adaptive Reasoning DAG (v3.0 - NEW ✅)

**Full Directed Acyclic Graph with Multi-Path Feedback**

```
                    Goal
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌──────────┐          ┌──────────┐
    │Diagnosis │◄─────┐   │Constraint│◄─────┐
    └────┬─────┘      │   └────┬─────┘      │
         │            │        │            │
         └────────┬───┘        │            │
                  ▼            │            │
            ┌──────────┐       │            │
            │Opportunity│◄──────┼────────────┤
            └────┬─────┘       │            │
                 │              │            │
        ┌────────┴────────┐    │            │
        ▼                 ▼    │            │
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
        │    ┌────────┼────────┐          │
        │    ▼        ▼        ▼          │
        │  Retry   Retry    Retry         │
        │  Diag.   Const.   Opport.       │
        │    │        │        │          │
        │    └────────┴────────┴──────────┘
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

**Key Innovation**: When simulation FAILS, system analyzes **WHY** and loops back to the **appropriate node**:

| Failure Reason | Loop Back To | Action |
|----------------|--------------|--------|
| Wrong root cause | Diagnosis | Re-diagnose with new evidence |
| Missed constraint | Constraint | Add overlooked limits |
| Poor opportunity set | Opportunity | Generate more alternatives |
| Strategy not optimal | Strategy | Refine strategy logic |

**Benefits**:
- ✅ **Multi-path feedback** (not single loop)
- ✅ **Self-correcting** (fixes upstream errors)
- ✅ **Root cause analysis** (identifies where reasoning broke)
- ✅ **Adaptive** (chooses optimal retry path)

---

## Graph Nodes

Each node is a **reasoning engine** with:
- **Input**: Previous node outputs
- **Process**: Domain-specific reasoning
- **Output**: Structured result
- **State**: Maintains reasoning trace

---

### Node 1: Diagnosis Graph

**Purpose**: Root cause analysis

**Input**:
- Clarified Goal
- Current business state (from EKR)

**Process**:
1. Identify symptoms
2. 5 Whys analysis for each symptom
3. Calculate impact
4. Identify opportunities

**Output**:
```typescript
interface DiagnosisResult {
  symptoms: string[];
  rootCauses: {
    symptom: string;
    cause: string;
    depth: number;
    impact: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
  opportunities: {
    name: string;
    potential: number;
  }[];
}
```

**Example**:
```
Input: "Revenue flat at 5B/month"

Process:
  Symptom: "Revenue not growing"
  Why 1: "Customer churn high (55%)"
  Why 2: "No follow-up after visit"
  Why 3: "CRM not configured"
  Why 4: "Team focused on acquisition"
  Why 5: "Belief: new customers = growth"

Output:
  Root Cause: "Wrong strategic focus"
  Impact: 33B/year lost
  Opportunity: "Win-back campaign → 825M/month"
```

---

### Node 2: Constraint Graph

**Purpose**: Identify what limits us

**Input**:
- Diagnosis Result
- Clarified Goal

**Process**:
1. Check budget limits
2. Check workforce capacity
3. Check timeline feasibility
4. Check technology readiness
5. Check policy compliance
6. Check market conditions

**Output**:
```typescript
interface ConstraintResult {
  budget: { limit: string; status: string };
  workforce: { limit: string; status: string };
  timeline: { limit: string; status: string };
  technology: { gaps: string[] };
  policy: { requirements: string[] };
  market: { conditions: string };
  
  blocking: Constraint[];    // Must fix before proceeding
  limiting: Constraint[];    // Reduces options
  acceptable: Constraint[];  // OK to proceed
}
```

---

### Node 3: Opportunity Graph

**Purpose**: Generate strategic alternatives

**Input**:
- Diagnosis Result
- Constraint Result

**Process**:
1. Generate 20+ possibilities
2. Score each (potential × feasibility)
3. Prioritize using impact-feasibility matrix
4. Select top 5

**Output**:
```typescript
interface OpportunityResult {
  possibilities: Possibility[];
  matrix: {
    highImpactHighFeasibility: Possibility[];
    highImpactLowFeasibility: Possibility[];
    lowImpactHighFeasibility: Possibility[];
    lowImpactLowFeasibility: Possibility[];
  };
  selectedTop5: Possibility[];
}
```

---

### Node 4: Strategy Graph

**Purpose**: Generate and evaluate strategic options

**Input**:
- Opportunity Result
- Constraint Result

**Process**:
1. Generate 3 strategic options (Conservative, Balanced, Aggressive)
2. For each option:
   - Estimate expected value
   - Identify tradeoffs
   - Build logic chain
3. Select best option based on risk-adjusted value

**Output**:
```typescript
interface StrategyResult {
  alternatives: Strategy[];
  tradeoffs: Tradeoff[];
  reasoning: LogicChain;
  selectedStrategy: Strategy;
  confidence: number;
}
```

---

### Node 5: Simulation Graph (with Loop)

**Purpose**: Test strategy via Monte Carlo simulation

**Input**:
- Selected Strategy

**Process**:
1. Generate 3 scenarios (Optimistic, Realistic, Pessimistic)
2. Assign probabilities
3. Calculate expected value
4. Calculate P(Success)
5. **Check convergence**:
   - IF P(Success) >= 75% AND EV >= Goal: PASS
   - ELSE: FAIL → loop back to Strategy Graph

**Output**:
```typescript
interface SimulationResult {
  scenarios: Scenario[];
  expectedValue: number;
  probabilitySuccess: number;
  convergence: boolean;  // true = PASS, false = FAIL
  reason?: string;       // If FAIL, why?
}
```

**Loop Logic**:
```typescript
async function simulateWithLoop(
  strategy: Strategy,
  maxIterations: number = 5
): Promise<SimulationResult> {
  
  let iteration = 0;
  
  while (iteration < maxIterations) {
    iteration++;
    
    const simulation = await runMonteCarlo(strategy);
    
    if (simulation.probabilitySuccess >= 0.75 && 
        simulation.expectedValue >= goal.target) {
      return { ...simulation, convergence: true };
    }
    
    // FAIL → Refine strategy
    const refinedStrategy = await refineStrategy(
      strategy,
      simulation.reason
    );
    strategy = refinedStrategy;
  }
  
  throw new Error("Could not converge after 5 iterations");
}
```

---

### Node 6: Risk Graph

**Purpose**: Assess major risks

**Input**:
- Selected Strategy
- Simulation Result

**Process**:
1. Identify major risks
2. Estimate probability and impact
3. Define mitigations
4. Calculate residual risk
5. Assess overall acceptability

**Output**:
```typescript
interface RiskResult {
  risks: Risk[];
  overallRiskLevel: 'low' | 'medium' | 'high';
  acceptable: boolean;
}
```

---

### Node 7: Recommendation Generator

**Purpose**: Package for CEO approval

**Input**:
- All previous nodes

**Output**:
```typescript
interface ExecutiveRecommendation {
  goal: ClarifiedGoal;
  diagnosis: DiagnosisResult;
  constraints: ConstraintResult;
  assumptions: Assumption[];
  alternatives: Strategy[];
  chosenStrategy: Strategy;
  simulationSummary: SimulationResult;
  confidence: number;
  expectedOutcome: string;
  majorRisks: Risk[];
  successCriteria: SuccessCriteria;
  
  // Meta
  generatedAt: string;
  reasoningTrace: GraphTrace;  // Full execution trace
}
```

---

## Graph Execution Engine

### Interface

```typescript
interface ReasoningGraphEngine {
  // Execute full graph
  execute(goal: ClarifiedGoal): Promise<ExecutiveRecommendation>;
  
  // Execute single node
  executeNode(
    nodeType: NodeType,
    input: any,
    context: ReasoningContext
  ): Promise<any>;
  
  // Check if graph has converged
  hasConverged(context: ReasoningContext): boolean;
  
  // Get reasoning trace
  getTrace(context: ReasoningContext): GraphTrace;
}
```

---

### Execution Flow

```typescript
async function execute(
  goal: ClarifiedGoal
): Promise<ExecutiveRecommendation> {
  
  const context = new ReasoningContext();
  
  // Phase 1: Diagnosis
  const diagnosis = await executeNode(
    'diagnosis',
    { goal },
    context
  );
  
  // Phase 2: Constraints
  const constraints = await executeNode(
    'constraint',
    { goal, diagnosis },
    context
  );
  
  // Phase 3: Opportunities
  const opportunities = await executeNode(
    'opportunity',
    { diagnosis, constraints },
    context
  );
  
  // Phase 4-5: Strategy + Simulation Loop
  let converged = false;
  let strategy: Strategy;
  let simulation: SimulationResult;
  let iteration = 0;
  
  while (!converged && iteration < 5) {
    iteration++;
    
    // Generate strategy
    strategy = await executeNode(
      'strategy',
      { opportunities, constraints, context },
      context
    );
    
    // Simulate
    simulation = await executeNode(
      'simulation',
      { strategy, goal },
      context
    );
    
    // Check convergence
    if (simulation.convergence) {
      converged = true;
    } else {
      // Refine constraints based on simulation failure
      constraints = await refineConstraints(
        constraints,
        simulation.reason
      );
      
      context.recordFailure(strategy, simulation);
    }
  }
  
  if (!converged) {
    throw new Error("Graph did not converge");
  }
  
  // Phase 6: Risk assessment
  const risks = await executeNode(
    'risk',
    { strategy, simulation },
    context
  );
  
  // Phase 7: Generate recommendation
  return {
    goal,
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
      primary: `Revenue >= ${goal.target}B`,
      secondary: ["ROI > 10x", "Risk acceptable"]
    },
    generatedAt: new Date().toISOString(),
    reasoningTrace: context.getTrace()
  };
}
```

---

## Reasoning Context

**Purpose**: Maintain state across graph execution

```typescript
class ReasoningContext {
  private trace: GraphTrace = [];
  private strategies: Strategy[] = [];
  private failures: { strategy: Strategy; reason: string }[] = [];
  private assumptions: Assumption[] = [];
  
  recordNodeExecution(
    node: string,
    input: any,
    output: any,
    duration: number
  ) {
    this.trace.push({
      node,
      input,
      output,
      duration,
      timestamp: new Date()
    });
  }
  
  recordStrategy(strategy: Strategy) {
    this.strategies.push(strategy);
  }
  
  recordFailure(strategy: Strategy, simulation: SimulationResult) {
    this.failures.push({
      strategy,
      reason: simulation.reason
    });
  }
  
  addAssumption(assumption: Assumption) {
    this.assumptions.push(assumption);
  }
  
  getAllStrategies(): Strategy[] {
    return this.strategies;
  }
  
  getTrace(): GraphTrace {
    return this.trace;
  }
  
  getFailures() {
    return this.failures;
  }
}
```

---

## Convergence Criteria

### Strategy-Simulation Loop

**Converged IF**:
```typescript
simulation.probabilitySuccess >= 0.75 
  AND 
simulation.expectedValue >= goal.target
```

**Failed IF**:
```typescript
simulation.probabilitySuccess < 0.75 
  OR 
simulation.expectedValue < goal.target
```

**Action on Failure**:
1. Analyze why simulation failed
2. Refine constraints (e.g., increase budget, extend timeline)
3. Generate new strategy with refined constraints
4. Simulate again
5. Repeat max 5 times

---

## Example: Full Graph Execution

### Input

```
CEO: "Tăng doanh thu spa tháng sau 30%"
```

### Execution Trace

```
[Node 1: Diagnosis]
  Input: Goal = "Increase revenue 30%"
  Process: 5 Whys analysis
  Output: Root causes = [
    "Retention 45% (vs 60%)",
    "No upselling",
    "Weekend underutilized"
  ]
  Duration: 15s

[Node 2: Constraints]
  Input: Diagnosis
  Process: Check limits
  Output: Constraints = {
    budget: "150M limit",
    workforce: "20% capacity",
    timeline: "4 weeks"
  }
  Duration: 8s

[Node 3: Opportunities]
  Input: Diagnosis + Constraints
  Process: Generate 20 possibilities
  Output: Top 5 = [Win-back, Upsell, Weekend, TikTok, Referral]
  Duration: 22s

[Node 4: Strategy - Iteration 1]
  Input: Opportunities + Constraints
  Process: Generate alternatives
  Output: Selected = "Aggressive (All 5)"
  Duration: 18s

[Node 5: Simulation - Iteration 1]
  Input: Aggressive strategy
  Process: Monte Carlo (1000 runs)
  Output: EV = 1.2B, P(Success) = 60%
  Convergence: FAIL (P < 75%)
  Reason: "Team overload (26% > 20%)"
  Duration: 45s

[Node 4: Strategy - Iteration 2]
  Input: Refined constraints (defer Referral)
  Process: Generate alternatives
  Output: Selected = "Balanced (Top 4)"
  Duration: 12s

[Node 5: Simulation - Iteration 2]
  Input: Balanced strategy
  Process: Monte Carlo (1000 runs)
  Output: EV = 1.706B, P(Success) = 80%
  Convergence: PASS ✅
  Duration: 45s

[Node 6: Risk]
  Input: Balanced strategy + Simulation
  Process: Risk assessment
  Output: Risks = [
    "TikTok uncertain (40% prob)",
    "Win-back low conversion (30% prob)"
  ]
  Overall Risk: MEDIUM
  Acceptable: TRUE
  Duration: 10s

[Node 7: Recommendation]
  Input: All nodes
  Process: Package for CEO
  Output: ExecutiveRecommendation
  Duration: 5s

Total Duration: 180s (3 minutes)
Iterations: 2
Convergence: SUCCESS
```

---

## Benefits of Graph Approach

| Aspect | Linear Pipeline | Reasoning Graph |
|--------|----------------|----------------|
| **Flexibility** | Fixed sequence | Adaptive |
| **Loops** | No | Yes (Strategy ↔ Simulation) |
| **Branches** | No | Yes (explore alternatives) |
| **Convergence** | N/A | Explicit criteria |
| **Traceability** | Basic | Full graph trace |
| **Reasoning Quality** | Medium | High (iterative refinement) |

---

## Implementation Guidelines

### 1. Node Implementation

Each node should be:
- **Stateless** (state in ReasoningContext)
- **Idempotent** (can re-execute safely)
- **Traceable** (logs input/output)
- **Testable** (unit tests for each node)

### 2. Graph Orchestration

```typescript
class ReasoningGraphEngine {
  private nodes: Map<NodeType, ReasoningNode>;
  
  constructor() {
    this.nodes = new Map([
      ['diagnosis', new DiagnosisNode()],
      ['constraint', new ConstraintNode()],
      ['opportunity', new OpportunityNode()],
      ['strategy', new StrategyNode()],
      ['simulation', new SimulationNode()],
      ['risk', new RiskNode()],
      ['recommendation', new RecommendationNode()]
    ]);
  }
  
  async executeNode(
    nodeType: NodeType,
    input: any,
    context: ReasoningContext
  ): Promise<any> {
    const node = this.nodes.get(nodeType);
    if (!node) throw new Error(`Unknown node: ${nodeType}`);
    
    const startTime = Date.now();
    const output = await node.execute(input, context);
    const duration = Date.now() - startTime;
    
    context.recordNodeExecution(nodeType, input, output, duration);
    
    return output;
  }
}
```

### 3. Loop Prevention

```typescript
// Prevent infinite loops
if (iteration >= maxIterations) {
  throw new Error(
    `Graph did not converge after ${maxIterations} iterations. ` +
    `Last failure: ${context.getFailures().at(-1).reason}`
  );
}
```

### 4. Parallel Execution (Future)

```typescript
// Diagnosis and Constraints can run in parallel
const [diagnosis, constraints] = await Promise.all([
  executeNode('diagnosis', { goal }, context),
  executeNode('constraint', { goal }, context)
]);
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Convergence rate | >95% within 3 iterations |
| Average iterations | <2 |
| Execution time | <5 minutes |
| Reasoning quality | >90% CEO approval |
| Trace completeness | 100% (all nodes logged) |

---

## Conclusion

Reasoning Graph Engine transforms EIR from a **workflow** into a **reasoning system**.

Key features:
- ✅ Graph-based (not linear)
- ✅ Iterative (loops until convergence)
- ✅ Adaptive (sequence changes based on context)
- ✅ Traceable (full execution trace)
- ✅ Quality-driven (convergence criteria)

This is the **cognitive core** of Bella EOS.

---

*Document Version*: 1.0  
*Date*: 2026-07-27  
*Status*: Specification  
*Part of*: ADR-0010 v2.0 (Executive Intelligence Runtime)
