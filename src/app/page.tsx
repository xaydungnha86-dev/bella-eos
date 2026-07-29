"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Brain, Cpu, Layers, Zap, Settings, Database, Network, Play, 
  RefreshCw, FileText, CheckCircle2, AlertTriangle, TrendingUp, 
  Send, Terminal, User, Plus, Search, Sparkles, UploadCloud, ChevronRight, Key, Globe, MessageSquare,
  X, Copy, Check, Code, Download, RotateCcw, Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EnterpriseBrain } from '../core/brain';
import { OrchestrationEngine } from '../core/orchestration/orchestration';
import { InternalApiGateway } from '../core/execution/execution';
import { CampaignExecutionManager } from '../core/execution/campaign-manager';
import { FacebookConnector, EipConnector } from '../connectors/index';
import { ContractRegistry } from '../core/contracts/contract-registry';
import { PolicyEngine } from '../core/gov/policy-engine';


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
  { id: 'marketing_manager', name: 'CMO AI (Executive Marketing Strategist)', type: 'AI', role: 'Chief Marketing Officer', avatar: '🎯', capability: 'Phân tích yêu cầu CEO, lập giao kèo EIC, DAG reasoning & phản biện', status: 'idle', prof: 99, color: 'from-indigo-600 to-violet-500' },
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

import { HUMAN_WORKER_REGISTRY, HumanWorker } from '../core/workforce/human-registry';

export default function Dashboard() {
  // Application State
  const [humanWorkers, setHumanWorkers] = useState<HumanWorker[]>(HUMAN_WORKER_REGISTRY);
  const [collaborationLogs, setCollaborationLogs] = useState<any[]>([]);
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [humanProgress, setHumanProgress] = useState<number>(0);
  const [selectedTaskComment, setSelectedTaskComment] = useState('');
  const [isReassignmentOpen, setIsReassignmentOpen] = useState(false);
  const [leftSidebarTab, setLeftSidebarTab] = useState<'ai' | 'human'>('ai');
  const [objective, setObjective] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'reasoning' | 'control'>('control');
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
  const [activeCustomerCount, setActiveCustomerCount] = useState<number>(0);
  const [fbReachCount, setFbReachCount] = useState<number>(0);

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
  const handleDnaChange = (field: 'tone' | 'style', value: string) => {
    const updated = { ...dnaState, [field]: value };
    setDnaState(updated);
    CampaignExecutionManager.updateState({ dnaState: updated });
  };
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
  const [activeDetailTab, setActiveDetailTab] = useState<'report' | 'contract'>('report');

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
      setHumanWorkers(state.humanWorkers || []);
      setCollaborationLogs(state.collaborationLogs || []);
      setAiProgress(state.aiProgress || 0);
      setHumanProgress(state.humanProgress || 0);
      if (state.objective) {
        setObjective(state.objective);
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist non-manager state changes
  useEffect(() => { safeSet('bella_eos_documents', JSON.stringify(documents)); }, [documents]);

  // Keep selectedTask reference fresh when dynamicTasks updates in the background
  useEffect(() => {
    if (selectedTask) {
      const updated = dynamicTasks.find(t => t.task_id === selectedTask.task_id);
      if (updated) {
        setSelectedTask(updated);
      }
    }
  }, [dynamicTasks]);

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

  const handleCeoApprove = (taskId?: string) => {
    const targetId = taskId || 't1';
    setDynamicTasks(prev => prev.map(t =>
      (t.task_id === targetId || t.agent_id === 'eos_marketing_manager' || t.status === 'AWAITING_APPROVAL' || t.task_type === 'analyze_marketing_strategy')
        ? { ...t, status: 'COMPLETED', isApproved: true, success: true, meta: { ...(t.meta || {}), status: 'COMPLETED', requiresHumanApproval: false } }
        : { ...t, status: 'RUNNING', meta: { ...(t.meta || {}), status: 'RUNNING' } }
    ));
    if (selectedTask) {
      setSelectedTask((prev: any) => prev ? {
        ...prev,
        status: 'COMPLETED',
        isApproved: true,
        success: true,
        meta: { ...(prev.meta || {}), status: 'COMPLETED', requiresHumanApproval: false }
      } : null);
    }
    CampaignExecutionManager.approveTaskAndResume(targetId, InternalApiGateway);
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#fafafb] text-[#1e293b]">
      {/* LUXURY EXECUTIVE HEADER */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-8 py-3.5 flex items-center justify-between shadow-[0_2px_12px_rgba(15,23,42,0.015)] relative z-30">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg relative luxury-border-glow">
            <Brain className="text-amber-400 w-5 h-5 animate-pulse-glow" />
          </div>
          <div>
            <h1 className="font-display font-bold text-[15px] tracking-[0.2em] text-slate-900 uppercase">BELLA EOS</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] tracking-[0.1em] text-amber-600 font-bold uppercase">Enterprise Intelligence Platform</span>
              <span className="text-slate-300 text-[8px]">•</span>
              <span className="text-[9px] text-slate-500 font-medium">Hệ thống Điều hành Trí tuệ Doanh nghiệp</span>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-xs hover:border-slate-300"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>Cài đặt hệ thống</span>
          </Link>
          <Link
            href="/settings/company"
            className="bg-amber-50/50 hover:bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Hồ sơ DNA Doanh nghiệp</span>
          </Link>
          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn reset toàn bộ trạng thái?')) {
                CampaignExecutionManager.hardReset();
              }
            }}
            className="bg-white hover:bg-slate-50 text-slate-650 border border-slate-200/80 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer hover:border-slate-300"
            title="Reset hệ thống"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
            <span>Khởi động lại</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="flex-1 flex overflow-hidden relative">
         {/* LEFT COLUMN: ENTERPRISE WORKFORCE MATRIX */}
        <aside className="w-80 border-r border-slate-200/60 bg-[#f8fafc]/90 backdrop-blur-xl flex flex-col shrink-0 executive-sidebar">
          <div className="p-4.5 border-b border-slate-200/60 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-slate-700" />
                <h2 className="font-display font-semibold text-[10px] tracking-[0.15em] text-slate-500 uppercase">Ma Trận Nhân Sự</h2>
              </div>
              <span className="text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50 font-bold">
                {leftSidebarTab === 'ai' ? `${AI_WORKFORCE.length} Agents` : `${humanWorkers.length} Personnel`}
              </span>
            </div>
            
            {/* Sidebar Tab Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold border border-slate-200/30">
              <button
                onClick={() => setLeftSidebarTab('ai')}
                className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${leftSidebarTab === 'ai' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'}`}
              >
                🤖 Lực lượng AI ({AI_WORKFORCE.length})
              </button>
              <button
                onClick={() => setLeftSidebarTab('human')}
                className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${leftSidebarTab === 'human' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'}`}
              >
                👥 Nhân Sự ({humanWorkers.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {leftSidebarTab === 'human' ? (
              <div className="space-y-3">
                {humanWorkers.map(w => {
                  const workloadColor = w.workload > 80 ? 'bg-rose-500' : w.workload > 60 ? 'bg-amber-500' : 'bg-emerald-500';
                  const workloadText = w.workload > 80 ? 'Quá tải' : w.workload > 60 ? 'Bận' : 'Sẵn sàng';
                  
                  return (
                    <div 
                      key={w.id} 
                      className="executive-card p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-350 flex flex-col gap-2.5 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shadow-2xs shrink-0 bg-gradient-to-tr from-slate-50 to-slate-100 border border-slate-200/50">
                          {w.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-800 truncate">{w.name}</h4>
                            <span className="text-[7px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold uppercase">{w.timezone}</span>
                          </div>
                          <p className="text-[9px] text-amber-700 font-semibold mt-0.5 truncate uppercase tracking-wider">{w.role}</p>
                          <p className="text-[8.5px] text-slate-400 mt-0.5 truncate">{w.department}</p>
                        </div>
                      </div>
                      
                      {/* Workload Gauge */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wide">
                          <span>Khối lượng công việc:</span>
                          <span className={`${w.workload > 80 ? 'text-rose-600' : w.workload > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {w.workload}% ({workloadText})
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${workloadColor} transition-all duration-500`} style={{ width: `${w.workload}%` }}></div>
                        </div>
                      </div>
                      
                      {/* Skills list */}
                      <div className="flex flex-wrap gap-1">
                        {w.skills.filter(s => !s.includes('_')).map(s => (
                          <span key={s} className="text-[8px] bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                      
                      {/* Rating and Cost footer */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[8px] text-slate-500">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          ★ <span className="text-slate-700">{w.performanceHistory}</span>
                        </span>
                        <span className="font-semibold text-slate-700">Chi phí: ${w.hourlyCost}/h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {/* SECTION 1: CORE EXECUTIVE TEAM */}
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-[10px] text-slate-400 uppercase tracking-wider px-1">
                    Ban Điều Hành Trung Ương
                  </h3>
                  {coreAgents.map(ai => {
                    const isRealApi = (ai.id === 'gpt4' && hasOpenAI) || (ai.id === 'claude' && hasClaude) || (ai.id === 'gemini' && hasGemini) || (ai.id === 'hermes' && hasFacebook);
                    const statusLabel = ai.id === 'human_ceo' 
                      ? 'Quyền hạn Lãnh đạo' 
                      : ai.id === 'coo' 
                      ? 'Lõi Nhân Kế hoạch' 
                      : ai.id === 'marketing_manager'
                      ? 'Đang chạy Phân tích'
                      : ai.id === 'assistant'
                      ? (isProcessing ? 'Đang soạn Báo cáo' : 'Trợ lý sẵn sàng')
                      : isRealApi 
                      ? 'Real API Connect' 
                      : 'Mô phỏng Sẵn sàng';

                    return (
                      <div 
                        key={ai.id} 
                        className={`executive-card p-3.5 rounded-xl flex items-start gap-3.5 relative overflow-hidden ${
                          ai.id === 'human_ceo' 
                            ? 'luxury-border-glow bg-gradient-to-r from-amber-500/5 to-yellow-500/5' 
                            : ai.id === 'coo'
                            ? 'border-indigo-200/60 bg-indigo-50/5'
                            : ''
                        }`}
                      >
                        <div className={`w-9.5 h-9.5 rounded-xl bg-gradient-to-tr ${ai.color} flex items-center justify-center text-lg shadow-sm shrink-0`}>
                          {ai.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs text-slate-800">{ai.name}</h3>
                            <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              ai.id === 'human_ceo'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                                : 'bg-slate-100 text-slate-650 border border-slate-200/50'
                            }`}>{ai.type}</span>
                          </div>
                          <p className="text-[9px] text-amber-700 font-semibold mt-0.5 uppercase tracking-wide truncate">{ai.role}</p>
                          <p className="text-[9px] text-slate-500 mt-1 leading-snug">{ai.capability}</p>
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[8px]">
                            <span className="flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                              <span className="text-emerald-700 font-semibold uppercase tracking-wider">{statusLabel}</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgentForConfig(ai);
                                setIsAgentConfigModalOpen(true);
                              }}
                              className="text-[9px] bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-2xs"
                            >
                              <Settings className="w-2.5 h-2.5 animate-spin-hover" /> Cấu hình
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
                    <summary className="flex items-center justify-between p-2.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider cursor-pointer list-none select-none hover:text-slate-650 hover:bg-slate-50 transition-colors">
                      <span>Registry Pool ({operationalAgents.length - activeAgents.length} Idle)</span>
                      <span className="transition-transform group-open:rotate-180 text-[7px]">▼</span>
                    </summary>
                    <div className="p-2 border-t border-slate-100 space-y-1.5 bg-white max-h-48 overflow-y-auto">
                      {operationalAgents.filter(ai => !activeAgents.includes(ai)).map(ai => (
                        <div key={ai.id} className="flex items-center justify-between p-1.5 rounded bg-slate-50/70 border border-slate-100 text-[9px] hover:bg-slate-50 hover:border-slate-200 transition-all">
                          <span className="flex items-center gap-1.5 text-slate-650">
                            <span>{ai.avatar}</span>
                            <span className="font-semibold truncate max-w-[130px]">{ai.name}</span>
                          </span>
                          <span className="text-[7px] bg-slate-150 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">IDLE</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: INTERACTIVE GOAL TOPOLOGY & INPUTS */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#f4f5f7]/60">
          
          {/* TOPOLOGY VIEWPORT */}
          <div className="flex-1 p-5 flex flex-col relative overflow-hidden">
            {/* Simulated interactive graph topology */}
            <div className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 flex flex-col relative overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.01)]">
              {/* Topology Title Header */}
              <div className="px-5 py-3 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] tracking-[0.12em] text-slate-500 font-bold uppercase font-display">SƠ ĐỒ TRUY HỒI & THỰC THI QUYẾT SÁCH • DECISION & GOAL TOPOLOGY</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.025),transparent)] pointer-events-none"></div>
                
                {/* Dynamic node link tree display */}
                {isProcessing || activeStep >= 0 ? (
                  <div className="flex flex-col items-center gap-5.5 w-full max-w-3xl mx-auto z-10 transition-all duration-500 pb-8">
                  {/* Root Objective Node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="bg-[#faf9f5] px-6 py-4 rounded-xl text-center border luxury-border-glow max-w-md shadow-sm">
                      <p className="text-[8.5px] text-amber-700 tracking-[0.2em] font-bold uppercase font-display">Ý Chí Chiến Lược (Root Strategic Intent)</p>
                      <p className="text-slate-800 mt-2 font-display font-semibold text-xs leading-relaxed">"{objective}"</p>
                    </div>
                  </div>

                  {/* Visual Step-by-Step Execution Tracker */}
                  <div className="w-full max-w-2xl bg-white/95 border border-slate-200/80 rounded-xl p-4.5 shadow-xs text-xs space-y-3.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-display">Lộ Trình Thực Thi Chỉ Thị (Step-by-Step Pathway)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px]">
                      {[
                        { step: 0, name: '1. Phân Tích Chỉ Chỉ' },
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
                            className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all duration-300 ${
                              isActive
                                ? 'bg-amber-50/40 border-amber-400/80 text-amber-900 font-bold ring-2 ring-amber-200/20 shadow-2xs'
                                : isPast
                                ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-amber-500 animate-ping' : isPast ? 'bg-emerald-500' : 'bg-slate-300'
                            }`} />
                            <span className="truncate font-medium">{s.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flow links */}
                  <div className="w-0.5 h-4 bg-gradient-to-b from-amber-400/50 to-indigo-400/50 shrink-0"></div>

                  {/* Goal Completion Audit Bar (when available) */}
                  {dynamicTasks.length > 0 && (
                    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 shrink-0">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 font-display uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 animate-pulse" />
                          Tiến Độ Chiến Dịch Hệ Điều Hành EWOS
                        </span>
                        <span className="font-mono text-indigo-650 text-indigo-650 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 font-bold">
                          {verificationReport?.completionPercentage || Math.round((dynamicTasks.filter(t => t.status === 'COMPLETED').length / dynamicTasks.length) * 100)}% Hoàn thành
                        </span>
                      </div>
                      
                      {/* Overall Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-105 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000"
                          style={{ width: `${verificationReport?.completionPercentage || Math.round((dynamicTasks.filter(t => t.status === 'COMPLETED').length / dynamicTasks.length) * 100)}%` }}
                        />
                      </div>
                      
                      {/* Sub-progress grid for AI and Human workforces */}
                      <div className="grid grid-cols-2 gap-4 pt-1 text-[10px] text-slate-500">
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="flex items-center gap-1">🤖 AI Tasks:</span>
                            <span className="text-indigo-600 font-bold">{aiProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${aiProgress}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="flex items-center gap-1">👥 Human Tasks:</span>
                            <span className="text-cyan-600 font-bold">{humanProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-700" style={{ width: `${humanProgress}%` }} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Workload Status Indicators */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[9px] font-bold text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-50 border px-1.5 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Đang chạy: {dynamicTasks.filter(t => t.status === 'RUNNING').length}
                        </span>
                        <span className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          Bị Tắc (Blocked): {dynamicTasks.filter(t => t.status === 'BLOCKED').length}
                        </span>
                        <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Chờ Duyệt: {dynamicTasks.filter(t => t.status === 'AWAITING_APPROVAL' || t.status === 'PENDING_APPROVAL').length}
                        </span>
                        <span className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Lên lịch: {dynamicTasks.filter(t => t.status === 'PENDING' || t.status === 'SCHEDULED').length}
                        </span>
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
                        {dynamicTasks.some(t => (t.status === 'AWAITING_APPROVAL' || t.meta?.status === 'AWAITING_APPROVAL') && !t.isApproved && t.status !== 'COMPLETED') && (
                          <div className="w-full bg-[#fdfdfd] border luxury-border-glow rounded-2xl p-6 text-left shadow-[0_12px_40px_rgba(212,175,55,0.06)] flex flex-col gap-5 animate-fade-in">
                            <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm shadow-md shrink-0">
                                  👑
                                </div>
                                <div>
                                  <h4 className="font-display font-bold text-xs tracking-wider text-slate-800 uppercase">
                                    Tờ Trình Phê Duyệt Phương Án Thực Thi (Strategic Executive Brief)
                                  </h4>
                                  <p className="text-[9px] text-slate-400 font-medium">Phát hành bởi CMO AI & COO Orchestrator thông qua Context Contract (ECC)</p>
                                </div>
                              </div>
                              <span className="text-[8px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/60 font-bold uppercase tracking-wider">Đang chờ Quyết sách</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-650">
                              <div className="space-y-2">
                                <div>
                                  <span className="font-bold text-slate-800 uppercase text-[8px] tracking-wider block">1. Ý chí Lãnh đạo (Core Intent):</span>
                                  <p className="text-slate-600 italic mt-0.5">"{objective}"</p>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 uppercase text-[8px] tracking-wider block">2. Đánh giá Chính sách (Governance & Policy Check):</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-bold border border-emerald-200/50">Hạn mức Ngân sách: PASS (Policy Guard)</span>
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[8px] font-bold border border-indigo-200/50">Bảo mật dữ liệu: SECURE</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/65 pt-2.5 md:pt-0 md:pl-4">
                                <div>
                                  <span className="font-bold text-slate-800 uppercase text-[8px] tracking-wider block">3. Các Kịch Bản Đã Mô Phỏng (Alternatives Evaluated):</span>
                                  <ul className="mt-1 space-y-1 text-[9.5px]">
                                    <li className="flex items-center justify-between text-slate-800 font-medium">
                                      <span>• Phương án Alpha (Tập trung phễu Lead Spa)</span>
                                      <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded text-[8px]">96% Khả thi</span>
                                    </li>
                                    <li className="flex items-center justify-between text-slate-400">
                                      <span>• Phương án Beta (Phân phối diện rộng Facebook)</span>
                                      <span className="text-slate-400 font-bold bg-slate-100 px-1 rounded text-[8px]">74% Rủi ro</span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mt-1">
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Ủy thác thực thi sang trạng thái <strong>Active</strong> và phân bổ 8 AI Workers.</span>
                              </div>
                              <button
                                onClick={() => handleCeoApprove('t1')}
                                className="bg-slate-900 hover:bg-slate-850 text-white hover:text-amber-400 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 shrink-0 border border-slate-800"
                              >
                                <span>👑 Ký Phê Duyệt & Thực Thi Workflow →</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {dynamicTasks.map((t: any, idx: number) => {
                            const isTask1Approved = dynamicTasks.some(item => (item.task_id === 't1' || item.agent_id === 'eos_marketing_manager' || item.task_type === 'analyze_marketing_strategy') && (item.status === 'COMPLETED' || item.isApproved));
                            const isAwaitingApproval = (t.status === 'AWAITING_APPROVAL' || t.meta?.status === 'AWAITING_APPROVAL') && !t.isApproved && t.status !== 'COMPLETED';
                            const isConfigReq = (t.output?.includes('CONFIG_REQUIRED') || t.output?.includes('hết hạn') || t.meta?.status === 'CONFIG_REQUIRED' || t.meta?.isExpired === true) && !isAwaitingApproval;
                            const isDone = (t.success === true || t.status === 'COMPLETED' || t.isApproved) && !isConfigReq && !isAwaitingApproval;
                            const isFailed = (t.status === 'FAILED' || (t.error && t.error.length > 0) || (t.success === false && t.status !== 'PENDING_APPROVAL' && t.status !== 'RUNNING' && t.status !== 'PENDING')) && !isConfigReq && !isAwaitingApproval && !isDone;
                            const isPendingApproval = !isTask1Approved && (t.status === 'PENDING_APPROVAL' || t.meta?.status === 'WAITING_FOR_MARKETING_APPROVAL') && !isConfigReq && !isAwaitingApproval && !isDone && !isFailed;

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

                              {isAwaitingApproval && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCeoApprove(t.task_id || 't1');
                                  }}
                                  className="mt-2.5 w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02] z-10"
                                >
                                  <span>👑 CEO Phê Duyệt Ngay & Chạy Tiếp →</span>
                                </button>
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
                    <div className="glass-panel p-3 rounded-xl border border-indigo-200 flex items-center gap-3 text-left max-w-md shrink-0 w-full">
                      <Zap className="w-4 h-4 text-indigo-500 animate-bounce shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">AI Execution Gateway Output</p>
                        <p className="text-[9px] text-emerald-600 mt-1 font-mono font-bold bg-emerald-50 p-1.5 rounded border border-emerald-100 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                          {lastApiStatus}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-4xl mx-auto z-10 flex flex-col gap-5 pb-6">
                  {/* Executive Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-6 text-white border border-slate-700/50 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(212,175,55,0.08),transparent)] pointer-events-none"></div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                        <Brain className="text-amber-400 w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-base uppercase tracking-wider text-amber-400">Executive Boardroom</h2>
                        <p className="text-xs text-slate-350 mt-1">Hệ điều hành doanh nghiệp Bella EOS đang hoạt động ổn định. Bộ não AI đã sẵn sàng tiếp nhận ý chí định hướng của Lãnh đạo.</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs">
                      <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Chỉ Số Sức Khỏe Doanh Nghiệp</p>
                      <p className="text-xl font-bold text-slate-900 mt-1 font-display">96%</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[9px] text-emerald-700 font-bold uppercase">Tối Ưu (Optimal)</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs">
                      <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Lực Lượng AI Nhân Sự</p>
                      <p className="text-xl font-bold text-slate-900 mt-1 font-display">4 Hoạt động</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span className="text-[9px] text-slate-500 font-medium">3 Nhân viên rỗi</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs">
                      <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Ngân Sách Tổng Thể</p>
                      <p className="text-xl font-bold text-slate-900 mt-1 font-display">62% Đã Chi</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span className="text-[9px] text-indigo-700 font-bold">310M / 500M VND</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs">
                      <p className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Rủi Ro Chính Sách (Risk Alert)</p>
                      <p className="text-xl font-bold text-slate-900 mt-1 font-display">0 Phát hiện</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[9px] text-emerald-700 font-bold uppercase">An Toàn</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Panels Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Active Approvals Queue */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs text-left">
                      <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3.5 mb-3.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>DANH SÁCH DUYỆT KHẨN CẤP (APPROVAL QUEUE)</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                          <div>
                            <p className="font-semibold text-slate-800">Chiến dịch Mkt Spa Q3</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Yêu cầu bởi: <span className="font-semibold">CMO AI</span> | Ngân sách: <span className="font-semibold text-slate-700">48M VND</span></p>
                          </div>
                          <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-1 rounded uppercase shrink-0">Chờ duyệt</span>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-2">Không còn phê duyệt nào khác đang chờ xử lý.</p>
                      </div>
                    </div>

                    {/* Policy Compliance Summary */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs text-left">
                      <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3.5 mb-3.5">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>QUY CHẾ DOANH NGHIỆP (COMPLIANCE AUDIT)</span>
                      </h3>
                      <div className="space-y-3.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                          <span>Chính sách ngân sách: <strong>Ngưỡng duyệt CEO {'>'} 30 triệu VND</strong> đang hoạt động.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                          <span>Chính sách nhân sự: <strong>Quy tắc phân vai vai trò quyết định</strong> đang hoạt động.</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                          <span>Chính sách an toàn dữ liệu: <strong>Mã hóa đầu ra Sandbox</strong> đang hoạt động.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Instructions Tip */}
                  <div className="bg-amber-50/30 border border-amber-200/60 rounded-xl p-4.5 text-xs text-amber-800 text-left">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Hướng dẫn vận hành nhanh:</span>
                    </p>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      Để kích hoạt luồng tự động, CEO hãy viết một mệnh lệnh định hướng kinh doanh ở bảng console phía dưới (Ví dụ: <em>"Tháng 8 tôi muốn tăng doanh thu Spa thêm 20% với ngân sách 50 triệu và không làm giảm lợi nhuận dưới 30%"</em>) rồi nhấn <strong>Phân rã Kế hoạch</strong>.
                    </p>
                  </div>
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
                  onFocus={(e) => e.target.select()}
                  placeholder="Ví dụ: Tăng 20% Spa demo trong 30 ngày với ngân sách 50 triệu..."
                  className="w-full h-12 bg-slate-50 border border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:outline-none rounded-xl pl-11 pr-10 text-xs font-sans text-slate-800 placeholder-slate-400 shadow-inner transition-colors"
                />
                <Sparkles className="w-4 h-4 text-indigo-500 absolute left-4 top-4" />
                {objective && (
                  <button
                    type="button"
                    onClick={() => {
                      setObjective('');
                      CampaignExecutionManager.updateState({ objective: '' });
                    }}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-200/60 hover:bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    title="Xóa lệnh hiện tại"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-5 h-12 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
              >
                <span>{isProcessing ? '⚡ Đang Phân Rã & Thực Thi...' : 'Phân rã Kế hoạch (AI)'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </main>

        {/* RIGHT COLUMN: INGESTION & TELEMETRY STREAM */}
        <aside className="w-80 border-l border-slate-200 bg-white/60 backdrop-blur-md flex flex-col shrink-0">
          
          {/* Tab control headers */}
          <div className="flex border-b border-slate-200 text-[9px] font-semibold uppercase tracking-wider">
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
            <button 
              onClick={() => setActiveTab('control')}
              className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'control' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
            >
              Giám Sát (DoD)
            </button>
          </div>

          {/* TAB UPLOAD & BRAND DNA */}
          {activeTab === 'timeline' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* BRAND DNA */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>RÀNG BUỘC PHONG CÁCH & DNA DOANH NGHIỆP</span>
                </h3>
                <div className="mt-3.5 space-y-3.5 text-[10px] text-slate-500">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-400">Giọng điệu thương hiệu (Voice Tone):</span>
                    <input
                      type="text"
                      value={dnaState.tone}
                      onChange={(e) => handleDnaChange('tone', e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-400">Phong cách hiển thị (UI Style Class):</span>
                    <input
                      type="text"
                      value={dnaState.style}
                      onChange={(e) => handleDnaChange('style', e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-400">Khách hàng kích hoạt (Active TMVs):</span>
                    <input
                      type="number"
                      value={activeCustomerCount || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setActiveCustomerCount(val);
                        CampaignExecutionManager.updateState({ activeCustomerCount: val });
                      }}
                      placeholder="Ví dụ: 120 (Mặc định: 0)"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-400">Lượt tiếp cận 24h (24h FB Reach):</span>
                    <input
                      type="number"
                      value={fbReachCount || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFbReachCount(val);
                        CampaignExecutionManager.updateState({ fbReachCount: val });
                      }}
                      placeholder="Ví dụ: 5000 (Mặc định: 0)"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* UPLOAD ZONE */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 mb-3">
                  <UploadCloud className="w-3.5 h-3.5 text-slate-700" />
                  <span>NẠP TÀI LIỆU TRÍ THỨC (INGESTION)</span>
                </h3>
                
                <label 
                  className="border border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-100/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group relative"
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
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-all mb-2" />
                  <span className="text-[10px] font-semibold text-slate-700 text-center">Kéo & thả tài liệu hoặc nhấp để tải</span>
                  <span className="text-[8px] text-slate-450 mt-1">Hỗ trợ PDF, Word, TXT, CSV, MD</span>
                </label>
              </div>

              {/* INGESTED DOCUMENTS */}
              <div className="space-y-2.5">
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 px-1">Danh sách tài liệu đã index</p>
                {documents.map((doc, idx) => (
                  <div key={idx} className="executive-card p-3 rounded-xl border border-slate-200 text-[10px] bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate pr-2 max-w-[150px]">{doc.name}</span>
                      <span className="text-[8px] bg-slate-100 border border-slate-200/60 px-1.5 rounded text-slate-500">{doc.size}</span>
                    </div>
                    <p className="text-slate-500 mt-1.5 italic text-[9px] line-clamp-2 leading-relaxed">{doc.rule}</p>
                    
                    {doc.status === 'PROCESSING' && (
                      <span className="text-[8px] text-amber-700 flex items-center gap-1 mt-2.5 animate-pulse font-semibold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> Đang nạp tri thức...
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

          {/* TAB OPERATIONAL CONTROL */}
          {activeTab === 'control' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Health Score & High-level Status */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>SỨC KHỎE HỆ THỐNG (SYSTEM HEALTH)</span>
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[28px] font-bold text-slate-900 font-display">96%</span>
                    <span className="text-[10px] text-emerald-600 font-bold ml-1.5 uppercase">Tối Ưu (Optimal)</span>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                    <div>Độ trễ trung bình: <strong className="text-slate-800">285ms</strong></div>
                    <div>Tỷ lệ đáp ứng SLA: <strong className="text-slate-800">100%</strong></div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-500 h-full w-[96%] rounded-full animate-pulse-glow"></div>
                </div>
              </div>

              {/* Dynamic Engine Health Scores Grid */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                  <span>CHỈ SỐ SỨC KHỎE TỪNG ENGINE</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { name: 'Intent Engine', score: 98, status: 'Online' },
                    { name: 'Goal Engine', score: 97, status: 'Online' },
                    { name: 'Decision Engine', score: 96, status: 'Online' },
                    { name: 'Policy Engine', score: 99, status: 'Online' },
                    { name: 'Approval Engine', score: 95, status: 'Online' },
                    { name: 'Workflow Engine', score: 99, status: 'Online' }
                  ].map((eng, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-150 flex flex-col gap-1">
                      <span className="font-semibold text-slate-700">{eng.name}</span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">{eng.score}%</span>
                        <span className="text-[7.5px] bg-emerald-50 text-emerald-700 font-bold px-1 py-0.5 rounded border border-emerald-200 uppercase">{eng.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Risk Heatmap */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>BẢN ĐỒ RỦI RO CHÍNH SÁCH (RISK HEATMAP)</span>
                </h3>
                <div className="space-y-2.5 text-[10px]">
                  {[
                    { type: 'Rủi ro Tài chính (Financial)', level: '45% (Trung bình)', color: 'bg-amber-500', width: 'w-[45%]' },
                    { type: 'Rủi ro Pháp lý (Compliance)', level: '10% (Thấp)', color: 'bg-emerald-500', width: 'w-[10%]' },
                    { type: 'Rủi ro Bảo mật (Privacy)', level: '0% (An toàn)', color: 'bg-emerald-500', width: 'w-[2%]' },
                    { type: 'Rủi ro Hệ thống (Security)', level: '15% (Thấp)', color: 'bg-emerald-500', width: 'w-[15%]' }
                  ].map((risk, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-slate-650">
                        <span>{risk.type}</span>
                        <span className="font-semibold text-slate-800">{risk.level}</span>
                      </div>
                      <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                        <div className={`${risk.color} h-full ${risk.width} rounded-full`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval SLA Monitor */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>GIÁM SÁT KÝ DUYỆT (SLA MONITOR)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[14px] font-bold text-slate-900 font-display">25 phút</div>
                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Thời gian ký duyệt TB</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[14px] font-bold text-slate-900 font-display">2.4%</div>
                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Tỷ lệ Chuyển cấp (Escalation)</div>
                  </div>
                </div>
              </div>

              {/* Learning Gain & SOP Mutations */}
              <div className="executive-card p-4 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>ROI GAIN (ĐỘT BIẾN SOP)</span>
                </h3>
                <div className="mt-2 text-[10px] text-slate-500 leading-relaxed">
                  <div className="flex justify-between items-center bg-amber-50/50 p-2 rounded-lg border border-amber-100 text-amber-900 mb-2">
                    <span className="font-semibold">Mức tăng hiệu quả (Gain):</span>
                    <span className="font-bold text-xs">+6.5% ROI</span>
                  </div>
                  <p>Hệ thống tự động học từ phản hồi và tinh chỉnh trọng số kênh quảng cáo (Ưu tiên ngân sách Google Ads tối đa hiệu suất chuyển đổi).</p>
                </div>
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
              {/* Approval Banner inside modal */}
              {(selectedTask.status === 'AWAITING_APPROVAL' || selectedTask.meta?.status === 'AWAITING_APPROVAL') && !selectedTask.isApproved && selectedTask.status !== 'COMPLETED' && (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-amber-400/60 rounded-2xl p-4 text-left shadow-lg flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                      👑
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                        THẨM ĐỊNH EXECUTIVE: YÊU CẦU CEO PHÊ DUYỆT BẢN KẾ HOẠCH MARKETING
                      </h4>
                      <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                        Bấm phê duyệt để cho phép các AI Agent chạy tiếp các bước soạn bài, thiết kế banner và xuất bản.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCeoApprove(selectedTask.task_id || 't1')}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 shrink-0"
                  >
                    <span>👑 CEO Phê Duyệt Ngay & Chạy Tiếp →</span>
                  </button>
                </div>
              )}
              
              {/* Status Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                selectedTask.status === 'COMPLETED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : selectedTask.status === 'BLOCKED'
                  ? 'bg-red-50 border-red-200 text-red-800 animate-pulse'
                  : selectedTask.status === 'AWAITING_APPROVAL' || selectedTask.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-50 border-amber-200 text-amber-850'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Trạng Thái: {
                    selectedTask.status === 'COMPLETED'
                      ? 'HOÀN THÀNH THÀNH CÔNG (SUCCESS)'
                      : selectedTask.status === 'BLOCKED'
                      ? 'BỊ TẮC NGHẼN (BLOCKED / SLA BREACH)'
                      : selectedTask.status === 'AWAITING_APPROVAL' || selectedTask.status === 'PENDING_APPROVAL'
                      ? 'ĐANG CHỜ CEO PHÊ DUYỆT (AWAITING APPROVAL)'
                      : 'ĐANG THỰC THI (IN PROGRESS / ACTIVE)'
                  }</span>
                </div>
                <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded border border-slate-200 uppercase font-bold text-indigo-600">
                  Phân loại: {selectedTask.assignee_type || 'AI'}
                </span>
              </div>

              {/* Dynamic Task Routing: Assignee selection & reassignment */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" /> Điều Phối Ủy Quyền Nhân Lực (Workforce Assignment)
                  </h4>
                  <button 
                    onClick={() => setIsReassignmentOpen(!isReassignmentOpen)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-500 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔄 {isReassignmentOpen ? 'Đóng cấu hình' : 'Thay đổi phân bổ'}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Người thực thi hiện tại:</span>
                    <span className="font-bold text-slate-800 bg-white border px-2 py-1 rounded shadow-2xs flex items-center gap-1">
                      <span>{selectedTask.assignee_type === 'Human' ? '👥' : '🤖'}</span>
                      {selectedTask.agent_name || selectedTask.agent_id}
                    </span>
                  </div>
                </div>

                {isReassignmentOpen && (
                  <div className="pt-2 border-t border-slate-150 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">Chọn Nhân Sự Hoặc AI Agent Để Gán Lại:</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {/* AI Agent Selection options */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-655 text-slate-500 block">🤖 AI Workforce Pools:</span>
                        {[
                          { id: 'eos_content_worker', name: 'AI Content Worker' },
                          { id: 'eos_creative_worker', name: 'AI Creative Worker' },
                          { id: 'hermes_social', name: 'Hermes Social Publisher' },
                          { id: 'ares_ads', name: 'Ares Ads Agent' }
                        ].map(ai => (
                          <button
                            key={ai.id}
                            onClick={() => {
                              CampaignExecutionManager.reassignTask(selectedTask.task_id, ai.id, 'AI');
                              const fresh = CampaignExecutionManager.getState().dynamicTasks.find(t => t.task_id === selectedTask.task_id);
                              if (fresh) setSelectedTask(fresh);
                              setIsReassignmentOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded border transition-colors cursor-pointer ${selectedTask.assigned_to === ai.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
                          >
                            • {ai.name}
                          </button>
                        ))}
                      </div>

                      {/* Human Workforce options */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-555 text-slate-500 block">👥 Nhân Sự (Human Workers):</span>
                        {humanWorkers.map(hw => (
                          <button
                            key={hw.id}
                            onClick={() => {
                              CampaignExecutionManager.reassignTask(selectedTask.task_id, hw.id, 'Human');
                              const fresh = CampaignExecutionManager.getState().dynamicTasks.find(t => t.task_id === selectedTask.task_id);
                              if (fresh) setSelectedTask(fresh);
                              setIsReassignmentOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded border transition-colors cursor-pointer ${selectedTask.assigned_to === hw.id ? 'bg-cyan-50 border-cyan-300 text-cyan-700 font-bold' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
                          >
                            • {hw.name} ({hw.role})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Description */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô Tả Công Việc (Task Description)</h4>
                <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedTask.task_description}
                </p>
              </div>

              {/* Input Payload */}
              {selectedTask.input && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Context & Đầu Vào (Input Payload)</h4>
                  <pre className="text-[10px] font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto max-h-28 border border-slate-800">
                    {JSON.stringify(selectedTask.input, null, 2)}
                  </pre>
                </div>
              )}

              {/* Execution Output with Dual Tabs: Executive Report vs EIC Contract */}
              <div>
                <div className="flex border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider mb-3">
                  <button
                    onClick={() => setActiveDetailTab('report')}
                    className={`flex-1 pb-2 text-center border-b-2 transition ${activeDetailTab === 'report' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    Bản Báo Cáo Lãnh Đạo (Report)
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('contract')}
                    className={`flex-1 pb-2 text-center border-b-2 transition ${activeDetailTab === 'contract' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    Hợp Đồng Trí Tuệ (EIC & DAG)
                  </button>
                </div>

                {activeDetailTab === 'report' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Kết Quả / Sản Phẩm Thực Tế (Execution Output)
                      </h4>
                      {selectedTask.output && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTask.output);
                            setCopiedOutput(true);
                            setTimeout(() => setCopiedOutput(false), 2000);
                          }}
                          className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedOutput ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedOutput ? 'Đã Sao Chép!' : 'Sao Chép'}
                        </button>
                      )}
                    </div>
                    <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-64 overflow-y-auto">
                      {selectedTask.output || selectedTask.error || 'Đang chờ cập nhật sản phẩm thực thi.'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Policy Engine Gate Status */}
                    <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">🛡️ Policy Engine Gate Audit</span>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          PASS: ALL POLICIES COMPLIANT
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Hợp đồng EIC và ngân sách chiến dịch đã được thông qua bởi Policy Engine tự động mà không phát hiện vi phạm bảo mật dữ liệu PII hay ngân sách.
                      </p>
                    </div>

                    {/* Shared Reasoning DAG Nodes */}
                    <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">🧠 Shared Reasoning DAG Nodes</span>
                      <div className="space-y-2">
                        {[
                          { id: 'GOAL', type: 'GOAL', label: 'Chỉ thị CEO', outcome: objective || 'Tăng doanh thu Spa', confidence: 100, deps: [] },
                          { id: 'DIAGNOSIS', type: 'METRIC', label: 'Đánh giá số liệu ECC', outcome: activeCustomerCount > 0 ? `CRM: ${activeCustomerCount} khách hàng hoạt động.` : 'Chế độ giả lập do thiếu số liệu', confidence: activeCustomerCount > 0 ? 94 : 25, deps: ['GOAL'] },
                          { id: 'LEAKAGE', type: 'LEAKAGE', label: 'Dự báo Funnel Leakage', outcome: (objective.toLowerCase().includes('300%') || objective.toLowerCase().includes('gấp 3')) ? 'Nghẽn công suất KTV Spa' : 'Tỷ lệ chốt Sales yếu', confidence: activeCustomerCount > 0 ? 90 : 35, deps: ['DIAGNOSIS'] },
                          { id: 'DECISION', type: 'DECISION', label: 'Đề xuất Quyết định', outcome: (objective.toLowerCase().includes('300%') || objective.toLowerCase().includes('gấp 3')) ? 'Kiến nghị bẻ mục tiêu xuống 30% trong 60 ngày' : 'Retention & referral tối ưu CRM', confidence: activeCustomerCount > 0 ? 95 : 45, deps: ['LEAKAGE'] }
                        ].map(node => (
                          <div key={node.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
                            <span className={`text-[8px] font-bold text-white px-1.5 py-0.5 rounded shrink-0 uppercase mt-0.5 ${node.type === 'GOAL' ? 'bg-amber-500' : node.type === 'METRIC' ? 'bg-cyan-500' : node.type === 'LEAKAGE' ? 'bg-red-500' : 'bg-indigo-500'}`}>
                              {node.id}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between text-[9px] font-bold">
                                <span className="text-slate-800">{node.label}</span>
                                <span className="text-indigo-600">Độ tự tin: {node.confidence}%</span>
                              </div>
                              <p className="text-[10px] text-slate-600 mt-0.5 font-medium truncate">{node.outcome}</p>
                              {node.deps.length > 0 && (
                                <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">dependsOn: [{node.deps.join(', ')}]</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contract Registry Audit Trail */}
                    <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">📜 Contract Registry History (Audit Trail)</span>
                      <div className="space-y-1.5 font-mono text-[9px] text-slate-600 max-h-32 overflow-y-auto">
                        <div>[v1] [REGISTERED] - Đăng ký Enterprise Context Contract (ECC) cho chỉ thị CEO Goal.</div>
                        <div>[v1] [REGISTERED] - CMO AI phát hành Executive Intelligence Contract (EIC) bản nháp.</div>
                        <div>[v1] [STATUS_CHANGED] - Trạng thái EIC chuyển sang {(objective.toLowerCase().includes('300%') || objective.toLowerCase().includes('gấp 3')) ? 'BOARD_REVIEW (Phản biện CEO)' : 'APPROVED (Ký duyệt)'}.</div>
                        <div>[v1] [MUTATED] - Phân rã 3 Task Execution Contracts (TEC) xuống Creative, Copywriter và Hermes.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Interactive Human Worker Actions (When assigned to a human) */}
              {selectedTask.assignee_type === 'Human' && (
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    👑 Bảng Điều Khiển Nhân Sự (Human Workforce Controls)
                  </h4>
                  <p className="text-[10px] text-amber-700">
                    Mô phỏng các trạng thái vận hành của con người trong hệ thống như trễ hạn SLA hoặc tự động thu hoạch & đóng gói kinh nghiệm thành AI SOP Skill Pack:
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        CampaignExecutionManager.packageHumanSopIntoSkillPack(selectedTask.task_id);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] py-2 px-3 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Đóng gói SOP thành AI Skill Pack</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        CampaignExecutionManager.triggerSlaBreachSimulation(selectedTask.task_id);
                        setTimeout(() => {
                          const fresh = CampaignExecutionManager.getState().dynamicTasks.find(t => t.task_id === selectedTask.task_id);
                          if (fresh) setSelectedTask(fresh);
                        }, 2000);
                      }}
                      className="flex-1 bg-rose-50 border border-rose-250 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 font-bold text-[10px] py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Mô phỏng trễ hạn (SLA Breach)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Collaboration & Comments log section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Kênh Thảo Luận Đồng Kiến Tạo (Human-AI Collaboration Log)
                </h4>
                
                {/* Comments List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {collaborationLogs.filter(c => c.taskId === selectedTask.task_id).length === 0 ? (
                    <div className="text-center py-4 text-slate-400 italic text-[11px]">
                      Chưa có trao đổi trong công việc này. Nhập tin nhắn phía dưới để gửi chỉ đạo.
                    </div>
                  ) : (
                    collaborationLogs
                      .filter(c => c.taskId === selectedTask.task_id)
                      .map((c, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className={`px-1.5 py-0.5 rounded ${c.author === 'CEO' ? 'bg-amber-100 text-amber-800' : c.author === 'System' ? 'bg-slate-200 text-slate-700' : 'bg-indigo-50 text-indigo-700'}`}>
                              {c.author}
                            </span>
                            <span className="text-slate-400 font-mono font-medium">{c.time}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-medium">{c.message}</p>
                          {c.attachment && (
                            <div className="mt-1 flex items-center justify-between text-[9px] bg-white border rounded-lg p-2 shadow-3xs">
                              <span className="text-slate-600 flex items-center gap-1">
                                📎 {c.attachment.name}
                              </span>
                              <a href={c.attachment.url} target="_blank" className="text-indigo-600 hover:underline font-bold">
                                Xem bản thảo thiết kế →
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>

                {/* Comment Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={selectedTaskComment}
                    onChange={(e) => setSelectedTaskComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && selectedTaskComment.trim()) {
                        CampaignExecutionManager.addCollaborationLog(selectedTask.task_id, 'CEO', selectedTaskComment);
                        setSelectedTaskComment('');
                      }
                    }}
                    placeholder="Gửi tin chỉ đạo chiến dịch hoặc yêu cầu sửa đổi..."
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => {
                      if (!selectedTaskComment.trim()) return;
                      CampaignExecutionManager.addCollaborationLog(selectedTask.task_id, 'CEO', selectedTaskComment);
                      setSelectedTaskComment('');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* CEO Evaluation & Feedback Section */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 text-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    👑 CEO PHẢN HỒI ĐÁNH GIÁ & TỰ ĐỘNG ĐỘT BIẾN SOP
                  </h4>
                  <span className="text-[9px] text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50 font-bold uppercase tracking-wider font-mono">
                    Continuous Learning
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Đánh giá kết quả thực thi và chất lượng sản phẩm để hệ thống tự động ghi nhận bài học kinh nghiệm, nâng cấp quy trình làm việc DNA:
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
                  placeholder="Nhập nhận xét của CEO (ví dụ: 'Yêu cầu viết banner ngắn hơn', 'Nội dung làm nổi bật khuyến mãi', 'Cần banner sạch hơn')..."
                  className="w-full text-xs bg-slate-950/80 border border-indigo-800/60 rounded-xl p-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 min-h-[60px]"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {feedbackSubmitted ? '✅ Đã ghi nhận bài học! AI Workforce sẽ tự động áp dụng để cải tiến SOP.' : 'Tri thức sẽ tự động lưu vào bộ nhớ hệ thống'}
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
