import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { WorkflowRuntime, WorkflowState, SupabaseWorkflowStore, SagaStep } from '../../src/core/orchestration/workflow-runtime';
import { EventStore, DomainEvent } from '../../src/core/event-sourcing/event-store';
import { supabase } from '../../src/lib/supabase';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Bella EOS: Phase 4 Persistence Reliability & Resilience Tests', () => {
  beforeEach(() => {
    // Keep Supabase check disabled so we test both fallbacks and simulated concurrency in memory
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    WorkflowRuntime.resetInstance();
    EventStore.resetInstance();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.restoreAllMocks();
  });

  describe('1. Optimistic Concurrency Control (OCC)', () => {
    test('should prevent dirty writes via version check and throw concurrency error', async () => {
      const store = new SupabaseWorkflowStore();

      const initialState: WorkflowState = {
        workflowId: 'wf-occ-test',
        name: 'OCC Test Workflow',
        status: 'PENDING',
        steps: [],
        startedAt: Date.now(),
        version: 1
      };

      // Initial save (inserts version 1)
      await store.saveState(initialState);

      // Thread A loads state
      const stateA = await store.getState('wf-occ-test');
      expect(stateA?.version).toBe(1);

      // Thread B loads state simultaneously
      const stateB = await store.getState('wf-occ-test');
      expect(stateB?.version).toBe(1);

      // Thread A saves update first (succeeds, version increments to 2)
      stateA!.status = 'RUNNING';
      await store.saveState(stateA!);

      // Thread B attempts to save its update using stale version = 1
      stateB!.status = 'FAILED';
      
      await expect(store.saveState(stateB!)).rejects.toThrow(/concurrency conflict/i);
    });
  });

  describe('2. Saga Workflow Crash Recovery', () => {
    test('should resume an interrupted workflow, skipping already succeeded steps', async () => {
      const store = new SupabaseWorkflowStore();
      const runtime = WorkflowRuntime.getInstance(store);

      let step1Executed = 0;
      let step2Executed = 0;
      let step3Executed = 0;

      const steps: SagaStep[] = [
        {
          stepId: 'step-recover-1',
          action: async () => {
            step1Executed++;
            return true;
          },
          compensate: async () => {}
        },
        {
          stepId: 'step-recover-2',
          action: async () => {
            step2Executed++;
            return true;
          },
          compensate: async () => {}
        },
        {
          stepId: 'step-recover-3',
          action: async () => {
            step3Executed++;
            return true;
          },
          compensate: async () => {}
        }
      ];

      // Initialize and seed the state directly to simulate a sudden worker crash
      // after Step 1 finishes SUCCESS, but before Step 2 begins execution.
      const crashedState: WorkflowState = {
        workflowId: 'wf-crash-rec',
        name: 'Recoverable Campaign',
        status: 'RUNNING',
        steps: [
          { stepId: 'step-recover-1', status: 'SUCCESS' },
          { stepId: 'step-recover-2', status: 'PENDING' },
          { stepId: 'step-recover-3', status: 'PENDING' }
        ],
        startedAt: Date.now(),
        version: 1
      };
      
      // Seed directly into store
      await store.saveState(crashedState);

      // Resume execution
      const resultSecondRun = await runtime.resumeWorkflow('wf-crash-rec', steps);
      expect(resultSecondRun).toBe(true);

      // Verify execution counts
      expect(step1Executed).toBe(0); // Skipped entirely because status was SUCCESS
      expect(step2Executed).toBe(1); // Executed successfully
      expect(step3Executed).toBe(1); // Executed successfully
    });
  });

  describe('3. Event Sourcing Idempotency', () => {
    test('should ignore duplicate events with identical eventId or idempotencyKey', async () => {
      const eventStore = EventStore.getInstance();

      const event: DomainEvent = {
        eventId: 'evt-unique-100',
        aggregateId: 'agg-unique-100',
        aggregateType: 'Campaign',
        eventType: 'CampaignLaunched',
        payload: { promo: 'Summer' },
        timestamp: new Date().toISOString(),
        version: 1,
        idempotencyKey: 'idem-key-100'
      };

      // Save first time
      await eventStore.saveEvents('agg-unique-100', [event], 0);

      // Save second time (identical event)
      await eventStore.saveEvents('agg-unique-100', [event], 0);

      const allEvents = await eventStore.getAllEvents();
      const matches = allEvents.filter(e => e.eventId === 'evt-unique-100');
      
      expect(matches.length).toBe(1); // Should only have 1 copy saved
    });
  });

  describe('4. Trace ID Propagation (Observability)', () => {
    test('should propagate traceId through Saga execution to saved state and turn logs', async () => {
      const store = new SupabaseWorkflowStore();
      const runtime = WorkflowRuntime.getInstance(store);

      const steps: SagaStep[] = [
        {
          stepId: 'step-trace-1',
          action: async () => true,
          compensate: async () => {}
        }
      ];

      const traceId = 'trace-obs-9999-uuid';
      const success = await runtime.executeSaga('wf-trace-obs', 'Trace Campaign', steps, traceId);
      expect(success).toBe(true);

      const savedState = await store.getState('wf-trace-obs');
      expect(savedState?.traceId).toBe(traceId);

      // Verify that Turn Telemetry log recorded the traceId
      const turnLogs = runtime.getTurnTelemetries();
      const traceLog = turnLogs.find(t => t.workflowId === 'wf-trace-obs');
      expect(traceLog).toBeDefined();
      expect(traceLog?.traceId).toBe(traceId);
    });
  });
});
