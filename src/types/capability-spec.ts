/**
 * BELLA EOS PLATFORM CONTRACT: Capability Specification Contract (ICapabilitySpecification v1.0)
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Contract CORE-08: Enterprise Capability Mapping Contract.
 * Maps high-level enterprise capabilities (e.g. Revenue Forecasting, Therapist Scheduling, Customer Voice Analysis)
 * to underlying Services, Workflows, Skill Packs, LLM models, and Required Permissions.
 */

export interface ICapabilitySpecification {
  capabilityId: string;
  capabilityName: string;
  category: 'MARKETING' | 'SALES' | 'FINANCE' | 'OPERATIONS' | 'STRATEGY' | 'HR' | 'LEGAL' | 'IT';
  mappedServiceId: string;
  requiredSkillPack: string;
  requiredModel: string;
  requiredPermission: string;
  status: 'ACTIVE' | 'DEPRECATED';
}
