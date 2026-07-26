/**
 * BELLA EOS EAH: Knowledge Harness Runtime (Runtime 6)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Mission: Enterprise Knowledge & SOP Injection Engine. Automatically fetches relevant SOPs,
 * operational policies, active Playbooks, and Learning DNA Packs.
 */

import { LearningDNAManager } from '../assets/learning-dna';

export class KnowledgeHarnessRuntime {
  private static instance: KnowledgeHarnessRuntime;

  private constructor() {}

  public static getInstance(): KnowledgeHarnessRuntime {
    if (!KnowledgeHarnessRuntime.instance) {
      KnowledgeHarnessRuntime.instance = new KnowledgeHarnessRuntime();
    }
    return KnowledgeHarnessRuntime.instance;
  }

  public getKnowledgeAndSOPs(tenantId: string): string[] {
    const dnaManager = LearningDNAManager.getInstance();
    const dna = dnaManager.getOrCreateDNA(tenantId);
    
    return [
      ...dna.contentPayload.playbooks.map(p => `[PLAYBOOK] ${p}`),
      ...dna.contentPayload.bestPractices.map(bp => `[BEST_PRACTICE] ${bp}`),
      ...dna.contentPayload.patterns.map(pat => `[SUCCESS_PATTERN] ${pat}`),
    ];
  }
}
