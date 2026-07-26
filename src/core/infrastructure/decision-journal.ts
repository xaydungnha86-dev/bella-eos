/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Decision Journal
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS Decoupled)
 *
 * Mission: Executive Explainability & Audit Tracker. Logs context, alternatives considered,
 * expert deliberation votes, evidence references, and final executive reasoning for all strategic decisions.
 */

export interface DeliberationVote {
  role: string;
  vote: 'APPROVE' | 'REJECT' | 'CONDITIONAL';
  rationale: string;
}

export interface DecisionJournalEntry {
  decisionId: string;
  contextObjective: string;
  alternativesConsidered: string[];
  votes: DeliberationVote[];
  evidenceReferences: string[];
  finalDecisionMode: string;
  executiveReasoning: string;
  timestamp: string;
}

export class DecisionJournal {
  private static instance: DecisionJournal;
  private journal: Map<string, DecisionJournalEntry> = new Map();

  private constructor() {}

  public static getInstance(): DecisionJournal {
    if (!DecisionJournal.instance) {
      DecisionJournal.instance = new DecisionJournal();
    }
    return DecisionJournal.instance;
  }

  public recordDecision(entry: Omit<DecisionJournalEntry, 'decisionId' | 'timestamp'>): DecisionJournalEntry {
    const decision: DecisionJournalEntry = {
      ...entry,
      decisionId: `dec-jrn-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.journal.set(decision.decisionId, decision);
    return decision;
  }

  public getDecision(decisionId: string): DecisionJournalEntry | undefined {
    return this.journal.get(decisionId);
  }

  public listDecisions(): DecisionJournalEntry[] {
    return Array.from(this.journal.values());
  }

  public queryJournalByObjective(keyword: string): DecisionJournalEntry[] {
    const lower = keyword.toLowerCase();
    return Array.from(this.journal.values()).filter(
      entry => entry.contextObjective.toLowerCase().includes(lower)
    );
  }
}
