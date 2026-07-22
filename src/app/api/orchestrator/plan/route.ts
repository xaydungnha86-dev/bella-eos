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

// ─── Agent Registry — available agents the LLM can assign tasks to ─────────
const AGENT_REGISTRY = [
  {
    id: 'eos_content_worker',
    name: 'Bella EOS Content Worker',
    description: 'AI Worker nội bộ của Bella EOS chuyên phân tích chỉ thị CEO và soạn thảo nội dung truyền thông, marketing copy chuẩn hóa',
    tools: ['write_facebook_post', 'write_zalo_message', 'write_email_campaign', 'write_ad_copy'],
    output_type: 'content'
  },
  {
    id: 'hermes_social',
    name: 'Hermes Social Publisher',
    description: 'Agent kênh truyền thông Hermes chuyên nhận nội dung đã soạn thảo từ Bella EOS Worker và thực thi đăng bài lên các kênh xã hội (Facebook, Zalo, TikTok)',
    tools: ['publish_facebook', 'publish_zalo', 'publish_tiktok', 'schedule_post'],
    output_type: 'publication'
  },
  {
    id: 'athena_analytics',
    name: 'Athena Analytics Agent',
    description: 'Chuyên phân tích dữ liệu, báo cáo hiệu suất, đo lường KPI, dự báo',
    tools: ['analyze_campaign_data', 'generate_report', 'forecast_roi', 'segment_audience'],
    output_type: 'insight'
  },
  {
    id: 'ares_ads',
    name: 'Ares Ads Agent',
    description: 'Chuyên nhận nội dung từ Bella EOS Worker để thiết lập và tối ưu chiến dịch quảng cáo trả phí (Facebook Ads, Google Ads, TikTok Ads)',
    tools: ['create_facebook_ad', 'setup_google_campaign', 'optimize_ad_budget', 'create_audience'],
    output_type: 'campaign'
  },
  {
    id: 'demeter_crm',
    name: 'Demeter CRM Agent',
    description: 'Chuyên quản lý dữ liệu khách hàng, phân khúc, lead nurturing, retention',
    tools: ['update_crm', 'segment_customers', 'send_personalized_message', 'create_loyalty_offer'],
    output_type: 'customer_action'
  }
];

const ORCHESTRATOR_SYSTEM_PROMPT = `Bạn là AI Orchestrator (COO AI) của hệ thống Bella EOS Enterprise Brain.
Nhiệm vụ: Phân tích mục tiêu chiến lược của CEO, sau đó tự động lập kế hoạch thực thi chi tiết.

Bạn CÓ quyền truy cập vào danh sách Agent sau đây:
${JSON.stringify(AGENT_REGISTRY, null, 2)}

Quy tắc lập kế hoạch:
1. Đọc mục tiêu của CEO một cách cẩn thận
2. Xác định TẤT CẢ các công việc cần thực hiện để đạt được mục tiêu đó
3. Phân định vai trò RÕ RÀNG:
   - "Bella EOS Content Worker" chịu trách nhiệm SOẠN THẢO NỘI DUNG (task_type: write_facebook_post)
   - "Hermes Social Publisher" chịu trách nhiệm NHẬN NỘI DUNG VÀ ĐĂNG BÀI (task_type: publish_facebook, depends_on: [task soạn thảo])
   - "Ares Ads Agent" chịu trách nhiệm NHẬN NỘI DUNG VÀ THIẾT LẬP QUẢNG CÁO (task_type: create_facebook_ad, depends_on: [task soạn thảo])
4. Mỗi task phải có input rõ ràng và expected_output
5. Số lượng task: tối thiểu 2, tối đa 8 task cho mỗi kế hoạch

Trả về JSON THUẦN TÚY (không có markdown, không có backtick), theo schema sau:
{
  "plan_title": "tên ngắn của kế hoạch",
  "reasoning": "lý do bạn chọn các agent và task này",
  "tasks": [
    {
      "task_id": "t1",
      "agent_id": "eos_content_worker",
      "agent_name": "Bella EOS Content Worker",
      "task_type": "write_facebook_post",
      "task_description": "mô tả công việc soạn thảo bài viết",
      "input": {
        "objective": "...",
        "tone": "...",
        "target_audience": "...",
        "platform": "facebook"
      },
      "expected_output": "mô tả output mong đợi",
      "depends_on": []
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
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: ORCHESTRATOR_SYSTEM_PROMPT + '\n\n' + userMessage }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2000,
              responseMimeType: 'application/json'
            }
          })
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (res.ok && text) {
          const raw = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const plan = JSON.parse(raw);
          return NextResponse.json({ success: true, plan, provider: 'gemini', model: 'gemini-2.0-flash' });
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
      warning: 'Chưa cấu hình AI API Key. Kế hoạch được tạo bởi Rule-Based Planner. Cấu hình OpenAI/Claude/Gemini để Orchestrator AI thật sự tự phân tích.'
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── Rule-Based Fallback Planner ─────────────────────────────────────────────
function buildFallbackPlan(objective: string, context?: any) {
  const tone = context?.brandDna?.voiceTone || 'Professional & Premium';
  const segment = context?.brandDna?.targetSegment || 'Khách hàng tiềm năng';

  const lowerObj = objective.toLowerCase();
  const tasks = [];

  // Task 1: Bella EOS Content Worker drafts the post
  tasks.push({
    task_id: 't1',
    agent_id: 'eos_content_worker',
    agent_name: 'Bella EOS Content Worker',
    task_type: 'write_facebook_post',
    task_description: `Soạn thảo bài đăng Facebook truyền thông cho chiến dịch: "${objective}"`,
    input: { objective, tone, target_audience: segment, platform: 'facebook' },
    expected_output: 'Bài đăng Facebook hoàn chỉnh từ Bella EOS Worker, có hook, offer và hashtag',
    depends_on: []
  });

  // Task 2: Hermes Social Publisher receives the post from Bella EOS Worker and publishes it to Facebook
  tasks.push({
    task_id: 't2',
    agent_id: 'hermes_social',
    agent_name: 'Hermes Social Publisher',
    task_type: 'publish_facebook',
    task_description: 'Nhận bài viết từ Bella EOS Worker và thực thi đăng lên Fanpage Facebook',
    input: { content_from: 't1', platform: 'facebook' },
    expected_output: 'Hermes thực thi đăng bài thành công lên Fanpage Facebook, trả về Post ID',
    depends_on: ['t1']
  });

  // Task 3: Ares Ads Agent receives the post and sets up ad campaign
  if (lowerObj.includes('quảng cáo') || lowerObj.includes('ads') || lowerObj.includes('ngân sách') || lowerObj.includes('demo') || lowerObj.includes('spa')) {
    tasks.push({
      task_id: 't3',
      agent_id: 'ares_ads',
      agent_name: 'Ares Ads Agent',
      task_type: 'create_facebook_ad',
      task_description: 'Nhận nội dung từ Bella EOS Worker và thiết lập chiến dịch quảng cáo Facebook Ads',
      input: { objective, budget_hint: objective, content_from: 't1' },
      expected_output: 'Cấu hình chiến dịch quảng cáo Facebook Ads hoàn chỉnh',
      depends_on: ['t1']
    });
  }

  // Task 4: Athena Analytics Agent forecasts KPI/ROI
  if (lowerObj.includes('phân tích') || lowerObj.includes('kpi') || lowerObj.includes('báo cáo') || lowerObj.includes('đo lường') || lowerObj.includes('30 ngày')) {
    tasks.push({
      task_id: `t${tasks.length + 1}`,
      agent_id: 'athena_analytics',
      agent_name: 'Athena Analytics Agent',
      task_type: 'generate_report',
      task_description: 'Phân tích và dự báo hiệu suất KPI cho chiến dịch',
      input: { objective, metrics: ['reach', 'engagement', 'conversion', 'roi'] },
      expected_output: 'Báo cáo dự báo KPI và ROI cho chiến dịch',
      depends_on: []
    });
  }

  return {
    plan_title: `Kế hoạch: ${objective.substring(0, 60)}...`,
    reasoning: 'Bella EOS Content Worker soạn thảo bài viết ➔ Hermes Social Agent nhận bài và thực thi đăng ➔ Ares Ads thiết lập chiến dịch ➔ Athena Analytics dự báo KPI.',
    tasks
  };
}
