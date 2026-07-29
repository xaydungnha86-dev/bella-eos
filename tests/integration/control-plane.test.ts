import { describe, test, expect, beforeEach } from '@jest/globals';
import { EnterpriseEventBus } from '@/core/event-bus/event-bus';
import { RuntimeSupervisor } from '@/core/supervisor/runtime-supervisor';
import { ExecutiveIntelligenceRuntime } from '@/core/eir/executive-intelligence-runtime';
import { PlanningRuntime } from '@/core/plr/planning-runtime';
import { EnterpriseCapabilityRegistry } from '@/core/capability/capability-registry';
import { ECOSExecutionEngine, SagaStep, TaskDefinition } from '@/core/execution/task-runner';
import { RuntimeEvent, Capability } from '@/types/runtime-contract';

describe('E-COS Control Plane & Event Mesh Tests', () => {
  let eventBus: EnterpriseEventBus;
  let supervisor: RuntimeSupervisor;
  let eir: ExecutiveIntelligenceRuntime;
  let plr: PlanningRuntime;
  let registry: EnterpriseCapabilityRegistry;
  let executionEngine: ECOSExecutionEngine;

  beforeEach(() => {
    eventBus = new EnterpriseEventBus();
    supervisor = new RuntimeSupervisor();
    eir = new ExecutiveIntelligenceRuntime();
    plr = new PlanningRuntime();
    registry = new EnterpriseCapabilityRegistry();
    executionEngine = new ECOSExecutionEngine();
  });

  describe('1. Enterprise Event Bus', () => {
    test('should route events using wildcard pattern matching', async () => {
      const receivedEvents: RuntimeEvent[] = [];

      eventBus.subscribe('marketing.*', (event) => {
        receivedEvents.push(event);
      });

      const event1: RuntimeEvent = {
        eventId: 'evt-1',
        correlationId: 'corr-1',
        name: 'marketing.campaign.started',
        source: 'test',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        payload: { id: 'camp-1' }
      };

      const event2: RuntimeEvent = {
        eventId: 'evt-2',
        correlationId: 'corr-1',
        name: 'sales.invoice.paid',
        source: 'test',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        payload: { id: 'inv-1' }
      };

      await eventBus.publish(event1);
      await eventBus.publish(event2);

      expect(receivedEvents.length).toBe(1);
      expect(receivedEvents[0].name).toBe('marketing.campaign.started');
    });
  });

  describe('2. Runtime Supervisor & Lifecycle', () => {
    test('should manage start, stop, pause transitions', async () => {
      supervisor.registerRuntime('eir', eir);
      supervisor.registerRuntime('plr', plr);

      const regEir = supervisor.getRuntime('eir')!;
      const regPlr = supervisor.getRuntime('plr')!;

      expect(regEir.status).toBe('stopped');
      expect(regPlr.status).toBe('stopped');
      expect(eir.getLifecycleState()).toBe('stopped');

      await supervisor.initAll({
        eir: { maxIter: 5 },
        plr: { checkConflicts: true }
      });

      expect(regEir.status).toBe('initialized');
      expect(eir.getLifecycleState()).toBe('initialized');

      await supervisor.startAll();
      expect(regEir.status).toBe('running');
      expect(eir.getLifecycleState()).toBe('running');

      await supervisor.pauseAll();
      expect(regEir.status).toBe('paused');
      expect(eir.getLifecycleState()).toBe('paused');

      await supervisor.stopAll();
      expect(regEir.status).toBe('stopped');
      expect(eir.getLifecycleState()).toBe('stopped');
    });

    test('should auto-heal unhealthy runtimes by triggering restart recovery', async () => {
      supervisor.registerRuntime('eir', eir);
      await supervisor.startAll();

      const reg = supervisor.getRuntime('eir')!;
      expect(reg.status).toBe('running');
      expect(reg.restartCount).toBe(0);

      // Simulate runtime going unhealthy
      eir.setHealthStatus('unhealthy');

      // Supervisor health cycle
      const report = await supervisor.checkAndHeal();
      expect(report.eir).toBe('recovering');
      
      // Verify auto-recovered state
      expect(reg.status).toBe('running');
      expect(reg.restartCount).toBe(1);
      expect(eir.getLifecycleState()).toBe('running');
    });
  });

  describe('3. Capability Registry & Sandboxing', () => {
    test('should resolve SemVer matching dependencies', async () => {
      const mockCap: Capability = {
        descriptor: {
          id: 'test.cap.forecast',
          name: 'Forecast Plugin',
          version: '1.0.0',
          description: 'Runs dynamic models',
          author: 'Bella Devs',
          dependencies: [
            { capabilityId: 'test.cap.db', versionRange: '^1.0.0' }
          ],
          permissions: {
            network: { allowedDomains: [] },
            fileSystem: { readablePaths: [], writablePaths: [] },
            environmentVariables: []
          }
        },
        onLoad: async () => {},
        onUnload: async () => {}
      };

      const mockDbCap: Capability = {
        descriptor: {
          id: 'test.cap.db',
          name: 'DB Connector',
          version: '1.2.0',
          description: 'Allows db operations',
          author: 'Bella Devs',
          dependencies: [],
          permissions: {
            network: { allowedDomains: [] },
            fileSystem: { readablePaths: [], writablePaths: [] },
            environmentVariables: []
          }
        },
        onLoad: async () => {},
        onUnload: async () => {}
      };

      await registry.register(mockCap);
      await registry.register(mockDbCap);

      const resolved = registry.resolveDependencies('test.cap.forecast', '1.0.0');
      expect(resolved).toBe(true);

      const capInstance = await registry.get<Capability>('test.cap.forecast');
      expect(capInstance.descriptor.version).toBe('1.0.0');
    });
  });

  describe('4. Idempotency, Retries, and Sagas', () => {
    test('should cache and reuse outputs of identical task runs', async () => {
      let runCount = 0;
      const task: TaskDefinition = {
        name: 'optimize-campaign',
        correlationId: 'corr-id-123',
        inputs: { budget: 50, durationWeeks: 4 },
        execute: async () => {
          runCount++;
          return { success: true, count: runCount };
        }
      };

      // Run 1
      const res1 = await executionEngine.executeIdempotent(task);
      // Run 2
      const res2 = await executionEngine.executeIdempotent(task);

      expect(runCount).toBe(1);
      expect(res1.count).toBe(1);
      expect(res2.count).toBe(1);
    });

    test('should retry operations using exponential backoff', async () => {
      let attempts = 0;
      const failingOp = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Timeout error');
        }
        return 'success-payload';
      };

      const res = await executionEngine.executeWithRetry(failingOp, {
        maxAttempts: 3,
        baseDelay: 10,
        maxDelay: 50
      });

      expect(attempts).toBe(3);
      expect(res).toBe('success-payload');
    });

    test('should roll back saga steps in reverse order on failure', async () => {
      const rollbackLog: string[] = [];

      const step1: SagaStep = {
        id: 'reserve-budget',
        execute: async () => 'budget-reserved',
        compensate: async () => { rollbackLog.push('step1-reverted'); }
      };

      const step2: SagaStep = {
        id: 'allocate-workforce',
        execute: async () => 'workforce-allocated',
        compensate: async () => { rollbackLog.push('step2-reverted'); }
      };

      const step3: SagaStep = {
        id: 'dispatch-campaign',
        execute: async () => {
          throw new Error('Network server down');
        },
        compensate: async () => { rollbackLog.push('step3-reverted'); }
      };

      await expect(
        executionEngine.executeSaga([step1, step2, step3])
      ).rejects.toThrow('Network server down');

      expect(rollbackLog.length).toBe(2);
      expect(rollbackLog[0]).toBe('step2-reverted'); // Reverse order!
      expect(rollbackLog[1]).toBe('step1-reverted');
    });
  });
});
