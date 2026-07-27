/**
 * verify-ecos-v8-all-15-primitives.ts
 * Integration verification script for the 15 ECOS Platform Primitives in Bella EOS.
 * Run: npx tsx scratch/verify-ecos-v8-all-15-primitives.ts
 */

import { EventStore } from '../src/core/event-sourcing/event-store';
import { TemporalKnowledgeManager } from '../src/core/knowledge/temporal-knowledge';
import { QueryEngine } from '../src/core/knowledge/query-runtime';
import { MemoryManager } from '../src/core/memory/memory-manager';
import { SchedulerRuntime } from '../src/core/infrastructure/scheduler-runtime';
import { ResourceAllocator } from '../src/core/resource/resource-allocator';
import { DecisionLifecycleManager } from '../src/core/decision/decision-lifecycle';
import { ExplainabilityRuntime } from '../src/core/decision/explainability-runtime';
import { MarketplaceRuntime } from '../src/core/marketplace/marketplace-runtime';
import { EvolutionRuntime } from '../src/core/evolution/evolution-runtime';
import { DataFabric } from '../src/core/storage/data-fabric';
import { AgentRuntime } from '../src/core/kernel/agent-runtime';
import { WorkflowRuntime, SagaStep } from '../src/core/orchestration/workflow-runtime';
import { SecurityRuntime } from '../src/core/gov/security-runtime';
import { EconomicsRuntime } from '../src/core/resource/economics-runtime';
import { EnterpriseContextBuilder } from '../src/core/brain/context-builder';
import { EnterpriseReasoningEngine } from '../src/core/brain/reasoning-engine';
import { PolicyEngine } from '../src/core/gov/policy-engine';
import { ContractRegistry } from '../src/core/contracts/contract-registry';
import { ExecutiveIntelligenceContract } from '../src/core/contracts/executive-intelligence-contract';

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, info?: string) {
  if (condition) {
    console.log(`  ${GREEN}✓${RESET} ${label}`);
    passed++;
  } else {
    console.log(`  ${RED}✗ FAIL${RESET} ${label}${info ? ` → ${info}` : ''}`);
    failed++;
  }
}

async function run() {
  console.log(`\n${CYAN}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN} BELLA EOS — ECOS v22.0 15 Core Primitives Integration${RESET}`);
  console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);

  // Use Case: CEO requests a marketing campaign for Da Nang Spa
  const ceoObjective = 'Tăng 20% lượng khách hàng trung thành Spa trong 30 ngày';

  console.log(`${YELLOW}▶ Step 1: Enterprise Data Fabric Ingestion & Mapping${RESET}`);
  const dataFabric = DataFabric.getInstance();
  const rawCrmData = { active_count: 150, leads: [{ name: 'An Hoa', email: 'anhoa@gmail.com' }] };
  const rawErpData = { reach_24h: 3000, budget_vnd: 50_000_000 };

  const canonicalCrm = dataFabric.mapToCanonicalModel('CRM', rawCrmData);
  const canonicalErp = dataFabric.mapToCanonicalModel('ERP', rawErpData);

  assert('DataFabric translates CRM successfully', canonicalCrm.activeCustomersCount === 150);
  assert('DataFabric translates ERP successfully', canonicalErp.fbReach24h === 3000);


  console.log(`\n${YELLOW}▶ Step 2: Context Builder & Temporal Knowledge Graph${RESET}`);
  const contextBuilder = EnterpriseContextBuilder.getInstance();
  const ecc = contextBuilder.buildContext({
    objective: ceoObjective,
    brandDna: { brandName: 'Bella Spa', voiceTone: 'luxury', designStyle: 'luxury wellness', targetSegment: 'VIP clients' },
    rawCrmStats: { activeCustomers: canonicalCrm.activeCustomersCount, rawLeadsList: canonicalCrm.leadsList },
    rawErpStats: { fbReach24h: canonicalErp.fbReach24h },
    approvedBudgetLimitVnd: canonicalErp.approvedBudgetLimitVnd
  });

  const temporalManager = TemporalKnowledgeManager.getInstance();
  
  // Seed temporal test nodes for integration test (since L2 has no internal mocks)
  temporalManager.addNode({
    id: 'cust-101',
    label: 'CUSTOMER',
    name: 'Nguyễn Văn A',
    properties: { tier: 'GOLD_VIP' },
    temporal: {
      validFrom: '2026-05-01T00:00:00Z',
      validTo: '2026-06-30T23:59:59Z',
      transactionTime: '2026-05-01T08:00:00Z',
      asOfDate: '2026-05-15T00:00:00Z'
    }
  });
  temporalManager.addNode({
    id: 'cust-101',
    label: 'CUSTOMER',
    name: 'Nguyễn Văn A',
    properties: { tier: 'PLATINUM_VIP' },
    temporal: {
      validFrom: '2026-07-01T00:00:00Z',
      validTo: '2099-12-31T23:59:59Z',
      transactionTime: '2026-07-01T09:00:00Z',
      asOfDate: '2026-07-15T00:00:00Z'
    }
  });

  const testNode = temporalManager.getEntityAsOf('cust-101', '2026-05-15T00:00:00Z');
  assert('Temporal Knowledge query resolves tier in May', testNode?.properties.tier === 'GOLD_VIP');

  const testNodeJuly = temporalManager.getEntityAsOf('cust-101', '2026-07-15T00:00:00Z');
  assert('Temporal Knowledge query resolves tier in July', testNodeJuly?.properties.tier === 'PLATINUM_VIP');


  console.log(`\n${YELLOW}▶ Step 3: Shared Reasoning Graph DAG Engine & Hybrid Query${RESET}`);
  const reasoningEngine = EnterpriseReasoningEngine.getInstance();
  const sharedGraph = reasoningEngine.generateReasoningGraph(ecc);

  const queryEngine = QueryEngine.getInstance();
  const queryResult = await queryEngine.executeHybridQuery({ graphQuery: 'MATCH CUSTOMER -> BOOKING' });
  assert('QueryEngine returns path matches for planner', queryResult.length > 0 && !!queryResult[0].matchedPath);


  console.log(`\n${YELLOW}▶ Step 4: Executive Intelligence Contract & Policy Engine Safeguard${RESET}`);
  const policyEngine = PolicyEngine.getInstance();
  const proposedEic: ExecutiveIntelligenceContract = {
    metadata: {
      contractId: 'EIC-CAMP-DN-101',
      version: 1,
      parentContractId: 'CEO-GOAL-ROOT',
      agentId: 'eos_cmo_agent',
      role: 'Chief Marketing Officer',
      timestamp: new Date().toISOString(),
      status: 'APPROVED',
      type: 'DECISION'
    },
    strategicIntent: { businessObjective: ceoObjective, strategicAlignment: ecc.brandDna.strategicIntent, targetAudience: 'VIP clients' },
    businessDiagnosis: { swot: { strengths: 'Good staff', weaknesses: '', opportunities: '', threats: '' }, currentBottleneck: '' },
    reasoningGraph: { nodes: sharedGraph.nodes },
    decision: { approvedStrategy: 'Retention program', rejectedStrategies: [], assumptions: [] },
    expectedOutcomes: [],
    planning: {
      spendLimitVnd: ecc.coverage.approvedBudgetLimitVnd, // 50M
      delegations: [],
      dependencies: [],
      replanningTriggers: [],
      rollbackStrategy: { triggers: [], actions: [] }
    },
    execution: { businessImpactForecast: { revenueGrowth: '15%', cashflowImprovement: '5%', hrLoadIncrease: 'Low', overallRisk: 'Low' }, taskPipeline: [] }
  };

  const policyCheck = policyEngine.evaluateProposal(proposedEic);
  assert('Proposed EIC passes policy limit constraints', !!policyCheck.passed);



  console.log(`\n${YELLOW}▶ Step 5: Economics, Explainability & Decision Lifecycle Runtimes${RESET}`);
  const economics = EconomicsRuntime.getInstance();
  const costEstimate = economics.estimateCost(ceoObjective);
  assert('Economics Runtime forecasts token budget & ROI margins', costEstimate.estimatedTokens > 0 && costEstimate.netMarginImpact === 38);

  const explainability = ExplainabilityRuntime.getInstance();
  const explanation = explainability.explain({
    decisionId: proposedEic.metadata.contractId,
    objective: ceoObjective,
    evidenceIds: ecc.evidenceIds,
    hasStats: true
  });
  assert('Explainability Runtime generates counterfactual scenarios', explanation.counterfactualScenario.includes('Nếu đổ tiền'));

  const lifecycle = DecisionLifecycleManager.getInstance();
  lifecycle.transitionDecision(proposedEic.metadata.contractId, 'APPROVED');
  assert('Decision Lifecycle tracks initial state', lifecycle.getDecisionState(proposedEic.metadata.contractId) === 'APPROVED');


  console.log(`\n${YELLOW}▶ Step 6: Saga Workflow Execution & Scheduler Runtimes${RESET}`);
  const scheduler = SchedulerRuntime.getInstance();
  scheduler.scheduleTask({
    taskId: 't-saga-101',
    priority: 'HIGH',
    retryLimit: 3,
    backoffMs: 1000,
    timeoutMs: 5000,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  });
  assert('Scheduler queues task by priority weights', scheduler.getQueue().length > 0);

  const workflow = WorkflowRuntime.getInstance();
  let step1Compensated = false;
  const sagaSteps: SagaStep[] = [
    {
      stepId: 'step-save-crm',
      action: async () => true,
      compensate: async () => { step1Compensated = true; }
    },
    {
      stepId: 'step-publish-ads-fail',
      action: async () => false, // Simulate failure to trigger compensation
      compensate: async () => {}
    }
  ];

  const sagaResult = await workflow.executeSaga(sagaSteps);
  assert('Saga Transaction fails as expected', !sagaResult);
  assert('Saga runs backward compensation triggers', !!step1Compensated);



  console.log(`\n${YELLOW}▶ Step 7: Event Sourcing Runtime (Immutable Event Store)${RESET}`);
  const eventStore = EventStore.getInstance();
  eventStore.saveEvents(proposedEic.metadata.contractId, [
    {
      eventId: 'evt-001',
      aggregateId: proposedEic.metadata.contractId,
      aggregateType: 'EIC_CONTRACT',
      eventType: 'BookingCreated',
      payload: {},
      timestamp: new Date().toISOString(),
      version: 1
    },
    {
      eventId: 'evt-002',
      aggregateId: proposedEic.metadata.contractId,
      aggregateType: 'EIC_CONTRACT',
      eventType: 'InvoicePaid',
      payload: { amountVnd: 500_000 },
      timestamp: new Date().toISOString(),
      version: 1
    }
  ], 0);

  // Validate projection
  assert('EventStore projects read model bookings_count', eventStore.getProjection('bookings_count') === 1);
  assert('EventStore projects read model total_revenue', eventStore.getProjection('total_revenue') === 500_000);

  // Replay
  eventStore.replayEvents();
  assert('EventStore replays and projects correctly', eventStore.getProjection('total_revenue') === 500_000);


  console.log(`\n${YELLOW}▶ Step 8: Security, Memory, Agent, Marketplace & Evolution Runtimes${RESET}`);
  // Security
  const security = SecurityRuntime.getInstance();
  const cipher = security.encryptData('mySecretKey', 'tenant-spa-da-nang');
  assert('Security Runtime signs KMS zero-trust token', cipher.startsWith('KMS-CIPHER-TENANT'));

  // Memory Manager
  const memoryManager = MemoryManager.getInstance();
  assert('Memory Manager scores importance of budget terms', memoryManager.importance('Approved Budget limit') > 30);

  // Agent Runtime
  const agentRuntime = AgentRuntime.getInstance();
  agentRuntime.sendHeartbeat('eos_cmo_agent');
  assert('Agent Runtime tracks heartbeat and status', agentRuntime.getAgentStatus('eos_cmo_agent')?.status === 'RUNNING');

  // Marketplace
  const marketplace = MarketplaceRuntime.getInstance();
  assert('Marketplace compiles package manifests', marketplace.getPackage('pack-spa-dna')?.compatibilityVersion === 'v21.0');

  // Evolution
  const evolution = EvolutionRuntime.getInstance();
  evolution.launchExperiment({
    experimentId: 'exp-mkt-002',
    championSopId: 'sop-v1.8',
    challengerSopId: 'sop-v1.9-mutated',
    trafficSplitPercentage: 20,
    metricsResult: {}
  });
  const promoteVerdict = evolution.evaluateChampion('exp-mkt-002', 92, 85);
  assert('Evolution Engine runs champion vs challenger evaluations', promoteVerdict === 'CHALLENGER');

  console.log(`\n${CYAN}═══════════════════════════════════════════════════════${RESET}`);
  const total = passed + failed;
  if (failed === 0) {
    console.log(`${GREEN}   ALL ${total} ECOS V22.0 PRIMITIVES TESTS PASSED SUCCESSFULLY${RESET}`);
  } else {
    console.log(`${RED}   ${failed} / ${total} ECOS V22.0 PRIMITIVES TESTS FAILED${RESET}`);
    process.exit(1);
  }
  console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);
}

run().catch((e) => {
  console.error('Unhandled verification error:', e);
  process.exit(1);
});
