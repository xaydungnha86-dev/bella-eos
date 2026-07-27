/**
 * BELLA EOS — Creative Runtime
 * planners/camera-planner.ts
 *
 * CameraPlanner — Wave 2 (requires: semanticConcept, styleId).
 * Reasons from Creative Intent → Emotion → Lens choice.
 * NOT derived from scene (scene comes AFTER camera).
 */

import type { Planner, PlannerMetadata } from '../kernel/planner-contract';
import type { PlanningState } from '../kernel/planning-state';
import { StateWriter, traceDecision } from '../kernel/planning-state';
import { IMAGE_SLIDE_CAPS } from '../kernel/planner-contract';

interface CameraSpec {
  cameraBody:    string;
  lens:          string;
  focalLength:   number;
  aperture:      number;
  angle:         string;
  depthOfField:  string;
  reason:        string;
}

// Intent → Camera reasoning table
const INTENT_TO_CAMERA: Record<string, CameraSpec> = {
  authority: {
    cameraBody: 'Hasselblad X2D', lens: '90mm Portrait', focalLength: 90,
    aperture: 2.8, angle: 'low-angle', depthOfField: 'medium',
    reason: 'Low angle creates authority and command. 90mm compressed perspective adds weight.',
  },
  aspirational: {
    cameraBody: 'Sony A7R V', lens: '85mm f/1.4 GM', focalLength: 85,
    aperture: 1.4, angle: 'slight-uptilt', depthOfField: 'very-shallow',
    reason: 'Slight uptilt toward subject creates aspiration. Shallow bokeh isolates premium subject.',
  },
  approachable: {
    cameraBody: 'Leica M11', lens: '50mm Summilux', focalLength: 50,
    aperture: 2.0, angle: 'eye-level', depthOfField: 'natural',
    reason: 'Eye-level, 50mm natural FOV creates trust and human connection.',
  },
  innovation: {
    cameraBody: 'Canon R5', lens: '24-35mm wide', focalLength: 28,
    aperture: 5.6, angle: 'dynamic-angle', depthOfField: 'deep',
    reason: 'Wide lens expands space, suggesting scale of innovation. Deep focus keeps context visible.',
  },
  intimate: {
    cameraBody: 'Nikon Z9', lens: '100mm Macro', focalLength: 100,
    aperture: 1.8, angle: 'close-up', depthOfField: 'ultra-shallow',
    reason: '100mm macro isolates fine detail. Ultra-shallow bokeh creates intimacy and premium feel.',
  },
  editorial: {
    cameraBody: 'Phase One XT', lens: '80mm IQ', focalLength: 80,
    aperture: 8.0, angle: 'eye-level', depthOfField: 'medium',
    reason: 'Medium format editorial look. f/8 for sharp editorial precision across subject.',
  },
  architectural: {
    cameraBody: 'Canon R5', lens: '24mm Tilt-Shift', focalLength: 24,
    aperture: 11.0, angle: 'straight-on', depthOfField: 'maximum',
    reason: 'Tilt-shift eliminates distortion. Maximum depth shows architectural precision.',
  },
  cinematic: {
    cameraBody: 'ARRI Alexa (stills mode)', lens: '35mm Anamorphic', focalLength: 35,
    aperture: 2.8, angle: 'cinematic-low', depthOfField: 'anamorphic-bokeh',
    reason: 'Anamorphic lens creates cinematic flares and oval bokeh. Cinematic low-angle adds drama.',
  },
};

// Map concept labels → camera intent
const CONCEPT_TO_INTENT: Record<string, string> = {
  'Serenity & Luxury':       'intimate',
  'Intelligence & Innovation': 'innovation',
  'Opportunity & Growth':    'aspirational',
  'Achievement & Prestige':  'authority',
  'Bold Identity':           'editorial',
  'Energy & Gathering':      'cinematic',
  'Disruption & Courage':    'innovation',
  'Rare Excellence':         'intimate',
  'Vitality & Harmony':      'approachable',
  'Security & Trust':        'authority',
  'Curious Progress':        'aspirational',
  'Clear Authority':         'authority',
};

export class CameraPlanner implements Planner {
  readonly meta: PlannerMetadata = {
    plannerName:     'CameraPlanner',
    plannerVersion:  '2.0.0',
    author:          'bella-eos/creative-runtime',
    experimental:    false,
    estimatedMs:     1,
    usesExternalApi: false,
    requires:        ['semanticConcept', 'styleId'],
    produces:        ['camera'],
    capabilities:    IMAGE_SLIDE_CAPS,
  };

  async plan(state: PlanningState): Promise<void> {
    const concept = state.plan.semanticConcept;
    const intent  = concept ? (CONCEPT_TO_INTENT[concept.conceptLabel] ?? 'approachable') : 'approachable';
    const spec    = INTENT_TO_CAMERA[intent] ?? INTENT_TO_CAMERA.approachable;

    const writer = new StateWriter(state, 'CameraPlanner');
    writer.write('camera', {
      cameraBody:   spec.cameraBody,
      lens:         spec.lens,
      focalLength:  spec.focalLength,
      aperture:     spec.aperture,
      angle:        spec.angle,
      depthOfField: spec.depthOfField,
    } as any);

    traceDecision(state, 'CameraPlanner', `${spec.lens} @ f/${spec.aperture}`,
      `Concept="${concept?.conceptLabel}" → intent="${intent}" → ${spec.reason}`, 88);
  }
}
