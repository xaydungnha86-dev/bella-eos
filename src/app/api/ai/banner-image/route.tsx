import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/banner-image
 *
 * DYNAMIC REAL-TIME PNG BANNER GENERATOR ENGINE (BELLA EOS CREATIVE WORKER)
 * Renders an authentic 1200x630 4K PNG Commercial Sales Banner featuring:
 *  - Enterprise Brand Logo (BELLA EOS PLATFORM)
 *  - Dynamic Headline Text (Ingested from AI Copywriter in Task #1)
 *  - Dynamic Offer Badge & Call-To-Action Button
 *  - 3D Spa Management Software UI Mockup (Calendar, Revenue +20%, KTV Schedule)
 *  - Deep Emerald Teal & Royal Gold Spa Luxury Color Scheme
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawHeadline = searchParams.get('headline') || 'BELLA EOS GIẢI QUYẾT TRIỆT ĐỂ BÀI TOÁN SPA';
    const rawBadge = searchParams.get('badge') || '🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA';
    const rawCta = searchParams.get('cta') || 'ĐĂNG KÝ TRẢI NGHIỆM NGAY';

    // Clean text parameters for visual design
    const headline = rawHeadline.substring(0, 52);
    const badge = rawBadge.substring(0, 48);
    const cta = rawCta.substring(0, 32);

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
            backgroundColor: '#061E17',
            backgroundImage: 'radial-gradient(circle at 85% 20%, #144D3E 0%, #061E17 75%)',
            padding: '45px 55px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Subtle Spa Luxury Gold Accent Circle */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              backgroundColor: '#D4AF37',
              opacity: 0.08,
            }}
          />

          {/* Left Column: Brand Logo, Offer Badge, Dynamic Headline, Bullet Points, CTA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '58%',
              gap: '16px',
              zIndex: 10,
            }}
          >
            {/* 1. Enterprise Brand Logo Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'linear-gradient(90deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%)',
                background: '#D4AF37',
                padding: '6px 18px',
                borderRadius: '20px',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#061E17',
                  letterSpacing: '1px',
                }}
              >
                🏆 BELLA EOS SPA PLATFORM
              </span>
            </div>

            {/* 2. Dynamic Offer Badge (From Copywriter Output) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#E6F4EA',
                border: '1.5px solid #34A853',
                padding: '6px 14px',
                borderRadius: '8px',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#137333',
                }}
              >
                {badge}
              </span>
            </div>

            {/* 3. Dynamic Headline Text (Extracted from Task #1 Copywriter) */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.25,
                marginTop: '4px',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {headline}
            </div>

            {/* 4. Value Propositions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '15px',
                color: '#D1E7DD',
                marginTop: '4px',
              }}
            >
              <div>✨ Tối ưu 90% thời gian xếp lịch &amp; phân ca KTV Spa</div>
              <div>📈 Báo cáo doanh thu thời gian thực chuẩn AI-Native</div>
              <div>🎯 Giữ chân 95% khách hàng VIP với kịch bản cá nhân hóa</div>
            </div>

            {/* 5. Dynamic Call-To-Action Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#D4AF37',
                padding: '14px 28px',
                borderRadius: '28px',
                width: 'fit-content',
                marginTop: '10px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#061E17',
                }}
              >
                {cta} →
              </span>
            </div>
          </div>

          {/* Right Column: 3D Spa Management Software UI Mockup Frame */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '38%',
              height: '480px',
              backgroundColor: '#1E293B',
              border: '3px solid #D4AF37',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Window Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '12px',
                borderBottom: '1px solid #334155',
                marginBottom: '12px',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginLeft: 'auto' }}>
                Bella EOS Spa UI
              </span>
            </div>

            {/* Metric Card 1: Revenue */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '10px',
                border: '1px solid #334155',
              }}
            >
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>DOANH THU SPA THÁNG NÀY</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
                +20.4% 📈
              </span>
              <span style={{ fontSize: '9px', color: '#64748B', marginTop: '2px' }}>AI COO Tự Động Tối Ưu</span>
            </div>

            {/* Metric Card 2: KTV Schedule */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '10px',
                border: '1px solid #334155',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>LỊCH KTV SPA REALTIME</span>
              <div
                style={{
                  backgroundColor: '#065F46',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#A7F3D0',
                }}
              >
                🌿 Phòng VIP #01 (Chờ KTV)
              </div>
              <div
                style={{
                  backgroundColor: '#1E3A8A',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#BFDBFE',
                }}
              >
                🌿 Thảo Dược #03 (Đang Trị Liệu)
              </div>
            </div>

            {/* Status Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#D4AF37',
                borderRadius: '8px',
                padding: '8px',
                marginTop: 'auto',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#061E17' }}>
                STATUS: SPA OPERATIONAL 100%
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    return new Response(`Banner Generation Error: ${err.message}`, { status: 500 });
  }
}
