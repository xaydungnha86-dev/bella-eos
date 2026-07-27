/**
 * verify-ecos-v6-primitives.ts
 * Verification script for the 4 new Platform Primitives of Bella Enterprise Cognitive Operating System.
 * Run: npx tsx scratch/verify-ecos-v6-primitives.ts
 */

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
  console.log(`${CYAN} BELLA EOS — ECOS 4 Final Platform Primitives Test${RESET}`);
  console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);

  // Setup services
  const contextBuilder = EnterpriseContextBuilder.getInstance();
  const reasoningEngine = EnterpriseReasoningEngine.getInstance();
  const policyEngine = PolicyEngine.getInstance();
  const contractRegistry = ContractRegistry.getInstance();

  console.log(`${YELLOW}▶ Test Case 1: Standard Campaign Goal${RESET}`);
  const normalEcc = contextBuilder.buildContext({
    objective: 'Tăng 20% lượng khách hàng trung thành Spa trong 30 ngày',
    brandDna: {
      brandName: 'Bella Spa',
      voiceTone: 'luxury & sweet',
      designStyle: 'luxury wellness',
      targetSegment: 'Premium clients'
    },
    rawCrmStats: { activeCustomers: 150, rawLeadsList: [{ name: 'An Hoa', email: 'anhoa@gmail.com' }] },
    rawErpStats: { fbReach24h: 3000 },
    approvedBudgetLimitVnd: 50_000_000
  });

  // Verify ECC
  assert('ECC Context ID generated', !!normalEcc.contextId);
  assert('ECC target Segment is set', normalEcc.brandDna.targetSegment === 'Premium clients');
  assert('ECC aggregated CRM active count matches', normalEcc.coverage.crmActiveCount === 150);
  assert('ECC PII is redacted', normalEcc.coverage.piiRedacted.length === 1 && normalEcc.coverage.piiRedacted[0].includes('REDACTED'));

  // Register ECC in registry
  contractRegistry.registerEcc(normalEcc);
  const auditLogsAfterEcc = contractRegistry.getAuditHistory(normalEcc.contextId);
  assert('Audit trail recorded ECC registration', auditLogsAfterEcc.some(l => l.action === 'REGISTERED'));

  // Generate Reasoning DAG
  const reasoningGraph = reasoningEngine.generateReasoningGraph(normalEcc);
  assert('Reasoning Graph generated', !!reasoningGraph.graphId);
  assert('Reasoning DAG has GOAL and DECISION nodes', reasoningGraph.nodes.some(n => n.id === 'GOAL') && reasoningGraph.nodes.some(n => n.id === 'DECISION'));
  assert('Reasoning DAG nodes linked correctly (dependsOn)', reasoningGraph.nodes.find(n => n.id === 'LEAKAGE')?.dependsOn.includes('DIAGNOSIS') === true);

  // Compile EIC decision contract
  const normalEic: ExecutiveIntelligenceContract = {
    metadata: {
      contractId: 'EIC-CMO-TEST-001',
      version: 1,
      parentContractId: 'CEO-GOAL-ROOT',
      agentId: 'eos_cmo_agent',
      role: 'Chief Marketing Officer',
      timestamp: new Date().toISOString(),
      status: 'APPROVED',
      type: 'DECISION'
    },
    strategicIntent: {
      businessObjective: normalEcc.objective,
      strategicAlignment: normalEcc.brandDna.strategicIntent,
      targetAudience: normalEcc.brandDna.targetSegment
    },
    businessDiagnosis: {
      swot: { strengths: 'Good staff', weaknesses: 'No competitive intelligence', opportunities: 'Retention', threats: 'Competitors' },
      currentBottleneck: 'Retention rate drop'
    },
    reasoningGraph: { nodes: reasoningGraph.nodes },
    decision: {
      approvedStrategy: 'SMS Retention & Upsell program',
      rejectedStrategies: [{ strategy: 'Aggressive cold ads', reason: 'High CAC', risk: 'Medium' }],
      assumptions: ['No major price changes']
    },
    expectedOutcomes: [{ metric: 'ROAS', targetValue: 3.5, weight: 0.9 }],
    planning: {
      spendLimitVnd: normalEcc.coverage.approvedBudgetLimitVnd,
      delegations: [{ department: 'Creative', role: 'Designer', task: 'Make visual banner' }],
      dependencies: [],
      replanningTriggers: [],
      rollbackStrategy: { triggers: [], actions: [] }
    },
    execution: {
      businessImpactForecast: { revenueGrowth: '+15%', cashflowImprovement: '+5%', hrLoadIncrease: 'Low', overallRisk: 'Low' },
      taskPipeline: []
    }
  };

  // Evaluate normal EIC with Policy Engine
  const normalPolicyCheck = policyEngine.evaluateProposal(normalEic);
  assert('Normal EIC proposal passes Policy Engine check', normalPolicyCheck.passed === true && normalPolicyCheck.violations.length === 0);

  // Register EIC with Registry
  const registeredVersion = contractRegistry.registerEic(normalEic);
  assert('EIC registered successfully in registry (v1)', registeredVersion === 1);

  // Status transition audit trail test
  contractRegistry.updateEicStatus(normalEic.metadata.contractId, 1, 'EXECUTING', 'SYSTEM_ORCHESTRATOR');
  const eicAuditHistory = contractRegistry.getAuditHistory(normalEic.metadata.contractId);
  assert('Audit Trail tracks EIC status changes', eicAuditHistory.some(h => h.action === 'STATUS_CHANGED' && h.details.includes('EXECUTING')));


  console.log(`\n${YELLOW}▶ Test Case 2: Extreme Goal triggering Critical Pushback & Policy Violation${RESET}`);
  const extremeEcc = contextBuilder.buildContext({
    objective: 'Tăng gấp 3 lần lượng khách hàng Spa trong 5 ngày',
    brandDna: {
      brandName: 'Bella Spa',
      voiceTone: 'bold',
      designStyle: 'luxury wellness',
      targetSegment: 'Bệnh nhân y tế nhạy cảm'
    },
    rawCrmStats: { activeCustomers: 200 },
    rawErpStats: { fbReach24h: 5000 },
    approvedBudgetLimitVnd: 200_000_000 // Over 150M limit!
  });

  const extremeEic: ExecutiveIntelligenceContract = {
    metadata: {
      contractId: 'EIC-CMO-TEST-EXTREME',
      version: 1,
      parentContractId: 'CEO-GOAL-ROOT',
      agentId: 'eos_cmo_agent',
      role: 'Chief Marketing Officer',
      timestamp: new Date().toISOString(),
      status: 'BOARD_REVIEW', // Pushback state
      type: 'DECISION'
    },
    strategicIntent: {
      businessObjective: extremeEcc.objective,
      strategicAlignment: extremeEcc.brandDna.strategicIntent,
      targetAudience: extremeEcc.brandDna.targetSegment
    },
    businessDiagnosis: {
      swot: { strengths: 'Good staff', weaknesses: 'Short time limit', opportunities: 'None', threats: 'Burnout' },
      currentBottleneck: 'KTV capacity limit'
    },
    reasoningGraph: { nodes: reasoningEngine.generateReasoningGraph(extremeEcc).nodes },
    decision: {
      approvedStrategy: 'Sustainability target',
      rejectedStrategies: [{ strategy: 'Aggressive acquisition', reason: 'High burnout risk', risk: 'Critical' }],
      assumptions: []
    },
    expectedOutcomes: [],
    planning: {
      spendLimitVnd: extremeEcc.coverage.approvedBudgetLimitVnd, // 200M (policy violation!)
      delegations: [],
      dependencies: [],
      replanningTriggers: [],
      rollbackStrategy: { triggers: [], actions: [] }
    },
    execution: {
      businessImpactForecast: { revenueGrowth: 'Unknown', cashflowImprovement: 'Negative', hrLoadIncrease: 'Critical', overallRisk: 'Critical' },
      taskPipeline: []
    }
  };

  // Evaluate extreme EIC with Policy Engine
  const extremePolicyCheck = policyEngine.evaluateProposal(extremeEic);
  assert('Extreme EIC triggers budget policy violation', extremePolicyCheck.passed === false);
  assert('Extreme EIC catches budget constraint', extremePolicyCheck.violations.some(v => v.policyId === 'POL-FIN-001'));
  assert('Extreme EIC catches sensitive segment restriction', extremePolicyCheck.violations.some(v => v.policyId === 'POL-LGL-002'));

  console.log(`\n${CYAN}═══════════════════════════════════════════════════════${RESET}`);
  const total = passed + failed;
  if (failed === 0) {
    console.log(`${GREEN}   ALL ${total} ECOS PRIMITIVES TESTS PASSED SUCCESSFULLY${RESET}`);
  } else {
    console.log(`${RED}   ${failed} / ${total} ECOS PRIMITIVES TESTS FAILED${RESET}`);
    process.exit(1);
  }
  console.log(`${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);
}

run().catch((e) => {
  console.error('Unhandled verification error:', e);
  process.exit(1);
});
