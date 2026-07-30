# ADR 0004: Infrastructure Model Router & Prompt Registry

* Status: **ACCEPTED**
* Date: 2026-07-30
* Deciders: Architecture Review Board

## Context
Core domain logic should remain LLM vendor-agnostic (Gemini, OpenAI, Claude, Llama).

## Decision
Model Router and Prompt Registry are placed strictly in the **Infrastructure Layer**:
- `Model Router`: Evaluates routing policies (Confidentiality, Latency, Cost) to direct agent requests to the optimal LLM provider with fallback handling.
- `Prompt Registry`: Manages versioned, composable prompt templates (`v1`, `v2`, `v3`).

## Consequences
- Core Domain remains 100% vendor-neutral.
- Switching between AI models does not affect business rules.
