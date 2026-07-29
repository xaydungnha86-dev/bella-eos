import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { SopSelector } from '../../src/core/orchestration/sop-selector';
import { EIRPLRIntegration } from '../../src/core/integration/eir-plr-integration';
import { WorkflowEventStreamer, WorkflowStreamEvent } from '../../src/core/orchestration/workflow-event-streamer';
import { SopMetricsStore } from '../../src/core/orchestration/sop-metrics-store';
import { WorkflowRuntime } from '../../src/core/orchestration/workflow-runtime';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Bella EOS: Phase 5 Multi-Domain Executable SOP Engine Tests', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    WorkflowRuntime.resetInstance();
    WorkflowEventStreamer.resetInstance();
    SopMetricsStore.resetInstance();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.restoreAllMocks();
  });

  describe('1. Deterministic & Explainable SOP Selection', () => {
    const selector = new SopSelector();

    test('should match HR Recruitment intent to sop-hr-recruitment with reasoning', () => {
      const intent = 'Cần tuyển dụng khẩn cấp 5 nhân sự cao cấp bộ phận kinh doanh';
      const result = selector.selectSop(intent);

      expect(result.selectedSop.sopId).toBe('sop-hr-recruitment');
      expect(result.confidence).toBeGreaterThanOrEqual(0.75);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.matchedKeywords).toContain('tuyển dụng');
    });

    test('should match Finance Forecasting intent to sop-finance-forecasting with HIGH_SECURITY policy trace', () => {
      const intent = 'Dự báo tài chính dòng tiền Q3 và đề xuất điều chuyển ngân sách';
      const result = selector.selectSop(intent);

      expect(result.selectedSop.sopId).toBe('sop-finance-forecasting');
      expect(result.selectedSop.governancePolicy.strictness).toBe('HIGH_SECURITY');
      expect(result.reasons.some(r => r.includes('HIGH_SECURITY'))).toBe(true);
    });

    test('should match VIP Customer Retention intent to sop-customer-retention', () => {
      const intent = 'Giảm 15% tỷ lệ rời bỏ của nhóm khách hàng VIP trong 60 ngày';
      const result = selector.selectSop(intent);

      expect(result.selectedSop.sopId).toBe('sop-customer-retention');
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
    });
  });

  describe('2. Multi-Domain End-to-End Cycle Execution', () => {
    const integration = new EIRPLRIntegration();

    test('should execute HR Recruitment flow through single generic engine', async () => {
      const intent = 'Bổ sung nhân sự phòng kinh doanh trong 30 ngày';
      const result = await integration.executeFullCycle(intent);

      expect(result.status).toBe('approved');
      expect(result.sopSelection?.selectedSop.sopId).toBe('sop-hr-recruitment');
      expect(result.executionSuccess).toBe(true);
    }, 30000);

    test('should execute Finance Cashflow flow through single generic engine', async () => {
      const intent = 'Lập dự báo dòng tiền và cân đối tài chính cho công ty';
      const result = await integration.executeFullCycle(intent);

      expect(result.status).toBe('approved');
      expect(result.sopSelection?.selectedSop.sopId).toBe('sop-finance-forecasting');
      expect(result.executionSuccess).toBe(true);
    }, 30000);
  });

  describe('3. Real-Time SSE Execution Event Streamer', () => {
    test('should emit workflow lifecycle events during Saga transaction', async () => {
      const emittedEvents: WorkflowStreamEvent[] = [];
      WorkflowEventStreamer.getInstance().on('workflow-event', (evt) => {
        emittedEvents.push(evt);
      });

      const integration = new EIRPLRIntegration();
      const intent = 'Tăng cường chăm sóc khách hàng VIP để giữ chân khách';
      await integration.executeFullCycle(intent);

      expect(emittedEvents.length).toBeGreaterThan(0);

      const eventTypes = emittedEvents.map(e => e.type);
      expect(eventTypes).toContain('WORKFLOW_STARTED');
      expect(eventTypes).toContain('STEP_STARTED');
      expect(eventTypes).toContain('STEP_COMPLETED');
      expect(eventTypes).toContain('WORKFLOW_COMPLETED');
    }, 30000);
  });

  describe('4. Operational Intelligence & SOP Metrics Store', () => {
    test('should record and aggregate execution metrics per SOP', async () => {
      const integration = new EIRPLRIntegration();
      const intent = 'Giảm tỷ lệ rời bỏ khách hàng VIP';

      await integration.executeFullCycle(intent);

      const metrics = SopMetricsStore.getInstance().getMetricsForSop('sop-customer-retention');
      expect(metrics).toBeDefined();
      expect(metrics?.executionCount).toBe(1);
      expect(metrics?.successCount).toBe(1);
      expect(metrics?.successRate).toBe(100);
      expect(metrics?.avgDurationMs).toBeGreaterThan(0);
    }, 30000);
  });
});
