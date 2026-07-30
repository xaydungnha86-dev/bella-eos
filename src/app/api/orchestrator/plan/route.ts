import { NextResponse } from 'next/server';
import { rankCandidatesForTask } from '../../../../core/orchestration/hybrid-dispatcher';

function enrichTasksWithScorecard(tasks: any[]) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(task => {
    const candidates = rankCandidatesForTask(
      task.task_type,
      task.agent_id,
      task.agent_name
    );
    
    // Choose the highest scoring candidate (AI or human) as default assigned_to
    const bestCandidate = candidates[0];
    
    return {
      ...task,
      assigned_to: bestCandidate ? bestCandidate.id : task.agent_id,
      assignee_type: bestCandidate ? bestCandidate.type : 'AI',
      candidate_scores: candidates,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days default SLA
    };
  });
}


/**
 * POST /api/orchestrator/plan
 *
 * THE BRAIN OF THE SYSTEM.
 *
 * Takes a CEO's raw intent (objective) + Canonical Context Package,
 * calls an LLM to dynamically decompose it into an execution plan
 * with specific agents and tasks.
 *
 * The LLM decides:
 *   - WHICH agents are needed
 *   - WHAT each agent must do
 *   - In WHAT ORDER tasks execute
 *   - WHAT tools each agent should use
 *
 * This is NOT hardcoded — the LLM reasons about the intent
 * and produces a structured JSON execution plan.
 */

// ─── Agent Registry — 9 Enterprise Domain AI Agent Matrix ─────────────────
const AGENT_REGISTRY = [
  {
    id: 'eos_marketing_manager',
    name: 'CMO AI (Executive Marketing Strategist)',
    description: 'CMO AI chiến lược cấp cao chuyên nhận Enterprise Context Contract (ECC), lập giao kèo EIC, DAG reasoning, phân tích bối cảnh & duyệt Executive Decision Package để phân bổ việc',
    tools: ['analyze_marketing_strategy', 'plan_campaign_roadmap'],
    output_type: 'marketing_strategy'
  },
  {
    id: 'eos_content_worker',
    name: 'Bella EOS Content Worker',
    description: 'AI Worker nội bộ của Bella EOS chuyên phân tích chỉ thị CEO và soạn thảo nội dung truyền thông, marketing copy chuẩn hóa',
    tools: ['write_facebook_post', 'write_zalo_message', 'write_email_campaign', 'write_ad_copy'],
    output_type: 'content'
  },
  {
    id: 'eos_creative_worker',
    name: 'Bella EOS Media & Creative Worker',
    description: 'AI Worker chuyên nghiệp thiết kế Banner hình ảnh tiếp thị, Video Demo, Mockup Giao diện cho chiến dịch truyền thông',
    tools: ['generate_media_creative', 'create_banner_design'],
    output_type: 'media'
  },
  {
    id: 'hermes_social',
    name: 'Hermes Social Publisher',
    description: 'Agent kênh truyền thông Hermes chuyên nhận nội dung bài viết + hình ảnh/video từ các EOS Worker và thực thi đăng bài hoàn chỉnh lên mạng xã hội (Facebook, Zalo, TikTok)',
    tools: ['publish_facebook', 'publish_zalo', 'publish_tiktok', 'schedule_post'],
    output_type: 'publication'
  },
  {
    id: 'hermes_finance',
    name: 'Hermes Finance & Treasury Agent',
    description: 'Agent Tài chính & Ngân sách chuyên mô hình hóa dòng tiền, thẩm định ngân sách chỉ thị CEO, tính toán chi phí và phân bổ vốn',
    tools: ['audit_finance_budget', 'project_cashflow', 'evaluate_roi_financial'],
    output_type: 'financial_approval'
  },
  {
    id: 'themis_legal',
    name: 'Themis Legal & Compliance Agent',
    description: 'Agent Pháp lý & Tuân thủ chuyên rà soát quy định pháp luật, hợp đồng thương mại, điều khoản bảo vệ quyền sở hữu trí tuệ và chính sách thương hiệu',
    tools: ['audit_legal_compliance', 'review_contract_terms', 'evaluate_policy_risk'],
    output_type: 'legal_audit'
  },
  {
    id: 'pacioli_accounting',
    name: 'Pacioli Accounting & Tax Agent',
    description: 'Agent Kế toán & Thuế chuyên nghiệp chuẩn hóa chứng từ EOM, phân bổ chi phí kế toán và kiểm soát nghĩa vụ thuế doanh nghiệp',
    tools: ['normalize_ledger_eom', 'audit_tax_compliance', 'generate_invoice_records'],
    output_type: 'accounting_record'
  },
  {
    id: 'ops_operations',
    name: 'Ops Operations & Supply Agent',
    description: 'Agent Vận hành & SLA chuyên điều phối quy trình vận hành chuỗi chi nhánh, xếp lịch dịch vụ Spa, tối ưu công suất và SLA phục vụ',
    tools: ['optimize_operational_sop', 'schedule_branch_capacity', 'audit_service_sla'],
    output_type: 'operational_plan'
  },
  {
    id: 'turing_code',
    name: 'Turing Engineering & Code Agent',
    description: 'Agent Công nghệ & Lập trình chuyên viết code, refactor ứng dụng, tích hợp API connector và đảm bảo hạ tầng hệ thống',
    tools: ['generate_system_code', 'integrate_api_connector', 'refactor_codebase'],
    output_type: 'engineering_artifact'
  },
  {
    id: 'apollo_pr',
    name: 'Apollo PR & Communications Agent',
    description: 'Agent Truyền thông & PR thương hiệu chuyên viết thông cáo báo chí, xử lý truyền thông doanh nghiệp và thông điệp thương hiệu cao cấp',
    tools: ['write_press_release', 'manage_brand_reputation'],
    output_type: 'pr_campaign'
  },
  {
    id: 'demeter_hr',
    name: 'Demeter HR & Talent Agent',
    description: 'Agent Nhân sự & Đào tạo chuyên quản lý thông tin nhân sự, tiêu chuẩn đào tạo KTV Spa, KPI nhân sự và ma trận chính sách đãi ngộ',
    tools: ['manage_hr_policy', 'audit_staff_kpi', 'create_training_sop'],
    output_type: 'hr_policy'
  },
  {
    id: 'ares_ads',
    name: 'Ares Ads Agent',
    description: 'Chuyên nhận bài viết + hình ảnh từ Bella EOS Worker để thiết lập và tối ưu chiến dịch quảng cáo trả phí (Facebook Ads, Google Ads, TikTok Ads)',
    tools: ['create_facebook_ad', 'setup_google_campaign', 'optimize_ad_budget', 'create_audience'],
    output_type: 'campaign'
  },
  {
    id: 'athena_analytics',
    name: 'Athena Analytics Agent',
    description: 'Chuyên phân tích dữ liệu, báo cáo hiệu suất, đo lường KPI, dự báo ROI',
    tools: ['analyze_campaign_data', 'generate_report', 'forecast_roi', 'segment_audience'],
    output_type: 'insight'
  }
];

const ORCHESTRATOR_SYSTEM_PROMPT = `Bạn là AI COO (Chief Operating Officer) của hệ thống Bella EOS Enterprise Brain.
Nhiệm vụ: Phân tích chỉ thị chiến lược của CEO, sau đó tự động lập kế hoạch thực thi đa phân hệ (Topology Task Graph).

Danh sách Agent & Worker có sẵn:
${JSON.stringify(AGENT_REGISTRY, null, 2)}

Quy tắc BẮT BUỘC khi lập kế hoạch (Execution Topology Rules):
1. TASK ĐẦU TIÊN (t1) LUÔN LUÔN VÀ BẮT BUỘC LÀ: "CMO AI (Executive Marketing Strategist)" (agent_id: "eos_marketing_manager", task_type: "analyze_marketing_strategy") với "requires_human_approval": true và "depends_on": []. Nhiệm vụ này phân tích chỉ thị CEO qua ECC, ký giao kèo EIC, thiết lập đồ thị suy luận DAG và đề xuất kế hoạch triển khai.
2. Phân định vai trò chuẩn xác cho các bước tiếp theo:
   - "CMO AI (Executive Marketing Strategist)" (t1): Phân tích chiến lược cấp C-level, lập đồ thị DAG & duyệt quyết định (depends_on: [], requires_human_approval: true)
   - "Bella EOS Content Worker" (t2): Soạn thảo bài viết tiếp thị dựa trên chiến lược của CMO (depends_on: ["t1"])
   - "Bella EOS Media & Creative Worker" (t3): Thiết kế Banner hình ảnh thương hiệu / Video Demo (depends_on: ["t2"])
   - "Hermes Social Publisher" (t4): Nhận Bài viết (t2) + Banner (t3) ➔ Thực thi ĐĂNG BÀI HOÀN CHỈNH lên Fanpage Facebook (depends_on: ["t2", "t3"])
   - "Ares Ads Agent" (t5): Cấu hình chiến dịch Facebook Ads (depends_on: ["t2", "t3"])
   - "Athena Analytics Agent" (t6): Báo cáo dự báo KPI & ROI 30 ngày cho chiến dịch

Trả về JSON THUẦN TÚY (không có markdown, không có backtick), theo schema sau:
{
  "plan_title": "tên ngắn của kế hoạch",
  "reasoning": "lý do bạn bóc tách các agent và task này",
  "tasks": [
    {
      "task_id": "t1",
      "agent_id": "eos_marketing_manager",
      "agent_name": "CMO AI (Executive Marketing Strategist)",
      "task_type": "analyze_marketing_strategy",
      "task_description": "Phân tích yêu cầu CEO qua ECC, ký giao kèo EIC, thiết lập đồ thị suy luận DAG",
      "input": { "objective": "...", "tone": "...", "target_audience": "..." },
      "expected_output": "Hợp đồng EIC chi tiết, đồ thị suy luận DAG & lộ trình phân bổ công việc cho AI Workforce",
      "depends_on": [],
      "requires_human_approval": true
    },
    {
      "task_id": "t2",
      "agent_id": "eos_content_worker",
      "agent_name": "Bella EOS Content Worker",
      "task_type": "write_facebook_post",
      "task_description": "Soạn thảo bài viết truyền thông & Offer trải nghiệm Demo cho chiến dịch",
      "input": { "objective": "...", "tone": "...", "target_audience": "...", "platform": "facebook", "strategy_from": "t1" },
      "expected_output": "Bài đăng Facebook hoàn chỉnh từ Bella EOS Worker",
      "depends_on": ["t1"]
    }
  ]
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      objective,
      context,
      client_openai_key,
      client_anthropic_key,
      client_gemini_key
    } = body as {
      objective: string;
      context?: any;
      client_openai_key?: string;
      client_anthropic_key?: string;
      client_gemini_key?: string;
    };

    if (!objective) {
      return NextResponse.json({ error: 'objective is required' }, { status: 400 });
    }

    const userMessage = `CEO YÊU CẦU: "${objective}"

Context hiện tại của doanh nghiệp:
- Tông giọng thương hiệu: ${context?.brandDna?.voiceTone || 'Professional & Premium'}
- Phân khúc mục tiêu: ${context?.brandDna?.targetSegment || 'Khách hàng tiềm năng'}
- Mục tiêu dài hạn: ${context?.objective || objective}

Hãy lập kế hoạch thực thi đầy đủ để đạt được mục tiêu này.`;

    // ── Diagnostic Error Collector ───────────────────────────────────────
    let diagnosticErrors: string[] = [];

    // ── Try OpenAI GPT-4o ─────────────────────────────────────────────────
    const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
    if (openaiKey && !openaiKey.includes('your_openai_api_key')) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: ORCHESTRATOR_SYSTEM_PROMPT },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
          })
        });
        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          const plan = JSON.parse(data.choices[0].message.content);
          if (plan) plan.tasks = enrichTasksWithScorecard(plan.tasks);
          return NextResponse.json({ success: true, plan, provider: 'openai', model: 'gpt-4o' });
        }
        const errStr = data.error?.message || `HTTP ${res.status}`;
        diagnosticErrors.push(`OpenAI Error: ${errStr}`);
        console.warn('[orchestrator/plan] OpenAI error:', errStr);
      } catch (e: any) { 
        diagnosticErrors.push(`OpenAI Exception: ${e.message}`);
        console.warn('[orchestrator/plan] OpenAI unavailable:', e); 
      }
    }

    // ── Try Anthropic Claude ──────────────────────────────────────────────
    const anthropicKey = client_anthropic_key || process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && !anthropicKey.includes('your_anthropic_api_key')) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            system: ORCHESTRATOR_SYSTEM_PROMPT + '\n\nChỉ trả về JSON thuần túy, không có markdown.',
            messages: [{ role: 'user', content: userMessage }]
          })
        });
        const data = await res.json();
        if (res.ok && data.content?.[0]?.text) {
          const raw = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const plan = JSON.parse(raw);
          if (plan) plan.tasks = enrichTasksWithScorecard(plan.tasks);
          return NextResponse.json({ success: true, plan, provider: 'anthropic', model: 'claude-3-5-sonnet' });
        }
        const errStr = data.error?.message || `HTTP ${res.status}`;
        diagnosticErrors.push(`Anthropic Error: ${errStr}`);
        console.warn('[orchestrator/plan] Anthropic error:', errStr);
      } catch (e: any) { 
        diagnosticErrors.push(`Anthropic Exception: ${e.message}`);
        console.warn('[orchestrator/plan] Anthropic unavailable:', e); 
      }
    }

    // ── Try Google Gemini ─────────────────────────────────────────────────
    const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (geminiKey && !geminiKey.includes('your_gemini_api_key')) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: ORCHESTRATOR_SYSTEM_PROMPT + '\n\n' + userMessage }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4000,
              responseMimeType: 'application/json'
            }
          })
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (res.ok && text) {
          const raw = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const plan = JSON.parse(raw);
          if (plan) plan.tasks = enrichTasksWithScorecard(plan.tasks);
          return NextResponse.json({ success: true, plan, provider: 'google-gemini', model: 'gemini-2.5-flash' });
        }
        const errStr = data.error?.message || `HTTP ${res.status}`;
        diagnosticErrors.push(`Gemini Error: ${errStr}`);
        console.warn('[orchestrator/plan] Gemini error:', errStr);
      } catch (e: any) { 
        diagnosticErrors.push(`Gemini Exception: ${e.message}`);
        console.warn('[orchestrator/plan] Gemini unavailable:', e); 
      }
    }

    // ── Fallback: Rule-based planner (no LLM needed) ──────────────────────
    const fallbackDiagnostic = diagnosticErrors.length > 0
      ? diagnosticErrors.join(' | ')
      : 'Chưa nhập API Key hợp lệ (hoặc key mang giá trị mặc định trong .env.local)';

    console.info('[orchestrator/plan] Fallback triggered:', fallbackDiagnostic);
    const fallbackPlan = buildFallbackPlan(objective, context);
    if (fallbackPlan) fallbackPlan.tasks = enrichTasksWithScorecard(fallbackPlan.tasks);
    return NextResponse.json({
      success: true,
      plan: fallbackPlan,
      provider: 'rule-based-fallback',
      model: 'ece-fallback-planner',
      warning: `[Chế độ AI Fallback] Lý do: ${fallbackDiagnostic}. Kế hoạch được kích hoạt từ AI COO Dynamic Rule Engine. Cấu hình Key trong màn hình Cài Đặt để gọi trực tiếp LLM API.`
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── Rule-Based Fallback Planner (AI COO Execution Topology) ────────────────
function buildFallbackPlan(objective: string, context?: any) {
  const tone = context?.brandDna?.voiceTone || 'Professional & Premium';
  const segment = context?.brandDna?.targetSegment || 'Khách hàng tiềm năng';

  const lowerObj = objective.toLowerCase();
  const tasks = [];

  // PHASE 1: C-SUITE COUNCIL REVIEW & DEBATE TASKS
  // Task 0: AI COO Orchestrator
  tasks.push({
    task_id: 't0',
    agent_id: 'coo',
    agent_name: 'AI COO Orchestrator',
    task_type: 'orchestrate_enterprise_plan',
    task_description: `Triệu tập Hội đồng Phản biện C-Suite, lập sơ đồ OKRs phòng ban & mô phỏng Monte Carlo 10,000 lần cho chỉ thị: "${objective}"`,
    input: { objective, tone, target_audience: segment },
    expected_output: 'Lộ trình Kế hoạch Điều Phối Tổng Thể (Orchestration Plan) & Sơ đồ phân bổ nhiệm vụ AI Workforce',
    depends_on: [],
    requires_human_approval: false
  });

  // Task 1: CMO AI (Executive Marketing Strategist)
  tasks.push({
    task_id: 't1',
    agent_id: 'eos_marketing_manager',
    agent_name: 'CMO AI (Executive Marketing Strategist)',
    task_type: 'analyze_marketing_strategy',
    task_description: `Thẩm định Phễu Marketing, thiết lập đồ thị suy luận DAG & trình Tờ trình Phê duyệt C-Suite cho chiến dịch: "${objective}"`,
    input: { objective, tone, target_audience: segment },
    expected_output: 'Giao kèo EIC chi tiết, đồ thị suy luận DAG & Tờ trình Phê duyệt C-Suite',
    depends_on: ['t0'],
    requires_human_approval: true
  });

  // Task 2: Sales Director AI (Sales Council)
  tasks.push({
    task_id: 't2',
    agent_id: 'sales_director',
    agent_name: 'Sales Director AI',
    task_type: 'evaluate_sales_funnel',
    task_description: 'Thẩm định & Chuẩn hóa Kịch bản Chốt Booking trên CRM để phòng chống đứt gãy phễu chuyển đổi',
    input: { objective, target_audience: segment },
    expected_output: 'Bản chuẩn hóa kịch bản chốt đơn CRM & Quy trình phản hồi Lead dưới 3 phút',
    depends_on: ['t0']
  });

  // Task 3: Demeter HR & Staffing AI (HR Council)
  tasks.push({
    task_id: 't3',
    agent_id: 'demeter_hr',
    agent_name: 'Demeter HR & Staffing AI',
    task_type: 'audit_hr_capacity',
    task_description: 'Thẩm định công suất ca làm của Kỹ thuật viên Spa & Phân bổ nhân sự phục vụ lượt khách tăng trưởng',
    input: { objective },
    expected_output: 'Báo cáo tải trọng ca KTV & Kế hoạch phụ cấp OT phục vụ 40 lượt demo',
    depends_on: ['t0']
  });

  // Task 4: Themis Legal & Hermes Finance AI (Governance Council)
  tasks.push({
    task_id: 't4',
    agent_id: 'themis_legal',
    agent_name: 'Themis Legal & Hermes Finance AI',
    task_type: 'audit_legal_finance',
    task_description: 'Kiểm toán Policy Guard về Hạn mức Ngân sách, Bản quyền truyền thông & An toàn Pháp lý',
    input: { objective },
    expected_output: 'Chứng nhận Policy Guard Audit Pass & Hạn mức chi tiêu tài chính an toàn',
    depends_on: ['t0']
  });

  // PHASE 3: AI WORKFORCE EXECUTION TASKS
  const contentTaskDesc = lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ')
    ? `Soạn thảo bài viết Marketing cho ngành Spa/Thẩm mỹ: "${objective.substring(0, 60)}"`
    : lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ')
    ? `Soạn thảo bài viết Marketing cho dự án Bất động sản: "${objective.substring(0, 60)}"`
    : lowerObj.includes('bella eos') || lowerObj.includes('platform') || lowerObj.includes('eic')
    ? `Soạn thảo bài viết Marketing cho Nền tảng AI BELLA EOS: "${objective.substring(0, 60)}"`
    : `Soạn thảo bài viết truyền thông & Offer trải nghiệm cho: "${objective.substring(0, 60)}"`;
    
  tasks.push({
    task_id: 't5',
    agent_id: 'eos_content_worker',
    agent_name: 'BELLA EOS Content Worker',
    task_type: 'write_facebook_post',
    task_description: contentTaskDesc,
    input: { 
      objective: objective,
      tone, 
      target_audience: segment, 
      platform: 'facebook'
    },
    expected_output: 'Bài đăng Facebook hoàn chỉnh từ Bella EOS Worker, có hook, offer và hashtag',
    depends_on: ['t1']
  });

  const creativeTaskDesc = lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ')
    ? `Thiết kế Banner hình ảnh thương hiệu & Mockup Giao diện cho ngành Spa/Làm đẹp`
    : lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ')
    ? `Thiết kế Banner hình ảnh thương hiệu & Mockup cho dự án Bất động sản`
    : lowerObj.includes('bella eos') || lowerObj.includes('platform') || lowerObj.includes('eic')
    ? `Thiết kế Banner hình ảnh thương hiệu cho Nền tảng Enterprise AI - BELLA EOS`
    : `Thiết kế Banner hình ảnh thương hiệu chất lượng cao cho chiến dịch: "${objective.substring(0, 60)}"`;
  
  tasks.push({
    task_id: 't6',
    agent_id: 'eos_creative_worker',
    agent_name: 'BELLA EOS Media & Creative Worker',
    task_type: 'generate_media_creative',
    task_description: creativeTaskDesc,
    input: { objective, content_from: 't5', format: '1200x630_banner' },
    expected_output: 'File Banner hình ảnh thiết kế 4K chất lượng cao phục vụ đăng bài & chạy ads',
    depends_on: ['t5']
  });

  tasks.push({
    task_id: 't7',
    agent_id: 'hermes_social',
    agent_name: 'Hermes Social Publisher',
    task_type: 'publish_facebook',
    task_description: 'Nhận Bài viết từ Content Worker & Banner từ Creative Worker để lập lịch & đăng bài tự động lên Fanpage',
    input: { content_from: 't5', media_from: 't6', platform: 'facebook' },
    expected_output: 'Hermes thực thi đăng bài bài viết + hình ảnh thành công lên Fanpage Facebook, trả về Post ID',
    depends_on: ['t5', 't6']
  });

  tasks.push({
    task_id: 't8',
    agent_id: 'ares_ads',
    agent_name: 'Ares Ads Agent',
    task_type: 'create_facebook_ad',
    task_description: 'Cấu hình chiến dịch quảng cáo Facebook Ads tăng phủ phễu tiếp thị',
    input: { objective, budget_hint: objective, content_from: 't5', media_from: 't6' },
    expected_output: 'Cấu hình chiến dịch quảng cáo Facebook Ads hoàn chỉnh kèm ngân sách',
    depends_on: ['t5', 't6']
  });

  tasks.push({
    task_id: 't9',
    agent_id: 'athena_analytics',
    agent_name: 'Athena Analytics Agent',
    task_type: 'generate_report',
    task_description: 'Phân tích và dự báo hiệu suất KPI & ROI 30 ngày cho chiến dịch',
    input: { objective, metrics: ['reach', 'engagement', 'demo_registrations', 'roi'] },
    expected_output: 'Báo cáo dự báo KPI và ROI cho chiến dịch',
    depends_on: []
  });

  return {
    plan_title: `Kế hoạch Vận Hành Tổng Thể Bella EOS: ${objective.substring(0, 60)}...`,
    reasoning: 'Hội đồng C-Suite thẩm định (COO, CMO, Sales, HR, Legal/Finance) ➔ CEO Phê duyệt Tờ trình ➔ Bella EOS AI Workforce thực thi đa kênh (Content, Banner, Hermes, Ares, Athena).',
    tasks
  };
}
