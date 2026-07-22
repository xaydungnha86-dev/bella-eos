"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Key, CheckCircle2, AlertTriangle,
  Eye, EyeOff, Save, Trash2, Loader2, RefreshCw, ShieldCheck, Settings, X
} from 'lucide-react';

// ─── localStorage key ────────────────────────────────────────────────────────
const LS_KEY = 'bella_eos_integrations';

// ─── Helper: read/write localStorage ─────────────────────────────────────────
function lsRead(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function lsWrite(data: Record<string, string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function lsDelete(storeKey: string) {
  const d = lsRead(); delete d[storeKey]; lsWrite(d);
}

// ─── Integration Catalogue ────────────────────────────────────────────────────
const INTEGRATION_CATALOGUE = [
  {
    provider: 'bella_eip',
    category: 'ERP / Kế toán',
    icon: '🏛️',
    name: 'Bella EIP Link',
    color: 'from-indigo-600 to-violet-600',
    description: 'Kết nối đồng bộ thông tin khách hàng, báo cáo tài chính và chỉ thị chiến lược từ Bella EIP.',
    docsUrl: 'https://docs.bella.vn/eip-integration',
    fields: [
      { key_name: 'api_url', label: 'EIP Endpoint URL', placeholder: 'https://eip.bella.vn/api/v1', type: 'text' as const, help: 'Đường dẫn API của phân hệ Bella EIP doanh nghiệp của bạn' },
      { key_name: 'api_key', label: 'EIP API Key', placeholder: 'eip_key_...', type: 'password' as const, help: 'API Key được sinh từ Console quản trị của Bella EIP' },
    ]
  },
  {
    provider: 'facebook',
    category: 'Mạng Xã Hội',
    icon: '📘',
    name: 'Facebook Fanpage',
    color: 'from-blue-500 to-indigo-500',
    description: 'Đăng bài tự động lên Fanpage Facebook thông qua Graph API v18.0.',
    docsUrl: 'https://developers.facebook.com/docs/graph-api/reference/page/feed/',
    fields: [
      { key_name: 'page_access_token', label: 'Page Access Token', placeholder: 'EAAG...', type: 'password' as const, help: 'Lấy từ developers.facebook.com → Apps → Access Tokens → Generate Page Token' },
      { key_name: 'page_id', label: 'Page ID', placeholder: 'Số ID Fanpage của bạn (vd: 123456789)', type: 'text' as const, help: 'Tìm trong About → Page ID trên trang Facebook của bạn' },
    ]
  },
  {
    provider: 'zalo',
    category: 'Mạng Xã Hội',
    icon: '💬',
    name: 'Zalo Official Account',
    color: 'from-sky-500 to-blue-500',
    description: 'Gửi ZNS, tin nhắn OA đến khách hàng Zalo.',
    docsUrl: 'https://developers.zalo.me/docs/api/official-account-api',
    fields: [
      { key_name: 'access_token', label: 'OA Access Token', placeholder: 'v3...', type: 'password' as const, help: 'Lấy từ developers.zalo.me → My Apps → Tạo Access Token' },
      { key_name: 'oa_id', label: 'OA ID', placeholder: '012345678', type: 'text' as const, help: 'ID của Official Account Zalo (tìm trong Cài đặt OA)' },
    ]
  },
  {
    provider: 'tiktok',
    category: 'Mạng Xã Hội',
    icon: '🎵',
    name: 'TikTok Business',
    color: 'from-rose-500 to-pink-500',
    description: 'Đăng video & quản lý chiến dịch TikTok Ads.',
    docsUrl: 'https://business-api.tiktok.com/portal/docs',
    fields: [
      { key_name: 'access_token', label: 'TikTok Access Token', placeholder: 'ato...', type: 'password' as const, help: 'Lấy từ TikTok for Business → API Access' },
      { key_name: 'advertiser_id', label: 'Advertiser ID', placeholder: '...', type: 'text' as const, help: 'Tìm trong TikTok Ads Manager → Settings' },
    ]
  },
  {
    provider: 'openai',
    category: 'Mô hình AI',
    icon: '🔮',
    name: 'OpenAI (GPT-4o)',
    color: 'from-emerald-500 to-teal-500',
    description: 'Gọi GPT-4o, GPT-4-turbo để viết nội dung và phân tích dữ liệu.',
    docsUrl: 'https://platform.openai.com/api-keys',
    fields: [
      { key_name: 'api_key', label: 'API Key', placeholder: 'sk-proj-...', type: 'password' as const, help: 'Lấy từ platform.openai.com → API Keys' },
    ]
  },
  {
    provider: 'anthropic',
    category: 'Mô hình AI',
    icon: '🧠',
    name: 'Anthropic Claude',
    color: 'from-amber-500 to-orange-500',
    description: 'Gọi Claude 3.5 Sonnet để phân tích chiến lược & code.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    fields: [
      { key_name: 'api_key', label: 'API Key', placeholder: 'sk-ant-...', type: 'password' as const, help: 'Lấy từ console.anthropic.com → Settings → API Keys' },
    ]
  },
  {
    provider: 'gemini',
    category: 'Mô hình AI',
    icon: '✨',
    name: 'Google Gemini',
    color: 'from-violet-500 to-purple-500',
    description: 'Gọi Gemini 2.5 Pro để xử lý hình ảnh, video và tài liệu.',
    docsUrl: 'https://aistudio.google.com',
    fields: [
      { key_name: 'api_key', label: 'API Key', placeholder: 'AIza...', type: 'password' as const, help: 'Lấy từ aistudio.google.com → Get API Key' },
    ]
  },
  {
    provider: 'misa',
    category: 'ERP / Kế toán',
    icon: '🏢',
    name: 'MISA SME / AMIS',
    color: 'from-cyan-500 to-blue-500',
    description: 'Đồng bộ hoá đơn, kho hàng, nhân sự từ MISA AMIS CRM.',
    docsUrl: 'https://developer.misacloud.com',
    fields: [
      { key_name: 'api_key', label: 'API Key', placeholder: 'misa_...', type: 'password' as const, help: 'Tìm trong MISA AMIS → Cài đặt → Tích hợp API' },
      { key_name: 'company_id', label: 'Company ID', placeholder: 'company_...', type: 'text' as const, help: 'Mã công ty trong hệ thống MISA' },
    ]
  },
  {
    provider: 'sap',
    category: 'ERP / Kế toán',
    icon: '⚙️',
    name: 'SAP Business One',
    color: 'from-blue-700 to-indigo-700',
    description: 'Đọc dữ liệu tài chính, kho hàng và mua hàng từ SAP B1.',
    docsUrl: 'https://api.sap.com',
    fields: [
      { key_name: 'base_url', label: 'SAP Server URL', placeholder: 'https://sap.yourcompany.com:50000', type: 'text' as const, help: 'Địa chỉ máy chủ SAP Service Layer' },
      { key_name: 'username', label: 'Tên đăng nhập', placeholder: 'manager', type: 'text' as const, help: 'Tài khoản SAP B1 có quyền API' },
      { key_name: 'password', label: 'Mật khẩu', placeholder: '••••••••', type: 'password' as const, help: 'Mật khẩu đăng nhập SAP B1' },
    ]
  },
];

export default function IntegrationSettingsPage() {
  const [activeCategory, setActiveCategory] = useState('Mạng Xã Hội');
  // draft values while typing (not yet saved)
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  // stored = { 'facebook::page_access_token': '****' } — stored in localStorage
  const [stored, setStored] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saveFlash, setSaveFlash] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categories = [...new Set(INTEGRATION_CATALOGUE.map(i => i.category))];
  const storeKey = (provider: string, key_name: string) => `${provider}::${key_name}`;
  const savedCount = Object.keys(stored).length;

  // Load from localStorage on mount
  useEffect(() => {
    setStored(lsRead());
  }, []);

  // Toast helper
  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Save one field
  const handleSave = useCallback(async (provider: string, key_name: string, integrationName: string, label: string) => {
    const sk = storeKey(provider, key_name);
    const value = draft[sk]?.trim();
    if (!value) {
      toast('⚠️ Vui lòng nhập giá trị trước khi lưu.');
      return;
    }

    setSaving(p => ({ ...p, [sk]: true }));
    // Simulate a brief async (e.g., future: sync to Supabase)
    await new Promise(r => setTimeout(r, 400));

    // Write to localStorage
    const current = lsRead();
    current[sk] = value;
    lsWrite(current);
    setStored(current);

    // Clear draft for this field
    setDraft(p => { const n = { ...p }; delete n[sk]; return n; });
    setSaving(p => ({ ...p, [sk]: false }));

    // Flash confirmation
    setSaveFlash(p => ({ ...p, [sk]: true }));
    setTimeout(() => setSaveFlash(p => ({ ...p, [sk]: false })), 2000);

    toast(`✅ Đã lưu ${integrationName} — ${label}`);
  }, [draft]);

  // Delete one field
  const handleDelete = useCallback((provider: string, key_name: string) => {
    const sk = storeKey(provider, key_name);
    lsDelete(sk);
    setStored(lsRead());
    setDraft(p => { const n = { ...p }; delete n[sk]; return n; });
    toast('🗑️ Đã xoá API Key.');
  }, []);

  const visible = INTEGRATION_CATALOGUE.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* ── TOAST ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <nav className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Dashboard</span>
        </Link>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-500" />
          <h1 className="font-display font-bold text-sm text-slate-800">Cài Đặt Tích Hợp</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>API Keys được lưu cục bộ (localStorage) — chỉ trình duyệt này đọc được</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6">

        {/* ── SIDEBAR ── */}
        <aside className="w-48 shrink-0 sticky top-20 self-start space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 px-1">Danh mục</p>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
            >
              {cat}
            </button>
          ))}

          {/* Connected count */}
          <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-display font-bold text-indigo-600">{savedCount}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">API Keys đã lưu</p>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 space-y-4">
          {visible.map(integration => {
            const allSaved = integration.fields.every(f => stored[storeKey(integration.provider, f.key_name)]);

            return (
              <div key={integration.provider} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">

                {/* Card Header */}
                <div className="p-5 flex items-start gap-4 border-b border-slate-100">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display font-bold text-sm text-slate-800">{integration.name}</h2>
                      {allSaved && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Đã kết nối
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{integration.description}</p>
                  </div>
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-500 hover:underline shrink-0 mt-0.5"
                  >
                    Hướng dẫn lấy key →
                  </a>
                </div>

                {/* Fields */}
                <div className="p-5 space-y-5">
                  {integration.fields.map(field => {
                    const sk = storeKey(integration.provider, field.key_name);
                    const isSaved = !!stored[sk];
                    const isSaving = saving[sk];
                    const flashed = saveFlash[sk];
                    const draftVal = draft[sk] ?? '';

                    return (
                      <div key={field.key_name}>
                        {/* Label row */}
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                            <Key className="w-3 h-3 text-slate-400" />
                            {field.label}
                          </label>
                          {isSaved && (
                            <button
                              onClick={() => handleDelete(integration.provider, field.key_name)}
                              className="text-[9px] text-red-400 hover:text-red-600 flex items-center gap-1 cursor-pointer font-semibold"
                            >
                              <Trash2 className="w-3 h-3" /> Xoá & nhập lại
                            </button>
                          )}
                        </div>

                        {/* Saved pill */}
                        {isSaved ? (
                          <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${flashed ? 'bg-emerald-100 border-emerald-300' : 'bg-emerald-50 border-emerald-100'}`}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-[11px] text-emerald-700 font-mono tracking-wider">••••••••••••••••••••</span>
                            <span className="ml-auto text-[9px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">ĐÃ LƯU</span>
                          </div>
                        ) : (
                          /* Input + Save button */
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <input
                                id={`${integration.provider}-${field.key_name}`}
                                type={field.type === 'password' && !showSecret[sk] ? 'password' : 'text'}
                                value={draftVal}
                                onChange={e => setDraft(p => ({ ...p, [sk]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') handleSave(integration.provider, field.key_name, integration.name, field.label); }}
                                placeholder={field.placeholder}
                                autoComplete="off"
                                className="w-full h-10 bg-slate-50 border border-slate-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none rounded-xl pl-3.5 pr-10 text-[12px] font-mono text-slate-800 placeholder-slate-400 transition-all"
                              />
                              {field.type === 'password' && (
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => setShowSecret(p => ({ ...p, [sk]: !p[sk] }))}
                                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {showSecret[sk] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => handleSave(integration.provider, field.key_name, integration.name, field.label)}
                              disabled={!draftVal.trim() || isSaving}
                              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 text-white text-[11px] font-bold px-4 h-10 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                            >
                              {isSaving
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Save className="w-3.5 h-3.5" />
                              }
                              Lưu
                            </button>
                          </div>
                        )}

                        {/* Help */}
                        <p className="text-[10px] text-slate-400 mt-1.5 pl-0.5">{field.help}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
      `}</style>
    </div>
  );
}
