/**
 * verify-creative-engine-v2.ts
 * Verification script for Creative Planning Engine v2.
 * Run: npx tsx scratch/verify-creative-engine-v2.ts
 */

import { CreativePlanningEngine } from '../src/core/creative/creative-planning-engine';

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, info?: string) {
  if (condition) {
    console.log(`  ${GREEN}✓${RESET} ${label}`);
    passed++;
  } else {
    console.log(`  ${RED}✗ FAIL${RESET} ${label}${info ? ` → ${info}` : ''}`);
    failed++;
  }
}

const SCENARIOS = [
  {
    label: 'Luxury Spa Management Software',
    request: {
      objective: 'Thiết kế banner cho phần mềm quản lý Spa cao cấp',
      brandDna: { brandName: 'BELLA EOS', brandColors: { primary: '#061E17', accent: '#D4AF37' }, visualStyle: 'Luxury Spa' },
    },
    expects: {
      styleId: 'luxury',
      minLuxury: 4,
      campaignType: 'sales',
    },
  },
  {
    label: 'Cyberpunk AI Platform Launch',
    request: {
      objective: 'Poster ra mắt Bella AI Platform — công nghệ AI doanh nghiệp thế hệ mới',
      brandDna: { brandName: 'BELLA EOS', brandColors: { primary: '#07061A', accent: '#7C3AED' }, visualStyle: 'Cyberpunk Hi-Tech' },
    },
    expects: {
      styleId: 'cyberpunk',
      minLuxury: 2,
      campaignType: 'product',
    },
  },
  {
    label: 'Corporate Recruitment Campaign',
    request: {
      objective: 'Banner tuyển dụng kỹ sư senior cho doanh nghiệp công nghệ',
      brandDna: { brandName: 'TECHCORP', visualStyle: 'Corporate Modern' },
    },
    expects: {
      styleId: 'corporate',
      minLuxury: 1,
      campaignType: 'recruitment',
    },
  },
  {
    label: 'Luxury Real Estate Project',
    request: {
      objective: 'Chiến dịch bất động sản căn hộ cao cấp — dự án Vinhomes Grand Park',
      brandDna: { brandName: 'VINHOMES', brandColors: { primary: '#1A2A6C', accent: '#B21F1F' }, visualStyle: 'Premium Luxury' },
    },
    expects: {
      styleId: 'luxury',
      minLuxury: 3,
      campaignType: 'product',
    },
  },
  {
    label: 'High Fashion Boutique Sale',
    request: {
      objective: 'Flash sale thời trang boutique — giảm 30% toàn bộ sản phẩm mùa hè',
      brandDna: { brandName: 'LUXE FASHION', visualStyle: 'Fashion Editorial' },
    },
    expects: {
      styleId: 'fashion',
      minLuxury: 2,
      campaignType: 'brand',
    },
  },
];

console.log(`\n${CYAN}═══════════════════════════════════════════════════════${RESET}`);
console.log(`${CYAN} BELLA EOS — Creative Planning Engine v2 Verification${RESET}`);
console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);

for (const scenario of SCENARIOS) {
  console.log(`${YELLOW}▶ Scenario: ${scenario.label}${RESET}`);
  const plan = CreativePlanningEngine.plan(scenario.request);

  // ── Structural assertions ──────────────────────────────────────────────────
  assert('imagenPrompt is non-empty', plan.imagenPrompt.length > 50,
    `len=${plan.imagenPrompt.length}`);
  assert('fluxPrompt is non-empty',   plan.fluxPrompt.length > 30,
    `len=${plan.fluxPrompt.length}`);
  assert('dallePrompt is non-empty',  plan.dallePrompt.length > 80,
    `len=${plan.dallePrompt.length}`);
  assert('negativePrompt contains "text"',
    plan.negativePrompt.toLowerCase().includes('text'));
  assert('negativePrompt contains "watermark"',
    plan.negativePrompt.toLowerCase().includes('watermark'));
  assert('negativePrompt contains "letters"',
    plan.negativePrompt.toLowerCase().includes('letters'));

  // ── No Vietnamese in imagenPrompt (Imagen English only) ────────────────────
  const hasVietnamese = /[àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i
    .test(plan.imagenPrompt);
  assert('imagenPrompt has no Vietnamese characters', !hasVietnamese,
    plan.imagenPrompt.substring(0, 60));

  // ── Style & luxury assertions ──────────────────────────────────────────────
  assert(`styleId = "${scenario.expects.styleId}"`,
    plan.styleId === scenario.expects.styleId,
    `got "${plan.styleId}"`);
  assert(`luxuryLevel >= ${scenario.expects.minLuxury}`,
    plan.luxuryLevel >= scenario.expects.minLuxury,
    `got ${plan.luxuryLevel}`);
  assert(`campaignType = "${scenario.expects.campaignType}"`,
    plan.campaignType === scenario.expects.campaignType,
    `got "${plan.campaignType}"`);

  // ── Composition ────────────────────────────────────────────────────────────
  assert('composition.copySpacePercent >= 50',
    plan.composition.copySpacePercent >= 50,
    `got ${plan.composition.copySpacePercent}%`);
  assert('subjects array is non-empty', plan.subjects.length > 0);
  assert('styleGraph has material', plan.styleGraph.material.length > 10);
  assert('camera.body is specified', (plan.camera.body?.length ?? 0) > 5);
  assert('lighting.mood is specified', (plan.lighting.mood?.length ?? 0) > 5);

  // ── dallePrompt avoidance clause ───────────────────────────────────────────
  assert('dallePrompt contains avoidance clause',
    plan.dallePrompt.toLowerCase().includes('do not include any text'));

  // ── Flux tag format (comma-separated) ─────────────────────────────────────
  const fluxTagCount = plan.fluxPrompt.split(',').length;
  assert(`fluxPrompt has >= 8 comma-separated tags`, fluxTagCount >= 8,
    `got ${fluxTagCount} tags`);

  console.log();
}

// ── Summary ────────────────────────────────────────────────────────────────────
console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`${GREEN}✅ ALL ${total} ASSERTIONS PASSED${RESET}`);
} else {
  console.log(`${RED}❌ ${failed} / ${total} ASSERTIONS FAILED${RESET}`);
  process.exit(1);
}
console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);
