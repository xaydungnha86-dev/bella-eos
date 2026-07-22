/**
 * BELLA EOS CORE: Runtime Composer
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Single Composition Root booting Storage, Brain, Decision, Orchestration, Execution, Governance Runtimes.
 */

import { KernelRuntimeContainer } from './kernel-container';
import { EnterpriseEventBus } from '@/infrastructure/event-bus';

export class RuntimeComposer {
  private static instance: RuntimeComposer;
  private container: KernelRuntimeContainer;
  private eventBus: EnterpriseEventBus;

  private constructor() {
    this.container = KernelRuntimeContainer.getInstance();
    this.eventBus = EnterpriseEventBus.getInstance();
  }

  public static getInstance(): RuntimeComposer {
    if (!RuntimeComposer.instance) {
      RuntimeComposer.instance = new RuntimeComposer();
    }
    return RuntimeComposer.instance;
  }

  public async composeAndBoot(): Promise<boolean> {
    // 1. Register Core Module Manifests
    this.container.registerModule({ id: 'storage-domain', name: 'Storage Domain', version: '1.0', dependencies: [] });
    this.container.registerModule({ id: 'brain-runtimes', name: 'Brain Runtimes', version: '1.0', dependencies: ['storage-domain'] });
    this.container.registerModule({ id: 'decision-runtime', name: 'Decision Runtime', version: '1.0', dependencies: ['brain-runtimes'] });
    this.container.registerModule({ id: 'orchestration-runtime', name: 'Orchestration Runtime', version: '1.0', dependencies: ['decision-runtime'] });
    this.container.registerModule({ id: 'execution-runtime', name: 'Execution Runtime', version: '1.0', dependencies: ['orchestration-runtime'] });

    // 2. Boot Container
    await this.container.boot();

    // 3. Publish System Boot Event
    await this.eventBus.publish({
      id: `evt-${Date.now()}`,
      type: 'KERNEL_BOOT_COMPLETED',
      category: 'APPLICATION',
      source: 'KernelRuntimeContainer',
      tenantId: 'system',
      timestamp: new Date().toISOString(),
      correlationId: `boot-${Date.now()}`,
      payload: { health: this.container.getHealth() },
      metadata: { eosVersion: '18.1' }
    });

    return true;
  }
}
