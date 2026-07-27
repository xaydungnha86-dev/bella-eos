/**
 * BELLA EOS — Creative Runtime
 * kernel/planner-contract.ts
 *
 * Standardized contract every Creative Kernel Planner must implement.
 *
 * Key design decisions:
 *   - plan() returns Promise<void> — async-ready for LLM providers
 *   - produces: string[] — multiple output fields per planner
 *   - requires: string[] — explicit dependencies enable DAG scheduling
 *   - capabilities — enables medium-based planner filtering
 *   - PlannerMetadata — enterprise observability + monitoring
 */

import type { CreativePlan } from '../creative-plan';
import type { PlanningState } from './planning-state';

// ── Planner Capability ────────────────────────────────────────────────────────
export interface PlannerCapabilities {
  supportsImage:    boolean;
  supportsVideo:    boolean;
  supportsSlide:    boolean;
  supportsLanding:  boolean;
}

// ── Planner Metadata ─────────────────────────────────────────────────────────
export interface PlannerMetadata {
  plannerName:      string;
  plannerVersion:   string;
  author:           string;
  experimental:     boolean;
  estimatedMs:      number;         // typical latency in ms
  usesExternalApi:  boolean;        // true = may incur cost / extra latency
  requires:         (keyof CreativePlan | string)[];   // fields this planner reads
  produces:         (keyof CreativePlan | string)[];   // fields this planner writes
  capabilities:     PlannerCapabilities;
}

// ── Planner Contract ─────────────────────────────────────────────────────────
/**
 * Every planner registered in PlannerRegistry must implement this interface.
 *
 * Responsibilities:
 *   - Declare metadata (requires / produces / capabilities)
 *   - Implement plan(state) to mutate state.plan via StateWriter
 *   - Call traceDecision() to record reasoning in state.decisionTrace
 *
 * What planners must NOT do:
 *   - Mutate state.plan directly (use StateWriter.write())
 *   - Read fields outside of state.plan and state.context
 *   - Throw exceptions for non-fatal errors (use plannerError() + return)
 */
export interface Planner {
  readonly meta: PlannerMetadata;
  plan(state: PlanningState): Promise<void>;
}

// ── Standard Capabilities ─────────────────────────────────────────────────────
export const IMAGE_ONLY_CAPS: PlannerCapabilities = {
  supportsImage: true, supportsVideo: false, supportsSlide: false, supportsLanding: false,
};

export const ALL_MEDIA_CAPS: PlannerCapabilities = {
  supportsImage: true, supportsVideo: true, supportsSlide: true, supportsLanding: true,
};

export const IMAGE_SLIDE_CAPS: PlannerCapabilities = {
  supportsImage: true, supportsVideo: false, supportsSlide: true, supportsLanding: true,
};
