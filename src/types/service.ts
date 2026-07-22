/**
 * BELLA EOS PLATFORM CONTRACT: Service Contract Specification (IService v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Standardized interface for all Marketplace and execution services.
 */

export interface ServiceHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs?: number;
  message?: string;
}

export interface ServiceMetadata {
  id: string;
  name: string;
  version: string;
  capabilityId: string;
  provider: string;
}

export interface IService {
  metadata(): ServiceMetadata;
  validate(input: any): Promise<boolean>;
  execute(input: any): Promise<any>;
  rollback(executionId: string): Promise<boolean>;
  health(): Promise<ServiceHealth>;
}
