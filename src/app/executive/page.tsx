"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Brain, Cpu, Layers, Zap, Settings, Database, Network, Play, 
  RefreshCw, FileText, CheckCircle2, AlertTriangle, TrendingUp, 
  Send, Terminal, User, Plus, Search, Sparkles, UploadCloud, ChevronRight, Key, Globe, MessageSquare,
  X, Copy, Check, Code, Download, RotateCcw, Shield, Activity, BarChart2, Eye, GitBranch, AlertCircle, Clock, CheckCircle
} from 'lucide-react';

// ECOS Platform Imports
import { EnterpriseStateService } from '@/core/infrastructure/enterprise-state-service';
import { DecisionPolicyService } from '@/core/infrastructure/decision-policy-service';
import { ExpertSelectionRuntime } from '@/core/edr/expert-selection-runtime';
import { CapabilityDiscoveryService } from '@/core/capability/capability-discovery-service';
import { DigitalTwinService } from '@/core/infrastructure/digital-twin-service';
import { ExecutiveMemoryService } from '@/core/infrastructure/executive-memory-service';
import { GoalGraphService } from '@/core/capability/goal-graph-service';
import { EnterpriseExecutionIntelligenceService } from '@/core/execution/enterprise-execution-intelligence-service';
import { EventBus } from '@/core/infrastructure/event-bus';
import { OutcomeVerificationService } from '@/core/infrastructure/outcome-verification-service';
import { HealthManager } from '@/core/infrastructure/health-manager';
import { DecisionJournal } from '@/core/infrastructure/decision-journal';
import { CapabilityRegistry } from '@/core/execution/capability-registry';

// New Cognitive ECOS Primitives Imports
import { SemanticLayer } from '@/core/infrastructure/semantic-layer';
import { OrganizationalTimeline } from '@/core/infrastructure/organizational-timeline';
import { ReasoningGraph } from '@/core/infrastructure/reasoning-graph';

export default function ExecutiveControlRoom() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'strategic' | 'goals' | 'decisions' | 'workforce' | 'execution' | 'health' | 'twin' | 'knowledge' | 'kpis' | 'timeline'>('strategic');
  
  // Platform Instances state refs
  const stateService = EnterpriseStateService.getInstance();
  const policyService = DecisionPolicyService.getInstance();
  const selectionService = ExpertSelectionRuntime.getInstance();
  const discoveryService = CapabilityDiscoveryService.getInstance();
  const twinService = DigitalTwinService.getInstance();
  const execMemory = ExecutiveMemoryService.getInstance();
  const goalGraph = GoalGraphService.getInstance();
  const eeis = EnterpriseExecutionIntelligenceService.getInstance();
  const eventBus = EventBus.getInstance();
  const outcomeService = OutcomeVerificationService.getInstance();
  const healthManager = HealthManager.getInstance();
  const decisionJournal = DecisionJournal.getInstance();
  const capabilityRegistry = CapabilityRegistry.getInstance();
  const semanticLayer = SemanticLayer.getInstance();
  const orgTimeline = OrganizationalTimeline.getInstance();
  const reasoningGraph = ReasoningGraph.getInstance();

  // Component States
  const [currentState, setCurrentState] = useState<string>(stateService.getCurrentState());
  const [ontologyEntities, setOntologyEntities] = useState<any[]>([]);
  const [ontologyRelations, setOntologyRelations] = useState<any[]>([]);
  const [timelineLandmarks, setTimelineLandmarks] = useState<any[]>([]);
  const [reasoningNodes, setReasoningNodes] = useState<any[]>([]);
  const [selectedReasoningNode, setSelectedReasoningNode] = useState<any | null>(null);
  const [scenarioResults, setScenarioResults] = useState<any | null>(null);
  const [operatingMetrics, setOperatingMetrics] = useState<any | null>(null);
  const [guidelines, setGuidelines] = useState<string>(stateService.getStateGuideline());
  const [kpiValue, setKpiValue] = useState<number>(185);
  const [isOutcomeVerified, setIsOutcomeVerified] = useState<boolean>(false);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [healthReports, setHealthReports] = useState<any[]>([]);
  const [twinBudgetDelta, setTwinBudgetDelta] = useState<number>(40000000);
  const [twinResult, setTwinResult] = useState<any>(null);
  
  // Execution Tasks State
  const [tasks, setTasks] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Simulation parameters
  const [simName, setSimName] = useState<string>('Ads Budget +40M');
  const [simVariable, setSimVariable] = useState<string>('MARKETING_ADS_BUDGET');

  useEffect(() => {
    // Initial fetch
    setTasks(eeis.listTasks());
    setDecisions(decisionJournal.listDecisions());
    
    // Seed initial decision entries if empty
    if (decisionJournal.listDecisions().length === 0) {
      decisionJournal.recordDecision({
        contextObjective: 'Expand Spa Franchise to Da Nang city',
        alternativesConsidered: ['Phương án A: Thuê mặt bằng Quận Hải Châu', 'Phương án B: Nhượng quyền thương hiệu'],
        votes: [
          { role: 'FINANCE', vote: 'APPROVE', rationale: 'CapEx fits Q3 budget constraints.' },
          { role: 'RISK_ANALYST', vote: 'REJECT', rationale: 'Da Nang market saturation presents mild risk.' }
        ],
        evidenceReferences: ['art-FILE_URI-001', 'git-commit::a2f89c0'],
        finalDecisionMode: 'CEO_APPROVAL',
        executiveReasoning: 'Approved location search in Hai Chau district based on high ROI twin projections.'
      });
      setDecisions(decisionJournal.listDecisions());
    }

    // Refresh health status list
    refreshHealthStatus();

    // Subscribe to EventBus
    eventBus.subscribe('TaskFailed', (payload: any) => {
      setSystemLogs(prev => [`[EventBus Alert] Event: TaskFailed | ID: ${payload.taskId} | Reason: ${payload.reason}`, ...prev]);
      setActiveAlerts(prev => [...prev, `Task ${payload.taskId} failed: ${payload.reason}`]);
    });
    eventBus.subscribe('TaskCompleted', (payload: any) => {
      setSystemLogs(prev => [`[EventBus Log] Event: TaskCompleted | ID: ${payload.taskId} | Name: ${payload.label}`, ...prev]);
    });

    // Run initial simulation
    runTwinSimulation();

    // Outcomes initial state
    const kpi = outcomeService.getKpi('o-01');
    if (kpi) {
      setKpiValue(kpi.currentValue);
      setIsOutcomeVerified(kpi.verified);
    }

    // Seed new cognitive layers
    setOntologyEntities(semanticLayer.getEntities());
    setOntologyRelations(semanticLayer.getRelations());
    setTimelineLandmarks(orgTimeline.getLandmarks());
    setReasoningNodes(reasoningGraph.getNodes());
    setSelectedReasoningNode(reasoningGraph.getNode('rev-drop') || null);
    setOperatingMetrics(eeis.getOperatingSystemMetrics());
    
    // Run scenario suite simulation
    const initialSuite = twinService.runScenarioSuite(simVariable, twinBudgetDelta || 40000000);
    setScenarioResults(initialSuite);
  }, []);

  const refreshHealthStatus = () => {
    const list = ['Claude-3.5-Sonnet-Code', 'GPT-4o-Reasoning'].map(id => {
      return healthManager.checkHealth(id);
    });
    setHealthReports(list);
  };

  const handleStateChange = (state: import('@/core/infrastructure/enterprise-state-service').EnterpriseState) => {
    stateService.setCurrentState(state);
    setCurrentState(state);
    setGuidelines(stateService.getStateGuideline());
    setSystemLogs(prev => [`[State Override] Changed state to ${state}. Gating policy updated.`, ...prev]);
  };

  const triggerKpiVerification = () => {
    const verified = outcomeService.verifyOutcomeKpi('o-01', kpiValue);
    setIsOutcomeVerified(verified);
    setSystemLogs(prev => [`[Outcome Auditor] Verified KPI for o-01 with value ${kpiValue} -> Status: ${verified ? 'PASSED' : 'DEGRADED'}`, ...prev]);
  };

  const triggerProviderTimeout = (provider: string) => {
    healthManager.reportTimeout(provider);
    refreshHealthStatus();
    setSystemLogs(prev => [`[Health Alert] Provider ${provider} TIMEOUT reported. Router activated self-healing.`, ...prev]);
  };

  const triggerProviderRecovery = (provider: string) => {
    healthManager.recoverService(provider);
    refreshHealthStatus();
    setSystemLogs(prev => [`[Health Recovery] Provider ${provider} recovered back to healthy status.`, ...prev]);
  };

  const runTwinSimulation = () => {
    const res = twinService.runTwinSimulation({
      simName,
      variableName: simVariable,
      variableDelta: twinBudgetDelta
    });
    setTwinResult(res);
  };

  const runScenarioSuiteSimulation = () => {
    const res = twinService.runScenarioSuite(simVariable, twinBudgetDelta || 40000000);
    setScenarioResults(res);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-white/60 backdrop-blur-md border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-20 border-b border-slate-200 flex items-center px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Brain className="text-white w-5 h-5 font-bold" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-wider text-slate-800">BELLA EOS</h1>
            <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest mt-0.5">EXECUTIVE CONTROL ROOM</p>
          </div>
        </div>

        {/* Tab List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Operational Dashboard</p>
          
          <button 
            onClick={() => setActiveTab('strategic')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'strategic' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Shield className="w-4 h-4" />
            <span>Strategic Control Room</span>
          </button>

          <button 
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'goals' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Goal &amp; Outcome Center</span>
          </button>

          <button 
            onClick={() => setActiveTab('decisions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'decisions' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Eye className="w-4 h-4" />
            <span>Executive Decision Center</span>
          </button>

          <button 
            onClick={() => setActiveTab('workforce')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'workforce' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Cpu className="w-4 h-4" />
            <span>Workforce Command</span>
          </button>

          <button 
            onClick={() => setActiveTab('execution')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'execution' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Execution Center</span>
          </button>

          <button 
            onClick={() => setActiveTab('twin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'twin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Digital Twin Simulation</span>
          </button>

          <button 
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'health' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Network className="w-4 h-4" />
            <span>Platform Health Console</span>
          </button>

          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'knowledge' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Knowledge &amp; SOP Center</span>
          </button>

          <button 
            onClick={() => setActiveTab('kpis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'kpis' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Enterprise KPI Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('timeline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'timeline' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs shadow-indigo-100/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Executive Timeline</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-white/40 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all border border-slate-200 active:scale-98"
          >
            ← Back to Ops Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* TOP STATUS BAR */}
        <header className="h-20 border-b border-slate-200 px-8 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md shadow-xs">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-800 uppercase tracking-wide">
              {activeTab === 'strategic' && 'Strategic Control Room'}
              {activeTab === 'goals' && 'Goal & Outcome Center'}
              {activeTab === 'decisions' && 'Executive Decision Center'}
              {activeTab === 'workforce' && 'Workforce Command & Intelligence'}
              {activeTab === 'execution' && 'Execution Center & DAG Visualizer'}
              {activeTab === 'twin' && 'Digital Twin & Simulation Engine'}
              {activeTab === 'health' && 'Platform Health & Self-Healing Console'}
              {activeTab === 'knowledge' && 'Enterprise Knowledge Center'}
              {activeTab === 'kpis' && 'Enterprise KPI Dashboard'}
              {activeTab === 'timeline' && 'Executive Timeline Replay'}
            </h2>
            <p className="text-[10px] text-indigo-650 font-mono tracking-wider mt-0.5">
              BELLA EOS CONSTITUTION SPECIFICATION v20.1
            </p>
          </div>

          {/* State Gating Switcher */}
          <div className="flex items-center gap-4 bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enterprise State:</span>
              <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
                <button 
                  onClick={() => handleStateChange('HEALTHY')}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${currentState === 'HEALTHY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  HEALTHY
                </button>
                <button 
                  onClick={() => handleStateChange('EXPANSION')}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${currentState === 'EXPANSION' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  EXPANSION
                </button>
                <button 
                  onClick={() => handleStateChange('CRISIS')}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${currentState === 'CRISIS' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  CRISIS
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          
           {/* TAB 1: STRATEGIC CONTROL ROOM */}
           {activeTab === 'strategic' && (
             <div className="space-y-6">
               {/* State Policy Guideline Alert */}
               <div className={`p-6 rounded-2xl border flex items-start gap-4 ${currentState === 'CRISIS' ? 'bg-rose-50 border-rose-200 text-rose-850' : currentState === 'STRESS' ? 'bg-amber-50 border-amber-200 text-amber-850' : 'bg-indigo-50 border-indigo-100 text-indigo-850'}`}>
                 <Shield className={`w-8 h-8 ${currentState === 'CRISIS' ? 'text-rose-600' : currentState === 'STRESS' ? 'text-amber-600' : 'text-indigo-600'} shrink-0`} />
                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider mb-1">State Gating Policy Guideline</h3>
                   <p className="text-xs leading-relaxed text-slate-650 font-medium">
                     {guidelines}
                   </p>
                 </div>
               </div>
 
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Executive Metrics Overview */}
                 <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Objectives</p>
                     <h3 className="text-3xl font-display font-extrabold text-slate-800">1 Goal Tree</h3>
                   </div>
                   <div className="border-t border-slate-100 pt-4 mt-6">
                     <p className="text-xs text-slate-500 flex items-center justify-between">
                       <span>Total Nested Tasks:</span>
                       <span className="font-semibold text-indigo-600">9 Nodes</span>
                     </p>
                   </div>
                 </div>
 
                 <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workforce Distribution</p>
                     <h3 className="text-3xl font-display font-extrabold text-slate-800">AI: 85% / Human: 15%</h3>
                   </div>
                   <div className="border-t border-slate-100 pt-4 mt-6">
                     <p className="text-xs text-slate-500 flex items-center justify-between">
                       <span>Active AI Allocations:</span>
                       <span className="font-semibold text-cyan-600">5 Workers</span>
                     </p>
                   </div>
                 </div>
 
                 <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outcome Success Rate</p>
                     <h3 className="text-3xl font-display font-extrabold text-slate-800">94.5%</h3>
                   </div>
                   <div className="border-t border-slate-100 pt-4 mt-6">
                     <p className="text-xs text-slate-500 flex items-center justify-between">
                       <span>Verified Outcome KPIs:</span>
                       <span className="font-semibold text-emerald-600">1 / 1 Met</span>
                     </p>
                   </div>
                 </div>
               </div>
 
               {/* Active Executive Alerts */}
               <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                 <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                   <AlertCircle className="w-5 h-5 text-indigo-650" />
                   <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Active Executive Alerts</h3>
                 </div>
                 {activeAlerts.length === 0 ? (
                   <p className="text-xs text-slate-450 italic">No operational anomalies or SLA failures reported.</p>
                 ) : (
                   <div className="space-y-2">
                     {activeAlerts.map((alert, idx) => (
                       <div key={idx} className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-pulse font-medium shadow-2xs">
                         <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                         <span>{alert}</span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
           )}

          {/* TAB 2: GOAL & OUTCOME CENTER */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-indigo-650" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Goal Tree &amp; Outcome Hierarchy</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold">9 Nodes Map</span>
                </div>

                {/* Vertical tree representation */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-2xs">
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">VISION</span>
                    <h4 className="text-sm font-bold mt-2 text-slate-800">Become the most trusted premium spa chain in South East Asia.</h4>
                  </div>
                  
                  <div className="ml-6 border-l border-slate-200 pl-6 space-y-4">
                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-2xs">
                      <span className="text-[9px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">GOAL</span>
                      <h4 className="text-sm font-bold mt-2 text-slate-800">Expand to 3 new cities by end of 2026.</h4>
                    </div>

                    <div className="ml-6 border-l border-slate-200 pl-6 space-y-4">
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">OUTCOME</span>
                          <h4 className="text-sm font-bold mt-2 text-slate-850 font-display">Da Nang branch operational and generating sustainable revenue.</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Target Metric: Da Nang Spa Leads Acquisition Target: 200 leads.</p>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Current leads count</p>
                            <input 
                              type="number"
                              value={kpiValue}
                              onChange={(e) => setKpiValue(parseInt(e.target.value) || 0)}
                              className="w-24 bg-slate-50 border border-slate-200 rounded p-1 text-xs mt-1 text-slate-850 font-bold text-center"
                            />
                          </div>
                          <button
                            onClick={triggerKpiVerification}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-2 rounded uppercase tracking-wider transition-colors cursor-pointer self-end shadow-xs"
                          >
                            Verify KPI
                          </button>
                        </div>
                      </div>

                      <div className="ml-6 pl-4 flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isOutcomeVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                          {isOutcomeVerified ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <AlertTriangle className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          Outcome Verification Status: {isOutcomeVerified ? (
                            <span className="text-emerald-600 font-bold uppercase tracking-wider">VERIFIED (Target Met)</span>
                          ) : (
                            <span className="text-amber-600 font-bold uppercase tracking-wider">DEGRADED (Under target)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enterprise Semantic Layer (Business Ontology Schema) */}
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <Network className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Enterprise Semantic Layer (Business Ontology Schema)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Entity nodes list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Registered Ontological Concepts</p>
                    {ontologyEntities.map(ent => (
                      <div key={ent.id} className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{ent.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{ent.description}</p>
                        </div>
                        <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded ${ent.type === 'CONCEPT' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {ent.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Relationship mapping diagram list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Active Semantic Connections</p>
                    {ontologyRelations.map((rel, idx) => {
                      const srcNode = ontologyEntities.find(e => e.id === rel.sourceId);
                      const targetNode = ontologyEntities.find(e => e.id === rel.targetId);
                      return (
                        <div key={idx} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs flex items-center gap-2 text-slate-700 shadow-2xs">
                          <span className="font-bold text-slate-850">{srcNode?.name || rel.sourceId}</span>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-mono font-semibold">
                            {rel.type}
                          </span>
                          <span className="font-bold text-slate-850">{targetNode?.name || rel.targetId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTIVE DECISION CENTER & JOURNAL */}
          {activeTab === 'decisions' && (
            <div className="space-y-6">
              {/* Expert Deliberation Board */}
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <Shield className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Executive Expert Deliberation Board</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center shadow-2xs">
                    <p className="text-xs font-bold text-slate-800">FINANCE</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block">🟢 APPROVE</span>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">"CapEx fits budget constraints."</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center shadow-2xs">
                    <p className="text-xs font-bold text-slate-800">RISK_ANALYST</p>
                    <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block">🔴 REJECT</span>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">"Da Nang market saturation presents risk."</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center shadow-2xs">
                    <p className="text-xs font-bold text-slate-800">LEGAL</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block">🟢 APPROVE</span>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">"Entity structure matches guidelines."</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center shadow-2xs">
                    <p className="text-xs font-bold text-slate-800">OPERATIONS</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block">🟢 APPROVE</span>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">"Staff pipelines can cover training."</p>
                  </div>
                </div>
              </div>

              {/* Enterprise Reasoning Graph */}
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <GitBranch className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Enterprise Reasoning Graph (Causal Chains)</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left column: List of reasoning nodes */}
                  <div className="space-y-2 lg:col-span-1 border-r border-slate-200/60 pr-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Causal Node</p>
                    {reasoningNodes.map(node => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedReasoningNode(node)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer block ${selectedReasoningNode?.id === node.id ? 'bg-indigo-50 border-indigo-200 text-indigo-650 shadow-2xs font-bold' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{node.label}</span>
                          <span className={`text-[8.5px] font-mono px-1.5 rounded font-bold ${node.type === 'ROOT_CAUSE' ? 'bg-rose-50 text-rose-600 border border-rose-100' : node.type === 'ANOMALY' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {node.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Right columns: Traced cause path visualization */}
                  <div className="lg:col-span-2 space-y-4">
                    {selectedReasoningNode ? (
                      <div className="space-y-4 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-2xs">
                        <div className="flex justify-between items-start border-b border-slate-200/60 pb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{selectedReasoningNode.label}</h4>
                            <p className="text-[10px] text-indigo-600 font-mono mt-0.5">ID: {selectedReasoningNode.id}</p>
                          </div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                            {selectedReasoningNode.type}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                          <p><strong>Description:</strong> {selectedReasoningNode.description}</p>
                          {selectedReasoningNode.evidenceNotes && (
                            <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-500 font-medium">
                              <strong>Evidence Note:</strong> {selectedReasoningNode.evidenceNotes}
                            </p>
                          )}
                        </div>

                        {/* Causal Chain Trace representation */}
                        <div className="border-t border-slate-200/60 pt-3 space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Replay Path (Causal Linkages)</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {reasoningGraph.traceCausalPath(selectedReasoningNode.id).map((step, sIdx, array) => (
                              <React.Fragment key={step.id}>
                                <span className={`px-2.5 py-1 rounded-lg border font-medium ${step.id === selectedReasoningNode.id ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                                  {step.label}
                                </span>
                                {sIdx < array.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 italic">Select a reasoning node on the left to replay the causal chains.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Decision Journal */}
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-650" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Enterprise Decision Journal</h3>
                  </div>
                  <div className="relative w-64 shrink-0">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search decisions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {decisions
                    .filter(d => d.contextObjective.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((d, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{d.contextObjective}</h4>
                            <p className="text-[10px] text-slate-550 mt-0.5 font-mono">{d.timestamp}</p>
                          </div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold">{d.finalDecisionMode}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                          <strong>Rationale reasoning:</strong> {d.executiveReasoning}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
                          {d.votes.map((v: any, vIdx: number) => (
                            <span key={vIdx} className="text-[9.5px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-medium shadow-2xs">
                              <span className="font-bold text-slate-800">{v.role}</span>: {v.vote === 'APPROVE' ? '🟢' : '🔴'} {v.rationale}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKFORCE COMMAND */}
          {activeTab === 'workforce' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Agents Command */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                    <Cpu className="w-5 h-5 text-cyan-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">AI Workers Command</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-800">AI Marketing Assistant</p>
                        <p className="text-[10px] text-slate-500 font-medium">Model: Claude-3.5-Sonnet-Code</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase tracking-wider">IDLE (0/20 Queue)</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-800">AI Scraper Bot</p>
                        <p className="text-[10px] text-slate-500 font-medium">Model: Claude-3.5-Sonnet-Code</p>
                      </div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wider">BUSY (7/20 Queue)</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-800">AI Analyst Worker</p>
                        <p className="text-[10px] text-slate-500 font-medium">Model: Gemini-1.5-Pro-Backup</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase tracking-wider">IDLE (0/20 Queue)</span>
                    </div>
                  </div>
                </div>

                {/* Human Workers Command */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                    <User className="w-5 h-5 text-indigo-650" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Human Personnel Command</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Marketing Lead</p>
                        <p className="text-[10px] text-slate-500 font-medium">Timezone: GMT+7 (HN/HCM)</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase tracking-wider">AVAILABLE (0/5 Tasks)</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Operations Director</p>
                        <p className="text-[10px] text-slate-500 font-medium">Timezone: GMT+7 (HN/HCM)</p>
                      </div>
                      <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 font-bold uppercase tracking-wider">OCCUPIED (2/5 Tasks)</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Risk Director</p>
                        <p className="text-[10px] text-slate-500 font-medium">Timezone: GMT+7 (HN/HCM)</p>
                      </div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase tracking-wider">AVAILABLE (0/5 Tasks)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXECUTION CENTER & DAG */}
          {activeTab === 'execution' && (
            <div className="space-y-6">
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <Activity className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Execution Center Graph &amp; DAG Status</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tasks.map(t => (
                    <div 
                      key={t.id} 
                      className={`bg-slate-50 p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-2xs ${t.criticalPath ? 'border-amber-400/80 shadow-xs shadow-amber-500/5 font-medium' : 'border-slate-200/60'}`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-xs font-bold text-slate-800">{t.label}</h4>
                          <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : t.status === 'BLOCKED' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Assignee: {t.assigneeName} ({t.assigneeType})</p>
                        
                        {t.criticalPath && (
                          <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
                            ⚠️ Critical Path Node
                          </span>
                        )}
                        {t.parallelGroup && (
                          <p className="text-[9px] text-slate-450 mt-1">Parallel Group ID: <code className="font-mono text-slate-600 font-bold">{t.parallelGroup}</code></p>
                        )}
                      </div>

                      <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Due: {t.dueDate.substring(0, 10)}</span>
                        <span>Rework Cycles: R{t.reworkIteration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PLATFORM HEALTH & SELF-HEALING */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <Network className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Services Health Status</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthReports.map((report, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between gap-6 shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">{report.serviceId}</h4>
                        <p className="text-[10px] text-slate-450 font-mono">Last Checked: {report.lastChecked.substring(11, 19)}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Active Fallbacks: {report.fallbacksConfigured.join(', ')}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${report.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-600 border-emerald-250' : 'bg-rose-50 text-rose-600 border-rose-250 animate-pulse'}`}>
                          {report.status}
                        </span>
                        
                        {report.status === 'HEALTHY' ? (
                          <button
                            onClick={() => triggerProviderTimeout(report.serviceId)}
                            className="bg-rose-650 hover:bg-rose-550 border border-rose-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                          >
                            Timeout
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerProviderRecovery(report.serviceId)}
                            className="bg-emerald-650 hover:bg-emerald-550 border border-emerald-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                          >
                            Recover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time System Event Log */}
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <Terminal className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">System Event Bus Stream Logs</h3>
                </div>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl max-h-60 overflow-y-auto space-y-2 scrollbar-thin shadow-inner">
                  {systemLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Listening for asynchronous events from ECOS Services...</p>
                  ) : (
                    systemLogs.map((log, idx) => (
                      <div key={idx} className="text-[11px] font-mono text-slate-300 leading-normal border-b border-slate-900 pb-1.5 last:border-b-0">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DIGITAL TWIN SIMULATION */}
          {activeTab === 'twin' && (
            <div className="space-y-6">
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Digital Twin Pre-Simulation Config</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Simulation Name</label>
                      <input 
                        type="text"
                        value={simName}
                        onChange={(e) => setSimName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-medium shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Variable Delta (Value)</label>
                      <input 
                        type="number"
                        value={twinBudgetDelta}
                        onChange={(e) => setTwinBudgetDelta(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono font-bold shadow-2xs"
                      />
                    </div>

                    <button
                      onClick={runTwinSimulation}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                    >
                      Run Pre-Simulation
                    </button>
                  </div>

                  {twinResult && (
                    <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl space-y-4 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sim Output Projections</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-2xs">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Est Revenue Delta</p>
                          <p className="text-sm font-bold text-emerald-600 mt-1">+{twinResult.projectedRevenueDeltaVnd.toLocaleString()} VND</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-2xs">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Friction Score</p>
                          <p className="text-sm font-bold text-slate-700 mt-1">{twinResult.projectedResourceFrictionScore} / 100</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-semibold">Resource Bottleneck Warnings:</p>
                        {twinResult.potentialBottlenecks.length === 0 ? (
                          <p className="text-xs text-slate-450 italic font-medium">No capacity bottleneck detected for active resources.</p>
                        ) : (
                          <div className="space-y-1">
                            {twinResult.potentialBottlenecks.map((warn: string, idx: number) => (
                              <p key={idx} className="text-xs text-rose-600 font-medium">⚠️ {warn}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scenario Suite & Recommendations */}
              {scenarioResults && (
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                    <Sparkles className="w-5 h-5 text-indigo-650" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Scenario Simulation Suite (15 Scenarios Scored)</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Columns: Scenarios table list */}
                    <div className="lg:col-span-2 space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Simulated Permutations</p>
                      <div className="space-y-2">
                        {scenarioResults.scenarios.map((sc: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                            <span className="font-bold text-slate-700">Delta: {(sc.deltaValue / 1_000_000).toFixed(1)}M VND</span>
                            <div className="flex items-center gap-4">
                              <span className="text-emerald-600 font-mono font-semibold">+{sc.projectedRevenueDeltaVnd.toLocaleString()} VND</span>
                              <span className="text-slate-500 font-medium">Friction: {sc.projectedResourceFrictionScore}</span>
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${sc.score > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                Score: {(sc.score / 1_000_000).toFixed(1)}M
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Top 3 recommendations */}
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top 3 Recommended Scenarios</p>
                      {scenarioResults.topRecommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-r from-indigo-50/40 to-slate-50 border border-indigo-100 p-4 rounded-xl space-y-2 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-600">Option #{idx + 1}</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 font-mono font-bold">HIGH UTILITY</span>
                          </div>
                          <p className="text-xs text-slate-700 font-semibold">Adjust Delta: <strong>{(rec.deltaValue / 1_000_000).toFixed(1)}M VND</strong></p>
                          <div className="text-[11px] text-slate-500 space-y-1 font-medium">
                            <p>Revenue Delta: <span className="text-emerald-600 font-bold">+{rec.projectedRevenueDeltaVnd.toLocaleString()} VND</span></p>
                            <p>Friction: <span className="font-bold text-slate-750">{rec.projectedResourceFrictionScore} / 100</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: KNOWLEDGE CENTER */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                  <FileText className="w-5 h-5 text-indigo-650" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Executive Memory Mandates</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">BRAND_PHILOSOPHY</span>
                    <p className="text-xs text-slate-700 mt-2 font-semibold">
                      "Bella NEVER competes on price. We compete on quality, premium experience, and customer trust."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ENTERPRISE KPI DASHBOARD */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Business Performance */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-150 pb-2">Business Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Target Revenue</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">500,000,000 VND</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">KPI Target Met</p>
                      <p className="text-sm font-bold text-emerald-600 mt-1">100%</p>
                    </div>
                  </div>
                </div>

                {/* 2. Execution Performance */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-150 pb-2">Execution Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Success Rate</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">94.5%</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Average Rework</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">0.8 Iterations</p>
                    </div>
                  </div>
                </div>

                {/* 3. Workforce Performance */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-150 pb-2">Workforce Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI ROI Index</p>
                      <p className="text-sm font-bold text-cyan-600 mt-1">320% ROI</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Automation Index</p>
                      <p className="text-sm font-bold text-indigo-600 mt-1">82.5% Rate</p>
                    </div>
                  </div>
                </div>

                {/* 4. Platform Health */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-150 pb-2">Platform Health</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">System State</p>
                      <p className="text-sm font-bold text-emerald-600 mt-1">HEALTHY</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Providers</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">2 Online</p>
                    </div>
                  </div>
                </div>

                {/* 5. Enterprise Operating Metrics (OS Performance) */}
                {operatingMetrics && (
                  <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-4 md:col-span-2 shadow-xs">
                    <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-widest border-b border-slate-150 pb-2">Enterprise Cognitive OS Operational Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mean Time To Decision</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{operatingMetrics.meanTimeToDecisionMinutes} mins</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Average Debate Length</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{operatingMetrics.averageDebateLengthMinutes} mins</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Policy Override Rate</p>
                        <p className="text-sm font-bold text-amber-600 mt-1">{operatingMetrics.policyOverrideRatePercentage}%</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Agreement Ratio</p>
                        <p className="text-sm font-bold text-cyan-600 mt-1">{operatingMetrics.aiAgreementPercentage}%</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 10: EXECUTIVE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel 1: Operational Timeline (Replay) */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                    <Clock className="w-5 h-5 text-indigo-650" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Chronological Replay Timeline</h3>
                  </div>

                  <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                    <div className="relative pl-8">
                      <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 border-white shadow-2xs"></span>
                      <p className="text-[10px] font-mono text-indigo-600">09:00 AM</p>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">CEO Created Objective</h4>
                      <p className="text-xs text-slate-500 font-medium">"Expand spa business to Da Nang regional center"</p>
                    </div>

                    <div className="relative pl-8">
                      <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-500 border-4 border-white shadow-2xs"></span>
                      <p className="text-[10px] font-mono text-cyan-600">09:03 AM</p>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">ECR Formulated Decomposed Plan Nodes</h4>
                      <p className="text-xs text-slate-500 font-medium">Created 3 Deliverables, 9 Task DAGs</p>
                    </div>

                    <div className="relative pl-8">
                      <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-white shadow-2xs"></span>
                      <p className="text-[10px] font-mono text-emerald-600">09:05 AM</p>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">EDR Expert Board Vote Passed</h4>
                      <p className="text-xs text-slate-500 font-medium">Approved Hai Chau location route (3 approvals, 1 rejection)</p>
                    </div>

                    <div className="relative pl-8">
                      <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 border-white shadow-2xs"></span>
                      <p className="text-[10px] font-mono text-indigo-600">09:09 AM</p>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">AI Marketing Worker Initiated Task Execution</h4>
                      <p className="text-xs text-slate-500 font-medium">Compiled competitor pricing audit dataset</p>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Corporate History Memory Timeline (Landmarks) */}
                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                    <Database className="w-5 h-5 text-indigo-650" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Organizational Memory Landmarks</h3>
                  </div>

                  <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                    {timelineLandmarks.map((lm, idx) => (
                      <div key={idx} className="relative pl-8">
                        <span className={`absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-4 border-white shadow-2xs ${lm.category === 'EXPANSION' ? 'bg-indigo-500' : lm.category === 'ACQUISITION' ? 'bg-cyan-500' : lm.category === 'FINANCE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <p className="text-[10px] font-mono text-slate-500">{lm.month} {lm.year}</p>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{lm.label}</h4>
                        <p className="text-xs text-slate-550 font-medium">{lm.description}</p>
                        {lm.impactNotes && <p className="text-[10px] text-indigo-600 mt-0.5 font-semibold">Impact: {lm.impactNotes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
