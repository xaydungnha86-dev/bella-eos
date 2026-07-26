/**
 * BELLA EOS ERL: Golden Dataset Manager
 * Specification: ERL Evaluation Engine
 * 
 * Mission: Manage offline reference datasets (Golden Sets) for benchmark testing.
 */

import { IGoldenCase } from '@/types/erl';

export class GoldenDatasetManager {
  private static instance: GoldenDatasetManager;
  private goldenCases: Map<string, IGoldenCase> = new Map();

  private constructor() {
    this.loadBenchmarkSuite();
  }

  public static getInstance(): GoldenDatasetManager {
    if (!GoldenDatasetManager.instance) {
      GoldenDatasetManager.instance = new GoldenDatasetManager();
    }
    return GoldenDatasetManager.instance;
  }

  public registerCase(caseObj: IGoldenCase): void {
    this.goldenCases.set(caseObj.caseId, caseObj);
  }

  public getCase(caseId: string): IGoldenCase | undefined {
    return this.goldenCases.get(caseId);
  }

  public listCases(): IGoldenCase[] {
    return Array.from(this.goldenCases.values());
  }

  public clearCases(): void {
    this.goldenCases.clear();
  }

  /**
   * Load the default 1000-question enterprise simulation baseline.
   */
  private loadBenchmarkSuite(): void {
    const defaultCases: IGoldenCase[] = [
      {
        caseId: 'gold-01',
        userObjective: 'Lập kế hoạch marketing Q3 cho chuỗi Spa tại Đà Nẵng.',
        expectedIntent: 'STRATEGIC_PLANNING',
        expectedReferenceDocIds: ['doc-marketing-q3-danang', 'doc-spa-rules-v2'],
        referenceAnswer: 'Doanh thu đề xuất 3.800.000.000 VND, ngân sách 500 triệu VND, sử dụng video UGC.'
      },
      {
        caseId: 'gold-02',
        userObjective: 'Phê duyệt hóa đơn thanh toán đối tác 150 triệu VND trong kỳ nghỉ lễ.',
        expectedIntent: 'FINANCIAL_AUDIT',
        expectedReferenceDocIds: ['doc-financial-budget-2026', 'doc-delegation-of-authority'],
        referenceAnswer: 'Yêu cầu CEO phê duyệt do vượt ngưỡng hạn mức phòng ban (50 triệu VND) trong kỳ CRISIS/Holidays.'
      },
      {
        caseId: 'gold-03',
        userObjective: 'Điều phối nhân sự đào tạo phục vụ cơ sở Spa Hải Châu.',
        expectedIntent: 'WORKFORCE_DISPATCH',
        expectedReferenceDocIds: ['doc-hr-registry', 'doc-spa-standard-operating-procedures'],
        referenceAnswer: 'Điều động 2 Kỹ thuật viên từ cơ sở Thanh Khê sang cơ sở Hải Châu trước 8:00 AM.'
      }
    ];

    defaultCases.forEach(c => this.registerCase(c));

    // Simulate scale up to 1000 benchmark cases
    for (let i = 4; i <= 1000; i++) {
      this.registerCase({
        caseId: `gold-${i}`,
        userObjective: `Mô phỏng câu hỏi nghiệp vụ số ${i} về kiểm toán tài chính hoặc vận hành.`,
        expectedIntent: i % 2 === 0 ? 'FINANCIAL_AUDIT' : 'OPERATIONAL_REVIEW',
        expectedReferenceDocIds: [`doc-benchmark-${i}`],
        referenceAnswer: `Kết quả đối chiếu quy chuẩn nghiệp vụ benchmark số ${i}.`
      });
    }
  }
}
