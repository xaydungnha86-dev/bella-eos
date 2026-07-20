-- =========================================================================
-- BELLA ENTERPRISE OPERATING SYSTEM (BELLA EOS) - SUPABASE DATABASE SCHEMA
-- Target Supabase Project: https://qwpyfhojxctrvqkjctcl.supabase.co
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. TABLE: ai_agents (Quản lý 11 AI Employees & Vị trí 3D Office Layout)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    role_id VARCHAR(50),
    department VARCHAR(50) NOT NULL,
    department_id VARCHAR(50),
    team_id VARCHAR(50),
    status VARCHAR(30) DEFAULT 'IDLE', -- 'IDLE' | 'PROCESSING' | 'WAITING_APPROVAL' | 'ERROR'
    icon VARCHAR(50) DEFAULT 'fa-robot',
    avatar VARCHAR(50) DEFAULT 'fa-robot',
    color_hex VARCHAR(10) DEFAULT '#06b6d4',
    color_num INT DEFAULT 439956,
    pos_x NUMERIC(5,2) DEFAULT 0.0,
    pos_y NUMERIC(5,2) DEFAULT 0.0,
    pos_z NUMERIC(5,2) DEFAULT 0.0,
    rotation_y NUMERIC(5,2) DEFAULT 0.0,
    current_task TEXT DEFAULT 'IDLE',
    workload_percent INT DEFAULT 50,
    model_id VARCHAR(100) DEFAULT 'gemini-1-5-flash',
    provider VARCHAR(50) DEFAULT 'google',
    temperature NUMERIC(3,2) DEFAULT 0.7,
    max_tokens INT DEFAULT 4096,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 2. TABLE: projects_workflows (Quản lý Project Hub, OKRs & Dynamic SOP)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects_workflows (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('PRJ-' || gen_random_uuid()),
    title VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    target_metric VARCHAR(100),
    budget_allocated_vnd NUMERIC(15,2) DEFAULT 50000000,
    actual_spent_vnd NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'
    okr_kr1 TEXT,
    okr_kr2 TEXT,
    okr_kr3 TEXT,
    workflow_steps JSONB DEFAULT '[]'::jsonb, -- 10 SOP Dynamic Steps
    created_by VARCHAR(50) DEFAULT 'ceo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 3. TABLE: task_contracts (Hợp đồng giao việc Task Kanban giữa các AI Agent)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_contracts (
    task_id VARCHAR(50) PRIMARY KEY DEFAULT ('TASK-' || gen_random_uuid()),
    project_id VARCHAR(50) REFERENCES public.projects_workflows(id) ON DELETE CASCADE,
    task_title VARCHAR(255) NOT NULL,
    assigned_to_member_id VARCHAR(50) REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    assigned_by_member_id VARCHAR(50) DEFAULT 'coo',
    input_specs JSONB DEFAULT '{}'::jsonb,
    mandatory_outputs JSONB DEFAULT '[]'::jsonb,
    definition_of_done JSONB DEFAULT '{}'::jsonb,
    sla_hours INT DEFAULT 4,
    status VARCHAR(30) DEFAULT 'ASSIGNED', -- 'ASSIGNED' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'WAITING_REVIEW' | 'COMPLETED' | 'REJECTED'
    quality_score INT DEFAULT 0,
    review_comments TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 4. TABLE: enterprise_logs (Nhật ký Hoạt động Audit Log Realtime)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enterprise_logs (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- 'SYSTEM' | 'AI COO' | 'POLICY ENGINE' | 'DECISION ENGINE' | 'CONNECTORS'
    message TEXT NOT NULL,
    style_class VARCHAR(100) DEFAULT 'text-slate-300',
    actor_id VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- SEED INITIAL DATA: 11 AI EMPLOYEES
-- -------------------------------------------------------------------------
INSERT INTO public.ai_agents (id, name, role, role_id, department, department_id, team_id, status, icon, avatar, color_hex, color_num, pos_x, pos_y, pos_z, rotation_y, current_task, workload_percent, model_id)
VALUES 
('ceo', 'CEO / Founder', 'Human Governance', 'role_ceo', 'executive', 'dept_exec', 'team_strategy', 'WAITING_APPROVAL', 'fa-crown', 'fa-crown', '#eab308', 15381256, -9.0, 0, 8.0, 0, 'Phê duyệt Kiến trúc Bella EIP', 40, 'gemini-1-5-pro'),
('coo', 'AI COO', 'Executive Operations & Dynamic Orchestrator', 'role_coo', 'coo_office', 'dept_coo', 'team_coo', 'IDLE', 'fa-user-tie', 'fa-user-tie', '#f59e0b', 16096779, -4.0, 0, 8.0, 0, 'Tự sinh Dynamic Workflow từ Objective', 65, 'gemini-1-5-pro'),
('ast', 'AI Assistant', 'Tổng hợp & Đôn đốc', 'role_ast', 'coo_office', 'dept_coo', 'team_coo', 'IDLE', 'fa-robot', 'fa-robot', '#0284c7', 164935, -1.0, 0, 8.0, 0, 'Giám sát tiến độ realtime', 50, 'gemini-1-5-flash'),
('pm', 'AI Product Manager', 'Phân tích & PRD', 'role_pm', 'product', 'dept_prod', 'team_product', 'PROCESSING', 'fa-file-lines', 'fa-file-lines', '#0284c7', 164935, -8.0, 0, -2.0, 0, 'Viết PRD Bella Spa POS Module', 75, 'gemini-1-5-pro'),
('cto', 'AI CTO', 'Kiến trúc Hệ thống', 'role_cto', 'product', 'dept_prod', 'team_architecture', 'IDLE', 'fa-sitemap', 'fa-sitemap', '#4f46e5', 5195493, -5.0, 0, -4.0, 0, 'Đánh giá Security & DB Schema', 60, 'gemini-1-5-pro'),
('tl', 'AI Tech Lead', 'Thiết kế Giải pháp', 'role_tl', 'product', 'dept_prod', 'team_architecture', 'IDLE', 'fa-diagram-project', 'fa-diagram-project', '#7c3aed', 8141549, -2.0, 0, -2.0, 0, 'Chia Task & Tech Spec', 70, 'gemini-1-5-flash'),
('dev', 'AI Developer', 'Lập trình & Code', 'role_dev', 'tech', 'dept_tech', 'team_frontend', 'IDLE', 'fa-code', 'fa-code', '#0284c7', 164935, 3.0, 0, -4.0, 0, 'Viết React/Node.js Code', 80, 'claude-3-5-sonnet'),
('des', 'AI Designer', 'Thiết kế UI/UX', 'role_des', 'tech', 'dept_tech', 'team_frontend', 'IDLE', 'fa-palette', 'fa-palette', '#db2777', 14362487, 6.0, 0, -2.0, 0, 'Tạo Design Tokens & Wireframe', 85, 'gemini-1-5-flash'),
('qa', 'AI QA', 'Kiểm thử Tự động', 'role_qa', 'tech', 'dept_tech', 'team_qa', 'IDLE', 'fa-vial', 'fa-vial', '#059669', 366185, 8.0, 0, -5.0, 0, 'Chạy E2E Playwright Suite', 55, 'gemini-1-5-flash'),
('devops', 'AI DevOps', 'Triển khai & Infra', 'role_devops', 'ops', 'dept_ops', 'team_devops', 'IDLE', 'fa-server', 'fa-server', '#d97706', 14251782, 8.0, 0, 4.0, 0, 'CI/CD Pipeline Build & Logs', 50, 'gemini-1-5-flash'),
('mkt', 'AI Marketing', 'Nội dung & Chiến dịch', 'role_mkt', 'growth', 'dept_growth', 'team_marketing', 'IDLE', 'fa-bullhorn', 'fa-bullhorn', '#e11d48', 14753096, 3.0, 0, 8.0, 0, 'Soạn Release Notes & SEO Copy', 75, 'gpt-4o'),
('sales', 'AI Sales', 'Báo giá & Tư vấn', 'role_sales', 'growth', 'dept_growth', 'team_sales', 'IDLE', 'fa-briefcase', 'fa-briefcase', '#059669', 366185, 6.0, 0, 8.0, 0, 'Chuẩn bị Demo & Proposal', 92, 'gpt-4o'),
('fin', 'AI Finance', 'Dòng tiền & Chi phí', 'role_fin', 'growth', 'dept_growth', 'team_finance', 'IDLE', 'fa-calculator', 'fa-calculator', '#ca8a04', 13273604, 8.0, 0, 8.0, 0, 'Dự báo Dòng tiền & Token Burn', 45, 'gemini-1-5-flash')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    current_task = EXCLUDED.current_task,
    updated_at = NOW();

-- -------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ/WRITE POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access to ai_agents" ON public.ai_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to projects_workflows" ON public.projects_workflows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to task_contracts" ON public.task_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access to enterprise_logs" ON public.enterprise_logs FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- ENABLE REALTIME PUBLICATION FOR SUPABASE BROADCAST & LISTEN
-- -------------------------------------------------------------------------
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.ai_agents, public.projects_workflows, public.task_contracts, public.enterprise_logs;
