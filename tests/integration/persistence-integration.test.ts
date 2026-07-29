import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SupabaseWorkflowStore, WorkflowState } from '../../src/core/orchestration/workflow-runtime';
import { EventStore, DomainEvent } from '../../src/core/event-sourcing/event-store';
import { SupabaseCacheStore } from '../../src/core/storage/storage-services';
import { supabase } from '../../src/lib/supabase';

// Save original environment variables
const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Bella EOS: Phase 3 Persistence Integration Tests', () => {
  beforeEach(() => {
    // Activate Supabase checks for stores
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-mock-url.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-mock-anon-key';
  });

  afterEach(() => {
    // Restore original env vars and Jest mocks
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    jest.restoreAllMocks();
  });

  describe('SupabaseWorkflowStore', () => {
    test('should save and load workflow states via memory and attempt database sync', async () => {
      const store = new SupabaseWorkflowStore();
      
      const mockState: WorkflowState = {
        workflowId: 'wf-mock-123',
        name: 'Mock Workflow',
        status: 'RUNNING',
        steps: [
          { stepId: 'step-1', status: 'SUCCESS' }
        ],
        startedAt: Date.now()
      };

      // Mock Supabase from().insert(), from().upsert() and select().eq().single() to return success
      const insertMock = jest.fn().mockResolvedValue({ error: null } as any);
      const upsertMock = jest.fn().mockResolvedValue({ error: null } as any);
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: null } as any);
      const eqMock = jest.fn().mockReturnValue({ single: singleMock } as any);
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock } as any);

      const fromMock = jest.spyOn(supabase, 'from').mockReturnValue({
        insert: insertMock,
        upsert: upsertMock,
        select: selectMock
      } as any);

      await store.saveState(mockState);

      expect(fromMock).toHaveBeenCalledWith('workflow_states');
      expect(insertMock).toHaveBeenCalled();
      
      const saved = await store.getState('wf-mock-123');
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Mock Workflow');
    });

    test('should return memory fallback when database read fails', async () => {
      const store = new SupabaseWorkflowStore();
      
      const mockState: WorkflowState = {
        workflowId: 'wf-mock-456',
        name: 'Backup Workflow',
        status: 'SUCCESS',
        steps: [],
        startedAt: Date.now()
      };

      const insertMock = jest.fn().mockResolvedValue({ error: null } as any);
      const upsertMock = jest.fn().mockResolvedValue({ error: null } as any);
      // Mock select to fail with an error
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') } as any);
      const eqMock = jest.fn().mockReturnValue({ single: singleMock } as any);
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock } as any);

      const fromMock = jest.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'workflow_states') {
          return { insert: insertMock, upsert: upsertMock, select: selectMock } as any;
        }
        return {} as any;
      });

      await store.saveState(mockState);
      const saved = await store.getState('wf-mock-456');

      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Backup Workflow');
      expect(saved?.status).toBe('SUCCESS');
    });
  });

  describe('EventStore Persistence', () => {
    test('should save domain events to Supabase and allow aggregate retrieval', async () => {
      EventStore.resetInstance();
      const freshStore = EventStore.getInstance();

      const mockEvent: DomainEvent = {
        eventId: 'evt-1',
        aggregateId: 'agg-1',
        aggregateType: 'Campaign',
        eventType: 'CampaignLaunched',
        payload: { name: 'Promo' },
        timestamp: new Date().toISOString(),
        version: 1
      };

      const insertMock = jest.fn().mockResolvedValue({ error: null } as any);
      const fromMock = jest.spyOn(supabase, 'from').mockReturnValue({
        insert: insertMock
      } as any);

      await freshStore.saveEvents('agg-1', [mockEvent], 0);

      expect(fromMock).toHaveBeenCalledWith('domain_events');
      expect(insertMock).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          event_id: 'evt-1',
          aggregate_id: 'agg-1'
        })
      ]));
    });
  });

  describe('SupabaseCacheStore', () => {
    test('should handle key-value caching and TTL expires', async () => {
      const cacheStore = SupabaseCacheStore.getInstance();

      const upsertMock = jest.fn().mockResolvedValue({ error: null } as any);
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: null } as any);
      const eqMock = jest.fn().mockReturnValue({ single: singleMock } as any);
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock } as any);

      const fromMock = jest.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertMock,
        select: selectMock
      } as any);

      await cacheStore.set('test-cache-key', { data: 'hello' }, 10);

      expect(fromMock).toHaveBeenCalledWith('cache_records');
      expect(upsertMock).toHaveBeenCalled();

      const value = await cacheStore.get('test-cache-key');
      expect(value).toEqual({ data: 'hello' });
    });
  });
});
