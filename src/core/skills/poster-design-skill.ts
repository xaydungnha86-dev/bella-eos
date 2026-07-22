/**
 * 🎨 POSTER & BANNER DESIGN SKILL — BELLA EOS CREATIVE WORKER ENGINE
 * Specification: Enterprise Agent Skill v1.0
 * Role: Provides Poster Design & Commercial Sales Banner Generation Capabilities
 */

export interface PosterDesignSpec {
  headline: string;
  subheadline: string;
  offerBadge: string;
  ctaText: string;
  colorScheme: 'emerald_teal_gold' | 'luxury_dark_blue' | 'modern_purple';
  aspectRatio: '16:9' | '1:1' | '9:16';
  resolution: string;
}

export class PosterDesignSkill {
  public static readonly SKILL_NAME = 'poster_design_creative';
  public static readonly SKILL_VERSION = '1.0.0';

  /**
   * Transforms raw marketing intent into a structured 4K Commercial Sales Poster Prompt
   */
  public static buildSalesPosterPrompt(objective: string, context?: any): string {
    const tone = context?.tone || 'Professional, Premium & High-Converting';
    const brandName = 'BELLA EOS';
    
    return [
      `A high-converting 4K commercial sales poster design for ${brandName} Spa Management Software.`,
      `VISUAL HIERARCHY: Center features a sleek 3D iPad Pro glass mockup displaying the Bella EOS Spa Management dashboard with booking calendar grids, revenue analytics charts, and staff management badges.`,
      `GRAPHIC LAYOUT: Bold typography header reading 'BELLA EOS - HE THONG QUAN LY SPA THONG MINH', prominent badge reading '[DANG KY DEMO 1-1 MIEN PHI]', clean call-to-action button 'DANG KY NGAY'.`,
      `COLOR PALETTE: Luxurious deep emerald green (#0F382C), soft gold accents (#D4AF37), and clean white space.`,
      `BACKGROUND: Elegant modern luxury spa interior with soft ambient lighting and subtle bokeh.`,
      `DESIGN QUALITY: 4K advertisement standards, high contrast, 16:9 banner aspect ratio, professional commercial graphic design for Meta/Facebook Ads.`
    ].join(' ');
  }

  /**
   * Renders dynamic SVG/HTML5 Sales Banner Data URL fallback
   */
  public static renderDynamicPosterSvg(spec: Partial<PosterDesignSpec>): string {
    const headline = spec.headline || 'GIẢI PHÁP QUẢN LÝ SPA THÔNG MINH BELLA EOS';
    const badge = spec.offerBadge || 'ĐĂNG KÝ DEMO 1-1 MIỄN PHÍ';
    const cta = spec.ctaText || 'NHẬN ƯU ĐÃI NGAY';

    // Ultra-clean SVG Sales Poster Data URL with 4K typography & mockup
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#061E17"/>
          <stop offset="50%" stop-color="#0B3026"/>
          <stop offset="100%" stop-color="#144D3E"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F3E5AB"/>
          <stop offset="50%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#AA7C11"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="1050" cy="150" r="300" fill="#D4AF37" opacity="0.08"/>
      
      <!-- Brand Header -->
      <rect x="60" y="45" width="220" height="36" rx="18" fill="url(#gold)"/>
      <text x="170" y="69" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#061E17" text-anchor="middle">BELLA EOS PLATFORM</text>
      
      <!-- Offer Badge -->
      <rect x="60" y="110" width="340" height="32" rx="8" fill="#E6F4EA" stroke="#34A853" stroke-width="1.5"/>
      <text x="230" y="131" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#137333" text-anchor="middle">🎁 ${badge}</text>
      
      <!-- Main Sales Headline -->
      <text x="60" y="195" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${headline.substring(0, 42)}</text>
      
      <!-- Bullet Points -->
      <text x="60" y="255" font-family="Arial, sans-serif" font-size="18" fill="#D1E7DD">⚡ Tối ưu 90% thời gian xếp lịch KTV Spa</text>
      <text x="60" y="295" font-family="Arial, sans-serif" font-size="18" fill="#D1E7DD">📈 Tự động hóa báo cáo doanh thu theo thời gian thực</text>
      <text x="60" y="335" font-family="Arial, sans-serif" font-size="18" fill="#D1E7DD">🎯 Chăm sóc khách hàng cũ & giữ chân KH VIP</text>
      
      <!-- Call to Action Button -->
      <rect x="60" y="390" width="260" height="54" rx="27" fill="url(#gold)"/>
      <text x="190" y="424" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#061E17" text-anchor="middle">${cta} →</text>
      
      <!-- iPad Mockup Graphic Placeholder -->
      <rect x="680" y="90" width="460" height="450" rx="28" fill="#1E293B" stroke="#D4AF37" stroke-width="3"/>
      <rect x="700" y="110" width="420" height="410" rx="16" fill="#0F172A"/>
      <text x="910" y="300" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#94A3B8" text-anchor="middle">📊 Bella EOS Spa Dashboard</text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  }
}
