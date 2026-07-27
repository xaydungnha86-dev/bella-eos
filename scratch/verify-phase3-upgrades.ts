/**
 * BELLA EOS — Phase 3 Upgrades Verification Script
 * File: scratch/verify-phase3-upgrades.ts
 * 
 * Verifies all Phase 3 enterprise capabilities:
 *   1. Execution Policy (Retry, Timeout, Circuit Breaker)
 *   2. Priority Queue Service (Resource Scheduling, Concurrency control, weights)
 *   3. SSE Stream API Handler headers
 *   4. Consensus Engine deliberation checks
 */

import { ExecutionPolicy } from '../src/core/creative/kernel/execution-policy';
import { PriorityQueueService } from '../src/core/infrastructure/priority-queue-service';
import { ConsensusEngine, AgentVote } from '../src/core/edr/consensus-engine';
import { NextRequest } from 'next/server';
import { GET as streamHandler } from '../src/app/api/observability/stream/route';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function assert(desc: string, cond: boolean) {
  if (cond) {
    console.log(`  ${GREEN}✓${RESET} ${desc}`);
  } else {
    console.error(`  ${RED}✗ ASSERTION FAILED:${RESET} ${desc}`);
    process.exit(1);
  }
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(' BELLA EOS — Phase 3 Enterprise Verification Suite');
  console.log('═══════════════════════════════════════════════════════');

  // ----------------------------------------------------
  console.log(`\n${YELLOW}▶ Test 1: Execution Policy (Retry & Circuit Breaker)${RESET}`);
  // 1a. Test Successful Retry
  let attempts = 0;
  const flakyAction = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('FLAKY_API_ERROR');
    }
    return 'SUCCESS_DATA';
  };

  const retryWarnings: string[] = [];
  const retryResult = await ExecutionPolicy.executeWithPolicy(
    'FlakyPlanner',
    flakyAction,
    { maxRetries: 2, backoffMs: 2, timeoutMs: 1000 },
    (msg) => retryWarnings.push(msg)
  );

  assert('flaky action resolved on 3rd attempt', retryResult === 'SUCCESS_DATA');
  assert('retry warning counts is 2', retryWarnings.length === 2);

  // 1b. Test Circuit Breaker Tripping
  ExecutionPolicy.resetAllBreakers();
  const failingAction = async () => {
    throw new Error('HARD_FATAL_ERROR');
  };

  // Trigger 3 failures
  for (let i = 0; i < 3; i++) {
    try {
      await ExecutionPolicy.executeWithPolicy(
        'FailingPlanner',
        failingAction,
        { maxRetries: 0, backoffMs: 1, timeoutMs: 500 },
        () => {}
      );
    } catch {}
  }

  // 4th call should immediately throw Circuit Breaker Open error
  let threwOpenError = false;
  try {
    await ExecutionPolicy.executeWithPolicy(
      'FailingPlanner',
      failingAction,
      { maxRetries: 0, backoffMs: 1, timeoutMs: 500 },
      () => {}
    );
  } catch (err: any) {
    if (err.message.includes('CIRCUIT_BREAKER_OPEN')) {
      threwOpenError = true;
    }
  }

  assert('circuit breaker tripped and threw OPEN error', threwOpenError);

  // ----------------------------------------------------
  console.log(`\n${YELLOW}▶ Test 2: Resource Scheduling (Priority Queue)${RESET}`);
  const pq = PriorityQueueService.getInstance();
  pq.clear();
  pq.setMaxConcurrency(1); // Force sequential execution to verify prioritization order

  const executionOrder: string[] = [];
  const createTaskPromise = (id: string, delay: number) => {
    return async () => {
      await new Promise(r => setTimeout(r, delay));
      executionOrder.push(id);
      return id;
    };
  };

  // Enqueue LOW, HIGH, CRITICAL. Since maxConcurrency is 1:
  // The first one enqueued (LOW) starts immediately.
  // While it's running, HIGH and CRITICAL are enqueued.
  // When LOW finished, CRITICAL runs before HIGH because of weight.
  const p1 = pq.enqueue('Task_LOW', 'LOW', createTaskPromise('Task_LOW', 10));
  const p2 = pq.enqueue('Task_HIGH', 'HIGH', createTaskPromise('Task_HIGH', 5));
  const p3 = pq.enqueue('Task_CRITICAL', 'CRITICAL', createTaskPromise('Task_CRITICAL', 5));

  await Promise.all([p1, p2, p3]);

  assert('first task running was Task_LOW', executionOrder[0] === 'Task_LOW');
  assert('CRITICAL prioritized over HIGH', executionOrder[1] === 'Task_CRITICAL');
  assert('HIGH processed last', executionOrder[2] === 'Task_HIGH');

  // Verify stats
  const stats = pq.getStats();
  assert('completedCount reflects execution', stats.completedCount === 3);
  assert('activeCount is 0 after finish', stats.activeCount === 0);

  // ----------------------------------------------------
  console.log(`\n${YELLOW}▶ Test 3: Enterprise Observability SSE Endpoint${RESET}`);
  const dummyRequest = new NextRequest('http://localhost:3000/api/observability/stream');
  const response = await streamHandler(dummyRequest);
  
  assert('returns 200 HTTP status', response.status === 200);
  assert('has EventStream content-type header', response.headers.get('content-type') === 'text/event-stream');
  assert('has Connection keep-alive header', response.headers.get('connection') === 'keep-alive');

  // ----------------------------------------------------
  console.log(`\n${YELLOW}▶ Test 4: EDR Consensus Board Deliberation${RESET}`);
  // 4a. Approve Majority (Consensus)
  const votesA: AgentVote[] = [
    { agentName: 'FINANCE', verdict: 'APPROVE', confidence: 95, reason: 'High ROI projected' },
    { agentName: 'OPERATIONS', verdict: 'APPROVE', confidence: 90, reason: 'Capacity check OK' },
    { agentName: 'LEGAL', verdict: 'APPROVE', confidence: 85, reason: 'Compliant' },
    { agentName: 'RISK_ANALYST', verdict: 'NEED_REVISION', confidence: 60, reason: 'Slight risk' }
  ];

  const reportA = ConsensusEngine.evaluateDecision('goal-101', votesA, { requireSupermajority: true });
  assert('final verdict is APPROVE', reportA.verdict === 'APPROVE');
  assert('consensus reached for majority', reportA.isConsensusReached === true);
  assert('calculates average confidence correctly', reportA.averageConfidence === 83); // (95+90+85+60)/4 = 82.5 -> 83

  // 4b. Revisions Required / No Consensus
  const votesB: AgentVote[] = [
    { agentName: 'FINANCE', verdict: 'APPROVE', confidence: 90, reason: 'Profit OK' },
    { agentName: 'OPERATIONS', verdict: 'NEED_REVISION', confidence: 50, reason: 'Overload warning' },
    { agentName: 'LEGAL', verdict: 'NEED_REVISION', confidence: 40, reason: 'Missing regulatory check' },
    { agentName: 'RISK_ANALYST', verdict: 'REJECT', confidence: 80, reason: 'High security risk' }
  ];
  const reportB = ConsensusEngine.evaluateDecision('goal-102', votesB);
  assert('final verdict is NEED_REVISION', reportB.verdict === 'NEED_REVISION');
  assert('consensus not reached', reportB.isConsensusReached === false);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`   ${GREEN}ALL PHASE 3 CAPABILITY TESTS COMPLETED SUCCESSFULLY${RESET}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
