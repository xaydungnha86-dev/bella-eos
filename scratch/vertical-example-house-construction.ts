/**
 * BELLA EOS VERTICAL DEVELOPMENT DEMO: House Construction Vertical Pack
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * This script demonstrates how a vertical domain (xaydungnha86-dev - House Construction)
 * consumes ECOS Core L2 platform capabilities (Planning, Scheduler, Plugin Registry, Saga Workflow)
 * while maintaining absolute platform neutrality in ECOS Core.
 * 
 * Run: npx tsx scratch/vertical-example-house-construction.ts
 */

import { PluginRegistry } from '../src/core/plugin-sdk/plugin-registry';
import { WorkflowRuntime, SagaStep } from '../src/core/orchestration/workflow-runtime';
import { PlanningEngine } from '../src/core/orchestration/planning-engine';
import { IExtensionPlugin } from '../src/core/plugin-sdk/plugin-interface';
import { Goal } from '../src/types/planner';

// Helper for formatted outputs
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`\n${CYAN}================================================================${RESET}`);
console.log(`${CYAN}    BELLA EOS VERTICAL: HOUSE CONSTRUCTION DOMAIN RUNTIME       ${RESET}`);
console.log(`${CYAN}================================================================${RESET}\n`);

// ─────────────────────────────────────────────
// 1. Defining Industry-Specific Construction Plugins
// ─────────────────────────────────────────────

const foundationContractorPlugin: IExtensionPlugin = {
  metadata: {
    pluginId: 'plg-civil-foundation-co',
    pluginName: 'Civil Engineering Foundation Contractor',
    version: '1.0.0',
    author: 'VinaBuild Civil',
    description: 'Handles excavation, piling, and reinforced concrete foundation work.',
    pluginType: 'CONNECTOR' as const,
    minEcosVersion: 'v22.0',
    capabilities: ['foundation-excavation', 'foundation-pouring'],
    permissions: ['WRITE_FABRIC']
  },
  async initialize() {
    console.log(`[Plugin] Contracted VinaBuild Civil. Initialized foundation machinery.`);
    return true;
  },
  async execute(input) {
    const { depthMeters } = input;
    console.log(`[Plugin] Excavating foundation to depth of ${depthMeters} meters...`);
    return { status: 'SUCCESS', depthExcavated: depthMeters, costEstimateVnd: 50_000_000 };
  },
  async shutdown() {
    console.log(`[Plugin] Demobilized foundation machinery.`);
    return true;
  }
};

const bricklayingPlugin: IExtensionPlugin = {
  metadata: {
    pluginId: 'plg-masonry-bricklayer',
    pluginName: 'Master Masonry Bricklaying Plugin',
    version: '1.0.0',
    author: 'An Binh Masonry',
    description: 'Handles bricklaying, wall raising, and plastering.',
    pluginType: 'SKILL' as const,
    minEcosVersion: 'v22.0',
    capabilities: ['wall-construction'],
    permissions: ['READ_FABRIC']
  },
  async initialize() {
    console.log(`[Plugin] Contracted An Binh Masonry. Bricklaying team ready.`);
    return true;
  },
  async execute(input) {
    const { heightMeters } = input;
    console.log(`[Plugin] Raising brick walls to height of ${heightMeters} meters...`);
    return { status: 'SUCCESS', heightBuilt: heightMeters };
  },
  async shutdown() {
    console.log(`[Plugin] Masonry team checked off site.`);
    return true;
  }
};

// ─────────────────────────────────────────────
// 2. Registering Plugins into ECOS Core L2
// ─────────────────────────────────────────────

async function runDemo() {
  const pluginRegistry = PluginRegistry.getInstance();
  const workflowRuntime = WorkflowRuntime.getInstance();
  const planningEngine = PlanningEngine.getInstance();

  console.log(`${YELLOW}▶ Step 1: Registering construction vertical plugins...${RESET}`);
  const ok1 = await pluginRegistry.registerPlugin(foundationContractorPlugin, 100);
  const ok2 = await pluginRegistry.registerPlugin(bricklayingPlugin, 80);

  if (ok1 && ok2) {
    console.log(`  ${GREEN}✓${RESET} Registered foundation and bricklaying plugins successfully.`);
    console.log(`  Active plugins count in registry: ${pluginRegistry.getActivePluginsCount()}\n`);
  }

  // ─────────────────────────────────────────────
  // 3. Planning & Validating the House Construction Task Graph
  // ─────────────────────────────────────────────
  console.log(`${YELLOW}▶ Step 2: Planning & Validating construction tasks...${RESET}`);
  
  // Define a goal for executing the construction project plan
  const buildGoal: Goal = {
    id: 'goal-house-101',
    name: 'Xây dựng nhà phố 3 tầng - Đà Nẵng',
    targetMetric: 'CompletionPercentage',
    targetValue: 100
  };

  // Generate execution plan from PlanningEngine
  const plan = await planningEngine.plan(buildGoal);
  console.log(`  Generated plan ID: ${plan.planId}`);
  console.log(`  Tasks generated: ${plan.tasks.map(t => `${t.id} (${t.name})`).join(', ')}`);

  // Validate the plan for safety (cycles, capabilities, etc.)
  const validation = planningEngine.validate(plan);
  if (validation.valid) {
    console.log(`  ${GREEN}✓${RESET} Plan validation successful. No cycle or unreachable tasks detected.`);
  } else {
    console.log(`  ${RED}✗${RESET} Plan validation failed. Issues:`, validation.issues);
  }

  // Determine topological execution order
  const order = planningEngine.solveDependencies(plan);
  console.log(`  Topological task execution order: ${order.join(' ➔ ')}\n`);

  // ─────────────────────────────────────────────
  // 4. Executing House Construction Saga Workflow
  // ─────────────────────────────────────────────
  console.log(`${YELLOW}▶ Step 3: Executing transactional Saga construction workflow...${RESET}`);

  // In construction, steps must be compensated (rolled back) if subsequent critical steps fail.
  // E.g., if bricklaying fails, we compensate foundation by backfilling and clearing foundation space.
  
  const constructionSagaSteps: SagaStep[] = [
    {
      stepId: 'saga-excavation',
      action: async () => {
        console.log('  [Saga Action] Triggering foundation-excavation capability...');
        const result = await pluginRegistry.executeCapability('foundation-excavation', { depthMeters: 4 });
        return result.status === 'SUCCESS';
      },
      compensate: async () => {
        console.log('  [Saga Compensation] Backfilling excavated ground to restore level...');
      }
    },
    {
      stepId: 'saga-pouring',
      action: async () => {
        console.log('  [Saga Action] Triggering foundation-pouring capability...');
        const result = await pluginRegistry.executeCapability('foundation-pouring', { volumeCubicMeters: 120 });
        return result.status === 'SUCCESS';
      },
      compensate: async () => {
        console.log('  [Saga Compensation] Demolishing poured foundation concrete and recycling materials...');
      }
    },
    {
      stepId: 'saga-walls',
      action: async () => {
        console.log('  [Saga Action] Triggering wall-construction capability...');
        // Simulating a critical material supply error causing this step to fail:
        throw new Error('Cát & Gạch xây dựng bị gián đoạn cung ứng do bão lớn ở Đà Nẵng.');
      },
      compensate: async () => {
        console.log('  [Saga Compensation] Cleaning up wall construction site debris...');
      }
    }
  ];

  const sagaId = 'saga-house-build-001';
  const workflowName = 'House Construction Core Phase';
  
  const sagaResult = await workflowRuntime.executeSaga(sagaId, workflowName, constructionSagaSteps);

  console.log(`\n  Saga execution finished. Result: ${sagaResult ? GREEN + 'SUCCESS' : RED + 'FAILED/COMPENSATED'}${RESET}`);
  
  // Inspect the persisted state of the workflow
  const finalState = workflowRuntime.loadState(sagaId);
  if (finalState) {
    console.log(`\n${YELLOW}▶ Step 4: Stored Workflow Audit Trail:${RESET}`);
    console.log(`  Workflow ID: ${finalState.workflowId}`);
    console.log(`  Workflow Status: ${finalState.status === 'COMPENSATED' ? GREEN + finalState.status : RED + finalState.status}${RESET}`);
    console.log(`  Steps states:`);
    finalState.steps.forEach(s => {
      console.log(`    - Step [${s.stepId}]: status = ${s.status} ${s.error ? `(error: ${s.error})` : ''}`);
    });
  }

  // ─────────────────────────────────────────────
  // 5. Cleanup
  // ─────────────────────────────────────────────
  console.log(`\n${YELLOW}▶ Step 5: Clean up and unregister plugins...${RESET}`);
  await pluginRegistry.unregisterPlugin('plg-civil-foundation-co');
  await pluginRegistry.unregisterPlugin('plg-masonry-bricklayer');
  console.log(`  Active plugins count in registry: ${pluginRegistry.getActivePluginsCount()}`);
  console.log(`  ${GREEN}✓${RESET} Cleanup completed successfully.`);
}

runDemo().catch(console.error);
