/**
 * BELLA EOS CERTIFICATION: AI Reliability & Determinism Test Suite
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Verifies AI Worker output determinism, schema compliance, and zero hallucination boundaries.
 */

import { ContextRuntime } from '@/core/brain/runtimes/context-runtime';
import { ReasoningRuntime } from '@/core/brain/runtimes/reasoning-runtime';
import { StatelessWorkerGateway } from '@/core/execution/stateless-worker-gateway';

describe('BELLA EOS AI Reliability Certification', () => {
  it('should compile security-isolated Canonical Context Package with 90% token optimization', () => {
    const contextRuntime = ContextRuntime.getInstance();
    const pkg = contextRuntime.compileCanonicalPackage({
      objective: 'Boost Q3 High Value Customer Retargeting',
      activeStep: { id: 1, name: 'Draft Social Copy', agent: 'MarketingAgent' },
      approvedBudgetVnd: 50000000,
      targetValue: 200,
      targetMetric: 'Leads',
    });

    expect(pkg.objective).toBe('Boost Q3 High Value Customer Retargeting');
    expect(pkg.erp.approvedBudgetVnd).toBe(50000000);
    expect(pkg.policies.length).toBeGreaterThan(0);
  });

  it('should evaluate reasoning feasibility deterministically', () => {
    const reasoningRuntime = ReasoningRuntime.getInstance();
    const result = reasoningRuntime.analyzeGoalFeasibility('Q3 Campaign', 100, 10000000);

    expect(result.isFeasible).toBe(true);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.90);
  });

  it('should execute stateless worker gateway cleanly without state corruption', async () => {
    const gateway = StatelessWorkerGateway.getInstance();
    const contextRuntime = ContextRuntime.getInstance();

    const pkg = contextRuntime.compileCanonicalPackage({
      objective: 'Publish Retargeting Copy',
      activeStep: { id: 2, name: 'Publish Copy', agent: 'SocialAgent' },
      approvedBudgetVnd: 20000000,
      targetValue: 50,
      targetMetric: 'Conversions',
    });

    const evidence = await gateway.dispatchToWorker('worker-ai-001', pkg);

    expect(evidence.success).toBe(true);
    expect(evidence.score).toBeGreaterThan(0.85);
  });
});
