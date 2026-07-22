/**
 * 🎨 POSTER & BANNER DESIGN SKILL — BELLA EOS CREATIVE WORKER ENGINE
 * Specification: Enterprise Agent Skill v3.0
 * Role: Dynamic Commercial Sales Poster Generator with Business Context & Multi-Task Copy Ingestion
 */

export interface BrandDnaContext {
  voiceTone?: string;              // e.g. "Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế"
  brandName?: string;              // e.g. "BELLA EOS"
  brandColors?: {
    primary?: string;              // e.g. "#061E17"
    accent?: string;               // e.g. "#D4AF37"
  };
  visualStyle?: string;            // e.g. "Luxury Spa Ambient, 3D Glassmorphism iPad Mockup"
  targetSegment?: string;          // e.g. "Chủ Spa & Thẩm mỹ viện cao cấp"
}

export interface PosterDesignSpec {
  headline: string;
  subheadline?: string;
  offerBadge: string;
  ctaText: string;
  brandDna?: BrandDnaContext;
  bulletPoints?: string[];
  aspectRatio: '16:9' | '1:1' | '9:16';
  resolution: string;
  objective?: string;
}

export class PosterDesignSkill {
  public static readonly SKILL_NAME = 'poster_design_creative';
  public static readonly SKILL_VERSION = '3.0.0';

  /**
   * Helper to resolve dynamic segment parameters based on objective
   */
  private static resolveDynamicContext(objective: string, brandDna?: BrandDnaContext, copywriterContent?: string) {
    const lowerObj = objective.toLowerCase();
    
    // ── Extract real data from copywriter output to avoid hardcoding ──────────
    // Parse budget from objective (e.g. "50 triệu", "100M", "20tr")
    const budgetMatch = objective.match(/(\d+[\.,]?\d*)\s*(triệu|tr\b|m\b|million)/i);
    const budget = budgetMatch ? `${budgetMatch[1]} triệu VND` : null;
    
    // Parse time from objective (e.g. "30 ngày", "2 tuần", "1 tháng")
    const timeMatch = objective.match(/(\d+)\s*(ngày|tuần|tháng|ngay|tuan|thang)/i);
    const timeframe = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : '30 ngày';
    
    // Parse growth/percentage target from objective
    const growthMatch = objective.match(/(\d+)\s*%/);
    const growthTarget = growthMatch ? `${growthMatch[1]}%` : null;
    
    // Extract key action phrase from copywriter content (first sentence / tagline)
    let extractedHeadline = '';
    if (copywriterContent && copywriterContent.length > 10) {
      // Try to get first meaningful line (not empty, not just emoji)
      const lines = copywriterContent.split('\n').filter(l => l.trim().length > 15);
      if (lines.length > 0) {
        extractedHeadline = lines[0].replace(/^[*#\-–•]+\s*/, '').trim().substring(0, 80);
      }
    }

    let productDomain = 'Dịch vụ / Sản phẩm chiến dịch';
    let targetAudience = brandDna?.targetSegment || 'Khách hàng tiềm năng & Đối tác';
    let voiceTone = brandDna?.voiceTone || 'Chuyên nghiệp, Uy tín & Ấn tượng';
    let visualStyle = brandDna?.visualStyle || 'Thương hiệu phong cách hiện đại';
    let offerBadge = '🎁 DEMO / TRẢI NGHIỆM MIỄN PHÍ CÙNG CHUYÊN GIA';
    let bgPerspective = 'Không gian sang trọng, ánh sáng ấm áp, làm nổi bật sản phẩm chính.';
    let keyMetrics: string;

    if (lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp') || lowerObj.includes('salon')) {
      productDomain = 'Phần mềm Quản lý Spa & Thẩm mỹ viện AI-Native';
      targetAudience = 'Chủ Spa, Quản lý Thẩm mỹ viện & Chuỗi Cơ sở Làm đẹp';
      voiceTone = 'Cao cấp, Sang trọng, Nhẹ nhàng, Tinh tế & Uy tín';
      visualStyle = 'Luxury Spa Ambient, 3D Glassmorphism iPad Mockup';
      offerBadge = budget
        ? `🎁 TRIỂN KHAI DEMO NGAY — NGÂN SÁCH ${budget} / ${timeframe}`
        : '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
      bgPerspective = 'Authentic Luxury Spa Interior with ambient soothing lighting and subtle bokeh.';
      // Dynamic metrics using parsed values from objective
      const revenueGrowth = growthTarget || '25.8%';
      keyMetrics = `+${revenueGrowth} Doanh thu ${timeframe} | Tự động hóa 90% lịch hẹn | SOP Audit 100%`;

    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ') || lowerObj.includes('chung cư') || lowerObj.includes('nhà đất')) {
      productDomain = 'Dự án Bất động sản & Căn hộ Cao cấp';
      targetAudience = 'Nhà đầu tư, Người mua nhà định cư & Khách hàng thượng lưu';
      voiceTone = 'Đáng tin cậy, Sang trọng, Hiện đại & Minh bạch';
      visualStyle = 'Premium Real Estate Showcase, 3D Architectural Mockup';
      offerBadge = budget
        ? `🎁 ƯU ĐÃI ĐẶC BIỆT — CHÍNH SÁCH ${budget} | ${timeframe}`
        : '🎁 NHẬN BẢNG GIÁ & CHÍNH SÁCH ƯU ĐÃI MỚI NHẤT';
      bgPerspective = 'Phối cảnh dự án căn hộ cao cấp sang trọng, ánh hoàng hôn ấm áp và tầm nhìn panorama.';
      keyMetrics = `Vị trí đắc địa | Chiết khấu ${growthTarget || '8.5%'} | ${timeframe} hoàn thành`;

    } else if (lowerObj.includes('thời trang') || lowerObj.includes('quần áo') || lowerObj.includes('boutique') || lowerObj.includes('shop')) {
      productDomain = 'Thương hiệu Thời trang & Thiết kế Cao cấp';
      targetAudience = 'Tín đồ thời trang, Khách hàng trẻ trung & Hiện đại';
      voiceTone = 'Cá tính, Phong cách, Trẻ trung & Ấn tượng';
      visualStyle = 'High-Fashion Lookbook layout';
      offerBadge = `🎁 GIẢM NGAY ${growthTarget || '20%'} CHO ĐƠN HÀNG ĐẦU TIÊN`;
      bgPerspective = 'Không gian boutique hiện đại, ánh sáng studio nghệ thuật và các bộ sưu tập thời trang.';
      keyMetrics = `Chất liệu cao cấp | Giảm ${growthTarget || '20%'} đơn đầu | ${timeframe} Free Ship`;

    } else {
      // Generic: use parsed data from objective
      const cleanObj = objective.replace(/chiến dịch|tạo|thiết kế|banner|viết bài/gi, '').trim();
      if (cleanObj.length > 5) productDomain = cleanObj;
      offerBadge = budget
        ? `🎁 TRIỂN KHAI CHIẾN DỊCH — NGÂN SÁCH ${budget} / ${timeframe}`
        : '🎁 NHẬN TƯ VẤN & DEMO MIỄN PHÍ';
      keyMetrics = [
        growthTarget ? `+${growthTarget} Hiệu quả chiến dịch` : '+25% Hiệu quả',
        budget ? `Ngân sách: ${budget}` : 'Tối ưu ngân sách',
        `Hoàn thành trong ${timeframe}`
      ].join(' | ');
    }

    return { productDomain, targetAudience, voiceTone, visualStyle, offerBadge, bgPerspective, keyMetrics, extractedHeadline };
  }

  /**
   * Generates a Master AI Design Prompt Specification dynamically
   * — truly mutates every run based on objective + copywriter content
   */
  public static buildFullDesignSpecPrompt(
    objective: string,
    copywriterSnippet?: string,
    brandDna?: BrandDnaContext,
    actualModel?: string,
    actualPrompt?: string
  ): string {
    const brandName = brandDna?.brandName || 'BELLA EOS';
    const primaryColor = brandDna?.brandColors?.primary || '#061E17';
    const accentColor = brandDna?.brandColors?.accent || '#D4AF37';

    const dyn = this.resolveDynamicContext(objective, brandDna, copywriterSnippet);

    // Use real headline from copywriter output, then objective-derived, then fallback
    const headlineText = dyn.extractedHeadline || copywriterSnippet?.substring(0, 80) || `GIẢI PHÁP TỐI ƯU CÙNG ${brandName}`;

    // Timestamp to prove dynamic generation
    const now = new Date();
    const runStamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    const modelDisplay = actualModel || 'Bella Dynamic PNG Graphic Engine (Local Fallback)';
    const promptDisplay = actualPrompt || this.buildSalesPosterPrompt(objective, headlineText, brandDna);

    return `🎨 MASTER AI DESIGN PROMPT SPECIFICATION (${brandName.toUpperCase()} CREATIVE WORKER)
===================================================================
⏱️  Generated: ${now.toLocaleDateString('vi-VN')} ${runStamp} — Chiến dịch: "${objective.substring(0, 60)}"

1. BRAND & BUSINESS CONTEXT:
   - Enterprise Brand: ${brandName}
   - Product Domain: ${dyn.productDomain}
   - Target Audience: ${dyn.targetAudience}
   - Voice & Tone: ${dyn.voiceTone}

2. VISUAL COMPOSITION & LAYOUT SPECIFICATION:
   - Format & Resolution: 1200x630px Commercial Sales Banner (Aspect Ratio 16:9)
   - Left Column (60%): Enterprise Logo + Offer Badge + Dynamic Headline Hook + Bullet Benefits + CTA Button
   - Right Column (40%): 3D Glassmorphism iPad Pro Mockup displaying UI khớp chủ đề chiến dịch

3. DYNAMIC ELEMENTS & HOOK TYPOGRAPHY:
   - Logo Badge: 🏆 ${brandName.toUpperCase()} PLATFORM (Royal Gold Accent)
   - Offer Badge: ${dyn.offerBadge}
   - Headline Hook: "${headlineText}" (High-contrast 4K Sans-Serif)
   - Key Metric Highlights: ${dyn.keyMetrics}
   - Call-To-Action: 👉 ĐĂNG KÝ TRẢI NGHIỆM NGAY →

4. COLOR PALETTE & LIGHTING AMBIENCE:
   - Primary Base: Brand Primary Color (${primaryColor})
   - Royal Accent: Gold (${accentColor}) & Clean White Typography
   - Background Perspective: ${dyn.bgPerspective}

5. AI EXECUTION MODEL:
   - Selected Engine: ${modelDisplay}
   - Exact API Prompt Sent: "${promptDisplay}"
===================================================================`;
  }

  private static removeVietnameseAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  /**
   * Builds an AI Image Generation Prompt dynamically
   */
  public static buildSalesPosterPrompt(objective: string, copyHeadline?: string, brandDna?: BrandDnaContext): string {
    const brandName = brandDna?.brandName || 'BELLA EOS';
    const headlineText = copyHeadline || `GIẢI PHÁP TỐI ƯU CÙNG ${brandName}`;
    const primaryColor = brandDna?.brandColors?.primary || '#061E17';
    const accentColor = brandDna?.brandColors?.accent || '#D4AF37';

    const lowerObj = objective.toLowerCase();
    
    let domainDesc = `commercial sales product graphic for ${brandName}`;
    let bgDesc = `modern premium studio setting, professional clean background, harmonious warm lighting`;
    let centerDesc = `sleek professional product mockups showcasing clean UI design and high-tech corporate dashboard interfaces`;
    let offerDesc = `[DANG KY TRAI NGHIEM MIEN PHI]`;
    let ctaDesc = `NHAN UU DAI NGAY`;

    if (lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp') || lowerObj.includes('salon')) {
      domainDesc = `${brandName} Spa Management Software`;
      bgDesc = `Luxurious Spa Treatment Room atmosphere with soft warm lighting, serene candles, lush greenery, and premium spa aesthetics`;
      centerDesc = `A sleek 3D iPad Pro glass mockup displaying the Bella EOS Spa Management dashboard (booking calendar, revenue analytics chart showing +20% growth, staff scheduling)`;
      offerDesc = `[DANG KY DEMO 1-1 MIEN PHI]`;
      ctaDesc = `NHAN UU DAI NGAY`;
    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ') || lowerObj.includes('chung cư') || lowerObj.includes('nhà đất')) {
      domainDesc = `${brandName} Premium Real Estate Project`;
      bgDesc = `Stunning high-end modern apartment building project view, warm golden hour sunset lighting, panoramic cityscape bokeh`;
      centerDesc = `An elegant 3D glass showcase or architectural mockup displaying the project blueprint, layout pricing plan, and luxury residence exterior rendering`;
      offerDesc = `[NHAN BANG GIA & UU DAI]`;
      ctaDesc = `LIEN HE NGAY`;
    } else if (lowerObj.includes('thời trang') || lowerObj.includes('quần áo') || lowerObj.includes('boutique') || lowerObj.includes('shop')) {
      domainDesc = `${brandName} High-Fashion Designer Collection`;
      bgDesc = `Chic modern fashion boutique interior, studio spotlighting, clothing apparel on designer racks`;
      centerDesc = `A stylish lookbook presentation or dynamic glass frame showcasing elegant seasonal fashion design trends`;
      offerDesc = `[GIAM NGAY 20% HOAC FREE SHIP]`;
      ctaDesc = `MUA NGAY`;
    } else {
      const cleanObj = objective.replace(/chiến dịch|tạo|thiết kế|banner|viết bài/gi, '').trim();
      domainDesc = `${brandName} - ${cleanObj}`;
    }

    const cleanHeadline = this.removeVietnameseAccents(headlineText);

    return [
      `A high-converting 4K commercial sales poster graphic for ${domainDesc}.`,
      `BACKGROUND CONTEXT: ${bgDesc}.`,
      `CENTER GRAPHIC: ${centerDesc}.`,
      `TYPOGRAPHY LAYOUT: High-contrast sans-serif header reading '${cleanHeadline}' with no accents, prominent offer badge '${offerDesc}', clean CTA button '${ctaDesc}'.`,
      `COLOR PALETTE: Primary brand color (${primaryColor}) and accent color (${accentColor}) details, with high-contrast text layout.`,
      `QUALITY: 4K advertisement standards, high contrast, 16:9 aspect ratio, Meta/Facebook Ads ready, no spelling mistakes, no garbled text, only plain English or unaccented text.`
    ].join(' ');
  }

  /**
   * Renders dynamic SVG/HTML5 Commercial Graphic Banner containing Logo, Dynamic Copywriter Text & UI Mockup
   */
  public static renderDynamicPosterSvg(spec: Partial<PosterDesignSpec>): string {
    const objective = spec.objective || 'Spa Management Software';
    const headline = spec.headline || 'GIẢI PHÁP TỐI ƯU CHO DOANH NGHIỆP';
    const badge = spec.offerBadge || '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
    const cta = spec.ctaText || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';
    const primaryHex = spec.brandDna?.brandColors?.primary || '#061E17';
    const goldHex = spec.brandDna?.brandColors?.accent || '#D4AF37';

    const lowerObj = objective.toLowerCase();

    // Default Images
    let bgUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'; // modern business office
    let bullet1 = '✨ Tối ưu hóa hiệu suất vận hành doanh nghiệp';
    let bullet2 = '📈 Tự động hóa quy trình quản lý thông minh';
    let bullet3 = '🎯 Hỗ trợ chuyên nghiệp 24/7 từ chuyên gia';
    
    let ipadTitle = '📊 Bella Enterprise Command Center';
    let ipadWidget1 = 'DOANH THU HỆ THỐNG';
    let ipadWidget2 = 'TIẾN TRÌNH CHIẾN DỊCH';
    let ipadFeed1 = '✓ Khởi tạo: Ý chí chỉ thị của CEO đã được tiếp nhận';
    let ipadFeed2 = '✓ AI Agent phân rã kế hoạch thành công';
    let ipadFeed3 = '✓ Tự động tối ưu hóa và đột biến quy trình SOP';

    if (lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp') || lowerObj.includes('salon')) {
      bgUrl = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop'; // Luxury Spa
      bullet1 = '✨ Tự động hóa 90% quy trình xếp lịch & phân ca KTV';
      bullet2 = '📈 Báo cáo doanh thu thời gian thực chuẩn AI-Native';
      bullet3 = '🎯 Giữ chân 95% khách hàng VIP cá nhân hóa';
      
      ipadTitle = '📊 Bella EOS Spa Management System';
      ipadWidget1 = 'DOANH THU THÁNG NÀY';
      ipadWidget2 = 'LỊCH ĐẶT SPA KTV';
      ipadFeed1 = '✓ Khách hàng Nguyễn Thảo đăng ký Lịch Demo';
      ipadFeed2 = '✓ AI COO điều phối KTV & gửi SMS xác nhận';
      ipadFeed3 = '✓ Báo cáo doanh thu đồng bộ Supabase ERP';
    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ') || lowerObj.includes('chung cư') || lowerObj.includes('nhà đất')) {
      bgUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop'; // condo/apartment
      bullet1 = '✨ Vị trí đắc địa tại giao điểm vàng trung tâm';
      bullet2 = '📈 Ưu đãi chiết khấu & hỗ trợ lãi suất 0%';
      bullet3 = '🎯 Hệ thống tiện ích 5 sao đẳng cấp quốc tế';
      
      ipadTitle = '🏢 Bella Real Estate Investor Portal';
      ipadWidget1 = 'TỶ LỆ LẤY CĂN (BOOKED)';
      ipadWidget2 = 'PHÂN KHU ĐANG MỞ BÁN';
      ipadFeed1 = '✓ Khách đặt chỗ thành công Căn hộ B12-05';
      ipadFeed2 = '✓ AI Sales xuất phiếu cọc & hợp đồng điện tử';
      ipadFeed3 = '✓ Giỏ hàng căn hộ cập nhật thời gian thực';
    } else if (lowerObj.includes('thời trang') || lowerObj.includes('quần áo') || lowerObj.includes('boutique') || lowerObj.includes('shop')) {
      bgUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop'; // boutique shop
      bullet1 = '✨ Thiết kế độc quyền dẫn đầu xu hướng thời trang';
      bullet2 = '📈 Chất liệu organic cao cấp thân thiện làn da';
      bullet3 = '🎯 Ưu đãi giảm 20% cho đơn hàng đầu tiên';
      
      ipadTitle = '🛍️ Bella Fashion Commerce Hub';
      ipadWidget1 = 'DOANH SỐ ĐƠN HÀNG';
      ipadWidget2 = 'SẢN PHẨM BÁN CHẠY';
      ipadFeed1 = '✓ Đơn hàng mới #10943 từ khách hàng Lê Vy';
      ipadFeed2 = '✓ AI Marketing tự động gửi voucher tri ân';
      ipadFeed3 = '✓ Cập nhật tồn kho sản phẩm áo Blazer';
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bgOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryHex}" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#0B3026" stop-opacity="0.89"/>
          <stop offset="100%" stop-color="#144D3E" stop-opacity="0.93"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F3E5AB"/>
          <stop offset="50%" stop-color="${goldHex}"/>
          <stop offset="100%" stop-color="#AA7C11"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- 1. Background Image -->
      <image href="${bgUrl}" width="1200" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.35"/>

      <!-- 2. Dark Gradient Overlay -->
      <rect width="1200" height="630" fill="url(#bgOverlay)"/>
      <circle cx="1050" cy="150" r="320" fill="${goldHex}" opacity="0.06"/>

      <!-- 3. Enterprise Brand Logo Badge -->
      <g transform="translate(60, 45)">
        <rect width="240" height="40" rx="20" fill="url(#gold)"/>
        <text x="120" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="${primaryHex}" text-anchor="middle" letter-spacing="1">BELLA EOS PLATFORM</text>
      </g>

      <!-- 4. Dynamic Offer Badge -->
      <g transform="translate(60, 105)">
        <rect width="440" height="36" rx="10" fill="#E6F4EA" stroke="#34A853" stroke-width="1.5"/>
        <text x="220" y="23" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#137333" text-anchor="middle">${badge.substring(0, 50)}</text>
      </g>

      <!-- 5. Dynamic Headline -->
      <text x="60" y="195" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" width="560">
        ${headline.substring(0, 45)}
      </text>

      <!-- 6. Key Value Propositions -->
      <g font-family="'Segoe UI', Roboto, sans-serif" font-size="17" fill="#D1E7DD">
        <text x="60" y="260">${bullet1}</text>
        <text x="60" y="300">${bullet2}</text>
        <text x="60" y="340">${bullet3}</text>
      </g>

      <!-- 7. CTA Button -->
      <g transform="translate(60, 395)" filter="url(#shadow)">
        <rect width="320" height="58" rx="29" fill="url(#gold)"/>
        <text x="160" y="35" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="${primaryHex}" text-anchor="middle">${cta.substring(0, 32)} →</text>
      </g>

      <!-- 8. iPad Mockup UI -->
      <g transform="translate(640, 80)" filter="url(#shadow)">
        <rect width="500" height="470" rx="30" fill="#1E293B" stroke="${goldHex}" stroke-width="3"/>
        <rect x="16" y="16" width="468" height="438" rx="18" fill="#0F172A"/>
        
        <rect x="16" y="16" width="468" height="44" fill="#1E293B"/>
        <circle cx="45" cy="38" r="6" fill="#EF4444"/>
        <circle cx="65" cy="38" r="6" fill="#F59E0B"/>
        <circle cx="85" cy="38" r="6" fill="#10B981"/>
        <text x="250" y="42" font-family="sans-serif" font-size="12" font-weight="bold" fill="#94A3B8" text-anchor="middle">${ipadTitle}</text>

        <!-- Revenue Chart -->
        <rect x="36" y="80" width="210" height="110" rx="12" fill="#1E293B"/>
        <text x="52" y="105" font-family="sans-serif" font-size="11" fill="#94A3B8">${ipadWidget1}</text>
        <text x="52" y="135" font-family="sans-serif" font-size="22" font-weight="bold" fill="#10B981">+20.4% 📈</text>
        <text x="52" y="165" font-family="sans-serif" font-size="10" fill="#64748B">Tự động tối ưu bởi AI</text>

        <!-- Schedule Grid -->
        <rect x="260" y="80" width="208" height="110" rx="12" fill="#1E293B"/>
        <text x="276" y="105" font-family="sans-serif" font-size="11" fill="#94A3B8">${ipadWidget2}</text>
        <rect x="276" y="120" width="176" height="24" rx="6" fill="#065F46"/>
        <text x="286" y="136" font-family="sans-serif" font-size="10" font-weight="bold" fill="#A7F3D0">🌿 Active #01 (Chờ)</text>
        <rect x="276" y="150" width="176" height="24" rx="6" fill="#1E3A8A"/>
        <text x="286" y="166" font-family="sans-serif" font-size="10" font-weight="bold" fill="#BFDBFE">🌿 Active #02 (Đang chạy)</text>

        <!-- Live Feed -->
        <rect x="36" y="210" width="432" height="220" rx="12" fill="#1E293B"/>
        <text x="52" y="235" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F8FAFC">⚡ TIẾN TRÌNH TỰ ĐỘNG HÓA REAL-TIME</text>
        <line x1="52" y1="250" x2="450" y2="250" stroke="#334155" stroke-width="1"/>
        
        <text x="52" y="280" font-family="sans-serif" font-size="11" fill="#CBD5E1">${ipadFeed1}</text>
        <text x="52" y="315" font-family="sans-serif" font-size="11" fill="#CBD5E1">${ipadFeed2}</text>
        <text x="52" y="350" font-family="sans-serif" font-size="11" fill="#CBD5E1">${ipadFeed3}</text>
        <rect x="52" y="375" width="180" height="30" rx="6" fill="url(#gold)"/>
        <text x="142" y="394" font-family="sans-serif" font-size="11" font-weight="bold" fill="${primaryHex}" text-anchor="middle">STATUS: OPTIMIZED 100%</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  }
}
