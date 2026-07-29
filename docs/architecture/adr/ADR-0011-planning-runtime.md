# ADR-0011: Planning Runtime

* **Status**: Proposed (HIGH PRIORITY)
* **Date**: 2026-07-27
* **Author**: Enterprise Architecture Board
* **Priority**: HIGH
* **Impact**: ARCHITECTURAL - Separates Strategic from Operational
* **Related**: ADR-0010 v2.0 (Executive Intelligence Runtime)

---

## Context

### The Problem

In ADR-0010 v1.0, Executive Capability tried to do too much:
- Strategic reasoning ✅
- **KPI decomposition** ❌ (operational)
- **Resource allocation** ❌ (operational)
- **Timeline planning** ❌ (operational)
- **Budget breakdown** ❌ (operational)

This violated **separation of concerns**.

### The Solution

Extract operational planning into a dedicated **Planning Runtime**.

---

## Decision

We introduce **Planning Runtime (PLR)** - responsible for translating strategic decisions into operational execution plans.

### Scope

```
Executive Intelligence Runtime (EIR)
  → Strategic: "Do Win-back, Upsell, Weekend, TikTok with 135M budget"
  
Planning Runtime (PLR)
  → Operational: "Win-back needs 66 customers, 30% email open, 
                   50M budget (5M email, 10M creative, 35M incentive),
                   Week 1-2 timeline, Email Marketer 30% time"
```

---

## Architecture

### Planning Runtime Position

```
CEO Intent
    ↓
Goal Clarification
    ↓
Executive Intelligence Runtime (EIR) ⭐ Strategic
    ↓
Executive Recommendation
    ↓
Human Approval Gate
    ↓
Decision Runtime (Tactical)
    ↓
🆕 Planning Runtime (PLR) ⭐ Operational
    ↓
Domain OS (Marketing / Finance / Sales / HR)
    ↓
Creative Runtime
    ↓
Execution Runtime
```

---

## Planning Runtime Components

### 1. KPI Decomposition Engine

**Purpose**: Translate strategic goals into measurable KPIs

**Input**: Executive Recommendation
```typescript
{
  goal: "Increase revenue 1.5B",
  chosenStrategy: {
    initiatives: ["Win-back", "Upsell", "Weekend", "TikTok"]
  }
}
```

**Output**: KPI Tree
```typescript
interface KPITree {
  primary: {
    metric: string;        // "Revenue"
    target: number;        // 6.5B
    baseline: number;      // 5B
  };
  
  byInitiative: {
    name: string;          // "Win-back"
    target: number;        // 600M
    kpis: {
      metric: string;      // "Reactivated Customers"
      target: number;      // 66
      formula: string;     // "220 churned × 30% conversion"
      
      breakdownKPIs: {
        metric: string;    // "Email Open Rate"
        target: string;    // "30%"
        currentBaseline: string;  // "0%" (new campaign)
        industryBenchmark: string; // "25%"
      }[];
    }[];
  }[];
  
  leadingIndicators: {
    week: number;
    checkpoints: {
      metric: string;
      threshold: number;
      action: string;      // "If < threshold, escalate"
    }[];
  }[];
}
```

**Example**:
```
Primary Goal: Revenue +1.5B
  ├─ Win-back: +600M (40%)
  │  ├─ Customers: 66
  │  │  ├─ Email Open: 30%
  │  │  ├─ CTR: 8%
  │  │  └─ Conversion: 15%
  │  └─ LTV per customer: 9.1M
  │
  ├─ Upsell: +500M (33%)
  │  ├─ Premium customers: 48
  │  │  ├─ Upsell attempts: 5/day/staff
  │  │  ├─ Upsell rate: 12%
  │  │  └─ Premium AOV: 22.5M
  │  └─ Training completion: 100%
  │
  ├─ Weekend: +400M (27%)
  │  ├─ Extra bookings: +32
  │  │  ├─ Ad impressions: 50K
  │  │  ├─ Ad CTR: 3%
  │  │  └─ Booking conversion: 25%
  │  └─ Weekend utilization: 85%
  │
  └─ TikTok: +200M (13%)
     ├─ Customers: 16
     │  ├─ Video views: 100K
     │  ├─ Engagement: 5%
     │  ├─ CTR: 2%
     │  └─ Lead conversion: 40%
     └─ Content production: 12 videos
```

---

### 2. Budget Allocation Engine

**Purpose**: Decompose strategic budget into line items

**Input**: Strategic budget (135M for 4 initiatives)

**Output**: Detailed budget plan
```typescript
interface BudgetPlan {
  total: number;              // 135M
  buffer: number;             // 15M
  
  byInitiative: {
    name: string;             // "Win-back"
    total: number;            // 50M
    
    breakdown: {
      category: string;       // "Email Platform"
      amount: number;         // 5M
      rationale: string;
      vendor?: string;
    }[];
  }[];
  
  byWeek: {
    week: number;
    planned: number;
    cumulative: number;
  }[];
  
  contingency: {
    amount: number;           // 15M buffer
    triggers: string[];       // When to deploy
  };
}
```

**Example**:
```
Total Budget: 135M (90% of 150M limit)
Buffer: 15M (10% contingency)

By Initiative:

Win-back (50M):
  - Email platform: 5M (SendGrid Pro)
  - Creative assets: 10M (copywriter, designer, photos)
  - Customer incentives: 35M (20% discount + free upgrade)

Upsell (40M):
  - Training program: 15M (trainer, materials, certification)
  - Marketing materials: 10M (brochures, digital, signage)
  - System setup: 15M (CRM, commission tracking, dashboard)

Weekend (30M):
  - Facebook Ads: 12M
  - Instagram Ads: 8M
  - Creative production: 5M (video + image ads)
  - Staff incentives: 5M (weekend overtime)

TikTok (15M):
  - Video production: 7M (12 videos, creators, equipment)
  - TikTok Ads: 6M
  - Influencer partnerships: 2M

By Week:
  Week 1: 30M (setup costs)
  Week 2: 35M (launch costs)
  Week 3: 35M (scale costs)
  Week 4: 35M (final push)

Contingency (15M):
  Triggers:
    - If Week 3 revenue < 900M → deploy 10M boost
    - If TikTok pilot successful → scale with 15M
    - CEO approval required
```

---

### 3. Timeline Planning Engine

**Purpose**: Create detailed execution timeline with milestones

**Input**: Strategic timeline (4 weeks)

**Output**: Operational timeline
```typescript
interface TimelinePlan {
  duration: string;           // "4 weeks"
  
  phases: {
    name: string;             // "Setup Phase"
    weeks: string;            // "Week 1"
    objectives: string[];
    
    milestones: {
      date: string;           // "Day 3"
      milestone: string;      // "Email list cleaned"
      owner: string;          // "Email Marketing Manager"
      status: 'pending' | 'done';
    }[];
  }[];
  
  dependencies: {
    task: string;
    dependsOn: string[];
    blocking: string[];
  }[];
  
  criticalPath: string[];     // Tasks that cannot be delayed
}
```

**Example**:
```
Duration: 4 weeks

Phase 1: Setup (Week 1)
  Objectives:
    - Prepare all campaign materials
    - Train staff
    - Setup accounts

  Day 1:
    ✓ Kickoff meeting (all teams)
    ✓ Clean win-back email list (220 contacts)
  
  Day 2:
    ✓ Write win-back email copy
    ✓ Create weekend ad creatives
    ✓ Setup TikTok business account
  
  Day 3:
    ✓ Design win-back landing page
    ✓ Schedule upsell training
    ✓ Produce first 3 TikTok videos
  
  Day 5:
    ✓ LAUNCH win-back emails (9 AM)
    ✓ Launch weekend ads (soft launch)
    ✓ CEO checkpoint: Week 1 review

Phase 2: Launch & Learn (Week 2)
  ...

Phase 3: Optimize & Scale (Week 3)
  ...

Phase 4: Final Push (Week 4)
  ...

Critical Path:
  - Upsell training (2 weeks) → Must start Week 1 to launch Week 3
  - TikTok account approval (3 days) → Blocks video launch

Dependencies:
  - Win-back emails → depends on: [list cleaning, copy writing, landing page]
  - Upsell launch → depends on: [training completion]
  - TikTok ads → depends on: [account approval, video production]
```

---

### 4. Resource Allocation Engine

**Purpose**: Assign people, capacity, and assets

**Input**: Strategic workforce constraint (20% capacity)

**Output**: Resource allocation plan
```typescript
interface ResourcePlan {
  workforce: {
    total: string;            // "21% capacity"
    
    byInitiative: {
      name: string;           // "Win-back"
      capacity: string;       // "5%"
      
      roles: {
        role: string;         // "Email Marketing Manager"
        ftePct: string;       // "30%"
        people: string[];     // ["Nguyễn Văn A"]
        tasks: string[];
      }[];
    }[];
    
    conflicts: {
      resource: string;
      conflict: string;
      resolution: string;
    }[];
  };
  
  assets: {
    type: string;             // "Email list"
    quantity: number;         // 220
    owner: string;
    status: string;
  }[];
}
```

**Example**:
```
Workforce Allocation:

Total: 21% capacity (2.1 FTE equivalent)
Status: Acceptable (5% overtime for 1 month)

By Initiative:

Win-back (5%):
  - Email Marketing Manager: 30% time (Nguyễn Văn A)
    Tasks: Campaign setup, segmentation, monitoring
  - Copywriter: 20% time (Trần Thị B)
    Tasks: Email copy, landing page (Week 1 only)
  - Designer: 20% time (Lê Văn C)
    Tasks: Templates, visuals (Week 1 only)

Upsell (8%):
  - Sales Trainer: 40% time (Phạm Thị D)
    Tasks: Training design, delivery, certification
  - Sales Manager: 20% time (Hoàng Văn E)
    Tasks: Oversight, tracking, coaching
  - 10 Sales Staff: 4% each (0.4% total)
    Tasks: Training Week 2, upselling Week 3-4

Weekend (3%):
  - Ads Manager: 20% time (Võ Thị F)
    Tasks: Campaign setup, optimization
  - Operations Manager: 10% time (Đặng Văn G)
    Tasks: Capacity planning, staffing

TikTok (5%):
  - Video Creator: 30% time (Ngô Thị H)
    Tasks: 12 videos (3/week)
  - Social Media Manager: 20% time (Bùi Văn I)
    Tasks: Account, posting, engagement, ads

Conflicts:
  - Designer needed by Win-back (Days 1-3) and Weekend (Days 4-5)
    Resolution: Prioritize Win-back, Weekend second
  
Assets:
  - Email list: 220 contacts (CRM)
  - Brand assets: Logo, colors, fonts (DAM)
  - Customer data: Purchase history, preferences (CRM)
```

---

### 5. Owner Assignment Engine

**Purpose**: Assign accountability for each KPI

**Input**: KPI Tree

**Output**: Ownership map
```typescript
interface OwnershipMap {
  byKPI: {
    kpi: string;
    target: string;
    owner: string;          // Primary accountable person
    contributors: string[]; // Supporting team
    reportingCadence: string;
  }[];
  
  escalationPath: {
    kpi: string;
    threshold: string;
    escalateTo: string;
  }[];
}
```

**Example**:
```
KPI Ownership:

Primary Goal: Revenue +1.5B
  Owner: CEO
  Contributors: CMO, CSO, CFO
  Reporting: Daily dashboard

Win-back Campaign (+600M):
  Owner: CMO
  Contributors: Email Marketing Manager
  Reporting: Weekly Monday 9 AM

  Email Open Rate (30%):
    Owner: Email Marketing Manager
    Contributors: Copywriter
    Reporting: Daily

  Conversion Rate (15%):
    Owner: Email Marketing Manager
    Contributors: Sales team
    Reporting: Daily

Upsell Program (+500M):
  Owner: CSO (Chief Sales Officer)
  Contributors: Sales Manager, Trainer
  Reporting: Weekly Tuesday 9 AM

  Upsell Rate (12%):
    Owner: Sales Manager
    Contributors: 10 Sales Staff
    Reporting: Daily

Weekend Promotion (+400M):
  Owner: CMO
  Contributors: Ads Manager, Operations
  Reporting: Weekly Monday 9 AM

Escalation Paths:
  - If email open < 20% by Week 2 → Escalate to CMO
  - If upsell < 6% by Week 3 → Escalate to CSO → CEO
  - If total revenue < 1.2B by Week 4 → Escalate to CEO
```

---

## Planning Runtime Output

### Complete Operational Plan

```typescript
interface OperationalPlan {
  // From KPI Decomposition
  kpiTree: KPITree;
  
  // From Budget Allocation
  budgetPlan: BudgetPlan;
  
  // From Timeline Planning
  timelinePlan: TimelinePlan;
  
  // From Resource Allocation
  resourcePlan: ResourcePlan;
  
  // From Owner Assignment
  ownershipMap: OwnershipMap;
  
  // Meta
  generatedFrom: ExecutiveRecommendation;
  generatedAt: string;
  approvedBy: string | null;
}
```

---

## Integration Points

### Input from EIR

```typescript
// EIR outputs strategic recommendation
const executiveRec: ExecutiveRecommendation = {
  goal: { ... },
  chosenStrategy: {
    name: "Balanced",
    initiatives: ["Win-back", "Upsell", "Weekend", "TikTok"],
    budget: 135M,
    timeline: "4 weeks"
  },
  expectedOutcome: "1.7B revenue",
  confidence: 80%
};

// PLR converts to operational plan
const operationalPlan = await planningRuntime.plan(executiveRec);
```

### Output to Domain OS

```typescript
// Marketing OS receives operational plan
const marketingPlan = operationalPlan.filterByDomain('marketing');

// Marketing OS creates execution blueprint
const campaigns = marketingOS.createCampaigns(marketingPlan);
```

---

## Comparison: Before vs After

### Before (in EIR v1.0)

```typescript
// Executive Capability output (WRONG - too operational)
{
  strategy: "Balanced",
  
  // ❌ Too detailed for strategic layer
  kpiTree: {
    revenue: {
      winback: {
        emailOpen: "30%",
        ctr: "8%",
        landingPageConversion: "15%"
      }
    }
  },
  
  // ❌ Too detailed for strategic layer
  budget: {
    winback: {
      emailPlatform: 5M,
      copywriter: 3M,
      designer: 4M,
      ...
    }
  },
  
  // ❌ Too detailed for strategic layer
  timeline: {
    week1: {
      day1: ["Clean list", "Kickoff"],
      day2: ["Write copy"],
      ...
    }
  }
}
```

### After (separated)

```typescript
// EIR output (Strategic only) ✅
{
  strategy: "Balanced",
  initiatives: ["Win-back", "Upsell", "Weekend", "TikTok"],
  budget: 135M,
  timeline: "4 weeks",
  expectedRevenue: 1.7B,
  confidence: 80%
}

// PLR output (Operational) ✅
{
  kpiTree: { ... },       // Detailed KPIs
  budgetPlan: { ... },    // Line-item budget
  timelinePlan: { ... },  // Day-by-day timeline
  resourcePlan: { ... },  // People assignment
  ownershipMap: { ... }   // Accountability
}
```

---

## Implementation

### Month 1: Extract from EIR

1. Identify all operational logic in EIR v1.0
2. Move to Planning Runtime
3. Update interfaces

### Month 2: Build PLR Engines

1. KPI Decomposition Engine
2. Budget Allocation Engine
3. Timeline Planning Engine
4. Resource Allocation Engine
5. Owner Assignment Engine

### Month 3: Integration

1. Connect EIR → PLR
2. Connect PLR → Domain OS
3. Test end-to-end
4. Validate separation of concerns

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Separation clarity | 100% (no strategic/operational mixing) |
| Planning time | < 30 min (automated from EIR output) |
| KPI coverage | 100% (all strategic goals have operational KPIs) |
| Owner assignment | 100% (every KPI has clear owner) |
| Timeline feasibility | >95% (realistic, dependency-aware) |

---

## Conclusion

Planning Runtime (PLR) completes the separation of concerns:
- **EIR**: Strategic reasoning ("WHAT to do, WHY")
- **PLR**: Operational planning ("HOW to do, WHO, WHEN, HOW MUCH")
- **Domain OS**: Domain execution ("DO IT")

This architecture scales and maintains clarity.

---

*Document Version*: 1.0  
*Date*: 2026-07-27  
*Status*: Proposed - Awaiting Approval  
*Related*: ADR-0010 v2.0 (Executive Intelligence Runtime)
