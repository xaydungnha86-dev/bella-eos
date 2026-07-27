/**
 * BELLA EOS — Creative Runtime
 * planners/intent-planner.ts
 *
 * IntentPlanner — Wave 0 (no dependencies).
 * Resolves: campaignType, tone, targetKPI, audienceLabel, luxuryLevel.
 * All other planners depend on campaignType, making this the root of the DAG.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';

const CAMPAIGN_PATTERNS: Array<{
  type: string; tone: string; kpi: string; audience: string; luxuryLevel: number; keywords: string[];
}> = [
  { type: 'spa/wellness',    tone: 'serene',       kpi: 'booking',    audience: 'affluent-women-25-45',   luxuryLevel: 5, keywords: ['spa', 'thẩm mỹ', 'wellness', 'massage', 'làm đẹp'] },
  { type: 'tech/ai',         tone: 'innovative',   kpi: 'demo-signup', audience: 'decision-makers-30-50', luxuryLevel: 3, keywords: ['ai', 'software', 'platform', 'công nghệ', 'digital'] },
  { type: 'recruitment',     tone: 'inspiring',    kpi: 'application', audience: 'professionals-22-40',   luxuryLevel: 2, keywords: ['tuyển dụng', 'recruitment', 'hiring', 'career', 'nhân sự'] },
  { type: 'real-estate',     tone: 'prestigious',  kpi: 'inquiry',    audience: 'investors-35-55',        luxuryLevel: 5, keywords: ['bất động sản', 'real estate', 'căn hộ', 'property', 'nhà'] },
  { type: 'fashion',         tone: 'editorial',    kpi: 'purchase',   audience: 'style-conscious-20-40',  luxuryLevel: 4, keywords: ['thời trang', 'fashion', 'boutique', 'style', 'collection'] },
  { type: 'event',           tone: 'energetic',    kpi: 'registration', audience: 'professionals-25-50', luxuryLevel: 2, keywords: ['sự kiện', 'event', 'hội thảo', 'conference', 'workshop'] },
  { type: 'startup',         tone: 'bold',         kpi: 'investment', audience: 'founders-25-40',         luxuryLevel: 2, keywords: ['startup', 'khởi nghiệp', 'venture', 'founder', 'innovation'] },
  { type: 'luxury-brand',    tone: 'exclusive',    kpi: 'brand-recall', audience: 'hnwi-30-60',          luxuryLevel: 5, keywords: ['luxury', 'cao cấp', 'exclusive', 'premium', 'limited'] },
  { type: 'health/fitness',  tone: 'motivational', kpi: 'signup',    audience: 'health-conscious-20-45',  luxuryLevel: 2, keywords: ['sức khỏe', 'health', 'fitness', 'yoga', 'gym', 'nutrition'] },
  { type: 'finance',         tone: 'trustworthy',  kpi: 'inquiry',   audience: 'investors-30-55',         luxuryLevel: 3, keywords: ['tài chính', 'finance', 'bank', 'ngân hàng', 'investment'] },
  { type: 'education',       tone: 'inspiring',    kpi: 'enrollment', audience: 'learners-18-40',         luxuryLevel: 1, keywords: ['giáo dục', 'education', 'training', 'đào tạo', 'course'] },
];

export class IntentPlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'IntentPlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        [],
    produces:        ['campaignType', 'tone', 'targetKPI', 'audienceLabel', 'luxuryLevel'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const input = state.context.objective.toLowerCase();
    const writer = new StateWriter(state, 'IntentPlanner');

    let best = CAMPAIGN_PATTERNS[CAMPAIGN_PATTERNS.length - 1]; // default
    let bestScore = 0;

    for (const pattern of CAMPAIGN_PATTERNS) {
      const matches = pattern.keywords.filter(kw => input.includes(kw)).length;
      if (matches > bestScore) { bestScore = matches; best = pattern; }
    }

    // Luxury level boost from brandDna
    const luxuryLevel = state.context.brandDna?.luxuryLevel ?? best.luxuryLevel;

    writer.write('campaignType',  best.type);
    writer.write('tone',          best.tone);
    writer.write('targetKPI',     best.kpi);
    writer.write('audienceLabel', best.audience);
    writer.write('luxuryLevel',   luxuryLevel);

    traceDecision(state, 'IntentPlanner', best.type,
      `Objective matched "${best.type}" (${bestScore} keyword hits) — tone: ${best.tone}, KPI: ${best.kpi}`,
      bestScore > 0 ? Math.min(95, 50 + bestScore * 15) : 60);
  }
}
