/**
 * Infrastructure Prompt Registry
 * Versioned prompt management (`v1`, `v2`, `v3`) with approval status.
 */

export interface PromptTemplate {
  promptId: string;
  version: string;
  capabilityId: string;
  status: 'DRAFT' | 'APPROVED' | 'PRODUCTION' | 'DEPRECATED';
  systemPrompt: string;
  outputContractSchema?: string;
  createdAt: string;
}

export class PromptRegistry {
  private static instance: PromptRegistry;
  private templates = new Map<string, PromptTemplate>();

  private constructor() {
    this.seedDefaultPrompts();
  }

  public static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  private seedDefaultPrompts(): void {
    this.templates.set('prompt_cmo_strategy_v1', {
      promptId: 'prompt_cmo_strategy_v1',
      version: 'v1',
      capabilityId: 'cap_marketing',
      status: 'PRODUCTION',
      systemPrompt: `Bạn là CMO AI (Chief Marketing Officer / Executive Marketing Strategist). 
Nhiệm vụ: Đọc Canonical Context Package (ECE) và đưa ra chiến lược Phễu Lead đa kênh chuẩn hóa.`,
      createdAt: '2026-07-30T00:00:00.000Z'
    });

    this.templates.set('prompt_council_meeting_v1', {
      promptId: 'prompt_council_meeting_v1',
      version: 'v1',
      capabilityId: 'cap_council_debate',
      status: 'PRODUCTION',
      systemPrompt: `Bạn là AI Orchestrator điều phối Cuộc họp Hội đồng AI C-Suite (Executive AI Advisory Council).
Lần lượt lấy ý kiến phản biện nối tiếp từ 6 vị trí: CMO, Sales Director, Demeter HR, Ops Operations, Themis Legal, Hermes Finance và đưa ra Consensus.`,
      createdAt: '2026-07-30T00:00:00.000Z'
    });
  }

  public getPrompt(promptId: string): PromptTemplate | undefined {
    return this.templates.get(promptId);
  }

  public getProductionPromptForCapability(capabilityId: string): PromptTemplate | undefined {
    return Array.from(this.templates.values()).find(
      p => p.capabilityId === capabilityId && p.status === 'PRODUCTION'
    );
  }
}
