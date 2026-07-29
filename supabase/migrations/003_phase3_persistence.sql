-- Migration: Create Phase 3 Persistence Tables (Workflows, Event Store, and Caching)
-- Target Supabase Project: https://qwpyfhojxctrvqkjctcl.supabase.co

-- -------------------------------------------------------------------------
-- 1. TABLE: workflow_states (Saga Workflow Instance Tracking)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_states (
    workflow_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_step_id VARCHAR(50),
    steps JSONB DEFAULT '[]'::jsonb,
    started_at BIGINT NOT NULL,
    ended_at BIGINT,
    version INT DEFAULT 1 NOT NULL,
    trace_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updating updated_at on workflow_states
CREATE TRIGGER workflow_states_updated_at
  BEFORE UPDATE ON public.workflow_states
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------------------
-- 2. TABLE: domain_events (Event Store Persistence for Event Sourcing)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.domain_events (
    event_id VARCHAR(50) PRIMARY KEY,
    aggregate_id VARCHAR(50) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    version INT NOT NULL,
    trace_id VARCHAR(128),
    idempotency_key VARCHAR(256) UNIQUE
);

-- -------------------------------------------------------------------------
-- 3. TABLE: cache_records (Distributed Key-Value Database Cache)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cache_records (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ/WRITE POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access to workflow_states" ON public.workflow_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to domain_events" ON public.domain_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to cache_records" ON public.cache_records FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- ENABLE REALTIME PUBLICATION FOR NEW TABLES
-- -------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_states, public.domain_events;
