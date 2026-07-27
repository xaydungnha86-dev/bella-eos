/**
 * BELLA EOS — Creative Runtime
 * planners/scene-planner.ts
 *
 * ScenePlanner — Wave 3 (requires: narrativeGraph, styleGraph).
 * Builds the scene environment and subject description from the narrative snapshot
 * and selected style graph. This is the layer that connects story → visual world.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision, plannerWarn } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';

const STYLE_ENVIRONMENTS: Record<string, string> = {
  'luxury-premium':   'An exclusive, architecturally refined interior space with premium materials — polished marble, warm brass details, and soft natural light from floor-to-ceiling windows',
  'editorial-fashion': 'A clean, high-contrast editorial studio space with seamless white background and precise directional lighting',
  'tech-innovation':  'A sleek, minimalist modern environment with dark tones and subtle technology details — clean surfaces, ambient blue glow, precision-engineered space',
  'bold-geometric':   'A dynamic environment defined by strong geometric forms and bold angles — dark backdrop with electric accent lighting',
  'corporate-clean':  'A professional, well-lit corporate environment — clean lines, neutral palette, open and structured space',
  'nature-organic':   'A serene natural environment with organic textures — soft morning light through foliage, natural materials, clean air and stillness',
  'cyberpunk-luxury': 'A high-contrast neon-lit luxury environment — dark architecture punctuated by vivid light, rain-slicked surfaces, premium materials with tech edge',
};

const STYLE_SUBJECTS: Record<string, string> = {
  'luxury-premium':   'The primary subject is presented with exquisite precision — refined, effortless, and occupying space with quiet confidence',
  'editorial-fashion': 'A strong, editorial subject with deliberate pose and precise relationship to the frame — bold and uncompromising',
  'tech-innovation':  'The focal subject suggests forward motion and intelligent purpose — clean geometry, confident positioning',
  'bold-geometric':   'A dynamic subject in confident motion — energy expressed through form and directional momentum',
  'corporate-clean':  'A composed, professional subject with clear and direct presentation — authority through simplicity',
  'nature-organic':   'A natural, harmonious subject at ease in its environment — balance and vitality in every element',
  'cyberpunk-luxury': 'A premium subject commanding attention against the dramatic light — luxury made vivid and modern',
};

export class ScenePlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'ScenePlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        ['narrativeGraph', 'styleId'],
    produces:        ['scene'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const styleId  = state.plan.styleId ?? 'corporate-clean';
    const narrative = state.plan.narrativeGraph;
    const concept   = state.plan.semanticConcept;

    if (!narrative) {
      plannerWarn(state, 'ScenePlanner', 'MISSING_NARRATIVE',
        'narrativeGraph not found — using style defaults only', 'low');
    }

    const environment      = STYLE_ENVIRONMENTS[styleId] ?? STYLE_ENVIRONMENTS['corporate-clean'];
    const subjectDescription = STYLE_SUBJECTS[styleId] ?? STYLE_SUBJECTS['corporate-clean'];

    // Enrich environment with semantic color mood if available
    const colorEnrichment = concept?.colorMood
      ? ` Palette tones: ${concept.colorMood}.`
      : '';

    // Use narrative imageSnapshot as the conceptual scene opener
    const sceneOpener = narrative?.imageSnapshot ?? '';

    const writer = new StateWriter(state, 'ScenePlanner');
    writer.write('scene', {
      environment:        `${environment}.${colorEnrichment}`,
      subjectDescription: subjectDescription,
      atmosphere:         narrative?.transformation ?? concept?.coreEmotion ?? '',
      sceneOpener,
    } as any);

    traceDecision(state, 'ScenePlanner', styleId,
      `Style="${styleId}" → environment derived from style library + narrative snapshot`,
      82);
  }
}
