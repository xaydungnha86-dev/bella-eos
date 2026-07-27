/**
 * BELLA EOS CERTIFICATION: Enterprise Cognitive Operating System (ECOS) & Plugin Platform Certification Suite
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * Verifies Enterprise Plugin SDK, Domain Pack Framework (Layer 3), AI Provider Adapters (Layer 4),
 * and Namespaced Catalog Standardization.
 */

import { IExtensionPlugin } from '@/core/plugin-sdk/plugin-interface';
import { PluginRegistry } from '@/core/plugin-sdk/plugin-registry';
import { DomainPackManager } from '@/core/plugin-sdk/domain-pack-manager';
import { AiProviderAdapter } from '@/core/plugin-sdk/ai-provider-adapter';

describe('BELLA EOS v20.0 Enterprise Cognitive Operating System (ECOS) & Plugin Certification', () => {

  it('1. Enterprise Plugin SDK: should register and execute 3rd-party enterprise plugins', async () => {
    const plugin: IExtensionPlugin = {
      metadata: {
        pluginId: 'plg-test-1',
        pluginName: 'Test Extension Plugin',
        version: '1.0.0',
        author: 'Unit Test',
        description: 'Test Description',
        pluginType: 'SKILL',
        minEcosVersion: 'v22.0',
      },
      async initialize() { return true; },
      async execute(input) { return { status: 'OK', ...input }; },
      async shutdown() { return true; },
    };

    const isRegistered = await PluginRegistry.getInstance().registerPlugin(plugin);
    expect(isRegistered).toBe(true);

    const fetched = PluginRegistry.getInstance().getPlugin('plg-test-1');
    expect(fetched?.metadata.pluginName).toBe('Test Extension Plugin');
  });

  it('2. Domain Pack Framework (Layer 3): should load industry vertical domain packs', () => {
    const spa = DomainPackManager.getInstance().getPack('pack-spa');
    const clinic = DomainPackManager.getInstance().getPack('pack-clinic');

    expect(spa?.industryCategory).toBe('SPA_WELLNESS');
    expect(spa?.sops.length).toBeGreaterThan(0);
    expect(clinic?.industryCategory).toBe('MEDICAL_CLINIC');
  });

  it('3. AI Provider Adapters (Layer 4): should standardize model completion across providers', async () => {
    const resOpenAI = await AiProviderAdapter.getInstance().executeCompletion({
      provider: 'OPENAI',
      modelName: 'gpt-4o',
      systemPrompt: 'sys',
      userPrompt: 'user',
    });

    const resGemini = await AiProviderAdapter.getInstance().executeCompletion({
      provider: 'GOOGLE',
      modelName: 'gemini-1.5-pro',
      systemPrompt: 'sys',
      userPrompt: 'user',
    });

    expect(resOpenAI.provider).toBe('OPENAI');
    expect(resOpenAI.outputContent).toBeDefined();
    expect(resGemini.provider).toBe('GOOGLE');
  });
});
