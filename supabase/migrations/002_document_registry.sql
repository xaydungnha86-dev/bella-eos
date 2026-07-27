-- Migration: Create Enterprise Knowledge Repository (EKR) Registry tables
-- Target Supabase Project: https://qwpyfhojxctrvqkjctcl.supabase.co

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- -------------------------------------------------------------------------
-- 1. TABLE: documents (Document Registry Identity)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('DOC-' || gen_random_uuid()::text),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(50) DEFAULT 'GENERAL',
    owner_id VARCHAR(50) REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    parent_document_id VARCHAR(50) REFERENCES public.documents(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'DRAFT', -- 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 2. TABLE: document_versions (Physical Upload Logs & Version Tracking)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_versions (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('VER-' || gen_random_uuid()::text),
    document_id VARCHAR(50) REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    storage_path TEXT NOT NULL, -- Path in Object Storage (e.g. MinIO / S3)
    mime_type VARCHAR(100),
    file_size BIGINT,
    checksum VARCHAR(64), -- sha256 checksum
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure version_number is unique per document_id
ALTER TABLE public.document_versions
  ADD CONSTRAINT document_id_version_unique UNIQUE (document_id, version_number);

-- -------------------------------------------------------------------------
-- 3. TABLE: document_chunks (Semantic Text Chunks & Vector Index)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('CHK-' || gen_random_uuid()::text),
    document_id VARCHAR(50) REFERENCES public.documents(id) ON DELETE CASCADE,
    version_id VARCHAR(50) REFERENCES public.document_versions(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- 1536-dim embedding for pgvector (OpenAI standard)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for high-performance vector search (if supported)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- -------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ/WRITE POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access to documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to document_versions" ON public.document_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to document_chunks" ON public.document_chunks FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- TRIGGER FOR UPDATING UPDATED_AT ON DOCUMENTS
-- -------------------------------------------------------------------------
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------------------
-- -------------------------------------------------------------------------
-- ENABLE REALTIME PUBLICATION
-- -------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents, public.document_versions;

-- -------------------------------------------------------------------------
-- 4. FUNCTION: match_chunks (Vector search RPC function)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_chunks (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.0,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id VARCHAR(50),
  document_id VARCHAR(50),
  version_id VARCHAR(50),
  chunk_index int,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.version_id,
    dc.chunk_index,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.embedding IS NOT NULL 
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

