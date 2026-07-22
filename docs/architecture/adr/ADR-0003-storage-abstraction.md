# ADR-0003: Storage Domain Abstraction & Infrastructure Decoupling

* **Status**: Approved & Frozen
* **Date**: 2026-07-22
* **Author**: Enterprise Architecture Board

## Context
Directly embedding database SDKs (such as Supabase or PostgreSQL clients) into cognitive logic ties the business brain to a specific vendor's API.

## Decision
1. We establish **Domain 2: Enterprise Storage Domain** with 5 explicit interface abstractions:
   - `IMetadataStore` (Relational data interface)
   - `IVectorStore` (pgvector / vector search interface)
   - `IBlobStore` (Document & asset storage interface)
   - `IGraphStore` (Knowledge Graph interface)
   - `ICacheStore` (Operational KV / Redis interface)
2. We place **Secrets Store** (API Keys, OAuth, Webhooks) at the **Infrastructure Layer**, completely decoupled from business persistence.

## Consequences
- The Enterprise Brain centers interact ONLY through Storage Interfaces (`v1.0`).
- Migrating from Supabase to self-hosted PostgreSQL, AWS, or Azure requires zero changes to Cognitive Brain code.
