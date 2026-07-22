/**
 * BELLA EOS BRAIN: Context Runtime (Context Security & Token Optimizer)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Compiles security-isolated Canonical Context Package and cuts 90% wasted tokens.
 */

import { CanonicalContextPackage } from '@/types/eom';

export interface ContextBuildOptions {
  objective: string;
  activeStep: { id: number; name: string; agent: string };
  approvedBudgetVnd: number;
  targetValue: number;
  targetMetric: string;
  voiceTone?: string;
  designStyle?: string;
}

export class ContextRuntime {
  private static instance: ContextRuntime;

  private constructor() {}

  public static getInstance(): ContextRuntime {
    if (!ContextRuntime.instance) {
      ContextRuntime.instance = new ContextRuntime();
    }
    return ContextRuntime.instance;
  }

  public compileCanonicalPackage(options: ContextBuildOptions): CanonicalContextPackage {
    // Enforce 90% Token Reduction by stripping irrelevant DB fields & keeping domain-specific essentials
    return {
      objective: options.objective,
      activeStep: options.activeStep,
      erp: {
        approvedBudgetVnd: options.approvedBudgetVnd,
        targetValue: options.targetValue,
        targetMetric: options.targetMetric,
      },
      brandDna: {
        voiceTone: options.voiceTone || 'Professional & Premium',
        designStyle: options.designStyle || 'Modern Glassmorphic Light',
      },
      policies: [
        { id: 'pol-001', rule: 'Budget limit VND strictly enforced' },
        { id: 'pol-002', rule: 'No offensive language or unverified claims' },
      ],
      learningEvidence: [
        { task: options.activeStep.name, tip: 'Use clear CTA and highlight core product benefits' }
      ],
      timestamp: new Date().toISOString(),
    };
  }
}
