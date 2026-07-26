/**
 * BELLA EOS PLATFORM CONTRACT: Market Forecast Contract (IMarketForecast v1.0)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE RUNTIME (MIR)
 * 
 * Contract 43: Market Scenario Projection & Forecast Contract.
 * Models 3-month, 6-month, and 12-month market scenario projections (Best, Expected, Worst)
 * with probability weighting and KPI impact deltas.
 */

export type ForecastScenario = 'BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE';

export interface IMarketForecast {
  forecastId: string;
  tenantId: string;
  scenario: ForecastScenario;
  timeHorizonMonths: number; // 3, 6, 12 months
  probabilityPercentage: number; // e.g., 65%
  expectedKpiDeltaPercentage: number; // e.g., +15% Revenue
  affectedKpi: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  createdAt: string;
}
