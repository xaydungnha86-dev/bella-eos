/**
 * Integration Tests: EIR + PLR + Adaptive DAG + Learning Loop
 * Bella EOS v3.1 - End-to-End Testing
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { EIRPLRIntegration } from '@/core/integration/eir-plr-integration';
import { StrategicLearningLoop } from '@/core/learning/strategic-learning-loop';
import { HumanApprovalGate } from '@/core/integration/human-approval-gate';
import { ObservedOutcome } from '@/types/strategic-learning';
import { ExecutiveContextBuilder, ContextProvider } from '@/core/eir/executive-layer/executive-context-builder';
import { DecisionFrontierEngine } from '@/core/eir/executive-layer/decision-frontier-engine';

describe('Bella EOS v3.5 - End-to-End Integration Tests', () => {
  let integration: EIRPLRIntegration;
  let learningLoop: StrategicLearningLoop;
  let approvalGate: HumanApprovalGate;

  beforeEach(() => {
    integration = new EIRPLRIntegration();
    learningLoop = new StrategicLearningLoop();
    approvalGate = new HumanApprovalGate();
  });

  describe('1. Full Cycle: CEO Intent → EIR → Approval → PLR', () => {
    test('should execute complete cycle successfully', async () => {
      const ceoIntent = 'Increase Q3 revenue by 30% through customer retention and upselling';

      const result = await integration.executeFullCycle(ceoIntent);

      // Verify goal clarification
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation.goal).toBeDefined();
      expect(result.recommendation.goal.howMuch).toContain('30%');
      expect(result.recommendation.goal.target).toBeGreaterThan(0);
      expect(result.recommendation.goal.constraints.length).toBeGreaterThan(0);

      // Verify EIR recommendation
      expect(result.recommendation.chosenStrategy).toBeDefined();
      expect(result.recommendation.chosenStrategy.name).toBeTruthy();
      expect(result.recommendation.chosenStrategy.expectedRevenue).toBeGreaterThan(0);
      expect(result.recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(result.recommendation.confidence).toBeLessThanOrEqual(1);

      // Verify approval
      expect(result.approval).toBeDefined();
      expect(result.approval.approved).toBe(true);

      // Verify operational plan (if approved)
      if (result.status === 'approved') {
        expect(result.operationalPlan).toBeDefined();
        expect(result.operationalPlan?.kpiTree).toBeDefined();
        expect(result.operationalPlan?.budgetPlan).toBeDefined();
        expect(result.operationalPlan?.timelinePlan).toBeDefined();
        expect(result.operationalPlan?.resourcePlan).toBeDefined();
        expect(result.operationalPlan?.ownershipMap).toBeDefined();
      }

      // Verify metrics
      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalDuration).toBeGreaterThan(0);
      expect(result.metrics.eirDuration).toBeGreaterThan(0);
    }, 60000); // 60s timeout

    test('should handle low-confidence recommendations with human review', async () => {
      const ceoIntent = 'Disrupt the market with a radical new product in 2 weeks with $1000 budget';

      const result = await integration.executeFullCycle(ceoIntent);

      expect(result.recommendation).toBeDefined();
      
      // This is an unrealistic goal, should have low confidence
      expect(result.recommendation.confidence).toBeLessThan(0.75);
      
      // Check if approval process flags it (it should not be auto-approved)
      expect(result.approval).toBeDefined();
      expect(result.status).toBe('rejected');
    }, 60000);
  });

  describe('2. EIR Only: Strategic Reasoning', () => {
    test('should generate strategic recommendation with all 7 graphs', async () => {
      const ceoIntent = 'Boost customer lifetime value by 25% in 6 months';

      const result = await integration.executeEIROnly(ceoIntent);

      expect(result.goal).toBeDefined();
      expect(result.diagnosis).toBeDefined();
      expect(result.constraints).toBeDefined();
      expect(result.chosenStrategy).toBeDefined();
      expect(result.simulationSummary).toBeDefined();
      expect(result.majorRisks).toBeDefined();

      // Verify diagnosis (5 Whys)
      expect(result.diagnosis.currentState).toBeTruthy();
      expect(result.diagnosis.rootCauses.length).toBeGreaterThan(0);

      // Verify constraints
      expect(result.constraints.budget).toBeDefined();

      // Verify opportunities
      expect(result.diagnosis.opportunities.length).toBeGreaterThanOrEqual(2);

      // Verify strategies
      expect(result.alternatives).toHaveLength(3);
      expect(result.alternatives.find(s => s.risk === 'low' || s.risk === 'medium' || s.risk === 'high')).toBeDefined();

      // Verify simulation
      expect(result.simulationSummary.scenarios).toHaveLength(3);
      expect(result.simulationSummary.scenarios.find(s => s.name === 'optimistic')).toBeDefined();
      expect(result.simulationSummary.scenarios.find(s => s.name === 'realistic')).toBeDefined();
      expect(result.simulationSummary.scenarios.find(s => s.name === 'pessimistic')).toBeDefined();

      // Verify risk assessment
      expect(result.majorRisks.length).toBeGreaterThan(0);
      expect(result.majorRisks[0].mitigation).toBeDefined();
    }, 60000);

    test('should converge within max iterations', async () => {
      const ceoIntent = 'Launch new product line with 50% market share in 3 months';

      const result = await integration.executeEIROnly(ceoIntent);

      expect(result.reasoningTrace).toBeDefined();
      expect(result.reasoningTrace.iterations).toBeLessThanOrEqual(5);
    }, 60000);
  });

  describe('3. PLR Only: Operational Planning', () => {
    test('should generate complete operational plan from recommendation', async () => {
      // First get a recommendation
      const eirResult = await integration.executeEIROnly(
        'Increase email open rates by 40% in next quarter'
      );

      // Then generate operational plan
      const plrResult = await integration.executePLROnly(eirResult);

      expect(plrResult).toBeDefined();
      expect(plrResult.kpiTree).toBeDefined();
      expect(plrResult.budgetPlan).toBeDefined();
      expect(plrResult.timelinePlan).toBeDefined();
      expect(plrResult.resourcePlan).toBeDefined();
      expect(plrResult.ownershipMap).toBeDefined();

      // Verify KPI tree
      expect(plrResult.kpiTree.primary).toBeDefined();
      expect(plrResult.kpiTree.leadingIndicators.length).toBeGreaterThan(0);

      // Verify budget
      expect(plrResult.budgetPlan.total).toBeGreaterThan(0);
      expect(plrResult.budgetPlan.byInitiative.length).toBeGreaterThan(0);
      expect(plrResult.budgetPlan.byWeek.length).toBeGreaterThan(0);
      expect(plrResult.budgetPlan.contingency.amount).toBeGreaterThan(0);

      // Verify timeline
      expect(plrResult.timelinePlan.duration).toBeTruthy();
      expect(plrResult.timelinePlan.phases.length).toBeGreaterThan(0);
      expect(plrResult.timelinePlan.phases[0].milestones.length).toBeGreaterThan(0);

      // Verify resources
      expect(plrResult.resourcePlan.workforce.byInitiative.length).toBeGreaterThan(0);

      // Verify ownership
      expect(plrResult.ownershipMap.byKPI.length).toBeGreaterThan(0);
    }, 60000);

    test('should detect resource conflicts', async () => {
      const eirResult = await integration.executeEIROnly(
        'Launch 5 campaigns simultaneously with 2 team members'
      );

      const plrResult = await integration.executePLROnly(eirResult);

      expect(plrResult.resourcePlan.workforce.conflicts).toBeDefined();
    }, 60000);
  });

  describe('4. Adaptive DAG: Failure Analysis & Retry', () => {
    test('should detect and handle wrong diagnosis symptom', async () => {
      // This intent should trigger multiple reasoning iterations
      const ceoIntent = 'Achieve impossible growth: 1000% revenue in 1 day with $10 budget';

      const result = await integration.executeEIROnly(ceoIntent);

      expect(result.reasoningTrace.iterations).toBeGreaterThan(1);
    }, 60000);

    test('should respect max retry limits per node', async () => {
      const ceoIntent = 'Contradictory goal: minimize costs while maximizing spend';

      const result = await integration.executeEIROnly(ceoIntent);

      // Should not exceed max iterations (5)
      expect(result.reasoningTrace.iterations).toBeLessThanOrEqual(5);
    }, 60000);
  });

  describe('5. Human Approval Gate', () => {
    test('should auto-approve high-confidence recommendations', async () => {
      const eirResult = await integration.executeEIROnly(
        'Improve customer satisfaction score by 15% through better support'
      );

      const approval = await approvalGate.submitForApproval(eirResult);

      if (eirResult.confidence >= 0.75) {
        expect(approval.approved).toBe(true);
      }
    });

    test('should format recommendation for human review', async () => {
      const eirResult = await integration.executeEIROnly(
        'Expand to new market segment'
      );

      const markdown = approvalGate.formatForReview(eirResult);

      expect(markdown).toContain('# Executive Recommendation');
      expect(markdown).toContain('## Goal');
      expect(markdown).toContain('## Recommended Strategy');
      expect(markdown).toContain('## Simulation Results');
      expect(markdown).toContain('## Major Risks');
    });

    test('should apply CEO modifications', async () => {
      const eirResult = await integration.executeEIROnly(
        'Launch email campaign'
      );

      const modifications = [
        {
          field: 'budget',
          oldValue: eirResult.chosenStrategy.budget,
          newValue: eirResult.chosenStrategy.budget * 0.5,
          reason: 'Budget cut'
        }
      ];

      const modified = approvalGate.applyModifications(
        eirResult,
        modifications
      );

      expect(modified.chosenStrategy.budget).toBeLessThan(eirResult.chosenStrategy.budget);
    });
  });

  describe('6. Strategic Learning Feedback Loop', () => {
    test('should process campaign outcome and extract lessons', async () => {
      const eirResult = await integration.executeEIROnly('Improve customer retention');
      
      const outcome: ObservedOutcome = {
        campaignId: 'test-campaign-001',
        timestamp: new Date().toISOString(),
        actualRevenue: 120000,
        actualMetrics: {
          revenue: 120000,
          customerRetention: 0.80,
          acquisitionCost: 45,
          conversionRate: 0.06,
          engagementRate: 0.35,
        }
      };

      const result = await learningLoop.processCampaignOutcome(eirResult, outcome);

      expect(result.variance).toBeDefined();
      expect(result.lessons.length).toBeGreaterThan(0);
      expect(result.confidenceAdjustment).toBeDefined();

      // Should extract success lessons
      const successLessons = result.lessons.filter(l => l.type === 'success');
      expect(successLessons.length).toBeGreaterThan(0);
    });

    test('should apply confidence adjustments for future planning', async () => {
      const eirResult = await integration.executeEIROnly('Improve customer retention');

      const outcome: ObservedOutcome = {
        campaignId: 'test-campaign-002',
        timestamp: new Date().toISOString(),
        actualRevenue: eirResult.chosenStrategy.expectedRevenue * 0.6,
        actualMetrics: {
          revenue: eirResult.chosenStrategy.expectedRevenue * 0.6,
          customerRetention: 0.55,
          acquisitionCost: 85,
          conversionRate: 0.02,
          engagementRate: 0.15,
        }
      };

      const result = await learningLoop.processCampaignOutcome(eirResult, outcome);

      expect(result.confidenceAdjustment).toBeDefined();
      
      // Should extract failure lessons
      const failureLessons = result.lessons.filter(l => l.type === 'failure');
      expect(failureLessons.length).toBeGreaterThan(0);
    });

    test('should generate learning report', async () => {
      const report = learningLoop.generateReport();

      expect(report).toBeDefined();
      expect(report.totalLessons).toBeGreaterThanOrEqual(0);
      expect(report.topCategories).toBeDefined();
      expect(report.confidences).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('7. Validation & Error Handling', () => {
    test('should reject invalid CEO intent', async () => {
      const result = await integration.executeFullCycle('');
      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    });

    test('should handle budget constraint violations gracefully', async () => {
      const ceoIntent = 'Build enterprise platform in 1 week with $100 budget';

      const result = await integration.executeFullCycle(ceoIntent);

      expect(result.recommendation).toBeDefined();
      // Should identify budget as a major constraint
      const budgetConstraint = result.recommendation.constraints.budget;
      expect(budgetConstraint).toBeDefined();
      expect(budgetConstraint.status).toBe('blocking');
    }, 60000);

    test('should handle timeline conflicts', async () => {
      const eirResult = await integration.executeEIROnly(
        'Complete 6-month project in 1 day'
      );

      expect(eirResult.constraints).toBeDefined();
      // Should flag timeline as critical constraint
      const timelineConstraint = eirResult.constraints.timeline;
      expect(timelineConstraint).toBeDefined();
      expect(timelineConstraint.status).toBe('blocking');
    }, 60000);
  });

  describe('8. API Route Integration', () => {
    test('should return metrics for monitoring', async () => {
      const result = await integration.executeFullCycle(
        'Optimize conversion funnel'
      );

      expect(result.metrics).toBeDefined();
      expect(result.metrics.eirDuration).toBeGreaterThan(0);
      expect(result.metrics.totalDuration).toBeGreaterThan(0);
      expect(result.metrics.totalDuration).toBeGreaterThanOrEqual(result.metrics.eirDuration);
    }, 60000);
  });

  describe('9. E-COS Stage 3 - C-Level Interaction Layer (ADR-0012)', () => {
    test('should trigger negotiation for impossible goal targets', async () => {
      const result = await integration.executeFullCycle(
        'Increase Q3 revenue by 50% through high-risk aggressive marketing'
      );
      expect(result.session).toBeDefined();
      expect(result.session?.agreedGoal).toBeDefined();
      expect(result.session?.agreedGoal?.howMuch).toContain('35%');
      expect(result.session?.negotiationLog.length).toBeGreaterThan(0);
      expect(result.session?.decisionTrace?.steps.length).toBeGreaterThan(0);
    }, 60000);

    test('should approve feasible goals immediately on a healthy company', async () => {
      const result = await integration.executeFullCycle(
        'Increase revenue by 20%'
      );
      expect(result.session).toBeDefined();
      expect(result.session?.agreedGoal?.howMuch).toContain('20%');
      expect(result.session?.approvalState.status).toBe('approved');
    }, 60000);

    test('should cache computed decision frontiers for identical context and goal targets', async () => {
      const builder = new ExecutiveContextBuilder();
      const context = await builder.buildContext('Increase revenue by 30%');
      const goal = {
        what: 'Increase revenue',
        howMuch: '30%',
        by: '4 weeks',
        baseline: 5000,
        target: 6500,
        constraints: [],
        urgency: 'high' as const
      };
      
      const engine = new DecisionFrontierEngine();
      
      const frontier1 = await engine.computeFrontier(goal, context);
      expect(frontier1.length).toBe(3);
      
      const frontier2 = await engine.computeFrontier(goal, context);
      expect(frontier2).toBe(frontier1);
    });

    test('should build degraded context on provider failure without crashing', async () => {
      const failingProvider: ContextProvider = {
        name: 'FailingProvider',
        collect: async () => {
          throw new Error('Database connection timeout');
        }
      };
      
      const builder = new ExecutiveContextBuilder([failingProvider]);
      const context = await builder.buildContext('Increase revenue by 30%');
      
      expect(context.status).toBe('degraded');
      expect(context.currentRevenue).toBe(5000);
    });
  });
});
