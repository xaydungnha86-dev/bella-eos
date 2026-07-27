export interface IEvolutionSession {
  experimentId: string;
  championSopId: string;
  challengerSopId: string;
  trafficSplitPercentage: number;
  metricsResult: Record<string, number>;
}

export class EvolutionRuntime {
  private static instance: EvolutionRuntime;
  private sessions: Map<string, IEvolutionSession> = new Map();

  private constructor() {}

  public static getInstance(): EvolutionRuntime {
    if (!EvolutionRuntime.instance) {
      EvolutionRuntime.instance = new EvolutionRuntime();
    }
    return EvolutionRuntime.instance;
  }

  public launchExperiment(session: IEvolutionSession): void {
    this.sessions.set(session.experimentId, session);
  }

  public getExperiment(experimentId: string): IEvolutionSession | undefined {
    return this.sessions.get(experimentId);
  }

  public evaluateChampion(experimentId: string, challengerScore: number, championScore: number): 'CHAMPION' | 'CHALLENGER' {
    const session = this.sessions.get(experimentId);
    if (session) {
      session.metricsResult = { championScore, challengerScore };
      if (challengerScore > championScore + 5) {
        return 'CHALLENGER'; // Promoted!
      }
    }
    return 'CHAMPION';
  }
}
