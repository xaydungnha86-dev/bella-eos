/**
 * BELLA EOS ESR: Master Enterprise Strategy Orchestrator
 * Specification: v19.0 BELLA EOS ENTERPRISE STRATEGIC OPERATING SYSTEM (ESOS)
 * 
 * Mission: Master Strategic Intelligence Orchestrator. Unifies the 7 ESR Sub-Runtimes:
 * 1. Corporate Vision Runtime (Runtime 52)
 * 2. OKR Portfolio Runtime (Runtime 53)
 * 3. Scenario Planning Runtime (Runtime 54)
 * 4. Capital Allocation Runtime (Runtime 55)
 * 5. Growth Strategy Runtime (Runtime 56)
 * 6. Risk Portfolio Runtime (Runtime 57)
 * 7. Corporate Review Runtime (Runtime 58)
 * Connects 3-Tier Enterprise Intelligence: Strategic Intelligence (ESR) ➔ Tactical Intelligence (EDR/MIR) ➔ Operational Intelligence (EOS/ELR/EAH/ECR).
 */

import { IStrategicRoadmap } from '@/types/strategic-roadmap';
import { IOkrInitiative } from '@/types/okr-initiative';
import { ICapitalAllocationPlan } from '@/types/capital-allocation-plan';

import { CorporateVisionRuntime } from './corporate-vision-runtime';
import { OkrPortfolioRuntime } from './okr-portfolio-runtime';
import { ScenarioPlanningRuntime, StrategicScenario } from './scenario-planning-runtime';
import { CapitalAllocationRuntime } from './capital-allocation-runtime';
import { GrowthStrategyRuntime, GrowthStrategyOption } from './growth-strategy-runtime';
import { RiskPortfolioRuntime, StrategicRiskItem } from './risk-portfolio-runtime';
import { CorporateReviewRuntime, QbrReviewReport } from './corporate-review-runtime';

export interface EnterpriseStrategyReport {
  roadmap: IStrategicRoadmap;
  okrInitiative: IOkrInitiative;
  scenarios: StrategicScenario[];
  capitalPlan: ICapitalAllocationPlan;
  growthOptions: GrowthStrategyOption[];
  riskPortfolio: StrategicRiskItem[];
  qbrReview: QbrReviewReport;
}

export class StrategyOrchestrator {
  private static instance: StrategyOrchestrator;

  private constructor() {}

  public static getInstance(): StrategyOrchestrator {
    if (!StrategyOrchestrator.instance) {
      StrategyOrchestrator.instance = new StrategyOrchestrator();
    }
    return StrategyOrchestrator.instance;
  }

  public async runCorporateStrategicCycle(tenantId: string, corporateVision: string, totalCapExUsd: number): Promise<EnterpriseStrategyReport> {
    // 1. Corporate Vision & 3-5 Year Strategic Roadmap (R52)
    const roadmap = CorporateVisionRuntime.getInstance().formulateRoadmap(tenantId, corporateVision);

    // 2. Enterprise OKR Portfolio Alignment (R53)
    const okrInitiative = OkrPortfolioRuntime.getInstance().createOkrInitiative(
      tenantId,
      roadmap.strategicPillars[0].pillarId,
      'Launch 2 Luxury Spa Flagship Locations in Hanoi',
      'CMO',
      '+50% Regional Locations'
    );

    // 3. Scenario Planning (R54)
    const scenarios = ScenarioPlanningRuntime.getInstance().runScenarioAnalysis(tenantId);

    // 4. Capital Allocation Plan (R55)
    const capitalPlan = CapitalAllocationRuntime.getInstance().optimizeCapitalPlan(tenantId, totalCapExUsd);

    // 5. Growth & M&A Strategy Evaluation (R56)
    const growthOptions = GrowthStrategyRuntime.getInstance().evaluateGrowthOptions(tenantId);

    // 6. Enterprise Risk Management (ERM) Portfolio (R57)
    const riskPortfolio = RiskPortfolioRuntime.getInstance().auditRiskPortfolio(tenantId);

    // 7. Quarterly Corporate Strategy Review (QBR) (R58)
    const qbrReview = CorporateReviewRuntime.getInstance().conductQbrReview(tenantId, 'Q3-2026');

    return {
      roadmap,
      okrInitiative,
      scenarios,
      capitalPlan,
      growthOptions,
      riskPortfolio,
      qbrReview,
    };
  }
}
