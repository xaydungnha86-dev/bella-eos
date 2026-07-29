'use client';

/**
 * COMPANY DNA SETTINGS PAGE
 * 
 * Form để nhập/cập nhật thông tin doanh nghiệp
 * AI agents sẽ tự động load thông tin này trước mỗi task
 */

import { useState, useEffect } from 'react';
import type { CompanyDNA } from '@/types/company-dna';

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [companyDNA, setCompanyDNA] = useState<Partial<CompanyDNA>>({
    identity: {
      companyName: '',
      brandName: '',
      foundedYear: new Date().getFullYear(),
      businessModel: 'B2B' as const
    },
    industry: {
      primaryIndustry: '',
      geographicMarkets: ['Vietnam'],
      marketSegment: 'SMB'
    },
    products: {
      type: 'software' as const,
      offerings: [{
        name: '',
        description: '',
        category: 'core' as const,
        keyFeatures: ['']
      }]
    },
    vision: {
      statement: '',
      mission: '',
      coreValues: ['']
    },
    targetAudience: {
      primaryPersona: {
        name: '',
        description: '',
        painPoints: [''],
        goals: ['']
      }
    },
    brandVoice: {
      tone: '',
      personality: [''],
      writingStyle: 'Conversational',
      keyPhrases: ['']
    },
    brandVisual: {
      style: '',
      colors: {
        primary: '#000000',
        accent: '#FFD700'
      }
    },
    competitive: {
      advantages: [''],
      differentiators: ['']
    }
  });

  // Load existing Company DNA
  useEffect(() => {
    fetch('/api/company/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCompanyDNA(data.data);
        }
      })
      .catch(err => console.error('Failed to load company DNA:', err))
      .finally(() => setLoading(false));
  }, []);

  // Save Company DNA
  const handleSave = async (status: 'draft' | 'active' = 'active') => {
    setSaving(true);
    
    const dnaToSave: CompanyDNA = {
      ...companyDNA as CompanyDNA,
      metadata: {
        workspaceId: 'default',
        createdAt: companyDNA.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: (companyDNA.metadata?.version || 0) + 1,
        status
      }
    };

    try {
      const response = await fetch('/api/company/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dna: dnaToSave })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(status === 'active' ? 'Company DNA saved & activated!' : 'Draft saved');
        setCompanyDNA(result.data);
      } else {
        alert('Failed to save: ' + result.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const updateField = (path: string, value: any) => {
    setCompanyDNA(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addArrayItem = (path: string, defaultValue: any) => {
    const current = getNestedValue(companyDNA, path) as any[];
    updateField(path, [...(current || []), defaultValue]);
  };

  const removeArrayItem = (path: string, index: number) => {
    const current = getNestedValue(companyDNA, path) as any[];
    updateField(path, current.filter((_, i) => i !== index));
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Company DNA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back to Home Button */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            ✨ Company DNA
          </h1>
          <p className="text-lg text-gray-600">
            Thông tin công ty giúp AI tạo content chính xác và phù hợp với thương hiệu
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Mẹo:</strong> Điền đầy đủ 4 phần. Càng chi tiết, AI tạo content càng chuẩn xác.
            </p>
          </div>
        </div>

        {/* Simple Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b">
            {[
              { num: 1, name: '📋 Cơ bản' },
              { num: 2, name: '📦 Sản phẩm' },
              { num: 3, name: '👥 Khách hàng' },
              { num: 4, name: '🎨 Thương hiệu' }
            ].map((tab) => (
              <button
                key={tab.num}
                onClick={() => setCurrentStep(tab.num)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  currentStep === tab.num
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Thông tin cơ bản giúp AI hiểu công ty bạn làm gì
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.identity?.companyName || ''}
                  onChange={(e) => updateField('identity.companyName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Bella EOS Technology JSC"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên thương hiệu (Brand name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.identity?.brandName || ''}
                  onChange={(e) => updateField('identity.brandName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: BELLA EOS"
                />
                <p className="mt-1 text-xs text-gray-500">Tên này sẽ xuất hiện trên banner, logo badge</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Năm thành lập
                  </label>
                  <input
                    type="number"
                    value={companyDNA.identity?.foundedYear || new Date().getFullYear()}
                    onChange={(e) => updateField('identity.foundedYear', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Loại hình <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={companyDNA.identity?.businessModel || 'B2B'}
                    onChange={(e) => updateField('identity.businessModel', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="B2B">B2B (Bán cho doanh nghiệp)</option>
                    <option value="B2C">B2C (Bán cho người tiêu dùng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngành nghề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.industry?.primaryIndustry || ''}
                  onChange={(e) => updateField('industry.primaryIndustry', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Phần mềm quản lý spa"
                />
              </div>
            </div>
          )}

          {/* Step 2: Products & Services */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ Quan trọng:</strong> Chọn đúng loại sản phẩm để AI render đúng hình ảnh
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Loại sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  value={companyDNA.products?.type || 'software'}
                  onChange={(e) => updateField('products.type', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="software">💻 Phần mềm (Software/SaaS)</option>
                  <option value="service">🤝 Dịch vụ (Service)</option>
                  <option value="product">📦 Hàng hóa (Physical Product)</option>
                </select>
                <div className="mt-2 text-xs bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="font-medium text-gray-700 mb-1">Ví dụ:</p>
                  <p className="text-gray-600">• <strong>Phần mềm:</strong> AI tạo hình dashboard, UI, laptop</p>
                  <p className="text-gray-600">• <strong>Dịch vụ:</strong> AI tạo hình người thực hiện dịch vụ</p>
                  <p className="text-gray-600">• <strong>Hàng hóa:</strong> AI tạo hình sản phẩm vật chất</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên sản phẩm chính <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.products?.offerings?.[0]?.name || ''}
                  onChange={(e) => updateField('products.offerings.0.name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Phần mềm Bella EOS"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mô tả sản phẩm <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.products?.offerings?.[0]?.description || ''}
                  onChange={(e) => updateField('products.offerings.0.description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  rows={3}
                  placeholder="VD: Phần mềm quản lý spa toàn diện, tự động hóa xếp lịch và doanh thu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tính năng nổi bật (mỗi dòng 1 tính năng) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={(companyDNA.products?.offerings?.[0]?.keyFeatures || ['']).join('\n')}
                  onChange={(e) => {
                    const features = e.target.value.split('\n').filter(f => f.trim());
                    updateField('products.offerings.0.keyFeatures', features.length > 0 ? features : ['']);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono"
                  rows={4}
                  placeholder={"VD:\nTự động xếp lịch KTV\nBáo cáo doanh thu realtime\nQuản lý khách VIP"}
                />
                <p className="mt-1 text-xs text-gray-500">AI sẽ dùng những tính năng này để viết benefits</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Điểm khác biệt độc đáo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.products?.offerings?.[0]?.uniqueValue || ''}
                  onChange={(e) => updateField('products.offerings.0.uniqueValue', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Phần mềm quản lý spa đầu tiên có AI tại Việt Nam"
                />
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
                <p className="text-sm text-purple-900">
                  <strong>💡 Tip:</strong> Vấn đề cụ thể (có số liệu) giúp AI viết content hiệu quả hơn
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Khách hàng chính của bạn là ai? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.targetAudience?.primaryPersona?.name || ''}
                  onChange={(e) => updateField('targetAudience.primaryPersona.name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Chủ spa cao cấp"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={companyDNA.targetAudience?.primaryPersona?.description || ''}
                  onChange={(e) => updateField('targetAudience.primaryPersona.description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  rows={2}
                  placeholder="VD: Chủ sở hữu spa/thẩm mỹ viện cao cấp, 1-5 chi nhánh, độ tuổi 28-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Vấn đề họ gặp phải (mỗi dòng 1 vấn đề) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={(companyDNA.targetAudience?.primaryPersona?.painPoints || ['']).join('\n')}
                  onChange={(e) => {
                    const pains = e.target.value.split('\n').filter(p => p.trim());
                    updateField('targetAudience.primaryPersona.painPoints', pains.length > 0 ? pains : ['']);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono"
                  rows={4}
                  placeholder={"VD:\nMất 8-12 giờ mỗi tuần cho quản lý thủ công\nKhó kiểm soát doanh thu realtime\nPhân ca KTV không tối ưu"}
                />
                <p className="mt-1 text-xs text-gray-500">⚠️ Càng cụ thể càng tốt (có số liệu, thời gian)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mục tiêu của họ (mỗi dòng 1 mục tiêu)
                </label>
                <textarea
                  value={(companyDNA.targetAudience?.primaryPersona?.goals || ['']).join('\n')}
                  onChange={(e) => {
                    const goals = e.target.value.split('\n').filter(g => g.trim());
                    updateField('targetAudience.primaryPersona.goals', goals.length > 0 ? goals : ['']);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono"
                  rows={3}
                  placeholder={"VD:\nTăng doanh thu gấp 2-3 lần trong 12-24 tháng\nGiảm thời gian quản lý"}
                />
              </div>
            </div>
          )}

          {/* Step 4: Brand */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-pink-50 border-l-4 border-pink-400 p-4 mb-6">
                <p className="text-sm text-pink-900">
                  <strong>🎨 Quan trọng:</strong> Màu sắc phải chính xác để AI render đúng thương hiệu
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sứ mệnh công ty (Mission) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.vision?.mission || ''}
                  onChange={(e) => updateField('vision.mission', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  rows={2}
                  placeholder="VD: Giải phóng thời gian vận hành cho chủ spa"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giọng điệu thương hiệu (Brand Tone) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.brandVoice?.tone || ''}
                  onChange={(e) => updateField('brandVoice.tone', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Chuyên nghiệp, Đáng tin cậy, Hướng kết quả"
                />
                <p className="mt-1 text-xs text-gray-500">AI sẽ viết content theo giọng điệu này</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phong cách thiết kế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.brandVisual?.style || ''}
                  onChange={(e) => updateField('brandVisual.style', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="VD: Modern Minimalist, Luxury Premium"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Màu sắc thương hiệu</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Màu chính (Primary) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={companyDNA.brandVisual?.colors?.primary || '#000000'}
                        onChange={(e) => updateField('brandVisual.colors.primary', e.target.value)}
                        className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={companyDNA.brandVisual?.colors?.primary || '#000000'}
                        onChange={(e) => updateField('brandVisual.colors.primary', e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#000000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Dùng cho: Logo, tiêu đề</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Màu nhấn (Accent) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={companyDNA.brandVisual?.colors?.accent || '#FFD700'}
                        onChange={(e) => updateField('brandVisual.colors.accent', e.target.value)}
                        className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={companyDNA.brandVisual?.colors?.accent || '#FFD700'}
                        onChange={(e) => updateField('brandVisual.colors.accent', e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#FFD700"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Dùng cho: Nút CTA, badges</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Điểm khác biệt (mỗi dòng 1 điểm) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={(companyDNA.competitive?.differentiators || ['']).join('\n')}
                  onChange={(e) => {
                    const diffs = e.target.value.split('\n').filter(d => d.trim());
                    updateField('competitive.differentiators', diffs.length > 0 ? diffs : ['']);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-mono"
                  rows={3}
                  placeholder={"VD:\nPhần mềm spa duy nhất có AI tại VN\nHỗ trợ tiếng Việt 24/7"}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t-2">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
            >
              ← Quay lại
            </button>

            <div className="flex gap-3">
              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all hover:shadow-lg"
                >
                  Tiếp theo →
                </button>
              ) : (
                <button
                  onClick={() => handleSave('active')}
                  disabled={saving}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu Company DNA'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
