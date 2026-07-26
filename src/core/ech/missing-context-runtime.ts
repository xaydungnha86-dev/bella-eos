/**
 * BELLA EOS ECH: Missing Context Runtime (Runtime 15)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Mission: Clarification Guard Engine. Identifies missing essential parameters
 * (e.g. Budget ceiling, Target Branch location, Work-force capacity) and flags them for CEO clarification instead of hallucinating assumptions.
 */

export class MissingContextRuntime {
  private static instance: MissingContextRuntime;

  private constructor() {}

  public static getInstance(): MissingContextRuntime {
    if (!MissingContextRuntime.instance) {
      MissingContextRuntime.instance = new MissingContextRuntime();
    }
    return MissingContextRuntime.instance;
  }

  public detectMissingParameters(objective: string): string[] {
    const missing: string[] = [];
    const lower = objective.toLowerCase();

    if (lower.includes('chi nhánh mới') || lower.includes('mở rộng')) {
      if (!lower.includes('địa điểm')) missing.push('Missing Target Location for new branch expansion');
      if (!lower.includes('ngân sách')) missing.push('Missing Approved Capital Expenditure (CapEx) Budget');
    }

    return missing;
  }
}
