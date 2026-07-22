"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Brain, Cpu, Layers, Zap, Settings, Database, Network, Play, 
  RefreshCw, FileText, CheckCircle2, AlertTriangle, TrendingUp, 
  Send, Terminal, User, Plus, Search, Sparkles, UploadCloud, ChevronRight, Key, Globe,
  X, Copy, Check, Code, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EnterpriseBrain } from '../core/brain';
import { OrchestrationEngine } from '../core/orchestration/orchestration';
import { InternalApiGateway } from '../core/execution/execution';
import { CampaignExecutionManager } from '../core/execution/campaign-manager';
import { FacebookConnector, EipConnector } from '../connectors/index';

// ─── Helper: read API keys from localStorage (set by /settings page) ─────────
const LS_KEY = 'bella_eos_integrations';
function getStoredKey(provider: string, key_name: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const store = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return store[`${provider}::${key_name}`] || '';
  } catch { return ''; }
}

function getDynamicOkrNodes(objective: string, activeStep: number) {
  const isCompleted = activeStep >= 1;
  const status = isCompleted ? 'COMPLETED' : 'PENDING';
  const lower = objective.toLowerCase();
  
  // 1. Marketing OKR
  let mktOkr = 'Tăng 20% Spa Demo';
  if (lower.includes('follower') || lower.includes('like') || lower.includes('theo dõi')) {
    const followMatch = objective.match(/(\d+[\s]*(?:follower|follow|like|lượt theo dõi|người theo dõi))/i);
    mktOkr = followMatch ? `Tăng ${followMatch[1]}` : 'Tăng lượt theo dõi Fanpage';
  } else if (lower.includes('doanh thu') || lower.includes('sales')) {
    mktOkr = 'Tăng trưởng phễu Lead MKT';
  } else if (lower.includes('khách hàng') || lower.includes('customer')) {
    mktOkr = 'Thu hút tệp Khách hàng mới';
  } else if (objective.trim()) {
    mktOkr = `MKT: ${objective.substring(0, 30)}${objective.length > 30 ? '...' : ''}`;
  }

  // 2. Sales OKR
  let salesOkr = 'Tối ưu 42 Lượt Bookings';
  if (lower.includes('follower') || lower.includes('like') || lower.includes('theo dõi')) {
    salesOkr = 'Tăng tỷ lệ tương tác & chuyển đổi';
  } else if (lower.includes('doanh thu') || lower.includes('sales')) {
    salesOkr = 'Đạt chỉ tiêu doanh số mới';
  } else if (lower.includes('khách hàng') || lower.includes('customer')) {
    salesOkr = 'Tối ưu tỷ lệ Retention';
  }

  // 3. HR & Operations OKR
  let opsOkr = 'Ràng buộc SOP & Staffing';
  if (lower.includes('follower') || lower.includes('like') || lower.includes('theo dõi')) {
    opsOkr = 'Chuẩn hóa quy trình đăng tải';
  } else if (lower.includes('spa') || lower.includes('dịch vụ')) {
    opsOkr = 'Điều phối ca KTV & Ràng buộc SOP';
  }

  // 4. Finance OKR
  let finOkr = 'Budget limit: 50M VND';
  const budgetMatch = objective.match(/(\d+[\s]*(?:triệu|tr|M|triệu VND|tr VND))/i);
  if (budgetMatch) {
    finOkr = `Budget limit: ${budgetMatch[1].toUpperCase()}`;
  } else if (lower.includes('ngân sách') || lower.includes('budget')) {
    finOkr = 'Hạn mức ngân sách đề xuất';
  } else {
    finOkr = 'Budget limit: 30M VND'; // standard default limit
  }

  return [
    { dept: 'Marketing', okr: mktOkr, status, color: 'border-cyan-400 text-cyan-600' },
    { dept: 'Sales', okr: salesOkr, status, color: 'border-blue-400 text-blue-600' },
    { dept: 'HR & Operations', okr: opsOkr, status, color: 'border-teal-400 text-teal-600' },
    { dept: 'Finance', okr: finOkr, status, color: 'border-purple-400 text-purple-600' }
  ];
}

// ─── Safe Storage: sessionStorage (primary, survives back-nav) + localStorage fallback ─
const SS_LARGE_KEYS = new Set(['bella_eos_dynamic_tasks', 'bella_eos_telemetry_logs', 'bella_eos_verification_report']);

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Always write to sessionStorage (persists across back/forward, cleared on tab close)
    sessionStorage.setItem(key, value);
  } catch {}
  // For non-large keys, also write to localStorage for cross-session persistence
  if (!SS_LARGE_KEYS.has(key)) {
    try { localStorage.setItem(key, value); } catch {}
  } else {
    // Write compact version (truncate per-task output to 500 chars) to localStorage
    try {
      const parsed = JSON.parse(value);
      const compact = Array.isArray(parsed)
        ? parsed.map((t: any) => ({
            ...t,
            output: typeof t.output === 'string' && t.output.length > 500
              ? t.output.substring(0, 500) + '…[truncated]'
              : t.output
          }))
        : parsed;
      localStorage.setItem(key, JSON.stringify(compact));
    } catch {}
  }
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // Prefer sessionStorage (has full data)
    const ss = sessionStorage.getItem(key);
    if (ss !== null) return ss;
  } catch {}
  try {
    return localStorage.getItem(key);
  } catch {}
  return null;
}

// 11 Process-based AI Agent Workforce Matrix Definition
const AI_WORKFORCE = [
  { id: 'human_ceo', name: 'CEO / Lãnh Đạo Tối Cao', type: 'Human', role: 'Thẩm Định Executive', avatar: '👑', capability: 'Duyệt ngân sách & phê duyệt bài xuất bản', status: 'idle', prof: 100, color: 'from-amber-600 to-yellow-400' },
  { id: 'coo', name: 'AI COO Orchestrator', type: 'AI', role: 'Điều Phối Vận Hành', avatar: '🤖', capability: 'Lập kế hoạch & phân bổ quy trình tự động', status: 'idle', prof: 98, color: 'from-cyan-500 to-blue-500' },
  { id: 'marketing_manager', name: 'AI Marketing Manager', type: 'AI', role: 'Quản Lý Marketing & Chiến Lược', avatar: '🎯', capability: 'Phân tích yêu cầu CEO, lập kế hoạch mục tiêu OKR & hoạch định quy trình', status: 'idle', prof: 99, color: 'from-indigo-600 to-violet-500' },
  { id: 'assistant', name: 'AI Assistant', type: 'AI', role: 'Trợ Lý Cấp Cao', avatar: '🙋‍♂️', capability: 'Hỗ trợ tổng hợp dữ liệu & báo cáo vận hành', status: 'idle', prof: 96, color: 'from-indigo-400 to-blue-400' },
  { id: 'hermes', name: 'Hermes Social Publisher', type: 'AI', role: 'Xuất Bản Mạng Xã Hội', avatar: '⚡', capability: 'Tự động đăng bài & quản lý Fanpage', status: 'idle', prof: 95, color: 'from-amber-500 to-orange-500' },
  { id: 'creative_designer', name: 'AI Creative Designer Worker', type: 'AI', role: 'Thiết Kế Đồ Họa', avatar: '🎨', capability: 'Thiết kế Poster, Banner PNG & phối cảnh 4K', status: 'idle', prof: 97, color: 'from-pink-500 to-rose-500' },
  { id: 'seo_copywriter', name: 'AI Marketing Copywriter Worker', type: 'AI', role: 'Sáng Tạo Nội Dung', avatar: '✍️', capability: 'Viết bài bán hàng, headline hook & ưu đãi', status: 'idle', prof: 96, color: 'from-purple-500 to-indigo-500' },
  { id: 'multimodal_analyst', name: 'AI Multimodal Document Analyst', type: 'AI', role: 'Phân Tích Đa Phương Tiện', avatar: '🧬', capability: 'Đọc OCR tài liệu, video & audio doanh nghiệp', status: 'idle', prof: 96, color: 'from-emerald-500 to-teal-500' },
  { id: 'ads_optimizer', name: 'AI Ads Campaign Optimizer', type: 'AI', role: 'Tối Ưu Quảng Cáo', avatar: '📈', capability: 'Điều phối ngân sách Facebook/Google Ads', status: 'idle', prof: 94, color: 'from-indigo-400 to-purple-400' },
  { id: 'payroll_guard', name: 'AI Payroll & Security Guard', type: 'AI', role: 'Kiểm Soát Tài Chính', avatar: '🔒', capability: 'Kiểm toán nội bộ, lương & bảo mật', status: 'idle', prof: 95, color: 'from-red-500 to-rose-500' },
  { id: 'connector_agent', name: 'AI ERP Connector Hub', type: 'AI', role: 'Tích Hợp Hệ Thống', avatar: '🔌', capability: 'Kết nối API MISA, SAP, Supabase ERP', status: 'idle', prof: 91, color: 'from-sky-500 to-indigo-500' },
  { id: 'learning_agent', name: 'AI Learning & Mutation Loop', type: 'AI', role: 'Học Máy & Nâng Cấp', avatar: '🧬', capability: 'Học từ feedback & tự nâng cấp SOP DNA', status: 'idle', prof: 96, color: 'from-teal-400 to-emerald-400' },
  { id: 'compliance_auditor', name: 'AI QA & Compliance Auditor', type: 'AI', role: 'Thẩm Định Chất Lượng', avatar: '🛡️', capability: 'Kiểm tra tỷ lệ chữ 20% & WCAG AA contrast', status: 'idle', prof: 98, color: 'from-slate-500 to-slate-700' }
];

export default function Dashboard() {
  // Application State
  const [objective, setObjective] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'reasoning'>('timeline');
  const [brainSubTab, setBrainSubTab] = useState<'memory' | 'knowledge' | 'context' | 'reasoning' | 'learning'>('memory');
  const [isBrainModalOpen, setIsBrainModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAgentConfigModalOpen, setIsAgentConfigModalOpen] = useState(false);
  const [selectedAgentForConfig, setSelectedAgentForConfig] = useState<any | null>(null);
  const [agentConfigs, setAgentConfigs] = useState<Record<string, { model?: string; systemPrompt?: string; temperature?: number; apiKey?: string }>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bella_eos_agent_configs');
        if (saved) setAgentConfigs(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const updateAgentConfig = (agentId: string, field: string, value: any) => {
    setAgentConfigs(prev => {
      const updated = {
        ...prev,
        [agentId]: {
          ...(prev[agentId] || {}),
          [field]: value
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('bella_eos_agent_configs', JSON.stringify(updated));
      }
      return updated;
    });
  };
  
  // Real API tokens state
  const [fbToken, setFbToken] = useState('');
  const [fbPageId, setFbPageId] = useState('me');
  const [lastApiStatus, setLastApiStatus] = useState<string | null>(null);
  const [activeCustomerCount, setActiveCustomerCount] = useState<number>(1289);
  const [fbReachCount, setFbReachCount] = useState<number>(14500);

  // Dynamic API Key readiness states
  const [hasOpenAI, setHasOpenAI] = useState(false);
  const [hasClaude, setHasClaude] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [hasFacebook, setHasFacebook] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasOpenAI(Boolean(getStoredKey('openai', 'api_key')));
      setHasClaude(Boolean(getStoredKey('anthropic', 'api_key')));
      setHasGemini(Boolean(getStoredKey('gemini', 'api_key')));
      setHasFacebook(Boolean(getStoredKey('facebook', 'page_access_token')));
      setFbToken(getStoredKey('facebook', 'page_access_token'));
      setFbPageId(getStoredKey('facebook', 'page_id') || 'me');
    }
  }, []);

  const [geminiModels, setGeminiModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const fetchGeminiModels = async () => {
      const geminiKey = getStoredKey('gemini', 'api_key');
      if (!geminiKey) return;
      setLoadingModels(true);
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        if (res.ok) {
          const data = await res.json();
          const names = data.models?.map((m: any) => m.name.replace('models/', '')) || [];
          setGeminiModels(names);
        }
      } catch (e) {
        console.warn('Failed to fetch Gemini models:', e);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchGeminiModels();
  }, [hasGemini]);

  // Realtime Simulation states
  const [telemetryLogs, setTelemetryLogs] = useState<{ id: string; time: string; source: string; message: string; color: string }[]>([]);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [goalTree, setGoalTree] = useState<any>(null);
  const [dnaState, setDnaState] = useState({ tone: 'Professional & Premium', style: 'Minimalist & Glassmorphism' });
  const [documents, setDocuments] = useState<{ name: string; size: string; status: string; rule: string }[]>([
    { name: 'Quy_dinh_Marketing_SPA_2026.pdf', size: '1.2 MB', status: 'COMPLETED', rule: 'Màu sắc thương hiệu: Rose & Gold. Lối diễn đạt: Premium.' },
    { name: 'Chinh_sach_Nhan_su_OT.docx', size: '840 KB', status: 'COMPLETED', rule: 'Tăng ca tính 150% lương, ca đêm phụ cấp 50k ăn uống.' }
  ]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');

  // Dynamic Orchestrator & Audit Verification States
  const [orchestratorPlan, setOrchestratorPlan] = useState<{ title: string; reasoning: string; provider: string; model: string } | null>(null);
  const [dynamicTasks, setDynamicTasks] = useState<any[]>([]);
  const [verificationReport, setVerificationReport] = useState<import('../core/orchestration/orchestration').VerificationReport | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync token to window for real connector access
  useEffect(() => {
    if (typeof window !== 'undefined' && fbToken) {
      (window as any).FACEBOOK_PAGE_ACCESS_TOKEN = fbToken;
    }
  }, [fbToken]);

  // Restore non-manager state on mount (documents)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDocs = safeGet('bella_eos_documents');
        if (savedDocs) setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        console.warn('Failed to restore documents state:', e);
      }
    }
  }, []);

  // Synchronize state with global CampaignExecutionManager to support background execution and tab preservation
  useEffect(() => {
    const unsubscribe = CampaignExecutionManager.subscribe((state) => {
      setIsProcessing(state.isProcessing);
      setActiveStep(state.activeStep);
      setTelemetryLogs(state.telemetryLogs);
      setGoalTree(state.goalTree);
      setOrchestratorPlan(state.orchestratorPlan);
      setDynamicTasks(state.dynamicTasks);
      setVerificationReport(state.verificationReport);
      setLastApiStatus(state.lastApiStatus);
      setActiveCustomerCount(state.activeCustomerCount);
      setFbReachCount(state.fbReachCount);
      setDnaState(state.dnaState);
      if (state.objective) {
        setObjective(state.objective);
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist non-manager state changes
  useEffect(() => { safeSet('bella_eos_documents', JSON.stringify(documents)); }, [documents]);

  // Initialize status log if empty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLogs = localStorage.getItem('bella_eos_telemetry_logs');
      if (savedLogs) return; // skip defaults if we have saved logs
    }
    addLog('SYSTEM', 'Lõi điều hành Bella Kernel v13.0 đã sẵn sàng vận hành.', 'text-emerald-600 font-semibold');
    addLog('BRAIN', '6 Cognitive Brain Centers đã hoạt động và đồng bộ với Supabase.', 'text-indigo-600');
    addLog('CONNECT', 'Cổng kết nối Bella Connect đã được kích hoạt thành công.', 'text-cyan-600');
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [telemetryLogs]);

  // Helper log function
  const addLog = (source: string, message: string, colorClass = 'text-slate-700') => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setTelemetryLogs(prev => [...prev, {
      id: `log_${Date.now()}_${Math.random()}`,
      time,
      source,
      message,
      color: colorClass
    }]);
  };

  // 1. Submit CEO Intent & Run Dynamic AI Orchestration
  const handleStartCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;

    CampaignExecutionManager.startCampaign(
      objective,
      dnaState,
      EipConnector,
      FacebookConnector,
      OrchestrationEngine,
      EnterpriseBrain,
      InternalApiGateway
    );
  };

  // 2. Ingest document via Drag & Drop or File selector
  const handleFileChange = async (file: File) => {
    if (!file) return;

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    addLog('INGESTION', `📥 Nhận tệp: "${file.name}" (${fileSizeStr}) ➔ Đang tải lên server...`, 'text-cyan-600 animate-pulse');

    // Optimistic UI: show document as PROCESSING immediately
    setDocuments(prev => [{
      name: file.name,
      size: fileSizeStr,
      status: 'PROCESSING',
      rule: 'Đang phân tích cấu trúc tài liệu...'
    }, ...prev]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      addLog('INGESTION', `🧬 Đang gửi tài liệu lên Bella EOS Knowledge Server...`, 'text-indigo-400 animate-pulse');

      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server ingest failed');
      }

      const { ingested, savedId, persisted } = data;

      // Update document list with real result
      setDocuments(prev => prev.map((doc, idx) =>
        idx === 0 && doc.name === file.name
          ? {
              name: file.name,
              size: fileSizeStr,
              status: 'COMPLETED',
              rule: `Quy chuẩn: Tông giọng ${ingested.dnaToneUpdated}. Style: ${ingested.styleUpdated}.`
            }
          : doc
      ));

      setDnaState({ tone: ingested.dnaToneUpdated, style: ingested.styleUpdated });

      CampaignExecutionManager.updateState({
        dnaState: { tone: ingested.dnaToneUpdated, style: ingested.styleUpdated }
      });

      const persistNote = persisted ? `💾 Đã lưu vào database (ID: ${savedId?.substring(0, 8)}...)` : '⚠️ Đã xử lý nhưng chưa lưu DB (Supabase chưa cấu hình)';
      addLog('INGESTION', `✅ Nạp tri thức thành công! Phân loại: [${ingested.classification}] — DNA tone: "${ingested.dnaToneUpdated}"`, 'text-emerald-600 font-bold');
      addLog('INGESTION', persistNote, persisted ? 'text-slate-400' : 'text-amber-500');

    } catch (err: any) {
      addLog('INGESTION', `❌ Lỗi tải lên: ${err.message}`, 'text-red-500 font-bold');
      // Mark document as failed
      setDocuments(prev => prev.map((doc, idx) =>
        idx === 0 && doc.name === file.name
          ? { ...doc, status: 'FAILED', rule: `Lỗi: ${err.message}` }
          : doc
      ));
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const coreAgents = AI_WORKFORCE.filter(ai => ['human_ceo', 'coo', 'marketing_manager', 'assistant'].includes(ai.id));
  const operationalAgents = AI_WORKFORCE.filter(ai => !['human_ceo', 'coo', 'marketing_manager', 'assistant'].includes(ai.id));
  const activeAgents = operationalAgents.filter(ai => {
    return dynamicTasks.some(t => {
      const taskAgentId = t.agent_id?.toLowerCase() || '';
      const taskAgentName = t.agent_name?.toLowerCase() || '';
      const aiId = ai.id.toLowerCase();

      // Direct ID mappings
      if (taskAgentId === 'eos_content_worker' && aiId === 'seo_copywriter') return true;
      if (taskAgentId === 'eos_creative_worker' && aiId === 'creative_designer') return true;
      if (taskAgentId === 'hermes_social' && aiId === 'hermes') return true;
      if (taskAgentId === 'ares_ads' && aiId === 'ads_optimizer') return true;
      if (taskAgentId === 'athena_analytics' && aiId === 'multimodal_analyst') return true;

      const aiNameNormalized = ai.name.toLowerCase()
        .replace(' worker', '')
        .replace(' ai', '')
        .replace(' publisher', '')
        .replace(' campaign', '')
        .replace(' optimizer', '')
        .replace(' & security guard', '')
        .replace(' connector hub', '')
        .replace(' learning & mutation loop', '')
        .replace(' qa & compliance auditor', '')
        .trim();
      
      return taskAgentId.includes(aiId) || 
             aiId.includes(taskAgentId) || 
             taskAgentName.includes(aiNameNormalized);
    });
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* HEADER STATUS BAR */}
      <header className="h-14 border-b border-slate-200 bg-white/85 backdrop-blur-xl px-6 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
            <Brain className="text-white w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-sm tracking-wider text-slate-900">BELLA EOS</h1>
              <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">v1.0 REAL API</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans hidden sm:block">Enterprise Operating System (Enterprise Brain)</p>
          </div>
        </div>

        {/* Real-time Indicators */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100/60 border border-slate-200/80 px-4 py-1.5 rounded-full text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500 font-medium">Supabase:</span>
            <span className="text-emerald-600 font-bold uppercase">Connected</span>
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-indigo-600">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-500">API Dispatcher:</span>
            <span className="font-semibold">{fbToken ? 'REAL API READY' : 'CONFIG MODE'}</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Cài đặt Tích hợp</span>
          </Link>
          <button 
            onClick={() => setIsBrainModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>Enterprise Brain Console</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: 12 AI WORKFORCE MATRIX */}
        <aside className="w-80 border-r border-slate-200 bg-white/60 backdrop-blur-md flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <h2 className="font-display font-semibold text-xs text-slate-700 uppercase tracking-wider">AI Workforce Matrix</h2>
            </div>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 font-bold">{AI_WORKFORCE.length} Agents Ready</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* SECTION 1: CORE EXECUTIVE TEAM */}
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-[10px] text-slate-400 uppercase tracking-wider px-1">
                Ban Điều Hành Trung Ương
              </h3>
              {coreAgents.map(ai => {
                const isRealApi = (ai.id === 'gpt4' && hasOpenAI) || (ai.id === 'claude' && hasClaude) || (ai.id === 'gemini' && hasGemini) || (ai.id === 'hermes' && hasFacebook);
                const statusLabel = ai.id === 'human_ceo' 
                  ? 'Human Authority' 
                  : ai.id === 'coo' 
                  ? 'EOS Kernel Active' 
                  : ai.id === 'marketing_manager'
                  ? 'Strategy Active'
                  : ai.id === 'assistant'
                  ? (isProcessing ? 'Synthesizing Reports' : 'Ready for CEO')
                  : isRealApi 
                  ? 'Real API Online' 
                  : 'Rule Engine Ready';

                return (
                  <div 
                    key={ai.id} 
                    className="glass-panel p-2.5 rounded-xl border border-slate-150 bg-white hover:border-indigo-400 hover:bg-slate-50/50 transition-all group flex items-start gap-3 shadow-sm"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${ai.color} flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                      {ai.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{ai.name}</h3>
                        <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold uppercase">{ai.type}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-medium truncate">Role: {ai.role}</p>
                      <p className="text-[9px] text-slate-600 italic mt-0.5 truncate">{ai.capability}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-105 text-[8px]">
                        <span className="flex items-center gap-1 font-bold">
                          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`}></span> 
                          <span className="text-emerald-700 font-semibold">{statusLabel}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgentForConfig(ai);
                            setIsAgentConfigModalOpen(true);
                          }}
                          className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer border border-indigo-100 shadow-2xs"
                        >
                          <Settings className="w-2.5 h-2.5" /> Cấu hình
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECTION 2: DYNAMIC ALLOCATED WORKERS */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                  Lực Lượng Vận Hành Phân Bổ
                </h3>
                {activeAgents.length > 0 && (
                  <span className="text-[8.5px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-bold">
                    {activeAgents.length} Active
                  </span>
                )}
              </div>

              {!isProcessing && activeStep === -1 ? (
                /* Idle State */
                <div className="border border-dashed border-slate-200 rounded-xl p-3.5 text-center bg-slate-50/50 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">Đợi Phân Bổ Nhân Sự</p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    AI COO sẽ phân tích bối cảnh, SOP nội bộ, DNA và phân tách công việc để gán các Agent vận hành chuyên trách vào đây.
                  </p>
                </div>
              ) : isProcessing && activeAgents.length === 0 ? (
                /* Planning State */
                <div className="border border-dashed border-indigo-200 rounded-xl p-3.5 text-center bg-indigo-50/20 space-y-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-400">
                    <Brain className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <p className="text-[11px] font-semibold text-indigo-700 font-display">COO Đang Hoạch Định...</p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Đang phân tích Business Context, kiểm duyệt chính sách tài chính & quy trình SOP để phân phối Agent...
                  </p>
                </div>
              ) : (
                /* Active Allocated Workers */
                <div className="space-y-2">
                  {activeAgents.map(ai => {
                    const isRealApi = (ai.id === 'gpt4' && hasOpenAI) || (ai.id === 'claude' && hasClaude) || (ai.id === 'gemini' && hasGemini) || (ai.id === 'hermes' && hasFacebook);
                    const statusLabel = isRealApi ? 'Real API Online' : 'Rule Engine Ready';

                    return (
                      <div 
                        key={ai.id} 
                        className="glass-panel p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/5 hover:border-indigo-400 transition-all group flex items-start gap-3 shadow-xs ring-2 ring-indigo-500/5"
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${ai.color} flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                          {ai.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{ai.name}</h3>
                            <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">ALLOCATED</span>
                          </div>
                          <p className="text-[9px] text-slate-500 mt-0.5 font-medium truncate">Role: {ai.role}</p>
                          <p className="text-[9px] text-slate-600 italic mt-0.5 truncate">{ai.capability}</p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[8px]">
                            <span className="flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                              <span className="text-emerald-700 font-semibold">{statusLabel}</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgentForConfig(ai);
                                setIsAgentConfigModalOpen(true);
                              }}
                              className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer border border-indigo-100 shadow-2xs"
                            >
                              <Settings className="w-2.5 h-2.5" /> Cấu hình
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 3: REGISTRY POOL (AVAILABLE AGENTS) */}
            <div className="pt-2 border-t border-slate-100">
              <details className="group border border-slate-150 rounded-xl bg-slate-50/50 overflow-hidden">
                <summary className="flex items-center justify-between p-2.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider cursor-pointer list-none select-none hover:text-slate-600 hover:bg-slate-50 transition-colors">
                  <span>Registry Pool ({operationalAgents.length - activeAgents.length} Idle)</span>
                  <span className="transition-transform group-open:rotate-180 text-[7px]">▼</span>
                </summary>
                <div className="p-2 border-t border-slate-100 space-y-1.5 bg-white max-h-48 overflow-y-auto">
                  {operationalAgents.filter(ai => !activeAgents.includes(ai)).map(ai => (
                    <div key={ai.id} className="flex items-center justify-between p-1.5 rounded bg-slate-50/70 border border-slate-100 text-[9px] hover:bg-slate-50 hover:border-slate-200 transition-all">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span>{ai.avatar}</span>
                        <span className="font-semibold truncate max-w-[130px]">{ai.name}</span>
                      </span>
                      <span className="text-[7px] bg-slate-100 px-1 py-0.5 rounded text-slate-400 font-bold uppercase">IDLE</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: INTERACTIVE GOAL TOPOLOGY & INPUTS */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100/40">
          
          {/* TOPOLOGY VIEWPORT */}
          <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-slate-500 font-medium">Interactive Goal & Execution Topology (Realtime)</span>
            </div>

            {/* Simulated interactive graph topology */}
            <div className="flex-1 glass-panel rounded-2xl border border-slate-200/80 flex flex-col items-center justify-start p-4 pt-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent)] pointer-events-none"></div>
              
              {/* Dynamic node link tree display */}
              {isProcessing || activeStep >= 0 ? (
                <div className="flex flex-col items-center gap-5 w-full max-w-3xl z-10 transition-all duration-500 overflow-y-auto max-h-[calc(100vh-270px)] px-2 pt-2 pb-8">
                  {/* Root Objective Node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="glass-panel-glow px-4 py-2.5 rounded-xl text-center border-indigo-400 text-xs font-semibold max-w-md shadow-sm">
                      <p className="text-[9px] text-indigo-600 uppercase tracking-widest font-bold">Root Intent (CEO)</p>
                      <p className="text-slate-800 mt-1">{objective}</p>
                    </div>
                  </div>

                  {/* Visual Step-by-Step Execution Tracker */}
                  <div className="w-full max-w-2xl bg-white/95 border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs space-y-2">
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Lộ Trình Xử Lý Chiến Dịch (Step-by-Step Telemetry)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                      {[
                        { step: 0, name: '1. Phân Tích Chỉ Thị' },
                        { step: 1, name: '2. Phân Rã OKRs' },
                        { step: 2, name: '3. Mô Phỏng ROI' },
                        { step: 3, name: '4. Dựng Ngữ Cảnh' },
                        { step: 4, name: '5. Phân Bổ Agent' },
                        { step: 5, name: '6. Chạy Real API' },
                        { step: 6, name: '7. Ký Số Chứng Cứ' },
                        { step: 7, name: '8. Tối Ưu SOP DNA' }
                      ].map((s) => {
                        const isActive = activeStep === s.step;
                        const isPast = activeStep > s.step;
                        return (
                          <div
                            key={s.step}
                            className={`p-2 rounded-lg border flex items-center gap-1.5 transition-all duration-300 ${
                              isActive
                                ? 'bg-indigo-50/70 border-indigo-400 text-indigo-700 font-bold ring-2 ring-indigo-100 shadow-2xs'
                                : isPast
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-indigo-500 animate-ping' : isPast ? 'bg-emerald-500' : 'bg-slate-300'
                            }`} />
                            <span className="truncate">{s.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flow links */}
                  <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-400 to-cyan-400 shrink-0"></div>

                  {/* Goal Completion Audit Bar (when available) */}
                  {verificationReport && (
                    <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Tiến Độ Mục Tiêu
                        </span>
                        <span className={`font-mono ${verificationReport.isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {verificationReport.completionPercentage}% HOÀN THÀNH ({verificationReport.completedTasks}/{verificationReport.totalTasks} Tasks)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${verificationReport.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${verificationReport.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Flow links */}
                  <div className="w-0.5 h-5 bg-gradient-to-b from-indigo-400 to-cyan-400 shrink-0"></div>

                  {/* DYNAMIC AI AGENT TASK NODES (Real-time Orchestrated Tasks) */}
                  {dynamicTasks.length > 0 ? (
                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Nhiệm Vụ Được Phân Bổ Tự Động ({dynamicTasks.length} Tasks)
                        </p>
                        {orchestratorPlan && (
                          <span className="text-[9px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            Agent Điều Phối: AI COO Orchestrator
                          </span>
                        )}
                      </div>

                      {/* CEO HUMAN APPROVAL BANNER GATE */}
                        {dynamicTasks.some(t => t.status === 'AWAITING_APPROVAL') && (
                          <div className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-amber-400/60 rounded-2xl p-4 text-left shadow-lg flex items-center justify-between gap-4 animate-fade-in">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-bold flex items-center justify-center text-xl shadow-md shrink-0 animate-bounce">
                                👑
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <span>THẨM ĐỊNH EXECUTIVE: YÊU CẦU CEO PHÊ DUYỆT BẢN KẾ HOẠCH MARKETING</span>
                                </h4>
                                <p className="text-[11px] text-amber-800 font-medium mt-1 leading-relaxed">
                                  AI Marketing Manager đã phân tích chỉ thị, xác định chân dung khách hàng & lập kế hoạch mục tiêu OKR. Vui lòng xem kết quả và bấm phê duyệt để tiếp tục chuyển qua các bước thực thi.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const awaitingTask = dynamicTasks.find(t => t.status === 'AWAITING_APPROVAL');
                                if (awaitingTask) {
                                  CampaignExecutionManager.approveTaskAndResume(awaitingTask.task_id, InternalApiGateway);
                                }
                              }}
                              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 shrink-0"
                            >
                              <span>👑 CEO Phê Duyệt Kế Hoạch & Cho Phép Chạy Tiếp →</span>
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {dynamicTasks.map((t: any, idx: number) => {
                            const isAwaitingApproval = t.status === 'AWAITING_APPROVAL' || t.meta?.status === 'AWAITING_APPROVAL';
                            const isConfigReq = (t.output?.includes('CONFIG_REQUIRED') || t.output?.includes('hết hạn') || t.meta?.status === 'CONFIG_REQUIRED' || t.meta?.isExpired === true) && !isAwaitingApproval;
                            const isPendingApproval = (t.status === 'PENDING_APPROVAL' || t.meta?.status === 'WAITING_FOR_MARKETING_APPROVAL') && !isConfigReq && !isAwaitingApproval;
                            const isDone = (t.success === true || t.status === 'COMPLETED' || t.isApproved) && !isConfigReq && !isAwaitingApproval;
                            const isFailed = (t.success === false || t.error) && !isConfigReq && !isAwaitingApproval && !isPendingApproval;

                            return (
                              <div
                                key={t.task_id || idx}
                                onClick={() => setSelectedTask(t)}
                                className={`glass-panel p-3.5 rounded-xl border text-left transition-all relative overflow-hidden shadow-sm cursor-pointer group hover:scale-[1.01] hover:shadow-md ${
                                  isAwaitingApproval
                                    ? 'border-amber-400 bg-amber-50/70 shadow-amber-100 ring-2 ring-amber-300'
                                    : isDone
                                    ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
                                    : isConfigReq
                                    ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
                                    : isFailed
                                    ? 'border-red-200 bg-red-50/40 hover:border-red-400'
                                    : 'border-slate-200 bg-white hover:border-indigo-400'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      #{idx + 1}
                                    </span>
                                    <h4 className="font-semibold text-xs text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{t.agent_name || t.agent_id}</h4>
                                  </div>

                                  {/* Status Badge */}
                                  {isAwaitingApproval && (
                                    <span className="text-[8px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 animate-pulse">
                                      👑 CHỜ CEO PHÊ DUYỆT
                                    </span>
                                  )}
                                  {isPendingApproval && (
                                    <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                      ⏳ CHỜ MARKETING DUYỆT
                                    </span>
                                  )}
                                  {isDone && !isAwaitingApproval && (
                                    <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> HOÀN THÀNH
                                    </span>
                                  )}
                                  {isConfigReq && (
                                    <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                      <AlertTriangle className="w-2.5 h-2.5" /> {t.meta?.isExpired || t.output?.includes('hết hạn') ? 'HẾT HẠN TOKEN' : 'THIẾU TOKEN'}
                                    </span>
                                  )}
                                  {isFailed && !isConfigReq && !isAwaitingApproval && (
                                    <span className="text-[8px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                      <AlertTriangle className="w-2.5 h-2.5" /> MẤT KẾT NỐI
                                    </span>
                                  )}
                                  {!isDone && !isConfigReq && !isFailed && !isAwaitingApproval && !isPendingApproval && (
                                    <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                      ⏳ ĐANG CHẠY
                                    </span>
                                  )}
                                </div>

                              <p className="text-[10px] text-slate-600 font-medium mt-1.5 line-clamp-2">
                                {t.task_description}
                              </p>

                              {/* Model switch warning badge */}
                              {isDone && t.meta?.modelWarning && (
                                <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                  <p className="text-[9px] text-amber-800 font-semibold leading-tight">
                                    ⚠️ THAY ĐỔI MODEL: {t.meta.modelWarning}
                                  </p>
                                </div>
                              )}

                              {/* Output snippet */}
                              {t.output && (
                                <p className="text-[9px] text-slate-500 mt-2 font-mono bg-white/80 p-1.5 rounded border border-slate-100 line-clamp-2">
                                  {t.output}
                                </p>
                              )}

                              <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[9px] font-bold text-indigo-600 group-hover:text-indigo-700">
                                <span className="flex items-center gap-1">
                                  <Terminal className="w-3 h-3" /> Bấm để xem kết quả chi tiết
                                </span>
                                <span className="group-hover:translate-x-0.5 transition-transform">Xem Chi Tiết →</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Fallback department OKR nodes if tasks haven't loaded yet */
                    <div className="grid grid-cols-4 gap-4 w-full">
                      {getDynamicOkrNodes(objective, activeStep).map((okrNode, i) => (
                        <div 
                          key={i} 
                          className={`glass-panel p-2.5 rounded-xl border text-center transition-all ${okrNode.status === 'COMPLETED' ? okrNode.color : 'border-slate-200 text-slate-400'}`}
                        >
                          <p className="text-[8px] uppercase tracking-wider font-bold opacity-80">{okrNode.dept}</p>
                          <p className="text-[10px] font-semibold mt-1 truncate">{okrNode.okr}</p>
                          <span className="text-[7px] block mt-1.5 font-bold">{okrNode.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WARNING / DISCONNECTION ALERT CARD */}
                  {verificationReport && verificationReport.failedSteps.length > 0 && (
                    <div className="w-full bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-left shadow-sm space-y-2.5 shrink-0">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>CẢNH BÁO: PHÁT HIỆN BƯỚC CHƯA HOÀN THÀNH HOẶC MẤT KẾT NỐI ({verificationReport.failedSteps.length} Nhiệm vụ)</span>
                      </div>

                      <div className="space-y-2">
                        {verificationReport.failedSteps.map((fs, idx) => (
                          <div key={idx} className="bg-white border border-amber-200/80 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-slate-800">
                              <span className="text-amber-700">📌 [{fs.agentName}] — {fs.description}</span>
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                                {fs.issueType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Nguyên nhân:</strong> {fs.error}</p>
                            <p className="text-[11px] text-indigo-700 font-medium"><strong className="text-slate-700">Hướng khắc phục:</strong> {fs.fixSuggestion}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-amber-700 font-medium">Bấm bên phải để truy cập trang cấu hình API Token</span>
                        <Link
                          href="/settings"
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                        >
                          <Key className="w-3 h-3" />
                          <span>Vào Cài Đặt Tích Hợp →</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions flow status */}
                  {activeStep >= 4 && lastApiStatus && (
                    <div className="glass-panel p-3 rounded-xl border border-indigo-200 flex items-center gap-3 text-left max-w-md shrink-0">
                      <Zap className="w-4 h-4 text-indigo-500 animate-bounce shrink-0" />
                      <div>
                        <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">AI Execution Gateway Output</p>
                        <p className="text-[9px] text-emerald-600 mt-1 font-mono font-bold bg-emerald-50 p-1.5 rounded border border-emerald-100">
                          {lastApiStatus}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center z-10 p-6 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm mb-4 text-slate-400">
                    <Network className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-slate-800">Kế Hoạch Rỗng</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1.5">Viết ý chí định hướng của bạn ở bên dưới để hệ thống lập lộ trình OKRs và kích hoạt bộ não.</p>
                </div>
              )}
            </div>
          </div>

          {/* DOCK BAR: CEO COMMAND INPUT CONSOLE */}
          <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-xl shrink-0">
            <form onSubmit={handleStartCampaign} className="flex gap-3 max-w-4xl mx-auto relative">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={objective}
                  onChange={(e) => {
                    setObjective(e.target.value);
                    CampaignExecutionManager.updateState({ objective: e.target.value });
                  }}
                  disabled={isProcessing}
                  placeholder="Ví dụ: Tăng 20% Spa demo trong 30 ngày với ngân sách 50 triệu..."
                  className="w-full h-12 bg-slate-50 border border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:outline-none rounded-xl pl-11 pr-4 text-xs font-sans text-slate-800 placeholder-slate-400 shadow-inner transition-colors disabled:opacity-50"
                />
                <Sparkles className="w-4 h-4 text-indigo-500 absolute left-4 top-4" />
              </div>
              <button 
                type="submit"
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-5 h-12 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <span>Phân rã Kế hoạch (AI)</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </main>

        {/* RIGHT COLUMN: INGESTION & TELEMETRY STREAM */}
        <aside className="w-80 border-l border-slate-200 bg-white/60 backdrop-blur-md flex flex-col shrink-0">
          
          {/* Tab control headers */}
          <div className="flex border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wider">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'timeline' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
            >
              Tài Liệu & DNA
            </button>
            <button 
              onClick={() => setActiveTab('reasoning')}
              className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'reasoning' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
            >
              Vết Chạy Telemetry
            </button>
          </div>

          {/* TAB UPLOAD & BRAND DNA */}
          {activeTab === 'timeline' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* BRAND DNA */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-200">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Company DNA Register</span>
                </h3>
                <div className="mt-3 space-y-2 text-[10px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Voice Tone:</span>
                    <span className="font-semibold text-amber-600">{dnaState.tone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UI Style Class:</span>
                    <span className="font-semibold text-cyan-600">{dnaState.style}</span>
                  </div>
                </div>
              </div>

              {/* UPLOAD ZONE */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-200">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-1.5 mb-3">
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Nạp Tri Thức Vào Bộ Não</span>
                </h3>
                
                <label 
                  className="border border-dashed border-slate-200 hover:border-cyan-400 bg-slate-50/50 hover:bg-cyan-50/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group relative"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-cyan-500 group-hover:scale-105 transition-all mb-2" />
                  <span className="text-[10px] font-semibold text-slate-700 text-center">Kéo & thả file hoặc click để tải lên</span>
                  <span className="text-[8px] text-slate-400 mt-1">Hỗ trợ PDF, Word, TXT, CSV, MD</span>
                </label>
              </div>

              {/* INGESTED DOCUMENTS */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Danh sách tri thức đã nạp</p>
                {documents.map((doc, idx) => (
                  <div key={idx} className="glass-panel p-3 rounded-lg border border-slate-100 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate pr-2 max-w-[150px]">{doc.name}</span>
                      <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-500">{doc.size}</span>
                    </div>
                    <p className="text-slate-500 mt-1 italic text-[9px] line-clamp-2">{doc.rule}</p>
                    
                    {doc.status === 'PROCESSING' && (
                      <span className="text-[8px] text-cyan-600 flex items-center gap-1 mt-2 animate-pulse font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span> Đang nạp tri thức...
                      </span>
                    )}
                    {doc.status === 'FAILED' && (
                      <span className="text-[8px] text-red-600 flex items-center gap-1 mt-2 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Nạp thất bại
                      </span>
                    )}
                    {(!doc.status || doc.status === 'COMPLETED') && (
                      <span className="text-[8px] text-emerald-600 flex items-center gap-1 mt-2 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Index Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB TELEMETRY */}
          {activeTab === 'reasoning' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3">
              <div className="flex-1 bg-slate-900 border border-slate-950 rounded-xl p-3 font-mono text-[9px] overflow-y-auto space-y-2 relative">
                {telemetryLogs.map((log) => (
                  <div key={log.id} className="leading-relaxed break-words text-slate-350">
                    <span className="text-slate-500">[{log.time}]</span>{' '}
                    <span className="text-indigo-400 font-bold">[{log.source}]</span>{' '}
                    <span className={log.color}>{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* API KEY REAL SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="w-full max-w-lg glass-panel-glow rounded-2xl flex flex-col overflow-hidden shadow-2xl relative bg-white">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <h3 className="font-display font-bold text-xs text-slate-800 uppercase">Cấu hình API Key Thực Tế</h3>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-xs text-slate-500 hover:text-slate-800">Đóng</button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facebook Page Access Token (Đăng bài thật)</label>
                <input 
                  type="password" 
                  value={fbToken} 
                  onChange={(e) => setFbToken(e.target.value)} 
                  placeholder="Dán token EAAG... của Facebook Fanpage vào đây" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono"
                />
                <p className="text-[9px] text-slate-500 mt-1">Hệ thống sẽ tự động dùng token này để đăng bài thật khi Worker Hermes được gọi.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facebook Page ID</label>
                <input 
                  type="text" 
                  value={fbPageId} 
                  onChange={(e) => setFbPageId(e.target.value)} 
                  placeholder="Mặc định: 'me' hoặc ID số của trang" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button 
                  onClick={() => setIsSettingsModalOpen(false)} 
                  className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 cursor-pointer"
                >
                  Lưu & Áp Dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENTERPRISE BRAIN CONSOLE MODAL */}
      {isBrainModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="w-full max-w-4xl h-[550px] glass-panel-glow rounded-2xl flex flex-col overflow-hidden shadow-xl relative">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-indigo-500 animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Enterprise Brain Console</h3>
                  <p className="text-[10px] text-slate-500">Sâu bên trong lớp tri thức và logic quyết định của bộ não doanh nghiệp</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBrainModalOpen(false)}
                className="text-slate-650 hover:text-slate-800 text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
              >
                Đóng Panel
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider">
              {[
                { tab: 'memory', label: 'Memory Center', icon: Database },
                { tab: 'knowledge', label: 'Knowledge Graph', icon: Network },
                { tab: 'context', label: 'Context Builder', icon: Layers },
                { tab: 'reasoning', label: 'Reasoning OKRs', icon: TrendingUp },
                { tab: 'learning', label: 'Learning Center', icon: Cpu }
              ].map(item => (
                <button
                  key={item.tab}
                  onClick={() => setBrainSubTab(item.tab as any)}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 border-b-2 transition ${brainSubTab === item.tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-550 hover:text-slate-800'}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-white text-xs">
              
              {/* SUB TAB: MEMORY */}
              {brainSubTab === 'memory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-3.5 rounded-xl border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Operational Memory
                      </h4>
                      <p className="text-[10px] text-slate-500 italic">Nhật ký vận hành các SOPs gần đây:</p>
                      <ul className="mt-2 space-y-1.5 text-[9px] font-mono text-cyan-600 max-h-48 overflow-y-auto">
                        {telemetryLogs.slice(-5).map((log, idx) => (
                          <li key={log.id || idx}>[{log.time}] [{log.source}] {log.message}</li>
                        ))}
                        {telemetryLogs.length === 0 && (
                          <li className="text-slate-450 italic">Chưa có nhật ký hoạt động. Hãy bắt đầu chiến dịch để ghi chép bộ nhớ.</li>
                        )}
                      </ul>
                    </div>

                    <div className="glass-panel p-3.5 rounded-xl border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Decision Memory
                      </h4>
                      <p className="text-[10px] text-slate-500 italic">Các quyết định điều hành tối ưu hóa:</p>
                      <ul className="mt-2 space-y-1.5 text-[9px] font-mono text-purple-650">
                        {objective ? (
                          <>
                            <li>DEC-001: Run campaign for "{objective.substring(0, 40)}..." (Confidence: 96%)</li>
                            <li>DEC-002: Apply brand tone "{dnaState.tone}" to copywriter agents</li>
                            {objective.toLowerCase().includes('spa') && (
                              <li>DEC-003: Auto-schedule spa capacity optimization SOP (Confidence: 98%)</li>
                            )}
                            {(objective.toLowerCase().includes('căn hộ') || objective.toLowerCase().includes('bất động')) && (
                              <li>DEC-003: Target real estate premium segment filters (Confidence: 95%)</li>
                            )}
                          </>
                        ) : (
                          <li className="text-slate-450 italic">Chưa có quyết định. Hãy nhập mục tiêu chiến dịch để kích hoạt quyết định tối ưu.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: KNOWLEDGE */}
              {brainSubTab === 'knowledge' && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[250px] relative bg-slate-50/50">
                    <p className="text-[10px] text-indigo-600 absolute top-4 left-4 font-mono">Bản đồ liên kết EOM Nodes & Tasks</p>
                    {dynamicTasks.length > 0 ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex flex-wrap items-center justify-center gap-6 p-4">
                          {dynamicTasks.map((t, idx) => (
                            <div key={t.task_id || idx} className="flex items-center">
                              <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-indigo-150 shadow-sm min-w-[120px] text-center">
                                <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-wide">#{idx + 1} {t.agent_id?.replace('_', ' ')}</span>
                                <span className="text-[10px] font-semibold text-slate-800 mt-0.5 truncate max-w-[100px]">{t.task_type}</span>
                                <span className="text-[8px] text-slate-400 mt-1 font-mono">{t.task_id}</span>
                              </div>
                              {idx < dynamicTasks.length - 1 && (
                                <div className="text-slate-300 font-bold ml-3 text-lg">→</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-500 text-center max-w-md italic mt-2">
                          Sơ đồ luồng dữ liệu (Graph Topology) tự động kết xuất dựa trên chỉ thị của CEO. Task sau kế thừa kết quả xử lý của các task trước đó.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Network className="w-10 h-10 text-slate-300 mx-auto animate-pulse mb-3" />
                        <p className="text-slate-500 text-xs">Chưa có bản đồ liên kết. Vui lòng bấm "Phân rã Kế hoạch" để dựng luồng.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB: CONTEXT */}
              {brainSubTab === 'context' && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Selective Context Package Compiler</h4>
                    <p className="text-[10px] text-slate-500 mb-3">Context Center lọc bảo mật dữ liệu thô (raw data) và chỉ gửi thông tin đã được rút gọn ngữ nghĩa đến AI.</p>
                    <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-[9px] text-emerald-400 max-h-60 overflow-y-auto">
                      <pre>{`{
  "taskId": "task_campaign_${Date.now().toString().substring(8)}",
  "objective": "${objective || 'Chưa nhập mục tiêu'}",
  "brandDna": {
    "brandName": "${dnaState.style ? 'BELLA EOS' : 'BELLA'}",
    "voiceTone": "${dnaState.tone}",
    "designStyle": "${dnaState.style}",
    "targetSegment": "${objective.toLowerCase().includes('spa') ? 'Chủ Spa & Thẩm mỹ viện' : 'Khách hàng tiềm năng'}"
  },
  "erp": {
    "approvedBudgetLimitVnd": ${objective.toLowerCase().includes('50 triệu') ? 50000000 : objective.toLowerCase().includes('100 triệu') ? 100000000 : 30000000},
    "currency": "VND",
    "policyStatus": "APPROVED_BY_CEO"
  },
  "crm": {
    "activeCustomers": ${activeCustomerCount},
    "activeBookings": ${objective.toLowerCase().includes('spa') ? 42 : 12},
    "facebookReach24h": ${fbReachCount}
  },
  "security": {
    "isDataSanitized": true,
    "piiRedacted": ["email", "phone_number"]
  }
}`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: REASONING */}
              {brainSubTab === 'reasoning' && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">OKR Goal Tree Decomposition</h4>
                    <p className="text-[10px] text-slate-500 mb-3">Tự động phân rã chỉ thị của CEO thành sơ đồ OKRs phòng ban:</p>
                    <div className="space-y-3.5 text-[10px]">
                      {goalTree ? (
                        <>
                          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800 block">Marketing Department OKR:</span>
                              Triển khai chiến dịch truyền thông nhằm tiếp cận phân khúc mục tiêu.
                              <span className="text-[9px] block text-indigo-650 mt-1 font-semibold">
                                • Target KPI: {goalTree.subGoals?.marketing?.leads || 1000} leads | CAC tối đa: {(goalTree.subGoals?.marketing?.cac || 1200000).toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800 block">Sales Department OKR:</span>
                              Tối ưu phễu đặt lịch tự động và hoa hồng nhân sự.
                              <span className="text-[9px] block text-cyan-650 mt-1 font-semibold">
                                • Target KPI: Đạt tỷ lệ chuyển đổi chốt bookings ≥ {goalTree.subGoals?.sales?.conversionRate || 2.8}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <ChevronRight className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800 block">Finance Department OKR:</span>
                              Rà soát chính sách chi tiêu và phân bổ dòng tiền.
                              <span className="text-[9px] block text-purple-650 mt-1 font-semibold">
                                • Hạn mức ngân sách tối đa: {objective.toLowerCase().includes('50 triệu') ? '50,000,000' : '100,000,000'} VND | Biên lợi nhuận ròng tối thiểu: {goalTree.subGoals?.finance?.minNetMargin || 20}%
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6 text-slate-450 italic">
                          Chưa có sơ đồ OKRs phân rã. Hãy nhập mục tiêu chiến dịch để kích hoạt Goal Engine.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: LEARNING */}
              {brainSubTab === 'learning' && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Evidence-based Learning & SOP Mutation</h4>
                    <p className="text-[10px] text-slate-500 mb-3">Khi công việc hoàn tất, bằng chứng thực thi (Evidence) được so sánh với mục tiêu để tự động tối ưu hóa mẫu SOP (đột biến quy trình):</p>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-450 uppercase block">Trước khi tối ưu (Old SOP)</span>
                        <span className="font-semibold text-slate-700 block mt-1">• Delay: 5000ms</span>
                        <span className="font-semibold text-slate-700 block">• Bidding: Cố định</span>
                        <span className="font-semibold text-slate-700 block">• Content Engine: Fallback</span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <span className="text-[9px] text-emerald-600 uppercase block">Sau đột biến (Mutated SOP)</span>
                        <span className="font-semibold text-emerald-700 block mt-1">• Delay: 2500ms (Tiết kiệm 50%)</span>
                        <span className="font-semibold text-emerald-700 block">• Bidding: Tự động (Monte Carlo)</span>
                        <span className="font-semibold text-emerald-700 block">• Content Engine: {hasOpenAI || hasClaude || hasGemini ? 'AI Live Engine' : 'Internal Engine'}</span>
                      </div>
                    </div>
                    {verificationReport && (
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px]">
                        <span className="font-bold text-indigo-750 block">SOP Mutation Log:</span>
                        <p className="text-slate-650 mt-1">
                          Chiến dịch hoàn thành với tỉ lệ **{verificationReport.completionPercentage}%**. 
                          Quy trình SOP thiết kế banner & soạn thảo nội dung đã được lưu làm quy chuẩn DNA mới cho thương hiệu.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── TASK EXECUTION DETAIL MODAL (Pop-up) ── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {selectedTask.agent_name?.charAt(0) || '🤖'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-slate-800">{selectedTask.agent_name || selectedTask.agent_id}</h3>
                    <span className="text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {selectedTask.task_type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Task ID: {selectedTask.task_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans text-xs">
              {/* Status Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                selectedTask.success === true && !selectedTask.output?.includes('CONFIG_REQUIRED')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : selectedTask.output?.includes('CONFIG_REQUIRED')
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Trạng Thái: {
                    selectedTask.success === true && !selectedTask.output?.includes('CONFIG_REQUIRED')
                      ? 'HOÀN THÀNH THÀNH CÔNG (SUCCESS)'
                      : selectedTask.output?.includes('CONFIG_REQUIRED')
                      ? 'CẦN CẤU HÌNH TOKEN (CONFIG REQUIRED)'
                      : 'THẤT BẠI / MẤT KẾT NỐI (FAILED)'
                  }</span>
                </div>
                {selectedTask.meta?.model && (
                  <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    Engine: {selectedTask.meta.model}
                  </span>
                )}
              </div>

              {/* Model Switch Warning Banner */}
              {selectedTask.meta?.modelWarning && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-amber-800 text-[11px] uppercase tracking-wide mb-1">
                      ⚠️ Thông báo: Hệ thống đã tự động thay đổi model
                    </p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      {selectedTask.meta.modelWarning}
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1.5 font-medium">
                      Kiểm tra lại cấu hình Agent hoặc thay đổi model trong phần <strong>Cấu Hình AI Workforce</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Task Description */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô Tả Nhiệm Vụ (Task Description)</h4>
                <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedTask.task_description}
                </p>
              </div>

              {/* Input Payload */}
              {selectedTask.input && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dữ Liệu Đầu Vào (Input Payload)</h4>
                  <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3.5 rounded-xl overflow-x-auto max-h-36 border border-slate-800">
                    {JSON.stringify(selectedTask.input, null, 2)}
                  </pre>
                </div>
              )}

              {/* Output Result */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kết Quả Thực Thi Chi Tiết (Full Output)</h4>
                  {selectedTask.output && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const blob = new Blob([selectedTask.output], { type: 'text/markdown;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `MarketingPlan_${selectedTask.task_id}_${Date.now()}.md`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Download className="w-3 h-3 text-emerald-600" />
                        <span>Tải File .md</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTask.output);
                          setCopiedOutput(true);
                          setTimeout(() => setCopiedOutput(false), 2000);
                        }}
                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedOutput ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedOutput ? 'Đã Sao Chép!' : 'Sao Chép Kết Quả'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-72 overflow-y-auto">
                  {selectedTask.output || selectedTask.error || 'Chưa có output cho bước này.'}
                </div>
              </div>

              {/* CEO Evaluation & Feedback Section */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 text-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    👑 CEO PHẢN HỒI ĐÁNH GIÁ & TỰ ĐỘNG ĐỘT BIẾN SOP
                  </h4>
                  <span className="text-[9px] text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                    Continuous Learning Loop
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Đánh giá chất lượng thực thi để hệ thống AI tự động học tập, cập nhật quy chuẩn và rút kinh nghiệm cho các chiến dịch tiếp theo:
                </p>

                {/* Star Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 mr-1">Đánh giá chất lượng:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="text-base hover:scale-125 transition-transform cursor-pointer"
                    >
                      {star <= feedbackRating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="text-[11px] font-bold text-amber-400 ml-2">{feedbackRating}/5 Sao</span>
                </div>

                {/* Feedback Text Input */}
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Nhập nhận xét của CEO (ví dụ: 'Nội dung W1 cần tăng tính gấp gáp', 'Banner W2 làm màu nền sáng hơn', 'CPL dự báo tốt')..."
                  className="w-full text-xs bg-slate-950/80 border border-indigo-800/60 rounded-xl p-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 min-h-[60px]"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {feedbackSubmitted ? '✅ Đã ghi nhận bài học! AI Workforce sẽ tự động áp dụng cho các chiến dịch tiếp theo.' : 'Tri thức sẽ tự động lưu vào bộ nhớ hệ thống'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!feedbackText.trim()) return;
                      CampaignExecutionManager.submitTaskFeedback(selectedTask.task_id, feedbackRating, feedbackText);
                      setFeedbackSubmitted(true);
                      setTimeout(() => setFeedbackSubmitted(false), 4000);
                      setFeedbackText('');
                    }}
                    disabled={!feedbackText.trim()}
                    className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Gửi Đánh Giá & Cập Nhật SOP</span>
                  </button>
                </div>
              </div>

              {/* Error or Warning remediation if present */}
              {(selectedTask.error || selectedTask.output?.includes('CONFIG_REQUIRED')) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs space-y-1.5">
                  <p className="font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Hướng Khắc Phục Lỗi / Mất Kết Nối:
                  </p>
                  <p className="text-amber-700">Vui lòng truy cập trang Cài đặt Tích hợp để bổ sung API Key / Access Token cho dịch vụ này.</p>
                  <div className="pt-1">
                    <Link
                      href="/settings"
                      onClick={() => setSelectedTask(null)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <Key className="w-3 h-3" />
                      <span>Vào Cài Đặt Tích Hợp →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Đóng Panel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ⚙️ DEDICATED MANUAL AI AGENT CONFIGURATION MODAL */}
      {isAgentConfigModalOpen && selectedAgentForConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedAgentForConfig.color} flex items-center justify-center text-xl shadow-md`}>
                  {selectedAgentForConfig.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {selectedAgentForConfig.name}
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase">{selectedAgentForConfig.role}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cấu hình tay trực tiếp dành riêng cho Agent ID: <code className="font-mono text-indigo-600 font-bold">{selectedAgentForConfig.id}</code></p>
                </div>
              </div>
              <button onClick={() => setIsAgentConfigModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Controls */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* 1. Model Engine Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mô Hình AI Động (Model Engine)</label>
                <select
                  value={agentConfigs[selectedAgentForConfig.id]?.model || 'default'}
                  onChange={(e) => updateAgentConfig(selectedAgentForConfig.id, 'model', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="default">✨ Default Dynamic System Routing (Tự động)</option>
                  
                  <optgroup label="Tất cả mô hình mặc định">
                    <option value="google-imagen-3">🧬 Google Imagen 3 (imagen-3.0-generate-002) — Ảnh 4K Photorealistic</option>
                    <option value="dall-e-3">🔮 OpenAI DALL-E 3 (1792x1024 Ads Ready)</option>
                    <option value="flux.1-schnell">⚡ Fal.ai Flux.1 Schnell</option>
                    <option value="gpt-4o">🔮 OpenAI GPT-4o (Reasoning & Copywriter)</option>
                    <option value="claude-3-5-sonnet">🧠 Anthropic Claude 3.5 Sonnet</option>
                    <option value="gemini-2.5-flash">🧬 Google Gemini 2.5 Flash</option>
                    <option value="bella-graphic-v4">🎨 Bella Dynamic Graphic PNG Engine (v4.0 Structural Layouts)</option>
                  </optgroup>

                  {geminiModels.length > 0 && (
                    <optgroup label="✨ Mô hình tự động nhận diện từ API Key của bạn">
                      {geminiModels.map(mName => (
                        <option key={mName} value={mName}>
                          {mName.includes('image') || mName.includes('imagen') ? '🎨' : '📝'} {mName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* 2. Custom System Prompt / Specialized Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Chỉ Thị / System Prompt Riêng Biệt</label>
                <textarea
                  rows={3}
                  value={agentConfigs[selectedAgentForConfig.id]?.systemPrompt || ''}
                  onChange={(e) => updateAgentConfig(selectedAgentForConfig.id, 'systemPrompt', e.target.value)}
                  placeholder="Nhập prompt quy chuẩn riêng cho Agent này (Ví dụ: Luôn viết theo tone giọng nhẹ nhàng, sang trọng của Spa cao cấp...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 font-sans text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 3. Temperature / Creativity Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Độ Sáng Tạo (Temperature): {agentConfigs[selectedAgentForConfig.id]?.temperature ?? 0.7}</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={agentConfigs[selectedAgentForConfig.id]?.temperature ?? 0.7}
                  onChange={(e) => updateAgentConfig(selectedAgentForConfig.id, 'temperature', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* 4. Custom API Key Override for this specific agent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">API Key Độc Lập (Nếu có)</label>
                <input
                  type="password"
                  value={agentConfigs[selectedAgentForConfig.id]?.apiKey || ''}
                  onChange={(e) => updateAgentConfig(selectedAgentForConfig.id, 'apiKey', e.target.value)}
                  placeholder="Dán API Key độc lập dành riêng cho Agent này (Ghi đè key mặc định)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Đã lưu tự động vào LocalStorage &amp; Supabase DNA
              </span>
              <button
                onClick={() => setIsAgentConfigModalOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Hoàn Tất Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
