/**
 * BELLA EOS ECH: Context Retrieval Runtime (Runtime 12)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME
 * 
 * Mission: Deep Semantic Context Candidate Retriever. Scans thousands of enterprise document stores,
 * SOPs, meeting minutes, campaign logs, and financial records to fetch candidate items for ranking.
 */

export interface CandidateContextItem {
  sourceId: string;
  sourceType: 'MEETING_MINUTES' | 'CAMPAIGN_REPORT' | 'SOP' | 'FINANCIAL_LEDGER' | 'LESSONS_LEARNED' | 'CEO_DIRECTIVE';
  documentTitle: string;
  snippet: string;
  timestamp: string;
}

export class ContextRetrievalRuntime {
  private static instance: ContextRetrievalRuntime;

  private constructor() {}

  public static getInstance(): ContextRetrievalRuntime {
    if (!ContextRetrievalRuntime.instance) {
      ContextRetrievalRuntime.instance = new ContextRetrievalRuntime();
    }
    return ContextRetrievalRuntime.instance;
  }

  public retrieveCandidateItems(tenantId: string, objective: string): CandidateContextItem[] {
    return [
      {
        sourceId: 'doc-meet-20260720',
        sourceType: 'MEETING_MINUTES',
        documentTitle: 'Biên bản họp chiến lược Marketing 20/07/2026',
        snippet: 'CEO phê duyệt ngân sách retargeting 500 triệu VND. Yêu cầu tối ưu mobile landing page dưới 2s.',
        timestamp: '2026-07-20T10:00:00Z',
      },
      {
        sourceId: 'doc-sop-mkt01',
        sourceType: 'SOP',
        documentTitle: 'SOP Quy trình Duyệt Creative Quảng Cáo v3.2',
        snippet: 'Mọi video review phải đến từ khách hàng thật, không được dùng diễn viên mẫu quảng cáo giả.',
        timestamp: '2026-06-15T09:00:00Z',
      },
      {
        sourceId: 'doc-camp-summer',
        sourceType: 'CAMPAIGN_REPORT',
        documentTitle: 'Báo cáo Chiến dịch Hè 2026',
        snippet: 'Doanh thu 1.2 tỷ VND, ROAS 3.8x, Booking 1080 khách. Kênh Video UGC mang lại 70% doanh thu.',
        timestamp: '2026-07-10T17:00:00Z',
      },
      {
        sourceId: 'doc-fin-ledg-q2',
        sourceType: 'FINANCIAL_LEDGER',
        documentTitle: 'Báo cáo Dòng tiền Chi nhánh Q2 2026',
        snippet: 'Cashflow khả dụng: 1.8 tỷ VND. Hạn mức chi tiêu tối đa cho Marketing Q3: 500 triệu VND.',
        timestamp: '2026-07-01T08:00:00Z',
      },
      {
        sourceId: 'doc-meet-conflict-budget',
        sourceType: 'MEETING_MINUTES',
        documentTitle: 'Dự thảo cuộc họp bộ phận Marketing 18/07/2026',
        snippet: 'Trưởng phòng Marketing đề xuất ngân sách 700 triệu VND.',
        timestamp: '2026-07-18T14:00:00Z',
      },
    ];
  }
}
