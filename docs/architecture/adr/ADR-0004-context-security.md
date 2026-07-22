# ADR-0004: Context Isolation & Token Optimization

* **Status**: Approved & Frozen
* **Date**: 2026-07-22
* **Author**: Enterprise Architecture Board

## Context
Exposing raw databases directly to LLMs presents severe data security risks, privacy leaks, and massive token waste (hallucinations & high costs).

## Decision
1. **Context Center** acts as the sole security boundary between Enterprise Brain and Workers.
2. The context pipeline enforces:
   `Raw Data` ➔ `Context Security Filter` ➔ `Context Ranking` ➔ `Token Optimizer (-90% tokens)` ➔ `Context Validation` ➔ `Canonical Context Package (v1.0)`.
3. AI Workers NEVER query databases directly.

## Consequences
- Reduces API token consumption by up to 90%.
- Prevents database credential leakage or unauthorized data access by AI models.
