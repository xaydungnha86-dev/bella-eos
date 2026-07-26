/**
 * BELLA EOS EAH: Lessons Learned Harness (Runtime 3)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME
 * 
 * Mission: Automatically injects concise, actionable lessons learned (e.g. "Campaign A failed due to weak creative ➔ Do not rerun Landing Page A") into the AI Harness.
 */

export class LessonsLearnedHarness {
  private static instance: LessonsLearnedHarness;
  private lessons: Map<string, string[]> = new Map();

  private constructor() {
    this.seedDefaultLessons();
  }

  public static getInstance(): LessonsLearnedHarness {
    if (!LessonsLearnedHarness.instance) {
      LessonsLearnedHarness.instance = new LessonsLearnedHarness();
    }
    return LessonsLearnedHarness.instance;
  }

  private seedDefaultLessons(): void {
    this.lessons.set('default-tenant', [
      'Do not rerun Landing Page A without 48h mobile speed optimization.',
      'Authentic customer video reviews yield +41% retention compared to generic discounts.',
      'Campaign budget scaling must be accompanied by 48h booking capacity checks.',
    ]);
  }

  public getLessons(tenantId: string): string[] {
    return this.lessons.get(tenantId) || this.lessons.get('default-tenant')!;
  }

  public addLesson(tenantId: string, lesson: string): void {
    const list = this.getLessons(tenantId);
    if (!list.includes(lesson)) {
      list.push(lesson);
      this.lessons.set(tenantId, list);
    }
  }
}
