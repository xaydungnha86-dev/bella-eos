# Bella EOS v3.0 - Quick Reference

**For**: Developers, Architects, Product Managers  
**Date**: 2026-07-27

---

## 1-Minute Summary

**Bella EOS v3.0 = Reasoning-Based Cognitive Architecture**

```
CEO Intent → Reasoning → Planning → Execution
              (EIR)       (PLR)      (Domain OS)
```

**Key Change**: Replaced linear workflow with graph-based reasoning that loops until optimal.

---

## 3 Core Layers

### Layer 1: Reasoning (Strategic)
- **Runtime**: Executive Intelligence Runtime (EIR)
- **Input**: CEO goal
- **Process**: Reasoning graph (loops until convergence)
- **Output**: Executive Recommendation
- **Example**: "Balanced strategy: Win-back + Upsell + Weekend + TikTok, expect 1.7B, 80% confidence"

### Layer 2: Planning (Operational)
- **Runtime**: Planning Runtime (PLR)
- **Input**: Executive Recommendation
- **Process**: Decompose into KPIs, budget, timeline, resources
- **Output**: Operational Plan
- **Example**: "Win-back needs 66 customers, 30% email open, 50M budget (5M email, 10M creative, 35M incentive)"

### Layer 3: Execution (Tactical)
- **Runtimes**: Domain OS, Creative, Execution
- **Input**: Operational Plan
- **Process**: Execute tasks, create content, publish
- **Output**: Results
- **Example**: "Published 50 content pieces, revenue 1.85B"

---

## Key Concepts

### Reasoning Graph (Not Pipeline)

**OLD**:
```
Phase1 → Phase2 → Phase3 → ... → Phase10
```

**NEW**:
```
Strategy → Simulate
   │          │
 PASS      FAIL
   │          │
   ↓          ↓
 Done     Refine → Loop
```

### Convergence Criteria

```typescript
if (simulation.probabilitySuccess >= 0.75 && 
    simulation.expectedValue >= goal.target) {
  // PASS - recommend to CEO
} else {
  // FAIL - refine and loop
}
```

### Strategic vs Operational

| Concern | Layer | Runtime |
|---------|-------|---------|
| **"What strategy?"** | Strategic | EIR |
| **"What KPIs?"** | Operational | PLR |
| **"How to execute?"** | Tactical | Domain OS |

---

## Common Questions

### Q: Why not just improve the 10-phase pipeline?
**A**: Because real reasoning requires loops. A COO doesn't plan once and execute - they plan, simulate, refine, simulate again until confident.

### Q: What's the biggest benefit?
**A**: **Convergence guarantee**. System won't recommend a strategy unless it passes simulation with 75%+ confidence.

### Q: How does it learn?
**A**: Learning Runtime compares planned vs actual, extracts lessons, adjusts confidence in EIR for future reasoning.

### Q: Why separate Planning Runtime?
**A**: Clean separation of concerns. EIR focuses on strategic thinking, PLR handles operational decomposition.

---

## File Map

```
docs/architecture/
├─ BELLA_EOS_V3_COGNITIVE_ARCHITECTURE.md  ⭐ Start here
├─ V3_REVISION_SUMMARY.md                   All 17 changes
├─ FINAL_V3_SUMMARY.md                      Executive summary
├─ V3_QUICK_REFERENCE.md                    This file
├─ adr/
│  ├─ ADR-0010-executive-intelligence-runtime-v2.md  EIR spec
│  └─ ADR-0011-planning-runtime.md                   PLR spec
└─ REASONING_GRAPH_ENGINE.md                Graph engine details
```

---

## Code Structure (Proposed)

```
src/
├─ reasoning/
│  ├─ executive-intelligence-runtime/
│  │  ├─ goal-clarification.ts
│  │  ├─ reasoning-graph-engine.ts
│  │  ├─ nodes/
│  │  │  ├─ diagnosis-graph.ts
│  │  │  ├─ constraint-graph.ts
│  │  │  ├─ opportunity-graph.ts
│  │  │  ├─ strategy-graph.ts
│  │  │  ├─ simulation-graph.ts
│  │  │  ├─ risk-graph.ts
│  │  │  └─ recommendation-generator.ts
│  │  └─ reasoning-context.ts
│  └─ index.ts
│
├─ planning/
│  ├─ planning-runtime/
│  │  ├─ kpi-decomposition.ts
│  │  ├─ budget-allocation.ts
│  │  ├─ timeline-planning.ts
│  │  ├─ resource-allocation.ts
│  │  └─ owner-assignment.ts
│  └─ index.ts
│
├─ execution/
│  ├─ domain-os/
│  ├─ creative-runtime/
│  └─ execution-runtime/
│
└─ learning/
   ├─ tactical-learning.ts
   └─ strategic-feedback.ts
```

---

## API Examples

### EIR API

```typescript
// Execute reasoning graph
const recommendation = await eir.reason({
  ceoIntent: "Tăng doanh thu spa 30%"
});

// Output
{
  chosenStrategy: "Balanced",
  expectedRevenue: 1.7B,
  confidence: 0.80,
  reasoningTrace: [...],
  convergenceInfo: {
    iterations: 2,
    converged: true
  }
}
```

### PLR API

```typescript
// Generate operational plan
const operationalPlan = await plr.plan({
  executiveRecommendation: recommendation
});

// Output
{
  kpiTree: {...},
  budgetPlan: {...},
  timelinePlan: {...},
  resourcePlan: {...},
  ownershipMap: {...}
}
```

### Strategic Learning API

```typescript
// After execution, send feedback
await learning.recordStrategyOutcome({
  plannedStrategy: recommendation.chosenStrategy,
  actualRevenue: 1.85B,
  plannedRevenue: 1.7B,
  variance: +0.15B
});

// EIR confidence adjusted
const updatedConfidence = await eir.getConfidence("TikTok pilot");
// Was 60%, now 75%
```

---

## Key Metrics

| Metric | Target |
|--------|--------|
| Convergence rate | >95% within 3 iterations |
| CEO approval rate | >90% |
| Goal achievement | >90% |
| Reasoning time | <5 minutes |
| Strategic/operational separation | 100% (no mixing) |

---

## Migration Checklist

- [ ] Month 1: Extract PLR from EIR
- [ ] Month 2: Build PLR engines
- [ ] Month 3: Implement Reasoning Graph Engine
- [ ] Month 4: Add loop logic and convergence
- [ ] Month 5: Integration EIR → PLR → Execution
- [ ] Month 6: Strategic learning feedback
- [ ] Month 7: Testing and documentation
- [ ] Month 8: Production rollout

---

## Red Flags to Watch

🚨 **EIR outputs operational details** (e.g., email open rate)  
→ FIX: Move to PLR

🚨 **PLR does strategic reasoning** (e.g., root cause analysis)  
→ FIX: Move to EIR

🚨 **No convergence check** (executes once and done)  
→ FIX: Add convergence criteria and loop

🚨 **Learning doesn't feed back to EIR**  
→ FIX: Implement confidence adjustment

---

## Success Indicators

✅ CEO says: "Bella thinks like a COO, not just executes"  
✅ Every recommendation has full reasoning trace  
✅ System loops 2-3 times on average to find optimal strategy  
✅ Strategic feedback improves future reasoning quality  
✅ Clean layer boundaries (no strategic/operational mixing)

---

## Further Reading

- **Architecture**: `BELLA_EOS_V3_COGNITIVE_ARCHITECTURE.md`
- **All Changes**: `V3_REVISION_SUMMARY.md`
- **EIR Spec**: `ADR-0010-executive-intelligence-runtime-v2.md`
- **PLR Spec**: `ADR-0011-planning-runtime.md`
- **Graph Engine**: `REASONING_GRAPH_ENGINE.md`

---

*Version*: 1.0  
*Date*: 2026-07-27  
*Audience*: Technical team, Product, Architecture board
