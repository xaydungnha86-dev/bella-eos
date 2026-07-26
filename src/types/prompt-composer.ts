/**
 * BELLA EOS PLATFORM CONTRACT: Prompt Composer Contract (IPromptComposer v1.0)
 * Specification: v18.4 BELLA EOS ENTERPRISE AI HARNESS RUNTIME (EAH)
 * 
 * Contract 29: Master Prompt Composer Interface. Generates canonical structured system
 * and user prompt payloads enclosing raw user requests inside full enterprise context.
 */

import { IEAHPackage } from './eah-package';

export interface ComposedPromptPayload {
  systemPrompt: string;
  userPrompt: string;
  enclosedContextSummary: {
    businessContextInjected: boolean;
    historyInjected: boolean;
    lessonsCount: number;
    rulesCount: number;
    skillsCount: number;
  };
}

export interface IPromptComposer {
  composeHarnessPackage(tenantId: string, rawObjective: string): Promise<IEAHPackage>;
  formatPromptPayload(harnessPackage: IEAHPackage): ComposedPromptPayload;
}
