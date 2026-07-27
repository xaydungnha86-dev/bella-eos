/**
 * BELLA EOS - Creative Intelligence Engine v3
 * Master Orchestrator for 4-Layer Creative Intelligence Architecture
 * 
 * Pipeline:
 * Layer 1: Business Context (Data Aggregation)
 * Layer 2: Creative Reasoning (AI Understanding)
 * Layer 3: Prompt Composition (Visual Language Synthesis)
 * Layer 4: Model Adaptation (Format Optimization)
 */

import type { 
  CreativeRequest, 
  CreativeOutput,
  BusinessContextPackage,
  CreativeBrief,
  ComposedPrompt,
  ModelPrompts
} from '@/types/creative-intelligence';

import { BusinessContextAggregator } from './context/business-context-aggregator';
import { CreativeDirectorAgent } from './reasoning/creative-director-agent';
import { PromptComposer } from './composition/prompt-composer';
import { AdapterRegistryV3 } from './adapters/adapter-registry-v3';

export class CreativeIntelligenceEngine {
  
  /**
   * Generate complete creative output from request
   * Orchestrates all 4 layers
   */
  async generate(request: CreativeRequest): Promise<CreativeOutput> {
    
    const startTime = Date.now();
    
    console.log('[CreativeIntelligenceEngine] Starting 4-layer creative intelligence pipeline...');
    console.log('[CreativeIntelligenceEngine] Objective:', request.objective.substring(0, 80));
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 1: BUSINESS CONTEXT AGGREGATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('[CIE] ═══ Layer 1: Business Context Aggregation ═══');
    const layer1Start = Date.now();
    
    const aggregator = new BusinessContextAggregator();
    const businessContext = await aggregator.aggregate(request);
    
    const layer1Time = Date.now() - layer1Start;
    console.log(`[CIE] ✓ Layer 1 completed in ${layer1Time}ms`);
    console.log('[CIE] Context:', {
      budget: businessContext.enterpriseContext.budget.totalBudget.toLocaleString('vi-VN'),
      hasCopywriter: !!businessContext.copywriterContent,
      domainFacts: businessContext.knowledgeContext.domainFacts.length,
      successPatterns: businessContext.campaignMemory.successfulPatterns.length
    });
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 2: CREATIVE REASONING (LLM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('[CIE] ═══ Layer 2: Creative Reasoning (LLM) ═══');
    const layer2Start = Date.now();
    
    const creativeDirector = new CreativeDirectorAgent();
    const creativeBrief = await creativeDirector.reason(businessContext);
    
    const layer2Time = Date.now() - layer2Start;
    console.log(`[CIE] ✓ Layer 2 completed in ${layer2Time}ms`);
    console.log('[CIE] Creative Brief:', {
      goal: creativeBrief.campaignGoal.substring(0, 60),
      headline: creativeBrief.posterHeadline,
      designDirection: creativeBrief.designDirection,
      confidence: creativeBrief.confidenceScore
    });
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 3: PROMPT COMPOSITION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('[CIE] ═══ Layer 3: Prompt Composition ═══');
    const layer3Start = Date.now();
    
    const composer = new PromptComposer();
    const composedPrompt = await composer.compose(
      creativeBrief,
      request.format || '16:9'
    );
    
    const layer3Time = Date.now() - layer3Start;
    console.log(`[CIE] ✓ Layer 3 completed in ${layer3Time}ms`);
    console.log('[CIE] Composed Prompt:', {
      basePromptLength: composedPrompt.basePrompt.length,
      cameraBody: composedPrompt.technicalSpec.camera.body,
      aspectRatio: composedPrompt.technicalSpec.aspectRatio,
      negativePromptLength: composedPrompt.negativePrompt.length
    });
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 4: MODEL ADAPTATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('[CIE] ═══ Layer 4: Model Adaptation ═══');
    const layer4Start = Date.now();
    
    const modelPrompts: Partial<ModelPrompts> = {};
    const adapters = AdapterRegistryV3.getAll();
    
    for (const adapter of adapters) {
      const modelPrompt = adapter.render(composedPrompt);
      modelPrompts[adapter.modelFamily as keyof ModelPrompts] = modelPrompt;
      
      console.log(`[CIE]   → ${adapter.modelFamily}: ${modelPrompt.length} chars`);
    }
    
    const layer4Time = Date.now() - layer4Start;
    console.log(`[CIE] ✓ Layer 4 completed in ${layer4Time}ms`);
    console.log('[CIE] Model-specific prompts generated:', Object.keys(modelPrompts));
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PIPELINE COMPLETE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const totalTime = Date.now() - startTime;
    
    console.log('[CIE] ═══════════════════════════════════════════');
    console.log(`[CIE] ✓ All 4 layers completed in ${totalTime}ms`);
    console.log('[CIE] Pipeline breakdown:', {
      layer1_context: `${layer1Time}ms`,
      layer2_reasoning: `${layer2Time}ms`,
      layer3_composition: `${layer3Time}ms`,
      layer4_adaptation: `${layer4Time}ms`,
      total: `${totalTime}ms`
    });
    console.log('[CIE] ═══════════════════════════════════════════');
    
    return {
      creativeBrief,
      composedPrompt,
      modelPrompts,
      metadata: {
        generatedAt: new Date().toISOString(),
        pipelineVersion: '3.0.0',
        totalProcessingTime: totalTime
      }
    };
  }
  
  /**
   * Quick validation of generated output
   */
  private validateOutput(output: CreativeOutput): void {
    const issues: string[] = [];
    
    // Check creative brief
    if (!output.creativeBrief.posterHeadline) {
      issues.push('Missing poster headline in creative brief');
    }
    
    if (output.creativeBrief.confidenceScore < 0.5) {
      issues.push(`Low confidence score: ${output.creativeBrief.confidenceScore}`);
    }
    
    // Check composed prompt
    if (output.composedPrompt.basePrompt.length < 100) {
      issues.push('Base prompt too short');
    }
    
    // Check model prompts
    const modelCount = Object.keys(output.modelPrompts).length;
    if (modelCount === 0) {
      issues.push('No model-specific prompts generated');
    }
    
    if (issues.length > 0) {
      console.warn('[CreativeIntelligenceEngine] Validation issues:', issues);
    }
  }
  
  /**
   * Get supported AI models
   */
  static getSupportedModels(): string[] {
    return AdapterRegistryV3.getSupportedModels();
  }
  
  /**
   * Check if specific model is supported
   */
  static isModelSupported(modelFamily: string): boolean {
    return AdapterRegistryV3.has(modelFamily);
  }
}
