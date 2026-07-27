/**
 * BELLA EOS — Creative Runtime
 * creative-plan.ts
 *
 * Defines all core data types for the Creative Runtime:
 *   - SemanticConcept     — output of SemanticPlanner
 *   - NarrativeGraph      — output of NarrativePlanner
 *   - QualityScore        — output of QualityEvaluator
 *   - DecisionTraceEntry  — audit trail entry written by each planner
 *   - CreativePlan        — the sealed, final structured output
 *
 * Prompts for individual AI models are DERIVED fields inside CreativePlan.
 * They are NOT the primary output — CreativePlan is.
 */

// ── Semantic Concept ─────────────────────────────────────────────────────────
/** Output of SemanticPlanner — the "meaning layer" before any scene is planned. */
export interface SemanticConcept {
  conceptLabel:   string;    // e.g. "Serenity & Luxury"
  coreEmotion:    string;    // e.g. "peace, renewal, intimacy"
  visualMetaphor: string;    // e.g. "calm still water, warm organic stone"
  symbolElements: string[];  // e.g. ["soft morning light", "orchid", "marble surface"]
  colorMood:      string;    // e.g. "warm golden tones, cream whites"
  intentScore:    number;    // confidence 0–100
  providerName:   string;    // e.g. "rule-based" | "gemini-flash"
}

// ── Narrative Graph ──────────────────────────────────────────────────────────
/** Output of NarrativePlanner — a structured story. Image uses imageSnapshot.
 *  Video/Slide renderers use the full arc. */
export interface NarrativeGraph {
  arc:            'linear' | 'contrast' | 'transformation' | 'aspiration';
  beginning:      string;   // establishing moment
  conflict?:      string;   // optional tension (video uses this)
  transformation: string;   // key turning point
  resolution:     string;   // outcome / desired state
  imageSnapshot:  string;   // single sentence used as scene opener in image prompts
  providerName:   string;   // e.g. "template" | "gemini"
}

// ── Quality Score ─────────────────────────────────────────────────────────────
export interface StyleConflict {
  dimension: string;    // e.g. "lighting"
  elementA:  string;
  elementB:  string;
  score:     number;    // compatibility 0–100 (low = conflict)
  resolution: string;
}

export interface QualityScore {
  semanticConsistency:     number;   // 0–100
  brandConsistency:        number;
  visualConsistency:       number;
  compositionCompleteness: number;
  promptReadiness:         number;
  overall:                 number;   // weighted average
  conflicts:               StyleConflict[];
  verdict:                 'pass' | 'warn' | 'regenerate';
}

// ── Decision Trace ───────────────────────────────────────────────────────────
export interface DecisionTraceEntry {
  planner:   string;
  decision:  string;
  reason:    string;
  score?:    number;
  timestamp: string;
}

// ── Planning Diagnostics ──────────────────────────────────────────────────────
export interface PlanningWarning {
  planner:  string;
  code:     string;
  message:  string;
  severity: 'low' | 'medium' | 'high';
}

export interface PlanningError {
  planner: string;
  code:    string;
  message: string;
  fatal:   boolean;
}

// ── BrandDnaContext ───────────────────────────────────────────────────────────
export interface BrandDnaContext {
  brandName?: string;
  brandColors?: {
    primary?: string;
    accent?: string;
    neutral?: string;
  };
  visualStyle?: string;    // e.g. "Luxury", "Cyberpunk", "Minimal"
  voiceTone?: string;      // e.g. "Sang trọng, Uy tín"
  targetSegment?: string;  // e.g. "Chủ Spa cao cấp"
  luxuryLevel?: number;
  primaryColor?: string;
}

// ── Style Graph ───────────────────────────────────────────────────────────────
/** A graph-structured style definition. Each style entry is a full specification,
 *  not a flat string. New styles are added to STYLE_LIBRARY — pipeline unchanged. */
export interface StyleGraph {
  id:          string;
  displayName: string;
  luxuryLevel: 1 | 2 | 3 | 4 | 5;   // 1=minimal, 5=ultra-luxury
  palette: {
    surface:   string;   // dominant background tone hex
    dominant:  string;   // main accent hex
    highlight: string;   // secondary highlight hex
    shadow:    string;   // shadow / depth hex
  };
  material:    string;   // e.g. "polished Italian marble with gold leaf trim"
  texture:     string;   // e.g. "smooth, reflective, glass-like"
  depth:       string;   // e.g. "shallow bokeh f/1.4, dreamy background separation"
  postProcess: string;   // e.g. "warm cinematic LUT, soft grain, HDR"
  lighting: {
    ambient:   string;
    key:       string;
    rim:       string;
    mood:      string;
  };
  camera: {
    body:    string;
    lens:    string;
    angle:   string;
    quality: string;
  };
  environment: string;   // base scene descriptor
  negativeBase: string;  // style-specific negative terms
}

// ── Composition Spec ─────────────────────────────────────────────────────────
export interface CompositionSpec {
  copySpacePercent:  number;   // % of canvas for copy overlay, e.g. 60
  subjectPlacement: 'right' | 'left' | 'center' | 'bottom';
  rule:             'rule_of_thirds' | 'golden_ratio' | 'centered' | 'edge';
  perspective?:       string;   // e.g. "slightly elevated 15-degree tilt"
  leadingLines?:      string;   // e.g. "architectural lines guiding eye to right"
  copySpaceDirection?: string;
  gridSystem?:         string;
  safeZone?: {
    top:    number;
    bottom: number;
    left:   number;
    right:  number;
  };
}

// ── Creative Plan ─────────────────────────────────────────────────────────────
/** The canonical output of CreativePlanningEngine.plan().
 *  All downstream pipelines consume this; model prompts are derived fields. */
export interface CreativePlan {
  // ── Input metadata ──────────────────────────────────────────────────────────
  objective:    string;
  campaignType: string;
  medium:       'image' | 'video' | 'slide' | 'landing_page' | '3d';
  format:       '16:9' | '1:1' | '9:16' | '4:3';

  // ── Creative Intent ─────────────────────────────────────────────────────────
  intent:      string;    // human-readable creative goal
  tone:        string;    // e.g. "premium, serene, authoritative"
  targetKPI:   string;    // e.g. "CTA click-through rate"
  audienceLabel: string;  // e.g. "Chủ Spa cao cấp khu vực TP.HCM"

  // ── Brand ───────────────────────────────────────────────────────────────────
  brandName:   string;
  palette: {
    primary:   string;
    accent:    string;
    neutral:   string;
    surface:   string;   // canvas dominant background tone
  };

  // ── Style ───────────────────────────────────────────────────────────────────
  styleId:     string;   // key into STYLE_LIBRARY
  styleGraph:  StyleGraph;
  luxuryLevel: number;

  // ── Scene ───────────────────────────────────────────────────────────────────
  environment: string;
  subjects:    string[];  // visual subject descriptors (non-text elements)
  props:       string[];  // supporting props in scene
  scene?: {
    environment:        string;
    subjectDescription: string;
    atmosphere:         string;
    sceneOpener:        string;
  };

  // ── Composition ─────────────────────────────────────────────────────────────
  composition: CompositionSpec;

  // ── Lighting ────────────────────────────────────────────────────────────────
  lighting: {
    ambient?:   string;
    key?:       string;
    rim?:       string;
    mood?:      string;
    // New fields
    keyLight?:         string;
    ambientMood?:      string;
    rimLight?:         string;
    colorTemperature?: string;
    softness?:         string;
    style?:            string;
    direction?:        string;
  };

  // ── Camera ──────────────────────────────────────────────────────────────────
  camera: {
    body?:    string;
    lens?:    string;
    angle?:   string;
    dof?:     string;
    quality?: string;
    // New fields
    cameraBody?:   string;
    focalLength?:  number;
    aperture?:     number;
    depthOfField?: string;
  };

  // ── Model-specific prompt outputs ───────────────────────────────────────────
  /** Natural commercial-language prompt, max ~480 chars. Imagen responds best. */
  imagenPrompt:  string;
  /** Tag-dense, comma-separated, keyword-rich prompt. Flux/SDXL respond best. */
  fluxPrompt:    string;
  /** Full descriptive sentence + avoidance clause. DALL-E 3 responds best. */
  dallePrompt:   string;
  /** Shared negative prompt across all models. */
  negativePrompt: string;

  // ── Runtime outputs (set by SemanticPlanner + NarrativePlanner) ────────────
  semanticConcept?:  SemanticConcept;
  narrativeGraph?:   NarrativeGraph;

  // ── Quality gate ─────────────────────────────────────────────────────────────
  qualityScore?:     QualityScore;

  // ── Audit trail ──────────────────────────────────────────────────────────────
  decisionTrace:     DecisionTraceEntry[];

  // ── Metadata ──────────────────────────────────────────────────────────────────
  generatedAt:       string;   // ISO timestamp
  runtimeVersion:    string;   // e.g. "2.0.0"
}
