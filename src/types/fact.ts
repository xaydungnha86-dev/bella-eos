/**
 * BELLA EOS PLATFORM CONTRACT: Fact Contract (IFact v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE INTELLIGENCE EVOLUTION RUNTIME (EIER / EER)
 * 
 * Contract 24: Fact Tier (Tier 2 in Cognitive Hierarchy: Raw Evidence ➔ Facts ➔ Knowledge ➔ Wisdom).
 * Represents verified, immutable quantitative facts extracted from enterprise evidence.
 */

export interface IFact {
  id: string;
  evidenceId: string;
  metricName: string; // e.g. "Revenue", "ROAS", "CAC", "Bookings"
  numericValue: number;
  unit: string;
  groundTruthRef?: string;
  verifiedBy: string;
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
}
