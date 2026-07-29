import { ProductionPilotLedger } from '../../src/core/governance/production-pilot-ledger';
import { OutcomeAttributionEngine } from '../../src/core/governance/outcome-attribution-engine';
import { OutcomeContractFactory } from '../../src/core/governance/outcome-contract';
import { LearningPolicyEvaluator } from '../../src/core/governance/learning-policy';

describe('Bella EOS: Phase 8.5 Production Pilot Validation Suite', () => {
  beforeEach(() => {
    ProductionPilotLedger.resetInstance();
  });

  describe('1. C-Suite UI Policy-Based Attribution Wording Standard', () => {
    test('should render "Direct Attribution — policy-based" for high confidence attribution', () => {
      const contract = OutcomeContractFactory.createContract(
        'sop-customer-retention',
        '3.0.0',
        'VIP Customer Retention Pilot',
        'VIP Repeat Rate',
        '%',
        'HIGHER_IS_BETTER',
        61,
        70,
        72.4,
        'CRM Systems DB'
      );

      const attribution = OutcomeAttributionEngine.analyze(contract, true, 1.0, 1.8);

      expect(attribution.attributionType).toBe('DIRECT_CAUSATION');
      expect(attribution.displayWording).toBe('Direct Attribution — policy-based');
      expect(attribution.displayWording).not.toBe('Proven causal relationship');
    });
  });

  describe('2. Production Pilot Ledger & Before/After Baseline Tracking Across 4 Domains', () => {
    test('should log Customer Retention Pilot with Before (61%) and After (72.4%) Actuals', () => {
      const ledger = ProductionPilotLedger.getInstance();

      const record = ledger.createPilotRecord(
        'Customer Retention',
        'wf-pilot-ret-001',
        'sop-customer-retention',
        '3.0.0',
        'VIP Customer Repeat Rate',
        '%',
        'HIGHER_IS_BETTER',
        61.0,
        70.0,
        72.4,
        'CRM Production DB',
        3600000
      );

      expect(record.pilotId).toContain('PILOT-CUS');
      expect(record.prePilotBaseline).toBe(61.0);
      expect(record.target).toBe(70.0);
      expect(record.postPilotActual).toBe(72.4);
      expect(record.absoluteVariance).toBe(11.4);
      expect(record.relativeImprovementPercent).toBe(18.69);
      expect(record.targetGapPercentagePoints).toBe(2.4);

      expect(record.displayWording).toBe('Direct Attribution — policy-based');
      expect(record.dataSource).toBe('CRM Production DB');
      expect(record.evidence.reportId).toBeDefined();
    });

    test('should log Finance Cashflow Pilot (Lower is Better Error Rate)', () => {
      const ledger = ProductionPilotLedger.getInstance();

      const record = ledger.createPilotRecord(
        'Finance',
        'wf-pilot-fin-002',
        'sop-finance-forecasting',
        '3.0.0',
        'Cashflow Forecast Error Rate',
        '%',
        'LOWER_IS_BETTER',
        8.2,
        3.0,
        2.1,
        'MISA Accounting DB',
        7200000
      );

      expect(record.prePilotBaseline).toBe(8.2);
      expect(record.target).toBe(3.0);
      expect(record.postPilotActual).toBe(2.1);
      expect(record.absoluteVariance).toBe(-6.1);
      expect(record.relativeImprovementPercent).toBe(-74.39);
      expect(record.targetGapPercentagePoints).toBe(0.9);

      // Latency Separation Check
      expect(record.executionMetrics.workflowDurationMs).toBe(7200000);
      expect(record.executionMetrics.humanApprovalWaitMs).toBe(6120000); // 85% wait
      expect(record.executionMetrics.activeExecutionLatencyMs).toBe(1080000);
    });

    test('should log HR Recruitment Pilot (Lower is Better Duration)', () => {
      const ledger = ProductionPilotLedger.getInstance();

      const record = ledger.createPilotRecord(
        'HR',
        'wf-pilot-hr-003',
        'sop-hr-recruitment',
        '2.0.0',
        'Time-to-Hire',
        'days',
        'LOWER_IS_BETTER',
        45,
        40,
        38,
        'HRIS Database'
      );

      expect(record.prePilotBaseline).toBe(45);
      expect(record.postPilotActual).toBe(38);
      expect(record.absoluteVariance).toBe(-7);
      expect(record.targetGapPercentagePoints).toBe(2);
    });

    test('should log Spa Marketing Lead Generation Pilot', () => {
      const ledger = ProductionPilotLedger.getInstance();

      const record = ledger.createPilotRecord(
        'Marketing',
        'wf-pilot-mkt-004',
        'sop-spa-marketing',
        '1.5.0',
        'Weekly Qualified Leads',
        'leads',
        'HIGHER_IS_BETTER',
        100,
        120,
        123,
        'Booking System DB'
      );

      expect(record.prePilotBaseline).toBe(100);
      expect(record.postPilotActual).toBe(123);
      expect(record.absoluteVariance).toBe(23);
      expect(record.targetGapPercentagePoints).toBe(3);
    });
  });

  describe('3. Governed Learning Phase 9 Gate & Evidence Quality Policy', () => {
    test('should block learning (OBSERVE_ONLY) if evidence quality is SYNTHETIC or SIMULATED', () => {
      const statusSynthetic = LearningPolicyEvaluator.evaluateCandidateStatus(100, 'SYNTHETIC', 95);
      expect(statusSynthetic).toBe('OBSERVE_ONLY');

      const statusSimulated = LearningPolicyEvaluator.evaluateCandidateStatus(100, 'SIMULATED', 95);
      expect(statusSimulated).toBe('OBSERVE_ONLY');
    });

    test('should require minimum execution threshold and PRODUCTION_VALIDATED quality for human review eligibility', () => {
      const lowCount = LearningPolicyEvaluator.evaluateCandidateStatus(8, 'PRODUCTION_VALIDATED', 95);
      expect(lowCount).toBe('OBSERVE_ONLY');

      const candidate = LearningPolicyEvaluator.evaluateCandidateStatus(15, 'PRODUCTION_OBSERVED', 80);
      expect(candidate).toBe('PATTERN_CANDIDATE');

      const proposal = LearningPolicyEvaluator.evaluateCandidateStatus(30, 'PRODUCTION_REPEATED', 85);
      expect(proposal).toBe('IMPROVEMENT_PROPOSAL');

      const humanReviewEligible = LearningPolicyEvaluator.evaluateCandidateStatus(60, 'PRODUCTION_VALIDATED', 95);
      expect(humanReviewEligible).toBe('ELIGIBLE_FOR_HUMAN_REVIEW');
    });
  });

  describe('4. Supabase Production Schema Invariants Verification', () => {
    test('should enforce tenant isolation and keep postPilotActual null while RUNNING', () => {
      const ledger = ProductionPilotLedger.getInstance();

      const runningRecord = ledger.createPilotRecord(
        'Customer Retention',
        'wf-running-001',
        'sop-customer-retention',
        '3.0.0',
        'Repeat Customer Rate',
        '%',
        'HIGHER_IS_BETTER',
        61.0,
        70.0,
        null, // postPilotActual is NULL during execution
        'CRM Production DB',
        3600000,
        'tenant-acme-corp' // Tenant ID
      );

      expect(runningRecord.tenantId).toBe('tenant-acme-corp');
      expect(runningRecord.pilotStatus).toBe('RUNNING');
      expect(runningRecord.postPilotActual).toBeNull();
      expect(runningRecord.absoluteVariance).toBeNull();
      expect(runningRecord.relativeImprovementPercent).toBeNull();

      // Finalize actual measurement after measurement window
      const finalized = ledger.finalizePilotActual(runningRecord.pilotId, 72.4);

      expect(finalized).toBeDefined();
      expect(finalized?.pilotStatus).toBe('COMPLETED');
      expect(finalized?.postPilotActual).toBe(72.4);
      expect(finalized?.absoluteVariance).toBe(11.4);
      expect(finalized?.displayWording).toBe('Direct Attribution — policy-based');

      // Tenant isolation filtering
      const acmeRecords = ledger.getAllRecords('tenant-acme-corp');
      expect(acmeRecords.length).toBe(1);

      const otherTenantRecords = ledger.getAllRecords('tenant-other-corp');
      expect(otherTenantRecords.length).toBe(0);
    });
  });
});
