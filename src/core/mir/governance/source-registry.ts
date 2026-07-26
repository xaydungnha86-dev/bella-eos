/**
 * BELLA EOS MIR GOVERNANCE: Source Registry Runtime (Runtime 47)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Mission: External Source Registry Engine. Registers and manages baseline authority scores
 * for external intelligence sources (Government = 100, Industry Report = 98, Trends = 95, Social Post = 60).
 */

import { IExternalSource } from '@/types/external-source';

export class SourceRegistryRuntime {
  private static instance: SourceRegistryRuntime;
  private sources: Map<string, IExternalSource> = new Map();

  private constructor() {
    this.seedDefaultSources();
  }

  public static getInstance(): SourceRegistryRuntime {
    if (!SourceRegistryRuntime.instance) {
      SourceRegistryRuntime.instance = new SourceRegistryRuntime();
    }
    return SourceRegistryRuntime.instance;
  }

  private seedDefaultSources(): void {
    this.registerSource('src-gov', 'Official Government Portal', 'gov.vn', 100, 30);
    this.registerSource('src-nielsen', 'Industry Research Report', 'nielsen.com', 98, 90);
    this.registerSource('src-gtrends', 'Google Trends API', 'trends.google.com', 95, 7);
    this.registerSource('src-fbpost', 'Facebook Competitor Post', 'facebook.com', 60, 3);
  }

  public registerSource(sourceId: string, sourceName: string, domain: string, authorityScore: number, freshnessRequirementDays: number): IExternalSource {
    const src: IExternalSource = {
      sourceId,
      sourceName,
      domain,
      authorityScore,
      freshnessRequirementDays,
      licenseType: authorityScore > 90 ? 'COMMERCIAL' : 'PUBLIC',
      trustScore: authorityScore,
      priority: authorityScore >= 90 ? 'HIGH' : authorityScore >= 70 ? 'MEDIUM' : 'LOW',
      status: 'ACTIVE',
    };
    this.sources.set(sourceId, src);
    return src;
  }

  public getSource(sourceId: string): IExternalSource | undefined {
    return this.sources.get(sourceId);
  }
}
