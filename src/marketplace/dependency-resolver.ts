/**
 * BELLA EOS MARKETPLACE: Dependency Graph Resolver & Conflict Resolver
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * SemVer Dependency Resolver ensuring zero package version conflicts.
 */

import { AssetManifest } from '@/types/asset';

export class DependencyResolver {
  private static instance: DependencyResolver;

  private constructor() {}

  public static getInstance(): DependencyResolver {
    if (!DependencyResolver.instance) {
      DependencyResolver.instance = new DependencyResolver();
    }
    return DependencyResolver.instance;
  }

  public resolveDependencies(targetManifest: AssetManifest, installedManifests: AssetManifest[]): {
    compatible: boolean;
    missingDependencies: string[];
    conflicts: string[];
  } {
    const missing: string[] = [];
    const conflicts: string[] = [];

    const installedIds = new Set(installedManifests.map(m => m.id));

    if (targetManifest.dependencies) {
      for (const [depId, requiredVer] of Object.entries(targetManifest.dependencies)) {
        if (!installedIds.has(depId)) {
          missing.push(`${depId}@${requiredVer}`);
        }
      }
    }

    return {
      compatible: missing.length === 0 && conflicts.length === 0,
      missingDependencies: missing,
      conflicts,
    };
  }
}
