# ADR 0001: Layered Domain-Driven Design (DDD) Architecture

* Status: **ACCEPTED**
* Date: 2026-07-30
* Deciders: Architecture Review Board, Enterprise AI Team

## Context
Bella EOS represents an Enterprise AI Operating System that orchestrates multiple autonomous agents, workflows, policies, and integrations. To prevent tight coupling and over-engineering, a clear architectural boundary is required.

## Decision
We adopt a 5-layer Domain-Driven Design (DDD) architecture:
1. **Domain Layer**: Core business logic, contracts, context engine, decision engine, governance. Pure TypeScript logic without infrastructure dependencies.
2. **Application Layer**: Council orchestrator, workflow coordinator, capabilities, agent mappings.
3. **Infrastructure Layer**: Model Router, Prompt Registry, Event Bus, Event Store, Telemetry, Plugin SDK, Resource Manager.
4. **Platform Layer**: REST, SSE, TypeScript SDK, Webhooks.
5. **Presentation Layer**: React UI, Bella EIP Integration, Admin Control Tower.

## Consequences
- **Positive**: High maintainability, strict separation of concerns, vendor-agnostic LLM integration.
- **Negative**: Requires strict discipline to prevent Domain code from importing Infrastructure libraries.
