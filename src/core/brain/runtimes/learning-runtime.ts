/**
 * BELLA EOS BRAIN: Learning Runtime (with Human Approval Gate)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Flow: Evidence ➔ Suggestion ➔ Human Approval Gate ➔ SOP Update.
 * Prevents AI from damaging SOPs directly.
 */

export interface SOPSuggestion {
  id: string;
  sopId: string;
  evidenceId: string;
  proposedChanges: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export class LearningRuntime {
  private static instance: LearningRuntime;
  private suggestions: Map<string, SOPSuggestion> = new Map();

  private constructor() {}

  public static getInstance(): LearningRuntime {
    if (!LearningRuntime.instance) {
      LearningRuntime.instance = new LearningRuntime();
    }
    return LearningRuntime.instance;
  }

  public proposeSOPMutation(sopId: string, evidenceId: string, rationale: string): SOPSuggestion {
    const id = `sop-sug-${Date.now()}`;
    const suggestion: SOPSuggestion = {
      id,
      sopId,
      evidenceId,
      proposedChanges: rationale,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
    };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }

  public approveSOPMutation(suggestionId: string, approverId: string): boolean {
    const sug = this.suggestions.get(suggestionId);
    if (!sug) return false;
    sug.status = 'APPROVED';
    return true;
  }

  public getPendingSuggestions(): SOPSuggestion[] {
    return Array.from(this.suggestions.values()).filter(s => s.status === 'PENDING_APPROVAL');
  }
}
