# ADR 0005: Platform API-First Architecture

* Status: **ACCEPTED**
* Date: 2026-07-30
* Deciders: Architecture Review Board

## Context
Bella EOS must serve as an Enterprise AI Operating System capable of powering React UI, Bella EIP, Mobile Apps, and third-party partner integrations seamlessly.

## Decision
We enforce an **API-First Architecture**:
- All operations are exposed via standard Platform APIs (`REST`, `SSE`, `TypeScript SDK`).
- React Dashboard UI is treated as an external consumer of the Platform SDK/API.

## Consequences
- Single API surface for all client applications.
- Enables multi-channel client integration (Web, EIP, Mobile, CLI).
