# ADR-0001: 5 Core Domain Isolation & System Decoupling

* **Status**: Approved & Frozen
* **Date**: 2026-07-22
* **Author**: Enterprise Architecture Board

## Context
In early prototypes, business logic, workflow execution, database access, and AI prompts were mixed inside a monolithic orchestration script. As enterprise requirements scale to 15-20 years, this tight coupling creates severe technical debt and prevents upgrading AI models or underlying databases.

## Decision
We freeze 5 isolated core domains for **Bella EOS**:
1. **Domain 1: Bella Kernel** — Pure runtime engine, event store, transaction log. ZERO business logic, ZERO AI.
2. **Domain 2: Enterprise Storage Domain** — Storage abstraction layer (`Metadata`, `Vector`, `Blob`, `Graph`, `Cache`).
3. **Domain 3: Enterprise Brain & Assets** — Cognitive centers (`Memory`, `Knowledge`, `Context`, `Reasoning`, `Learning`) & Enterprise Assets.
4. **Domain 4: Orchestration & Strategy** — Strategic Intent decomposition (`Intent ➔ Goal ➔ Strategy ➔ Simulation ➔ Planning ➔ Workflow`).
5. **Domain 5: Execution Domain** — Stateless worker management & Internal API Gateway.

The **Presentation Layer** (UI Consoles, Mobile, Portals) operates purely as an outer Adapter layer.

## Consequences
- Upgrading or replacing any ERP, AI model, or database engine will not affect the core Enterprise Brain.
- Ensures zero lock-in to cloud vendors or specific AI providers over a 20-year lifespan.
