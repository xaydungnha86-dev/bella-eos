-- Migration: Create integrations table for storing customer API keys
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS public.integrations (
  id             UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id   TEXT    NOT NULL DEFAULT 'default',      -- future: per-tenant isolation
  provider       TEXT    NOT NULL,                        -- e.g. 'facebook', 'openai', 'supabase'
  label          TEXT    NOT NULL,                        -- human-friendly name
  key_name       TEXT    NOT NULL,                        -- e.g. 'page_access_token'
  key_value      TEXT    NOT NULL DEFAULT '',             -- the secret value (masked in UI)
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique: one row per provider+key per workspace
ALTER TABLE public.integrations
  ADD CONSTRAINT integrations_workspace_provider_key_unique
  UNIQUE (workspace_id, provider, key_name);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: only anon/service key can access (add per-user RLS when auth is added)
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service_role" ON public.integrations
  USING (true) WITH CHECK (true);

-- Audit ledger (for Brain Console)
CREATE TABLE IF NOT EXISTS public.audit_ledger (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id   TEXT    NOT NULL,
  source_identity  TEXT    NOT NULL DEFAULT 'bella-eos',
  action_type      TEXT    NOT NULL,
  payload          JSONB   DEFAULT '{}',
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Memory records (for Brain Context Center)
CREATE TABLE IF NOT EXISTS public.memory_records (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT    NOT NULL,
  objective   TEXT,
  payload     JSONB   DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
