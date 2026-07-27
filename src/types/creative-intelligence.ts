/**
 * BELLA EOS CREATIVE INTELLIGENCE CONTRACTS
 * Version: 3.0.0
 * 
 * 4-Layer Creative Intelligence Architecture:
 * Layer 1: Business Context (Data Aggregation)
 * Layer 2: Creative Reasoning (AI Understanding)
 * Layer 3: Prompt Composition (Visual Language Synthesis)
 * Layer 4: Model Adaptation (Format Optimization)
 */

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 1: BUSINESS CONTEXT CONTRACTS
// ══════════════════════════════════════════════════════════════════════════════

export interface BusinessContextPackage {
  ceoObjective: string;
  
  enterpriseContext: {
    erp: ERPSnapshot;
    crm: CRMSnapshot;
    budget: BudgetConstraints;
    policies: PolicyConstraints[];
  };
  
  copywriterContent: {
    rawText: string;
    extractedEntities: ParsedEntity[];
    tone: string;
    keyMessages: string[];
  } | null;
  
  brandDNA: {
    identity: IdentityDNA;
    voice: VoiceDNA;
    visual: VisualDNA;
    values: string[];
  };
  
  campaignMemory: {
    successfulPatterns: Pattern[];
    avoidPatterns: Pattern[];
    performanceInsights: Insight[];
  };
  
  knowledgeContext: {
    domainFacts: Fact[];
    industryTrends: Trend[];
    competitorInsights: Insight[];
  };
  
  timestamp: string;
}

export interface ERPSnapshot {
  revenue: {
    current: number;
    target: number;
    currency: string;
  };
  customers: {
    total: number;
    active: number;
    segments: string[];
  };
  campaigns: {
    active: number;
    budget: number;
  };
}

export interface CRMSnapshot {
  leads: {
    total: number;
    qualified: number;
    conversionRate: number;
  };
  touchpoints: {
    email: number;
    social: number;
    website: number;
  };
}

export interface BudgetConstraints {
  totalBudget: number;
  duration: string;
  costPerLead?: number;
  roi_target?: number;
}

export interface PolicyConstraints {
  id: string;
  type: 'compliance' | 'brand' | 'legal' | 'budget';
  rule: string;
  severity: 'required' | 'recommended' | 'optional';
}

export interface ParsedEntity {
  type: 'headline' | 'body' | 'bullet' | 'cta' | 'hashtag' | 'emoji';
  text: string;
  confidence: number;
  position: number;
}

export interface IdentityDNA {
  brandName: string;
  tagline?: string;
  mission: string;
  vision: string;
  targetSegment: string;
}

export interface VoiceDNA {
  tone: string;
  personality: string[];
  vocabulary: string[];
  avoidWords: string[];
}

export interface VisualDNA {
  style: string;
  colors: {
    primary: string;
    accent: string;
    neutral: string;
  };
  typography?: {
    primary: string;
    secondary: string;
  };
  imagery: string[];
}

export interface Pattern {
  id: string;
  description: string;
  occurrences: number;
  successRate?: number;
  examples: string[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  source: string;
  relevance: number;
}

export interface Fact {
  id: string;
  statement: string;
  category: string;
  verified: boolean;
  source: string;
}

export interface Trend {
  id: string;
  name: string;
  direction: 'rising' | 'declining' | 'stable';
  relevance: number;
  timeframe: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 2: CREATIVE REASONING CONTRACTS
// ══════════════════════════════════════════════════════════════════════════════

export interface CreativeBrief {
  // Strategic Layer
  campaignGoal: string;
  targetAudience: string;
  emotionalTone: string;
  
  // Narrative Layer
  visualStory: string;
  designDirection: string;
  
  // Execution Layer
  posterHeadline: string;        // Synthesized by LLM, NOT copied from copywriter
  heroSubject: string;            // Main visual subject
  environmentDescription: string; // Setting and background
  colorMood: string;              // Color psychology
  lightingMood: string;           // Lighting atmosphere
  compositionRule: CompositionRuleType;
  
  // Guidance Layer
  keyMessage: string;
  avoidances: string[];
  successMetrics: string[];
  
  // Metadata
  confidenceScore: number;
  reasoningChain: string[];
  generatedAt: string;
}

export type CompositionRuleType = 
  | 'rule_of_thirds'
  | 'golden_ratio'
  | 'centered'
  | 'asymmetric'
  | 'diagonal'
  | 'frame_within_frame';

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 3: PROMPT COMPOSITION CONTRACTS
// ══════════════════════════════════════════════════════════════════════════════

export interface ComposedPrompt {
  basePrompt: string;           // Rich visual description (300-500 words)
  
  technicalSpec: {
    camera: CameraProfile;
    palette: ColorPalette;
    layout: LayoutSpec;
    quality: QualityLevel;
    aspectRatio: string;
  };
  
  negativePrompt: string;
  
  metadata: {
    brief: CreativeBrief;
    format: ImageFormat;
    composedAt: string;
  };
}

export interface CameraProfile {
  body: string;
  lens: string;
  depth: string;
  quality: string;
}

export interface ColorPalette {
  primary: string;
  accent: string;
  neutral: string;
  mood: string[];
}

export interface LayoutSpec {
  copySpacePercent: number;
  subjectPlacement: 'left' | 'right' | 'center';
  rule: CompositionRuleType;
  perspective: string;
  leadingLines?: string;
}

export type QualityLevel = 
  | 'standard'
  | 'high'
  | 'ultra_high'
  | 'cinematic'
  | 'editorial';

export interface ImageFormat {
  aspectRatio: '16:9' | '1:1' | '9:16' | '4:3';
  width?: number;
  height?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 4: MODEL ADAPTER CONTRACTS
// ══════════════════════════════════════════════════════════════════════════════

export interface ModelPrompts {
  imagen: string;      // Google Imagen 3
  dalle: string;       // OpenAI DALL-E 3
  flux: string;        // Flux.1
  ideogram: string;    // Ideogram
  stable: string;      // Stable Diffusion
}

export interface PromptAdapter {
  modelFamily: string;
  version: string;
  
  render(composed: ComposedPrompt): string;
  renderNegative(composed: ComposedPrompt): string;
  renderMetadata?(composed: ComposedPrompt): Record<string, unknown>;
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATIVE INTELLIGENCE ENGINE OUTPUT
// ══════════════════════════════════════════════════════════════════════════════

export interface CreativeOutput {
  creativeBrief: CreativeBrief;
  composedPrompt: ComposedPrompt;
  modelPrompts: Partial<ModelPrompts>;
  
  metadata: {
    generatedAt: string;
    pipelineVersion: string;
    totalProcessingTime?: number;
  };
}

export interface CreativeRequest {
  objective: string;
  copywriterSnippet?: string;
  brandDna?: any;  // TODO: Replace with proper BrandDnaContext type
  format?: '16:9' | '1:1' | '9:16' | '4:3';
  medium?: 'image' | 'video' | 'slide' | 'landing_page';
  tenantId?: string;
  preferredModel?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATIVE MEMORY & LEARNING CONTRACTS
// ══════════════════════════════════════════════════════════════════════════════

export interface CreativeMemoryEntry {
  id: string;
  tenantId: string;
  objective: string;
  brief: CreativeBrief;
  imageUrl: string;
  
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  };
  
  feedback: {
    userRating?: number;
    comments?: string;
    qualityScore?: number;
  };
  
  createdAt: string;
}

export interface CreativeMemoryQuery {
  tenantId: string;
  similarObjectives?: string;
  minSuccessRate?: number;
  limit?: number;
  includeFailures?: boolean;
}
