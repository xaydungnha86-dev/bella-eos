/**
 * BELLA EOS PLATFORM CONTRACT: Experiment Payload Contract (IExperimentPayload v1.0)
 * Specification: v18.7 BELLA EOS ENTERPRISE EXPERIMENTATION RUNTIME (EERX)
 * 
 * Contract 37: Controlled Enterprise A/B/C Experimentation Contract.
 * Manages hypothesis testing, variant rollouts, sample sizing, and winner variant selection.
 */

export interface ExperimentVariant {
  variantId: string;
  variantName: string;
  description?: string;
  trafficAllocationPercentage: number;
  observedRoiPercentage?: number;
}

export interface IExperimentPayload {
  experimentId: string;
  tenantId: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  sampleSizeTarget: number;
  winnerVariantId?: string;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
}
