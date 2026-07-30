# ADR 0003: Hierarchical Capability Graph Registry

* Status: **ACCEPTED**
* Date: 2026-07-30
* Deciders: Architecture Review Board

## Context
Hardcoding AI Agent roles (CMO, Sales, HR, Legal) in core workflows makes the system fragile and hard to extend for different industries (Spa, F&B, Real Estate).

## Decision
We decouple business intents from specific agents by introducing a **Capability Graph**:
- `CEO Intent` ➔ `Required Capabilities` (e.g., `marketing_strategy`, `legal_compliance`) ➔ `CapabilityRegistry` matches best Agent candidates.

## Consequences
- New agents or plugins can register capabilities dynamically without modifying core engine logic.
- Cross-industry execution is achieved by registering different Capability Graph nodes.
