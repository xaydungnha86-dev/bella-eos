/**
 * Risk Graph - Assess and Mitigate Strategic Risks
 * Identifies major risks and determines overall acceptability
 */

import { Strategy, SimulationGraph, RiskGraph, Risk } from '@/types/executive-recommendation';
import { ReasoningContext } from '../reasoning-context';

export class RiskGraphExecutor {
  async execute(
    strategy: Strategy,
    simulation: SimulationGraph,
    context: ReasoningContext
  ): Promise<RiskGraph> {
    
    console.log('[RiskGraph] Assessing strategic risks...');
    
    const risks: Risk[] = [];
    
    // Analyze each initiative for risks
    strategy.initiatives.forEach(initiative => {
      if (initiative.includes('TikTok') || initiative.includes('pilot')) {
        risks.push({
          risk: 'TikTok pilot may underperform',
          probability: 0.4,
          impact: '-150M revenue if fails',
          mitigation: 'Pilot approach with GO/NO-GO decision at Week 2',
          residualRisk: 'low'
        });
      }
      
      if (initiative.includes('Win-back') || initiative.includes('churned')) {
        risks.push({
          risk: 'Win-back conversion lower than expected',
          probability: 0.3,
          impact: '-200M revenue if <20% conversion',
          mitigation: 'A/B test email copy, enhance offer if Week 1 results poor',
          residualRisk: 'medium'
        });
      }
      
      if (initiative.includes('Upsell') || initiative.includes('premium')) {
        risks.push({
          risk: 'Staff training insufficient',
          probability: 0.25,
          impact: '-100M revenue if training incomplete',
          mitigation: 'Dedicated trainer, practice sessions, certification required',
          residualRisk: 'low'
        });
      }
    });
    
    // Budget risk if close to limit
    const budgetUtilization = strategy.budget / parseFloat(context.getConstraints().budget.limit);
    if (budgetUtilization > 0.85) {
      risks.push({
        risk: 'Budget overrun if any initiative scales',
        probability: 0.2,
        impact: 'Exceeds budget limit, requires approval',
        mitigation: '10% contingency buffer reserved',
        residualRisk: 'low'
      });
    }
    
    // Execution capacity risk
    if (strategy.initiatives.length >= 4) {
      risks.push({
        risk: 'Team capacity stretched across 4+ initiatives',
        probability: 0.3,
        impact: 'Quality degradation, timeline slippage',
        mitigation: 'Clear owner assignment, daily standups, escalation path',
        residualRisk: 'medium'
      });
    }
    
    // Overall risk level based on residual risks
    const highResidual = risks.filter(r => r.residualRisk === 'high').length;
    const mediumResidual = risks.filter(r => r.residualRisk === 'medium').length;
    
    let overallRiskLevel: 'low' | 'medium' | 'high';
    if (highResidual > 0) {
      overallRiskLevel = 'high';
    } else if (mediumResidual >= 2) {
      overallRiskLevel = 'medium';
    } else {
      overallRiskLevel = 'low';
    }
    
    // Acceptability based on overall risk and expected value
    const acceptability = 
      overallRiskLevel !== 'high' && 
      simulation.probabilitySuccess >= 0.75;
    
    const riskGraph: RiskGraph = {
      risks,
      overallRiskLevel,
      acceptability
    };
    
    console.log('[RiskGraph] ✓ Completed:', {
      riskCount: risks.length,
      overallRiskLevel,
      acceptability: acceptability ? 'ACCEPTABLE ✅' : 'NOT ACCEPTABLE ❌'
    });
    
    return riskGraph;
  }
}
