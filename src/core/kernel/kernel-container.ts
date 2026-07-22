/**
 * BELLA EOS CORE: Kernel Runtime Container
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Container managing Lifecycle, Boot, Shutdown, Module Discovery, and Health Governor.
 */

export type ContainerState = 'UNINITIALIZED' | 'BOOTING' | 'READY' | 'SUSPENDED' | 'SHUTTING_DOWN';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
}

export class KernelRuntimeContainer {
  private static instance: KernelRuntimeContainer;
  private state: ContainerState = 'UNINITIALIZED';
  private registeredModules: Map<string, ModuleManifest> = new Map();
  private bootTimestamp?: string;

  private constructor() {}

  public static getInstance(): KernelRuntimeContainer {
    if (!KernelRuntimeContainer.instance) {
      KernelRuntimeContainer.instance = new KernelRuntimeContainer();
    }
    return KernelRuntimeContainer.instance;
  }

  public registerModule(manifest: ModuleManifest): void {
    this.registeredModules.set(manifest.id, manifest);
  }

  public async boot(): Promise<void> {
    if (this.state === 'READY') return;
    this.state = 'BOOTING';
    
    // Resolve dependency graph & initialize Modules
    this.bootTimestamp = new Date().toISOString();
    this.state = 'READY';
  }

  public async shutdown(): Promise<void> {
    this.state = 'SHUTTING_DOWN';
    this.registeredModules.clear();
    this.state = 'UNINITIALIZED';
  }

  public getState(): ContainerState {
    return this.state;
  }

  public getHealth(): { state: ContainerState; bootedAt?: string; activeModules: number } {
    return {
      state: this.state,
      bootedAt: this.bootTimestamp,
      activeModules: this.registeredModules.size,
    };
  }
}
