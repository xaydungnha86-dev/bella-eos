# COMPANY DNA MANAGEMENT SYSTEM

## 🎯 **Mục tiêu**

Tạo hệ thống quản lý thông tin doanh nghiệp (Company DNA) để:
1. ✅ UI cho phép nhập thông tin công ty qua form
2. ✅ Lưu trữ chuẩn hóa (JSON/Database)
3. ✅ AI agents tự động load trước mỗi task
4. ✅ Đảm bảo content luôn đúng với định hướng doanh nghiệp

---

## 📐 **Kiến trúc tổng thể**

```
┌──────────────────────────────────────────────────────────┐
│  STEP 1: UI FORM (Frontend)                              │
│  📝 Company Settings Page                                │
│  - Form wizard with validation                           │
│  - Real-time preview                                     │
│  - Save to storage                                       │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼ POST /api/company/profile
┌──────────────────────────────────────────────────────────┐
│  STEP 2: API ENDPOINTS                                   │
│  🔌 /api/company/profile                                 │
│  - GET: Load company DNA                                 │
│  - POST/PUT: Save company DNA                            │
│  - DELETE: Archive company DNA                           │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│  STEP 3: STORAGE LAYER                                   │
│  💾 Multi-source storage với priority:                   │
│  1. Supabase (company_profiles table) ← Production       │
│  2. Local JSON (.kiro/company-dna.json) ← Development    │
│  3. Default template (BELLA_EOS_DNA) ← Fallback          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼ Load once at startup
┌──────────────────────────────────────────────────────────┐
│  STEP 4: COMPANY DNA LOADER (Singleton)                  │
│  🧠 CompanyDNALoader.getInstance()                       │
│  - Auto-load khi khởi động                               │
│  - Cache in-memory                                       │
│  - Provide to all agents                                 │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼ Inject vào prompts
┌──────────────────────────────────────────────────────────┐
│  STEP 5: AI AGENTS (Auto-receive)                        │
│  🤖 Tất cả agents nhận Company DNA:                      │
│  - Creative Director Agent                               │
│  - Content Writer                                        │
│  - Marketing Manager (CMO)                               │
│  - All Workers                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 **Schema chuẩn: CompanyDNA**

File: `src/types/company-dna.ts`

### **Các phần chính**:

1. **identity**: Thông tin cơ bản (tên công ty, brand, năm thành lập, business model)
2. **industry**: Ngành nghề, thị trường, vị trí
3. **products**: Danh sách sản phẩm/dịch vụ chi tiết
4. **vision**: Tầm nhìn, sứ mệnh, mục tiêu dài hạn, giá trị cốt lõi
5. **targetAudience**: Persona khách hàng (pain points, goals, buying behavior)
6. **brandVoice**: Tone, personality, writing style
7. **brandVisual**: Màu sắc, typography, phong cách thiết kế
8. **competitive**: Lợi thế cạnh tranh, điểm khác biệt
9. **credentials**: Social proof (số khách hàng, case studies, giải thưởng)
10. **metadata**: Workspace ID, version, timestamps

### **Ví dụ Bella EOS DNA**:

```typescript
const BELLA_EOS_DNA: CompanyDNA = {
  identity: {
    companyName: 'Bella EOS Technology JSC',
    brandName: 'BELLA EOS',
    foundedYear: 2023,
    businessModel: 'B2B',
    // ...
  },
  
  products: {
    type: 'software', // ← CRITICAL: AI biết đây là software!
    offerings: [{
      name: 'Bella EOS Platform',
      description: 'AI-powered ops management for spas',
      keyFeatures: [
        'Intelligent staff scheduling',
        'Real-time analytics',
        'Customer relationship mgmt',
        // ...
      ],
      targetCustomer: 'Spa owners, salon managers'
    }]
  },
  
  targetAudience: {
    primaryPersona: {
      name: 'Chủ Spa Cao Cấp',
      painPoints: [
        'Mất 8-12 giờ/tuần quản lý thủ công',
        'Khó kiểm soát doanh thu real-time',
        'Phân ca KTV không tối ưu',
        // ...
      ]
    }
  },
  
  // ... rest
};
```

---

## 🔧 **Implementation**

### **1. CompanyDNALoader (Singleton)**

File: `src/core/company/company-dna-loader.ts`

```typescript
// Sử dụng đơn giản:
import { getCompanyDNA, getCompanyDNASnippet } from '@/core/company/company-dna-loader';

// Load full DNA
const dna = await getCompanyDNA();

// Load formatted prompt snippet (for AI)
const snippet = await getCompanyDNASnippet();
```

**Tính năng**:
- ✅ Load một lần, cache in-memory
- ✅ Auto-retry từ nhiều sources (Supabase → JSON → Default)
- ✅ Save với validation
- ✅ Reload khi cập nhật
- ✅ Generate formatted prompt snippet

### **2. API Endpoints**

File: `src/app/api/company/profile/route.ts`

```http
# Load company DNA
GET /api/company/profile?workspace_id=default

# Save company DNA
POST /api/company/profile
Body: { dna: CompanyDNA }

# Update company DNA
PUT /api/company/profile
Body: { dna: CompanyDNA }

# Archive company DNA
DELETE /api/company/profile?workspace_id=default
```

### **3. Integration vào Creative Director Agent**

File: `src/core/creative/reasoning/creative-director-agent.ts`

**Trước (không có Company DNA)**:
```typescript
private composeReasoningPrompt(context: BusinessContextPackage): string {
  return `You are a Senior Creative Director...
  
  ## CEO OBJECTIVE
  ${ceoObjective}
  
  ## BRAND IDENTITY
  - Brand Name: ${brandDNA.identity.brandName}
  - Mission: ${brandDNA.identity.mission}
  ...`;
}
```

**Sau (có Company DNA - tự động load)**:
```typescript
private async composeReasoningPrompt(context: BusinessContextPackage): Promise<string> {
  // Auto-load Company DNA
  const companyDNASnippet = await getCompanyDNASnippet();
  
  return `You are a Senior Creative Director...
  
  ${companyDNASnippet}  ← INJECTED HERE!
  
  ## CEO OBJECTIVE
  ${ceoObjective}
  
  ## BRAND IDENTITY
  ...`;
}
```

**Company DNA Snippet format**:
```
## COMPANY PROFILE

**Company**: Bella EOS Technology JSC (Brand: BELLA EOS)
**Business Model**: B2B
**Industry**: Enterprise Software (B2B SaaS)
**Product Type**: Software/SaaS
**Founded**: 2023 (1 years in business)

**Mission**: Giải phóng thời gian vận hành cho chủ spa...

**Core Product**: Bella EOS Platform
AI-powered operations management platform for spa and wellness businesses

**Target Customer**: Chủ Spa Cao Cấp
Chủ sở hữu hoặc giám đốc điều hành spa/thẩm mỹ viện cao cấp, 1-5 chi nhánh

**Key Pain Points** (what customers struggle with):
- Mất quá nhiều thời gian cho công việc quản lý thủ công (8-12 giờ/tuần)
- Khó kiểm soát doanh thu và chi phí real-time
- Phân ca KTV không tối ưu, gây lãng phí nhân lực
...

**Brand Voice**: Professional, Trustworthy, Results-Driven
**Brand Personality**: Innovative, Reliable, Empowering, Customer-Centric
**Visual Style**: Modern Tech Minimalism with Wellness Touch
**Brand Colors**: Primary #061E17, Accent #D4AF37

**Key Differentiators**:
- Only platform built specifically for Vietnam spa industry
- AI scheduling optimization (competitors only have manual calendar)
- Localized customer support in Vietnamese
...

**CRITICAL CONTEXT**: BELLA EOS is a B2B SOFTWARE COMPANY selling management
software TO wellness businesses. We are NOT a spa service provider ourselves.
All marketing content must focus on SOFTWARE FEATURES, DASHBOARD UI, and
BUSINESS OUTCOMES for our customers (the spa owners).
```

---

## 🎨 **UI Form Design (Đề xuất)**

### **Page: /settings/company**

```
┌─────────────────────────────────────────────────────────┐
│  Company Profile Settings                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 1. Basic Information                           │    │
│  │  - Company Name *                              │    │
│  │  - Brand Name *                                │    │
│  │  - Founded Year *                              │    │
│  │  - Business Model (B2B/B2C/B2B2C)             │    │
│  │  - Website, Email, Hotline                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 2. Industry & Market                           │    │
│  │  - Primary Industry *                          │    │
│  │  - Geographic Markets                          │    │
│  │  - Market Segment                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 3. Products & Services                         │    │
│  │  - Product Type (software/service/product) *   │    │
│  │  - Main Offering Name *                        │    │
│  │  - Description *                               │    │
│  │  - Key Features (list)                         │    │
│  │  - Target Customer *                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 4. Vision & Mission                            │    │
│  │  - Mission Statement *                         │    │
│  │  - Vision Statement *                          │    │
│  │  - Core Values (tags)                          │    │
│  │  - Long-term Goals (list)                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 5. Target Audience                             │    │
│  │  - Primary Persona Name *                      │    │
│  │  - Description *                               │    │
│  │  - Pain Points (list) *                        │    │
│  │  - Goals (list)                                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 6. Brand Voice & Visual                        │    │
│  │  - Tone (dropdown) *                           │    │
│  │  - Personality (multi-select)                  │    │
│  │  - Writing Style                               │    │
│  │  - Primary Color * [#______]                   │    │
│  │  - Accent Color   [#______]                    │    │
│  │  - Visual Style *                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 7. Competitive Positioning                     │    │
│  │  - Key Advantages (list)                       │    │
│  │  - Differentiators (list) *                    │    │
│  │  - Main Competitors (optional)                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 8. Social Proof (Optional)                     │    │
│  │  - Customer Count                              │    │
│  │  - Notable Clients                             │    │
│  │  - Success Metrics                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [← Back]  [Save Draft]  [Save & Activate →]           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- ✅ Form wizard với step-by-step
- ✅ Real-time validation
- ✅ Preview panel bên phải
- ✅ Auto-save to draft
- ✅ Template library (Bella EOS, E-commerce, etc.)

---

## 💾 **Storage Options**

### **Option A: Supabase (Recommended cho Production)**

Table: `company_profiles`

```sql
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  industry TEXT,
  dna_json JSONB NOT NULL,  -- Full CompanyDNA object
  status TEXT DEFAULT 'active',  -- 'draft', 'active', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_workspace ON company_profiles(workspace_id);
CREATE INDEX idx_company_status ON company_profiles(status);
```

### **Option B: Local JSON (Development)**

File: `.kiro/company-dna.json`

```json
{
  "identity": {
    "companyName": "Bella EOS Technology JSC",
    "brandName": "BELLA EOS",
    ...
  },
  "products": {
    "type": "software",
    ...
  },
  ...
}
```

---

## 🔄 **Workflow tích hợp**

### **Khi user chạy workflow**:

```
User: "Tạo chiến dịch marketing cho Bella EOS"
  ↓
1. Orchestrator nhận request
  ↓
2. CompanyDNALoader.load() → Load Company DNA
  ↓
3. Inject DNA vào context cho tất cả agents
  ↓
4. Creative Director Agent:
   - Nhận Company DNA snippet
   - Hiểu rõ: Bella EOS = B2B Software (NOT spa)
   - Hiểu rõ: Target = Spa owners (NOT spa customers)
   - Hiểu rõ: Show software UI (NOT spa products)
  ↓
5. Content Writer:
   - Nhận Company DNA
   - Dùng đúng tone, personality
   - Focus đúng pain points
  ↓
6. Output: Content chính xác, đúng định hướng!
```

---

## ✅ **Benefits**

1. **Consistency**: Tất cả content luôn đúng với định hướng công ty
2. **Context-Aware**: AI hiểu rõ bạn là ai, bán gì, cho ai
3. **Scalability**: Dễ dàng thêm workspace mới (multi-tenant)
4. **Maintainability**: Update 1 chỗ, tất cả agents đều cập nhật
5. **Quality**: Content chất lượng cao hơn vì AI có đầy đủ context

---

## 🚀 **Next Steps**

### **Phase 1: Core Implementation** ✅ DONE
- [x] Define CompanyDNA schema
- [x] Create CompanyDNALoader singleton
- [x] Create API endpoints
- [x] Integrate with Creative Director Agent

### **Phase 2: UI Form** (TODO)
- [ ] Create Company Settings page
- [ ] Form wizard với validation
- [ ] Preview panel
- [ ] Template library

### **Phase 3: Integration** (TODO)
- [ ] Integrate với tất cả agents
- [ ] Add to orchestrator context
- [ ] Update documentation

### **Phase 4: Enhanced Features** (Future)
- [ ] Vector store integration (semantic search)
- [ ] Multi-language support
- [ ] Versioning & rollback
- [ ] A/B testing different DNAs

---

## 📝 **Code Examples**

### **Sử dụng trong Agent**:

```typescript
// In any agent (Creative Director, Content Writer, etc.)
import { getCompanyDNASnippet } from '@/core/company/company-dna-loader';

async function generateContent(objective: string) {
  // Auto-load Company DNA
  const companyContext = await getCompanyDNASnippet();
  
  const prompt = `${companyContext}
  
  ## USER OBJECTIVE
  ${objective}
  
  Create marketing content that aligns with company positioning...`;
  
  // Call LLM with full context
  const result = await callLLM(prompt);
  return result;
}
```

### **Save từ UI**:

```typescript
// Frontend: Company Settings Form
async function saveCompanyProfile(formData: any) {
  const dna: CompanyDNA = {
    identity: {
      companyName: formData.companyName,
      brandName: formData.brandName,
      // ...
    },
    // ... map form data to schema
  };
  
  const response = await fetch('/api/company/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dna })
  });
  
  if (response.ok) {
    alert('Company profile saved successfully!');
    // Reload agents to pick up new DNA
    await fetch('/api/company/reload');
  }
}
```

---

**Kết luận**: Hệ thống Company DNA đảm bảo AI agents luôn có đầy đủ context về doanh nghiệp, tạo ra content chính xác và đúng định hướng chiến lược.
