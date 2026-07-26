/**
 * BELLA EOS PLATFORM CONTRACT: Source Citation Contract (ISourceCitation v1.0)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Contract 45: Source Citation & Link Lineage Contract.
 * Attaches verifiable external source citations, confidence scores, retrieval timestamps,
 * and direct evidence links to every market evidence object.
 */

export interface ISourceCitation {
  citationId: string;
  sourceId: string;
  confidenceScore: number; // 0.0 - 1.0
  retrievedAt: string;
  version: string;
  evidenceLink: string;
}
