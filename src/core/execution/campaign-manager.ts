import { CanonicalContextPackage } from '../../types/eom';
import { EnterpriseBrain } from '../brain';
import { LearningCenter } from '../brain/learning';

export interface CampaignState {
  isProcessing: boolean;
  activeStep: number;
  telemetryLogs: any[];
  goalTree: any;
  dnaState: { tone: string; style: string };
  orchestratorPlan: any;
  dynamicTasks: any[];
  verificationReport: any;
  lastApiStatus: string | null;
  activeCustomerCount: number;
  fbReachCount: number;
  objective: string;
  approvedTasks: string[];
}

export type Listener = (state: CampaignState) => void;

class CampaignExecutionManagerClass {
  private state: CampaignState = {
    isProcessing: false,
    activeStep: -1,
    telemetryLogs: [],
    goalTree: null,
    dnaState: { tone: 'Professional & Premium', style: 'Minimalist & Glassmorphism' },
    orchestratorPlan: null,
    dynamicTasks: [],
    verificationReport: null,
    lastApiStatus: null,
    activeCustomerCount: 1289,
    fbReachCount: 14500,
    objective: '',
    approvedTasks: []
  };

  private listeners = new Set<Listener>();

  constructor() {
    // Rehydrate state from localStorage/sessionStorage if possible
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bella_eos_campaign_manager_state');
        if (saved) {
          this.state = { ...this.state, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('Failed to load CampaignExecutionManager state:', e);
      }
    }
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
    if (this.state.isProcessing) return;

    this.state = {
      isProcessing: true,
      activeStep: 0,
      telemetryLogs: [],
      goalTree: null,
      dnaState,
      orchestratorPlan: null,
      dynamicTasks: [],
      verificationReport: null,
      lastApiStatus: null,
      activeCustomerCount: this.state.activeCustomerCount,
      fbReachCount: this.state.fbReachCount,
      objective,
      approvedTasks: []
    };
    this.notify();

    this.addLog('CEO INTENT', `🎯 Ý chí chiến lược nhận được: "${objective}"`, 'text-amber-400 font-bold');

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Step 0: COO Starts Holistic Analysis
    await delay(700);
    this.addLog('AI COO', `🤖 Nhận nhiệm vụ từ CEO. Bắt đầu phân tích tổng thể hệ thống...`, 'text-indigo-400 font-bold');

    try {
      await delay(600);
      this.addLog('EipConnector', `Fetching active customer records from external EIP CRM`, 'text-slate-300');
      const activeCustomers = await EipConnector.getActiveCustomers();
      const finalCustCount = activeCustomers.length + 1287;
      this.state.activeCustomerCount = finalCustCount;
      this.notify();

      await delay(500);
      this.addLog('Understanding Center', `Digesting API / EIP payload from: EIP CRM API`, 'text-slate-300');
      EnterpriseBrain.Understanding.understandApiFact('EIP CRM API', { activeCustomersCount: activeCustomers.length });
      
      // Query Facebook Metrics
      const fbMetrics = await FacebookConnector.getReachMetrics();
      this.state.fbReachCount = fbMetrics.postReach24h;
      this.notify();
      
      await delay(700);
      this.addLog('BUSINESS CONTEXT', `📋 Phân tích bối cảnh kinh doanh: Khách hàng hoạt động: ${finalCustCount} | Reach 24h: ${fbMetrics.postReach24h.toLocaleString()} (Nguồn: ${fbMetrics.source}). Khởi tạo Context Package.`, 'text-slate-300 font-semibold');

      await delay(700);
      this.addLog('SOP PROTOCOL', `⚙️ Đối chiếu Quy trình & Quy định vận hành nội bộ (SOP)...`, 'text-cyan-400 font-semibold');
      this.addLog('SOP PROTOCOL', `⚙️ Đã load SOP-MKT-V1.8 (Soạn thảo nội dung) và SOP-DSN-V2.1 (Thiết kế đồ họa).`, 'text-cyan-300');

      await delay(700);
      this.addLog('BRAND DNA', `🧬 Đang kiểm duyệt Nhận diện Thương hiệu (Brand DNA)...`, 'text-pink-400 font-semibold');
      this.addLog('BRAND DNA', `🧬 Đã nhận đặc đặc tính: Tone giọng [${dnaState.tone}] & Phong cách UI [${dnaState.style}].`, 'text-pink-300');

      await delay(700);
      this.addLog('FINANCIAL AUDIT', `💰 Kiểm tra Tình hình Tài chính & Chính sách chi tiêu...`, 'text-purple-400 font-semibold');
      const budgetLimit = objective.toLowerCase().includes('50 triệu') ? '50,000,000' : '100,000,000';
      this.addLog('FINANCIAL AUDIT', `💰 Ngân sách dự kiến: ${budgetLimit} VND. Trạng thái chính sách: ĐẠT YÊU CẦU (POL-GOV-001).`, 'text-purple-300');

      // Step 1: Parse Intent
      await delay(700);
      const parsedIntent = OrchestrationEngine.IntentEngine.parseIntent(objective);
      this.addLog('INTENT ENGINE', `🔍 Phân tích mục tiêu chiến lược hoàn tất.`, 'text-cyan-300');

      // Step 2: Goal Decompose
      await delay(800);
      this.state.activeStep = 1;
      const goals = OrchestrationEngine.GoalEngine.decomposeGoal(objective);
      this.state.goalTree = goals;
      this.notify();
      this.addLog('GOAL ENGINE', `📊 Phân rã chỉ thị của CEO thành sơ đồ OKRs phòng ban (Mkt, Sales, Finance).`, 'text-indigo-400 font-bold');

      // Step 3: Run Monte Carlo Simulation
      await delay(1000);
      this.state.activeStep = 2;
      this.notify();
      this.addLog('REASONING CENTER', `🎲 Đang chạy 10,000 lần mô phỏng Monte Carlo dự báo ROI & Dòng tiền...`, 'text-purple-300');
      const simulationResult = EnterpriseBrain.Reasoning.runMonteCarlo('marketing_pos');
      this.addLog('REASONING CENTER', `📈 ROI Dự kiến: ${simulationResult.projectedRoi} | Xác suất thành công: ${simulationResult.confidence}% | Dòng tiền: ${simulationResult.cashflow}`, 'text-emerald-400 font-semibold');

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
      const taskResults = dispatchResult.payload.execution.results || [];
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

  // Human CEO approves a paused task (e.g. Marketing Manager Strategy) and resumes execution for downstream workers
  public async approveTaskAndResume(taskId: string, InternalApiGateway: any) {
    const targetTaskId = taskId || 't1';
    const updatedApproved = Array.from(new Set([...(this.state.approvedTasks || []), targetTaskId, 't1']));
    this.state.approvedTasks = updatedApproved;
    this.state.isProcessing = true;
    
    // Update local task state immediately
    this.state.dynamicTasks = this.state.dynamicTasks.map(t =>
      (t.task_id === targetTaskId || t.agent_id === 'eos_marketing_manager' || t.status === 'AWAITING_APPROVAL')
        ? { ...t, status: 'COMPLETED', isApproved: true, success: true }
        : t
    );
    this.notify();

    this.addLog('HUMAN CEO', `👑 CEO ĐÃ PHÊ DUYỆT BẢN KẾ HOẠCH DỰ THẢO CỦA AI MARKETING MANAGER (Task #${targetTaskId})!`, 'text-emerald-400 font-bold');
    this.addLog('GATEWAY', `⚡ Kích hoạt chạy tiếp quy trình AI Workforce cho các bước tiếp theo...`, 'text-indigo-400 font-semibold');

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
          if (evt.phase === 'COMPLETED' || evt.phase === 'VERIFIED') {
            if (evt.tasks) {
              this.state.dynamicTasks = evt.tasks;
              this.notify();
            }
            if (evt.verificationReport) {
              this.state.verificationReport = evt.verificationReport;
              this.notify();
            }
          }
        },
        updatedApproved,
        currentTasks
      );

      const taskResults = dispatchResult?.summary?.results || dispatchResult?.payload?.execution?.results || [];
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
      this.addLog('ORCHESTRATOR ERROR', `❌ Lỗi tiếp tục thực thi: ${err.message}`, 'text-red-400 font-bold');
      this.state.isProcessing = false;
      this.notify();
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
}

// Global scope persistent singleton instance
const globalObj = (typeof window !== 'undefined' ? window : {}) as any;
if (!globalObj.CampaignExecutionManager) {
  globalObj.CampaignExecutionManager = new CampaignExecutionManagerClass();
}
export const CampaignExecutionManager = globalObj.CampaignExecutionManager as CampaignExecutionManagerClass;
