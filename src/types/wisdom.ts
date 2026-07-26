/**
 * BELLA EOS PLATFORM CONTRACT: Wisdom Contract (IWisdom v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME (EIER / EER)
 * 
 * Contract 25: Wisdom Tier (Tier 4 in Cognitive Hierarchy: Raw Evidence ➔ Facts ➔ Knowledge ➔ Wisdom).
 * Represents high-level strategic enterprise principles distilled from months of multi-department operational data.
 * Used by EIP & Decision Engine for executive advisory.
 */

export interface IWisdom {
  id: string;
  segment: string; // e.g. "High-End Spa", "Retail Franchise", "E-Commerce Media"
  strategicPrinciple: string; // e.g. "Prioritize authentic video reviews over flash sales for high retention"
  rationale: string;
  supportingFactsCount: number;
  supportingKnowledgeRefs: string[];
  executiveRecommendation: string;
  confidenceScore: number;
  owner: string;
  createdAt: string;
  expirationDate?: string;
  tags: string[];
}
