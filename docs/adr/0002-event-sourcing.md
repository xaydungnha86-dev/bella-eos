# ADR 0002: Event Sourcing & Decoupled Event Bus

* Status: **ACCEPTED**
* Date: 2026-07-30
* Deciders: Architecture Review Board

## Context
Enterprise operations require complete audit trails, time-travel debugging, replay capabilities, and state rollback when workflow steps fail.

## Decision
We decouple state persistence and pub/sub messaging:
- **EventStore**: Handles append-only domain event persistence and state projection.
- **EnterpriseEventBus**: Handles asynchronous pub/sub event distribution.

## Consequences
- State can be accurately rehydrated at any point in time.
- Decoupled pub/sub prevents memory leaks and direct module dependencies.
