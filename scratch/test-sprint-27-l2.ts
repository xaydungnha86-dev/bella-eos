/**
 * BELLA ECOS — Sprint 27 Test Suite
 * Knowledge Graph Runtime L2 Verification
 *
 * Tests:
 *   ✅ CRUD: addNode, updateNode, removeNode, getNode, getAllNodes
 *   ✅ Edges: link, unlink, getLinkedNodes
 *   ✅ Traversal: BFS with cycle protection
 *   ✅ Merge: temporal version deduplication
 *   ✅ As-Of query
 *   ✅ RuntimeMetrics collection
 *   ✅ Error handling (missing fields)
 *   ✅ Fuzz/Stress test: 100 nodes, 200 random edges
 */

import {
  KnowledgeGraphRuntime,
  InMemoryGraphStore,
  ITemporalEntityNode,
} from '../src/core/knowledge/temporal-knowledge';

// ─────────────────────────────────────────────
// Test Runner helpers
// ─────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results: string[] = [];

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
    results.push(`  ✅ ${label}`);
  } else {
    failed++;
    results.push(`  ❌ FAIL: ${label}`);
  }
}

function assertThrows(fn: () => any, label: string): void {
  try {
    fn();
    failed++;
    results.push(`  ❌ FAIL (expected throw): ${label}`);
  } catch {
    passed++;
    results.push(`  ✅ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n▶ ${name}`);
  results.push(`\n▶ ${name}`);
}

// ─────────────────────────────────────────────
// Factory: fresh runtime per test block
// ─────────────────────────────────────────────

function makeRuntime(): KnowledgeGraphRuntime {
  KnowledgeGraphRuntime.resetInstance();
  return KnowledgeGraphRuntime.getInstance(new InMemoryGraphStore());
}

function makeNode(id: string, label: string, props: Record<string, any> = {}): ITemporalEntityNode {
  return {
    id,
    label,
    name: `Node ${id}`,
    properties: props,
    temporal: {
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2099-12-31T23:59:59Z',
      transactionTime: new Date().toISOString(),
      asOfDate: new Date().toISOString(),
    },
  };
}

// ─────────────────────────────────────────────
// 1. CRUD Tests
// ─────────────────────────────────────────────

section('1. CRUD — addNode / getNode / updateNode / removeNode');
{
  const g = makeRuntime();

  g.addNode(makeNode('cust-001', 'CUSTOMER', { tier: 'GOLD' }));
  const n = g.getNode('cust-001');
  assert(n !== undefined, 'addNode: node is persisted');
  assert(n?.label === 'CUSTOMER', 'addNode: label matches');
  assert(n?.properties.tier === 'GOLD', 'addNode: properties match');

  const updated = g.updateNode('cust-001', { tier: 'PLATINUM' });
  assert(updated === true, 'updateNode: returns true for existing node');
  assert(g.getNode('cust-001')?.properties.tier === 'PLATINUM', 'updateNode: property updated');

  const notFound = g.updateNode('cust-999', { tier: 'NONE' });
  assert(notFound === false, 'updateNode: returns false for missing node');

  g.addNode(makeNode('booking-001', 'BOOKING'));
  const all = g.getAllNodes();
  assert(all.length === 2, 'getAllNodes: returns all unique nodes');

  const removed = g.removeNode('booking-001');
  assert(removed === true, 'removeNode: returns true');
  assert(g.getAllNodes().length === 1, 'removeNode: node is gone');

  const removedMissing = g.removeNode('ghost-999');
  assert(removedMissing === false, 'removeNode: returns false for missing node');
}

// ─────────────────────────────────────────────
// 2. Edge Tests: link / unlink
// ─────────────────────────────────────────────

section('2. Edges — link / unlink');
{
  const g = makeRuntime();
  g.addNode(makeNode('cust-001', 'CUSTOMER'));
  g.addNode(makeNode('booking-001', 'BOOKING'));
  g.addNode(makeNode('campaign-001', 'CAMPAIGN'));

  g.link('cust-001', 'booking-001', 'HAS_BOOKING');
  g.link('booking-001', 'campaign-001', 'TRIGGERED_BY');

  const edges = g['store'].getLinkedNodes('cust-001');
  assert(edges.length === 1, 'link: edge recorded correctly');
  assert(edges[0].type === 'HAS_BOOKING', 'link: edge type is correct');

  const unlinked = g.unlink('cust-001', 'booking-001');
  assert(unlinked === true, 'unlink: returns true');
  assert(g['store'].getLinkedNodes('cust-001').length === 0, 'unlink: edge removed');

  const unlinkMissing = g.unlink('ghost-a', 'ghost-b');
  assert(unlinkMissing === false, 'unlink: returns false for missing edge');
}

// ─────────────────────────────────────────────
// 3. BFS Traversal with cycle protection
// ─────────────────────────────────────────────

section('3. Traversal — BFS, lineage, cycle protection');
{
  const g = makeRuntime();
  // Chain: A → B → C → D
  ['A', 'B', 'C', 'D'].forEach(id => g.addNode(makeNode(id, 'NODE')));
  g.link('A', 'B', 'NEXT');
  g.link('B', 'C', 'NEXT');
  g.link('C', 'D', 'NEXT');

  const path = g.traverse('A', 10);
  assert(path.includes('A'), 'traverse: includes start node');
  assert(path.includes('B'), 'traverse: includes B');
  assert(path.includes('C'), 'traverse: includes C');
  assert(path.includes('D'), 'traverse: includes D');
  assert(path.length === 4, 'traverse: correct path length');

  // Cyclic graph: A → B → A (should not infinite loop)
  const g2 = makeRuntime();
  g2.addNode(makeNode('X', 'NODE'));
  g2.addNode(makeNode('Y', 'NODE'));
  g2.link('X', 'Y', 'CYCLE');
  g2.link('Y', 'X', 'CYCLE');
  const cyclic = g2.traverse('X', 5);
  assert(cyclic.length === 2, 'traverse: cyclic graph does not loop infinitely');

  // maxDepth respected
  const g3 = makeRuntime();
  ['N1', 'N2', 'N3', 'N4', 'N5'].forEach(id => g3.addNode(makeNode(id, 'NODE')));
  g3.link('N1', 'N2', 'NEXT');
  g3.link('N2', 'N3', 'NEXT');
  g3.link('N3', 'N4', 'NEXT');
  g3.link('N4', 'N5', 'NEXT');
  const shallow = g3.traverse('N1', 2);
  assert(shallow.length <= 3, 'traverse: maxDepth limits traversal');
}

// ─────────────────────────────────────────────
// 4. Merge (temporal version deduplication)
// ─────────────────────────────────────────────

section('4. Merge — temporal version deduplication');
{
  const g = makeRuntime();

  const v1: ITemporalEntityNode = {
    id: 'cust-101',
    label: 'CUSTOMER',
    name: 'Nguyen Van A',
    properties: { tier: 'GOLD' },
    temporal: {
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2026-06-30T23:59:59Z',
      transactionTime: '2026-01-01T00:00:00Z',
      asOfDate: '2026-03-01T00:00:00Z',
    },
  };

  const v2: ITemporalEntityNode = {
    id: 'cust-101',
    label: 'CUSTOMER',
    name: 'Nguyen Van A',
    properties: { tier: 'PLATINUM' },
    temporal: {
      validFrom: '2026-07-01T00:00:00Z',
      validTo: '2099-12-31T23:59:59Z',
      transactionTime: '2026-07-01T00:00:00Z',
      asOfDate: '2026-07-15T00:00:00Z',
    },
  };

  g.addNode(v1);
  g.merge(v2);

  const current = g.getNode('cust-101');
  assert(current?.properties.tier === 'PLATINUM', 'merge: latest version is PLATINUM');

  const historical = g.getEntityAsOf('cust-101', '2026-03-15T00:00:00Z');
  assert(historical?.properties.tier === 'GOLD', 'merge: as-of query returns historical GOLD version');
}

// ─────────────────────────────────────────────
// 5. RuntimeMetrics Collection
// ─────────────────────────────────────────────

section('5. RuntimeMetrics — latency & success tracking');
{
  const g = makeRuntime();
  g.addNode(makeNode('m-001', 'METRIC_TEST'));
  g.getNode('m-001');
  g.link('m-001', 'non-existent', 'TEST');
  g.traverse('m-001', 3);

  const metrics = g.getMetrics();
  assert(metrics.length >= 4, 'metrics: operations are recorded');
  assert(metrics.every(m => m.latencyMs >= 0), 'metrics: all latencies are non-negative');
  assert(metrics.every(m => typeof m.success === 'boolean'), 'metrics: success flags are boolean');
  assert(metrics.some(m => m.operation === 'traverse'), 'metrics: traverse is tracked');

  g.clearMetrics();
  assert(g.getMetrics().length === 0, 'metrics: clearMetrics resets the log');
}

// ─────────────────────────────────────────────
// 6. Error Handling
// ─────────────────────────────────────────────

section('6. Error Handling — invalid inputs');
{
  const g = makeRuntime();
  assertThrows(
    () => g.addNode({ id: '', label: '', name: '', properties: {}, temporal: {} as any }),
    'addNode: throws for empty id/label'
  );
  assertThrows(() => g.updateNode('', {}), 'updateNode: throws for empty id');
  assertThrows(() => g.removeNode(''), 'removeNode: throws for empty id');
  assertThrows(() => g.link('', 'b', 'TYPE'), 'link: throws for empty sourceId');
  assertThrows(() => g.link('a', '', 'TYPE'), 'link: throws for empty targetId');
  assertThrows(() => g.link('a', 'b', ''), 'link: throws for empty type');
  assertThrows(() => g.unlink('', 'b'), 'unlink: throws for empty sourceId');
  assertThrows(() => g.merge({ id: '', label: '', name: '', properties: {}, temporal: {} as any }), 'merge: throws for empty id');
}

// ─────────────────────────────────────────────
// 7. Fuzz / Stress Test (100 nodes, 200 random edges)
// ─────────────────────────────────────────────

section('7. Fuzz / Stress Test — 100 nodes, 200 random edges');
{
  const g = makeRuntime();
  const nodeCount = 100;
  const edgeCount = 200;

  // Add 100 nodes
  for (let i = 0; i < nodeCount; i++) {
    g.addNode(makeNode(`fuzz-${i}`, 'FUZZ', { value: Math.random() }));
  }
  assert(g.getAllNodes().length === nodeCount, `fuzz: ${nodeCount} nodes added`);

  // Add 200 random edges (may create cycles intentionally)
  let edgesAdded = 0;
  for (let i = 0; i < edgeCount; i++) {
    const src = `fuzz-${Math.floor(Math.random() * nodeCount)}`;
    const tgt = `fuzz-${Math.floor(Math.random() * nodeCount)}`;
    if (src !== tgt) {
      g.link(src, tgt, 'RANDOM');
      edgesAdded++;
    }
  }
  assert(edgesAdded > 0, `fuzz: at least some edges created`);

  // Traverse from 10 random nodes — must not crash or hang
  let traverseOk = true;
  for (let i = 0; i < 10; i++) {
    const startId = `fuzz-${Math.floor(Math.random() * nodeCount)}`;
    try {
      const path = g.traverse(startId, 5);
      if (!Array.isArray(path)) traverseOk = false;
    } catch {
      traverseOk = false;
    }
  }
  assert(traverseOk, 'fuzz: 10 random traversals completed without crash');

  // All metrics recorded successfully
  const metrics = g.getMetrics();
  const failures = metrics.filter(m => !m.success);
  assert(failures.length === 0, `fuzz: 0 operation failures in ${metrics.length} recorded ops`);
}

// ─────────────────────────────────────────────
// 8. Real-world: Spa Booking Lineage
// ─────────────────────────────────────────────

section('8. Real-world — Spa Customer → Booking → Campaign lineage');
{
  const g = makeRuntime();

  g.addNode(makeNode('customer-vip-001', 'CUSTOMER', { tier: 'GOLD', city: 'Da Nang' }));
  g.addNode(makeNode('booking-2026-0711', 'BOOKING', { service: 'Full Body Massage', value: 1200000 }));
  g.addNode(makeNode('campaign-summer-2026', 'CAMPAIGN', { name: 'Summer Glow', budget: 50000000 }));
  g.addNode(makeNode('invoice-0711-001', 'INVOICE', { amount: 1200000, status: 'PAID' }));

  g.link('customer-vip-001', 'booking-2026-0711', 'HAS_BOOKING');
  g.link('booking-2026-0711', 'invoice-0711-001', 'GENERATES_INVOICE');
  g.link('booking-2026-0711', 'campaign-summer-2026', 'ATTRIBUTED_TO');

  const lineage = g.traverse('customer-vip-001', 5);
  assert(lineage.includes('customer-vip-001'), 'spa: customer is in lineage');
  assert(lineage.includes('booking-2026-0711'), 'spa: booking is in lineage');
  assert(lineage.includes('invoice-0711-001'), 'spa: invoice is in lineage');
  assert(lineage.includes('campaign-summer-2026'), 'spa: campaign is in lineage');
  assert(lineage.length === 4, 'spa: full lineage chain traversed correctly');
}

// ─────────────────────────────────────────────
// Final Summary
// ─────────────────────────────────────────────

results.forEach(r => console.log(r));

const total = passed + failed;
const coverage = Math.round((passed / total) * 100);

console.log('\n' + '═'.repeat(55));
console.log(' BELLA ECOS — Sprint 27: Knowledge Graph L2 Results');
console.log('═'.repeat(55));
console.log(` Total Tests : ${total}`);
console.log(` Passed      : ${passed}`);
console.log(` Failed      : ${failed}`);
console.log(` Coverage    : ~${coverage}%`);

if (failed > 0) {
  console.log('\n❌  Sprint 27 NOT PASSED — see failures above');
  process.exit(1);
} else {
  console.log('\n✅  Sprint 27 PASSED — Knowledge Graph Runtime at L2');
  console.log('   DoD Checklist:');
  console.log('   ✅ IGraphStore + InMemoryGraphStore (Persistence Abstraction)');
  console.log('   ✅ CRUD: addNode, updateNode, removeNode, getNode, getAllNodes');
  console.log('   ✅ Edges: link, unlink');
  console.log('   ✅ BFS Traversal with cycle protection');
  console.log('   ✅ Temporal Merge (version deduplication)');
  console.log('   ✅ As-Of historical queries');
  console.log('   ✅ RuntimeMetrics tracking');
  console.log('   ✅ Error handling (invalid inputs)');
  console.log('   ✅ Fuzz test: 100 nodes + 200 edges, no crash');
}
