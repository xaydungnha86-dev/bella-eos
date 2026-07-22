/**
 * BELLA EOS EXECUTION: Service Contract Registry
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Registry holding IService implementations.
 */

import { IService } from '@/types/service';

export class ServiceContractRegistry {
  private static instance: ServiceContractRegistry;
  private services: Map<string, IService> = new Map();

  private constructor() {}

  public static getInstance(): ServiceContractRegistry {
    if (!ServiceContractRegistry.instance) {
      ServiceContractRegistry.instance = new ServiceContractRegistry();
    }
    return ServiceContractRegistry.instance;
  }

  public register(service: IService): void {
    const meta = service.metadata();
    this.services.set(meta.id, service);
  }

  public get(id: string): IService | null {
    return this.services.get(id) || null;
  }

  public list(): IService[] {
    return Array.from(this.services.values());
  }
}
