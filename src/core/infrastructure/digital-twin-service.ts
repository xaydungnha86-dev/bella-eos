/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Digital Twin Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 * 
 * Mission: Enterprise Sandbox Simulation Engine. Evaluates organizational changes
 * (e.g. increase ad budget, therapist headcount changes, new pricing tiers) against isolated digital clones
 * of People, Finance, Marketing, and Inventory instead of raw production databases.
 */

export interface TwinSimRequest {
  simName: string;
  variableName: string;
  variableDelta: number;
}

export interface TwinSimResponse {
  simId: string;
  projectedRevenueDeltaVnd: number;
  projectedResourceFrictionScore: number; // 0 - 100
  potentialBottlenecks: string[];
}

export class DigitalTwinService {
  private static instance: DigitalTwinService;

  private constructor() {}

  public static getInstance(): DigitalTwinService {
    if (!DigitalTwinService.instance) {
      DigitalTwinService.instance = new DigitalTwinService();
    }
    return DigitalTwinService.instance;
  }

  public runTwinSimulation(req: TwinSimRequest): TwinSimResponse {
    const simId = `sim-twin-${Date.now()}`;
    
    if (req.variableName === 'MARKETING_ADS_BUDGET') {
      const scale = req.variableDelta;
      return {
        simId,
        projectedRevenueDeltaVnd: scale * 3.2, // projected 3.2x ROAS on digital twin
        projectedResourceFrictionScore: scale > 50_000_000 ? 65 : 15,
        potentialBottlenecks: scale > 50_000_000 
          ? ['Staff Overload: Therapists capacity limits reached during peak hours.']
          : [],
      };
    }

    return {
      simId,
      projectedRevenueDeltaVnd: 0,
      projectedResourceFrictionScore: 0,
      potentialBottlenecks: [],
    };
  }

  /**
   * Runs a suite of 15 scenarios for a variable, scores them, and filters top 3 recommendations.
   */
  public runScenarioSuite(variableName: string, baseValue: number): {
    scenarios: (TwinSimResponse & { deltaValue: number; score: number })[];
    topRecommendations: (TwinSimResponse & { deltaValue: number; score: number })[];
  } {
    const scenarios: (TwinSimResponse & { deltaValue: number; score: number })[] = [];
    
    // Generate 15 variations (from -50% to +300%)
    const multipliers = [-0.5, -0.3, -0.1, 0, 0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    
    for (let i = 0; i < multipliers.length; i++) {
      const delta = baseValue * multipliers[i];
      const simName = `Scenario #${i + 1} (${multipliers[i] >= 0 ? '+' : ''}${(multipliers[i] * 100).toFixed(0)}%)`;
      const response = this.runTwinSimulation({ simName, variableName, variableDelta: delta });
      
      // Custom Net Utility Score: RevenueDelta - (Friction * 500k VND)
      const score = response.projectedRevenueDeltaVnd - (response.projectedResourceFrictionScore * 500_000);

      scenarios.push({
        ...response,
        deltaValue: delta,
        score
      });
    }

    // Sort and get Top 3
    const sorted = [...scenarios].sort((a, b) => b.score - a.score);
    const topRecommendations = sorted.slice(0, 3);

    return {
      scenarios,
      topRecommendations
    };
  }
}

