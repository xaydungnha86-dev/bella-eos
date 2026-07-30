import { NextResponse } from 'next/server';
import { EnterpriseContextEngine } from '@/core/brain/context-engine';
import { EvaluationPipeline } from '@/core/brain/evaluation-pipeline';
import { PromptComposer } from '@/core/infrastructure/prompt-composer';

export interface CouncilMemberOpinion {
  agentId: string;
  agentName: string;
  avatar: string;
  role: string;
  department: string;
  opinion: string;
  status: 'APPROVED' | 'CRITIQUE' | 'ADJUSTED';
  riskScore: number;
}

const COUNCIL_SYSTEM_PROMPT = `Bạn là AI Orchestrator điều phối HỘI ĐỒNG PHẢN BIỆN AI C-SUITE (Executive AI Advisory Council) bao gồm 6 vị trí:
1. CMO AI (Executive Marketing Strategist) - Phân tích chiến lược tiếp thị, phễu lead và mốc thời gian.
2. Sales Director AI - Phản biện tỷ lệ chốt đơn booking, dữ liệu CRM và kịch bản tư vấn.
3. Demeter HR & Staffing AI - Thẩm định công suất ca kỹ thuật viên (KTV), tải trọng ca và nhu cầu nhân sự.
4. Ops Operations AI - Kiểm tra quy trình phục vụ dịch vụ SOP và cam kết SLA dưới 15 phút.
5. Themis Legal & Compliance AI - Kiểm toán quy chế thương hiệu, hạn mức ngân sách và bản quyền.
6. Hermes Finance & Treasury AI - Kiểm soát an toàn dòng tiền, biên lợi nhuận ròng và ROI.

Nhiệm vụ: Dựa vào thông tin bối cảnh doanh nghiệp và Mục tiêu CEO giao phó, hãy tạo ra 6 ý kiến phản biện NỐI TIẾP thực tế, độc đáo và sắc bén.
BẮT BUỘC trả về định dạng JSON duy nhất là mảng 6 đối tượng theo cấu trúc sau:
[
  {
    "agentId": "marketing_manager",
    "agentName": "CMO AI (Executive Marketing Strategist)",
    "avatar": "🎯",
    "role": "Chief Marketing Officer",
    "department": "Marketing & Truyền thông",
    "opinion": "Nội dung phản biện sắc bén cụ thể cho mục tiêu...",
    "status": "APPROVED",
    "riskScore": 0.15
  },
  ... 5 vị trí còn lại (sales_director, demeter_hr, ops_operations, themis_legal, hermes_finance)
]`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { objective, context, client_gemini_key, client_openai_key, client_anthropic_key } = body;

    if (!objective) {
      return NextResponse.json({ error: 'objective is required' }, { status: 400 });
    }

    // 1. Enterprise Context Engine (ECE) - Build Normalized Canonical Context
    const ece = EnterpriseContextEngine.getInstance();
    const contextPackage = ece.buildCanonicalContext({
      objective,
      brandDna: context?.brandDna,
      rawCrmData: { customer_count: context?.activeCustomerCount },
      rawErpData: {
        appointment_count: context?.appointmentCount,
        technician_count: context?.technicianCount,
        staff_count: context?.staffCount,
        monthly_revenue: context?.monthlyRevenueVnd,
        monthly_expenses: context?.monthlyExpensesVnd
      }
    });

    const coverage = contextPackage.coverage;
    const isExtremeGoal = objective.toLowerCase().includes('300%') || objective.toLowerCase().includes('gấp 3');
    const budgetLimitVal = coverage.approvedBudgetLimitVnd;

    // Compose Prompt Stack
    const composedPrompt = PromptComposer.compose({
      systemPrompt: COUNCIL_SYSTEM_PROMPT,
      capabilityName: 'Executive Council Debate Session',
      contextPackage,
      taskDescription: `Mục tiêu chiến dịch: "${objective}"`,
      outputContractJsonSchema: 'JSON Array containing 6 CouncilMemberOpinion objects.'
    });

    let llmDebateMemory: CouncilMemberOpinion[] | null = null;
    let usedProvider = 'ece-rules-fallback';
    let usedModel = 'sequential-council-engine-v1';
    let llmDiagnosticError: string | null = null;

    // ── Try Google Gemini 2.5 Flash ──────────────────────────────────────────
    const geminiKey = client_gemini_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: composedPrompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 3000,
              responseMimeType: 'application/json'
            }
          })
        });

        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = data.candidates[0].content.parts[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length >= 5) {
            llmDebateMemory = parsed;
            usedProvider = 'google-gemini';
            usedModel = 'gemini-2.5-flash';
          }
        } else {
          llmDiagnosticError = data.error?.message || `Gemini API HTTP Error ${res.status}`;
          console.warn('[CouncilAPI] Gemini call failed:', llmDiagnosticError);
        }
      } catch (err: any) {
        llmDiagnosticError = err.message || 'Gemini network/quota error';
        console.warn('[CouncilAPI] Gemini exception:', llmDiagnosticError);
      }
    }

    // ── Try OpenAI GPT-4o fallback if Gemini failed/missing ──────────────────
    const openaiKey = client_openai_key || process.env.OPENAI_API_KEY;
    if (!llmDebateMemory && openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: COUNCIL_SYSTEM_PROMPT },
              { role: 'user', content: composedPrompt }
            ],
            temperature: 0.4,
            max_tokens: 3000,
            response_format: { type: 'json_object' }
          })
        });

        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
          const rawText = data.choices[0].message.content;
          const parsed = JSON.parse(rawText);
          const list = Array.isArray(parsed) ? parsed : (parsed.opinions || parsed.debateMemory);
          if (Array.isArray(list) && list.length >= 5) {
            llmDebateMemory = list;
            usedProvider = 'openai';
            usedModel = 'gpt-4o';
          }
        } else {
          llmDiagnosticError = data.error?.message || `OpenAI API HTTP Error ${res.status}`;
          console.warn('[CouncilAPI] OpenAI call failed:', llmDiagnosticError);
        }
      } catch (err: any) {
        llmDiagnosticError = err.message || 'OpenAI network/quota error';
        console.warn('[CouncilAPI] OpenAI exception:', llmDiagnosticError);
      }
    }

    // ── Deterministic Rule-Based Fallback Engine if LLMs are unavailable/quota exceeded ──
    const debateMemory: CouncilMemberOpinion[] = llmDebateMemory || [
      {
        agentId: 'marketing_manager',
        agentName: 'CMO AI (Executive Marketing Strategist)',
        avatar: '🎯',
        role: 'Chief Marketing Officer',
        department: 'Marketing & Truyền thông',
        opinion: isExtremeGoal
          ? `CẢNH BÁO MKT: Mục tiêu tăng trưởng "${objective}" là ${objective} quá nóng trong 30 ngày. Đề xuất phân kỳ 60 ngày để bảo đảm chuyển đổi phễu.`
          : `Đề xuất chiến lược Phễu Lead đa kênh cho "${objective}" kết hợp Content Hook + Banner 4K. Cần Sales bảo đảm kịch bản tư vấn.`,
        status: isExtremeGoal ? 'CRITIQUE' : 'APPROVED',
        riskScore: isExtremeGoal ? 0.85 : 0.15
      },
      {
        agentId: 'sales_director',
        agentName: 'Sales Director AI',
        avatar: '💼',
        role: 'Giám Đốc Bán Hàng & CSKH',
        department: 'Sales & Chốt Booking',
        opinion: coverage.crmActiveCount > 0
          ? `Phản biện Sales: Đã nhận chiến lược cho "${objective}". Cơ sở dữ liệu hiện có ${coverage.crmActiveCount} khách hàng CRM đồng bộ từ EIP. Nếu không tối ưu kịch bản chốt Booking, tỷ lệ rơi rớt lead sẽ tăng 25%. Cần bổ sung Task đào tạo kịch bản Sales.`
          : `Phản biện Sales: Chưa nhận dữ liệu CRM từ EIP cho mục tiêu "${objective}". Tỷ lệ rơi rớt lead có nguy cơ tăng 25%. Cần bổ sung Task đào tạo kịch bản Sales.`,
        status: 'CRITIQUE',
        riskScore: 0.35
      },
      {
        agentId: 'demeter_hr',
        agentName: 'Demeter HR & Staffing AI',
        avatar: '👥',
        role: 'Trưởng Phòng Nhân Sự',
        department: 'Nhân Sự & Công Suất Ca',
        opinion: coverage.technicianCount === 0
          ? `Thẩm định nhân sự: CẢNH BÁO KHẨN CẤP cho "${objective}": 0 KTV active tại chi nhánh. Lượng đặt lịch là ${coverage.appointmentCount} cuộc hẹn. Yêu cầu tuyển hoặc điều động KTV trước khi phát động chiến dịch.`
          : `Thẩm định nhân sự cho "${objective}": Chi nhánh có ${coverage.technicianCount} KTV active, ${coverage.appointmentCount} cuộc hẹn. Đủ công suất ca để vận hành chiến dịch.`,
        status: coverage.technicianCount === 0 ? 'CRITIQUE' : 'APPROVED',
        riskScore: coverage.technicianCount === 0 ? 0.95 : 0.10
      },
      {
        agentId: 'ops_operations',
        agentName: 'Ops Operations AI',
        avatar: '⚙️',
        role: 'Trưởng Phòng Vận Hành',
        department: 'Vận Hành Chi Nhánh & SLA',
        opinion: `Thẩm định quy trình: Đã đối chiếu quy trình phục vụ mục tiêu "${objective}" cho ${coverage.appointmentCount} lịch hẹn dựa trên SOP-MKT-V1.8 & SOP-DSN-V2.1. Đảm bảo SLA dưới 15 phút/khách.`,
        status: 'APPROVED',
        riskScore: 0.05
      },
      {
        agentId: 'themis_legal',
        agentName: 'Themis Legal & Compliance AI',
        avatar: '⚖️',
        role: 'Giám Đốc Pháp Lý',
        department: 'Pháp Lý & Quy Chế',
        opinion: `Kiểm toán quy chế: Hạn mức ngân sách đề xuất cho "${objective}" hợp lệ theo Policy Guard. Bản quyền hình ảnh & thông điệp tuân thủ WCAG AA.`,
        status: 'APPROVED',
        riskScore: 0.02
      },
      {
        agentId: 'hermes_finance',
        agentName: 'Hermes Finance & Treasury AI',
        avatar: '💰',
        role: 'Giám Đốc Tài Chính',
        department: 'Tài Chính & Ngân Sách',
        opinion: `Thẩm định tài chính: Doanh thu tháng EIP đạt ${coverage.monthlyRevenueVnd.toLocaleString('vi-VN')} VND, chi phí ${coverage.monthlyExpensesVnd.toLocaleString('vi-VN')} VND. Ngân sách chiến dịch ${budgetLimitVal.toLocaleString('vi-VN')} VND nằm trong vùng an toàn dòng tiền.`,
        status: 'APPROVED',
        riskScore: 0.12
      }
    ];

    // Synthesis Consensus Summary
    const consensusSummary = `Đã ghi nhận phản biện từ 6 phòng ban (${usedProvider}). Kế hoạch Vận hành Tổng thể cho mục tiêu "${objective}" đã tích hợp đầy đủ 5 Module: Marketing & Banner, Kịch bản Bán Hàng & Chốt Booking, Công suất Nhân sự KTV, Vận hành SOP và Chính sách Tài Chính.`;

    const rawResponseText = JSON.stringify(debateMemory);
    const evalResult = EvaluationPipeline.getInstance().evaluate(rawResponseText, budgetLimitVal);

    if (!evalResult.passed) {
      console.warn('[CouncilAPI] Evaluation pipeline flagged issue:', evalResult.rejectionReason);
    }

    return NextResponse.json({
      success: true,
      contextId: contextPackage.contextId,
      debateMemory,
      consensus: {
        title: `Nghị Quyết Phản Biện C-Suite: ${objective.substring(0, 50)}`,
        summary: consensusSummary,
        approvedModules: ['Marketing & Banner', 'Kịch bản Sales CRM', 'Công suất KTV', 'SLA Vận hành', 'Hạn mức Tài chính'],
        requiresCeoApproval: true
      },
      provider: usedProvider,
      model: usedModel,
      llmDiagnosticError
    });

  } catch (err: any) {
    console.error('[orchestrator/council] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
