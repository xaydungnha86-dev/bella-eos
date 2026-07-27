/**
 * BELLA EOS — Creative Runtime
 * narrative/template-narrative-provider.ts
 *
 * Default NarrativeProvider — 10 pre-crafted narrative archetypes.
 * Maps SemanticConcept.conceptLabel → structured NarrativeGraph.
 * Image renderer uses only imageSnapshot. Video uses the full arc.
 *
 * Phase 3 upgrade: GeminiNarrativeProvider for dynamic LLM-generated stories.
 */

import type { NarrativeGraph, SemanticConcept } from '../creative-plan';
import type { NarrativeProvider } from './narrative-provider';

interface NarrativeTemplate {
  conceptLabel:   string;
  arc:            NarrativeGraph['arc'];
  beginning:      string;
  conflict?:      string;
  transformation: string;
  resolution:     string;
  imageSnapshot:  string;
}

const TEMPLATES: NarrativeTemplate[] = [
  {
    conceptLabel:   'Serenity & Luxury',
    arc:            'transformation',
    beginning:      'A quiet morning in a private spa suite — daylight barely touches the white marble.',
    conflict:       'The relentless pace of modern life waits just beyond the door.',
    transformation: 'In this still moment, the ritual begins — warmth, silence, presence.',
    resolution:     'She emerges renewed. The business of beauty has never felt more effortless.',
    imageSnapshot:  'Serene luxury spa suite bathed in soft golden morning light, white marble, single orchid, steam rising gently — a still moment of premium calm.',
  },
  {
    conceptLabel:   'Intelligence & Innovation',
    arc:            'aspiration',
    beginning:      'In the quiet hum of a data center, invisible decisions shape the visible world.',
    transformation: 'The system learns, adapts, and illuminates pathways that once required months to find.',
    resolution:     'Intelligence at scale — not as a tool, but as a trusted partner in every decision.',
    imageSnapshot:  'Dark server environment with streams of blue-white light tracing neural connections across a floating geometric interface — intelligence made visible.',
  },
  {
    conceptLabel:   'Opportunity & Growth',
    arc:            'aspiration',
    beginning:      'A professional stands before wide glass doors on a bright morning.',
    transformation: 'The doors open — not to a room, but to a horizon full of possibility.',
    resolution:     'The right opportunity, at the right moment, changes everything.',
    imageSnapshot:  'Wide glass doors opening to a luminous morning horizon, warm amber light flooding a clean modern lobby — a threshold of professional possibility.',
  },
  {
    conceptLabel:   'Achievement & Prestige',
    arc:            'linear',
    beginning:      'Every great structure begins with a foundation no one will ever see.',
    transformation: 'Years of precision, material, and intention rise into something permanent.',
    resolution:     'This is not property. This is a statement of what you have built and who you are.',
    imageSnapshot:  'Landmark glass and stone architecture photographed at golden hour — precise angles, warm reflected light, panoramic city backdrop.',
  },
  {
    conceptLabel:   'Bold Identity',
    arc:            'contrast',
    beginning:      'Everything unnecessary has been removed.',
    conflict:       'What remains is exactly who you are.',
    transformation: 'One line. One form. One choice.',
    resolution:     'Identity is not worn. It is expressed.',
    imageSnapshot:  'Editorial fashion — a single bold silhouette against a clean white backdrop, high contrast monochromatic light, architectural negative space.',
  },
  {
    conceptLabel:   'Energy & Gathering',
    arc:            'aspiration',
    beginning:      'Individual lights in a dark arena — each one a person, a perspective, a story.',
    transformation: 'The moment they converge, something new becomes possible.',
    resolution:     'This is where ideas become movement.',
    imageSnapshot:  'Dynamic event space with converging beams of light on a stage, vibrant crowd energy implied through light and geometry — momentum made visible.',
  },
  {
    conceptLabel:   'Disruption & Courage',
    arc:            'contrast',
    beginning:      'The existing system has rules. Walls. Limits.',
    conflict:       'Most respect them. A few do not.',
    transformation: 'The breakthrough is never the technology. It is the decision to move.',
    resolution:     'Build what should exist.',
    imageSnapshot:  'Bold geometric forms launching upward through a dark field — electric violet and deep black, angular momentum, a singular upward trajectory.',
  },
  {
    conceptLabel:   'Rare Excellence',
    arc:            'linear',
    beginning:      'Only a handful of things in this world are made this way.',
    transformation: 'Not for everyone. Not for mass production. For those who notice the difference.',
    resolution:     'Excellence in the detail no one asked for — but everyone will remember.',
    imageSnapshot:  'Extreme close-up of fine craftsmanship — champagne gold detail on rare material, soft directional light, absolute stillness, premium texture.',
  },
  {
    conceptLabel:   'Security & Trust',
    arc:            'linear',
    beginning:      'Everything that matters deserves a foundation that will not move.',
    transformation: 'Not the fastest. Not the loudest. The most reliable.',
    resolution:     'Trust is not given. It is built — one decision at a time.',
    imageSnapshot:  'Strong architectural base with structured geometry rising upward, deep navy and charcoal palette, institutional clarity, quiet confidence.',
  },
  {
    conceptLabel:   'Clear Authority',
    arc:            'linear',
    beginning:      'Clear thinking. Clear communication. Clear results.',
    transformation: 'The work speaks before the words do.',
    resolution:     'Professionalism is not a style. It is a standard.',
    imageSnapshot:  'Clean professional environment with precise neutral tones, structured open space, balanced composition, soft directional light — clarity made visual.',
  },
];

export class TemplateNarrativeProvider implements NarrativeProvider {
  readonly providerName = 'template';

  generate(concept: SemanticConcept, _styleId: string, _campaignType: string): NarrativeGraph {
    const template = TEMPLATES.find(t => t.conceptLabel === concept.conceptLabel)
      ?? TEMPLATES[TEMPLATES.length - 1]; // fallback: Clear Authority

    return {
      arc:            template.arc,
      beginning:      template.beginning,
      conflict:       template.conflict,
      transformation: template.transformation,
      resolution:     template.resolution,
      imageSnapshot:  template.imageSnapshot,
      providerName:   this.providerName,
    };
  }
}
