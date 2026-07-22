/**
 * BELLA EOS CQRS: Projection Engine
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Transforms Enterprise Events into optimized CQRS Read Models for Realtime UI Consoles.
 */

import { EnterpriseEvent } from '@/types/events';

export interface CampaignReadModel {
  campaignId: string;
  name: string;
  status: string;
  totalSpentUsd: number;
  generatedRevenueVnd: number;
  lastUpdated: string;
}

export class ProjectionEngine {
  private static instance: ProjectionEngine;
  private readModels: Map<string, CampaignReadModel> = new Map();

  private constructor() {}

  public static getInstance(): ProjectionEngine {
    if (!ProjectionEngine.instance) {
      ProjectionEngine.instance = new ProjectionEngine();
    }
    return ProjectionEngine.instance;
  }

  public projectEvent(event: EnterpriseEvent): void {
    if (event.type === 'CAMPAIGN_UPDATED' || event.type === 'CAMPAIGN_LAUNCHED') {
      const payload = event.payload || {};
      const campaignId = payload.campaignId || event.correlationId;

      const existing = this.readModels.get(campaignId) || {
        campaignId,
        name: payload.name || 'Enterprise Campaign',
        status: payload.status || 'RUNNING',
        totalSpentUsd: 0,
        generatedRevenueVnd: 0,
        lastUpdated: event.timestamp,
      };

      if (payload.spentUsd) existing.totalSpentUsd += payload.spentUsd;
      if (payload.revenueVnd) existing.generatedRevenueVnd += payload.revenueVnd;
      existing.lastUpdated = event.timestamp;

      this.readModels.set(campaignId, existing);
    }
  }

  public getReadModel(campaignId: string): CampaignReadModel | null {
    return this.readModels.get(campaignId) || null;
  }

  public listReadModels(): CampaignReadModel[] {
    return Array.from(this.readModels.values());
  }
}
