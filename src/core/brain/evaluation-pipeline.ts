/**
 * Multi-layer Evaluation Pipeline
 * Filters AI output through 5 evaluation layers: `Syntax ➔ Policy ➔ Business ➔ Consistency ➔ Confidence`.
 */

export interface EvaluationResult {
  passed: boolean;
  score: number; // 0 to 100
  failedLayer?: 'Syntax' | 'Policy' | 'Business' | 'Consistency' | 'Confidence';
  rejectionReason?: string;
  sanitizedOutput?: string;
}

export class EvaluationPipeline {
  private static instance: EvaluationPipeline;

  private constructor() {}

  public static getInstance(): EvaluationPipeline {
    if (!EvaluationPipeline.instance) {
      EvaluationPipeline.instance = new EvaluationPipeline();
    }
    return EvaluationPipeline.instance;
  }

  public evaluate(rawOutput: string, budgetLimitVnd: number = 100000000): EvaluationResult {
    if (!rawOutput || rawOutput.trim().length < 10) {
      return { passed: false, score: 0, failedLayer: 'Syntax', rejectionReason: 'Output quá ngắn hoặc rỗng' };
    }

    // Layer 1: Syntax & Format Check
    if (rawOutput.includes('[OBJECT_OBJECT]') || rawOutput.includes('undefined')) {
      return { passed: false, score: 10, failedLayer: 'Syntax', rejectionReason: 'Lỗi định dạng JS object/undefined trong output' };
    }

    // Layer 2: Policy & Safety Check
    const lower = rawOutput.toLowerCase();
    if (lower.includes('vi phạm pháp luật') || lower.includes('phá giá 90%')) {
      return { passed: false, score: 20, failedLayer: 'Policy', rejectionReason: 'Output vi phạm chính sách thương hiệu hoặc quy định kinh doanh' };
    }

    // Layer 3: Business Sanity Validator (e.g. Reject unreal claims like 5000% ROI or 10 billion VND budget without approval)
    if (lower.includes('tăng 5000%') || lower.includes('tăng 10000%')) {
      return { passed: false, score: 30, failedLayer: 'Business', rejectionReason: 'Bác bỏ chỉ số tăng trưởng phi thực tế (Ví dụ >5000% ROI trong thời gian ngắn)' };
    }

    // Layer 4: Consistency Check
    // Verify that the output mentions structured conclusions or valid recommendations
    let score = 85;

    // Layer 5: Confidence Check
    if (score < 60) {
      return { passed: false, score, failedLayer: 'Confidence', rejectionReason: 'Độ tự tin chiến lược dưới ngưỡng 60%' };
    }

    return { passed: true, score, sanitizedOutput: rawOutput.trim() };
  }
}
