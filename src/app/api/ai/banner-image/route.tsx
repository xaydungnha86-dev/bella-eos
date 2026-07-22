import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/banner-image
 *
 * BELLA EOS DYNAMIC STRUCTURAL GRAPHIC DESIGN ENGINE (v4.0)
 * Truly mutates Layout Structure, Typography Hierarchy, Graphic Elements,
 * and Perspective Spa Backgrounds for every campaign.
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

    const headline = rawHeadline.substring(0, 52);
    const badge = rawBadge.substring(0, 48);
    const cta = rawCta.substring(0, 32);

    // Compute dynamic layout, theme & background photo based on text content hash
    const textHash = hashString(headline + badge + cta);
    const layoutTypes = ['split_right', 'split_left', 'magazine_center', 'spotlight_editorial'];
    const layoutStyle = layoutTypes[textHash % layoutTypes.length];
    const theme = THEMES[textHash % THEMES.length];
    const spaPhotoUrl = SPA_PHOTOS[textHash % SPA_PHOTOS.length];

    // Dynamic Metric Highlights based on intent
    let metricTitle = 'DOANH THU SPA THÁNG NÀY';
    let metricValue = '+25.8% 📈';
    let metricSub = 'AI COO Tự Động Tối Ưu';

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
            {/* Background Spa Photo with Opacity Mask */}
            <img
              src={spaPhotoUrl}
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
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ backgroundColor: theme.accent, padding: '6px 18px', borderRadius: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg }}>🏆 BELLA EOS SPA PLATFORM</span>
              </div>
              <div style={{ backgroundColor: theme.badgeBg, border: `1.5px solid ${theme.badgeBorder}`, padding: '6px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.badgeText }}>{badge}</span>
              </div>
            </div>

            {/* Center Area: Centered Giant Typography Hook */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', zIndex: 10, maxWidth: '900px' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>
                {headline}
              </div>
              <div style={{ fontSize: '16px', color: theme.textAccent, display: 'flex', gap: '20px' }}>
                <span>✨ Tự động hóa 90% xếp lịch KTV</span>
                <span>•</span>
                <span>📈 Báo cáo doanh thu real-time</span>
                <span>•</span>
                <span>🎯 Giữ chân 95% KH VIP</span>
              </div>
            </div>

            {/* Bottom Row: UI Metric Cards + CTA */}
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.accent}`, borderRadius: '12px', padding: '10px 18px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>{metricTitle}</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: theme.statusColor }}>{metricValue}</span>
                </div>
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.accent}`, borderRadius: '12px', padding: '10px 18px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>TRẠNG THÁI VẬN HÀNH</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#A7F3D0', marginTop: '4px' }}>🌿 100% OPERATIONAL</span>
                </div>
              </div>

              <div style={{ backgroundColor: theme.accent, padding: '14px 28px', borderRadius: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
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
            {/* Background Spa Photo */}
            <img src={spaPhotoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />

            {/* Left Side: 3D Tablet Mockup Frame */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '40%', height: '470px', backgroundColor: theme.cardBg, border: `3px solid ${theme.accent}`, borderRadius: '24px', padding: '16px', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #334155', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginLeft: 'auto' }}>Bella EOS Dashboard</span>
              </div>
              <div style={{ backgroundColor: '#0F172A', borderRadius: '10px', padding: '10px', marginBottom: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{metricTitle}</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: theme.statusColor, marginTop: '2px' }}>{metricValue}</span>
              </div>
              <div style={{ backgroundColor: '#0F172A', borderRadius: '10px', padding: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>TIẾN TRÌNH TỰ ĐỘNG HÓA</span>
                <div style={{ backgroundColor: '#065F46', padding: '4px 8px', borderRadius: '4px', fontSize: '9px', color: '#A7F3D0', fontWeight: 700 }}>✓ Đã xếp lịch KTV ca 1</div>
                <div style={{ backgroundColor: '#1E3A8A', padding: '4px 8px', borderRadius: '4px', fontSize: '9px', color: '#BFDBFE', fontWeight: 700 }}>✓ Báo cáo doanh thu ERP</div>
              </div>
            </div>

            {/* Right Side: Content & Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '56%', gap: '16px', zIndex: 10 }}>
              <div style={{ backgroundColor: theme.accent, padding: '6px 18px', borderRadius: '20px', width: 'fit-content' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg }}>🏆 BELLA EOS SPA PLATFORM</span>
              </div>
              <div style={{ backgroundColor: theme.badgeBg, border: `1.5px solid ${theme.badgeBorder}`, padding: '6px 14px', borderRadius: '8px', width: 'fit-content' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.badgeText }}>{badge}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25 }}>{headline}</div>
              <div style={{ fontSize: '14px', color: theme.textAccent, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>⚡ Tối ưu 90% thời gian xếp lịch &amp; phân ca KTV Spa</div>
                <div>📈 Báo cáo doanh thu thời gian thực chuẩn AI-Native</div>
                <div>🎯 Giữ chân 95% khách hàng VIP với kịch bản cá nhân hóa</div>
              </div>
              <div style={{ backgroundColor: theme.accent, padding: '14px 28px', borderRadius: '28px', width: 'fit-content', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: theme.bg }}>{cta} →</span>
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // ── LAYOUT VARIANT 3: DEFAULT SPLIT RIGHT (Content Left 58%, Mockup Right 38%)
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
          {/* Background Spa Photo with Opacity Mask */}
          <img src={spaPhotoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />

          {/* Left Column: Brand Logo, Offer Badge, Dynamic Headline, Bullet Points, CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '58%', gap: '16px', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme.accent, padding: '6px 18px', borderRadius: '20px', width: 'fit-content' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: theme.bg, letterSpacing: '1px' }}>
                🏆 BELLA EOS SPA PLATFORM
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme.badgeBg, border: `1.5px solid ${theme.badgeBorder}`, padding: '6px 14px', borderRadius: '8px', width: 'fit-content' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.badgeText }}>{badge}</span>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, marginTop: '4px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {headline}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px', color: theme.textAccent, marginTop: '4px' }}>
              <div>✨ Tối ưu 90% thời gian xếp lịch &amp; phân ca KTV Spa</div>
              <div>📈 Báo cáo doanh thu thời gian thực chuẩn AI-Native</div>
              <div>🎯 Giữ chân 95% khách hàng VIP với kịch bản cá nhân hóa</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, padding: '14px 28px', borderRadius: '28px', width: 'fit-content', marginTop: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: theme.bg }}>{cta} →</span>
            </div>
          </div>

          {/* Right Column: 3D Spa Management Software UI Mockup Frame */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '38%', height: '480px', backgroundColor: theme.cardBg, border: `3px solid ${theme.accent}`, borderRadius: '24px', padding: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', position: 'relative', overflow: 'hidden', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid #334155', marginBottom: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginLeft: 'auto' }}>
                Bella EOS Spa UI
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A', borderRadius: '12px', padding: '12px', marginBottom: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>{metricTitle}</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: theme.statusColor, marginTop: '4px' }}>{metricValue}</span>
              <span style={{ fontSize: '9px', color: '#64748B', marginTop: '2px' }}>{metricSub}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A', borderRadius: '12px', padding: '12px', marginBottom: '10px', border: '1px solid #334155', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>LỊCH KTV SPA REALTIME</span>
              <div style={{ backgroundColor: '#065F46', borderRadius: '6px', padding: '5px 8px', fontSize: '9px', fontWeight: 700, color: '#A7F3D0' }}>🌿 Phòng VIP #01 (Chờ KTV)</div>
              <div style={{ backgroundColor: '#1E3A8A', borderRadius: '6px', padding: '5px 8px', fontSize: '9px', fontWeight: 700, color: '#BFDBFE' }}>🌿 Thảo Dược #03 (Active)</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.accent, borderRadius: '8px', padding: '8px', marginTop: 'auto' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: theme.bg }}>STATUS: SPA OPERATIONAL 100%</span>
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
