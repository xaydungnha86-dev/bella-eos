# ADR-0006: Enterprise Knowledge Repository (EKR) Storage Architecture

* **Status**: Approved & Frozen
* **Date**: 2026-07-27
* **Author**: Enterprise Architecture Board / CEO

## Context
As **Bella EOS** processes millions of corporate documents (SOPs, meeting minutes, policies, and media), storing raw documents directly in relational databases (PostgreSQL) or document databases (MongoDB) leads to performance bottlenecks, lack of version control, and difficulties in tracing semantic context for AI employees. We need a clear separation between structured business data and document storage.

## Decision
We establish the **Enterprise Knowledge Repository (EKR)** architecture pattern. This pattern defines how the platform handles documents, media, and knowledge.

### 1. Data Type Categorization
Bella EOS segregates data into 5 distinct categories with specific storage targets:
1. **Structured Data** (User, Workflow, Task, Approval) ➔ **PostgreSQL** (schema-enforced, transactional).
2. **Documents** (SOP, Policies, Agreements, Minutes) ➔ **Object Storage** (file content) + **PostgreSQL** (versioned registry metadata).
3. **Knowledge** (Text Chunks, Vector Embeddings, Source Citations) ➔ **Vector Database** (pgvector / Qdrant) + **Graph Database**.
4. **AI Runtime** (Reasoning plans, tool logs, temporary session states) ➔ **PostgreSQL / Redis** (JSONB / transient Cache).
5. **Media** (Images, audio transcripts, training videos) ➔ **Object Storage** (binary files).

### 2. Document Versioning & Registry Strategy
Raw documents are never overwritten.
* **Document Registry Table**: Tracks the conceptual document identity (`id`, `title`, `department`, `owner`, `parent_document_id`, `status`).
* **Document Versions Table**: Tracks physical files (`id`, `document_id`, `version_number`, `storage_path`, `mime_type`, `file_size`, `checksum`, `created_at`).
* **Storage Isolation**: Physical files are uploaded to **Object Storage** (MinIO, AWS S3, GCS, Azure Blob) via `IBlobStore`.

### 3. Ingestion & Inundation Flow (Pipeline)
```
[Raw Upload] ➔ [Blob Store] ➔ [Document Registry] ➔ [Document Parser] ➔ [Chunker] ➔ [Embedding Engine] ➔ [Vector DB]
```
1. **Upload**: Original file is saved in Object Storage (`IBlobStore`) and registered in the `document_versions` registry.
2. **Parsing**: The file is run through `DocumentParser` to extract structural entities (Decisions, Action Items, Owners, Deadlines) and raw text.
3. **Structured Mapping**: Extracted decisions and tasks are written to PostgreSQL tables (e.g. `task_contracts`, `projects_workflows`).
4. **Chunk & Embed**: Text is chunked, mapped to vectors, and upserted into pgvector (`IVectorStore`) with references pointing back to the specific `document_versions.id` for traceability.

## Consequences
* **Auditability & Traceability**: When the AI answers, it references the specific document version (e.g., `SOP_v3.pdf`) rather than generic knowledge, allowing humans to verify the source document easily.
* **Storage Efficiency**: Relational databases remain lightweight, holding metadata, while cheap, scalable object storage handles gigabytes of original files.
* **Relational Power**: All access controls, departmental tagging, and lifecycle state changes (draft, review, approved) are easily managed using PostgreSQL relations.
