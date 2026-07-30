"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Brain, ArrowLeft, CheckCircle2, AlertTriangle, Search, Filter, Plus, User, Shield, 
  RefreshCw, Copy, Check, Trash2, Edit, Send, Play, FileText, CheckCircle, Clock, Eye, AlertCircle
} from 'lucide-react';
import { bootstrapEosExecutionServices } from '@/core/execution/bootstrap';
import { HUMAN_WORKER_REGISTRY } from '@/core/workforce/human-registry';
import { TaskEvidence } from '@/core/execution/evidence-validation-service';

export default function WorkAssignmentsPage() {
  // Bounded Context Container State
  const [container, setContainer] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    completed: 0,
    completionRate: 100,
    activeHumanWorkload: 0,
    activeAiWorkload: 0,
    overdue: 0,
    blocked: 0,
    awaitingApproval: 0
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Selected entities for actions
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'NOT_STARTED', 'RUNNING', 'VALIDATING', 'PASSED', 'FAILED', 'PENDING_APPROVAL'
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeTypeFilter, setAssigneeTypeFilter] = useState('ALL');

  // Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState(' Nguyễn Văn A');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  
  // Submit Form Fields
  const [reportContent, setReportContent] = useState('');
  const [evidenceType, setEvidenceType] = useState('CRM');
  const [evidenceValue, setEvidenceValue] = useState('');
  const [checklistText, setChecklistText] = useState('');
  const [checklists, setChecklists] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Reassign Form Fields
  const [reassignTarget, setReassignTarget] = useState('');

  // Approval Form Fields
  const [approveComment, setApproveComment] = useState('');

  // UI state feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const c = bootstrapEosExecutionServices();
    setContainer(c);
    refreshData(c);

    // Subscribe to EventBus to trigger state refreshes
    const unsubscribe = c.eventBus.subscribeToAll((event) => {
      refreshData(c);
      showToast(`Sự kiện phát sinh: ${event.eventType}`);
    });

    return () => unsubscribe();
  }, []);

  const refreshData = (cContainer: any) => {
    if (!cContainer) return;
    const all = cContainer.readRepository.listAllAssignments();
    setAssignments(all);
    setMetrics(cContainer.readRepository.getDashboardProjection());

    // Load telemetry logs
    const logs = cContainer.telemetryService.getLogs();
    setTelemetryLogs(logs);

    // Mock/Load timeline events from outbox/storage
    const outboxList = cContainer.outboxStore.getPending();
    setTimelineEvents(outboxList.map((o: any) => o.event));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Create assignment command handler
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate || !container) return;

    const worker = HUMAN_WORKER_REGISTRY.find(h => h.id === newAssignee);
    const assigneeName = worker ? worker.name : newAssignee.replace('eos_', 'AI Agent ');
    const assigneeType = newAssignee.startsWith('eos_') ? 'AI' : 'Human';

    try {
      container.assignmentService.createAssignment({
        workflowId: 'wf-mkt-camp-2026',
        assignmentId: `asg-${Math.random().toString(36).substring(2, 9)}`,
        title: newTitle,
        description: newDescription,
        assignee: newAssignee,
        assigneeName,
        assigneeType,
        dueDate: newDueDate,
        priority: newPriority,
        department: 'Marketing & Booking',
        campaign: 'Chiến dịch Q3 - Tăng Lead CRM',
        createdBy: 'CEO Lãnh Đạo',
        tenantId: 'tenant-vip-spa',
        actor: 'CEO_USER',
        correlationId: `corr-${Date.now()}`
      });

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      refreshData(container);
      showToast('Đã phân bổ nhiệm vụ mới vào Workflow aggregate!');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 2. Submit execution report command handler
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportContent.trim() || !container || !selectedAssignment) return;

    try {
      const evidence: TaskEvidence[] = [];
      if (evidenceValue.trim()) {
        evidence.push({
          type: evidenceType,
          value: evidenceValue.trim()
        });
      }

      await container.assignmentService.submitSubmission({
        workflowId: selectedAssignment.workflowId || 'wf-mkt-camp-2026',
        assignmentId: selectedAssignment.id,
        submittedBy: selectedAssignment.assigneeName,
        reportContent: reportContent,
        evidence,
        tenantId: 'tenant-vip-spa',
        actor: selectedAssignment.assigneeName,
        correlationId: `corr-${Date.now()}`
      });

      setIsReportModalOpen(false);
      setReportContent('');
      setEvidenceValue('');
      refreshData(container);
      showToast('Nộp báo cáo & bằng chứng hoàn tất! Đang thẩm định tự động...');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 3. Reassign assignment command handler
  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTarget || !container || !selectedAssignment) return;

    const worker = HUMAN_WORKER_REGISTRY.find(h => h.id === reassignTarget);
    const assigneeName = worker ? worker.name : reassignTarget.replace('eos_', 'AI Agent ');
    const assigneeType = reassignTarget.startsWith('eos_') ? 'AI' : 'Human';

    try {
      container.assignmentService.reassignAssignment({
        workflowId: selectedAssignment.workflowId || 'wf-mkt-camp-2026',
        assignmentId: selectedAssignment.id,
        assigneeId: reassignTarget,
        assigneeName,
        assigneeType,
        tenantId: 'tenant-vip-spa',
        actor: 'CEO_USER',
        correlationId: `corr-${Date.now()}`
      });

      setIsReassignModalOpen(false);
      refreshData(container);
      showToast('Đã tái phân bổ người thực thi mới!');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 4. Manual Approval command handler
  const handleResolveApproval = (approved: boolean) => {
    if (!container || !selectedAssignment || !selectedSubmission) return;

    try {
      container.assignmentService.resolveApproval({
        workflowId: selectedAssignment.workflowId || 'wf-mkt-camp-2026',
        assignmentId: selectedAssignment.id,
        submissionId: selectedSubmission.submissionId,
        approved,
        approverRole: 'DIRECTOR',
        comment: approveComment,
        tenantId: 'tenant-vip-spa',
        actor: 'DIRECTOR_USER',
        correlationId: `corr-${Date.now()}`
      });

      setIsApproveModalOpen(false);
      setIsDetailModalOpen(false);
      setApproveComment('');
      refreshData(container);
      showToast(approved ? 'Đã phê duyệt bàn giao!' : 'Đã từ chối bàn giao, yêu cầu rework.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 5. Archive assignment
  const handleArchive = (asg: any) => {
    if (!container) return;
    if (confirm('Bạn có chắc chắn muốn lưu trữ và ẩn tác vụ này?')) {
      try {
        container.assignmentService.archiveAssignment(asg.workflowId || 'wf-mkt-camp-2026', asg.id);
        refreshData(container);
        showToast('Đã đưa tác vụ vào kho lưu trữ (lưu vết audit).');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Filter logic
  const filteredAssignments = assignments.filter(asg => {
    const matchesSearch = 
      asg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asg.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      asg.assigneeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || asg.priority === priorityFilter;
    const matchesAssigneeType = assigneeTypeFilter === 'ALL' || asg.assigneeType === assigneeTypeFilter;

    // Map complex split states to readable search filter keys
    let matchesStatus = true;
    if (statusFilter === 'NOT_STARTED') {
      matchesStatus = asg.executionStatus === 'NOT_STARTED';
    } else if (statusFilter === 'RUNNING') {
      matchesStatus = asg.executionStatus === 'RUNNING';
    } else if (statusFilter === 'VALIDATING') {
      matchesStatus = asg.verificationStatus === 'VALIDATING';
    } else if (statusFilter === 'PASSED') {
      matchesStatus = asg.verificationStatus === 'PASSED';
    } else if (statusFilter === 'FAILED') {
      matchesStatus = asg.verificationStatus === 'FAILED';
    } else if (statusFilter === 'PENDING_APPROVAL') {
      matchesStatus = asg.approvalStatus === 'PENDING';
    }

    return matchesSearch && matchesPriority && matchesAssigneeType && matchesStatus && asg.executionStatus !== 'ARCHIVED';
  });

  const getCombinedBadge = (asg: any) => {
    if (asg.approvalStatus === 'PENDING') {
      return (
        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
          👑 Chờ Phê Duyệt
        </span>
      );
    }
    if (asg.verificationStatus === 'VALIDATING') {
      return (
        <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
          ⏳ Thẩm định Tự động
        </span>
      );
    }
    if (asg.verificationStatus === 'PASSED') {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
          ✅ Đã Thẩm Định
        </span>
      );
    }
    if (asg.verificationStatus === 'FAILED') {
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
          ❌ Thẩm Định Lỗi
        </span>
      );
    }
    if (asg.executionStatus === 'RUNNING') {
      return (
        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
          ⚡ Đang Chạy
        </span>
      );
    }
    return (
      <span className="bg-slate-500/20 text-slate-400 border border-slate-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
        ⏳ Chưa Chạy
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#03100B] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-250">
      {/* Background glow sparks */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* TOP TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-[#0B2E24]/90 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="bg-[#051A13]/90 backdrop-blur-md border-b border-emerald-950/60 px-8 py-4.5 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-9.5 h-9.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/10 active:scale-95 shadow-md"
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10.5 h-10.5 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg border border-emerald-500/20">
              <Brain className="text-amber-400 w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-[15px] tracking-[0.2em] text-white uppercase">
                  WORK GOVERNANCE
                </h1>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Pilot Context
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Bella Operating System (EOS) • Giám sát nhiệm vụ, Thẩm định tự động & Phê duyệt Executive
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/executive"
            className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs hover:border-white/25 active:scale-95"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Control Room</span>
          </Link>
        </div>
      </header>

      {/* BODY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6 z-10 relative">
        
        {/* PILOT PERSISTENCE ALERT BANNER */}
        <div className="bg-gradient-to-r from-[#07241A] to-[#0A3D2D] rounded-2xl p-5 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-amber-400">
              <AlertCircle className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">BÁO CÁO TRẠNG THÁI PERSISTENCE (PILOT MODE LOCALSTORAGE)</h3>
              <p className="text-[11px] leading-relaxed text-slate-350">
                Toàn bộ dữ liệu WorkAssignment, Submission, VerificationRecord, ApprovalRecord đang được bảo lưu qua PersistenceAdapter dạng LocalStorage. 
                Khi chuyển đổi sang môi trường Production, hệ thống chỉ cần thay thế bằng SupabaseAdapter mà không ảnh hưởng tới logic nghiệp vụ aggregate của Workflow.
              </p>
            </div>
          </div>
        </div>

        {/* METRICS BANNER CARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiệu suất Hoàn thành</p>
              <h3 className="text-3xl font-display font-extrabold text-white group-hover:text-emerald-400 transition-colors">{metrics.completionRate}%</h3>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-4 pt-3 border-t border-emerald-950/40 flex justify-between">
              <span>Đã xong / Tổng số:</span>
              <span className="font-semibold text-emerald-400 font-mono">{metrics.completed} / {metrics.total}</span>
            </p>
          </div>

          <div className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khối Lượng Nhân Sự (Human)</p>
              <h3 className="text-3xl font-display font-extrabold text-white group-hover:text-amber-400 transition-colors">{metrics.activeHumanWorkload} Active</h3>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-4 pt-3 border-t border-emerald-950/40 flex justify-between">
              <span>Nhiệm vụ gán nhân viên</span>
              <span className="font-semibold text-amber-400">Human Workers</span>
            </p>
          </div>

          <div className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khối Lượng Tự Động (AI)</p>
              <h3 className="text-3xl font-display font-extrabold text-white group-hover:text-cyan-400 transition-colors">{metrics.activeAiWorkload} Running</h3>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-4 pt-3 border-t border-emerald-950/40 flex justify-between">
              <span>Nhiệm vụ xử lý bởi AI</span>
              <span className="font-semibold text-cyan-400">Autonomous Agents</span>
            </p>
          </div>

          <div className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hàng Đợi Chờ Phê Duyệt</p>
              <h3 className="text-3xl font-display font-extrabold text-amber-500 group-hover:text-amber-400 transition-colors">{metrics.awaitingApproval} Item</h3>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-4 pt-3 border-t border-emerald-950/40 flex justify-between">
              <span>Cần lãnh đạo ký duyệt</span>
              <span className="font-semibold text-amber-500">Approval Queue</span>
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS PANEL */}
        <div className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 rounded-2xl p-4.5 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tác vụ theo tiêu đề, mô tả hoặc người thực thi..."
              className="w-full bg-[#03120E] border border-emerald-950/60 focus:border-emerald-500/70 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#03120E] border border-emerald-950/60 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500/70 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NOT_STARTED">Chưa bắt đầu</option>
              <option value="RUNNING">Đang chạy</option>
              <option value="VALIDATING">Đang thẩm định</option>
              <option value="PASSED">Đạt thẩm định</option>
              <option value="FAILED">Thẩm định lỗi</option>
              <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#03120E] border border-emerald-950/60 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500/70 cursor-pointer"
            >
              <option value="ALL">Mọi độ ưu tiên</option>
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
            </select>

            {/* Assignee Type Filter */}
            <select
              value={assigneeTypeFilter}
              onChange={(e) => setAssigneeTypeFilter(e.target.value)}
              className="bg-[#03120E] border border-emerald-950/60 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500/70 cursor-pointer"
            >
              <option value="ALL">Nhân viên &amp; AI</option>
              <option value="Human">Chỉ Nhân viên (Human)</option>
              <option value="AI">Chỉ AI Agents</option>
            </select>

            {/* Add Task Button */}
            <button
              onClick={() => {
                setErrorMessage('');
                setIsCreateModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Giao nhiệm vụ</span>
            </button>
          </div>
        </div>

        {/* WORK ASSIGNMENTS LIST GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: MASTER LIST */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="bg-[#051C14]/50 border border-dashed border-emerald-950/60 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-300">Không tìm thấy tác vụ nào khớp bộ lọc</p>
                <p className="text-[10.5px]">Hãy tạo mới nhiệm vụ hoặc nới lỏng các điều kiện tìm kiếm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((asg) => {
                  const isDone = asg.executionStatus === 'DONE';
                  const overdue = !isDone && new Date(asg.dueDate).getTime() < new Date().getTime();

                  return (
                    <div 
                      key={asg.id}
                      onClick={() => {
                        setSelectedAssignment(asg);
                        setApproveComment('');
                        if (container) {
                          const history = container.submissionStore.findHistory(asg.id);
                          setSubmissionHistory(history);
                          const latest = container.submissionStore.findLatest(asg.id);
                          setSelectedSubmission(latest);
                        }
                        setIsDetailModalOpen(true);
                      }}
                      className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 p-5 rounded-2xl hover:border-emerald-600/60 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-md group active:scale-[0.99] relative overflow-hidden"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              asg.priority === 'HIGH' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : asg.priority === 'MEDIUM' 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                              {asg.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium">{asg.campaign}</span>
                          </div>
                          <h3 className="font-display font-bold text-sm text-white group-hover:text-emerald-400 transition-colors mt-1.5">{asg.title}</h3>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1 font-normal">{asg.description}</p>
                        </div>
                        <div className="shrink-0">{getCombinedBadge(asg)}</div>
                      </div>

                      {/* Bottom stats row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-emerald-950/40 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6.5 h-6.5 rounded-full bg-slate-900 border border-emerald-950 flex items-center justify-center text-xs shrink-0">
                            {asg.assigneeType === 'Human' ? '👥' : '🤖'}
                          </div>
                          <div>
                            <p className="text-white font-bold">{asg.assigneeName}</p>
                            <p className="text-[8.5px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{asg.assigneeType} Worker</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[10px]">
                          <div className="text-right">
                            <p className="text-slate-500">Mốc hoàn thành</p>
                            <p className={`font-mono font-bold mt-0.5 ${overdue ? 'text-rose-500' : 'text-slate-350'}`}>
                              {new Date(asg.dueDate).toLocaleDateString('vi-VN')} {overdue && '(Trễ)'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-slate-500">Lượt nộp</p>
                            <p className="font-mono font-bold text-white mt-0.5">{asg.submissionCount} lần</p>
                          </div>
                        </div>
                      </div>

                      {/* Direct completion shortcut for Humans */}
                      {asg.assigneeType === 'Human' && !isDone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssignment(asg);
                            setReportContent('');
                            setEvidenceValue('');
                            setErrorMessage('');
                            setIsReportModalOpen(true);
                          }}
                          className="absolute right-4 bottom-14 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider shadow-md"
                        >
                          Báo cáo hoàn thành
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: LIVE TELEMETRY STREAM */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#051C14]/80 backdrop-blur-md border border-emerald-950/60 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-lg h-[480px]">
              <div className="border-b border-emerald-950/40 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <h3 className="font-display font-bold text-xs tracking-wider text-white uppercase">
                    LUỒNG SỰ KIỆN LIVE (TELEMETRY)
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (container) {
                      container.telemetryService.clearLogs();
                      refreshData(container);
                    }
                  }}
                  className="text-[9px] hover:text-white text-slate-400 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded"
                >
                  Xóa
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[9px] leading-relaxed scrollbar-thin text-slate-350 pr-1">
                {telemetryLogs.length === 0 ? (
                  <p className="text-slate-500 italic p-4 text-center">Chưa có sự kiện nào phát sinh trong Bounded Context.</p>
                ) : (
                  [...telemetryLogs].reverse().map((log) => (
                    <div key={log.logId} className="bg-[#03120E] border border-emerald-950/40 p-2.5 rounded-lg flex flex-col gap-1 shadow-2xs">
                      <div className="flex justify-between items-center text-slate-500 font-semibold">
                        <span>[{log.timestamp.split('T')[1].substring(0, 8)}]</span>
                        <span className="text-emerald-500 font-bold uppercase tracking-wider">{log.eventType}</span>
                      </div>
                      <p className="text-slate-200 mt-1 font-sans text-[10px] break-words">{log.payloadSummary}</p>
                      <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                        <span>Actor: {log.actor}</span>
                        <span>Tenant: {log.tenantId}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* CREATE WORKASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#051C14] border border-emerald-950/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                GIAO PHÂN BỔ NHIỆM VỤ ĐỘC LẬP
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-450 hover:text-white text-xs">✕</button>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Tiêu đề nhiệm vụ *</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required
                  placeholder="Ví dụ: Thiết kế banner Marketing Q3"
                  className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Mô tả chi tiết</label>
                <textarea 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  rows={3}
                  placeholder="Ghi rõ đầu ra công việc cần bàn giao..."
                  className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Người thực thi *</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250 cursor-pointer"
                  >
                    <optgroup label="👥 Personnel (Human)">
                      {HUMAN_WORKER_REGISTRY.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                      ))}
                    </optgroup>
                    <optgroup label="🤖 Autonomous Agents (AI)">
                      <option value="eos_content_worker">AI Marketing Copywriter</option>
                      <option value="eos_creative_worker">AI Creative Designer</option>
                      <option value="hermes_social">Hermes Social Publisher</option>
                      <option value="ares_ads">Ares Ads Optimizer</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Độ ưu tiên *</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250 cursor-pointer"
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="MEDIUM">Trung bình (Medium)</option>
                    <option value="HIGH">Cao (High)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Hạn chót hoàn thành (Due Date) *</label>
                <input 
                  type="date" 
                  value={newDueDate} 
                  onChange={(e) => setNewDueDate(e.target.value)} 
                  required
                  className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250 cursor-pointer"
                />
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[10.5px] font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/20 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md mt-4 active:scale-98"
              >
                Tạo nhiệm vụ &amp; Ghi nhận Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT COMPLETION / SUBMISSION MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#051C14] border border-emerald-950/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                BÁO CÁO HOÀN THÀNH TÁC VỤ
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-450 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Nội dung báo cáo kết quả *</label>
                <textarea 
                  value={reportContent} 
                  onChange={(e) => setReportContent(e.target.value)} 
                  required
                  rows={4}
                  placeholder="Nhập nội dung markdown tóm tắt kết quả xử lý..."
                  className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-1">
                  <label className="font-bold text-slate-400">Loại minh chứng</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250 cursor-pointer"
                  >
                    <option value="CRM">CRM link</option>
                    <option value="IMAGE">Image path</option>
                    <option value="URL">URL link</option>
                    <option value="FILE_HASH">File SHA-256</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-slate-400">Giá trị minh chứng (Evidence Value)</label>
                  <input 
                    type="text" 
                    value={evidenceValue} 
                    onChange={(e) => setEvidenceValue(e.target.value)} 
                    placeholder="Ví dụ: crm::cust-992 hoặc https://..."
                    className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[10.5px] font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/20 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md mt-4 active:scale-98"
              >
                Nộp báo cáo bàn giao
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED TIMELINE & AUDIT HISTORY MODAL */}
      {isDetailModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#051C14] border border-emerald-950/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  CHI TIẾT &amp; LỊCH SỬ KIỂM TOÁN TÁC VỤ
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: {selectedAssignment.id} • Workflow: {selectedAssignment.workflowId}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-450 hover:text-white text-xs">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-350">
              
              {/* Left Column: Properties & Submissions */}
              <div className="space-y-4">
                <div className="bg-[#03120E] border border-emerald-950/40 p-4 rounded-xl space-y-2 shadow-xs">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wide border-b border-emerald-950/40 pb-1.5">Thông tin tác vụ</h4>
                  <p><strong>Tiêu đề:</strong> {selectedAssignment.title}</p>
                  <p><strong>Mô tả:</strong> {selectedAssignment.description}</p>
                  <p><strong>Người nhận việc:</strong> {selectedAssignment.assigneeName} ({selectedAssignment.assigneeType})</p>
                  <p><strong>Độ ưu tiên:</strong> {selectedAssignment.priority}</p>
                  <p><strong>Hạn chót:</strong> {new Date(selectedAssignment.dueDate).toLocaleDateString('vi-VN')}</p>
                  <p className="flex items-center gap-1.5">
                    <strong>Trạng thái:</strong>
                    {getCombinedBadge(selectedAssignment)}
                  </p>
                </div>

                {/* Submissions checklist / details */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wide">Báo cáo &amp; Chứng cứ đã nộp ({submissionHistory.length})</h4>
                  
                  {submissionHistory.length === 0 ? (
                    <p className="text-slate-500 italic">Chưa có lượt báo cáo nào được nộp.</p>
                  ) : (
                    <div className="space-y-3.5 max-h-56 overflow-y-auto scrollbar-thin">
                      {submissionHistory.map((item, idx) => (
                        <div key={item.submission.submissionId} className="bg-[#03120E] border border-emerald-950/40 p-3 rounded-xl space-y-2 shadow-2xs">
                          <div className="flex justify-between text-[9px] text-slate-550 border-b border-emerald-950/20 pb-1">
                            <span>Lượt nộp #{idx + 1}</span>
                            <span>{new Date(item.submission.submittedAt).toLocaleTimeString('vi-VN')} - {new Date(item.submission.submittedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          
                          <p className="text-slate-200 text-[11px] bg-slate-900/50 p-2 rounded border border-white/5 whitespace-pre-wrap">{item.submission.reportContent}</p>
                          
                          {item.submission.evidencePackage?.length > 0 && (
                            <div className="text-[10px] text-slate-400 bg-white/5 border border-white/10 p-2 rounded">
                              <p className="font-bold text-slate-300">Minh chứng (Evidence Package):</p>
                              {item.submission.evidencePackage.map((ev: any, evIdx: number) => (
                                <p key={evIdx} className="font-mono mt-0.5">• [{ev.type}] {ev.value}</p>
                              ))}
                            </div>
                          )}

                          {/* Verification Record details */}
                          {item.verification && (
                            <div className={`p-2.5 rounded-lg border text-[10px] ${
                              item.verification.status === 'PASSED' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                              <p className="font-bold flex items-center gap-1">
                                {item.verification.status === 'PASSED' ? '✓' : '✗'} 
                                Kết quả thẩm định máy: {item.verification.status} (Độ tin cậy: {item.verification.confidence}%)
                              </p>
                              {item.verification.violations?.length > 0 && (
                                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                  {item.verification.violations.map((vio: string, vioIdx: number) => (
                                    <li key={vioIdx}>{vio}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {/* Approval Record details */}
                          {item.approval && (
                            <div className={`p-2.5 rounded-lg border text-[10px] ${
                              item.approval.status === 'APPROVED' 
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                              <p className="font-bold">
                                {item.approval.status === 'APPROVED' ? '👑' : '⚠️'} Phê duyệt Lãnh đạo ({item.approval.approverRole}): {item.approval.status}
                              </p>
                              {item.approval.comment && <p className="italic mt-1">Ý kiến phản hồi: "{item.approval.comment}"</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="space-y-4">
                {/* Pending approval resolver panel */}
                {selectedAssignment.approvalStatus === 'PENDING' && selectedSubmission && (
                  <div className="bg-[#0A261D]/80 border border-emerald-500/40 p-4.5 rounded-xl space-y-3.5 shadow-md animate-pulse">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <Shield className="w-4 h-4 text-amber-500" /> HÀNG ĐỢI DUYỆT CỦA CEO
                    </h4>
                    <p className="text-[11.5px] leading-relaxed text-slate-300">
                      Bằng chứng nộp bởi nhân viên được định cấu hình cần phê duyệt thủ công từ Lãnh đạo cấp cao.
                    </p>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Ý kiến phê duyệt / lý do từ chối</label>
                      <input 
                        type="text"
                        value={approveComment}
                        onChange={(e) => setApproveComment(e.target.value)}
                        placeholder="Nhập ghi chú phản hồi..."
                        className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleResolveApproval(true)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-center cursor-pointer transition-colors"
                      >
                        Duyệt Đạt
                      </button>
                      <button
                        onClick={() => handleResolveApproval(false)}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-center cursor-pointer transition-colors"
                      >
                        Từ Chối
                      </button>
                    </div>
                  </div>
                )}

                {/* Operations panel */}
                <div className="bg-[#03120E] border border-emerald-950/40 p-4 rounded-xl space-y-2.5 shadow-xs">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wide border-b border-emerald-950/40 pb-1.5">Thao tác điều hành</h4>
                  
                  {selectedAssignment.executionStatus !== 'DONE' && (
                    <button
                      onClick={() => {
                        setReassignTarget(selectedAssignment.assignee);
                        setIsReassignModalOpen(true);
                      }}
                      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-400" /> Phân bổ lại người thực thi
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleArchive(selectedAssignment);
                    }}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Lưu trữ &amp; Ẩn tác vụ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN TASK MODAL */}
      {isReassignModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#051C14] border border-emerald-950/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                TÁI PHÂN BỔ NGƯỜI NHẬN VIỆC
              </h3>
              <button onClick={() => setIsReassignModalOpen(false)} className="text-slate-450 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleReassign} className="space-y-4 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Chọn người thực thi mới *</label>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="w-full bg-[#03120E] border border-emerald-950/60 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/70 text-slate-250 cursor-pointer"
                >
                  <optgroup label="👥 Personnel (Human)">
                    {HUMAN_WORKER_REGISTRY.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                    ))}
                  </optgroup>
                  <optgroup label="🤖 Autonomous Agents (AI)">
                    <option value="eos_content_worker">AI Marketing Copywriter</option>
                    <option value="eos_creative_worker">AI Creative Designer</option>
                    <option value="hermes_social">Hermes Social Publisher</option>
                    <option value="ares_ads">Ares Ads Optimizer</option>
                  </optgroup>
                </select>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[10.5px] font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/20 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md active:scale-98"
              >
                Cập nhật phân bổ công việc
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
