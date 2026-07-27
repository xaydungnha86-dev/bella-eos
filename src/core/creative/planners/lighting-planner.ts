/**
 * BELLA EOS — Creative Runtime
 * planners/lighting-planner.ts
 *
 * LightingPlanner — Wave 4 (requires: scene, styleId).
 * Derives lighting setup from scene + style graph.
 * Independent LightingGraph — not embedded in scene or camera.
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision } from '../kernel/planning-state';
import { ALL_MEDIA_CAPS } from '../kernel/planner-contract';

interface LightingSpec {
  keyLight:         string;
  ambientMood:      string;
  rimLight?:        string;
  colorTemperature: string;
  softness:         string;
  style:            string;
  direction:        string;
}

const STYLE_LIGHTING: Record<string, LightingSpec> = {
  'luxury-premium': {
    keyLight:         'Soft window light with silk diffusion',
    ambientMood:      'Warm golden fill, deep shadow gradients',
    rimLight:         'Subtle warm rim defining edge',
    colorTemperature: '3200K warm',
    softness:         'ultra-soft, wrap-around',
    style:            'luxury',
    direction:        'side-angled-45',
  },
  'editorial-fashion': {
    keyLight:         'Hard directional strobe, 45° Rembrandt',
    ambientMood:      'High contrast, clean shadows',
    colorTemperature: '5600K daylight',
    softness:         'hard, sculptural',
    style:            'editorial',
    direction:        'front-45',
  },
  'tech-innovation': {
    keyLight:         'Clean neutral LED panel, precise and even',
    ambientMood:      'Subtle blue-cool ambient, controlled fill',
    rimLight:         'Cool blue rim light',
    colorTemperature: '6500K cool daylight',
    softness:         'controlled, medium',
    style:            'technical',
    direction:        'front-balanced',
  },
  'bold-geometric': {
    keyLight:         'Dramatic electric accent light',
    ambientMood:      'Dark dramatic backdrop, neon accent glow',
    colorTemperature: '4000K neutral-cool with neon cast',
    softness:         'hard accent, dramatic shadow',
    style:            'dramatic',
    direction:        'dynamic-angle',
  },
  'corporate-clean': {
    keyLight:         'Professional softbox, balanced exposure',
    ambientMood:      'Clean neutral fill, minimal shadow',
    colorTemperature: '5500K neutral',
    softness:         'medium-soft, professional',
    style:            'corporate',
    direction:        'front-45',
  },
  'nature-organic': {
    keyLight:         'Soft morning diffused daylight',
    ambientMood:      'Golden hour warmth, natural fill',
    colorTemperature: '3800K warm morning',
    softness:         'ultra-soft, atmospheric',
    style:            'natural',
    direction:        'side-window',
  },
  'cyberpunk-luxury': {
    keyLight:         'Neon accent from above with deep shadow fill',
    ambientMood:      'Electric violet and cyan glow, rain-wet reflection',
    rimLight:         'Electric blue rim defining subject against dark',
    colorTemperature: 'mixed neon — 3000K warm + 6500K neon',
    softness:         'hard neon, dramatic bokeh',
    style:            'cinematic',
    direction:        'top-down-neon',
  },
};

export class LightingPlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'LightingPlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        ['scene', 'styleId'],
    produces:        ['lighting'],
    capabilities:    ALL_MEDIA_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const styleId = state.plan.styleId ?? 'corporate-clean';
    const spec    = STYLE_LIGHTING[styleId] ?? STYLE_LIGHTING['corporate-clean'];

    const writer = new StateWriter(state, 'LightingPlanner');
    writer.write('lighting', {
      keyLight:         spec.keyLight,
      ambientMood:      spec.ambientMood,
      rimLight:         spec.rimLight,
      colorTemperature: spec.colorTemperature,
      softness:         spec.softness,
      style:            spec.style,
      direction:        spec.direction,
    } as any);

    traceDecision(state, 'LightingPlanner', spec.style,
      `Style="${styleId}" → ${spec.keyLight} at ${spec.colorTemperature}`, 85);
  }
}
