/**
 * BELLA EOS PLATFORM CONTRACT: Strategic Roadmap Contract (IStrategicRoadmap v1.0)
 * Specification: v19.0 BELLA EOS ENTERPRISE STRATEGIC OPERATING SYSTEM (ESOS)
 * 
 * Contract 46: 3-5 Year Corporate Strategic Roadmap Contract.
 * Defines long-term enterprise vision, strategic pillars, growth milestones, and 3-5 year corporate trajectories.
 */

export interface StrategicPillar {
  pillarId: string;
  title: string;
  description: string;
  priorityOrder: number;
  targetKpi: string;
}

export interface IStrategicRoadmap {
  roadmapId: string;
  tenantId: string;
  timeHorizonYears: number; // 3 or 5 years
  corporateVision: string;
  strategicPillars: StrategicPillar[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}
