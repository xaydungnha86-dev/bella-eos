/**
 * BELLA EOS ECH: Evidence Citation Runtime (Runtime 16)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Mission: Source Attribution Engine. Attaches explicit source citations (`Meeting 20/07`,
 * `Lesson #123`, `SOP MKT-01`, `ERP Ledger`) to every AI recommendation for 100% auditability.
 */

import { RankedContextItem } from './context-ranking-runtime';

export interface EvidenceCitation {
  citationId: string;
  documentTitle: string;
  evidenceReference: string;
}

export class EvidenceCitationRuntime {
  private static instance: EvidenceCitationRuntime;

  private constructor() {}

  public static getInstance(): EvidenceCitationRuntime {
    if (!EvidenceCitationRuntime.instance) {
      EvidenceCitationRuntime.instance = new EvidenceCitationRuntime();
    }
    return EvidenceCitationRuntime.instance;
  }

  public generateCitations(rankedItems: RankedContextItem[]): EvidenceCitation[] {
    return rankedItems.map((item, idx) => ({
      citationId: `cite-${idx + 1}`,
      documentTitle: item.documentTitle,
      evidenceReference: `[Source: ${item.sourceType} | ${item.documentTitle}] "${item.snippet}"`,
    }));
  }
}
