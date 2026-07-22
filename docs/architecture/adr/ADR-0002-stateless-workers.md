# ADR-0002: Stateless Execution Principle for Workers

* **Status**: Approved & Frozen
* **Date**: 2026-07-22
* **Author**: Enterprise Architecture Board

## Context
Many AI agent frameworks allow individual agents to store local state, chat histories, or session memories. This results in fragmented corporate knowledge, compliance risks, and difficulty when swapping LLM providers.

## Decision
All Workers (`AI Worker`, `Human Worker`, `MCP Worker`, `API Worker`, `Script Worker`, `Robot Worker`, `External Company`) MUST be **strictly stateless**:
1. Workers receive a security-filtered **Canonical Context Package (v1.0)**.
2. Workers execute the task and return structured **Evidence (v1.0)**.
3. Workers IMMEDIATELY wipe operational RAM and memory.

All long-term memory, conversation history, and business context reside 100% inside **Domain 3: Enterprise Brain**.

## Consequences
- AI models (GPT-4o, Claude 3.5, Gemini 2.0, DeepSeek, Hermes) can be hot-swapped dynamically without memory loss.
- Eliminates memory fragmentation and guarantees corporate data sovereignty.
