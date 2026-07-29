'use client';

/**
 * Content Studio — /executive/content-studio
 * 3-column layout: Input → Preview → Edit/Publish
 *
 * Flow: raw request → BriefAnalyzer → Caption + Image → Preview → Approve → Publish FB
 */

import { useState, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Brief {
  campaignType: string;
  targetAudience: string;
  audienceRole: string;
  tone: string;
  usp: string;
  painPoint: string;
  emotionalHook: string;
  ctaText: string;
  imageStyle: string;
  brandName: string;
  primaryHashtags: string[];
  confidence: number;
}

interface PipelineResult {
  brief: Brief;
  caption: string;
  captionModel: string;
  imagePrompt: string;
  imageUrl: string | null;
  imageError?: string;
  timings: {
    briefinMs: number;
    captionMs: number;
    imageMs: number;
    totalMs: number;
  };
}

type Format = '1:1' | '4:5' | '16:9' | '9:16';
type Stage = 'idle' | 'analyzing' | 'writing' | 'imaging' | 'done' | 'error';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bella_gemini_key') || '';
}
function getOpenAIKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bella_openai_key') || '';
}

const FORMAT_LABELS: Record<Format, string> = {
  '1:1':  '📱 1:1  — Feed vuông',
  '4:5':  '📷 4:5  — Portrait FB',
  '16:9': '🖥️ 16:9 — Banner ngang',
  '9:16': '📲 9:16 — Story dọc',
};

const CAMPAIGN_LABELS: Record<string, string> = {
  software_b2b:    '💻 Phần mềm B2B',
  sales_product:   '🛒 Bán hàng sản phẩm',
  brand_awareness: '🌟 Nhận diện thương hiệu',
  event_promotion: '🎯 Sự kiện / Event',
  recruitment:     '👥 Tuyển dụng',
  real_estate:     '🏠 Bất động sản',
  fashion_lifestyle: '👗 Thời trang',
  food_beverage:   '🍜 F&B Nhà hàng',
  generic:         '📢 Chung',
};

const STAGE_MESSAGES: Record<Stage, string> = {
  idle:      '',
  analyzing: '🔍 Đang phân tích yêu cầu...',
  writing:   '✍️ Đang viết caption...',
  imaging:   '🎨 Đang tạo ảnh...',
  done:      '✅ Hoàn thành!',
  error:     '❌ Có lỗi xảy ra',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContentStudioPage() {
  const [request, setRequest]     = useState('');
  const [format, setFormat]       = useState<Format>('1:1');
  const [skipImage, setSkipImage] = useState(false);
  const [stage, setStage]         = useState<Stage>('idle');
  const [result, setResult]       = useState<PipelineResult | null>(null);
  const [error, setError]         = useState('');
  const [caption, setCaption]     = useState('');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle');
  const [publishMsg, setPublishMsg]       = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Generate ──────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!request.trim()) return;
    setStage('analyzing');
    setError('');
    setResult(null);
    setCaption('');
    setPublishStatus('idle');
    setPublishMsg('');

    try {
      setStage('writing');
      const res = await fetch('/api/ai/content-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request:            request.trim(),
          format,
          skipImage,
          client_gemini_key:  getGeminiKey(),
          client_openai_key:  getOpenAIKey(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Network error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: PipelineResult = await res.json();
      setResult(data);
      setCaption(data.caption);
      setStage('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
      setStage('error');
    }
  }

  // ── Publish ────────────────────────────────────────────────────────────────

  async function handlePublish() {
    if (!caption.trim()) return;
    setPublishStatus('publishing');
    setPublishMsg('');

    try {
      const res = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:    caption,
          image_url:  result?.imageUrl || undefined,
          workspace_id: 'default',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishStatus('done');
        setPublishMsg(`✅ Đã đăng thành công! Post ID: ${data.postId}`);
      } else {
        setPublishStatus('error');
        setPublishMsg(`❌ ${data.error || 'Đăng thất bại'}`);
      }
    } catch (e) {
      setPublishStatus('error');
      setPublishMsg(`❌ ${e instanceof Error ? e.message : 'Lỗi mạng'}`);
    }
  }

  const isLoading  = stage === 'analyzing' || stage === 'writing' || stage === 'imaging';
  const confidencePct = result ? Math.round(result.brief.confidence * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.title}>✦ Content Studio</h1>
            <p style={styles.subtitle}>Phân tích yêu cầu → Viết caption → Tạo ảnh → Đăng FB</p>
          </div>
          {result && (
            <div style={styles.timingBadge}>
              ⚡ {result.timings.totalMs}ms · {result.captionModel}
            </div>
          )}
        </div>
      </div>

      {/* ── 3-Column Layout ───────────────────────────────────────────── */}
      <div style={styles.columns}>

        {/* ── COL 1: Input Panel ────────────────────────────────────── */}
        <div style={styles.colInput}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📝 Yêu cầu</h2>

            <label style={styles.label}>Mô tả chiến dịch</label>
            <textarea
              id="studio-request"
              style={styles.textarea}
              placeholder="Ví dụ: Quảng cáo phần mềm quản lý spa Bella EOS, target chủ spa cao cấp tại HN &amp; HCM, muốn tăng demo booking..."
              value={request}
              onChange={e => setRequest(e.target.value)}
              rows={5}
            />

            <label style={styles.label}>Định dạng ảnh</label>
            <div style={styles.formatGrid}>
              {(Object.keys(FORMAT_LABELS) as Format[]).map(f => (
                <button
                  key={f}
                  id={`format-${f.replace(':', '-')}`}
                  style={{ ...styles.formatBtn, ...(format === f ? styles.formatBtnActive : {}) }}
                  onClick={() => setFormat(f)}
                >
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>

            <label style={styles.checkLabel}>
              <input
                id="skip-image-toggle"
                type="checkbox"
                checked={skipImage}
                onChange={e => setSkipImage(e.target.checked)}
                style={styles.checkbox}
              />
              Chỉ viết caption (bỏ qua tạo ảnh)
            </label>

            <button
              id="btn-generate"
              style={{ ...styles.btnPrimary, ...(isLoading ? styles.btnDisabled : {}) }}
              onClick={handleGenerate}
              disabled={isLoading || !request.trim()}
            >
              {isLoading ? (
                <span style={styles.spinner}>⟳ {STAGE_MESSAGES[stage]}</span>
              ) : (
                '🚀 Tạo Content'
              )}
            </button>

            {stage === 'error' && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}
          </div>

          {/* Brief Card */}
          {result && (
            <div style={{ ...styles.card, ...styles.briefCard }}>
              <div style={styles.briefHeader}>
                <h2 style={styles.cardTitle}>🔍 Brief Analysis</h2>
                <span style={{
                  ...styles.confidenceBadge,
                  background: confidencePct >= 80 ? 'rgba(52,199,89,0.15)' : 'rgba(255,159,10,0.15)',
                  color: confidencePct >= 80 ? '#34c759' : '#ff9f0a',
                }}>
                  {confidencePct}% confidence
                </span>
              </div>

              <div style={styles.briefGrid}>
                <BriefRow icon="🎯" label="Loại chiến dịch" value={CAMPAIGN_LABELS[result.brief.campaignType] || result.brief.campaignType} />
                <BriefRow icon="👥" label="Đối tượng" value={result.brief.audienceRole} />
                <BriefRow icon="🎨" label="Style ảnh" value={result.brief.imageStyle.replace(/_/g, ' ')} />
                <BriefRow icon="💬" label="Tone" value={result.brief.tone} />
                <BriefRow icon="💡" label="Hook" value={result.brief.emotionalHook} />
                <BriefRow icon="🏷️" label="USP" value={result.brief.usp} />
              </div>

              <div style={styles.hashtagRow}>
                {result.brief.primaryHashtags.slice(0, 6).map(tag => (
                  <span key={tag} style={styles.hashtag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── COL 2: Preview Card ───────────────────────────────────── */}
        <div style={styles.colPreview}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👁️ Preview</h2>
            <p style={styles.cardSub}>Giả lập bài đăng Facebook</p>

            {/* FB Post Mock */}
            <div style={styles.fbPost}>
              {/* FB Header */}
              <div style={styles.fbHeader}>
                <div style={styles.fbAvatar}>BE</div>
                <div>
                  <div style={styles.fbName}>{result?.brief.brandName || 'Bella EOS'}</div>
                  <div style={styles.fbMeta}>Vừa xong · 🌐</div>
                </div>
              </div>

              {/* Image area */}
              <div style={{
                ...styles.fbImageArea,
                aspectRatio: format === '16:9' ? '16/9' : format === '9:16' ? '9/16' : format === '4:5' ? '4/5' : '1/1',
              }}>
                {isLoading && !skipImage ? (
                  <div style={styles.imageSkeleton}>
                    <div style={styles.skeletonPulse} />
                    <span style={styles.skeletonLabel}>🎨 Đang tạo ảnh...</span>
                  </div>
                ) : result?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.imageUrl}
                    alt="Generated FB banner"
                    style={styles.fbImage}
                  />
                ) : result?.imageError ? (
                  <div style={styles.imageError}>
                    <span style={{ fontSize: 32 }}>🖼️</span>
                    <span style={{ fontSize: 13, color: '#8e8e93', marginTop: 8 }}>
                      {skipImage ? 'Bỏ qua tạo ảnh' : result.imageError}
                    </span>
                  </div>
                ) : (
                  <div style={styles.imagePlaceholder}>
                    <span style={{ fontSize: 48 }}>🖼️</span>
                    <span style={{ color: '#636366', fontSize: 13, marginTop: 8 }}>
                      Ảnh sẽ hiển thị ở đây
                    </span>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div style={styles.fbCaption}>
                {isLoading ? (
                  <div style={styles.captionSkeleton}>
                    {[100, 80, 90, 60, 70].map((w, i) => (
                      <div key={i} style={{ ...styles.skeletonLine, width: `${w}%` }} />
                    ))}
                  </div>
                ) : caption ? (
                  <pre style={styles.captionText}>{caption}</pre>
                ) : (
                  <div style={{ color: '#636366', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                    Caption sẽ xuất hiện ở đây...
                  </div>
                )}
              </div>

              {/* FB Reactions Mock */}
              {result && (
                <div style={styles.fbReactions}>
                  <span style={styles.fbReact}>👍 Thích</span>
                  <span style={styles.fbReact}>💬 Bình luận</span>
                  <span style={styles.fbReact}>↗️ Chia sẻ</span>
                </div>
              )}
            </div>

            {/* Image Prompt */}
            {result?.imagePrompt && (
              <details style={styles.promptDetails}>
                <summary style={styles.promptSummary}>🔬 Xem Image Prompt</summary>
                <p style={styles.promptText}>{result.imagePrompt}</p>
              </details>
            )}
          </div>
        </div>

        {/* ── COL 3: Edit & Publish ─────────────────────────────────── */}
        <div style={styles.colEdit}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>✏️ Chỉnh sửa Caption</h2>
            <p style={styles.cardSub}>Chỉnh sửa trước khi đăng</p>

            <textarea
              ref={textareaRef}
              id="studio-caption-editor"
              style={{ ...styles.textarea, minHeight: 320, fontFamily: 'inherit' }}
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Caption sẽ được điền tự động sau khi tạo content..."
            />

            <div style={styles.charCount}>
              {caption.length} ký tự · {caption.split(/\s+/).filter(Boolean).length} từ
            </div>

            {/* Publish Button */}
            <button
              id="btn-publish"
              style={{
                ...styles.btnPublish,
                ...(publishStatus === 'publishing' ? styles.btnDisabled : {}),
                ...(publishStatus === 'done' ? styles.btnSuccess : {}),
              }}
              onClick={handlePublish}
              disabled={!caption.trim() || publishStatus === 'publishing' || publishStatus === 'done'}
            >
              {publishStatus === 'publishing' ? '⟳ Đang đăng...' :
               publishStatus === 'done'       ? '✅ Đã đăng FB!' :
               '📤 Đăng lên Facebook'}
            </button>

            {publishMsg && (
              <div style={{
                ...styles.publishMsg,
                background: publishStatus === 'done' ? 'rgba(52,199,89,0.1)' : 'rgba(255,69,58,0.1)',
                borderColor: publishStatus === 'done' ? '#34c759' : '#ff453a',
                color: publishStatus === 'done' ? '#34c759' : '#ff453a',
              }}>
                {publishMsg}
              </div>
            )}

            {/* Regenerate buttons */}
            {result && (
              <div style={styles.regenRow}>
                <button
                  id="btn-regen-caption"
                  style={styles.btnRegen}
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  🔄 Caption mới
                </button>
                {!skipImage && (
                  <button
                    id="btn-regen-image"
                    style={styles.btnRegen}
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    🖼️ Ảnh mới
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Timings & Debug */}
          {result && (
            <div style={{ ...styles.card, ...styles.timingCard }}>
              <h3 style={{ ...styles.cardTitle, fontSize: 14, marginBottom: 12 }}>⚡ Timings</h3>
              <div style={styles.timingGrid}>
                <TimingRow label="Brief Analysis" ms={result.timings.briefinMs} />
                <TimingRow label="Caption Gen" ms={result.timings.captionMs} />
                <TimingRow label="Image Gen" ms={result.timings.imageMs} />
                <TimingRow label="Total" ms={result.timings.totalMs} bold />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BriefRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={styles.briefRow}>
      <span style={styles.briefIcon}>{icon}</span>
      <div>
        <div style={styles.briefLabel}>{label}</div>
        <div style={styles.briefValue}>{value}</div>
      </div>
    </div>
  );
}

function TimingRow({ label, ms, bold }: { label: string; ms: number; bold?: boolean }) {
  return (
    <div style={{ ...styles.timingRow, fontWeight: bold ? 600 : 400 }}>
      <span style={{ color: '#8e8e93' }}>{label}</span>
      <span style={{ color: bold ? '#fff' : '#aeaeb2' }}>{ms}ms</span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight:    '100vh',
    background:   'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0f1a 100%)',
    color:        '#fff',
    fontFamily:   "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    padding:      '0 0 60px',
  },
  header: {
    background:   'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    padding:      '20px 32px',
    position:     'sticky',
    top:          0,
    zIndex:       100,
  },
  headerInner: {
    maxWidth:       1400,
    margin:         '0 auto',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize:     24,
    fontWeight:   700,
    margin:       0,
    background:   'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color:    '#636366',
    margin:   '4px 0 0',
  },
  timingBadge: {
    fontSize:     12,
    color:        '#a78bfa',
    background:   'rgba(167,139,250,0.1)',
    border:       '1px solid rgba(167,139,250,0.2)',
    borderRadius: 20,
    padding:      '4px 12px',
  },
  columns: {
    maxWidth:    1400,
    margin:      '0 auto',
    padding:     '24px 32px',
    display:     'grid',
    gridTemplateColumns: '340px 1fr 380px',
    gap:         24,
    alignItems:  'start',
  },
  colInput:   {},
  colPreview: {},
  colEdit:    {},
  card: {
    background:   'rgba(255,255,255,0.04)',
    border:       '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding:      24,
    backdropFilter: 'blur(20px)',
    marginBottom: 16,
  },
  briefCard: {
    background: 'rgba(167,139,250,0.05)',
    border:     '1px solid rgba(167,139,250,0.15)',
  },
  cardTitle: {
    fontSize:     16,
    fontWeight:   600,
    margin:       '0 0 4px',
    color:        '#fff',
  },
  cardSub: {
    fontSize: 13,
    color:    '#636366',
    margin:   '0 0 16px',
  },
  label: {
    fontSize:     13,
    color:        '#8e8e93',
    display:      'block',
    marginBottom: 6,
    marginTop:    16,
    fontWeight:   500,
  },
  textarea: {
    width:        '100%',
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color:        '#fff',
    fontSize:     14,
    padding:      '12px 14px',
    resize:       'vertical',
    outline:      'none',
    boxSizing:    'border-box',
    lineHeight:   1.6,
    transition:   'border-color 0.2s',
  },
  formatGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 8,
    marginBottom:        8,
  },
  formatBtn: {
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color:        '#8e8e93',
    fontSize:     12,
    padding:      '8px 10px',
    cursor:       'pointer',
    textAlign:    'left',
    transition:   'all 0.2s',
  },
  formatBtnActive: {
    background:  'rgba(167,139,250,0.15)',
    borderColor: 'rgba(167,139,250,0.5)',
    color:       '#a78bfa',
  },
  checkLabel: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    fontSize:   13,
    color:      '#8e8e93',
    cursor:     'pointer',
    marginTop:  12,
    marginBottom: 20,
  },
  checkbox: {
    accentColor: '#a78bfa',
    width:        16,
    height:       16,
  },
  btnPrimary: {
    width:        '100%',
    background:   'linear-gradient(135deg, #7c3aed, #4f46e5)',
    border:       'none',
    borderRadius: 12,
    color:        '#fff',
    fontSize:     15,
    fontWeight:   600,
    padding:      '14px 24px',
    cursor:       'pointer',
    transition:   'all 0.2s',
    letterSpacing: '0.3px',
  },
  btnDisabled: {
    opacity:  0.6,
    cursor:   'not-allowed',
  },
  btnPublish: {
    width:        '100%',
    background:   'linear-gradient(135deg, #1877f2, #0052cc)',
    border:       'none',
    borderRadius: 12,
    color:        '#fff',
    fontSize:     15,
    fontWeight:   600,
    padding:      '14px 24px',
    cursor:       'pointer',
    transition:   'all 0.2s',
    marginBottom: 12,
  },
  btnSuccess: {
    background: 'linear-gradient(135deg, #34c759, #27ae60)',
  },
  btnRegen: {
    flex:         1,
    background:   'rgba(255,255,255,0.05)',
    border:       '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color:        '#8e8e93',
    fontSize:     13,
    padding:      '10px 8px',
    cursor:       'pointer',
    transition:   'all 0.2s',
  },
  regenRow: {
    display: 'flex',
    gap:     8,
  },
  errorBox: {
    marginTop:    12,
    background:   'rgba(255,69,58,0.1)',
    border:       '1px solid rgba(255,69,58,0.3)',
    borderRadius: 8,
    padding:      '10px 14px',
    fontSize:     13,
    color:        '#ff453a',
  },
  publishMsg: {
    marginTop:    8,
    borderRadius: 8,
    padding:      '10px 14px',
    fontSize:     13,
    border:       '1px solid',
    marginBottom: 16,
  },
  charCount: {
    fontSize:    12,
    color:       '#636366',
    textAlign:   'right',
    marginTop:   4,
    marginBottom: 16,
  },
  spinner: {
    display:    'inline-flex',
    alignItems: 'center',
    gap:        8,
    animation:  'spin 1s linear infinite',
  },
  // Brief panel
  briefHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   16,
  },
  confidenceBadge: {
    fontSize:     11,
    padding:      '3px 10px',
    borderRadius: 20,
    fontWeight:   600,
    border:       '1px solid transparent',
  },
  briefGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap:     10,
  },
  briefRow: {
    display:    'flex',
    gap:        10,
    alignItems: 'flex-start',
  },
  briefIcon: {
    fontSize:  16,
    minWidth:  20,
    marginTop: 1,
  },
  briefLabel: {
    fontSize: 11,
    color:    '#636366',
    marginBottom: 2,
  },
  briefValue: {
    fontSize: 13,
    color:    '#e5e5ea',
    lineHeight: 1.4,
  },
  hashtagRow: {
    display:    'flex',
    flexWrap:   'wrap',
    gap:        6,
    marginTop:  14,
  },
  hashtag: {
    fontSize:     11,
    background:   'rgba(167,139,250,0.1)',
    color:        '#a78bfa',
    borderRadius: 4,
    padding:      '2px 8px',
  },
  // FB Post mockup
  fbPost: {
    background:   '#1c1c1e',
    borderRadius: 12,
    overflow:     'hidden',
    border:       '1px solid rgba(255,255,255,0.08)',
  },
  fbHeader: {
    display:    'flex',
    gap:        10,
    padding:    '12px 14px',
    alignItems: 'center',
  },
  fbAvatar: {
    width:        36,
    height:       36,
    borderRadius: '50%',
    background:   'linear-gradient(135deg, #7c3aed, #4f46e5)',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontSize:     13,
    fontWeight:   700,
    color:        '#fff',
  },
  fbName: {
    fontSize:   14,
    fontWeight: 600,
    color:      '#fff',
  },
  fbMeta: {
    fontSize: 12,
    color:    '#636366',
  },
  fbImageArea: {
    width:    '100%',
    background: 'rgba(0,0,0,0.3)',
    display:  'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  fbImage: {
    width:    '100%',
    height:   '100%',
    objectFit: 'cover',
  },
  imageSkeleton: {
    position:       'absolute',
    inset:          0,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            12,
  },
  skeletonPulse: {
    width:        '100%',
    height:       '100%',
    background:   'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%',
    animation:    'shimmer 1.5s infinite',
    position:     'absolute',
    inset:        0,
  },
  skeletonLabel: {
    position: 'relative',
    zIndex:   1,
    fontSize: 14,
    color:    '#636366',
  },
  imagePlaceholder: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    width:          '100%',
    padding:        40,
    color:          '#636366',
  },
  imageError: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    width:          '100%',
    padding:        24,
    textAlign:      'center',
  },
  fbCaption: {
    padding: '12px 14px',
  },
  captionText: {
    fontSize:    14,
    color:       '#e5e5ea',
    whiteSpace:  'pre-wrap',
    margin:      0,
    lineHeight:  1.6,
    fontFamily:  'inherit',
  },
  captionSkeleton: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
  },
  skeletonLine: {
    height:     14,
    borderRadius: 4,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)',
    backgroundSize: '200% 100%',
    animation:  'shimmer 1.5s infinite',
  },
  fbReactions: {
    display:        'flex',
    gap:            4,
    padding:        '8px 14px 12px',
    borderTop:      '1px solid rgba(255,255,255,0.06)',
  },
  fbReact: {
    flex:         1,
    textAlign:    'center',
    fontSize:     13,
    color:        '#636366',
    padding:      '4px 0',
    borderRadius: 6,
    cursor:       'pointer',
  },
  promptDetails: {
    marginTop: 12,
  },
  promptSummary: {
    fontSize: 12,
    color:    '#636366',
    cursor:   'pointer',
  },
  promptText: {
    fontSize:   12,
    color:      '#636366',
    marginTop:  8,
    lineHeight: 1.6,
  },
  // Timing card
  timingCard: {
    padding: '16px 20px',
  },
  timingGrid: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
  },
  timingRow: {
    display:        'flex',
    justifyContent: 'space-between',
    fontSize:       13,
  },
};
