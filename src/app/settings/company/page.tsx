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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company DNA Settings</h1>
          <p className="text-gray-600">
            Nhập thông tin doanh nghiệp để AI agents hiểu rõ công ty và tạo content chính xác
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, name: 'Basic Info' },
              { num: 2, name: 'Products' },
              { num: 3, name: 'Audience' },
              { num: 4, name: 'Brand' }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.num}
                </button>
                <span className={`ml-2 text-sm ${currentStep >= step.num ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.name}
                </span>
                {idx < 3 && (
                  <div className={`w-16 h-1 mx-4 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">1. Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.identity?.companyName || ''}
                  onChange={(e) => updateField('identity.companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bella EOS Technology JSC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.identity?.brandName || ''}
                  onChange={(e) => updateField('identity.brandName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., BELLA EOS"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={companyDNA.identity?.foundedYear || new Date().getFullYear()}
                    onChange={(e) => updateField('identity.foundedYear', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={companyDNA.identity?.businessModel || 'B2B'}
                    onChange={(e) => updateField('identity.businessModel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="B2B">B2B (Business to Business)</option>
                    <option value="B2C">B2C (Business to Consumer)</option>
                    <option value="B2B2C">B2B2C (Hybrid)</option>
                    <option value="B2G">B2G (Business to Government)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Industry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.industry?.primaryIndustry || ''}
                  onChange={(e) => updateField('industry.primaryIndustry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Enterprise Software (B2B SaaS)"
                />
              </div>
            </div>
          )}

          {/* Step 2: Products & Services */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">2. Products & Services</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={companyDNA.products?.type || 'software'}
                  onChange={(e) => updateField('products.type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="software">Software/SaaS</option>
                  <option value="hardware">Hardware</option>
                  <option value="service">Service</option>
                  <option value="product">Physical Product</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.products?.offerings?.[0]?.name || ''}
                  onChange={(e) => updateField('products.offerings.0.name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Bella EOS Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.products?.offerings?.[0]?.description || ''}
                  onChange={(e) => updateField('products.offerings.0.description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Brief description of what your product does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.products?.offerings?.[0]?.targetCustomer || ''}
                  onChange={(e) => updateField('products.offerings.0.targetCustomer', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Spa owners, salon managers"
                />
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">3. Target Audience</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Persona Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.targetAudience?.primaryPersona?.name || ''}
                  onChange={(e) => updateField('targetAudience.primaryPersona.name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Chủ Spa Cao Cấp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persona Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.targetAudience?.primaryPersona?.description || ''}
                  onChange={(e) => updateField('targetAudience.primaryPersona.description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Who are they? What do they do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Pain Points (comma separated) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.targetAudience?.primaryPersona?.painPoints?.join(', ') || ''}
                  onChange={(e) => updateField('targetAudience.primaryPersona.painPoints', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What problems do they face?"
                />
              </div>
            </div>
          )}

          {/* Step 4: Brand */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">4. Brand Identity</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mission Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.vision?.mission || ''}
                  onChange={(e) => updateField('vision.mission', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="What is your company's purpose?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Tone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.brandVoice?.tone || ''}
                  onChange={(e) => updateField('brandVoice.tone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Professional, Trustworthy, Results-Driven"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visual Style <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyDNA.brandVisual?.style || ''}
                  onChange={(e) => updateField('brandVisual.style', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Modern Minimalist, Luxury Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="color"
                    value={companyDNA.brandVisual?.colors?.primary || '#000000'}
                    onChange={(e) => updateField('brandVisual.colors.primary', e.target.value)}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={companyDNA.brandVisual?.colors?.accent || '#FFD700'}
                    onChange={(e) => updateField('brandVisual.colors.accent', e.target.value)}
                    className="w-full h-12 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Differentiators (comma separated) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={companyDNA.competitive?.differentiators?.join(', ') || ''}
                  onChange={(e) => updateField('competitive.differentiators', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="What makes you unique?"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => handleSave('active')}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save & Activate'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
