# ADR-0007: Capability-Based Architecture Restructuring

* **Status**: Proposed (Critical Priority)
* **Date**: 2026-07-27
* **Author**: Enterprise Architecture Board
* **Supersedes**: Current Runtime-based organization
* **Impact**: HIGH - Requires major restructuring

---

## Context

### Current Problem

The current architecture organizes the system by **Runtime** (ELR, EAH, ECH, EDR, ERR, MIR, ESR, ERL...), which leads to:

1. **Runtime Explosion**: 
   - Currently: 15+ runtimes
   - Projected: 60+ runtimes in 2 years, 200+ in 5 years
   - Difficult to discover, manage, and authorize

2. **Overlapping Responsibilities**:
   ```
   Reflection Runtime vs Learning Runtime vs Evolution Runtime
   → All participate in the same Observe → Reflect → Learn → Improve cycle
   ```

3. **Flat Organization**:
   - All runtimes are peers
   - No clear hierarchy or capability grouping
   - Hard to understand system capabilities

4. **Missing Critical Layers**:
   - No Business Object Layer (Customer, Invoice, Campaign...)
   - No Capability Registry ("What can Bella do?")
   - No Unified Cognitive Loop

5. **Creative Runtime Gaps**:
   ```
   Current:  Planner → Generate
   Missing:  Critic → Repair → Judge
   ```

6. **Knowledge Repository Underutilized**:
   - Vector DB treated as center
   - Should be: Facts → Knowledge Graph → Business Objects → Playbooks

### Root Cause

The architecture was designed **bottom-up** (runtime implementations first) rather than **top-down** (capabilities first). As the system grows, this creates exponential complexity.

---

## Decision

We restructure Bella EOS from **Runtime-based** to **Capability-based** architecture with these core principles:

### 1. Organize by Capability, not Runtime

```
OLD (Runtime-based):
ELR, EAH, ECH, EDR, ERR, EERX, MIR, ESR, ERL... (flat list)

NEW (Capability-based):
Knowledge Capability
  └─ Ingestion Runtime
  └─ Parser Runtime
  └─ Facts Runtime
  └─ Graph Runtime
  └─ Memory Runtime

Decision Capability
  └─ Deliberation Runtime
  └─ Strategy Runtime
  └─ Simulation Runtime
  └─ Approval Runtime

Creative Capability
  └─ Strategy Runtime
  └─ Assembly Runtime
  └─ Asset Runtime
  └─ Prompt Runtime
  └─ Critic Runtime
  └─ Repair Runtime
```

### 2. Introduce Business Object Layer

All capabilities operate on standardized Business Objects, not raw data:

```
Business Objects (EOM v2.0):
  - Customer
  - Employee
  - Campaign
  - Invoice
  - Task
  - Workflow
  - Project
  - Department
  - Goal
  - Approval
  - Knowledge
  - Policy
  - Document
  - Evidence
  - Insight
```

### 3. Elevate EKR to System Core

Enterprise Knowledge Repository becomes the **heart** of Bella EOS:

```
                    ┌─────────────────┐
                    │  All Capabilities │
                    └────────┬──────────┘
                             ↓
                    ┌─────────────────┐
                    │   Business       │
                    │   Object Layer   │
                    └────────┬──────────┘
                             ↓
                    ┌─────────────────┐
                    │  Enterprise      │
                    │  Knowledge       │
                    │  Repository      │
                    │  (EKR Core)      │
                    └─────────────────┘
                             ↓
                    ┌─────────────────┐
                    │  Storage Layer   │
                    └─────────────────┘
```

### 4. Create Capability Registry

Answer the question: **"What can Bella do?"**

```typescript
interface SystemCapability {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  inputs: BusinessObject[];
  outputs: BusinessObject[];
  requirements: Requirement[];
  implementations: Runtime[];
}

// Examples:
- Write SOP
- Generate Banner
- Forecast Revenue
- Review Contract
- Approve Budget
- Analyze Finance
- Schedule Workforce
```

### 5. Unified Cognitive Loop

All capabilities participate in one coherent cycle:

```
   Observe (Evidence, Signals, Events)
       ↓
   Understand (Parse, Extract, Contextualize)
       ↓
   Reason (Analyze, Infer, Deduce)
       ↓
   Plan (Strategy, Simulation, Optimization)
       ↓
   Execute (Workflow, Actions, Tasks)
       ↓
   Evaluate (Measure, Score, Compare)
       ↓
   Reflect (Root Cause, Insights, Patterns)
       ↓
   Learn (Update Knowledge, Evolve Strategies)
       ↓
   Evolve (Adapt Playbooks, Update Policies)
       ↓
   [Loop back to Observe]
```

---

## Proposed Architecture v22.0

### 7 Core Capabilities


```
┌────────────────────────────────────────────────────────────────┐
│                      BELLA EOS v22.0                           │
│              Capability-Based Architecture                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           1. KNOWLEDGE CAPABILITY                     │    │
│  │  Unified enterprise knowledge & memory management     │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Evidence Ingestion Runtime                        │    │
│  │  • Document Parser Runtime                           │    │
│  │  • Fact Extraction Runtime                           │    │
│  │  • Knowledge Graph Runtime                           │    │
│  │  • Memory Management Runtime                         │    │
│  │  • Business Object Registry                          │    │
│  │  • Reasoning Graph Builder                           │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           2. DECISION CAPABILITY                      │    │
│  │  Strategic decision-making & simulation               │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Deliberation Runtime (Multi-agent debate)         │    │
│  │  • Strategy Planning Runtime                         │    │
│  │  • Digital Twin Simulation Runtime                   │    │
│  │  • Scenario Analysis Runtime                         │    │
│  │  • Risk Assessment Runtime                           │    │
│  │  • Approval Orchestration Runtime                    │    │
│  │  • Tradeoff Matrix Calculator                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           3. CREATIVE CAPABILITY                      │    │
│  │  End-to-end creative production with quality gates   │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Creative Strategy Runtime                         │    │
│  │  • Creative Assembly Runtime (NEW)                   │    │
│  │  • Asset Retrieval Runtime (RAG)                     │    │
│  │  • Prompt Composition Runtime                        │    │
│  │  • Multi-Model Router Runtime                        │    │
│  │  • Creative Critic Runtime (NEW)                     │    │
│  │  • Creative Repair Runtime (NEW)                     │    │
│  │  • Quality Judge Runtime (NEW)                       │    │
│  │  • Brand Compliance Runtime                          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           4. EXECUTION CAPABILITY                     │    │
│  │  Workflow orchestration & workforce management        │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Intent Parser Runtime                             │    │
│  │  • Goal Decomposition Runtime                        │    │
│  │  • Workflow Planning Runtime                         │    │
│  │  • Task Scheduler Runtime                            │    │
│  │  • AI Worker Gateway                                 │    │
│  │  • Human Worker Gateway                              │    │
│  │  • Connector Hub Runtime                             │    │
│  │  • Resource Manager Runtime                          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           5. LEARNING CAPABILITY                      │    │
│  │  Continuous improvement & system evolution            │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Evidence Collection Runtime                       │    │
│  │  • Pattern Discovery Runtime                         │    │
│  │  • Reflection Engine                                 │    │
│  │  • Playbook Generation Runtime                       │    │
│  │  • Policy Evolution Runtime (NEW)                    │    │
│  │  • Strategy Adaptation Runtime                       │    │
│  │  • SOP Improvement Runtime                           │    │
│  │  • Experimentation Runtime (A/B/C)                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           6. GOVERNANCE CAPABILITY                    │    │
│  │  Policy enforcement & compliance management           │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Policy Engine Runtime                             │    │
│  │  • Compliance Validation Runtime                     │    │
│  │  • Audit Trail Runtime                               │    │
│  │  • Reliability Monitoring Runtime (ERL)              │    │
│  │  • Access Control Runtime                            │    │
│  │  • Cost Governance Runtime                           │    │
│  │  • Quality Assurance Runtime                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           7. INTELLIGENCE CAPABILITY                  │    │
│  │  External signals & competitive intelligence          │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │  • Market Signal Ingestion Runtime                   │    │
│  │  • Competitive Intelligence Runtime                  │    │
│  │  • Trend Analysis Runtime                            │    │
│  │  • Forecast Engine Runtime                           │    │
│  │  • Customer Insights Runtime                         │    │
│  │  • Decision Impact Runtime (NEW)                     │    │
│  │  • External Source Trust Runtime                     │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘

                           ↕ (All interact via)

┌────────────────────────────────────────────────────────────────┐
│                  BUSINESS OBJECT LAYER (EOM v2.0)              │
│  Standardized objects: Customer, Campaign, Invoice, Task...   │
└────────────────────────────────────────────────────────────────┘

                           ↕

┌────────────────────────────────────────────────────────────────┐
│            ENTERPRISE KNOWLEDGE REPOSITORY (EKR CORE)          │
│  • Facts Store                                                 │
│  • Knowledge Graph                                             │
│  • Business Object Store                                       │
│  • Playbook Library                                            │
│  • Reasoning Graph Archive                                     │
│  • Policy Registry                                             │
│  • Memory Store (Long-term, Short-term, Working)              │
└────────────────────────────────────────────────────────────────┘

                           ↕

┌────────────────────────────────────────────────────────────────┐
│                    STORAGE ABSTRACTION LAYER                   │
│  • Metadata (PostgreSQL)                                       │
│  • Vector (pgvector)                                           │
│  • Graph (pgGraph / Neo4j)                                     │
│  • Blob (Object Storage)                                       │
│  • Cache (Redis)                                               │
└────────────────────────────────────────────────────────────────┘
```

---

## Key Changes

### Change 1: Capability Hierarchy

**Before**:
```
src/core/
  ├── elr/          # Flat
  ├── eah/          # Flat
  ├── ech/          # Flat
  ├── edr/          # Flat
  └── ...
```

**After**:
```
src/core/
  ├── capabilities/
  │   ├── knowledge/
  │   │   ├── ingestion/
  │   │   ├── facts/
  │   │   ├── graph/
  │   │   └── memory/
  │   ├── decision/
  │   │   ├── deliberation/
  │   │   ├── strategy/
  │   │   └── simulation/
  │   ├── creative/
  │   │   ├── strategy/
  │   │   ├── assembly/
  │   │   ├── critic/
  │   │   └── repair/
  │   └── ...
  ├── business-objects/   # NEW
  ├── ekr/                # ELEVATED
  └── ...
```

### Change 2: Creative Capability Complete Pipeline

**Current (v4)**:
```
Context → Brief → Prompt → Generate
```

**New (v22)**:
```
Context 
  ↓
Strategy (Campaign type, audience, channels)
  ↓
Assembly (Layout, typography, colors, visual)
  ↓
Asset Retrieval (RAG - real company assets)
  ↓
Prompt Composition (Expert prompt)
  ↓
Multi-Model Router (Gemini/Flux/DALL-E/Ideogram)
  ↓
Generate (A/B/C variants)
  ↓
Critic (Quality scoring 6 dimensions)
  ↓
Repair (If score < 90, fix and regenerate)
  ↓
Judge (Select best variant)
  ↓
Compliance Check (Brand guidelines)
  ↓
Publish
```


### Change 3: Business Object Layer (EOM v2.0)

**Core Business Objects**:

```typescript
// src/core/business-objects/contracts/

interface BusinessObject {
  id: string;
  type: BusinessObjectType;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface Customer extends BusinessObject {
  type: 'customer';
  name: string;
  segment: string;
  lifetimeValue: number;
  acquisitionDate: Date;
  status: 'active' | 'churned' | 'at_risk';
  touchpoints: Touchpoint[];
  preferences: CustomerPreference;
}

interface Campaign extends BusinessObject {
  type: 'campaign';
  objective: string;
  strategy: CampaignStrategy;
  channels: Channel[];
  budget: Budget;
  timeline: Timeline;
  status: CampaignStatus;
  results: CampaignResult;
  learnings: Evidence[];
}

interface Invoice extends BusinessObject {
  type: 'invoice';
  customer: string;          // Customer ID
  amount: number;
  currency: string;
  dueDate: Date;
  status: InvoiceStatus;
  lineItems: LineItem[];
}

interface Task extends BusinessObject {
  type: 'task';
  title: string;
  description: string;
  assignee: string;          // Worker ID (AI or Human)
  workflow: string;          // Workflow ID
  dependencies: string[];    // Task IDs
  status: TaskStatus;
  priority: Priority;
  reworkCount: number;
}

interface Knowledge extends BusinessObject {
  type: 'knowledge';
  domain: string;
  statement: string;
  confidence: number;
  evidence: Evidence[];
  sourceDocuments: string[];
  embedding: number[];
  tags: string[];
}

interface Policy extends BusinessObject {
  type: 'policy';
  name: string;
  scope: PolicyScope;
  rules: PolicyRule[];
  effectiveDate: Date;
  expiryDate?: Date;
  enforcement: EnforcementLevel;
}

interface Playbook extends BusinessObject {
  type: 'playbook';
  name: string;
  whenToUse: PlaybookContext;
  steps: PlaybookStep[];
  expectedResults: ExpectedResult;
  confidence: number;
  evidence: Evidence[];
  usageCount: number;
}
```

### Change 4: Enterprise Knowledge Repository as Core

**EKR Structure**:

```
┌────────────────────────────────────────────────────────┐
│         ENTERPRISE KNOWLEDGE REPOSITORY (EKR)          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │  1. FACTS STORE                              │    │
│  │  Atomic, validated business facts            │    │
│  │  • "Campaign X achieved 3.8% CTR"            │    │
│  │  • "Customer Y prefers email contact"        │    │
│  │  • "Gold color works for luxury segment"    │    │
│  └──────────────────────────────────────────────┘    │
│                    ↓                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  2. KNOWLEDGE GRAPH                          │    │
│  │  Semantic relationships between facts        │    │
│  │  • Campaign → Customer → Preference          │    │
│  │  • Color → Segment → Performance             │    │
│  │  • Task → Workflow → Goal                    │    │
│  └──────────────────────────────────────────────┘    │
│                    ↓                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  3. BUSINESS OBJECTS                         │    │
│  │  Structured enterprise entities              │    │
│  │  • Customer, Campaign, Invoice, Task...      │    │
│  └──────────────────────────────────────────────┘    │
│                    ↓                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  4. PLAYBOOKS                                │    │
│  │  Validated best practices                    │    │
│  │  • "Luxury spa → Gold color → High CTR"      │    │
│  │  • "B2B → Morning posts → Best engagement"   │    │
│  └──────────────────────────────────────────────┘    │
│                    ↓                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  5. REASONING GRAPHS                         │    │
│  │  Decision logic trails                       │    │
│  │  • Why decisions were made                   │    │
│  │  • Causal chains                             │    │
│  │  • Confidence scores                         │    │
│  └──────────────────────────────────────────────┘    │
│                    ↓                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  6. POLICY REGISTRY                          │    │
│  │  Business rules & constraints                │    │
│  │  • Budget approval thresholds                │    │
│  │  • Brand guidelines                          │    │
│  │  • Risk policies                             │    │
│  └──────────────────────────────────────────────┘    │
│                    ↓                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  7. MEMORY STORE                             │    │
│  │  • Long-term Memory (strategic)              │    │
│  │  • Short-term Memory (campaign context)      │    │
│  │  • Working Memory (active reasoning)         │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Vector DB is just ONE retrieval mechanism             │
│  Graph DB stores relationships                         │
│  PostgreSQL stores structured objects                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**All capabilities query EKR for context**, not scattered storage.

### Change 5: Capability Registry

**Implementation**:

```typescript
// src/core/capability-registry/

interface SystemCapability {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  
  inputs: {
    required: BusinessObjectType[];
    optional: BusinessObjectType[];
  };
  
  outputs: {
    primary: BusinessObjectType;
    secondary: BusinessObjectType[];
  };
  
  requirements: {
    permissions: Permission[];
    resources: Resource[];
    policies: Policy[];
  };
  
  implementations: {
    runtimes: Runtime[];
    fallbacks: Runtime[];
  };
  
  performance: {
    avgDuration: number;
    successRate: number;
    costPerExecution: number;
  };
  
  metadata: {
    version: string;
    owner: string;
    tags: string[];
  };
}

enum CapabilityCategory {
  KNOWLEDGE = "knowledge",
  DECISION = "decision",
  CREATIVE = "creative",
  EXECUTION = "execution",
  LEARNING = "learning",
  GOVERNANCE = "governance",
  INTELLIGENCE = "intelligence"
}

// Example capabilities:
const capabilities: SystemCapability[] = [
  {
    id: "cap-write-sop",
    name: "Write Standard Operating Procedure",
    category: CapabilityCategory.KNOWLEDGE,
    inputs: { required: ['task'], optional: ['existing_sop', 'template'] },
    outputs: { primary: 'document', secondary: ['knowledge'] },
    implementations: { runtimes: ['DocumentWriterRuntime'], fallbacks: [] }
  },
  {
    id: "cap-generate-banner",
    name: "Generate Marketing Banner",
    category: CapabilityCategory.CREATIVE,
    inputs: { required: ['campaign'], optional: ['brand_dna', 'assets'] },
    outputs: { primary: 'image', secondary: ['creative_brief'] },
    implementations: { 
      runtimes: ['CreativeStrategyRuntime', 'CreativeAssemblyRuntime', 'CreativeCriticRuntime'],
      fallbacks: ['CreativeDirectorRuntime']
    }
  },
  {
    id: "cap-forecast-revenue",
    name: "Forecast Revenue",
    category: CapabilityCategory.INTELLIGENCE,
    inputs: { required: ['historical_data'], optional: ['market_signals'] },
    outputs: { primary: 'forecast', secondary: ['confidence_interval'] },
    implementations: { runtimes: ['ForecastEngineRuntime'], fallbacks: [] }
  }
];
```

**Planner can now discover capabilities**:

```typescript
// Planner asks: "What can Bella do?"
const availableCapabilities = await capabilityRegistry.listCapabilities({
  category: 'creative',
  requiredInputs: ['campaign'],
  minSuccessRate: 0.85
});

// Planner gets: [cap-generate-banner, cap-write-copy, cap-design-logo...]
```

### Change 6: Unified Cognitive Loop

All capabilities participate in one coherent cycle:

```typescript
// src/core/cognitive-loop/unified-cognitive-engine.ts

class UnifiedCognitiveEngine {
  
  private readonly phases = [
    'observe',
    'understand',
    'reason',
    'plan',
    'execute',
    'evaluate',
    'reflect',
    'learn',
    'evolve'
  ];
  
  async runCycle(trigger: Trigger): Promise<CycleResult> {
    
    const context = await this.initializeContext(trigger);
    
    // Phase 1: Observe
    const observations = await this.observe(context);
    // Knowledge Capability ingests evidence
    
    // Phase 2: Understand
    const understanding = await this.understand(observations);
    // Knowledge Capability parses, extracts facts
    
    // Phase 3: Reason
    const reasoning = await this.reason(understanding);
    // Decision Capability builds reasoning graph
    
    // Phase 4: Plan
    const plan = await this.plan(reasoning);
    // Decision Capability creates execution plan
    
    // Phase 5: Execute
    const result = await this.execute(plan);
    // Execution Capability runs workflow
    
    // Phase 6: Evaluate
    const evaluation = await this.evaluate(result);
    // Governance Capability scores quality
    
    // Phase 7: Reflect
    const insights = await this.reflect(evaluation);
    // Learning Capability identifies patterns
    
    // Phase 8: Learn
    const knowledge = await this.learn(insights);
    // Learning Capability updates EKR
    
    // Phase 9: Evolve
    await this.evolve(knowledge);
    // Learning Capability adapts playbooks, policies
    
    return {
      trigger,
      result,
      insights,
      evolutionChanges: this.getEvolutionChanges()
    };
  }
}
```

### Change 7: Market Intelligence Integration

**Before**: MIR stores market data independently

**After**: Market signals flow directly into Decision capability

```typescript
// src/core/capabilities/intelligence/decision-impact-runtime.ts

interface MarketSignal {
  signalId: string;
  source: string;
  type: SignalType;          // trend, competitor, regulation, customer
  content: string;
  confidence: number;
  timestamp: Date;
}

interface DecisionImpact {
  decisionId: string;
  impactedBy: MarketSignal[];
  confidenceAdjustment: number;
  recommendationChange?: string;
  urgency: UrgencyLevel;
}

class DecisionImpactRuntime {
  
  async assessImpact(
    decision: Decision,
    marketSignals: MarketSignal[]
  ): Promise<DecisionImpact> {
    
    // Analyze which signals affect this decision
    const relevantSignals = this.filterRelevantSignals(decision, marketSignals);
    
    // Calculate confidence adjustment
    const confidenceAdjustment = this.calculateConfidenceAdjustment(
      decision,
      relevantSignals
    );
    
    // Suggest changes if needed
    const recommendationChange = this.suggestChanges(
      decision,
      relevantSignals
    );
    
    return {
      decisionId: decision.id,
      impactedBy: relevantSignals,
      confidenceAdjustment,
      recommendationChange,
      urgency: this.assessUrgency(relevantSignals)
    };
  }
}
```

**Flow**:
```
Market Signal
  ↓
Confidence Adjustment
  ↓
Decision Re-evaluation
  ↓
Plan Adaptation
  ↓
Execution
```


---

## Migration Strategy

### Phase 1: Foundation (2 months)

**Goal**: Build new foundational layers without disrupting existing system

**Tasks**:
1. **Create Business Object Layer**
   - Define 15 core Business Objects (Customer, Campaign, Invoice...)
   - Implement Business Object Registry
   - Create CRUD operations for each object type
   - Database schema for `business_objects` table

2. **Elevate EKR to Core**
   - Restructure EKR as central knowledge hub
   - Implement Facts Store
   - Implement Reasoning Graph Archive
   - Integrate all storage types (SQL, Vector, Graph, Blob)

3. **Create Capability Registry**
   - Define Capability interface
   - Register existing capabilities
   - Implement discovery API
   - Build capability authorization matrix

**Deliverables**:
- ✅ Business Object contracts (`ICustomer`, `ICampaign`, etc.)
- ✅ EKR Core implementation
- ✅ Capability Registry service
- ✅ Database migrations

### Phase 2: Capability Reorganization (2 months)

**Goal**: Restructure existing runtimes under capabilities

**Tasks**:
1. **Map existing runtimes to capabilities**
   ```
   ELR → Learning Capability
   EAH → (Distributed across capabilities)
   ECH → Knowledge Capability + Decision Capability
   EDR → Decision Capability
   ERR → Learning Capability
   MIR → Intelligence Capability
   ESR → Decision Capability
   ERL → Governance Capability
   ```

2. **Refactor directory structure**
   ```
   src/core/elr/ → src/core/capabilities/learning/
   src/core/edr/ → src/core/capabilities/decision/deliberation/
   etc.
   ```

3. **Update imports and references**
   - Automated migration scripts
   - Update all import paths
   - Update documentation

**Deliverables**:
- ✅ Reorganized codebase
- ✅ Updated imports
- ✅ Migration guide for developers

### Phase 3: Creative Capability Enhancement (2 months)

**Goal**: Complete the Creative pipeline with Critic, Repair, Judge

**Tasks**:
1. **Implement Creative Critic Runtime**
   ```typescript
   interface CreativeCritic {
     evaluateImage(
       image: string,
       brief: CreativeBrief,
       brandGuidelines: BrandGuidelines
     ): Promise<QualityScore>;
   }
   ```

2. **Implement Creative Repair Runtime**
   ```typescript
   interface CreativeRepair {
     repairImage(
       image: string,
       critique: QualityScore,
       brief: CreativeBrief
     ): Promise<RepairedImage>;
   }
   ```

3. **Implement Quality Judge Runtime**
   ```typescript
   interface QualityJudge {
     selectBest(
       variants: ImageVariant[],
       scores: QualityScore[]
     ): Promise<SelectedVariant>;
   }
   ```

4. **Implement Brand Compliance Runtime**
   ```typescript
   interface BrandCompliance {
     validate(
       image: string,
       guidelines: BrandGuidelines
     ): Promise<ComplianceReport>;
   }
   ```

**Deliverables**:
- ✅ Creative Critic (Vision model integration)
- ✅ Creative Repair (Iterative improvement)
- ✅ Quality Judge (Best selection)
- ✅ Brand Compliance Engine

### Phase 4: Unified Cognitive Loop (1 month)

**Goal**: Implement coherent cognitive cycle

**Tasks**:
1. **Implement Unified Cognitive Engine**
   - 9-phase cycle (Observe → ... → Evolve)
   - Phase coordinators
   - Capability orchestration

2. **Integrate all capabilities into loop**
   - Knowledge Capability in Observe, Understand
   - Decision Capability in Reason, Plan
   - Execution Capability in Execute
   - Governance Capability in Evaluate
   - Learning Capability in Reflect, Learn, Evolve
   - Intelligence Capability feeds into all phases

3. **Close the feedback loop**
   - Campaign results → Evidence → Facts → Knowledge → Playbooks → Future campaigns

**Deliverables**:
- ✅ Unified Cognitive Engine
- ✅ Phase coordinators
- ✅ Closed-loop learning

### Phase 5: Advanced Features (2 months)

**Goal**: Implement missing features identified in gaps analysis

**Tasks**:
1. **Asset Retrieval (RAG)**
   - Company asset ingestion
   - Vector embeddings for semantic search
   - Asset recommendation engine

2. **Design Knowledge Base**
   - 10+ industry design systems
   - Modular design components
   - Style templates library

3. **Policy Evolution**
   - Automatic policy updates based on evidence
   - Human approval for policy changes
   - Policy versioning

4. **Enhanced Planner**
   - Constraints integration
   - Resource-aware planning
   - Policy-compliant planning
   - Pre-execution simulation

**Deliverables**:
- ✅ Asset RAG system
- ✅ Design knowledge base
- ✅ Policy evolution engine
- ✅ Enhanced planner

---

## Timeline

```
Month 1-2:   Foundation (Business Objects, EKR Core, Capability Registry)
Month 3-4:   Capability Reorganization (Restructure codebase)
Month 5-6:   Creative Enhancement (Critic, Repair, Judge)
Month 7:     Unified Cognitive Loop
Month 8-9:   Advanced Features (RAG, Design KB, Policy Evolution)
Month 10:    Testing & Documentation
Month 11:    Pilot Deployment
Month 12:    Full Rollout

Total: 12 months to v22.0
```

---

## Consequences

### Positive

1. **Scalability**
   - Clear capability boundaries
   - Easy to add new capabilities
   - No runtime explosion

2. **Discoverability**
   - "What can Bella do?" is answerable
   - Capability Registry provides clear inventory
   - Easy onboarding for developers

3. **Maintainability**
   - Hierarchical organization (Capability > Runtime > Service)
   - Clear responsibilities
   - No overlapping concerns

4. **Interoperability**
   - All capabilities speak same language (Business Objects)
   - EKR provides unified context
   - Standardized interfaces

5. **Quality**
   - Complete creative pipeline (Planner → Worker → Critic → Repair → Judge)
   - Closed feedback loop
   - Self-improving system

6. **Enterprise-Ready**
   - Business Object Layer aligns with enterprise concepts
   - Capability-based authorization
   - Policy-driven governance

### Negative

1. **Migration Effort**
   - 12-month migration timeline
   - Requires significant refactoring
   - Temporary code duplication during transition

2. **Learning Curve**
   - New mental model for existing developers
   - Documentation must be updated
   - Training required

3. **Coordination Overhead**
   - Capabilities must coordinate via EKR
   - More indirection layers
   - Potential performance impact (mitigated by caching)

### Risks

| Risk | Mitigation |
|------|-----------|
| Migration breaks existing features | Phased migration, extensive testing, feature flags |
| Performance degradation | Benchmark at each phase, optimize hot paths |
| Developer resistance | Clear communication, training, show benefits early |
| Timeline overrun | Monthly milestones, adjust scope if needed |

---

## Alternatives Considered

### Alternative 1: Keep Runtime-based Organization

**Pros**:
- No migration needed
- Existing code works

**Cons**:
- Runtime explosion continues (200+ runtimes in 5 years)
- Discoverability remains poor
- Overlapping responsibilities
- Not enterprise-scalable

**Decision**: Rejected - technical debt compounds exponentially

### Alternative 2: Service-Oriented Architecture (SOA)

**Pros**:
- Industry-standard pattern
- Microservices-ready

**Cons**:
- Too granular for current scale
- Network overhead
- Distributed system complexity
- Over-engineering for monolith

**Decision**: Rejected - premature for current scale, can evolve later

### Alternative 3: Plugin-Based Architecture

**Pros**:
- Maximum flexibility
- Easy to add/remove features

**Cons**:
- Versioning complexity
- Dependency hell
- Less cohesive system
- Hard to enforce contracts

**Decision**: Rejected - not suitable for enterprise core platform

---

## Success Metrics

### Technical Metrics

- ✅ Number of top-level concepts: < 10 (7 capabilities)
- ✅ Average onboarding time: < 1 week (vs current 2-3 weeks)
- ✅ Capability discovery time: < 5 minutes
- ✅ Code reuse across capabilities: > 60%
- ✅ Test coverage: > 85%

### Business Metrics

- ✅ Creative quality score: > 92 (vs current 85)
- ✅ Campaign success rate: > 90% (vs current 80%)
- ✅ System autonomy: > 85% (decisions without human intervention)
- ✅ Learning improvement: +30% YoY performance
- ✅ CEO satisfaction: > 4.7/5

### Developer Metrics

- ✅ Time to add new capability: < 1 week
- ✅ Code navigation time: -50%
- ✅ Bug resolution time: -40%
- ✅ Documentation satisfaction: > 4.5/5

---

## References

- ADR-0001: Domain Isolation
- ADR-0005: Company DNA
- ADR-0006: Enterprise Knowledge Repository
- IMAGE_GENERATION_ARCHITECTURE.md
- COMPREHENSIVE_ARCHITECTURE_ANALYSIS.md

---

## Approval

- [ ] CEO
- [ ] CTO
- [ ] Tech Lead
- [ ] Product Owner
- [ ] Architecture Board

**Status**: Awaiting Approval

**Next Steps**:
1. Review by architecture board
2. Approval by executive team
3. Kickoff Phase 1 (Foundation)
4. Weekly progress reviews

---

*Document Version*: 1.0  
*Date*: 2026-07-27  
*Author*: Enterprise Architecture Board  
*Next Review*: 2026-08-15
