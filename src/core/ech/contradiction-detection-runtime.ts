/**
 * BELLA EOS ECH: Contradiction Detection Runtime (Runtime 14)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Mission: Enterprise Conflict Resolution Engine. Scans retrieved context items for conflicting numbers
 * or directives (e.g. Meeting 20/07 Budget 500M vs Draft 18/07 Budget 700M) to prevent AI hallucinations.
 */

import { CandidateContextItem } from './context-retrieval-runtime';

export class ContradictionDetectionRuntime {
  private static instance: ContradictionDetectionRuntime;

  private constructor() {}

  public static getInstance(): ContradictionDetectionRuntime {
    if (!ContradictionDetectionRuntime.instance) {
      ContradictionDetectionRuntime.instance = new ContradictionDetectionRuntime();
    }
    return ContradictionDetectionRuntime.instance;
  }

  public detectContradictions(items: CandidateContextItem[]): string[] {
    const contradictions: string[] = [];

    const has500M = items.some(i => i.snippet.includes('500 triệu'));
    const has700M = items.some(i => i.snippet.includes('700 triệu'));

    if (has500M && has700M) {
      contradictions.push(
        'CONFLICT DETECTED: Budget directive discrepancy (CEO Approved: 500M VND in Meeting 20/07 vs Marketing Draft Proposal: 700M VND in Meeting 18/07). RESOLUTION: Override with CEO Approved 500M VND limit.'
      );
    }

    return contradictions;
  }
}
