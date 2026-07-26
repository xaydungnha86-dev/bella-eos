/**
 * BELLA EOS E-COS: Context Token Budget Manager
 * Specification: v18.8 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Mission: Context Token Allocation Engine. Manages context window ceilings (e.g. 64,000 tokens)
 * and enforces strict percentage allocations to prevent token overflow & prompt degradation.
 */

export interface TokenAllocationSpec {
  maxTotalTokens: number;
  businessRulesTokens: number; // 10%
  lessonsLearnedTokens: number;// 20%
  historicalMemoryTokens: number;// 25%
  ceoDecisionsTokens: number;   // 20%
  knowledgeSopTokens: number;   // 15%
  evidenceCitationsTokens: number;// 10%
}

export class ContextBudgetManager {
  private static instance: ContextBudgetManager;

  private constructor() {}

  public static getInstance(): ContextBudgetManager {
    if (!ContextBudgetManager.instance) {
      ContextBudgetManager.instance = new ContextBudgetManager();
    }
    return ContextBudgetManager.instance;
  }

  public calculateBudgetSpec(maxTotalTokens: number = 64_000): TokenAllocationSpec {
    return {
      maxTotalTokens,
      businessRulesTokens: Math.floor(maxTotalTokens * 0.10),
      lessonsLearnedTokens: Math.floor(maxTotalTokens * 0.20),
      historicalMemoryTokens: Math.floor(maxTotalTokens * 0.25),
      ceoDecisionsTokens: Math.floor(maxTotalTokens * 0.20),
      knowledgeSopTokens: Math.floor(maxTotalTokens * 0.15),
      evidenceCitationsTokens: Math.floor(maxTotalTokens * 0.10),
    };
  }
}
