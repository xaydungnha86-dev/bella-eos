import { describe, test, expect } from '@jest/globals';
import { SopSelector } from '../../src/core/orchestration/sop-selector';

describe('Bella EOS: SOP Selection Benchmark & Governance Gate Tests', () => {
  const selector = new SopSelector();

  describe('1. Selection Accuracy Benchmark', () => {
    const testCases = [
      {
        intent: 'Tuyển dụng khẩn cấp CTO và các Trưởng phòng kinh doanh',
        expectedSopId: 'sop-hr-recruitment',
        expectedDept: 'HR'
      },
      {
        intent: 'Phân tích dự báo dòng tiền và cân đối hạn mức chi tiêu tài chính',
        expectedSopId: 'sop-finance-forecasting',
        expectedDept: 'Finance'
      },
      {
        intent: 'Triển khai gói tri ân giữ chân nhóm khách hàng VIP có nguy cơ rời bỏ',
        expectedSopId: 'sop-customer-retention',
        expectedDept: 'Customer Care'
      },
      {
        intent: 'Chạy chiến dịch quảng cáo tiếp thị Spa thu hút lead mới',
        expectedSopId: 'sop-spa-marketing',
        expectedDept: 'Marketing'
      }
    ];

    testCases.forEach(({ intent, expectedSopId, expectedDept }) => {
      test(`should select [${expectedSopId}] for intent: "${intent}"`, () => {
        const result = selector.selectSop(intent);
        expect(result.selectedSop.sopId).toBe(expectedSopId);
        expect(result.department).toBe(expectedDept);
        expect(result.confidence).toBeGreaterThanOrEqual(0.75);
        expect(result.requiresHumanClarification).toBe(false);
      });
    });
  });

  describe('2. Low Confidence & Human Clarification Gate', () => {
    test('should flag low-confidence ambiguous intent and require human clarification', () => {
      const ambiguousIntent = 'Tối ưu hóa hiệu quả hoạt động chung của công ty';
      const result = selector.selectSop(ambiguousIntent);

      expect(result.confidence).toBeLessThan(0.75);
      expect(result.requiresHumanClarification).toBe(true);
      expect(result.clarificationPrompt).toBeDefined();
      expect(result.clarificationPrompt).toContain('chưa chứa từ khóa phòng ban rõ ràng');
    });

    test('should incorporate department context to boost confidence above threshold', () => {
      const ambiguousIntent = 'Tối ưu hóa hiệu quả chi tiêu';
      const resultWithContext = selector.selectSop(ambiguousIntent, { department: 'Finance' });

      expect(resultWithContext.selectedSop.sopId).toBe('sop-finance-forecasting');
      expect(resultWithContext.confidence).toBeGreaterThanOrEqual(0.75);
      expect(resultWithContext.requiresHumanClarification).toBe(false);
    });
  });

  describe('3. Multi-Keyword & High Security Trace Benchmark', () => {
    test('should include HIGH_SECURITY governance trace for finance intents', () => {
      const financeIntent = 'Dự báo tài chính và thực thi chuyển tiền ngân sách';
      const result = selector.selectSop(financeIntent);

      expect(result.selectedSop.governancePolicy.strictness).toBe('HIGH_SECURITY');
      expect(result.reasons.some(r => r.includes('HIGH_SECURITY'))).toBe(true);
    });
  });
});
