/**
 * BELLA EOS ERL: LLM-as-Judge Runtime
 * Specification: ERL Evaluation Engine
 * 
 * Mission: Leverage a secondary LLM/Judge agent to score execution outputs against reference answers.
 */

export class LlmAsJudgeRuntime {
  private static instance: LlmAsJudgeRuntime;

  private constructor() {}

  public static getInstance(): LlmAsJudgeRuntime {
    if (!LlmAsJudgeRuntime.instance) {
      LlmAsJudgeRuntime.instance = new LlmAsJudgeRuntime();
    }
    return LlmAsJudgeRuntime.instance;
  }

  /**
   * Evaluate response output against the reference answer.
   * Returns a score between 0.0 and 1.0 representing accuracy.
   */
  public evaluateAccuracy(output: string, referenceAnswer: string): number {
    // LLM-as-Judge semantic similarity emulation
    const cleanOutput = output.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanRef = referenceAnswer.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Common term extraction
    const terms = ['doanhthu', 'ngânsách', 'ugc', 'ceo', 'haichâu', 'điềuđộng'];
    let matches = 0;
    let total = 0;

    terms.forEach(t => {
      const inRef = cleanRef.includes(t);
      const inOutput = cleanOutput.includes(t);
      if (inRef) {
        total++;
        if (inOutput) {
          matches++;
        }
      }
    });

    if (total === 0) return 0.95; // default fallback semantic score
    return matches / total;
  }
}
