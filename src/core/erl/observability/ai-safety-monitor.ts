/**
 * BELLA EOS ERL: AI Safety Monitor
 * Specification: ERL Observability Engine
 * 
 * Mission: Log prompt injections, PII leaks, unsafe outputs, and policy violations.
 */

import { IAiSafetyMetrics } from '@/types/erl';

export class AiSafetyMonitor {
  private static instance: AiSafetyMonitor;
  private unsafeOutputs: number = 0;
  private promptInjections: number = 0;
  private piiLeaks: number = 0;
  private policyViolations: number = 0;

  private constructor() {
    this.seedSafetyData();
  }

  public static getInstance(): AiSafetyMonitor {
    if (!AiSafetyMonitor.instance) {
      AiSafetyMonitor.instance = new AiSafetyMonitor();
    }
    return AiSafetyMonitor.instance;
  }

  public logSafetyEvent(type: 'INJECTION' | 'PII' | 'UNSAFE' | 'VIOLATION'): void {
    switch (type) {
      case 'INJECTION':
        this.promptInjections++;
        break;
      case 'PII':
        this.piiLeaks++;
        break;
      case 'UNSAFE':
        this.unsafeOutputs++;
        break;
      case 'VIOLATION':
        this.policyViolations++;
        break;
    }
  }

  public getMetrics(): IAiSafetyMetrics {
    return {
      unsafeOutputsCount: this.unsafeOutputs,
      promptInjectionsCount: this.promptInjections,
      piiLeaksCount: this.piiLeaks,
      policyViolationsCount: this.policyViolations
    };
  }

  private seedSafetyData(): void {
    this.promptInjections = 2;
    this.unsafeOutputs = 0;
    this.piiLeaks = 0;
    this.policyViolations = 1;
  }
}
