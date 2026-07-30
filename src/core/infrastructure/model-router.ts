/**
 * Infrastructure Model Router
 * Policy-driven routing of LLM requests to optimal model providers.
 */

export interface ModelRoutingPolicy {
  capabilityId: string;
  preferredProvider: 'gemini' | 'openai' | 'anthropic' | 'local';
  preferredModel: string;
  fallbackChain: { provider: 'gemini' | 'openai' | 'anthropic' | 'local'; model: string }[];
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  maxTokens: number;
  temperature: number;
}

export class ModelRouter {
  private static instance: ModelRouter;
  private policies = new Map<string, ModelRoutingPolicy>();

  private constructor() {
    this.seedDefaultRoutingPolicies();
  }

  public static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  private seedDefaultRoutingPolicies(): void {
    // Marketing & Council Strategy -> Gemini 2.5 Flash / GPT-4o
    this.policies.set('cap_marketing', {
      capabilityId: 'cap_marketing',
      preferredProvider: 'gemini',
      preferredModel: 'gemini-2.5-flash',
      fallbackChain: [
        { provider: 'openai', model: 'gpt-4o' },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }
      ],
      confidentialityLevel: 'INTERNAL',
      maxTokens: 3000,
      temperature: 0.3
    });

    // Legal & Compliance -> Claude / GPT-4o (high reasoning)
    this.policies.set('cap_legal_compliance', {
      capabilityId: 'cap_legal_compliance',
      preferredProvider: 'anthropic',
      preferredModel: 'claude-3-5-sonnet-20241022',
      fallbackChain: [
        { provider: 'openai', model: 'gpt-4o' },
        { provider: 'gemini', model: 'gemini-2.5-flash' }
      ],
      confidentialityLevel: 'CONFIDENTIAL',
      maxTokens: 2000,
      temperature: 0.2
    });

    // Content & Creative -> Gemini / DALL-E
    this.policies.set('cap_content_writing', {
      capabilityId: 'cap_content_writing',
      preferredProvider: 'gemini',
      preferredModel: 'gemini-2.5-flash',
      fallbackChain: [
        { provider: 'openai', model: 'gpt-4o' }
      ],
      confidentialityLevel: 'PUBLIC',
      maxTokens: 2000,
      temperature: 0.7
    });
  }

  public getPolicy(capabilityId: string): ModelRoutingPolicy {
    return this.policies.get(capabilityId) || {
      capabilityId,
      preferredProvider: 'gemini',
      preferredModel: 'gemini-2.5-flash',
      fallbackChain: [{ provider: 'openai', model: 'gpt-4o' }],
      confidentialityLevel: 'INTERNAL',
      maxTokens: 2000,
      temperature: 0.3
    };
  }

  public resolveModelTarget(capabilityId: string, availableKeys: { gemini?: string; openai?: string; anthropic?: string }): {
    provider: string;
    model: string;
    apiKey: string;
  } {
    const policy = this.getPolicy(capabilityId);

    if (policy.preferredProvider === 'gemini' && availableKeys.gemini) {
      return { provider: 'gemini', model: policy.preferredModel, apiKey: availableKeys.gemini };
    }
    if (policy.preferredProvider === 'openai' && availableKeys.openai) {
      return { provider: 'openai', model: policy.preferredModel, apiKey: availableKeys.openai };
    }
    if (policy.preferredProvider === 'anthropic' && availableKeys.anthropic) {
      return { provider: 'anthropic', model: policy.preferredModel, apiKey: availableKeys.anthropic };
    }

    // Try fallback chain
    for (const fb of policy.fallbackChain) {
      if (fb.provider === 'gemini' && availableKeys.gemini) return { provider: 'gemini', model: fb.model, apiKey: availableKeys.gemini };
      if (fb.provider === 'openai' && availableKeys.openai) return { provider: 'openai', model: fb.model, apiKey: availableKeys.openai };
      if (fb.provider === 'anthropic' && availableKeys.anthropic) return { provider: 'anthropic', model: fb.model, apiKey: availableKeys.anthropic };
    }

    return { provider: 'rule-based', model: 'rule-engine-v1', apiKey: '' };
  }
}
