/**
 * BELLA EOS ERL: Reliability Memory
 * Specification: ERL Diagnostics Engine
 * 
 * Mission: Catalog recurring failure patterns to avoid repeating system defects.
 */

import { IFailurePattern } from '@/types/erl';

export class ReliabilityMemory {
  private static instance: ReliabilityMemory;
  private memoryStore: Map<string, IFailurePattern> = new Map();

  private constructor() {
    this.seedKnownFailures();
  }

  public static getInstance(): ReliabilityMemory {
    if (!ReliabilityMemory.instance) {
      ReliabilityMemory.instance = new ReliabilityMemory();
    }
    return ReliabilityMemory.instance;
  }

  public recordFailure(objective: string, rootCause: string): IFailurePattern {
    const keyword = objective.split(/\s+/)[0] || 'general';
    const patternKey = `${keyword}-${rootCause}`;

    let pattern = this.memoryStore.get(patternKey);
    if (!pattern) {
      pattern = {
        patternId: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        failedObjectiveSubString: keyword,
        dominantRootCause: rootCause,
        failureCount: 1,
        recommendedFixId: `fix-rec-${rootCause.toLowerCase()}`,
        resolvedCount: 0
      };
    } else {
      pattern.failureCount++;
    }

    this.memoryStore.set(patternKey, pattern);
    return pattern;
  }

  public listPatterns(): IFailurePattern[] {
    return Array.from(this.memoryStore.values());
  }

  public incrementResolution(patternId: string): void {
    const pattern = Array.from(this.memoryStore.values()).find(p => p.patternId === patternId);
    if (pattern) {
      pattern.resolvedCount++;
    }
  }

  private seedKnownFailures(): void {
    this.memoryStore.set('marketing-RETRIEVER', {
      patternId: 'pat-marketing-retriever',
      failedObjectiveSubString: 'Lập',
      dominantRootCause: 'RETRIEVER',
      failureCount: 3,
      recommendedFixId: 'fix-rec-rag',
      resolvedCount: 2
    });
  }
}
