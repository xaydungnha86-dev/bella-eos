"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, Cpu, Network, Database, Activity, RefreshCw, ChevronLeft, 
  CheckCircle2, AlertTriangle, Layers, Clock, Zap, Lock, Terminal, Sparkles, Key
} from 'lucide-react';
import { CapabilityGraph, CapabilityNode } from '@/core/capability/capability-graph';
import { EventStore, DomainEvent } from '@/core/event-sourcing/event-store';
import { PolicyRepository } from '@/core/governance/policy-repository';

export default function AdminControlTowerPage() {
  const [capabilities, setCapabilities] = useState<CapabilityNode[]>([]);
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [selectedCapability, setSelectedCapability] = useState<CapabilityNode | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    // Load Capability Graph
    const graph = CapabilityGraph.getInstance();
    const nodes = graph.getAllNodes();
    setCapabilities(nodes);
    if (nodes.length > 0) setSelectedCapability(nodes[0]);

    // Load Event Store
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const store = EventStore.getInstance();
    const all = await store.getAllEvents();
    setEvents(all);
  };

  const handleReplayEvents = async () => {
    setIsReplaying(true);
    const store = EventStore.getInstance();
    await store.replayEvents();
    await loadEvents();
    setIsReplaying(false);
  };

  const policies = PolicyRepository.getInstance().getAllPolicies();

  return (
    <div className="min-h-screen bg-[#fafafb] text-[#1e293b] font-sans p-6">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              BELLA EOS Admin Control Tower
              <span className="px-2.5 py-0.5 text-[11px] font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full font-semibold">v1.0 Baseline</span>
            </h1>
            <p className="text-xs text-slate-500">Tháp Điều Hành Kỹ Thuật • Quản Trị Đồ Thị Năng Lực & Event Store</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReplayEvents}
            disabled={isReplaying}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
            {isReplaying ? 'Replaying State...' : 'Replay Event Projections'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200/60">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Capability Graph Nodes</div>
              <div className="text-2xl font-bold text-slate-900">{capabilities.length} <span className="text-xs font-normal text-slate-400">nodes</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Domain Event Store Logs</div>
              <div className="text-2xl font-bold text-slate-900">{events.length} <span className="text-xs font-normal text-slate-400">events</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/60">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Policy-as-Code</div>
              <div className="text-2xl font-bold text-slate-900">{policies.length} <span className="text-xs font-normal text-slate-400">policies</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/60">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">P95 System Latency</div>
              <div className="text-2xl font-bold text-slate-900">125 <span className="text-xs font-normal text-slate-400">ms</span></div>
            </div>
          </div>
        </div>

        {/* Capability Graph Grid Section */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-600" />
              <h2 className="text-base font-bold text-slate-900">Hierarchical Capability Graph & Metadata</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Decoupled Business Capabilities v1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Capability Nodes List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {capabilities.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedCapability(node)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCapability?.id === node.id 
                      ? 'bg-cyan-50/70 border-cyan-300 shadow-xs' 
                      : 'bg-slate-50/50 border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">{node.name}</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-slate-200/80 text-slate-700 rounded font-semibold">{node.category}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">{node.description}</div>
                </div>
              ))}
            </div>

            {/* Selected Capability Details Card */}
            {selectedCapability && (
              <div className="md:col-span-2 bg-slate-50/60 border border-slate-200/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {selectedCapability.name}
                      <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold">
                        {selectedCapability.metadata.stability}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500 font-mono">ID: {selectedCapability.id} • Version: {selectedCapability.version}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Owner</div>
                    <div className="text-xs font-bold text-cyan-700">{selectedCapability.metadata.owner}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{selectedCapability.description}</p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
                    <div className="text-[11px] text-slate-400 font-medium">Execution SLA</div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                      {selectedCapability.metadata.slaSeconds}s
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
                    <div className="text-[11px] text-slate-400 font-medium">Cost Profile</div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {selectedCapability.metadata.costProfile}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-2xs">
                    <div className="text-[11px] text-slate-400 font-medium">Permissions</div>
                    <div className="text-xs font-mono font-semibold text-purple-700 truncate mt-0.5">
                      {selectedCapability.metadata.permissions.join(', ')}
                    </div>
                  </div>
                </div>

                {selectedCapability.dependsOnCapabilityIds.length > 0 && (
                  <div className="pt-1">
                    <div className="text-xs font-semibold text-slate-500 mb-1">Dependencies</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCapability.dependsOnCapabilityIds.map(depId => (
                        <span key={depId} className="px-2.5 py-1 text-xs bg-white border border-slate-200/80 text-slate-700 rounded-lg font-mono shadow-2xs">
                          🔗 {depId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Event Store Replay Logs */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Domain Event Store Audit & Time Travel Logs</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Append-Only Event Store</span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <div className="text-slate-400 text-center py-6">Chưa có Domain Event nào được phát sinh trong phiên làm việc hiện tại.</div>
            ) : (
              events.map((evt, idx) => (
                <div key={evt.eventId || idx} className="p-3 bg-white rounded-lg border border-slate-200/80 flex items-start justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-700 font-bold">[{evt.eventType}]</span>
                      <span className="text-slate-700 font-sans text-xs">Aggregate: {evt.aggregateId} ({evt.aggregateType})</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1 line-clamp-1">Payload: {JSON.stringify(evt.payload)}</div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    <div>v{evt.version}</div>
                    <div>{new Date(evt.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Policy-as-Code Governance Panel */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Active Policy-as-Code Governance Rules</h2>
            </div>
            <span className="text-xs text-slate-400">Policy Engine Compliance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map(pol => (
              <div key={pol.policyId} className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800">{pol.policyId}</span>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-mono font-semibold">
                    {pol.category}
                  </span>
                </div>
                <div className="text-xs text-slate-700 leading-normal">{pol.description}</div>
                <div className="text-[10px] font-mono text-slate-400">Version: {pol.version}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
