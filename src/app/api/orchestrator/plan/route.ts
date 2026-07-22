import { NextResponse } from 'next/server';

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
    name: 'AI Marketing Manager',
    description: 'AI Marketing Manager chiến lược chuyên phân tích yêu cầu CEO, lập kế hoạch mục tiêu OKR/KPI, phân tích chân dung đối tượng & hoạch định quy trình thực thi chi tiết cho các Worker',
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
1. TASK ĐẦU TIÊN (t1) LUÔN LUÔN VÀ BẮT BUỘC LÀ: "AI Marketing Manager" (agent_id: "eos_marketing_manager", task_type: "analyze_marketing_strategy") với "requires_human_approval": true và "depends_on": []. Nhiệm vụ này phân tích chỉ thị CEO, đặt mục tiêu OKR/KPI, phân tích đối tượng và lập lộ trình triển khai.
2. Phân định vai trò chuẩn xác cho các bước tiếp theo:
   - "AI Marketing Manager" (t1): Phân tích chiến lược, lập mục tiêu OKR/KPI & hoạch định lộ trình (depends_on: [], requires_human_approval: true)
   - "Bella EOS Content Worker" (t2): Soạn thảo bài viết tiếp thị dựa trên chiến lược của Marketing Manager (depends_on: ["t1"])
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
      "agent_name": "AI Marketing Manager",
      "task_type": "analyze_marketing_strategy",
      "task_description": "Phân tích yêu cầu CEO, lập kế hoạch mục tiêu OKR/KPI & hoạch định quy trình",
      "input": { "objective": "...", "tone": "...", "target_audience": "..." },
      "expected_output": "Bản phân tích chiến lược marketing chi tiết, mục tiêu OKR/KPI & lộ trình phân bổ công việc",
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

    // ── Try OpenAI GPT-4o ─────────────────────────────────────────────────
    const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
    if (openaiKey) {
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
          return NextResponse.json({ success: true, plan, provider: 'openai', model: 'gpt-4o' });
        }
        console.warn('[orchestrator/plan] OpenAI error:', data.error?.message);
      } catch (e) { console.warn('[orchestrator/plan] OpenAI unavailable:', e); }
    }

    // ── Try Anthropic Claude ──────────────────────────────────────────────
    const anthropicKey = client_anthropic_key || process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
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
          return NextResponse.json({ success: true, plan, provider: 'anthropic', model: 'claude-3-5-sonnet' });
        }
        console.warn('[orchestrator/plan] Anthropic error:', data.error?.message);
      } catch (e) { console.warn('[orchestrator/plan] Anthropic unavailable:', e); }
    }

    // ── Try Google Gemini ─────────────────────────────────────────────────
    const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (geminiKey) {
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
          return NextResponse.json({ success: true, plan, provider: 'gemini', model: 'gemini-2.5-flash' });
        }
        console.warn('[orchestrator/plan] Gemini error:', data.error?.message);
      } catch (e) { console.warn('[orchestrator/plan] Gemini unavailable:', e); }
    }

    // ── Fallback: Rule-based planner (no LLM needed) ──────────────────────
    console.info('[orchestrator/plan] No AI key — using rule-based planner fallback.');
    const fallbackPlan = buildFallbackPlan(objective, context);
    return NextResponse.json({
      success: true,
      plan: fallbackPlan,
      provider: 'rule-based',
      model: 'fallback-planner',
      warning: 'Chưa cấu hình AI API Key. Kế hoạch được tạo bởi AI COO Rule-Based Engine. Cấu hình OpenAI/Claude/Gemini để Orchestrator AI thật sự tự phân tích.'
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

  // Task 1: AI Marketing Manager analyzes CEO requirements & plans OKR/roadmap
  tasks.push({
    task_id: 't1',
    agent_id: 'eos_marketing_manager',
    agent_name: 'AI Marketing Manager',
    task_type: 'analyze_marketing_strategy',
    task_description: `Phân tích yêu cầu CEO, lập kế hoạch mục tiêu OKR/KPI & hoạch định quy trình cho chiến dịch: "${objective}"`,
    input: { objective, tone, target_audience: segment },
    expected_output: 'Bản phân tích chiến lược marketing chi tiết, mục tiêu OKR/KPI & lộ trình phân bổ công việc cho AI Workforce',
    depends_on: [],
    requires_human_approval: true
  });

  // Task 2: Bella EOS Content Worker drafts the marketing copy
  tasks.push({
    task_id: 't2',
    agent_id: 'eos_content_worker',
    agent_name: 'Bella EOS Content Worker',
    task_type: 'write_facebook_post',
    task_description: `Soạn thảo bài viết truyền thông & Offer trải nghiệm Demo cho chiến dịch: "${objective}"`,
    input: { objective, tone, target_audience: segment, platform: 'facebook', strategy_from: 't1' },
    expected_output: 'Bài đăng Facebook hoàn chỉnh từ Bella EOS Worker, có hook, offer và hashtag',
    depends_on: ['t1']
  });

  // Task 3: Bella EOS Media & Creative Worker generates visual banner / mockup
  tasks.push({
    task_id: 't3',
    agent_id: 'eos_creative_worker',
    agent_name: 'Bella EOS Media & Creative Worker',
    task_type: 'generate_media_creative',
    task_description: 'Thiết kế Banner hình ảnh thương hiệu & Mockup Giao diện Demo Spa Bella EOS',
    input: { objective, content_from: 't2', format: '1200x630_banner' },
    expected_output: 'File Banner hình ảnh thiết kế 4K chất lượng cao phục vụ đăng bài & chạy ads',
    depends_on: ['t2']
  });

  // Task 4: Hermes Social Publisher receives both Post Content (t2) + Visual Banner (t3) and publishes to Facebook
  tasks.push({
    task_id: 't4',
    agent_id: 'hermes_social',
    agent_name: 'Hermes Social Publisher',
    task_type: 'publish_facebook',
    task_description: 'Nhận Bài viết từ EOS Content Worker & Banner từ EOS Creative Worker để đăng bài hoàn chỉnh lên Fanpage Facebook',
    input: { content_from: 't2', media_from: 't3', platform: 'facebook' },
    expected_output: 'Hermes thực thi đăng bài bài viết + hình ảnh thành công lên Fanpage Facebook, trả về Post ID',
    depends_on: ['t2', 't3']
  });

  // Task 5: Ares Ads Agent sets up ad campaign with the text + banner
  if (lowerObj.includes('quảng cáo') || lowerObj.includes('ads') || lowerObj.includes('ngân sách') || lowerObj.includes('demo') || lowerObj.includes('spa')) {
    tasks.push({
      task_id: 't5',
      agent_id: 'ares_ads',
      agent_name: 'Ares Ads Agent',
      task_type: 'create_facebook_ad',
      task_description: 'Nhận bài viết + Banner thiết kế và cấu hình chiến dịch quảng cáo Facebook Ads',
      input: { objective, budget_hint: objective, content_from: 't2', media_from: 't3' },
      expected_output: 'Cấu hình chiến dịch quảng cáo Facebook Ads hoàn chỉnh kèm ngân sách',
      depends_on: ['t2', 't3']
    });
  }

  // Task 5: Athena Analytics Agent forecasts KPI/ROI
  tasks.push({
    task_id: `t${tasks.length + 1}`,
    agent_id: 'athena_analytics',
    agent_name: 'Athena Analytics Agent',
    task_type: 'generate_report',
    task_description: 'Phân tích và dự báo hiệu suất KPI & ROI 30 ngày cho chiến dịch',
    input: { objective, metrics: ['reach', 'engagement', 'demo_registrations', 'roi'] },
    expected_output: 'Báo cáo dự báo KPI và ROI cho chiến dịch',
    depends_on: []
  });

  return {
    plan_title: `Kế hoạch AI COO & Marketing Manager: ${objective.substring(0, 60)}...`,
    reasoning: 'AI Marketing Manager phân tích chiến lược & mục tiêu OKR ➔ Bella EOS Content Worker soạn bài ➔ Bella EOS Creative Worker tạo Banner ➔ Hermes Social Agent xuất bản ➔ Ares Ads chạy QC ➔ Athena Analytics đo lường KPI.',
    tasks
  };
}
