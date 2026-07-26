/**
 * BELLA EOS PLATFORM CONTRACT: External Source Contract (IExternalSource v1.0)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Contract 44: External Intelligence Source Metadata & Governance Contract.
 * Manages baseline authority scores (Government = 100, Industry Report = 98, Trends = 95, Social Post = 60),
 * freshness requirements, licensing types, and source priorities.
 */

export interface IExternalSource {
  sourceId: string;
  sourceName: string;
  domain: string;
  authorityScore: number; // 0 - 100
  freshnessRequirementDays: number;
  licenseType: 'PUBLIC' | 'COMMERCIAL' | 'INTERNAL_SCRAPED';
  trustScore: number;     // 0 - 100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED';
}
