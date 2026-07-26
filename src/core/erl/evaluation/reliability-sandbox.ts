/**
 * BELLA EOS ERL: Reliability Sandbox & Experiment Registry
 * Specification: ERL Evaluation Engine
 * 
 * Mission: Run isolated trial evaluations for prompt/RAG parameters, and register experiment logs.
 */

import { IReliabilityExperiment } from '@/types/erl';

export class ReliabilitySandbox {
  private static instance: ReliabilitySandbox;
  private experimentRegistry: Map<string, IReliabilityExperiment> = new Map();

  private constructor() {}

  public static getInstance(): ReliabilitySandbox {
    if (!ReliabilitySandbox.instance) {
      ReliabilitySandbox.instance = new ReliabilitySandbox();
    }
    return ReliabilitySandbox.instance;
  }

  public runExperiment(promptVersionId: string, parameters: { chunkSize: number; overlap: number; topK: number }): IReliabilityExperiment {
    const experimentId = `exp-reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Simulate running sandbox and calculating ERI
    // Better parameters (e.g. higher TopK, higher chunk size) result in higher simulated ERI
    let baseEri = 85.0;
    if (parameters.chunkSize >= 800) baseEri += 5.0;
    if (parameters.overlap >= 100) baseEri += 2.0;
    if (parameters.topK >= 8) baseEri += 5.0;
    if (promptVersionId.includes('v2')) baseEri += 2.0;

    const eriScore = Math.min(100.0, baseEri);

    const experiment: IReliabilityExperiment = {
      experimentId,
      promptVersionId,
      chunkSize: parameters.chunkSize,
      overlap: parameters.overlap,
      topK: parameters.topK,
      eriScore,
      registeredAt: new Date().toISOString()
    };

    this.experimentRegistry.set(experimentId, experiment);
    return experiment;
  }

  public listExperiments(): IReliabilityExperiment[] {
    return Array.from(this.experimentRegistry.values());
  }

  public getExperiment(experimentId: string): IReliabilityExperiment | undefined {
    return this.experimentRegistry.get(experimentId);
  }
}
