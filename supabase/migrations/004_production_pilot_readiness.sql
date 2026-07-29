-- ============================================================================
-- Migration: 004_production_pilot_readiness.sql
-- Description: Production Security & Evidence Persistence Schema
-- Targets: Strict RLS Deny, DB Immutability Triggers, & Measurement Semantics
-- Target: Supabase / PostgreSQL Database
-- Author: Bella EOS Core Architecture Committee
-- Date: 30/07/2026
-- ============================================================================

-- 1. TENANTS TABLE (Multi-tenant foundation)
CREATE TABLE IF NOT EXISTS public.tenants (
    tenant_id VARCHAR(64) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. OUTCOME CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS public.outcome_contracts (
    contract_id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    sop_id VARCHAR(64) NOT NULL,
    sop_version VARCHAR(32) NOT NULL,
    objective TEXT NOT NULL,
    kpi_name VARCHAR(128) NOT NULL,
    direction VARCHAR(32) NOT NULL CHECK (direction IN ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER')),
    unit VARCHAR(32) NOT NULL,
    baseline NUMERIC(12, 4) NOT NULL,
    target NUMERIC(12, 4) NOT NULL,
    measurement_window_days INT NOT NULL DEFAULT 30,
    data_source VARCHAR(255) NOT NULL,
    evidence_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_outcome_contract_tenant_sop UNIQUE (tenant_id, sop_id, sop_version)
);

-- 3. PRODUCTION PILOT LEDGERS TABLE
CREATE TABLE IF NOT EXISTS public.production_pilot_ledgers (
    pilot_id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    contract_id VARCHAR(64) REFERENCES public.outcome_contracts(contract_id) ON DELETE SET NULL,
    workflow_id VARCHAR(64) NOT NULL,
    sop_id VARCHAR(64) NOT NULL,
    sop_version VARCHAR(32) NOT NULL,
    domain VARCHAR(64) NOT NULL,

    -- Baseline & Measurements (Invariant: post_pilot_actual NULL while RUNNING)
    pre_pilot_baseline NUMERIC(12, 4) NOT NULL,
    target NUMERIC(12, 4) NOT NULL,
    post_pilot_actual NUMERIC(12, 4) NULL,

    -- Derived Variance Metrics (Calculated upon measurement window completion)
    absolute_variance NUMERIC(12, 4) NULL,
    relative_improvement_percent NUMERIC(12, 4) NULL,
    target_gap_percentage_points NUMERIC(12, 4) NULL,

    -- Window & Provenance References (Explicit planned vs actual completion semantics)
    planned_measurement_start TIMESTAMPTZ NOT NULL,
    planned_measurement_end TIMESTAMPTZ NOT NULL,
    actual_measured_at TIMESTAMPTZ NULL,
    data_source VARCHAR(255) NOT NULL,
    
    -- Evidence Structured Reference (reportId, snapshotHash, aggregationMethod, queryReference)
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Attribution & Policy-Based Wording Standard
    attribution_type VARCHAR(64) NOT NULL DEFAULT 'UNATTRIBUTED',
    attribution_confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    display_wording VARCHAR(255) NOT NULL DEFAULT 'Unattributed',

    -- Execution Latency Separation (ms)
    workflow_duration_ms BIGINT NOT NULL DEFAULT 0,
    active_execution_latency_ms BIGINT NOT NULL DEFAULT 0,
    human_approval_wait_ms BIGINT NOT NULL DEFAULT 0,

    -- Governance Risk & Autonomy Mode
    risk_level VARCHAR(32) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    autonomy_mode VARCHAR(32) NOT NULL DEFAULT 'AUTONOMOUS',
    approval_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    pilot_status VARCHAR(32) NOT NULL DEFAULT 'RUNNING' CHECK (pilot_status IN ('RUNNING', 'COMPLETED', 'FAILED')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);

-- 4. DATABASE-LEVEL IMMUTABILITY TRIGGERS
CREATE OR REPLACE FUNCTION prevent_immutable_pilot_ledger_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.sop_id <> NEW.sop_id OR OLD.sop_version <> NEW.sop_version OR OLD.tenant_id <> NEW.tenant_id OR OLD.pre_pilot_baseline <> NEW.pre_pilot_baseline THEN
        RAISE EXCEPTION 'Immutable Field Violation: sop_id, sop_version, tenant_id, and pre_pilot_baseline cannot be mutated.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_immutable_pilot_ledger_update ON public.production_pilot_ledgers;
CREATE TRIGGER trg_prevent_immutable_pilot_ledger_update
BEFORE UPDATE ON public.production_pilot_ledgers
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_pilot_ledger_update();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES — STRICT DENY ON MISSING TENANT
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_pilot_ledgers ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation SELECT Policies
CREATE POLICY tenant_isolation_tenants_select ON public.tenants
    FOR SELECT USING (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

CREATE POLICY tenant_isolation_outcome_contracts_select ON public.outcome_contracts
    FOR SELECT USING (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

CREATE POLICY tenant_isolation_pilot_ledgers_select ON public.production_pilot_ledgers
    FOR SELECT USING (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

-- Tenant Isolation INSERT / UPDATE Policies with WITH CHECK Enforcement
CREATE POLICY tenant_isolation_outcome_contracts_insert ON public.outcome_contracts
    FOR INSERT WITH CHECK (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

CREATE POLICY tenant_isolation_outcome_contracts_update ON public.outcome_contracts
    FOR UPDATE USING (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')))
    WITH CHECK (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

CREATE POLICY tenant_isolation_pilot_ledgers_insert ON public.production_pilot_ledgers
    FOR INSERT WITH CHECK (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

CREATE POLICY tenant_isolation_pilot_ledgers_update ON public.production_pilot_ledgers
    FOR UPDATE USING (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')))
    WITH CHECK (tenant_id = (NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')));

-- Service Role Bypass Policies (For System Background Execution Workers)
CREATE POLICY service_role_all_tenants ON public.tenants
    FOR ALL TO service_role USING (true);

CREATE POLICY service_role_all_outcome_contracts ON public.outcome_contracts
    FOR ALL TO service_role USING (true);

CREATE POLICY service_role_all_pilot_ledgers ON public.production_pilot_ledgers
    FOR ALL TO service_role USING (true);

-- 6. INDEXES FOR HIGH-PERFORMANCE TENANT & DOMAIN QUERYING
CREATE INDEX IF NOT EXISTS idx_pilot_ledgers_tenant_domain ON public.production_pilot_ledgers(tenant_id, domain);
CREATE INDEX IF NOT EXISTS idx_pilot_ledgers_workflow ON public.production_pilot_ledgers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_pilot_ledgers_sop_ver ON public.production_pilot_ledgers(sop_id, sop_version);
CREATE INDEX IF NOT EXISTS idx_outcome_contracts_tenant ON public.outcome_contracts(tenant_id);
