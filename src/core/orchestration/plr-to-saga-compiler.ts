/**
 * BELLA EOS - PLR-to-Saga Compiler
 * Connects Operational Planning (PLR) to transactional Saga Execution (Workflow Engine).
 */

import { SagaStep } from './workflow-runtime';
import { OperationalPlan } from '@/types/operational-plan';

export class PLRToSagaCompiler {
  /**
   * Compiles an OperationalPlan dynamically into a sequential list of SagaSteps.
   */
  public static compile(
    plan: OperationalPlan,
    executionCallback?: (stepId: string, phase: 'ACTION' | 'COMPENSATE') => void
  ): SagaStep[] {
    const phases = plan.timelinePlan.phases;
    if (!phases || phases.length === 0) {
      throw new Error('[PLRToSagaCompiler] Cannot compile plan: timelinePlan has no phases.');
    }

    return phases.map((phase, index) => {
      const stepId = `phase-${index}-${phase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      // Resolve budget: check if there's an initiative budget matching the phase name
      let budgetVnd = 0;
      const matchingInitiative = plan.budgetPlan.byInitiative.find(init =>
        phase.name.toLowerCase().includes(init.name.toLowerCase()) ||
        init.name.toLowerCase().includes(phase.name.toLowerCase())
      );

      if (matchingInitiative) {
        budgetVnd = matchingInitiative.total;
      } else {
        // Fallback: split total budget equally among all phases
        budgetVnd = Math.round(plan.budgetPlan.total / phases.length);
      }

      return {
        stepId,
        budgetVnd,
        action: async () => {
          console.log(`[PLR-to-Saga Compiler] ⚡ Executing Phase [${phase.name}] with budget ${budgetVnd.toLocaleString('vi-VN')} VND`);
          
          // Execute milestones sequentially
          for (const m of phase.milestones) {
            console.log(`  └─ [Milestone] ${m.milestone} | Owner: ${m.owner} | Target Status: done`);
            m.status = 'done';
          }

          if (executionCallback) {
            executionCallback(stepId, 'ACTION');
          }
          return true;
        },
        compensate: async () => {
          console.warn(`[PLR-to-Saga Compiler] ↩️ Compensating Phase [${phase.name}]...`);
          
          // Revert milestone statuses
          for (const m of phase.milestones) {
            console.warn(`  └─ [Rollback] Reverting milestone: ${m.milestone}`);
            m.status = 'pending';
          }

          if (executionCallback) {
            executionCallback(stepId, 'COMPENSATE');
          }
        }
      };
    });
  }
}
