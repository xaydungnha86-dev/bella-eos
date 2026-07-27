/**
 * BELLA EOS — Creative Runtime
 * kernel/planning-context.ts
 *
 * PlanningContext is the central, immutable input object passed to every Planner.
 * It is built ONCE before execution begins and never mutated during planning.
 * Constraints are resolved early and available to all planners.
 */

import type { BrandDnaContext } from '../creative-plan';

export interface TargetPlatform {
  name:            string;   // 'instagram_reel' | 'facebook_cover' | 'google_ads' | ...
  canonicalRatio:  string;   // e.g. '4:5'
  safeZone: {
    top:    number;   // % of canvas
    bottom: number;
    left:   number;
    right:  number;
  };
  textLimitChars?:    number;   // max headline chars
  maxImageTextRatio?: number;   // 0.0–1.0, Google Ads = 0.2
}

export interface EnterprisePolicy {
  forbiddenColors:      string[];   // hex
  mandatoryLogo:        boolean;
  brandApprovedStyles?: string[];   // only these styleIds allowed
  contentRestrictions:  string[];   // e.g. 'no_faces', 'no_alcohol'
}

export interface ConstraintSet {
  maxHeadlineChars?:    number;
  maxImageTextRatio?:   number;
  forbiddenColors:      string[];
  mandatoryElements:    string[];
  safeZone: { top: number; bottom: number; left: number; right: number };
  allowedStyleIds?:     string[];
  maxPromptChars:       number;
  notes:                string[];
}

export interface UserPreferences {
  preferredStyles:  string[];
  rejectedConcepts: string[];
}

// Stub for Phase 4 (Supabase-backed)
export interface CreativeMemory {
  brandId:           string;
  recentStyles:      string[];
  approvedRules:     string[];
}

export interface PlanningContext {
  // ── Request ─────────────────────────────────────────────────────────────────
  objective:         string;
  copywriterSnippet?: string;
  format:            '16:9' | '1:1' | '9:16' | '4:3';
  medium:            'image' | 'video' | 'slide' | 'landing_page' | '3d';
  preferredModel?:   string;   // 'imagen' | 'flux' | 'dalle'

  // ── Brand ────────────────────────────────────────────────────────────────────
  brandDna:          BrandDnaContext;
  enterprisePolicy:  EnterprisePolicy;

  // ── Platform + Constraints (resolved early) ──────────────────────────────────
  targetPlatform:    TargetPlatform;
  constraints:       ConstraintSet;   // derived from platform + policy

  // ── Memory (stub in Phase 2, Supabase in Phase 4) ────────────────────────────
  creativeMemory:    CreativeMemory;

  // ── User ─────────────────────────────────────────────────────────────────────
  userPreferences:   UserPreferences;
}

// ── Defaults ──────────────────────────────────────────────────────────────────
export const DEFAULT_PLATFORM: TargetPlatform = {
  name:           'default',
  canonicalRatio: '16:9',
  safeZone:       { top: 5, bottom: 5, left: 5, right: 5 },
};

export const DEFAULT_POLICY: EnterprisePolicy = {
  forbiddenColors:     [],
  mandatoryLogo:       false,
  contentRestrictions: [],
};

export const DEFAULT_MEMORY: CreativeMemory = {
  brandId:       'anonymous',
  recentStyles:  [],
  approvedRules: [],
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredStyles:  [],
  rejectedConcepts: [],
};
