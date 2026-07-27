/**
 * BELLA EOS — Creative Runtime
 * kernel/planner-registry.ts
 *
 * PlannerRegistry = registration + lookup + capability-based filtering.
 * PlannerRegistry does NOT execute planners — that is PlanningExecutor's job.
 *
 * Separation of concerns:
 *   Registry   = knows WHICH planners exist
 *   Executor   = knows HOW and WHEN to run them
 */

import type { Planner } from './planner-contract';
import type { CreativePlan } from '../creative-plan';

export class PlannerRegistry {
  private readonly map = new Map<string, Planner>();

  /** Register a planner. Throws if name already registered (prevents duplicate plugins). */
  register(planner: Planner): this {
    if (this.map.has(planner.meta.plannerName)) {
      throw new Error(
        `[PlannerRegistry] Planner "${planner.meta.plannerName}" is already registered. ` +
        `Unregister it first or use a different plannerName.`
      );
    }
    this.map.set(planner.meta.plannerName, planner);
    return this;  // fluent for chaining
  }

  /** Unregister a planner by name (useful for testing / hot-reload). */
  unregister(name: string): this {
    this.map.delete(name);
    return this;
  }

  get(name: string): Planner | undefined {
    return this.map.get(name);
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

  /** Return all registered planners in registration order. */
  getAll(): Planner[] {
    return Array.from(this.map.values());
  }

  /**
   * Return planners relevant to a given medium.
   * Planners that don't support the target medium are filtered out
   * before executor builds the DAG — they are never scheduled.
   */
  forMedium(medium: CreativePlan['medium']): Planner[] {
    return this.getAll().filter(p => {
      const c = p.meta.capabilities;
      switch (medium) {
        case 'video':        return c.supportsVideo;
        case 'slide':        return c.supportsSlide;
        case 'landing_page': return c.supportsLanding;
        default:             return c.supportsImage;
      }
    });
  }

  /** Diagnostic: return planner manifest (name, version, produces, estimatedMs). */
  manifest(): PlannerManifestEntry[] {
    return this.getAll().map(p => ({
      name:            p.meta.plannerName,
      version:         p.meta.plannerVersion,
      experimental:    p.meta.experimental,
      estimatedMs:     p.meta.estimatedMs,
      usesExternalApi: p.meta.usesExternalApi,
      requires:        p.meta.requires,
      produces:        p.meta.produces,
    }));
  }
}

export interface PlannerManifestEntry {
  name:            string;
  version:         string;
  experimental:    boolean;
  estimatedMs:     number;
  usesExternalApi: boolean;
  requires:        string[];
  produces:        string[];
}
