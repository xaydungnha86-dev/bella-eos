/**
 * BELLA EOS ERL: Root Cause Runtime
 * Specification: ERL Diagnostics Engine
 * 
 * Mission: Expanded 9-vector failure attribution engine.
 */

import { IErlRootCause } from '@/types/erl';

export class ErlRootCauseRuntime {
  private static instance: ErlRootCauseRuntime;

  private constructor() {}

  public static getInstance(): ErlRootCauseRuntime {
    if (!ErlRootCauseRuntime.instance) {
      ErlRootCauseRuntime.instance = new ErlRootCauseRuntime();
    }
    return ErlRootCauseRuntime.instance;
  }

  /**
   * Distributes failure percentages across 9 platform variables (summing to 100%).
   */
  public diagnoseFailure(objective: string, errorMsg: string): IErlRootCause {
    const cleanMsg = errorMsg.toLowerCase();
    
    let knowledge = 10;
    let prompt = 10;
    let retriever = 10;
    let policy = 10;
    let reasoning = 10;
    let tool = 10;
    let runtime = 10;
    let human = 10;
    let api = 10;

    if (cleanMsg.includes('recall') || cleanMsg.includes('retrieve') || cleanMsg.includes('document')) {
      retriever = 60;
      knowledge = 20;
      prompt = 10;
      policy = 2; reasoning = 2; tool = 2; runtime = 2; human = 1; api = 1;
    } else if (cleanMsg.includes('prompt') || cleanMsg.includes('system') || cleanMsg.includes('instruction')) {
      prompt = 60;
      reasoning = 20;
      knowledge = 10;
      retriever = 2; policy = 2; tool = 2; runtime = 2; human = 1; api = 1;
    } else if (cleanMsg.includes('limit') || cleanMsg.includes('policy') || cleanMsg.includes('denied') || cleanMsg.includes('restrict')) {
      policy = 70;
      reasoning = 10;
      prompt = 10;
      knowledge = 2; retriever = 2; tool = 2; runtime = 1; human = 1; api = 1;
    } else if (cleanMsg.includes('tool') || cleanMsg.includes('api') || cleanMsg.includes('network') || cleanMsg.includes('http')) {
      tool = 40;
      api = 30;
      runtime = 10;
      knowledge = 4; prompt = 4; retriever = 4; policy = 4; reasoning = 2; human = 2;
    } else {
      // General reasoning breakdown
      reasoning = 40;
      prompt = 20;
      knowledge = 20;
      retriever = 5; policy = 5; tool = 2; runtime = 2; human = 3; api = 3;
    }

    return {
      knowledgeAttribution: knowledge,
      promptAttribution: prompt,
      retrieverAttribution: retriever,
      policyAttribution: policy,
      reasoningAttribution: reasoning,
      toolAttribution: tool,
      runtimeAttribution: runtime,
      humanAttribution: human,
      apiAttribution: api
    };
  }
}
