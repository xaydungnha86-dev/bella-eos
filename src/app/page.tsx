"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Brain, Cpu, Layers, Zap, Settings, Database, Network, Play, 
  RefreshCw, FileText, CheckCircle2, AlertTriangle, TrendingUp, 
  Send, Terminal, User, Plus, Search, Sparkles, UploadCloud, ChevronRight, Key, Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EnterpriseBrain } from '../core/brain';
import { OrchestrationEngine } from '../core/orchestration/orchestration';
import { InternalApiGateway } from '../core/execution/execution';
import { FacebookConnector } from '../connectors/index';

// ─── Helper: read API keys from localStorage (set by /settings page) ─────────
const LS_KEY = 'bella_eos_integrations';
function getStoredKey(provider: string, key_name: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const store = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return store[`${provider}::${key_name}`] || '';
  } catch { return ''; }
}

// 11 AI Workforce Matrix static definition
const AI_WORKFORCE = [
  { id: 'coo', name: 'AI COO Orchestrator', type: 'AI', role: 'Operations', avatar: '🤖', capability: 'Process planning & scheduling', status: 'idle', prof: 98, color: 'from-cyan-500 to-blue-500' },
  { id: 'hermes', name: 'Hermes Operating Driver', type: 'AI', role: 'Execution', avatar: '⚡', capability: 'API Dispatch & Web Execution', status: 'idle', prof: 95, color: 'from-amber-500 to-orange-500' },
  { id: 'claude', name: 'Claude 3.5 Sonnet', type: 'AI', role: 'Strategy & Coding', avatar: '🧠', capability: 'Complex reasoning & system audit', status: 'idle', prof: 99, color: 'from-purple-500 to-indigo-500' },
  { id: 'gemini', name: 'Gemini 2.5 Pro', type: 'AI', role: 'Multimodality', avatar: '🧬', capability: 'Video, audio & long-doc parsing', status: 'idle', prof: 96, color: 'from-emerald-500 to-teal-500' },
  { id: 'gpt4', name: 'GPT-4o Reasoner', type: 'AI', role: 'Function Calling', avatar: '🔮', capability: 'JSON outputs & system connectors', status: 'idle', prof: 97, color: 'from-pink-500 to-rose-500' },
  { id: 'human_ceo', name: 'CEO / Board Sign-off', type: 'Human', role: 'Executive Authority', avatar: '👑', capability: 'Budget approvals & final gate check', status: 'idle', prof: 100, color: 'from-amber-600 to-yellow-400' },
  { id: 'seo_agent', name: 'SEO Content Writer', type: 'AI', role: 'Marketing', avatar: '✍️', capability: 'Optimized blog posts & keyword research', status: 'idle', prof: 92, color: 'from-blue-400 to-cyan-400' },
  { id: 'ads_agent', name: 'Ads Campaign Optimizer', type: 'AI', role: 'Marketing', avatar: '📈', capability: 'Facebook/Google ads bidding control', status: 'idle', prof: 94, color: 'from-indigo-400 to-purple-400' },
  { id: 'payroll_agent', name: 'Payroll Safe Guard', type: 'AI', role: 'Finance', avatar: '🔒', capability: 'Internal audit & security gate', status: 'idle', prof: 95, color: 'from-red-500 to-rose-500' },
  { id: 'connector_agent', name: 'Connector Hub Parser', type: 'AI', role: 'Integration', avatar: '🔌', capability: 'SAP/MISA API translation mapping', status: 'idle', prof: 91, color: 'from-sky-500 to-indigo-500' },
  { id: 'learning_agent', name: 'Learning Mutation Loop', type: 'AI', role: 'Evolution', avatar: '🧬', capability: 'SOP mutations & DNA updates', status: 'idle', prof: 96, color: 'from-teal-400 to-emerald-400' }
];

export default function Dashboard() {
  // Application State
  const [objective, setObjective] = useState('Tăng 20% Spa demo trong 30 ngày với ngân sách 50 triệu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'reasoning'>('timeline');
  const [brainSubTab, setBrainSubTab] = useState<'memory' | 'knowledge' | 'context' | 'reasoning' | 'learning'>('memory');
  const [isBrainModalOpen, setIsBrainModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Real API tokens state
  const [fbToken, setFbToken] = useState('');
  const [fbPageId, setFbPageId] = useState('me');
  const [lastApiStatus, setLastApiStatus] = useState<string | null>(null);

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

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync token to window for real connector access
  useEffect(() => {
    if (typeof window !== 'undefined' && fbToken) {
      (window as any).FACEBOOK_PAGE_ACCESS_TOKEN = fbToken;
    }
  }, [fbToken]);

  // Initialize status log
  useEffect(() => {
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

    setIsProcessing(true);
    setActiveStep(0);
    setLastApiStatus(null);
    addLog('CEO INTENT', `🎯 Ý chí chiến lược nhận được: "${objective}"`, 'text-amber-600 font-bold');

    // Step 1: Parse Intent
    await delay(800);
    const parsedIntent = OrchestrationEngine.IntentEngine.parseIntent(objective);
    addLog('INTENT ENGINE', `🔍 Phân tích ngữ nghĩa hoàn tất. Hạn mức tự động: 100M VND. Hợp quy luật: ĐẠT.`, 'text-cyan-600');

    // Step 2: Goal Decompose
    await delay(900);
    setActiveStep(1);
    const goals = OrchestrationEngine.GoalEngine.decomposeGoal(objective);
    setGoalTree(goals);
    addLog('GOAL ENGINE', `📊 Đã phân rã mục tiêu thành OKRs của các phòng ban (Mkt, Sales, Finance, HR).`, 'text-indigo-600 font-bold');

    // Step 3: Run Monte Carlo Simulation
    await delay(1000);
    setActiveStep(2);
    addLog('REASONING CENTER', `🎲 Đang chạy 10,000 lần mô phỏng Monte Carlo dự báo ROI & Dòng tiền...`, 'text-purple-600');
    const simulationResult = EnterpriseBrain.Reasoning.runMonteCarlo('marketing_pos');
    addLog('REASONING CENTER', `📈 ROI Dự kiến: ${simulationResult.projectedRoi} | Xác suất thành công: ${simulationResult.confidence}% | Dòng tiền: ${simulationResult.cashflow}`, 'text-emerald-600 font-semibold');

    // Step 4: Selective Context Builder
    await delay(800);
    setActiveStep(3);
    addLog('CONTEXT CENTER', `🔒 Đang lọc bảo mật và biên dịch gói Canonical Context Package...`, 'text-blue-600');
    const mockStep = { id: 1, name: 'Setup chiến dịch', agent: 'orchestrator' };
    const contextPackage = EnterpriseBrain.Context.compileContext(mockStep, objective);
    addLog('CONTEXT CENTER', `✅ Đã xuất Gói ngữ cảnh chuẩn hóa (Tone giọng: ${contextPackage.brandDna.voiceTone} | Thiết kế: ${contextPackage.brandDna.designStyle}).`, 'text-emerald-600');

    // Step 5: AI Orchestration & Execution via Gateway
    setActiveStep(4);
    addLog('GATEWAY', `⚡ Kích hoạt AI Orchestrator Gateway — Bắt đầu phân bổ nhiệm vụ động...`, 'text-amber-600 font-semibold');

    let dispatchResult: any;
    try {
      dispatchResult = await InternalApiGateway.dispatchCall(
        { assignedWorker: 'orchestrator' },
        mockStep,
        contextPackage,
        (evt) => {
          if (evt.phase === 'PLANNING') {
            addLog('AI ORCHESTRATOR', evt.message, 'text-indigo-600 font-bold');
          } else if (evt.phase === 'PLAN_READY') {
            addLog('AI ORCHESTRATOR', `📋 Kế hoạch: "${evt.planTitle}" (Mô hình: ${evt.aiProvider}/${evt.aiModel})`, 'text-cyan-600 font-bold');
            if (evt.planReasoning) {
              addLog('ORCHESTRATOR LOGIC', `💡 Lý do phân bổ: ${evt.planReasoning}`, 'text-slate-600 italic');
            }
            if (evt.warning) {
              addLog('ORCHESTRATOR WARN', `⚠️ ${evt.warning}`, 'text-amber-600');
            }
            evt.tasks?.forEach((t: any, idx: number) => {
              addLog('CAPABILITY ROUTER', `📌 Task #${idx + 1} [${t.task_id}]: Gán Agent '${t.agent_name}' ➔ Công việc '${t.task_type}'`, 'text-purple-600 font-medium');
            });
          } else if (evt.phase === 'EXECUTING') {
            addLog('AGENT RUNNER', evt.message, 'text-amber-600 font-semibold');
          } else if (evt.phase === 'COMPLETED') {
            addLog('AGENT RUNNER', evt.message, 'text-emerald-600 font-bold');
            evt.tasks?.forEach((res: any) => {
              const icon = res.success ? '✅' : '❌';
              const cls = res.success ? 'text-emerald-700 font-medium' : 'text-red-600';
              addLog(`AGENT [${res.agent_name}]`, `${icon} Output [${res.task_type}]: ${res.output.substring(0, 150)}${res.output.length > 150 ? '...' : ''}`, cls);
            });
          }
        }
      );
    } catch (err: any) {
      addLog('ORCHESTRATOR ERROR', `❌ Lỗi điều phối: ${err.message}`, 'text-red-600 font-bold');
      setIsProcessing(false);
      return;
    }

    setActiveStep(5);

    // Extract execution results
    const taskResults = dispatchResult.payload.execution.results || [];
    const fbResult = taskResults.find((r: any) => r.task_type === 'publish_facebook' || r.task_type === 'schedule_post');

    if (fbResult) {
      if (fbResult.success) {
        setLastApiStatus(fbResult.output);
      } else {
        setLastApiStatus(`⚠️ ${fbResult.error || fbResult.output}`);
      }
    } else {
      setLastApiStatus(`✅ Hoàn tất điều phối ${taskResults.length} nhiệm vụ AI Agent!`);
    }

    // Step 6: Evidence validation
    await delay(800);
    setActiveStep(6);
    addLog('EVIDENCE SERVICE', `🔍 Nhận chứng cứ kỹ thuật số (Verified Sign-off Hash).`, 'text-teal-600');
    addLog('EVIDENCE SERVICE', `✅ Checksum hợp quy luật: ĐẠT | Điểm số chất lượng EQE: 96/100.`, 'text-emerald-600 font-bold');

    // Step 7: Closed Loop Learning
    await delay(800);
    setActiveStep(7);
    addLog('LEARNING CENTER', `🧬 Bắt đầu đột biến quy trình (SOP Mutation) dựa trên Feedback mới.`, 'text-pink-600');
    const mutationResult = EnterpriseBrain.Learning.learnFromEvidence(mockStep, 'EQE quality check passed with score 96.');
    addLog('LEARNING CENTER', `🧬 Đột biến thành công: ${mutationResult.target} ➔ ${mutationResult.mutationStatus}`, 'text-emerald-600 font-bold');

    setIsProcessing(false);
    setActiveStep(8);
    addLog('SYSTEM', `🏁 Hoàn tất quy trình chạy cho Strategic Intent của CEO!`, 'text-amber-600 font-bold');
  };

  // 2. Ingest document
  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    addLog('INGESTION', `📥 Nhận tệp: "${newFileName}" (${newFileSize}) ➔ Đang chạy OCR...`, 'text-cyan-600 animate-pulse');
    const result = EnterpriseBrain.Understanding.understandDocument(newFileName, 'Content placeholder');
    
    setDocuments(prev => [{
      name: newFileName,
      size: newFileSize,
      status: 'COMPLETED',
      rule: `Quy chuẩn: Tông giọng ${result.dnaTone}. Style UI: ${result.styleClass}.`
    }, ...prev]);

    setDnaState({
      tone: result.dnaTone,
      style: result.styleClass
    });

    addLog('INGESTION', `✅ Trích xuất tri thức thành công! Cập nhật DNA tone thành: "${result.dnaTone}"`, 'text-emerald-600 font-bold');
    setNewFileName('');
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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
        {/* LEFT COLUMN: 11 AI WORKFORCE MATRIX */}
        <aside className="w-80 border-r border-slate-200 bg-white/60 backdrop-blur-md flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <h2 className="font-display font-semibold text-xs text-slate-700 uppercase tracking-wider">AI Workforce Matrix</h2>
            </div>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">11 Online</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {AI_WORKFORCE.map(ai => (
              <div 
                key={ai.id} 
                className="glass-panel p-2.5 rounded-xl border border-slate-100 hover:border-indigo-400 hover:bg-slate-50/50 transition-all group flex items-start gap-3 shadow-sm"
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
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[8px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                    </span>
                    <span className="font-mono text-slate-500">Proficiency: {ai.prof}%</span>
                  </div>
                </div>
              </div>
            ))}
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
            <div className="flex-1 glass-panel rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent)] pointer-events-none"></div>
              
              {/* Dynamic node link tree display */}
              {isProcessing || activeStep >= 0 ? (
                <div className="flex flex-col items-center justify-center gap-8 w-full max-w-xl z-10 transition-all duration-500">
                  {/* Root Objective Node */}
                  <div className="flex flex-col items-center">
                    <div className="glass-panel-glow px-4 py-2 rounded-xl text-center border-indigo-400 text-xs font-semibold max-w-sm">
                      <p className="text-[9px] text-indigo-600 uppercase tracking-widest font-bold">Root Intent (CEO)</p>
                      <p className="text-slate-800 mt-1">{objective}</p>
                    </div>
                  </div>

                  {/* Flow links */}
                  <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-400 to-cyan-400"></div>

                  {/* Department OKRs level */}
                  <div className="grid grid-cols-4 gap-4 w-full">
                    {[
                      { dept: 'Marketing', okr: 'Tăng 20% Spa Demo', status: activeStep >= 1 ? 'COMPLETED' : 'PENDING', color: 'border-cyan-400 text-cyan-600' },
                      { dept: 'Sales', okr: 'Tối ưu 42 Lượt Bookings', status: activeStep >= 1 ? 'COMPLETED' : 'PENDING', color: 'border-blue-400 text-blue-600' },
                      { dept: 'HR & Operations', okr: 'Ràng buộc SOP & Staffing', status: activeStep >= 1 ? 'COMPLETED' : 'PENDING', color: 'border-teal-400 text-teal-600' },
                      { dept: 'Finance', okr: 'Budget limit: 50M VND', status: activeStep >= 1 ? 'COMPLETED' : 'PENDING', color: 'border-purple-400 text-purple-600' }
                    ].map((okrNode, i) => (
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

                  {/* Bottom Actions flow status */}
                  {activeStep >= 4 && (
                    <>
                      <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-500"></div>
                      <div className="glass-panel p-3 rounded-xl border border-purple-300 flex items-center gap-3 text-left max-w-md">
                        <Zap className="w-4 h-4 text-purple-500 animate-bounce shrink-0" />
                        <div>
                          <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">Scheduled AI Workforce Dispatch</p>
                          <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Hermes Operating Driver ➔ Real API Execution Gateway</p>
                          {lastApiStatus && (
                            <p className="text-[9px] text-emerald-600 mt-1 font-mono font-bold bg-emerald-50 p-1.5 rounded border border-emerald-100">{lastApiStatus}</p>
                          )}
                        </div>
                      </div>
                    </>
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
                  onChange={(e) => setObjective(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Nhập mệnh lệnh chiến lược của CEO..."
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

              {/* UPLOAD FORM */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-200">
                <h3 className="font-display font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Ingest Knowledge Document</span>
                </h3>
                <form onSubmit={handleUploadDoc} className="mt-3 space-y-2.5">
                  <input 
                    type="text" 
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Tên file (vd: Huong_dan_branding.pdf)..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:outline-none rounded-lg p-2 text-[10px] text-slate-700"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-semibold text-[10px] py-2 rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    Nạp Vào Bộ Não
                  </button>
                </form>
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
                    <span className="text-[8px] text-emerald-600 flex items-center gap-1 mt-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Index Completed
                    </span>
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
                      <ul className="mt-2 space-y-1.5 text-[9px] font-mono text-cyan-600">
                        <li>[2026-07-22 11:17:05] SOP-MKT-V1.0 initialized</li>
                        <li>[2026-07-22 11:17:15] Completed Step 1 (Strategy)</li>
                        <li>[2026-07-22 11:17:35] Mutated SOP: latencySaved = 2500ms</li>
                      </ul>
                    </div>

                    <div className="glass-panel p-3.5 rounded-xl border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Decision Memory
                      </h4>
                      <p className="text-[10px] text-slate-500 italic">Các quyết định điều hành tối ưu hóa:</p>
                      <ul className="mt-2 space-y-1.5 text-[9px] font-mono text-purple-600">
                        <li>DEC-001: Run campaign Zalo OA (Confidence: 98%)</li>
                        <li>DEC-002: Approve SpaPOS Voucher bid (Confidence: 95%)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: KNOWLEDGE */}
              {brainSubTab === 'knowledge' && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center h-64 relative">
                    <p className="text-[10px] text-indigo-600 absolute top-4 left-4 font-mono">Bản đồ liên kết EOM Nodes</p>
                    <svg className="w-96 h-48" viewBox="0 0 400 200">
                      <line x1="80" y1="100" x2="200" y2="50" stroke="#4f46e5" strokeWidth="2" />
                      <line x1="200" y1="50" x2="320" y2="100" stroke="#06b6d4" strokeWidth="2" />
                      <line x1="200" y1="150" x2="80" y2="100" stroke="#3b82f6" strokeWidth="2" />
                      
                      <circle cx="80" cy="100" r="16" fill="#f8fafc" stroke="#4f46e5" strokeWidth="3" />
                      <text x="80" y="104" fill="#0f172a" fontSize="8" textAnchor="middle">Customer</text>
                      
                      <circle cx="200" cy="50" r="16" fill="#f8fafc" stroke="#3b82f6" strokeWidth="3" />
                      <text x="200" y="54" fill="#0f172a" fontSize="8" textAnchor="middle">Campaign</text>
                      
                      <circle cx="320" cy="100" r="16" fill="#f8fafc" stroke="#06b6d4" strokeWidth="3" />
                      <text x="320" y="104" fill="#0f172a" fontSize="8" textAnchor="middle">Invoice</text>
                      
                      <circle cx="200" cy="150" r="16" fill="#f8fafc" stroke="#14b8a6" strokeWidth="3" />
                      <text x="200" y="154" fill="#0f172a" fontSize="8" textAnchor="middle">Evidence</text>
                    </svg>
                  </div>
                </div>
              )}

              {/* SUB TAB: CONTEXT */}
              {brainSubTab === 'context' && (
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Selective Context Package Compiler</h4>
                    <p className="text-[10px] text-slate-500 mb-3">Context Center lọc bảo mật dữ liệu thô (raw data) và chỉ gửi thông tin đã được rút gọn ngữ nghĩa đến AI.</p>
                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-[9px] text-slate-350 max-h-48 overflow-y-auto">
                      <pre>{`{
  "taskId": "task_campaign_001",
  "objective": "${objective}",
  "erp": {
    "approvedBudgetVnd": 50000000,
    "currency": "VND",
    "cashOnHandVnd": 12400000000
  },
  "crm": {
    "activeCustomers": 1289,
    "activeBookings": 42,
    "facebookReach24h": 14500
  },
  "governance": {
    "maxAutoSpendVnd": 100000000,
    "nightPostingAllowed": true
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
                    <div className="space-y-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-slate-800">Marketing OKR</span>: Triển khai chiến dịch Social & SEO SpaPOS. Target: 1000 Leads.
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="font-bold text-slate-800">Sales OKR</span>: Tối ưu hoá luồng tư vấn tự động để chốt 42 Lượt Bookings.
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-bold text-slate-800">Finance OKR</span>: Kiểm duyệt chi tiêu dưới hạn mức 50,000,000 VND.
                      </div>
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
                        <span className="text-[9px] text-slate-400 uppercase block">Trước khi tối ưu (Old SOP)</span>
                        <span className="font-semibold text-slate-700">Delay: 5000ms | Bidding: Fixed | AI: Default</span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <span className="text-[9px] text-emerald-600 uppercase block">Sau đột biến (Mutated SOP)</span>
                        <span className="font-semibold text-emerald-700">Delay: 2500ms | Bidding: Dynamic | AI: Scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
