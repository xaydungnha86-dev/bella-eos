/**
 * COMPANY DNA SCHEMA
 * 
 * Standard schema for enterprise company profile
 * Used by all AI agents for context-aware content generation
 */

export interface CompanyDNA {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASIC IDENTITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  identity: {
    /** Tên doanh nghiệp chính thức */
    companyName: string;
    
    /** Tên thương hiệu (có thể khác tên công ty) */
    brandName: string;
    
    /** Tên viết tắt / Logo text */
    shortName?: string;
    
    /** Slogan / Tagline */
    tagline?: string;
    
    /** Năm thành lập */
    foundedYear: number;
    
    /** Số năm hoạt động (auto-calculated) */
    yearsInBusiness?: number;
    
    /** Loại hình doanh nghiệp (B2B, B2C, B2B2C) */
    businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'B2G';
    
    /** Website chính thức */
    website?: string;
    
    /** Email liên hệ */
    contactEmail?: string;
    
    /** Hotline */
    hotline?: string;
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INDUSTRY & MARKET
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  industry: {
    /** Ngành nghề chính (ví dụ: Enterprise Software, Wellness Tech) */
    primaryIndustry: string;
    
    /** Ngành nghề phụ */
    secondaryIndustries?: string[];
    
    /** Thị trường mục tiêu địa lý */
    geographicMarkets: string[]; // ['Vietnam', 'Southeast Asia']
    
    /** Phân khúc thị trường */
    marketSegment: string; // 'Premium', 'Mid-market', 'Enterprise', 'SMB'
    
    /** Vị trí thị trường */
    marketPosition?: string; // 'Leader', 'Challenger', 'Niche player'
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRODUCTS & SERVICES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  products: {
    /** Loại sản phẩm/dịch vụ chính */
    type: 'software' | 'hardware' | 'service' | 'product' | 'hybrid';
    
    /** Danh sách sản phẩm/dịch vụ */
    offerings: Array<{
      /** Tên sản phẩm */
      name: string;
      
      /** Mô tả ngắn gọn */
      description: string;
      
      /** Loại (core product, add-on, service) */
      category: 'core' | 'addon' | 'service' | 'package';
      
      /** Tính năng nổi bật */
      keyFeatures: string[];
      
      /** Giá trị độc đáo (USP) */
      uniqueValue?: string;
      
      /** Đối tượng khách hàng */
      targetCustomer?: string;
    }>;
    
    /** Công nghệ sử dụng (cho software/tech companies) */
    technologies?: string[]; // ['AI', 'Cloud', 'Mobile']
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VISION & VALUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  vision: {
    /** Tầm nhìn (Vision Statement) */
    statement: string;
    
    /** Sứ mệnh (Mission Statement) */
    mission: string;
    
    /** Mục tiêu dài hạn (3-5 năm) */
    longTermGoals?: string[];
    
    /** Giá trị cốt lõi */
    coreValues: string[];
    
    /** Văn hóa doanh nghiệp */
    culture?: string;
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TARGET AUDIENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  targetAudience: {
    /** Persona chính */
    primaryPersona: {
      /** Tên persona (ví dụ: "Chủ Spa cao cấp") */
      name: string;
      
      /** Mô tả */
      description: string;
      
      /** Độ tuổi */
      ageRange?: string; // '25-45'
      
      /** Vai trò/Chức vụ */
      role?: string; // 'Business Owner', 'Director'
      
      /** Pain points */
      painPoints: string[];
      
      /** Goals/Desires */
      goals: string[];
      
      /** Hành vi mua hàng */
      buyingBehavior?: string;
    };
    
    /** Secondary personas */
    secondaryPersonas?: Array<{
      name: string;
      description: string;
      painPoints: string[];
    }>;
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BRAND VOICE & VISUAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  brandVoice: {
    /** Tone of voice chính */
    tone: string; // 'Professional & Trustworthy', 'Friendly & Approachable'
    
    /** Tính cách thương hiệu */
    personality: string[]; // ['Innovative', 'Reliable', 'Customer-centric']
    
    /** Phong cách viết */
    writingStyle: string; // 'Formal', 'Conversational', 'Technical'
    
    /** Từ khóa thương hiệu (nên dùng) */
    keyPhrases: string[];
    
    /** Từ cấm (không được dùng) */
    forbiddenWords?: string[];
  };
  
  brandVisual: {
    /** Phong cách thiết kế */
    style: string; // 'Modern Minimalist', 'Luxury Premium', 'Tech Forward'
    
    /** Màu sắc thương hiệu */
    colors: {
      primary: string;   // Hex code
      secondary?: string;
      accent?: string;
      neutral?: string;
    };
    
    /** Typography */
    typography?: {
      primaryFont?: string;
      secondaryFont?: string;
      style?: string; // 'Sans-serif', 'Serif', 'Modern'
    };
    
    /** Logo usage guidelines */
    logo?: {
      primaryLogoUrl?: string;
      alternativeLogoUrl?: string;
      backgroundColor?: string; // For logo placement
    };
    
    /** Phong cách hình ảnh */
    imageryStyle?: string; // 'Clean & Professional', 'Lifestyle & Aspirational'
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPETITIVE POSITIONING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  competitive: {
    /** Lợi thế cạnh tranh */
    advantages: string[];
    
    /** Điểm khác biệt chính */
    differentiators: string[];
    
    /** Đối thủ cạnh tranh chính */
    competitors?: string[];
    
    /** Positioning statement */
    positioning?: string;
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCIAL PROOF & CREDENTIALS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  credentials?: {
    /** Số lượng khách hàng */
    customerCount?: number;
    
    /** Khách hàng tiêu biểu */
    notableClients?: string[];
    
    /** Chứng nhận/Giải thưởng */
    certifications?: string[];
    
    /** Số liệu thành công */
    successMetrics?: Array<{
      metric: string;   // 'Revenue growth', 'Customer satisfaction'
      value: string;    // '200%', '4.8/5 stars'
      period?: string;  // 'in 2024', 'year-over-year'
    }>;
    
    /** Case studies */
    caseStudies?: Array<{
      clientName?: string;
      industry: string;
      challenge: string;
      solution: string;
      results: string;
    }>;
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // METADATA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  metadata?: {
    /** Workspace/Tenant ID */
    workspaceId: string;
    
    /** Người tạo */
    createdBy?: string;
    
    /** Ngày tạo */
    createdAt: string; // ISO date
    
    /** Ngày cập nhật cuối */
    updatedAt: string; // ISO date
    
    /** Phiên bản */
    version: number;
    
    /** Trạng thái */
    status: 'draft' | 'active' | 'archived';
    
    /** Tags for organization */
    tags?: string[];
  };
}

/**
 * Lightweight version for quick injection into prompts
 */
export interface CompanyDNASummary {
  companyName: string;
  brandName: string;
  businessModel: string;
  industry: string;
  productType: string;
  mission: string;
  targetAudience: string;
  tone: string;
  visualStyle: string;
  colors: { primary: string; accent?: string };
  keyDifferentiators: string[];
}

/**
 * Helper to convert full DNA to summary
 */
export function compressDNA(dna: CompanyDNA): CompanyDNASummary {
  return {
    companyName: dna.identity.companyName,
    brandName: dna.identity.brandName,
    businessModel: dna.identity.businessModel,
    industry: dna.industry.primaryIndustry,
    productType: dna.products.type,
    mission: dna.vision.mission,
    targetAudience: dna.targetAudience.primaryPersona.name,
    tone: dna.brandVoice.tone,
    visualStyle: dna.brandVisual.style,
    colors: dna.brandVisual.colors,
    keyDifferentiators: dna.competitive.differentiators
  };
}

/**
 * Default template for Bella EOS (example)
 */
export const BELLA_EOS_DNA: CompanyDNA = {
  identity: {
    companyName: 'Bella EOS Technology JSC',
    brandName: 'BELLA EOS',
    shortName: 'Bella',
    tagline: 'AI-Powered Enterprise Operations',
    foundedYear: 2023,
    yearsInBusiness: new Date().getFullYear() - 2023,
    businessModel: 'B2B',
    website: 'https://bellaeos.com',
    contactEmail: 'contact@bellaeos.com',
    hotline: '1900 xxxx'
  },
  
  industry: {
    primaryIndustry: 'Enterprise Software (B2B SaaS)',
    secondaryIndustries: ['AI & Automation', 'Wellness Technology'],
    geographicMarkets: ['Vietnam', 'Southeast Asia'],
    marketSegment: 'SMB to Mid-Market',
    marketPosition: 'Emerging Leader in Vietnam Wellness Tech'
  },
  
  products: {
    type: 'software',
    offerings: [
      {
        name: 'Bella EOS Platform',
        description: 'AI-powered operations management platform for spa and wellness businesses',
        category: 'core',
        keyFeatures: [
          'Intelligent staff scheduling & workload optimization',
          'Real-time revenue analytics & forecasting',
          'Customer relationship management with AI insights',
          'Multi-location management',
          'Automated inventory tracking',
          'Mobile-first design for on-the-go management'
        ],
        uniqueValue: 'Only AI-powered platform specifically built for Vietnamese wellness industry',
        targetCustomer: 'Spa owners, salon managers, wellness center directors'
      }
    ],
    technologies: ['AI', 'Cloud', 'Mobile', 'Analytics']
  },
  
  vision: {
    statement: 'Empower every wellness business in Vietnam to operate at enterprise-level efficiency',
    mission: 'Giải phóng thời gian vận hành cho chủ spa, để họ tập trung vào phát triển dịch vụ và khách hàng',
    longTermGoals: [
      'Trở thành nền tảng quản lý spa #1 tại Việt Nam',
      'Phục vụ 10,000+ cơ sở spa/thẩm mỹ trong 3 năm',
      'Mở rộng sang các ngành dịch vụ khác (F&B, Retail)'
    ],
    coreValues: [
      'Customer Success First',
      'Continuous Innovation',
      'Operational Excellence',
      'Data-Driven Decisions',
      'Empower Small Businesses'
    ],
    culture: 'Fast-paced, customer-obsessed, technology-driven'
  },
  
  targetAudience: {
    primaryPersona: {
      name: 'Chủ Spa Cao Cấp',
      description: 'Chủ sở hữu hoặc giám đốc điều hành spa/thẩm mỹ viện cao cấp, 1-5 chi nhánh',
      ageRange: '28-50',
      role: 'Business Owner / Director',
      painPoints: [
        'Mất quá nhiều thời gian cho công việc quản lý thủ công (8-12 giờ/tuần)',
        'Khó kiểm soát doanh thu và chi phí real-time',
        'Phân ca KTV không tối ưu, gây lãng phí nhân lực',
        'Thiếu insight về khách hàng để marketing hiệu quả',
        'Khó mở rộng quy mô vì phụ thuộc quản lý thủ công'
      ],
      goals: [
        'Tăng doanh thu 2-3x trong 12-24 tháng',
        'Giảm thời gian quản lý, tập trung phát triển dịch vụ',
        'Nâng cao trải nghiệm khách hàng VIP',
        'Mở rộng thêm chi nhánh một cách bền vững',
        'Chuyển đổi số, hiện đại hóa quy trình'
      ],
      buyingBehavior: 'Research-driven, ROI-focused, prefers demo before commitment'
    }
  },
  
  brandVoice: {
    tone: 'Professional, Trustworthy, Results-Driven',
    personality: ['Innovative', 'Reliable', 'Empowering', 'Customer-Centric'],
    writingStyle: 'Clear, benefit-focused, backed by data',
    keyPhrases: [
      'AI vận hành tự động',
      'Chuyên nghiệp',
      'Nâng tầm spa Việt',
      'Tăng doanh thu',
      'Tiết kiệm thời gian',
      'Quản trị thông minh'
    ],
    forbiddenWords: [
      'Rẻ', 'Giảm giá sốc', 'Khuyến mãi hot',
      'Thủ công', 'Truyền thống lạc hậu'
    ]
  },
  
  brandVisual: {
    style: 'Modern Tech Minimalism with Wellness Touch',
    colors: {
      primary: '#061E17',   // Dark Forest Green (professional, growth)
      secondary: '#FFFFFF', // Clean White
      accent: '#D4AF37',    // Premium Gold (success, premium)
      neutral: '#F5F5F5'    // Light Gray (backgrounds)
    },
    typography: {
      primaryFont: 'Montserrat',
      secondaryFont: 'Inter',
      style: 'Clean Sans-serif'
    },
    imageryStyle: 'Software UI mockups, professional business context, minimal wellness elements in background'
  },
  
  competitive: {
    advantages: [
      'AI-powered automation (not just digital record-keeping)',
      'Industry-specific features for Vietnamese wellness market',
      'Mobile-first design',
      'Real-time analytics dashboard',
      'Affordable pricing for SMBs'
    ],
    differentiators: [
      'Only platform built specifically for Vietnam spa industry',
      'AI scheduling optimization (competitors only have manual calendar)',
      'Localized customer support in Vietnamese',
      'Integration with local payment gateways (VNPay, Momo)',
      'Free onboarding training and implementation support'
    ],
    competitors: ['Generic POS systems', 'Excel spreadsheets', 'International SaaS (too expensive)'],
    positioning: 'The modern, AI-powered operations platform for Vietnamese wellness businesses who want to scale professionally'
  },
  
  credentials: {
    customerCount: 1200,
    notableClients: ['Spa Anh Đào', 'Beauty Garden', 'Zenity Wellness'],
    successMetrics: [
      { metric: 'Average revenue increase', value: '2.5x', period: 'within 6 months' },
      { metric: 'Time saved on management', value: '8 hours/week', period: 'per spa owner' },
      { metric: 'Customer satisfaction', value: '4.8/5', period: '2024' }
    ]
  },
  
  metadata: {
    workspaceId: 'bella_eos_default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    status: 'active',
    tags: ['wellness', 'saas', 'b2b', 'vietnam']
  }
};
