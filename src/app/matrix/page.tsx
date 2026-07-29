"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, ArrowLeft, CheckCircle2, AlertTriangle, Terminal, 
  Copy, Check, Search, Filter, Sparkles, RefreshCw, Key, Shield, Layers
} from 'lucide-react';
import { CampaignExecutionManager } from '@/core/execution/campaign-manager';
import { cleanMarkdownForExecutive } from '@/lib/text-cleaner';

export default function ExecutiveMatrixPage() {
  const [dynamicTasks, setDynamicTasks] = useState<any[]>([]);
  const [objective, setObjective] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [selectedTaskModal, setSelectedTaskModal] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = CampaignExecutionManager.subscribe((state) => {
      setDynamicTasks(state.dynamicTasks || []);
      if (state.objective) setObjective(state.objective);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyOutput = (taskId: string, text: string) => {
    if (!text) return;
    const cleanText = cleanMarkdownForExecutive(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedTaskId(taskId);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const filteredTasks = dynamicTasks.filter(t => {
    const matchesSearch = 
      (t.agent_name || t.agent_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.task_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.output || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'COMPLETED') return matchesSearch && (t.status === 'COMPLETED' || t.isApproved);
    if (statusFilter === 'AWAITING') return matchesSearch && (t.status === 'AWAITING_APPROVAL' || t.meta?.status === 'AWAITING_APPROVAL') && !t.isApproved;
    if (statusFilter === 'RUNNING') return matchesSearch && (t.status === 'RUNNING' || t.status === 'PENDING');
    return matchesSearch;
  });

  const completedCount = dynamicTasks.filter(t => t.status === 'COMPLETED' || t.isApproved).length;

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#1e293b] flex flex-col font-sans">
      {/* EXECUTIVE HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200"
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md relative luxury-border-glow">
              <Brain className="text-amber-400 w-5 h-5 animate-pulse-glow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base tracking-wider text-slate-900 uppercase">
                  EXECUTIVE MATRIX
                </h1>
                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full uppercase">
                  Bảng Kết Quả Toàn Cục
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Hệ điều hành Doanh nghiệp Bella EOS • Quản trị Bảng tổng hợp Thực thi đa Agent
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tiến độ: {completedCount} / {dynamicTasks.length} Task Hoàn Thành</span>
          </div>
          <Link
            href="/settings"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>Cài đặt</span>
          </Link>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* CONTEXT BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 rounded-2xl p-6 text-white border border-slate-700/60 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[9.5px] text-amber-400 font-bold uppercase tracking-widest font-display">CHỈ THỊ CHIẾN LƯỢC ĐANG THỰC THI (ACTIVE EXECUTIVE INTENT)</span>
            </div>
            <h2 className="font-display font-semibold text-sm leading-relaxed text-slate-100">
              "{objective || 'Chưa có chỉ thị được gửi từ Dashboard'}"
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <p className="text-[8px] text-amber-300 uppercase font-bold tracking-wider">Tổng Lượng Tasks</p>
              <p className="text-base font-bold text-white font-mono mt-0.5">{dynamicTasks.length} Task</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <p className="text-[8px] text-emerald-400 uppercase font-bold tracking-wider">Đã Hoàn Thành</p>
              <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">{completedCount}</p>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên AI Worker, nội dung bài viết hoặc mô tả task..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs font-sans text-slate-800 placeholder-slate-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Lọc:</span>
            {[
              { id: 'ALL', label: `Tất cả (${dynamicTasks.length})` },
              { id: 'COMPLETED', label: `Hoàn thành (${completedCount})` },
              { id: 'AWAITING', label: `Chờ duyệt (${dynamicTasks.filter(t => t.status === 'AWAITING_APPROVAL').length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === f.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* FULL MATRIX TABLE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="font-display font-bold text-xs tracking-wider text-slate-800 uppercase">
                Bảng Kết Quả Thực Thi Toàn Cục (Master Executive Task Matrix)
              </h3>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">Hiển thị full 100% nội dung & sản phẩm đầu ra từ AI Workforce</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
              <p className="text-xs font-semibold text-slate-600">Chưa tìm thấy dữ liệu phù hợp</p>
              <p className="text-[11px]">Hãy chạy chỉ thị từ Dashboard hoặc điều chỉnh bộ lọc tìm kiếm.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((t: any, idx: number) => {
                const isDone = t.status === 'COMPLETED' || t.isApproved || t.success === true;
                const isAwaiting = (t.status === 'AWAITING_APPROVAL' || t.meta?.status === 'AWAITING_APPROVAL') && !t.isApproved;

                return (
                  <div key={t.task_id || idx} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                    {/* TASK HEADER ROW */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-800">{t.agent_name || t.agent_id}</h4>
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">{t.task_type}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t.task_description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isAwaiting ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full font-bold text-[8px] animate-pulse flex items-center gap-1">
                            👑 CHỜ CEO PHÊ DUYỆT
                          </span>
                        ) : isDone ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[8px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> HOÀN THÀNH
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold text-[8px]">
                            ⏳ ĐANG XỬ LÝ
                          </span>
                        )}

                        {t.output && (
                          <button
                            onClick={() => handleCopyOutput(t.task_id || idx.toString(), t.output)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-[9px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            {copiedTaskId === (t.task_id || idx.toString()) ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Đã copy</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy Nội dung</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* FULL OUTPUT CONTAINER */}
                    {t.output ? (
                      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 text-xs font-sans text-slate-800 leading-relaxed space-y-2">
                        <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                          <span>Sản phẩm / Bài viết / Bằng chứng Kết quả (Đã làm sạch định dạng):</span>
                          <span className="font-mono text-slate-500">{cleanMarkdownForExecutive(t.output).length} ký tự</span>
                        </div>
                        <div className="whitespace-pre-wrap break-words font-sans text-[11px] leading-relaxed text-slate-750 font-normal">
                          {cleanMarkdownForExecutive(t.output)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-3 text-center text-[10px] text-slate-400 italic">
                        Đang chờ AI Worker xử lý dữ liệu đầu ra...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
