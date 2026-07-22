import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/banner-image
 *
 * BELLA EOS DYNAMIC STRUCTURAL GRAPHIC DESIGN ENGINE (v4.0)
 * Truly mutates Layout Structure, Typography Hierarchy, Graphic Elements,
 * and Perspective Backgrounds for every campaign.
 *
 * 4 DISTINCT STRUCTURAL LAYOUT COMPOSITIONS:
 *  1. 'split_right': Content Left (58%) + 3D iPad Mockup Right (38%)
 *  2. 'split_left': 3D Tablet Mockup Left (42%) + Content & Feature Cards Right (54%)
 *  3. 'magazine_center': Top Spa Header + Giant Centered Typography Hook + Floating Glass Cards
 *  4. 'spotlight_editorial': Golden Frame + Stacked Feature Cards + 3D Dashboard Spotlight
 */

const THEMES = [
  {
    name: 'emerald',
    bg: '#061E17',
    radial: '#144D3E',
    accent: '#D4AF37',
    textAccent: '#F3E5AB',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    badgeBg: '#E6F4EA',
    badgeText: '#137333',
    badgeBorder: '#34A853',
    statusColor: '#10B981',
  },
  {
    name: 'navy',
    bg: '#0A192F',
    radial: '#1E3A8A',
    accent: '#38BDF8',
    textAccent: '#E0F2FE',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    badgeBorder: '#0284C7',
    statusColor: '#38BDF8',
  },
  {
    name: 'purple',
    bg: '#1A0B2E',
    radial: '#4C1D95',
    accent: '#EC4899',
    textAccent: '#FCE7F3',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    badgeBg: '#FCE7F3',
    badgeText: '#9D174D',
    badgeBorder: '#DB2777',
    statusColor: '#F472B6',
  },
  {
    name: 'bronze',
    bg: '#1C1008',
    radial: '#78350F',
    accent: '#F59E0B',
    textAccent: '#FEF3C7',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    badgeBorder: '#D97706',
    statusColor: '#F59E0B',
  }
];

const SPA_PHOTOS = [
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop', // Treatment Room
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1200&auto=format&fit=crop', // Luxury Lobby
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop', // Facial Beauty
  'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop', // Serene Lounge
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawHeadline = searchParams.get('headline') || 'BELLA EOS GIẢI QUYẾT TRIỆT ĐỂ BÀI TOÁN SPA';
    const rawBadge = searchParams.get('badge') || '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
    const rawCta = searchParams.get('cta') || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';
    const b1 = searchParams.get('b1') || '⚡ Tối ưu xếp lịch & phân ca KTV Spa';
    const b2 = searchParams.get('b2') || '📈 Báo cáo doanh thu thời gian thực';
    const b3 = searchParams.get('b3') || '🎯 Giữ chân 95% khách hàng VIP';
    const brandName = searchParams.get('brandName') || 'BELLA EOS';
    const objective = searchParams.get('objective') || 'Spa Management Software';

    const headline = rawHeadline.substring(0, 52);
    const badge = rawBadge.substring(0, 48);
    const cta = rawCta.substring(0, 32);

    // Compute dynamic layout, theme & background photo based on text content hash and timestamp
    const tParam = searchParams.get('t') || '';
    const textHash = hashString(headline + badge + cta + tParam);
    const layoutTypes = ['split_right', 'split_left', 'magazine_center', 'spotlight_editorial'];
    const layoutStyle = layoutTypes[textHash % layoutTypes.length];
    const theme = THEMES[textHash % THEMES.length];

    const lowerObj = objective.toLowerCase();
    let bgPhotoUrl = SPA_PHOTOS[textHash % SPA_PHOTOS.length];
    if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ') || lowerObj.includes('chung cư') || lowerObj.includes('nhà đất')) {
      bgPhotoUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop';
    } else if (lowerObj.includes('thời trang') || lowerObj.includes('quần áo') || lowerObj.includes('boutique') || lowerObj.includes('shop')) {
      bgPhotoUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop';
    } else if (lowerObj.includes('cà phê') || lowerObj.includes('nhà hàng') || lowerObj.includes('cafe') || lowerObj.includes('food')) {
      bgPhotoUrl = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop';
    } else if (!lowerObj.includes('spa') && !lowerObj.includes('thẩm mỹ') && !lowerObj.includes('làm đẹp') && !lowerObj.includes('salon')) {
      bgPhotoUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop';
    }

    const spaPhotoUrl = bgPhotoUrl;

    // Dynamic Metric Highlights based on intent
    let metricTitle = 'DOANH THU THÁNG NÀY';
    let metricValue = '+25.8% 📈';
    let metricSub = 'AI COO Tự Động Tối Ưu';
    let uiTitle = `${brandName} UI Dashboard`;
    let widgetTitle = 'TIẾN TRÌNH CHIẾN DỊCH';
    let feed1 = '🌿 Active ca #01 (Chờ)';
    let feed2 = '🌿 Active ca #02 (Đang chạy)';
    let statusText = 'STATUS: OPERATIONAL 100%';

    if (lowerObj.includes('spa') || lowerObj.includes('làm đẹp') || lowerObj.includes('thẩm mỹ')) {
      metricTitle = 'DOANH THU SPA THÁNG NÀY';
      metricValue = '+25.8% 📈';
      metricSub = 'AI COO Tự Động Tối Ưu';
      uiTitle = `${brandName} Spa UI`;
      widgetTitle = 'LỊCH KTV SPA REALTIME';
      feed1 = '🌿 Phòng VIP #01 (Chờ KTV)';
      feed2 = '🌿 Thảo Dược #03 (Active)';
      statusText = 'STATUS: SPA OPERATIONAL 100%';
    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ') || lowerObj.includes('chung cư') || lowerObj.includes('nhà đất')) {
      metricTitle = 'TỶ LỆ LẤY CĂN (BOOKED)';
      metricValue = '84.2% 🏢';
      metricSub = 'Giỏ Hàng Đồng Bộ Liên Tục';
      uiTitle = `${brandName} Real Estate UI`;
      widgetTitle = 'PHÂN KHU ĐANG MỞ BÁN';
      feed1 = '🏢 Phân khu Centric (Còn 15 căn)';
      feed2 = '🏢 Phân khu Premium (Đã khóa cọc)';
      statusText = 'STATUS: AGENT ACTIVE 100%';
    } else if (lowerObj.includes('thời trang') || lowerObj.includes('quần áo') || lowerObj.includes('boutique') || lowerObj.includes('shop')) {
      metricTitle = 'DOANH SỐ ĐƠN HÀNG';
      metricValue = '1,248 🛍️';
      metricSub = 'Hệ Thống Đơn Hàng Tự Động';
      uiTitle = `${brandName} E-Commerce UI`;
      widgetTitle = 'TỒN KHO HỆ THỐNG';
      feed1 = '🛍️ Áo Blazer (Sẵn sàng - 42 chiếc)';
      feed2 = '🛍️ Áo Hoodies (Sắp hết - 5 chiếc)';
      statusText = 'STATUS: SYNCED 100%';
    }

    if (headline.toLowerCase().includes('lịch') || headline.toLowerCase().includes('ktv') || headline.toLowerCase().includes('phân ca')) {
      metricTitle = 'TỰ ĐỘNG XẾP LỊCH KTV';
      metricValue = '92.4% ⚡';
      metricSub = 'Tối Ưu Công Suất Giường Spa';
    } else if (headline.toLowerCase().includes('quản lý') || headline.toLowerCase().includes('chuẩn hóa') || headline.toLowerCase().includes('sop')) {
      metricTitle = 'CHUẨN HÓA QUY TRÌNH VẬN HÀNH';
      metricValue = '100% SOP 🎯';
      metricSub = 'Giảm 90% Lỗi Vận Hành Chuỗi';
    }

    // ── LAYOUT VARIANT 1: MAGAZINE CENTER (Centered Hero + Top Header) ───────
    if (layoutStyle === 'magazine_center') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.bg,
              backgroundImage: `radial-gradient(circle at 50% 30%, ${theme.radial} 0%, ${theme.bg} 85%)`,
              padding: '40px 60px',
              fontFamily: 'sans-serif',
              position: 'relative',
            }}
          >
            {/* Background Photo with Opacity Mask */}
            <img
              src={bgPhotoUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.2,
              }}
            />

            {/* Top Bar: Brand Logo & Offer Badge */}
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', zIndex: 10, justifyContent: 'space-between' }}>
              <div style={{ backgroundColor: theme.accent, padding: '6px 18px', borderRadius: '20px', display: 'flex' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg }}>🏆 {brandName.toUpperCase()} PLATFORM</span>
              </div>
              <div style={{ backgroundColor: theme.badgeBg, border: `1.5px solid ${theme.badgeBorder}`, padding: '6px 16px', borderRadius: '8px', display: 'flex' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.badgeText }}>{badge}</span>
              </div>
            </div>

            {/* Center Area: Centered Giant Typography Hook */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', zIndex: 10, maxWidth: '900px' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, textShadow: '0 4px 16px rgba(0,0,0,0.7)', display: 'flex' }}>
                {headline}
              </div>
              <div style={{ fontSize: '15px', color: theme.textAccent, display: 'flex', gap: '20px' }}>
                <span>{b1}</span>
                <span>•</span>
                <span>{b2}</span>
                <span>•</span>
                <span>{b3}</span>
              </div>
            </div>

            {/* Bottom Row: UI Metric Cards + CTA */}
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', zIndex: 10, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.accent}`, borderRadius: '12px', padding: '10px 18px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex' }}>{metricTitle}</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: theme.statusColor, display: 'flex' }}>{metricValue}</span>
                </div>
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.accent}`, borderRadius: '12px', padding: '10px 18px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex' }}>TRẠNG THÁI VẬN HÀNH</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#A7F3D0', marginTop: '4px', display: 'flex' }}>🌿 100% OPERATIONAL</span>
                </div>
              </div>

              <div style={{ backgroundColor: theme.accent, padding: '14px 28px', borderRadius: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: theme.bg }}>{cta} →</span>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ── LAYOUT VARIANT 2: SPLIT LEFT (Tablet Mockup Left, Content Right) ─────
    if (layoutStyle === 'split_left') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.bg,
              backgroundImage: `radial-gradient(circle at 20% 50%, ${theme.radial} 0%, ${theme.bg} 85%)`,
              padding: '45px 55px',
              fontFamily: 'sans-serif',
              position: 'relative',
            }}
          >
            {/* Background Photo */}
            <img src={bgPhotoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />

            {/* Left Side: 3D Tablet Mockup Frame */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '40%', height: '470px', backgroundColor: theme.cardBg, border: `3px solid ${theme.accent}`, borderRadius: '24px', padding: '16px', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #334155', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'flex' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'flex' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginLeft: 'auto' }}>{brandName} Dashboard</span>
              </div>
              <div style={{ backgroundColor: '#0F172A', borderRadius: '10px', padding: '10px', marginBottom: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex' }}>{metricTitle}</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: theme.statusColor, marginTop: '2px', display: 'flex' }}>{metricValue}</span>
              </div>
              <div style={{ backgroundColor: '#0F172A', borderRadius: '10px', padding: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex' }}>{widgetTitle}</span>
                <div style={{ backgroundColor: '#065F46', padding: '4px 8px', borderRadius: '4px', fontSize: '9px', color: '#A7F3D0', fontWeight: 700, display: 'flex' }}>{feed1}</div>
                <div style={{ backgroundColor: '#1E3A8A', padding: '4px 8px', borderRadius: '4px', fontSize: '9px', color: '#BFDBFE', fontWeight: 700, display: 'flex' }}>{feed2}</div>
              </div>
            </div>

            {/* Right Side: Content & Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '56%', gap: '16px', zIndex: 10 }}>
              <div style={{ backgroundColor: theme.accent, padding: '6px 18px', borderRadius: '20px', width: 'fit-content', display: 'flex' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg }}>🏆 {brandName.toUpperCase()} PLATFORM</span>
              </div>
              <div style={{ backgroundColor: theme.badgeBg, border: `1.5px solid ${theme.badgeBorder}`, padding: '6px 14px', borderRadius: '8px', width: 'fit-content', display: 'flex' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.badgeText }}>{badge}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, display: 'flex' }}>{headline}</div>
              <div style={{ fontSize: '14px', color: theme.textAccent, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex' }}>{b1}</div>
                <div style={{ display: 'flex' }}>{b2}</div>
                <div style={{ display: 'flex' }}>{b3}</div>
              </div>
              <div style={{ backgroundColor: theme.accent, padding: '14px 28px', borderRadius: '28px', width: 'fit-content', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', display: 'flex' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: theme.bg }}>{cta} →</span>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ── LAYOUT VARIANT 3: DEFAULT SPLIT RIGHT (Content Left 58%, Mockup Right 38%)
    if (layoutStyle === 'split_right') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.bg,
              backgroundImage: `radial-gradient(circle at 85% 20%, ${theme.radial} 0%, ${theme.bg} 75%)`,
              padding: '45px 55px',
              fontFamily: 'sans-serif',
              position: 'relative',
            }}
          >
            {/* Background Photo with Opacity Mask */}
            <img src={bgPhotoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />

            {/* Left Column: Brand Logo, Offer Badge, Dynamic Headline, Bullet Points, CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '58%', gap: '16px', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme.accent, padding: '6px 18px', borderRadius: '20px', width: 'fit-content' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg, letterSpacing: '1px' }}>
                  🏆 {brandName.toUpperCase()} PLATFORM
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme.badgeBg, border: `1.5px solid ${theme.badgeBorder}`, padding: '6px 14px', borderRadius: '8px', width: 'fit-content' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.badgeText }}>{badge}</span>
              </div>

              <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, marginTop: '4px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', display: 'flex' }}>
                {headline}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px', color: theme.textAccent, marginTop: '4px' }}>
                <div style={{ display: 'flex' }}>{b1}</div>
                <div style={{ display: 'flex' }}>{b2}</div>
                <div style={{ display: 'flex' }}>{b3}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, padding: '14px 28px', borderRadius: '28px', width: 'fit-content', marginTop: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: theme.bg }}>{cta} →</span>
              </div>
            </div>

            {/* Right Column: 3D UI Mockup Frame */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '38%', height: '480px', backgroundColor: theme.cardBg, border: `3px solid ${theme.accent}`, borderRadius: '24px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid #334155', marginBottom: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'flex' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'flex' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginLeft: 'auto' }}>
                  {uiTitle}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A', borderRadius: '12px', padding: '12px', marginBottom: '10px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex' }}>{metricTitle}</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: theme.statusColor, marginTop: '4px', display: 'flex' }}>{metricValue}</span>
                <span style={{ fontSize: '9px', color: '#64748B', marginTop: '2px', display: 'flex' }}>{metricSub}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A', borderRadius: '12px', padding: '12px', marginBottom: '10px', border: '1px solid #334155', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8', display: 'flex' }}>{widgetTitle}</span>
                <div style={{ backgroundColor: '#065F46', borderRadius: '6px', padding: '5px 8px', fontSize: '9px', fontWeight: 700, color: '#A7F3D0', display: 'flex' }}>{feed1}</div>
                <div style={{ backgroundColor: '#1E3A8A', borderRadius: '6px', padding: '5px 8px', fontSize: '9px', fontWeight: 700, color: '#BFDBFE', display: 'flex' }}>{feed2}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, borderRadius: '8px', padding: '8px', marginTop: 'auto' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: theme.bg }}>{statusText}</span>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ── LAYOUT VARIANT 4: SPOTLIGHT EDITORIAL (Luxury Asymmetrical Bento Grid)
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            backgroundColor: theme.bg,
            backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.radial} 0%, ${theme.bg} 90%)`,
            padding: '30px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Photo with absolute stretch */}
          <img src={bgPhotoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />

          {/* Thin luxury gold inner border */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: `1px solid ${theme.accent}`, opacity: 0.4, zIndex: 5, borderRadius: '16px' }} />

          {/* Left Column: Asymmetrical Bento Highlight Card */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '38%', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRight: `2px solid ${theme.accent}`, padding: '40px 30px', zIndex: 10, justifyContent: 'center', alignItems: 'center', borderRadius: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: theme.accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px' }}>
              ✦ {brandName} Spotlight ✦
            </span>
            {/* Giant Circular Progress/Metric */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '180px', height: '180px', borderRadius: '50%', border: `4px solid ${theme.accent}`, backgroundImage: `radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 80%)`, boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', display: 'flex' }}>{metricValue.split(' ')[0]}</span>
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, marginTop: '4px', textAlign: 'center', textTransform: 'uppercase', display: 'flex' }}>{metricTitle.split(' ').slice(-2).join(' ')}</span>
            </div>
            <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#A7F3D0', display: 'flex' }}>🌿 VẬN HÀNH THÔNG MINH</span>
              <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'flex' }}>{metricSub}</span>
            </div>
          </div>

          {/* Right Column: Editorial Typography Content */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '58%', padding: '30px 20px', zIndex: 10, justifyContent: 'space-between' }}>
            {/* Top row */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme.accent, padding: '4px 14px', borderRadius: '20px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: theme.bg }}>{brandName.toUpperCase()} PLATFORM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.badgeBorder}`, padding: '4px 12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: theme.textAccent }}>{badge}</span>
              </div>
            </div>

            {/* Headline and dynamic bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, display: 'flex' }}>
                {headline}
              </div>
              {/* Bullet Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: theme.textAccent, borderLeft: `3px solid ${theme.accent}`, paddingLeft: '15px', marginTop: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ color: theme.accent, marginRight: '8px' }}>✦</span> {b1}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ color: theme.accent, marginRight: '8px' }}>✦</span> {b2}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ color: theme.accent, marginRight: '8px' }}>✦</span> {b3}</div>
              </div>
            </div>

            {/* CTA Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, padding: '12px 24px', borderRadius: '6px', width: 'fit-content', marginTop: '20px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg, textTransform: 'uppercase', letterSpacing: '1px' }}>{cta} →</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err: any) {
    return new Response(`Banner Generation Error: ${err.message}`, { status: 500 });
  }
}
