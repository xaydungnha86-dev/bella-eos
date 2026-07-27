/**
 * BELLA EOS — Creative Runtime
 * semantic/rule-semantic-provider.ts
 *
 * Default SemanticProvider — pure keyword matching, 0ms latency, no API cost.
 * 12 campaign archetypes covering the majority of Bella EOS use cases.
 *
 * Phase 3 upgrade: swap this for GeminiSemanticProvider in kernel-factory.ts
 */

import type { SemanticConcept, BrandDnaContext } from '../creative-plan';
import type { SemanticProvider } from './semantic-provider';

interface SemanticArchetype {
  conceptLabel:   string;
  coreEmotion:    string;
  visualMetaphor: string;
  symbolElements: string[];
  colorMood:      string;
  keywords:       string[];
}

const ARCHETYPES: SemanticArchetype[] = [
  {
    conceptLabel:   'Serenity & Luxury',
    coreEmotion:    'peace, renewal, intimate luxury',
    visualMetaphor: 'calm still water, warm organic stone, morning light through curtains',
    symbolElements: ['soft morning light', 'white orchid', 'marble surface', 'steam rising'],
    colorMood:      'warm cream whites, soft gold, dusty rose, muted sage',
    keywords:       ['spa', 'thẩm mỹ', 'làm đẹp', 'wellness', 'massage', 'skin', 'chăm sóc da'],
  },
  {
    conceptLabel:   'Intelligence & Innovation',
    coreEmotion:    'curiosity, trust, forward momentum',
    visualMetaphor: 'neural network orbit, flowing data streams, interconnected light nodes',
    symbolElements: ['light streams', 'geometric nodes', 'clean glass surface', 'data visualization'],
    colorMood:      'deep navy, electric blue, clean white, subtle cyan glow',
    keywords:       ['ai', 'artificial intelligence', 'software', 'platform', 'tech', 'công nghệ', 'digital', 'data'],
  },
  {
    conceptLabel:   'Opportunity & Growth',
    coreEmotion:    'hope, ambition, professional confidence',
    visualMetaphor: 'glass doors opening to bright horizon, rising path, ascending staircase',
    symbolElements: ['morning horizon', 'open pathway', 'ascending geometry', 'golden sunrise'],
    colorMood:      'warm gold morning light, sky blue, energetic amber, crisp white',
    keywords:       ['tuyển dụng', 'recruitment', 'hr', 'nhân sự', 'career', 'job', 'hiring', 'cơ hội'],
  },
  {
    conceptLabel:   'Achievement & Prestige',
    coreEmotion:    'pride, stability, earned success',
    visualMetaphor: 'landmark architecture at golden hour, panoramic city view, strong foundation',
    symbolElements: ['architectural precision', 'golden hour light', 'city skyline', 'solid structure'],
    colorMood:      'warm gold, deep charcoal, rich bronze, ivory white',
    keywords:       ['bất động sản', 'real estate', 'property', 'căn hộ', 'apartment', 'nhà', 'villa'],
  },
  {
    conceptLabel:   'Bold Identity',
    coreEmotion:    'confidence, self-expression, editorial boldness',
    visualMetaphor: 'strong silhouette against clean editorial space, mirror reflection, bold contrast',
    symbolElements: ['clean lines', 'strong contrast', 'editorial negative space', 'bold form'],
    colorMood:      'monochromatic black/white, single bold accent, stark contrast',
    keywords:       ['thời trang', 'fashion', 'boutique', 'style', 'lifestyle', 'mode', 'collection'],
  },
  {
    conceptLabel:   'Energy & Gathering',
    coreEmotion:    'excitement, connection, shared momentum',
    visualMetaphor: 'converging light paths on stage, crowd energy, dynamic motion',
    symbolElements: ['stage lighting', 'convergent paths', 'upward motion', 'vibrant crowd'],
    colorMood:      'vibrant jewel tones, electric accent, dark dramatic backdrop',
    keywords:       ['sự kiện', 'event', 'hội thảo', 'conference', 'workshop', 'seminar', 'festival'],
  },
  {
    conceptLabel:   'Disruption & Courage',
    coreEmotion:    'boldness, breakthrough, fearless energy',
    visualMetaphor: 'rocket breaking through a geometric wall, upward trajectory, bold geometry',
    symbolElements: ['bold geometric shapes', 'upward motion', 'breakthrough element', 'dynamic lines'],
    colorMood:      'electric violet, hot orange, deep black, neon accent',
    keywords:       ['startup', 'khởi nghiệp', 'innovation', 'disruptive', 'venture', 'founder', 'entrepreneur'],
  },
  {
    conceptLabel:   'Rare Excellence',
    coreEmotion:    'exclusivity, quiet confidence, refined taste',
    visualMetaphor: 'gold thread through rare material, close detail of fine craftsmanship',
    symbolElements: ['fine gold detail', 'rare texture', 'subtle luminosity', 'crafted edge'],
    colorMood:      'champagne gold, deep black, ivory, subtle platinum',
    keywords:       ['luxury', 'cao cấp', 'premium', 'exclusive', 'limited edition', 'hàng hiệu'],
  },
  {
    conceptLabel:   'Vitality & Harmony',
    coreEmotion:    'balance, natural energy, holistic wellbeing',
    visualMetaphor: 'water ripple at dawn, morning mist over nature, breath and stillness',
    symbolElements: ['natural texture', 'water element', 'green foliage', 'soft morning light'],
    colorMood:      'fresh sage green, earth brown, sky blue, natural linen',
    keywords:       ['sức khỏe', 'health', 'fitness', 'yoga', 'organic', 'natural', 'nutrition', 'gym'],
  },
  {
    conceptLabel:   'Security & Trust',
    coreEmotion:    'reliability, stability, long-term growth',
    visualMetaphor: 'shield and strong foundation, structured rising graph, bedrock stability',
    symbolElements: ['structural geometry', 'upward chart', 'secure enclosure', 'institutional presence'],
    colorMood:      'navy blue, warm grey, deep green, clear white',
    keywords:       ['tài chính', 'finance', 'bank', 'ngân hàng', 'insurance', 'bảo hiểm', 'investment', 'đầu tư'],
  },
  {
    conceptLabel:   'Curious Progress',
    coreEmotion:    'curiosity, forward movement, inspiring growth',
    visualMetaphor: 'rising staircase toward light, open book horizon, illuminated path of knowledge',
    symbolElements: ['ascending path', 'open light source', 'layered knowledge', 'upward arc'],
    colorMood:      'warm amber, sky blue, fresh white, hopeful sunrise',
    keywords:       ['giáo dục', 'education', 'learning', 'đào tạo', 'training', 'school', 'university', 'course'],
  },
  {
    conceptLabel:   'Clear Authority',
    coreEmotion:    'professionalism, clarity, structured competence',
    visualMetaphor: 'clean structured space, neutral open environment',
    symbolElements: ['neutral backdrop', 'structured geometry', 'clean light', 'open space'],
    colorMood:      'neutral grey, professional blue, clean white',
    keywords:       [],   // fallback / generic
  },
];

export class RuleSemanticProvider implements SemanticProvider {
  readonly providerName = 'rule-based';

  analyze(objective: string, campaignType: string, brandDna?: BrandDnaContext): SemanticConcept {
    const input = `${objective} ${campaignType}`.toLowerCase();

    // Score each archetype by keyword matches
    let bestArchetype = ARCHETYPES[ARCHETYPES.length - 1]; // default: Clear Authority
    let bestScore = 0;

    for (const archetype of ARCHETYPES) {
      if (archetype.keywords.length === 0) continue;
      const matches = archetype.keywords.filter(kw => input.includes(kw)).length;
      const score = matches / archetype.keywords.length;
      if (score > bestScore) {
        bestScore = score;
        bestArchetype = archetype;
      }
    }

    const intentScore = bestScore > 0 ? Math.min(95, Math.round(bestScore * 100 + 50)) : 60;

    return {
      conceptLabel:   bestArchetype.conceptLabel,
      coreEmotion:    bestArchetype.coreEmotion,
      visualMetaphor: bestArchetype.visualMetaphor,
      symbolElements: bestArchetype.symbolElements,
      colorMood:      bestArchetype.colorMood,
      intentScore,
      providerName:   this.providerName,
    };
  }
}
