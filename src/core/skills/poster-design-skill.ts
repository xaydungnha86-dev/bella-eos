/**
 * 🎨 POSTER & BANNER DESIGN SKILL — BELLA EOS CREATIVE WORKER ENGINE
 * Specification: Enterprise Agent Skill v2.0
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
}

export class PosterDesignSkill {
  public static readonly SKILL_NAME = 'poster_design_creative';
  public static readonly SKILL_VERSION = '2.0.0';

  /**
   * Builds an AI Image Generation Prompt incorporating dynamic Copywriter headline & Spa context
   */
  public static buildSalesPosterPrompt(objective: string, copyHeadline?: string, brandDna?: BrandDnaContext): string {
    const tone = brandDna?.voiceTone || 'Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế';
    const brandName = brandDna?.brandName || 'BELLA EOS';
    const headlineText = copyHeadline || 'GIẢI PHÁP QUẢN LÝ SPA THÔNG MINH BELLA EOS';

    return [
      `A high-converting 4K commercial sales poster graphic for ${brandName} Spa Management Software.`,
      `BACKGROUND CONTEXT: Luxurious Spa Treatment Room atmosphere with soft warm lighting, serene candles, lush greenery, and premium spa aesthetics.`,
      `CENTER GRAPHIC: A sleek 3D iPad Pro glass mockup displaying the Bella EOS Spa Management dashboard (booking calendar, revenue analytics chart showing +20% growth, staff scheduling).`,
      `TYPOGRAPHY LAYOUT: High-contrast header reading '${headlineText}', prominent offer badge '[DANG KY DEMO 1-1 MIEN PHI]', clean CTA button 'NHAN UU DAI NGAY'.`,
      `COLOR PALETTE: Deep emerald green (#061E17), royal gold (#D4AF37) accents, and clean white space.`,
      `QUALITY: 4K advertisement standards, high contrast, 16:9 aspect ratio, Meta/Facebook Ads ready.`
    ].join(' ');
  }

  /**
   * Renders dynamic SVG/HTML5 Commercial Graphic Banner containing Logo, Dynamic Copywriter Text & Spa UI Mockup
   */
  public static renderDynamicPosterSvg(spec: Partial<PosterDesignSpec>): string {
    const headline = spec.headline || 'BELLA EOS GIẢI QUYẾT TRIỆT ĐỂ BÀI TOÁN SPA';
    const badge = spec.offerBadge || '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
    const cta = spec.ctaText || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';
    const primaryHex = spec.brandDna?.brandColors?.primary || '#061E17';
    const goldHex = spec.brandDna?.brandColors?.accent || '#D4AF37';

    // Luxury Spa Environment Background Image URL embedded into SVG
    const spaBgUrl = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop';

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <!-- Spa Photo Background + Dark Gradient Overlay -->
        <linearGradient id="bgOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryHex}" stop-opacity="0.94"/>
          <stop offset="50%" stop-color="#0B3026" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#144D3E" stop-opacity="0.92"/>
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

      <!-- 1. Authentic Spa Environment Background Image -->
      <image href="${spaBgUrl}" width="1200" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.35"/>

      <!-- 2. Dark Emerald Gradient Mask for High Contrast Typography -->
      <rect width="1200" height="630" fill="url(#bgOverlay)"/>
      <circle cx="1050" cy="150" r="320" fill="${goldHex}" opacity="0.06"/>

      <!-- 3. Enterprise Brand Logo Badge -->
      <g transform="translate(60, 45)">
        <rect width="240" height="40" rx="20" fill="url(#gold)"/>
        <text x="120" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="${primaryHex}" text-anchor="middle" letter-spacing="1">BELLA EOS PLATFORM</text>
      </g>

      <!-- 4. Dynamic Offer Badge (From Copywriter Output) -->
      <g transform="translate(60, 105)">
        <rect width="440" height="36" rx="10" fill="#E6F4EA" stroke="#34A853" stroke-width="1.5"/>
        <text x="220" y="23" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#137333" text-anchor="middle">${badge.substring(0, 50)}</text>
      </g>

      <!-- 5. Dynamic Main Sales Headline (Extracted from Copywriter Task) -->
      <text x="60" y="195" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" width="560">
        ${headline.substring(0, 45)}
      </text>

      <!-- 6. Key Value Propositions -->
      <g font-family="'Segoe UI', Roboto, sans-serif" font-size="17" fill="#D1E7DD">
        <text x="60" y="260">✨ Tự động hóa 90% quy trình xếp lịch &amp; phân ca KTV</text>
        <text x="60" y="300">📈 Báo cáo doanh thu thời gian thực theo chuẩn AI-Native</text>
        <text x="60" y="340">🎯 Giữ chân 95% khách hàng VIP với kịch bản cá nhân hóa</text>
      </g>

      <!-- 7. Dynamic Call-To-Action Button (From Copywriter Task) -->
      <g transform="translate(60, 395)" filter="url(#shadow)">
        <rect width="320" height="58" rx="29" fill="url(#gold)"/>
        <text x="160" y="35" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="${primaryHex}" text-anchor="middle">${cta.substring(0, 32)} →</text>
      </g>

      <!-- 8. Dynamic 3D iPad Pro Glass Mockup Displaying Spa Management Software UI -->
      <g transform="translate(640, 80)" filter="url(#shadow)">
        <!-- iPad Frame -->
        <rect width="500" height="470" rx="30" fill="#1E293B" stroke="${goldHex}" stroke-width="3"/>
        <rect x="16" y="16" width="468" height="438" rx="18" fill="#0F172A"/>
        
        <!-- Spa Software UI Header Bar -->
        <rect x="16" y="16" width="468" height="44" fill="#1E293B"/>
        <circle cx="45" cy="38" r="6" fill="#EF4444"/>
        <circle cx="65" cy="38" r="6" fill="#F59E0B"/>
        <circle cx="85" cy="38" r="6" fill="#10B981"/>
        <text x="250" y="42" font-family="sans-serif" font-size="12" font-weight="bold" fill="#94A3B8" text-anchor="middle">📊 Bella EOS Spa Management System</text>

        <!-- UI Widget 1: Revenue Chart -->
        <rect x="36" y="80" width="210" height="110" rx="12" fill="#1E293B"/>
        <text x="52" y="105" font-family="sans-serif" font-size="11" fill="#94A3B8">DOANH THU THÁNG NÀY</text>
        <text x="52" y="135" font-family="sans-serif" font-size="22" font-weight="bold" fill="#10B981">+20.4% 📈</text>
        <text x="52" y="165" font-family="sans-serif" font-size="10" fill="#64748B">Tự động tối ưu bởi AI</text>

        <!-- UI Widget 2: KTV Schedule Grid -->
        <rect x="260" y="80" width="208" height="110" rx="12" fill="#1E293B"/>
        <text x="276" y="105" font-family="sans-serif" font-size="11" fill="#94A3B8">LỊCH ĐẶT SPA KTV</text>
        <rect x="276" y="120" width="176" height="24" rx="6" fill="#065F46"/>
        <text x="286" y="136" font-family="sans-serif" font-size="10" font-weight="bold" fill="#A7F3D0">🌿 Ca 1: Phòng VIP #01 (Chờ)</text>
        <rect x="276" y="150" width="176" height="24" rx="6" fill="#1E3A8A"/>
        <text x="286" y="166" font-family="sans-serif" font-size="10" font-weight="bold" fill="#BFDBFE">🌿 Ca 2: Thảo Dược #03 (Active)</text>

        <!-- UI Widget 3: Live Customer Feed -->
        <rect x="36" y="210" width="432" height="220" rx="12" fill="#1E293B"/>
        <text x="52" y="235" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F8FAFC">⚡ TIẾN TRÌNH TỰ ĐỘNG HÓA SPA REAL-TIME</text>
        <line x1="52" y1="250" x2="450" y2="250" stroke="#334155" stroke-width="1"/>
        
        <text x="52" y="280" font-family="sans-serif" font-size="11" fill="#CBD5E1">✓ 15:20 - Khách hàng Nguyễn Thảo đăng ký Lịch Demo Spa</text>
        <text x="52" y="315" font-family="sans-serif" font-size="11" fill="#CBD5E1">✓ 15:21 - AI COO tự động điều phối KTV &amp; gửi SMS xác nhận</text>
        <text x="52" y="350" font-family="sans-serif" font-size="11" fill="#CBD5E1">✓ 15:22 - Báo cáo doanh thu đồng bộ với Supabase ERP</text>
        <rect x="52" y="375" width="180" height="30" rx="6" fill="url(#gold)"/>
        <text x="142" y="394" font-family="sans-serif" font-size="11" font-weight="bold" fill="${primaryHex}" text-anchor="middle">STATUS: OPTIMIZED 100%</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  }
}
