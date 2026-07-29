/**
 * BELLA EOS — Brief Analyzer
 * brief-analyzer.ts
 *
 * Parses a raw marketing request into a structured FacebookBrief.
 * Used as Stage 0 of the content-pipeline before copywriting and image generation.
 *
 * Pipeline position:
 *   [raw request] → BriefAnalyzer → FacebookBrief → CopywriterV2 + ImageDirectorV2
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CampaignType =
  | 'software_b2b'
  | 'sales_product'
  | 'brand_awareness'
  | 'event_promotion'
  | 'recruitment'
  | 'real_estate'
  | 'fashion_lifestyle'
  | 'food_beverage'
  | 'generic';

export type ImageStyle =
  | 'tech_dashboard'      // software/SaaS — show UI mockup on device
  | 'luxury_spa'          // wellness, spa, beauty service
  | 'corporate_modern'    // B2B, recruitment, finance
  | 'lifestyle_product'   // consumer product in context
  | 'architectural'       // real estate, interior
  | 'editorial_fashion'   // fashion, lifestyle brand
  | 'event_energetic'     // events, workshops, seminars
  | 'food_hero'           // F&B, restaurant
  | 'minimal_clean';      // fallback — clean commercial

export type ImageFormat = '1:1' | '4:5' | '16:9' | '9:16';

export type CtaType =
  | 'demo_booking'
  | 'free_trial'
  | 'contact_consult'
  | 'event_register'
  | 'apply_now'
  | 'learn_more'
  | 'shop_now'
  | 'get_quote';

export interface FacebookBrief {
  // Core intent
  rawRequest:      string;
  campaignType:    CampaignType;

  // Audience
  targetAudience:  string;
  audienceGender:  'male' | 'female' | 'all';
  audienceAge:     string;               // e.g. "25-45"
  audienceLocation: string;              // e.g. "Hà Nội & HCM"
  audienceRole:    string;               // e.g. "Chủ spa cao cấp"

  // Messaging
  tone:            string;               // comma-sep keywords
  usp:             string;               // unique selling point (1 sentence)
  keyBenefits:     string[];             // 3 bullet points
  ctaType:         CtaType;
  ctaText:         string;               // "Demo miễn phí 15 phút"
  painPoint:       string;               // main pain the product solves
  emotionalHook:   string;               // 1 question/statement to open with

  // Visual guidance
  imageStyle:      ImageStyle;
  imageFormat:     ImageFormat;
  colorMood:       string;               // e.g. "dark premium, gold accent"
  heroSubjectHint: string;               // what to show in the image
  brandName:       string;

  // Hashtag themes
  hashtagTheme:    string[];             // ["spa", "quản lý", "phần mềm", ...]
  primaryHashtags: string[];             // "#BellaEOS #QuanLySpa ..."

  // Meta
  analyzedAt:      string;
  confidence:      number;               // 0–1
  analyzerVersion: '1.0.0';
}

// ── Keyword Maps ──────────────────────────────────────────────────────────────

const CAMPAIGN_KEYWORDS: Record<CampaignType, string[]> = {
  software_b2b:    ['phần mềm', 'hệ thống', 'platform', 'app', 'ứng dụng', 'saas', 'bella eos', 'quản lý', 'quản trị', 'crm', 'erp', 'ai', 'digital', 'cloud', 'tự động', 'công nghệ'],
  sales_product:   ['mua', 'bán', 'giá', 'ưu đãi', 'giảm giá', 'flash sale', 'khuyến mãi', 'sản phẩm', 'hàng'],
  brand_awareness: ['thương hiệu', 'nhận diện', 'brand', 'câu chuyện', 'giá trị', 'cam kết', 'mission', 'vision'],
  event_promotion: ['sự kiện', 'event', 'hội thảo', 'workshop', 'webinar', 'ra mắt', 'khai trương', 'tham dự', 'vé'],
  recruitment:     ['tuyển dụng', 'tuyển', 'nhân sự', 'recruitment', 'hr', 'làm việc', 'cơ hội', 'ứng tuyển', 'việc làm'],
  real_estate:     ['bất động sản', 'căn hộ', 'chung cư', 'nhà', 'đất', 'dự án', 'mở bán', 'bds'],
  fashion_lifestyle: ['thời trang', 'fashion', 'boutique', 'outfit', 'style', 'phong cách', 'quần áo'],
  food_beverage:   ['nhà hàng', 'quán', 'đồ ăn', 'food', 'fnb', 'ăn uống', 'menu', 'món', 'cafe', 'coffee'],
  generic:         [],
};

const SPA_KEYWORDS = ['spa', 'thẩm mỹ', 'làm đẹp', 'salon', 'beauty', 'wellness', 'nail', 'massage'];

const IMAGE_STYLE_MAP: Partial<Record<CampaignType, ImageStyle>> = {
  software_b2b:    'tech_dashboard',
  sales_product:   'lifestyle_product',
  brand_awareness: 'minimal_clean',
  event_promotion: 'event_energetic',
  recruitment:     'corporate_modern',
  real_estate:     'architectural',
  fashion_lifestyle: 'editorial_fashion',
  food_beverage:   'food_hero',
  generic:         'minimal_clean',
};

const CTA_MAP: Partial<Record<CampaignType, CtaType>> = {
  software_b2b:    'demo_booking',
  sales_product:   'shop_now',
  brand_awareness: 'learn_more',
  event_promotion: 'event_register',
  recruitment:     'apply_now',
  real_estate:     'get_quote',
  fashion_lifestyle: 'shop_now',
  food_beverage:   'learn_more',
  generic:         'contact_consult',
};

const CTA_TEXT_MAP: Record<CtaType, string[]> = {
  demo_booking:    ['Demo phần mềm 15 phút — hoàn toàn miễn phí', 'Đặt lịch demo ngay', 'Dùng thử 30 ngày miễn phí'],
  free_trial:      ['Dùng thử miễn phí 30 ngày', 'Bắt đầu miễn phí hôm nay'],
  contact_consult: ['Nhắn tin tư vấn miễn phí', 'Đặt lịch tư vấn 1-1', 'Liên hệ ngay để được tư vấn'],
  event_register:  ['Đăng ký tham dự ngay', 'Đặt chỗ trước — số lượng có hạn'],
  apply_now:       ['Ứng tuyển ngay', 'Nộp CV ngay hôm nay'],
  learn_more:      ['Tìm hiểu thêm →', 'Khám phá ngay'],
  shop_now:        ['Mua ngay — ưu đãi có thời hạn', 'Xem ngay tại website'],
  get_quote:       ['Nhận báo giá ngay', 'Tư vấn & báo giá miễn phí'],
};

// ── Analyzer Class ─────────────────────────────────────────────────────────────

export class BriefAnalyzer {
  /**
   * Synchronous fast-path: pure keyword matching, no LLM.
   * Used when latency matters and request is in Vietnamese.
   */
  static analyze(rawRequest: string): FacebookBrief {
    const lo = rawRequest.toLowerCase();

    // ── 1. Detect campaign type ───────────────────────────────────────────────
    let campaignType: CampaignType = 'generic';
    let bestScore = 0;

    for (const [type, keywords] of Object.entries(CAMPAIGN_KEYWORDS) as [CampaignType, string[]][]) {
      const score = keywords.filter(kw => lo.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        campaignType = type;
      }
    }

    // Special override: spa context + software keywords → software_b2b targeting spa owners
    const hasSpa    = SPA_KEYWORDS.some(k => lo.includes(k));
    const hasSoftware = CAMPAIGN_KEYWORDS.software_b2b.some(k => lo.includes(k));
    if (hasSpa && hasSoftware) campaignType = 'software_b2b';

    // ── 2. Detect audience ────────────────────────────────────────────────────
    const audienceRole     = BriefAnalyzer.detectAudienceRole(lo, campaignType, hasSpa);
    const audienceLocation = BriefAnalyzer.detectLocation(lo);
    const audienceGender   = BriefAnalyzer.detectGender(lo);
    const audienceAge      = BriefAnalyzer.detectAge(lo, campaignType);
    const targetAudience   = `${audienceRole}${audienceLocation ? ' tại ' + audienceLocation : ''}`;

    // ── 3. Detect brand name ──────────────────────────────────────────────────
    const brandName = BriefAnalyzer.detectBrandName(rawRequest);

    // ── 4. Build USP, pain point, hook ───────────────────────────────────────
    const { usp, painPoint, emotionalHook, keyBenefits } =
      BriefAnalyzer.buildMessaging(lo, campaignType, brandName, hasSpa);

    // ── 5. Tone ───────────────────────────────────────────────────────────────
    const tone = BriefAnalyzer.detectTone(lo, campaignType);

    // ── 6. CTA ───────────────────────────────────────────────────────────────
    const ctaType = CTA_MAP[campaignType] ?? 'contact_consult';
    const ctaOptions = CTA_TEXT_MAP[ctaType];
    const ctaText = ctaOptions[0];

    // ── 7. Visual guidance ────────────────────────────────────────────────────
    const imageStyle      = IMAGE_STYLE_MAP[campaignType] ?? 'minimal_clean';
    const imageFormat     = BriefAnalyzer.detectFormat(lo);
    const colorMood       = BriefAnalyzer.detectColorMood(campaignType, hasSpa);
    const heroSubjectHint = BriefAnalyzer.buildHeroSubjectHint(campaignType, brandName, hasSpa);

    // ── 8. Hashtags ───────────────────────────────────────────────────────────
    const { hashtagTheme, primaryHashtags } =
      BriefAnalyzer.buildHashtags(campaignType, brandName, hasSpa);

    return {
      rawRequest,
      campaignType,
      targetAudience,
      audienceGender,
      audienceAge,
      audienceLocation,
      audienceRole,
      tone,
      usp,
      keyBenefits,
      ctaType,
      ctaText,
      painPoint,
      emotionalHook,
      imageStyle,
      imageFormat,
      colorMood,
      heroSubjectHint,
      brandName,
      hashtagTheme,
      primaryHashtags,
      analyzedAt:      new Date().toISOString(),
      confidence:      bestScore > 0 ? Math.min(0.95, 0.6 + bestScore * 0.07) : 0.5,
      analyzerVersion: '1.0.0',
    };
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private static detectAudienceRole(lo: string, type: CampaignType, hasSpa: boolean): string {
    if (hasSpa && type === 'software_b2b') return 'Chủ Spa & Thẩm mỹ viện cao cấp';
    if (lo.includes('nhà hàng') || lo.includes('f&b')) return 'Chủ nhà hàng & quán ăn';
    if (lo.includes('bất động sản') || lo.includes('bds')) return 'Nhà đầu tư & người mua nhà';
    if (lo.includes('tuyển dụng') || lo.includes('hr')) return 'Ứng viên tiềm năng';
    if (lo.includes('thời trang') || lo.includes('fashion')) return 'Người tiêu dùng thời trang';
    if (lo.includes('chủ') || lo.includes('doanh nghiệp') || lo.includes('ceo')) return 'Chủ doanh nghiệp & nhà quản lý';
    if (lo.includes('startup') || lo.includes('smb')) return 'Startup & doanh nghiệp vừa và nhỏ';
    if (type === 'software_b2b') return 'Quản lý & chủ doanh nghiệp';
    if (type === 'event_promotion') return 'Chuyên gia & người quan tâm trong ngành';
    return 'Khách hàng mục tiêu';
  }

  private static detectLocation(lo: string): string {
    const locations: string[] = [];
    if (lo.includes('hà nội') || lo.includes('hn') || lo.includes('hanoi')) locations.push('Hà Nội');
    if (lo.includes('hcm') || lo.includes('hồ chí minh') || lo.includes('sài gòn') || lo.includes('saigon')) locations.push('TP.HCM');
    if (lo.includes('đà nẵng') || lo.includes('da nang')) locations.push('Đà Nẵng');
    if (lo.includes('toàn quốc') || lo.includes('nationwide')) return 'toàn quốc';
    return locations.join(' & ');
  }

  private static detectGender(lo: string): 'male' | 'female' | 'all' {
    const femaleKw = ['nữ', 'phụ nữ', 'chị', 'làm đẹp', 'spa', 'thẩm mỹ', 'fashion', 'beauty'];
    const maleKw   = ['nam', 'đàn ông', 'anh'];
    if (femaleKw.some(k => lo.includes(k))) return 'female';
    if (maleKw.some(k => lo.includes(k))) return 'male';
    return 'all';
  }

  private static detectAge(lo: string, type: CampaignType): string {
    if (lo.includes('gen z') || lo.includes('trẻ')) return '18-28';
    if (lo.includes('trung niên')) return '35-50';
    if (type === 'recruitment') return '22-35';
    if (type === 'real_estate') return '30-55';
    if (type === 'software_b2b') return '28-50';
    return '25-45';
  }

  private static detectBrandName(raw: string): string {
    const brandMatch = raw.match(/bella\s*eos/i);
    if (brandMatch) return 'Bella EOS';
    // Try to extract quoted brand name
    const quotedMatch = raw.match(/["']([^"']{2,30})["']/);
    if (quotedMatch) return quotedMatch[1];
    return 'Bella EOS';
  }

  private static buildMessaging(
    lo: string,
    type: CampaignType,
    brand: string,
    hasSpa: boolean
  ): { usp: string; painPoint: string; emotionalHook: string; keyBenefits: string[] } {
    if (type === 'software_b2b' && hasSpa) {
      return {
        usp:          `${brand} — Hệ điều hành AI dành riêng cho Spa & Thẩm mỹ viện`,
        painPoint:    'Quản lý thủ công tốn 8h/ngày, lịch hẹn trùng lặp, doanh thu thất thoát mỗi tháng',
        emotionalHook: 'Spa của bạn đang bỏ lỡ bao nhiêu doanh thu vì quản lý thủ công?',
        keyBenefits:  [
          '⚡ Tự động 100% lịch hẹn & phân ca kỹ thuật viên',
          '📊 Dashboard doanh thu & KPI thời gian thực',
          '💰 Tiết kiệm 40h/tháng — tăng lợi nhuận 30%+',
        ],
      };
    }
    if (type === 'software_b2b') {
      return {
        usp:          `${brand} — Nền tảng AI tự động hóa vận hành doanh nghiệp`,
        painPoint:    'Vận hành thủ công tốn kém, dữ liệu rời rạc, khó kiểm soát tăng trưởng',
        emotionalHook: 'Doanh nghiệp bạn đang mất bao nhiêu tiền vì chưa số hóa?',
        keyBenefits:  [
          '🤖 Tự động hóa 80% quy trình vận hành',
          '📈 Theo dõi KPI & doanh thu thời gian thực',
          '🚀 Triển khai nhanh — kết quả sau 30 ngày',
        ],
      };
    }
    if (type === 'recruitment') {
      return {
        usp:          `Cơ hội phát triển sự nghiệp đẳng cấp tại ${brand}`,
        painPoint:    'Thiếu môi trường làm việc thực chiến và cơ hội phát triển rõ ràng',
        emotionalHook: 'Bạn có muốn làm việc ở nơi mà tài năng thực sự được công nhận?',
        keyBenefits:  [
          '🌟 Môi trường làm việc sáng tạo & quốc tế',
          '💼 Mức lương cạnh tranh + bonus hiệu suất',
          '📚 Đào tạo & thăng tiến nhanh',
        ],
      };
    }
    if (type === 'event_promotion') {
      return {
        usp:          'Sự kiện không thể bỏ lỡ — nơi kết nối & học hỏi từ chuyên gia đầu ngành',
        painPoint:    'Thiếu kiến thức thực chiến và mạng lưới kết nối để bứt phá',
        emotionalHook: 'Bạn đang cần đột phá trong sự nghiệp — sự kiện này dành cho bạn!',
        keyBenefits:  [
          '🎯 Học từ chuyên gia hàng đầu',
          '🤝 Networking với 200+ doanh nhân',
          '🎁 Tặng tài liệu & công cụ độc quyền',
        ],
      };
    }
    // Generic fallback
    return {
      usp:          `${brand} — Giải pháp tối ưu cho doanh nghiệp của bạn`,
      painPoint:    'Chi phí vận hành cao, năng suất thấp, khó kiểm soát tăng trưởng',
      emotionalHook: 'Doanh nghiệp của bạn có thể làm tốt hơn — và chúng tôi sẽ giúp bạn!',
      keyBenefits:  [
        '✅ Tối ưu quy trình vận hành',
        '📊 Dữ liệu thời gian thực',
        '🚀 Tăng trưởng bền vững',
      ],
    };
  }

  private static detectTone(lo: string, type: CampaignType): string {
    if (lo.includes('luxury') || lo.includes('cao cấp') || lo.includes('sang trọng')) {
      return 'cao cấp, sang trọng, tinh tế, uy tín';
    }
    if (type === 'recruitment') return 'chuyên nghiệp, cởi mở, truyền cảm hứng';
    if (type === 'event_promotion') return 'năng động, urgent, hào hứng, chuyên nghiệp';
    if (type === 'fashion_lifestyle') return 'trẻ trung, phong cách, sáng tạo, bold';
    if (type === 'software_b2b') return 'chuyên nghiệp, tin cậy, hiện đại, kết quả-driven';
    return 'chuyên nghiệp, thân thiện, tin cậy';
  }

  private static detectFormat(lo: string): ImageFormat {
    if (lo.includes('story') || lo.includes('9:16') || lo.includes('dọc')) return '9:16';
    if (lo.includes('4:5') || lo.includes('portrait')) return '4:5';
    if (lo.includes('16:9') || lo.includes('banner') || lo.includes('ngang')) return '16:9';
    return '1:1'; // FB feed default
  }

  private static detectColorMood(type: CampaignType, hasSpa: boolean): string {
    if (hasSpa && type === 'software_b2b') return 'dark navy với accent vàng gold, premium tech feel';
    if (type === 'software_b2b') return 'dark charcoal với gradient xanh dương, futuristic';
    if (type === 'real_estate') return 'warm golden hour, premium ivory & bronze';
    if (type === 'fashion_lifestyle') return 'high contrast, editorial black & white với accent màu';
    if (type === 'event_promotion') return 'vibrant gradient, energetic colors, bold typography space';
    if (type === 'food_beverage') return 'warm, appetizing, natural tones';
    return 'clean white với accent brand color, minimal professional';
  }

  private static buildHeroSubjectHint(type: CampaignType, brand: string, hasSpa: boolean): string {
    if (type === 'software_b2b' && hasSpa) {
      return `MacBook Pro hoặc iPad hiển thị dashboard ${brand} với biểu đồ doanh thu, lịch hẹn KTV, và KPI analytics, đặt trên bàn làm việc spa hiện đại. Màn hình hiển thị rõ giao diện phần mềm quản lý chuyên nghiệp`;
    }
    if (type === 'software_b2b') {
      return `Laptop/màn hình hiển thị dashboard ${brand} với data visualization, analytics charts, và giao diện quản trị hiện đại. Background: văn phòng công ty hiện đại hoặc không gian làm việc sáng tạo`;
    }
    if (type === 'recruitment') {
      return `Không gian văn phòng ${brand} hiện đại, thoáng đãng, ánh sáng tự nhiên. Có thể thêm hình ảnh đội nhóm năng động, biển tên công ty, hoặc view thành phố từ cửa sổ`;
    }
    if (type === 'event_promotion') {
      return `Hội trường sự kiện ấn tượng với đèn neon/spotlight, màn hình trình chiếu, và đám đông tham dự sôi nổi. Hoặc speaker đang trình bày trên sân khấu chuyên nghiệp`;
    }
    if (type === 'real_estate') {
      return `Ngoại thất căn hộ/villa cao cấp tại golden hour, kính curtain wall phản chiếu ánh hoàng hôn, hồ bơi infinity pool, sân vườn xanh. Kiến trúc hiện đại ấn tượng`;
    }
    return `Hình ảnh sản phẩm/dịch vụ chuyên nghiệp trên background sạch, ánh sáng studio. Subject ${brand} ở trung tâm hoặc bên phải, copy space bên trái`;
  }

  private static buildHashtags(
    type: CampaignType,
    brand: string,
    hasSpa: boolean
  ): { hashtagTheme: string[]; primaryHashtags: string[] } {
    const brandTag = `#${brand.replace(/\s+/g, '')}`;

    if (type === 'software_b2b' && hasSpa) {
      return {
        hashtagTheme: ['spa', 'thẩm mỹ', 'phần mềm', 'quản lý', 'công nghệ'],
        primaryHashtags: [brandTag, '#QuanLySpa', '#PhanMemSpa', '#TuDongHoaSpa', '#CongNgheSpa', '#BellaEOS'],
      };
    }
    if (type === 'software_b2b') {
      return {
        hashtagTheme: ['phần mềm', 'doanh nghiệp', 'ai', 'tự động hóa', 'chuyển đổi số'],
        primaryHashtags: [brandTag, '#ChuyenDoiSo', '#TuDongHoa', '#PhanMemQuanLy', '#AI', '#SmartBusiness'],
      };
    }
    if (type === 'recruitment') {
      return {
        hashtagTheme: ['tuyển dụng', 'việc làm', 'cơ hội', 'career', 'jobs'],
        primaryHashtags: [brandTag, '#TuyenDung', '#ViecLamTot', '#Career', '#NhanSu', '#JobOpening'],
      };
    }
    if (type === 'event_promotion') {
      return {
        hashtagTheme: ['sự kiện', 'event', 'hội thảo', 'networking', 'workshop'],
        primaryHashtags: [brandTag, '#SuKien', '#Event', '#Workshop', '#Networking', '#HoiThao'],
      };
    }
    if (type === 'real_estate') {
      return {
        hashtagTheme: ['bất động sản', 'căn hộ', 'đầu tư', 'chung cư', 'nhà đất'],
        primaryHashtags: ['#BatDongSan', '#CanHoCaoCapm', '#DauTuBDS', '#NhaDepGiaTot', '#BDS'],
      };
    }
    return {
      hashtagTheme: ['kinh doanh', 'doanh nghiệp', 'phát triển', 'thành công'],
      primaryHashtags: [brandTag, '#KinhDoanh', '#DoanhNghiep', '#ThanhCong', '#PhatTrien'],
    };
  }
}
