import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { OutcomeContractFactory } from '../../src/core/governance/outcome-contract';
import { OutcomeAttributionEngine } from '../../src/core/governance/outcome-attribution-engine';
import { AdaptiveAutonomyEngine } from '../../src/core/governance/adaptive-autonomy-engine';
import { AuditExplorer } from '../../src/core/governance/audit-explorer';
import { WorkflowRuntime, InMemoryWorkflowStore } from '../../src/core/orchestration/workflow-runtime';
import { DeclarativeSOP } from '../../src/core/orchestration/sop-engine';

describe('Bella EOS: Phase 8 Business Outcome Validation & Production Pilot', () => {
  beforeEach(() => {
    WorkflowRuntime.resetInstance();
    AuditExplorer.resetInstance();
  });

  describe('1. Business Outcome Contract & Mathematically Precise Metrics Across 4 Domains', () => {
    test('should calculate exact absolute, relative, and target gap metrics for Customer Retention SOP', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-customer-retention',
        '3.0.0',
        'Giữ chân nhóm khách hàng VIP có nguy cơ rời bỏ',
        'VIP Customer Repeat Rate',
        '%',
        'HIGHER_IS_BETTER',
        61,
        70,
        72.4,
        'CRM Systems Database'
      );

      expect(contract.metrics).toBeDefined();
      expect(contract.metrics?.isTargetAchieved).toBe(true);
      expect(contract.metrics?.status).toBe('EXCEEDED');
      // Absolute improvement: 72.4 - 61 = 11.4 percentage points
      expect(contract.metrics?.absoluteVariance).toBe(11.4);
      // Relative improvement: (72.4 - 61) / 61 * 100 = +18.69%
      expect(contract.metrics?.relativeImprovementPercent).toBe(18.69);
      // Target overachievement gap: 72.4 - 70 = +2.4 percentage points
      expect(contract.metrics?.targetGapPercentagePoints).toBe(2.4);

      // Audit-ready metadata fields
      expect(contract.dataSource).toBe('CRM Systems Database');
      expect(contract.measurementWindow).toBeDefined();
      expect(contract.evidence?.query).toContain('CRM Systems Database');
    });

    test('should calculate exact metrics for Finance Forecasting SOP (Lower is Better Direction)', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-finance-forecasting',
        '3.0.0',
        'Phân tích dự báo dòng tiền và cân đối ngân sách',
        'Cashflow Forecast Error Rate',
        '%',
        'LOWER_IS_BETTER',
        8.2,
        3.0,
        2.1,
        'MISA Accounting DB'
      );

      expect(contract.metrics).toBeDefined();
      expect(contract.metrics?.isTargetAchieved).toBe(true);
      expect(contract.metrics?.status).toBe('EXCEEDED');
      // Absolute reduction: 2.1 - 8.2 = -6.1 percentage points
      expect(contract.metrics?.absoluteVariance).toBe(-6.1);
      // Relative reduction vs baseline: (2.1 - 8.2) / 8.2 * 100 = -74.39%
      expect(contract.metrics?.relativeImprovementPercent).toBe(-74.39);
      // Target overachievement gap (direction aware): 3.0 - 2.1 = 0.9 percentage points better than target
      expect(contract.metrics?.targetGapPercentagePoints).toBe(0.9);
    });

    test('should calculate exact metrics for HR Recruitment SOP (Lower is Better Duration)', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-hr-recruitment',
        '2.0.0',
        'Tuyển dụng vị trí lãnh đạo phòng kinh doanh',
        'Time-to-Hire',
        'days',
        'LOWER_IS_BETTER',
        45,
        40,
        38,
        'HRIS Database'
      );

      expect(contract.metrics).toBeDefined();
      expect(contract.metrics?.isTargetAchieved).toBe(true);
      expect(contract.metrics?.status).toBe('EXCEEDED');
      // Absolute reduction: 38 - 45 = -7 days
      expect(contract.metrics?.absoluteVariance).toBe(-7);
      // Relative reduction vs baseline: (38 - 45) / 45 * 100 = -15.56%
      expect(contract.metrics?.relativeImprovementPercent).toBe(-15.56);
      // Target overachievement gap: 40 - 38 = 2 days faster than target
      expect(contract.metrics?.targetGapPercentagePoints).toBe(2);
    });

    test('should calculate exact metrics for Spa Marketing SOP', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-spa-marketing',
        '1.5.0',
        'Tăng trưởng số lượng lead chất lượng cao cho Spa',
        'Weekly Qualified Leads',
        'leads',
        'HIGHER_IS_BETTER',
        100,
        120,
        123,
        'Booking System DB'
      );

      expect(contract.metrics).toBeDefined();
      expect(contract.metrics?.isTargetAchieved).toBe(true);
      expect(contract.metrics?.status).toBe('EXCEEDED');
      expect(contract.metrics?.absoluteVariance).toBe(23);
      expect(contract.metrics?.relativeImprovementPercent).toBe(23);
      expect(contract.metrics?.targetGapPercentagePoints).toBe(3);
    });
  });

  describe('2. Outcome Attribution Model Engine', () => {
    test('should assign DIRECT_CAUSATION (Confidence >= 90%) for 100% completed workflow with tight budget control', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-customer-retention',
        '3.0.0',
        'Giữ chân VIP',
        'Repeat Rate',
        '%',
        'HIGHER_IS_BETTER',
        61,
        70,
        72.4
      );

      const attribution = OutcomeAttributionEngine.analyze(contract, true, 1.0, 1.8);

      expect(attribution.attributionConfidence).toBeGreaterThanOrEqual(90);
      expect(attribution.attributionType).toBe('DIRECT_CAUSATION');
      expect(attribution.reasoning.length).toBeGreaterThan(0);
    });

    test('should assign UNATTRIBUTED for incomplete workflow (< 80% completion rate)', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-finance-forecasting',
        '3.0.0',
        'Dự báo dòng tiền',
        'Error Rate',
        '%',
        'LOWER_IS_BETTER',
        8.2,
        3.0,
        2.1
      );

      const attribution = OutcomeAttributionEngine.analyze(contract, false, 0.5, 2.0);

      expect(attribution.attributionType).toBe('UNATTRIBUTED');
      expect(attribution.attributionConfidence).toBeLessThan(50);
    });
  });

  describe('3. C-Suite Outcome Dashboard Primitive Integration & Latency Separation', () => {
    test('should generate full Audit Record separating workflow duration from active execution latency & approval wait time', async () => {
      const memoryStore = new InMemoryWorkflowStore();
      const runtime = WorkflowRuntime.getInstance(memoryStore);
      const workflowId = 'wf-outcome-audit-001';

      await memoryStore.saveState({
        workflowId,
        name: 'Triển khai giữ chân VIP',
        status: 'SUCCESS',
        currentStepId: 'step-3',
        steps: [
          { stepId: 'step-1', status: 'SUCCESS' },
          { stepId: 'step-2', status: 'SUCCESS' },
          { stepId: 'step-3', status: 'SUCCESS' }
        ],
        startedAt: Date.now() - 3600000, // 1 hour ago
        completedAt: Date.now(),
        version: 3,
        sopId: 'sop-customer-retention',
        sopVersion: '3.0.0',
        traceId: 'trace-outcome-888'
      });

      const contract = OutcomeContractFactory.createContract(
        'sop-customer-retention',
        '3.0.0',
        'Giữ chân nhóm khách hàng VIP',
        'VIP Customer Repeat Rate',
        '%',
        'HIGHER_IS_BETTER',
        61,
        70,
        72.4,
        'CRM Systems DB'
      );

      const auditRecord = await AuditExplorer.getInstance().getAuditRecord(workflowId, undefined, contract);

      expect(auditRecord).not.toBeNull();
      expect(auditRecord?.execution.workflowDurationMs).toBeGreaterThanOrEqual(3600000);
      expect(auditRecord?.execution.activeExecutionLatencyMs).toBeDefined();
      expect(auditRecord?.execution.humanApprovalWaitMs).toBeDefined();

      // Verify Business Outcome Metrics
      expect(auditRecord?.businessOutcome).toBeDefined();
      expect(auditRecord?.businessOutcome?.absoluteVariance).toBe(11.4);
      expect(auditRecord?.businessOutcome?.relativeImprovementPercent).toBe(18.69);
      expect(auditRecord?.businessOutcome?.targetGapPercentagePoints).toBe(2.4);
      expect(auditRecord?.businessOutcome?.dataSource).toBe('CRM Systems DB');
      expect(auditRecord?.businessOutcome?.evidence?.reportId).toBeDefined();
    });
  });

  describe('4. Adaptive Autonomy Engine Matrix', () => {
    test('should enforce MULTI_APPROVAL for HIGH risk Finance SOP with HIGH_SECURITY tag', () => {
      const mockFinanceSop: DeclarativeSOP = {
        id: 'sop-finance-forecasting',
        version: '3.0.0',
        name: 'Phân tích dự báo dòng tiền',
        category: 'Finance',
        department: 'Finance & Accounting',
        description: 'Forecasting cashflow',
        approvalPolicy: {
          requiresCEOApproval: true,
          requiredRoles: ['CFO', 'CEO']
        },
        securityPolicy: {
          securityTag: 'HIGH_SECURITY',
          auditLevel: 'DETAILED'
        },
        steps: []
      };

      const engine = new AdaptiveAutonomyEngine();
      const result = engine.evaluate(mockFinanceSop, 0.92, 600000000);

      expect(result.riskLevel).toBe('HIGH');
      expect(result.autonomyMode).toBe('MULTI_APPROVAL');
      expect(result.isAutonomousAllowed).toBe(false);
      expect(result.requiredApprovers).toContain('CFO');
      expect(result.requiredApprovers).toContain('CEO');
    });
  });
});
