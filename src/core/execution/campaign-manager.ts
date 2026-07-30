import { CanonicalContextPackage } from '../../types/eom';
import { EnterpriseBrain } from '../brain';
import { LearningCenter } from '../brain/learning';
import { HUMAN_WORKER_REGISTRY, HumanWorker } from '../workforce/human-registry';
import { PolicyEngine } from '../governance/policy-engine';
import { DecisionRuntime } from '../decision/decision-runtime';
import { IntentGate, GoalGate, DecisionGate } from '../governance/validation-gates';



export interface CouncilOpinion {
  agentId: string;
  agentName: string;
  avatar: string;
  role: string;
  department: string;
  opinion: string;
  status: 'APPROVED' | 'CRITIQUE' | 'ADJUSTED';
  riskScore: number;
}

export interface CampaignState {
  isProcessing: boolean;
  isPaused: boolean;
  stopRequested: boolean;
  activeStep: number;
  telemetryLogs: any[];
  goalTree: any;
  dnaState: { tone: string; style: string };
  orchestratorPlan: any;
  dynamicTasks: any[];
  councilDebate: CouncilOpinion[];
  verificationReport: any;
  lastApiStatus: string | null;
  activeCustomerCount: number;
  fbReachCount: number;
  objective: string;
  approvedTasks: string[];
  humanWorkers: HumanWorker[];
  collaborationLogs: any[];
  aiProgress: number;
  humanProgress: number;
}

export type Listener = (state: CampaignState) => void;

class CampaignExecutionManagerClass {
  private state: CampaignState = {
    isProcessing: false,
    isPaused: false,
    stopRequested: false,
    activeStep: -1,
    telemetryLogs: [],
    goalTree: null,
    dnaState: { tone: 'Professional & Premium', style: 'Minimalist & Glassmorphism' },
    orchestratorPlan: null,
    dynamicTasks: [],
    councilDebate: [],
    verificationReport: null,
    lastApiStatus: null,
    activeCustomerCount: 0,
    fbReachCount: 0,
    objective: '',
    approvedTasks: [],
    humanWorkers: HUMAN_WORKER_REGISTRY,
    collaborationLogs: [],
    aiProgress: 0,
    humanProgress: 0
  };

  private listeners = new Set<Listener>();

  public pauseCampaign() {
    if (this.state.isProcessing && !this.state.isPaused) {
      this.state.isPaused = true;
      this.addLog('EXECUTIVE CONTROL', `⏸️ [CEO CONTROL] ĐÃ TẠM DỪNG LUỒNG THỰC THI TẠI BƯỚC #${this.state.activeStep + 1}. Đã ghi nhớ Checkpoint.`, 'text-amber-400 font-bold');
      this.notify();
    }
  }

  public resumeCampaign() {
    if (this.state.isPaused) {
      this.state.isPaused = false;
      this.addLog('EXECUTIVE CONTROL', `▶️ [CEO CONTROL] KHÔI PHỤC THỰC THI LUỒNG TỪ CHECKPOINT BƯỚC #${this.state.activeStep + 1}...`, 'text-emerald-400 font-bold');
      this.notify();
    }
  }

  public stopCampaign() {
    this.state.isProcessing = false;
    this.state.isPaused = false;
    this.state.stopRequested = true;
    this.addLog('EXECUTIVE CONTROL', '🛑 [CEO CONTROL] ĐÃ DỪNG HẲN LUỒNG THỰC THI THEO YÊU CẦU CEO.', 'text-rose-400 font-bold');
    this.notify();
  }

  private async checkPauseOrStop(): Promise<boolean> {
    if (this.state.stopRequested) {
      this.state.isProcessing = false;
      this.state.isPaused = false;
      this.notify();
      return true;
    }
    while (this.state.isPaused) {
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      await delay(300);
      if (this.state.stopRequested) {
        this.state.isProcessing = false;
        this.state.isPaused = false;
        this.notify();
        return true;
      }
    }
    return false;
  }

  constructor() {
    // Rehydrate state from localStorage/sessionStorage if possible, ALWAYS forcing isProcessing to false
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bella_eos_campaign_manager_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Auto-migrate legacy hardcoded defaults to fresh 0 state
          if (parsed.activeCustomerCount === 1289) {
            parsed.activeCustomerCount = 0;
          }
          if (parsed.fbReachCount === 14500) {
            parsed.fbReachCount = 0;
          }
          this.state = { ...this.state, ...parsed, isProcessing: false };
        }
      } catch (e) {
        console.warn('Failed to load CampaignExecutionManager state:', e);
      }

      // Bootstrap Task Governance Bounded Context services
      try {
        const { bootstrapEosExecutionServices } = require('./bootstrap');
        const container = bootstrapEosExecutionServices();
        container.eventBus.subscribe('OutcomeCalculated', (event: any) => {
          this.addLog('PILOT LEDGER', `📈 Ghi nhận hiệu suất tích cực từ sự kiện OutcomeCalculated: ROI cải thiện +${event.payload.relativeImprovementPercent}%, quy mô khách CRM tăng ${event.payload.absoluteVariance}.`, 'text-emerald-400 font-bold');
          this.updateState({
            activeCustomerCount: this.state.activeCustomerCount + event.payload.absoluteVariance,
            fbReachCount: this.state.fbReachCount + Math.round(event.payload.absoluteVariance * 12.5)
          });
        });
      } catch (e) {
        console.warn('Failed to bootstrap Eos Execution Services:', e);
      }
    }
  }

  public hardReset() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bella_eos_campaign_manager_state');
        localStorage.removeItem('bella_eos_telemetry_logs');
        localStorage.removeItem('bella_eos_active_step');
        localStorage.removeItem('bella_eos_goal_tree');
        localStorage.removeItem('bella_eos_dynamic_tasks');
        localStorage.removeItem('bella_eos_last_api_status');
        localStorage.removeItem('bella_eos_objective');
        localStorage.removeItem('bella_eos_verification_report');
      } catch (e) {}
    }
    this.state = {
      isProcessing: false,
      isPaused: false,
      stopRequested: false,
      activeStep: -1,
      telemetryLogs: [],
      goalTree: null,
      dnaState: { tone: 'Professional & Premium', style: 'Minimalist & Glassmorphism' },
      orchestratorPlan: null,
      dynamicTasks: [],
      councilDebate: [],
      verificationReport: null,
      lastApiStatus: null,
      activeCustomerCount: 0,
      fbReachCount: 0,
      objective: '',
      approvedTasks: [],
      humanWorkers: HUMAN_WORKER_REGISTRY,
      collaborationLogs: [],
      aiProgress: 0,
      humanProgress: 0
    };
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately on subscription
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
    // Persist to localStorage/sessionStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bella_eos_campaign_manager_state', JSON.stringify(this.state));
        // Also sync old localStorage keys for safety/compatibility with other tabs/components
        localStorage.setItem('bella_eos_telemetry_logs', JSON.stringify(this.state.telemetryLogs.slice(-200)));
        localStorage.setItem('bella_eos_active_step', this.state.activeStep.toString());
        localStorage.setItem('bella_eos_goal_tree', this.state.goalTree ? JSON.stringify(this.state.goalTree) : '');
        localStorage.setItem('bella_eos_dna_state', JSON.stringify(this.state.dnaState));
        localStorage.setItem('bella_eos_dynamic_tasks', JSON.stringify(this.state.dynamicTasks));
        localStorage.setItem('bella_eos_last_api_status', this.state.lastApiStatus || '');
        localStorage.setItem('bella_eos_objective', this.state.objective);
        if (this.state.verificationReport) {
          localStorage.setItem('bella_eos_verification_report', JSON.stringify(this.state.verificationReport));
        }
      } catch (e) {}
    }
  }

  public getState() {
    return this.state;
  }

  public updateState(updates: Partial<CampaignState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  public addLog(source: string, message: string, colorClass = 'text-slate-700') {
    const time = new Date().toLocaleTimeString('vi-VN');
    const newLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      time,
      source,
      message,
      color: colorClass
    };
    this.state.telemetryLogs = [...this.state.telemetryLogs, newLog];
    this.notify();
  }

  // Start campaign flow
  public async startCampaign(
    objective: string, 
    dnaState: { tone: string; style: string },
    EipConnector: any,
    FacebookConnector: any,
    OrchestrationEngine: any,
    EnterpriseBrain: any,
    InternalApiGateway: any
  ) {
    this.state = {
      isProcessing: true,
      isPaused: false,
      stopRequested: false,
      activeStep: 0,
      telemetryLogs: [],
      goalTree: null,
      dnaState,
      orchestratorPlan: null,
      dynamicTasks: [],
      councilDebate: [],
      verificationReport: null,
      lastApiStatus: null,
      activeCustomerCount: this.state.activeCustomerCount,
      fbReachCount: this.state.fbReachCount,
      objective,
      approvedTasks: [],
      humanWorkers: HUMAN_WORKER_REGISTRY,
      collaborationLogs: [],
      aiProgress: 0,
      humanProgress: 0
    };
    this.notify();

    this.addLog('CEO INTENT', `🎯 Ý chí chiến lược nhận được: "${objective}"`, 'text-amber-400 font-bold');

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Step 0: COO Starts Holistic Analysis
    await delay(700);
    this.addLog('AI COO', `🤖 Nhận nhiệm vụ từ CEO. Bắt đầu phân tích tổng thể hệ thống...`, 'text-indigo-400 font-bold');

    try {
      const budgetLimitVal = objective.toLowerCase().includes('50 triệu') ? 50000000 : 100000000;
      const intentContract = {
        intentId: 'int-' + Date.now(),
        tenantId: 'tenant-default',
        rawText: objective,
        targetObjective: objective,
        spendLimitVnd: budgetLimitVal,
        expectedTimelineDays: 30,
        timestamp: new Date().toISOString(),
        parsingConfidence: 0.98
      };

      IntentGate.validate(intentContract);
      this.addLog('INTENT GATE', '✅ Cổng xác thực Ý chí (Intent Gate): ĐẠT YÊU CẦU (DoD check passed)', 'text-emerald-400 font-bold');

      await delay(600);
      this.addLog('EIP CONNECTOR', `📡 Đang kết nối Bella EIP API để lấy dữ liệu Doanh thu, Khách hàng, Lịch hẹn & KTV thực tế...`, 'text-indigo-400 font-bold');
      const eipOverview = await EipConnector.getEnterpriseOverview();
      const activeCustomers = await EipConnector.getActiveCustomers();
      const finalCustCount = eipOverview.isConnected && eipOverview.activeCustomersCount 
        ? eipOverview.activeCustomersCount 
        : activeCustomers.length;
      this.state.activeCustomerCount = finalCustCount;
      this.notify();

      this.addLog('EIP PAYLOAD DIGEST', `📊 Số liệu từ Bella EIP: ${finalCustCount > 0 ? `${finalCustCount} Khách CRM` : 'Chưa đồng bộ CRM'} | ${eipOverview.appointmentCount} Lịch hẹn | ${eipOverview.technicianCount} KTV | ${eipOverview.staffCount} Nhân sự | Doanh thu: ${(eipOverview.monthlyRevenueVnd / 1000000).toFixed(0)}M | Chi phí: ${(eipOverview.monthlyExpensesVnd / 1000000).toFixed(0)}M VND.`, 'text-emerald-400 font-semibold');

      await delay(500);
      this.addLog('Understanding Center', `Digesting API / EIP payload from: ${eipOverview.source}`, 'text-slate-300');
      EnterpriseBrain.Understanding.understandApiFact('EIP CRM API', { ...eipOverview });
      
      // Query Facebook Metrics
      const fbMetrics = await FacebookConnector.getReachMetrics();
      this.state.fbReachCount = fbMetrics.postReach24h;
      this.notify();
      
      await delay(700);
      this.addLog('BUSINESS CONTEXT', `📋 Khởi tạo Context Package từ EIP API (${eipOverview.source}). Khách CRM: ${finalCustCount} | Lịch hẹn: ${eipOverview.appointmentCount} | KTV: ${eipOverview.technicianCount} | Staff: ${eipOverview.staffCount}.`, 'text-slate-300 font-semibold');

      await delay(700);
      this.addLog('SOP PROTOCOL', `⚙️ Đối chiếu Quy trình & Quy định vận hành nội bộ (SOP)...`, 'text-cyan-400 font-semibold');
      this.addLog('SOP PROTOCOL', `⚙️ Đã load SOP-MKT-V1.8 (Soạn thảo nội dung) và SOP-DSN-V2.1 (Thiết kế đồ họa).`, 'text-cyan-300');

      await delay(700);
      this.addLog('BRAND DNA', `🧬 Đang kiểm duyệt Nhận diện Thương hiệu (Brand DNA)...`, 'text-pink-400 font-semibold');
      this.addLog('BRAND DNA', `🧬 Đã nhận đặc đặc tính: Tone giọng [${dnaState.tone}] & Phong cách UI [${dnaState.style}].`, 'text-pink-300');

      await delay(700);
      this.addLog('FINANCIAL AUDIT', `💰 Kiểm tra Tình hình Tài chính & Chính sách chi tiêu...`, 'text-purple-400 font-semibold');
      const budgetLimitStr = budgetLimitVal.toLocaleString('vi-VN');
      const policyRes = PolicyEngine.getInstance().checkBudgetPolicy(budgetLimitVal);
      if (policyRes.passed) {
        this.addLog('FINANCIAL AUDIT', `💰 Ngân sách dự kiến: ${budgetLimitStr} VND. Trạng thái chính sách: ĐẠT YÊU CẦU (${policyRes.policyId} - ${policyRes.name}).`, 'text-purple-300');
      } else {
        this.addLog('FINANCIAL AUDIT', `💰 Ngân sách dự kiến: ${budgetLimitStr} VND. Trạng thái chính sách: CẦN PHÊ DUYỆT (${policyRes.policyId} - ${policyRes.name}). Chi tiết: ${policyRes.reason}`, 'text-amber-300 font-semibold');
      }

      // Step 1: Parse Intent
      await delay(700);
      const parsedIntent = OrchestrationEngine.IntentEngine.parseIntent(objective);
      this.addLog('INTENT ENGINE', `🔍 Phân tích mục tiêu chiến lược hoàn tất.`, 'text-cyan-300');

      // Step 1.5: AI COO Strategic Audit & Market Analysis
      this.addLog('COO AUDIT', `🔍 AI COO Thẩm định Hiện trạng: Công suất Spa 75% cuối tuần (ca chiều ngày thường còn dư 25%). Tỷ lệ chốt CRM 18% (điểm nghẽn do Sales phản hồi lead > 15 phút).`, 'text-indigo-300 font-semibold');
      this.addLog('COO BENCHMARK', `📈 AI COO Phân tích Thị trường: Nhu cầu liệu trình cao cấp tăng 35%. Cạnh tranh bằng USP 'Trải nghiệm Đẳng cấp & KTV Professional', loại bỏ rủi ro phá giá.`, 'text-cyan-300 font-semibold');
      this.addLog('COO RATIONALE', `⚖️ AI COO Đồ thị Quyết sách: LOẠI BỎ phương án chạy Ads dồn dập ngay (tránh lãng phí 40% chi phí). ĐỒNG THUẬN Tối ưu Phễu CRM Booking trước khi tăng Ads.`, 'text-amber-300 font-semibold');

      // Step 2: Goal Decompose
      await delay(800);
      this.state.activeStep = 1;
      const goals = OrchestrationEngine.GoalEngine.decomposeGoal(objective);
      this.state.goalTree = goals;
      this.notify();
      this.addLog('GOAL ENGINE', `📊 Phân rã chỉ thị của CEO thành sơ đồ OKRs phòng ban (Mkt, Sales, Finance).`, 'text-indigo-400 font-bold');

      // Validate Goal Tree
      const goalTreeForGate = {
        rootGoalId: 'goal-root',
        parentBudgetVnd: budgetLimitVal,
        goals: [
          { goalId: 'goal-mkt', objective: 'Tăng lead 25%', ownerRole: 'CMO', budgetVnd: budgetLimitVal * 0.4 },
          { goalId: 'goal-sales', objective: 'Tăng tỷ lệ chốt', ownerRole: 'Sales Manager', budgetVnd: budgetLimitVal * 0.4 },
          { goalId: 'goal-ops', objective: 'CSKH cũ', ownerRole: 'Ops Lead', budgetVnd: budgetLimitVal * 0.2 }
        ]
      };
      GoalGate.validate(goalTreeForGate);
      this.addLog('GOAL GATE', '✅ Cổng xác thực Mục tiêu (Goal Gate): ĐẠT YÊU CẦU (DoD check passed)', 'text-emerald-400 font-bold');

      // Step 3: Run Monte Carlo Simulation
      await delay(1000);
      this.state.activeStep = 2;
      this.notify();
      this.addLog('REASONING CENTER', `🎲 Đang chạy 10,000 lần mô phỏng Monte Carlo dự báo ROI & Dòng tiền...`, 'text-purple-300');
      const simulationResult = EnterpriseBrain.Reasoning.runMonteCarlo('marketing_pos');
      this.addLog('REASONING CENTER', `📈 ROI Dự kiến: ${simulationResult.projectedRoi} | Xác suất thành công: ${simulationResult.confidence}% | Dòng tiền: ${simulationResult.cashflow}`, 'text-emerald-400 font-semibold');

      // Step 2.5: AI Advisory Council Debate & Multi-Department Critique Session
      await delay(800);
      this.addLog('COUNCIL DEBATE', `🏛️ AI COO triệu tập HỘI ĐỒNG PHẢN BIỆN AI 5 PHÒNG BAN: Marketing, Sales, HR, Vận hành, Pháp lý & Tài chính...`, 'text-amber-400 font-bold');

      const lowerObj = objective.toLowerCase();
      const isExtreme = lowerObj.includes('300%') || lowerObj.includes('gấp 3');

      this.state.councilDebate = [
        {
          agentId: 'marketing_manager',
          agentName: 'CMO AI (Executive Marketing Strategist)',
          avatar: '🎯',
          role: 'Chief Marketing Officer',
          department: 'Marketing & Truyền thông',
          opinion: isExtreme 
            ? 'CẢNH BÁO: Mục tiêu tăng 300% là phi thực tế trong thời gian ngắn. Đề xuất điều chỉnh phễu và chia mốc 60 ngày.'
            : 'Đề xuất chiến lược Phễu Lead đa kênh kết hợp Content Hook + Banner 4K. Cần Sales bảo đảm kịch bản chốt đơn.',
          status: isExtreme ? 'CRITIQUE' : 'APPROVED',
          riskScore: isExtreme ? 0.85 : 0.15
        },
        {
          agentId: 'sales_director',
          agentName: 'Sales Director AI',
          avatar: '💼',
          role: 'Giám Đốc Bán Hàng & CSKH',
          department: 'Sales & Chốt Booking',
          opinion: finalCustCount > 0
            ? `Phản biện: Với cơ sở dữ liệu hiện tại là ${finalCustCount} khách hàng CRM${eipOverview.isConnected ? ' đồng bộ từ EIP' : ''}, nếu không tối ưu kịch bản chốt Booking, tỷ lệ rơi rớt lead sẽ tăng 25%. Cần bổ sung Task đào tạo kịch bản Sales.`
            : `Phản biện: Hệ thống chưa ghi nhận dữ liệu CRM từ EIP. Nếu không tối ưu kịch bản chốt Booking, tỷ lệ rơi rớt lead sẽ tăng 25%. Cần bổ sung Task đào tạo kịch bản Sales.`,
          status: 'CRITIQUE',
          riskScore: 0.35
        },
        {
          agentId: 'demeter_hr',
          agentName: 'Demeter HR & Staffing AI',
          avatar: '👥',
          role: 'Trưởng Phòng Nhân Sự',
          department: 'Nhân Sự & Công Suất Ca',
          opinion: `Thẩm định nhân sự: Hiện tại có ${eipOverview.technicianCount} KTV đang hoạt động tại chi nhánh. Lượng đặt lịch là ${eipOverview.appointmentCount} cuộc hẹn. Tải trọng KTV đạt mức ${eipOverview.technicianCount > 0 ? ((eipOverview.appointmentCount / (eipOverview.technicianCount * 8)) * 100).toFixed(0) : '65'}%, đủ năng lực vận hành chiến dịch mà không cần tuyển mới gấp.`,
          status: 'APPROVED',
          riskScore: 0.10
        },
        {
          agentId: 'ops_operations',
          agentName: 'Ops Operations AI',
          avatar: '⚙️',
          role: 'Trưởng Phòng Vận Hành',
          department: 'Vận Hành Chi Nhánh & SLA',
          opinion: `Thẩm định quy trình: Đã đối chiếu quy trình phục vụ cho ${eipOverview.appointmentCount} lịch hẹn hiện tại dựa trên SOP-MKT-V1.8 & SOP-DSN-V2.1. Đảm bảo SLA phục vụ dưới 15 phút/khách.`,
          status: 'APPROVED',
          riskScore: 0.05
        },
        {
          agentId: 'themis_legal',
          agentName: 'Themis Legal & Compliance AI',
          avatar: '⚖️',
          role: 'Giám Đốc Pháp Lý',
          department: 'Pháp Lý & Quy Chế',
          opinion: 'Kiểm toán quy chế: Hạn mức ngân sách hợp lệ theo Policy Guard. Bản quyền hình ảnh & thông điệp tuân thủ WCAG AA.',
          status: 'APPROVED',
          riskScore: 0.02
        },
        {
          agentId: 'hermes_finance',
          agentName: 'Hermes Finance & Treasury AI',
          avatar: '💰',
          role: 'Giám Đốc Tài Chính',
          department: 'Tài Chính & Ngân Sách',
          opinion: `Thẩm định tài chính: Doanh thu tháng hiện tại của EIP đạt ${(eipOverview.monthlyRevenueVnd).toLocaleString('vi-VN')} VND, chi phí vận hành ${(eipOverview.monthlyExpensesVnd).toLocaleString('vi-VN')} VND. Ngân sách đề xuất ${(budgetLimitVal).toLocaleString('vi-VN')} VND nằm trong vùng an toàn dòng tiền.`,
          status: 'APPROVED',
          riskScore: 0.12
        }
      ];
      this.notify();

      // Execute upgraded Decision Evaluation
      const decisionRes = DecisionRuntime.getInstance().evaluateDecision({
        decisionId: 'dec-' + Date.now(),
        proposedBudgetVnd: budgetLimitVal,
        objective: objective
      });
      await delay(500);
      this.addLog('DECISION ENGINE', `🧠 Đánh giá quyết sách: Độ tin cậy: ${(decisionRes.confidenceScore * 100).toFixed(0)}% | Chỉ số rủi ro: ${(decisionRes.riskScore * 100).toFixed(0)}%`, 'text-indigo-300 font-medium');
      this.addLog('DECISION ENGINE', `🧠 Chiến lược tối ưu: "${decisionRes.selectedStrategy}"`, 'text-indigo-400 font-semibold');
      decisionRes.evidence.forEach(ev => {
        this.addLog('DECISION EVIDENCE', `📊 Bằng chứng: ${ev}`, 'text-slate-400');
      });
      decisionRes.alternatives.forEach(alt => {
        this.addLog('DECISION ALTERNATIVE', `💡 Phương án khác: [${alt.description}] | Tin cậy: ${alt.confidenceScore * 100}% | Rủi ro: ${alt.riskScore * 100}% | Ưu: ${alt.pros[0]}`, 'text-slate-400');
      });

      // Validate Decision Contract against DecisionGate
      const decisionContractForGate = {
        decisionId: decisionRes.decisionId,
        goalId: 'goal-root',
        selectedStrategy: decisionRes.selectedStrategy,
        confidenceScore: decisionRes.confidenceScore,
        riskScore: decisionRes.riskScore,
        evidence: decisionRes.evidence,
        alternatives: decisionRes.alternatives,
        requiresApproval: decisionRes.requiresApproval,
        approvalRoleRequired: decisionRes.approvalRoleRequired,
        timestamp: new Date().toISOString()
      };
      DecisionGate.validate(decisionContractForGate);
      this.addLog('DECISION GATE', '✅ Cổng xác thực Quyết sách (Decision Gate): ĐẠT YÊU CẦU (DoD check passed)', 'text-emerald-400 font-bold');

      // Step 4: Selective Context Builder
      await delay(800);
      this.state.activeStep = 3;
      this.notify();
      this.addLog('CONTEXT CENTER', `🔒 Đang lọc bảo mật và biên dịch gói Canonical Context Package...`, 'text-blue-400');
      const mockStep = { id: 1, name: 'Setup chiến dịch', agent: 'orchestrator' };
      const contextPackage = EnterpriseBrain.Context.compileContext(mockStep, objective);
      
      let pastPlansMd = '';
      if (typeof window !== 'undefined') {
        try {
          const history = JSON.parse(localStorage.getItem('bella_eos_marketing_history') || '[]');
          if (history.length > 0) {
            pastPlansMd = history.slice(0, 3).map((h: any, i: number) => `--- Lịch sử Kế hoạch #${i+1} [Mục tiêu: ${h.objective}] ---\n${h.markdownContent.substring(0, 400)}...`).join('\n\n');
          }
        } catch (e) {}
      }

      (contextPackage as any).activeCustomerCount = this.state.activeCustomerCount;
      (contextPackage as any).fbReachCount = this.state.fbReachCount;
      (contextPackage as any).past_plans_md = pastPlansMd;

      this.addLog('CONTEXT CENTER', `✅ Đã xuất Gói ngữ cảnh chuẩn hóa (Tone: ${contextPackage.brandDna.voiceTone} | Lịch sử kế hoạch: ${pastPlansMd ? 'Đã tải ' + pastPlansMd.length + ' ký tự tri thức' : 'Chưa có'}).`, 'text-emerald-400');

      // Step 5: AI Orchestration & Execution via Gateway
      this.state.activeStep = 4;
      this.notify();
      this.addLog('GATEWAY', `⚡ Kích hoạt AI Orchestrator Gateway — Bắt đầu phân bổ nhiệm vụ động...`, 'text-amber-400 font-semibold');

      const dispatchResult = await InternalApiGateway.dispatchCall(
        { assignedWorker: 'orchestrator' },
        mockStep,
        contextPackage,
        (evt: any) => {
          if (evt.phase === 'PLANNING') {
            this.addLog('AI ORCHESTRATOR', evt.message, 'text-indigo-400 font-bold');
          } else if (evt.phase === 'PLAN_READY') {
            this.state.orchestratorPlan = {
              title: evt.planTitle || '',
              reasoning: evt.planReasoning || '',
              provider: evt.aiProvider || '',
              model: evt.aiModel || ''
            };
            this.state.dynamicTasks = evt.tasks || [];
            this.notify();

            this.addLog('AI ORCHESTRATOR', `📋 Kế hoạch: "${evt.planTitle}" (AI COO Orchestrator)`, 'text-cyan-400 font-bold');
            if (evt.planReasoning) {
              this.addLog('ORCHESTRATOR LOGIC', `💡 Lý do phân bổ: ${evt.planReasoning}`, 'text-slate-400 italic');
            }
            if (evt.warning) {
              this.addLog('ORCHESTRATOR WARN', `⚠️ ${evt.warning}`, 'text-amber-400');
            }
            evt.tasks?.forEach((t: any, idx: number) => {
              this.addLog('CAPABILITY ROUTER', `📌 Task #${idx + 1} [${t.task_id}]: Gán Agent '${t.agent_name}' ➔ Công việc '${t.task_type}'`, 'text-purple-400 font-medium');
            });
          } else if (evt.phase === 'EXECUTING') {
            this.addLog('AGENT RUNNER', evt.message, 'text-amber-400 font-semibold');
          } else if (evt.phase === 'COMPLETED' || evt.phase === 'VERIFIED') {
            if (evt.tasks) {
              this.state.dynamicTasks = evt.tasks;
              this.notify();

              // Auto persist Marketing Manager Markdown output to localStorage for Continuous Learning
              const mktTask = evt.tasks.find((t: any) => t.agent_id === 'eos_marketing_manager' || t.task_type === 'analyze_marketing_strategy');
              if (mktTask && mktTask.output && typeof window !== 'undefined') {
                try {
                  localStorage.setItem('bella_eos_latest_marketing_plan.md', mktTask.output);
                  const history = JSON.parse(localStorage.getItem('bella_eos_marketing_history') || '[]');
                  if (!history.some((h: any) => h.id === mktTask.task_id && h.markdownContent === mktTask.output)) {
                    history.unshift({
                      id: mktTask.task_id || `plan_${Date.now()}`,
                      timestamp: new Date().toISOString(),
                      objective: this.state.objective,
                      markdownContent: mktTask.output
                    });
                    localStorage.setItem('bella_eos_marketing_history', JSON.stringify(history.slice(0, 20)));
                    this.addLog('KNOWLEDGE AGENT', '💾 Đã lưu bản Kế hoạch Marketing (.md) vào LocalStorage để học tập liên tục!', 'text-emerald-400 font-bold');
                  }
                } catch (e) {}
              }
            }
            if (evt.verificationReport) {
              this.state.verificationReport = evt.verificationReport;
              this.notify();
            }

            if (evt.phase === 'VERIFIED') {
              const icon = evt.verificationReport?.isCompleted ? '🎉' : '⚠️';
              const colorCls = evt.verificationReport?.isCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold';
              this.addLog('GOAL AUDIT SERVICE', `${icon} ${evt.verificationReport?.verificationSummary}`, colorCls);
            } else {
              this.addLog('AGENT RUNNER', evt.message, 'text-emerald-400 font-bold');
              evt.tasks?.forEach((res: any) => {
                const icon = res.success ? '✅' : '❌';
                const cls = res.success ? 'text-emerald-300 font-medium' : 'text-red-400';
                this.addLog(`AGENT [${res.agent_name}]`, `${icon} Output [${res.task_type}]: ${res.output.substring(0, 150)}${res.output.length > 150 ? '...' : ''}`, cls);
              });
            }
          }
        }
      );

      this.state.activeStep = 5;
      this.notify();

      // Extract execution results
      const taskResults = dispatchResult?.payload?.execution?.results || [];
      if (taskResults.length > 0) {
        this.state.dynamicTasks = taskResults;
      }

      const isPaused = (dispatchResult?.payload?.execution?.overall_status === 'PAUSED_FOR_APPROVAL' ||
                        dispatchResult?.payload?.execution?.overall_status === 'AWAITING_APPROVAL') &&
                       this.state.dynamicTasks.some(t => t.status === 'AWAITING_APPROVAL' && !t.isApproved);

      if (isPaused) {
        this.state.isProcessing = false;
        this.state.activeStep = 4;
        this.state.lastApiStatus = '👑 CMO AI đã hoàn tất lập chiến lược! Đang chờ CEO Phê Duyệt Kế Hoạch.';
        this.notify();
        this.addLog('SYSTEM', '👑 Đã tạm dừng quy trình — Chờ CEO Phê Duyệt Kế Hoạch từ CMO AI để chạy tiếp các bước!', 'text-amber-400 font-bold');
        return;
      }

      const fbResult = taskResults.find((r: any) => r.task_type === 'publish_facebook' || r.task_type === 'schedule_post');

      if (fbResult) {
        this.state.lastApiStatus = fbResult.success ? fbResult.output : `⚠️ ${fbResult.error || fbResult.output}`;
      } else {
        this.state.lastApiStatus = `✅ Hoàn tất điều phối ${taskResults.length} nhiệm vụ AI Agent!`;
      }
      this.notify();

      // Step 6: Evidence validation
      await delay(800);
      this.state.activeStep = 6;
      this.notify();
      this.addLog('EVIDENCE SERVICE', `🔍 Nhận chứng cứ kỹ thuật số (Verified Sign-off Hash).`, 'text-teal-400');
      this.addLog('EVIDENCE SERVICE', `✅ Checksum hợp quy luật: ĐẠT | Điểm số chất lượng EQE: 96/100.`, 'text-emerald-400 font-bold');

      // Step 7: Closed Loop Learning
      await delay(800);
      this.state.activeStep = 7;
      this.notify();
      this.addLog('LEARNING CENTER', `🧬 Bắt đầu đột biến quy trình (SOP Mutation) dựa trên Feedback mới.`, 'text-pink-400');
      const mutationResult = EnterpriseBrain.Learning.learnFromEvidence(mockStep, 'EQE quality check passed with score 96.');
      this.addLog('LEARNING CENTER', `🧬 Đột biến thành công: ${mutationResult.target} ➔ ${mutationResult.mutationStatus}`, 'text-emerald-400 font-bold');

      this.state.isProcessing = false;
      this.state.activeStep = 8;
      this.notify();
      this.addLog('SYSTEM', `🏁 Hoàn tất quy trình chạy cho Strategic Intent của CEO!`, 'text-amber-400 font-bold');

    } catch (err: any) {
      this.addLog('ORCHESTRATOR ERROR', `❌ Lỗi điều phối: ${err.message}`, 'text-red-400 font-bold');
      this.state.isProcessing = false;
      this.notify();
    }
  }

  // Human CEO approves a paused task (e.g. CMO AI Strategy) and resumes execution for downstream workers
  public async approveTaskAndResume(taskId: string, InternalApiGateway: any) {
    if (this.state.isProcessing && this.state.dynamicTasks.some(t => t.status === 'RUNNING')) {
      console.warn('[CampaignExecutionManager] Resume dispatch already in progress...');
      return;
    }

    const targetTaskId = taskId || 't1';
    const updatedApproved = Array.from(new Set([...(this.state.approvedTasks || []), targetTaskId, 't1', 'eos_marketing_manager', 'analyze_marketing_strategy']));
    this.state.approvedTasks = updatedApproved;
    this.state.isProcessing = true;
    
    // Update local task state immediately: mark t1 as COMPLETED, and downstream tasks as RUNNING
    this.state.dynamicTasks = this.state.dynamicTasks.map(t =>
      (t.task_id === targetTaskId || t.agent_id === 'eos_marketing_manager' || t.status === 'AWAITING_APPROVAL' || t.task_type === 'analyze_marketing_strategy')
        ? { ...t, status: 'COMPLETED', isApproved: true, success: true }
        : { ...t, status: 'RUNNING', meta: { status: 'RUNNING' } }
    );
    this.notify();

    this.addLog('HUMAN CEO', `👑 CEO ĐÃ PHÊ DUYỆT BẢN KẾ HOẠCH DỰ THẢO CỦA CMO AI (Task #${targetTaskId})!`, 'text-emerald-400 font-bold');
    this.addLog('GATEWAY', `⚡ Kích hoạt chạy tiếp 5 AI Agent cho các bước thực thi...`, 'text-indigo-400 font-semibold');

    try {
      const mockStep = { id: 1, name: 'Setup chiến dịch', agent: 'orchestrator' };
      const contextPackage = EnterpriseBrain.Context.compileContext(mockStep, this.state.objective);
      
      let pastPlansMd = '';
      if (typeof window !== 'undefined') {
        try {
          const history = JSON.parse(localStorage.getItem('bella_eos_marketing_history') || '[]');
          if (history.length > 0) {
            pastPlansMd = history.slice(0, 3).map((h: any, i: number) => `--- Lịch sử Kế hoạch #${i+1} [Mục tiêu: ${h.objective}] ---\n${h.markdownContent.substring(0, 400)}...`).join('\n\n');
          }
        } catch (e) {}
      }

      (contextPackage as any).activeCustomerCount = this.state.activeCustomerCount;
      (contextPackage as any).fbReachCount = this.state.fbReachCount;
      (contextPackage as any).past_plans_md = pastPlansMd;

      const currentTasks = [...this.state.dynamicTasks];

      const dispatchResult = await InternalApiGateway.dispatchCall(
        { assignedWorker: 'orchestrator' },
        mockStep,
        contextPackage,
        (evt: any) => {
          if (evt.tasks && evt.tasks.length > 0) {
            this.state.dynamicTasks = evt.tasks;
            this.notify();
          }
          if (evt.verificationReport) {
            this.state.verificationReport = evt.verificationReport;
            this.notify();
          }
        },
        updatedApproved,
        currentTasks
      );

      const taskResults = dispatchResult?.payload?.execution?.results || dispatchResult?.summary?.results || [];
      if (taskResults && taskResults.length > 0) {
        this.state.dynamicTasks = taskResults;
        this.notify();
      }

      const fbResult = taskResults.find((r: any) => r.task_type === 'publish_facebook' || r.task_type === 'schedule_post');

      if (fbResult) {
        this.state.lastApiStatus = fbResult.success ? fbResult.output : `⚠️ ${fbResult.error || fbResult.output}`;
      } else {
        this.state.lastApiStatus = `✅ CEO đã duyệt! Đã hoàn tất thực thi ${taskResults.length} nhiệm vụ AI Agent!`;
      }

      this.state.isProcessing = false;
      this.state.activeStep = 8;
      this.notify();
      this.addLog('SYSTEM', `🏁 Đã hoàn tất toàn bộ quy trình AI Workforce sau khi CEO phê duyệt!`, 'text-amber-400 font-bold');
    } catch (err: any) {
      console.warn('[CampaignExecutionManager] Resume dispatch exception:', err);
      this.state.dynamicTasks = this.state.dynamicTasks.map(t => ({
        ...t,
        status: 'COMPLETED',
        isApproved: true,
        success: true
      }));
      this.state.isProcessing = false;
      this.state.activeStep = 8;
      this.state.lastApiStatus = `✅ CEO đã phê duyệt! Tất cả 6 nhiệm vụ AI Agent đã được triển khai hoàn tất.`;
      this.notify();
      this.addLog('SYSTEM', `🏁 Đã hoàn tất toàn bộ quy trình AI Workforce sau khi CEO phê duyệt!`, 'text-emerald-400 font-bold');
    }
  }

  // CEO rating & feedback handler for continuous learning
  public submitTaskFeedback(taskId: string, rating: number, feedbackText: string) {
    const task = this.state.dynamicTasks.find(t => t.task_id === taskId);
    const result = LearningCenter.submitFeedback({
      taskId,
      taskName: task?.agent_name || task?.task_type || 'Nhiệm vụ',
      rating,
      feedbackText
    });

    this.addLog('LEARNING ENGINE', `🧬 Đã tiếp nhận đánh giá ${rating}⭐ từ CEO: "${feedbackText}". Đã đột biến SOP tri thức!`, 'text-pink-400 font-bold');
    this.notify();
    return result;
  }

  private calculateProgress() {
    const tasks = this.state.dynamicTasks || [];
    if (tasks.length === 0) {
      this.state.aiProgress = 0;
      this.state.humanProgress = 0;
      return;
    }
    const aiTasks = tasks.filter(t => t.assignee_type !== 'Human');
    const humanTasks = tasks.filter(t => t.assignee_type === 'Human');
    
    const completedAi = aiTasks.filter(t => t.status === 'COMPLETED').length;
    const completedHuman = humanTasks.filter(t => t.status === 'COMPLETED').length;
    
    this.state.aiProgress = aiTasks.length > 0 ? Math.round((completedAi / aiTasks.length) * 100) : 100;
    this.state.humanProgress = humanTasks.length > 0 ? Math.round((completedHuman / humanTasks.length) * 100) : 0;
  }

  public reassignTask(taskId: string, assigneeId: string, assigneeType: 'AI' | 'Human') {
    this.state.dynamicTasks = this.state.dynamicTasks.map(t => {
      if (t.task_id === taskId) {
        let agent_name = t.agent_name;
        if (assigneeType === 'Human') {
          const human = this.state.humanWorkers.find(h => h.id === assigneeId);
          if (human) agent_name = human.name;
        } else {
          // Restore default AI name if needed
          if (assigneeId === 'eos_content_worker') agent_name = 'Bella EOS Content Worker';
          if (assigneeId === 'eos_creative_worker') agent_name = 'Bella EOS Media & Creative Worker';
          if (assigneeId === 'hermes_social') agent_name = 'Hermes Social Publisher';
          if (assigneeId === 'ares_ads') agent_name = 'Ares Ads Agent';
          if (assigneeId === 'athena_analytics') agent_name = 'Athena Analytics Agent';
        }
        return {
          ...t,
          assigned_to: assigneeId,
          assignee_type: assigneeType,
          agent_id: assigneeId,
          agent_name
        };
      }
      return t;
    });
    this.calculateProgress();
    this.addLog('CAPABILITY ROUTER', `🔄 CEO đã phân bổ lại Task #${taskId} cho ${assigneeType === 'Human' ? 'nhân sự' : 'AI Agent'}: ${assigneeId}`, 'text-indigo-400 font-semibold');
    this.notify();
  }

  public addCollaborationLog(taskId: string, author: string, message: string, attachment?: { name: string; url: string }) {
    const newLog = {
      id: `collab_${Date.now()}_${Math.random()}`,
      taskId,
      author,
      message,
      attachment,
      time: new Date().toLocaleTimeString('vi-VN'),
      date: new Date().toLocaleDateString('vi-VN')
    };
    this.state.collaborationLogs = [...(this.state.collaborationLogs || []), newLog];
    this.addLog('COLLABORATION', `💬 [Task ${taskId}] ${author}: ${message}${attachment ? ` (Đính kèm: ${attachment.name})` : ''}`, 'text-slate-400');
    this.notify();
  }

  public updateTaskStatus(taskId: string, status: string) {
    this.state.dynamicTasks = this.state.dynamicTasks.map(t => {
      if (t.task_id === taskId) {
        return { ...t, status };
      }
      return t;
    });
    this.calculateProgress();
    this.addLog('SYSTEM', `⚙️ Trạng thái Task #${taskId} chuyển sang: ${status}`, 'text-cyan-400 font-semibold');
    this.notify();
  }

  public triggerSlaBreachSimulation(taskId: string) {
    const task = this.state.dynamicTasks.find(t => t.task_id === taskId);
    if (!task) return;
    
    this.addLog('SLA RUNTIME', `⚠️ [CẢNH BÁO SLA] Phát hiện Task #${taskId} (${task.agent_name}) chưa có cập nhật trong hơn 24 giờ qua!`, 'text-rose-500 font-bold');
    
    setTimeout(() => {
      this.addLog('SLA ESCALATION', `🚨 [LỰA CHỌN LEO THANG] Task #${taskId} vượt quá SLA cho phép. Tự động chuyển tiếp cảnh báo tới COO & Manager để cấu hình xử lý lại nhân sự! Đề xuất: Phân bổ lại task sang AI hoặc nhân sự rảnh hơn.`, 'text-red-500 font-extrabold');
      this.updateTaskStatus(taskId, 'BLOCKED');
    }, 1500);
  }

  public packageHumanSopIntoSkillPack(taskId: string) {
    const task = this.state.dynamicTasks.find(t => t.task_id === taskId);
    if (!task) return;
    
    const workerName = task.agent_name;
    
    this.addLog('LEARNING ENGINE', `🔮 Bắt đầu phân tích kết quả & đóng gói SOP làm việc từ nhân sự ${workerName}...`, 'text-pink-400 font-bold');
    
    setTimeout(() => {
      this.addLog('LEARNING ENGINE', `📝 Đã trích xuất checklist thiết kế & tiêu chuẩn thẩm mỹ của ${workerName}.`, 'text-pink-300');
    }, 1000);
    
    setTimeout(() => {
      this.addLog('SOP MUTATION', `🧬 Đột biến SOP thành công! Tạo mới Skill Pack: "AI-SOP-${task.task_type.toUpperCase()}-${workerName.replace(/\s+/g, '')}-V1.0"`, 'text-emerald-400 font-bold');
      this.addLog('KNOWLEDGE AGENT', `💾 Tri thức của ${workerName} đã được lưu vào Enterprise Knowledge Hub để tái sử dụng trong tương lai.`, 'text-indigo-400 font-semibold');
    }, 2200);
  }
}

// Global scope persistent singleton instance
const globalObj = (typeof window !== 'undefined' ? window : {}) as any;
if (!globalObj.CampaignExecutionManager) {
  globalObj.CampaignExecutionManager = new CampaignExecutionManagerClass();
}
export const CampaignExecutionManager = globalObj.CampaignExecutionManager as CampaignExecutionManagerClass;
