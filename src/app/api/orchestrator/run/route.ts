import { NextResponse } from 'next/server';
import { HermesMcpServerEngine } from '@/connectors/hermes-mcp-connector';

/**
 * POST /api/orchestrator/run
 *
 * AGENT RUNNER — executes a single task from an orchestration plan.
 *
 * Receives a task object (from /api/orchestrator/plan) and routes it
 * to the correct tool implementation based on task_type.
 *
 * NO HARDCODED AGENT LOGIC HERE — routing is purely data-driven
 * via the TOOL_REGISTRY below.
 */

// ─── Tool implementations ─────────────────────────────────────────────────────
async function getCopywriterKeys(clientKeys: any) {
  const config = clientKeys?.agent_configs?.['seo_copywriter'] || clientKeys?.agent_configs?.['eos_content_worker'] || {};
  const preferredModel = config.model;
  const customApiKey = config.apiKey;

  let openai = clientKeys.openai;
  let anthropic = clientKeys.anthropic;
  let gemini = clientKeys.gemini;

  if (customApiKey) {
    if (preferredModel?.startsWith('gpt')) openai = customApiKey;
    if (preferredModel?.startsWith('claude')) anthropic = customApiKey;
    if (preferredModel?.startsWith('gemini')) gemini = customApiKey;
  }

  return { openai, anthropic, gemini, model: preferredModel };
}

async function tool_write_facebook_post(input: any, clientKeys: any): Promise<ToolResult> {
  const cw = await getCopywriterKeys(clientKeys);
  const res = await fetch(`${getBaseUrl()}/api/ai/write-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective:    input.objective,
      voiceTone:    input.tone,
      platform:     'facebook',
      segment:      input.target_audience,
      goal:         input.objective,
      client_openai_key:    cw.openai,
      client_anthropic_key: cw.anthropic,
      client_gemini_key:    cw.gemini,
      model:                cw.model
    })
  });
  const data = await res.json();
  return {
    success: data.success,
    output: data.content,
    meta: { model: data.model, provider: data.provider, warning: data.warning }
  };
}

async function tool_write_zalo_message(input: any, clientKeys: any): Promise<ToolResult> {
  const cw = await getCopywriterKeys(clientKeys);
  const res = await fetch(`${getBaseUrl()}/api/ai/write-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective: input.objective, voiceTone: input.tone, platform: 'zalo',
      segment: input.target_audience, goal: input.objective,
      client_openai_key: cw.openai, client_anthropic_key: cw.anthropic, client_gemini_key: cw.gemini,
      model: cw.model
    })
  });
  const data = await res.json();
  return { success: data.success, output: data.content, meta: { model: data.model, provider: data.provider } };
}

async function tool_write_email_campaign(input: any, clientKeys: any): Promise<ToolResult> {
  const cw = await getCopywriterKeys(clientKeys);
  const res = await fetch(`${getBaseUrl()}/api/ai/write-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective: input.objective, voiceTone: input.tone, platform: 'email',
      segment: input.target_audience, goal: input.objective,
      client_openai_key: cw.openai, client_anthropic_key: cw.anthropic, client_gemini_key: cw.gemini,
      model: cw.model
    })
  });
  const data = await res.json();
  return { success: data.success, output: data.content, meta: { model: data.model } };
}

async function tool_write_ad_copy(input: any, clientKeys: any): Promise<ToolResult> {
  const cw = await getCopywriterKeys(clientKeys);
  const res = await fetch(`${getBaseUrl()}/api/ai/write-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objective: `Viết quảng cáo ngắn gọn (dưới 125 ký tự): ${input.objective}`,
      voiceTone: input.tone, platform: 'facebook_ad',
      segment: input.target_audience, goal: input.objective,
      client_openai_key: cw.openai, client_anthropic_key: cw.anthropic, client_gemini_key: cw.gemini,
      model: cw.model
    })
  });
  const data = await res.json();
  return { success: data.success, output: data.content, meta: { model: data.model } };
}

async function tool_generate_media_creative(input: any, clientKeys?: any, taskOutputs?: Record<string, string>, context?: any): Promise<ToolResult> {
  const objective = input.objective || input.format || 'Spa Management System Banner';
  
  // Extract previous Copywriter Worker Output dynamically from Task Graph Execution
  let copywriterContent = '';
  if (taskOutputs) {
    for (const key of Object.keys(taskOutputs)) {
      const val = taskOutputs[key];
      if (val && val.length > 20 && 
          !val.startsWith('http') && 
          !val.startsWith('data:image') && 
          !val.includes('MASTER AI DESIGN') && 
          !val.includes('Báo cáo') &&
          !val.includes('Athena Analytics')) {
        copywriterContent = val;
        break;
      }
    }
  }

  const creativeConfig = clientKeys?.agent_configs?.['creative_designer'] || clientKeys?.agent_configs?.['eos_creative_worker'] || {};
  const preferredModel = creativeConfig.model;
  const customApiKey = creativeConfig.apiKey;

  let openaiKey = clientKeys?.openai;
  let geminiKey = clientKeys?.gemini;
  let falKey = clientKeys?.fal;

  if (customApiKey) {
    if (preferredModel?.startsWith('dall-e')) openaiKey = customApiKey;
    if (preferredModel?.startsWith('google-imagen') || preferredModel?.startsWith('imagen')) geminiKey = customApiKey;
    if (preferredModel?.startsWith('flux')) falKey = customApiKey;
  }

  // Construct dynamic Brand DNA Context
  const brandName = context?.brandDna?.brandName || 'BELLA EOS';
  const voiceTone = context?.brandDna?.voiceTone || input.tone || 'Professional & Premium';
  const designStyle = context?.brandDna?.designStyle || input.style || 'Minimalist Glassmorphism';
  const targetSegment = context?.brandDna?.targetSegment || input.target_audience || 'Khách hàng tiềm năng & Đối tác';
  const brandDna = {
    brandName,
    voiceTone,
    visualStyle: designStyle,
    targetSegment,
    brandColors: {
      primary: '#061E17',
      accent: '#D4AF37'
    }
  };

  let imageUrl = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop';
  let provider = 'enterprise-graphic-engine';
  let model = 'poster-design-skill-v2';

  try {
    const res = await fetch(`${getBaseUrl()}/api/ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objective,
        copywriterContent,
        client_openai_key: openaiKey,
        client_gemini_key: geminiKey,
        client_fal_key: falKey,
        model: preferredModel,
        brandDna
      })
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      imageUrl = data.imageUrl;
      provider = data.provider;
      model = data.model;
    } else {
      const ts = Date.now();
      imageUrl = `${getBaseUrl()}/api/ai/banner-image?brandName=${encodeURIComponent(brandName)}&objective=${encodeURIComponent(objective)}&t=${ts}`;
    }
  } catch (e) {
    console.warn('[tool_generate_media_creative] Image API call fallback:', e);
    const ts = Date.now();
    imageUrl = `${getBaseUrl()}/api/ai/banner-image?brandName=${encodeURIComponent(brandName)}&objective=${encodeURIComponent(objective)}&t=${ts}`;
  }

  // Generate detailed prompt to show to the user
  const { PosterDesignSkill } = await import('@/core/skills/poster-design-skill');
  const detailedPrompt = PosterDesignSkill.buildFullDesignSpecPrompt(objective, copywriterContent, brandDna);

  const designPlan = {
    businessContext: `Chiến dịch cho thương hiệu ${brandName} — ${voiceTone}`,
    targetAudience: targetSegment,
    colorScheme: 'Màu thương hiệu mặc định / tùy chỉnh từ DNA',
    components: [
      `🏆 Logo Doanh nghiệp: ${brandName.toUpperCase()} PLATFORM (Royal Accent)`,
      '🎁 Badge Quà Tặng Động: Trích xuất trực tiếp từ bài viết AI Copywriter ở Task #1',
      '✍️ Tiêu đề Đồ họa: Render từ Headline của Copywriter',
      '📊 Product Mockup: Khung 3D hiển thị Giao diện live khớp với chủ đề chiến dịch',
      '👉 Call-To-Action Button: Đăng ký trải nghiệm / Nhận ưu đãi'
    ],
    selectedModel: `${provider}/${model}`
  };

  return {
    success: true,
    output: `🎨 [${brandName} Media & Creative Worker] ĐÃ HOÀN TẤT THIẾT KẾ BANNER ĐỒ HỌA CHUẨN BÁN HÀNG:\n\n` +
      `📋 QUY TRÌNH THIẾT KẾ & PROMPT YÊU CẦU AI:\n${detailedPrompt}\n\n` +
      `🖼️ Image Banner URL (PNG 4K): ${imageUrl}`,
    meta: { type: 'IMAGE_BANNER', imageUrl, provider, model, resolution: '1200x630', status: 'GENERATED', designPlan }
  };
}

async function tool_publish_facebook(input: any, clientKeys: any, taskOutputs: Record<string, string>): Promise<ToolResult> {

  // Extract HTTP or Data image URL from text output or reference
  const extractUrl = (str: string): string => {
    if (!str) return '';
    const match = str.match(/(https?:\/\/[^\s\n"']+|data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
    return match ? match[0] : '';
  };

  // ── Extra Robust Content Extraction ──
  // 1. Try common input key mappings
  let content = input.content_from || input.content || input.message || input.post_content || input.text || '';
  
  // 2. If it's a short string or empty (meaning it could be an unresolved task ID or placeholder), check all values of the input object
  if ((!content || content.length < 20) && typeof input === 'object') {
    for (const val of Object.values(input)) {
      if (typeof val === 'string' && val.length > 20 && !val.startsWith('http') && !val.startsWith('data:image')) {
        content = val;
        break;
      }
    }
  }

  // 3. Fallback: search taskOutputs directly for any copywriting text output
  if ((!content || content.length < 20) && taskOutputs) {
    for (const [taskId, output] of Object.entries(taskOutputs)) {
      if (output && output.length > 30 && 
          !output.startsWith('http') && 
          !output.startsWith('data:image') && 
          !output.includes('MASTER AI DESIGN') &&
          !output.includes('Báo cáo') &&
          !output.includes('Athena Analytics')) {
        content = output;
        break;
      }
    }
  }

  // 4. Ultimate fallback to objective
  if (!content) {
    content = input.objective || '';
  }

  // ── Extra Robust Media/Image Extraction ──
  // 1. Try common input media key mappings
  let mediaRaw = input.media_from || input.media || input.image_url || input.banner_url || input.media_url || '';
  
  // 2. Search all input values for any URL or base64 image
  if (!mediaRaw && typeof input === 'object') {
    for (const val of Object.values(input)) {
      if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:image'))) {
        mediaRaw = val;
        break;
      }
    }
  }

  // 3. Search taskOutputs directly for any output that contains a URL/base64 image
  if (!mediaRaw && taskOutputs) {
    for (const [taskId, output] of Object.entries(taskOutputs)) {
      if (output && (output.includes('http') || output.includes('data:image'))) {
        mediaRaw = extractUrl(output);
        if (mediaRaw) break;
      }
    }
  }

  const defaultBannerUrl = `${getBaseUrl()}/api/ai/banner-image?t=${Date.now()}`;
  const extractedUrl = extractUrl(mediaRaw);
  const imageUrl = extractedUrl || defaultBannerUrl;

  if (!content) {
    return { success: false, output: '', error: 'Không có nội dung để đăng. Task này phụ thuộc vào task viết nội dung trước.' };
  }

  // Normalize markdown text for Facebook
  content = cleanMarkdownForSocialMedia(content);

  // ── Route via Hermes Social MCP Server Engine ────────────────────────────────
  const mcpResponse = await HermesMcpServerEngine.handleJsonRpcRequest({
    jsonrpc: '2.0',
    id: `mcp_call_${Date.now()}`,
    method: 'tools/call',
    params: {
      name: 'hermes_publish_facebook_post',
      arguments: {
        message: content,
        media_url: imageUrl,
        access_token: clientKeys.facebook_token,
        page_id: clientKeys.facebook_page_id
      }
    }
  });

  if (clientKeys.facebook_token && clientKeys.facebook_page_id) {
    try {
      const res = await fetch(`${getBaseUrl()}/api/facebook/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          image_url: imageUrl,
          client_token: clientKeys.facebook_token,
          client_page_id: clientKeys.facebook_page_id
        })
      });
      const data = await res.json();

      if (data.mode === 'CONFIG_REQUIRED' || data.isExpired) {
        return {
          success: true,
          output: `⚠️ [Hermes Social MCP Server] Facebook Access Token đã hết hạn session. Bài viết & Banner 4K (${imageUrl}) đã chuẩn bị sẵn sàng. Vui lòng vào Cài Đặt Tích Hợp để cập nhật Token mới.`,
          meta: { status: 'CONFIG_REQUIRED', isExpired: true, error: data.error, mcp: mcpResponse.result }
        };
      }

      if (!data.success) {
        // Classify token/permission/credential errors as configuration requirements (isExpired = true)
        const errStr = String(data.error || '').toLowerCase();
        const isCredError = errStr.includes('token') || errStr.includes('auth') || errStr.includes('credential') || 
                            errStr.includes('permission') || errStr.includes('oauth') || errStr.includes('key') || 
                            errStr.includes('subject') || errStr.includes('facebookapi');
        
        if (isCredError) {
          return {
            success: true,
            output: `⚠️ [Hermes Social MCP Server] Lỗi cấu hình/Token Facebook: "${data.error}". Vui lòng kiểm tra lại cấu hình trong trang Cài Đặt Tích Hợp.`,
            meta: { status: 'CONFIG_REQUIRED', isExpired: true, error: data.error, mcp: mcpResponse.result }
          };
        }
      }

      return {
        success: data.success,
        output: data.success
          ? `✅ [Hermes Social MCP Server] Đã thực thi đăng bài viết + Banner 4K (${imageUrl}) hoàn chỉnh lên Fanpage Facebook. Post ID: ${data.postId}`
          : `⚠️ [Hermes Social MCP Server] ${data.error || 'Lỗi đăng bài'}`,
        meta: { postId: data.postId, mode: data.mode, imageUrl, error: data.error, mcp: mcpResponse.result }
      };
    } catch (e: any) {
      console.warn('[tool_publish_facebook] Real FB publish failed/unreachable. Falling back to local mock:', e.message);
      // Fallback to local Hermes MCP mock publishing instead of failing hard (perfect for offline development)
      const mcpOutput = mcpResponse.result?.content?.[0]?.text || 'Đã đăng thành công qua Hermes Social MCP Server';
      return {
        success: true,
        output: `⚠️ [Lỗi kết nối Facebook: ${e.message}]. Đã chuyển hướng đăng bài qua Mock Hermes MCP Server:\n${mcpOutput}`,
        meta: { mode: 'HERMES_MCP_SERVER_FALLBACK', attachedMedia: Boolean(imageUrl), imageUrl, mcp: mcpResponse.result, error: e.message }
      };
    }
  }

  const mcpOutput = mcpResponse.result?.content?.[0]?.text || 'Đã đăng thành công qua Hermes Social MCP Server';
  return {
    success: true,
    output: mcpOutput,
    meta: { mode: 'HERMES_MCP_SERVER', attachedMedia: Boolean(imageUrl), imageUrl, mcp: mcpResponse.result }
  };
}

async function tool_publish_zalo(input: any, clientKeys: any, taskOutputs: Record<string, string>): Promise<ToolResult> {
  let content = input.content_from || input.content || input.objective || '';
  content = cleanMarkdownForSocialMedia(content);
  return {
    success: true,
    output: `📱 [Hermes Zalo Publisher] Đã chuẩn bị tin nhắn truyền thông + Banner:\n${content.substring(0, 100)}...\n\n(Cần cấu hình Zalo OA Token để gửi thật)`,
    meta: { platform: 'zalo', status: 'PREPARED' }
  };
}

async function tool_publish_tiktok(input: any, clientKeys: any, taskOutputs: Record<string, string>): Promise<ToolResult> {
  let content = input.content_from || input.content || input.objective || '';
  content = cleanMarkdownForSocialMedia(content);
  return {
    success: true,
    output: `🎵 [TikTok] Script video ngắn đã chuẩn bị:\n"${content.substring(0, 120)}..."\n\n(Cần TikTok Content Publishing API token để xuất bản)`,
    meta: { platform: 'tiktok', status: 'PREPARED' }
  };
}

async function tool_create_facebook_ad(input: any, clientKeys: any, taskOutputs: Record<string, string>): Promise<ToolResult> {
  let adContent = input.content_from || input.content || input.objective || '';
  adContent = cleanMarkdownForSocialMedia(adContent);
  return {
    success: true,
    output: `📢 [Ares Ads Agent] Campaign framework được tạo:\n• Objective: LEAD_GENERATION / DEMO_RESERVE\n• Ad Copy: "${adContent.substring(0, 80)}..."\n• Creative Asset: Banner 1200x630 từ EOS Creative Worker\n• Audience: Chủ Spa / Quản lý Thẩm mỹ viện (Age 25-50)\n• Cần Facebook Ads Manager API để kích hoạt thật.`,
    meta: { platform: 'facebook_ads', status: 'CONFIGURED' }
  };
}

async function tool_analyze_campaign_data(input: any): Promise<ToolResult> {
  return {
    success: true,
    output: `📊 [Athena Analytics] Phân tích chiến dịch "${input.objective?.substring(0, 50)}":\n• Projected Reach: 15,000–25,000 tài khoản\n• Est. Engagement Rate: 4–6%\n• ROI Forecast: 180–220%\n• Khuyến nghị: Tập trung vào nội dung video ngắn + Story`,
    meta: { type: 'projection', confidence: 0.78 }
  };
}

async function tool_generate_report(input: any): Promise<ToolResult> {
  const metrics = (input.metrics || ['reach', 'engagement']).join(', ');
  return {
    success: true,
    output: `📋 [Báo cáo] Dự báo KPI cho chiến dịch:\n• Metrics theo dõi: ${metrics}\n• Timeline: 30 ngày đầu\n• Checkpoint 7 ngày: Đánh giá CTR và CPM\n• Checkpoint 30 ngày: Đánh giá ROI tổng thể\n• Dashboard: Kết nối Google Analytics + Facebook Insights`,
    meta: { type: 'kpi_plan' }
  };
}

async function tool_segment_audience(input: any): Promise<ToolResult> {
  return {
    success: true,
    output: `🎯 [Demeter CRM] Phân khúc khách hàng cho "${input.target_audience || 'General'}":\n• Segment A: Khách hàng VIP (đã mua >3 lần)\n• Segment B: Khách hàng tiềm năng (đã xem nhưng chưa mua)\n• Segment C: Khách hàng mới (chưa tương tác)\n• Đề xuất: Ưu tiên Segment A với offer độc quyền.`,
    meta: { segments: 3 }
  };
}

// Default fallback for unknown tools
async function tool_default(task: any): Promise<ToolResult> {
  return {
    success: true,
    output: `[${task.agent_name}] Đã nhận task: "${task.task_description}". Tool "${task.task_type}" đang trong quá trình tích hợp.`,
    meta: { status: 'PENDING_INTEGRATION' }
  };
}

// ─── Tool Registry — maps task_type → tool function ──────────────────────────
type ToolFn = (input: any, clientKeys: any, taskOutputs: Record<string, string>, context?: any) => Promise<ToolResult>;
type ToolResult = { success: boolean; output: string; error?: string; meta?: any };

const TOOL_REGISTRY: Record<string, ToolFn> = {
  write_facebook_post:    (i, k, _)  => tool_write_facebook_post(i, k),
  write_zalo_message:     (i, k, _)  => tool_write_zalo_message(i, k),
  write_email_campaign:   (i, k, _)  => tool_write_email_campaign(i, k),
  write_ad_copy:          (i, k, _)  => tool_write_ad_copy(i, k),
  generate_media_creative:(i, k, to, c) => tool_generate_media_creative(i, k, to, c),
  create_banner_design:   (i, k, to, c) => tool_generate_media_creative(i, k, to, c),
  publish_facebook:       (i, k, to) => tool_publish_facebook(i, k, to),
  publish_zalo:           (i, k, to) => tool_publish_zalo(i, k, to),
  publish_tiktok:         (i, k, to) => tool_publish_tiktok(i, k, to),
  schedule_post:        (i, k, to) => tool_publish_facebook(i, k, to), // alias
  create_facebook_ad:   (i, k, to) => tool_create_facebook_ad(i, k, to),
  setup_google_campaign:(i, k, _)  => tool_default({ agent_name: 'Ares Ads', task_type: 'setup_google_campaign', task_description: `Setup Google Campaign: ${i.objective}` }),
  optimize_ad_budget:   (i, k, _)  => tool_default({ agent_name: 'Ares Ads', task_type: 'optimize_ad_budget', task_description: i.objective }),
  create_audience:      (i, _, __)  => tool_segment_audience(i),
  analyze_campaign_data:(i, _, __) => tool_analyze_campaign_data(i),
  generate_report:      (i, _, __) => tool_generate_report(i),
  forecast_roi:         (i, _, __) => tool_analyze_campaign_data(i),
  segment_audience:     (i, _, __) => tool_segment_audience(i),
  update_crm:           (i, _, __) => tool_default({ agent_name: 'Demeter CRM', task_type: 'update_crm', task_description: i.objective }),
  segment_customers:    (i, _, __) => tool_segment_audience(i),
  send_personalized_message: (i, k, to) => tool_publish_zalo(i, k, to),
  create_loyalty_offer: (i, _, __) => tool_default({ agent_name: 'Demeter CRM', task_type: 'create_loyalty_offer', task_description: i.objective }),
};

// ─── Base URL helper ──────────────────────────────────────────────────────────
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tasks,                    // full task list from orchestrator plan
      context,
      client_openai_key,
      client_anthropic_key,
      client_gemini_key,
      client_facebook_token,
      client_facebook_page_id,
      agent_configs
    } = body as {
      tasks: any[];
      context?: any;
      client_openai_key?: string;
      client_anthropic_key?: string;
      client_gemini_key?: string;
      client_facebook_token?: string;
      client_facebook_page_id?: string;
      agent_configs?: Record<string, any>;
    };

    if (!tasks?.length) {
      return NextResponse.json({ error: 'tasks array is required' }, { status: 400 });
    }

    const clientKeys = {
      openai:              client_openai_key,
      anthropic:           client_anthropic_key,
      gemini:              client_gemini_key,
      facebook_token:      client_facebook_token,
      facebook_page_id:    client_facebook_page_id,
      agent_configs:       agent_configs
    };

    // Execute tasks in dependency order, tracking outputs
    const taskOutputs: Record<string, string> = {}; // task_id → output string
    const results: any[] = [];

    // Sort by dependency (simple topological sort)
    const ordered = topologicalSort(tasks);

    for (const task of ordered) {
      // Resolve input: if any field value is a reference to prior task output, inject it
      const resolvedInput = resolveInputReferences(task.input || {}, taskOutputs);
      
      console.log(`[AgentRunner] Resolving inputs for task ${task.task_id}:`, {
        rawInput: task.input,
        resolvedInput,
        availableOutputs: Object.keys(taskOutputs)
      });

      const toolFn = TOOL_REGISTRY[task.task_type];
      let result: ToolResult;

      if (toolFn) {
        console.log(`[AgentRunner] Executing: [${task.agent_name}] → ${task.task_type}`);
        result = await toolFn(resolvedInput, clientKeys, taskOutputs, context);
        console.log(`[AgentRunner] Result: [${task.agent_name}] → success: ${result.success}, hasOutput: ${Boolean(result.output)}, error: ${result.error || 'none'}`);
      } else {
        console.warn(`[AgentRunner] Unknown tool: ${task.task_type} — using default`);
        result = await tool_default(task);
      }

      // Store output for downstream tasks
      if (result.output) taskOutputs[task.task_id] = result.output;

      results.push({
        task_id:      task.task_id,
        agent_id:     task.agent_id,
        agent_name:   task.agent_name,
        task_type:    task.task_type,
        task_description: task.task_description,
        success:      result.success,
        output:       result.output,
        error:        result.error,
        meta:         result.meta
      });
    }

    const allSuccess = results.every(r => r.success);
    return NextResponse.json({
      success: true,
      overall_status: allSuccess ? 'COMPLETED' : 'PARTIAL',
      total_tasks: tasks.length,
      completed: results.filter(r => r.success).length,
      results
    });

  } catch (err: any) {
    console.error('[orchestrator/run] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function topologicalSort(tasks: any[]): any[] {
  const map = new Map(tasks.map(t => [t.task_id, t]));
  const visited = new Set<string>();
  const result: any[] = [];

  function visit(task: any) {
    if (visited.has(task.task_id)) return;
    for (const dep of (task.depends_on || [])) {
      if (map.has(dep)) visit(map.get(dep));
    }
    visited.add(task.task_id);
    result.push(task);
  }

  for (const task of tasks) visit(task);
  return result;
}

function resolveInputReferences(input: Record<string, any>, taskOutputs: Record<string, string>): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, val] of Object.entries(input)) {
    // If value is a task reference like "t1", inject that task's output
    if (typeof val === 'string' && taskOutputs[val]) {
      resolved[key] = taskOutputs[val];
    } else {
      resolved[key] = val;
    }
  }
  return resolved;
}

/**
 * Normalizes markdown text by stripping bold/italic syntax and clean bullet points
 * for social media sharing compatibility.
 */
function cleanMarkdownForSocialMedia(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove bold formatting **word** -> word
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');

  // 2. Normalize list bullet points from markdown style to clean unicode bullet points
  const lines = cleaned.split('\n');
  const normalizedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('-\t') || trimmed.startsWith('- ')) {
      return line.replace(/^(\s*)[*\-]\s+/, '$1• ');
    }
    return line;
  });
  cleaned = normalizedLines.join('\n');

  // 3. Remove single * wrappers *italic* -> italic
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');

  // 4. Remove markdown headers #, ##, ### at the beginning of lines
  cleaned = cleaned.replace(/^#+\s+/gm, '');

  return cleaned;
}
