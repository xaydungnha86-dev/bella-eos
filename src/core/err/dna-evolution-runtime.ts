/**
 * BELLA EOS ERR: DNA Evolution Runtime (Runtime 34)
 * Specification: v18.7 BELLA EOS ENTERPRISE REFLECTION RUNTIME
 * 
 * Mission: Learning DNA Evolver Engine. Updates the tenant's Living Learning DNA Pack
 * with new distilled lessons, patterns, and anti-patterns.
 */

import { LearningDNAManager } from '../assets/learning-dna';

export class DNAEvolutionRuntime {
  private static instance: DNAEvolutionRuntime;

  private constructor() {}

  public static getInstance(): DNAEvolutionRuntime {
    if (!DNAEvolutionRuntime.instance) {
      DNAEvolutionRuntime.instance = new DNAEvolutionRuntime();
    }
    return DNAEvolutionRuntime.instance;
  }

  public evolveLearningDNA(tenantId: string, newLesson: string): void {
    const dnaManager = LearningDNAManager.getInstance();
    const dna = dnaManager.getOrCreateDNA(tenantId);

    if (!dna.contentPayload.bestPractices.includes(newLesson)) {
      dna.contentPayload.bestPractices.push(newLesson);
    }
  }
}
