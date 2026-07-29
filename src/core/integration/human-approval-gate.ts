/**
 * Human Approval Gate
 * Reviews executive recommendation before proceeding to planning
 */

import { ExecutiveRecommendation } from '@/types/executive-recommendation';

export interface ApprovalDecision {
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  comments?: string;
  modifications?: {
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
}

export class HumanApprovalGate {
  /**
   * Submit recommendation for CEO approval
   * In real implementation, this would:
   * 1. Send notification to CEO
   * 2. Display recommendation in approval UI
   * 3. Wait for CEO decision (async)
   * 4. Return approval decision
   * 
   * For now, we auto-approve for testing
   */
  async submitForApproval(
    recommendation: ExecutiveRecommendation
  ): Promise<ApprovalDecision> {
    console.log('\n👤 [Approval Gate] Submitting recommendation to CEO...');
    console.log('[Approval Gate] Strategy:', recommendation.chosenStrategy.name);
    console.log('[Approval Gate] Expected:', recommendation.expectedOutcome);
    console.log('[Approval Gate] Confidence:', `${Math.round(recommendation.confidence * 100)}%`);
    console.log('[Approval Gate] Budget:', `${recommendation.chosenStrategy.budget}M`);
    
    // TODO: In production, this would be async and wait for real CEO input
    // For now, auto-approve if confidence >= 75%
    const approved = recommendation.confidence >= 0.75;
    
    const decision: ApprovalDecision = {
      approved,
      approvedBy: 'CEO',
      approvedAt: new Date().toISOString(),
      comments: approved 
        ? 'Approved - Confidence and expected outcome acceptable'
        : 'Rejected - Confidence too low, please revise'
    };
    
    if (approved) {
      console.log('✅ [Approval Gate] Recommendation APPROVED by CEO');
    } else {
      console.log('❌ [Approval Gate] Recommendation REJECTED by CEO');
    }
    
    return decision;
  }
  
  /**
   * Apply CEO modifications to recommendation
   * CEO may adjust budget, timeline, or initiatives
   */
  applyModifications(
    recommendation: ExecutiveRecommendation,
    modifications: ApprovalDecision['modifications']
  ): ExecutiveRecommendation {
    if (!modifications || modifications.length === 0) {
      return recommendation;
    }
    
    console.log('[Approval Gate] Applying CEO modifications:', modifications.length);
    
    const modified = { 
      ...recommendation,
      chosenStrategy: { ...recommendation.chosenStrategy },
      goal: { ...recommendation.goal }
    };
    
    modifications.forEach(mod => {
      if (mod.field === 'budget') {
        modified.chosenStrategy.budget = mod.newValue;
      } else if (mod.field === 'timeline') {
        modified.goal.by = mod.newValue;
      } else if (mod.field === 'initiatives') {
        modified.chosenStrategy.initiatives = mod.newValue;
      }
    });
    
    return modified;
  }
  
  /**
   * Format recommendation for CEO review
   * Returns markdown summary for display
   */
  formatForReview(recommendation: ExecutiveRecommendation): string {
    return `
# Executive Recommendation

## Goal
${recommendation.goal.what} ${recommendation.goal.howMuch} by ${recommendation.goal.by}

## Strategic Diagnosis
**Current State**: ${recommendation.diagnosis.currentState}

**Root Causes**:
${recommendation.diagnosis.rootCauses.map(rc => 
  `- ${rc.symptom} (${rc.severity}): ${rc.causes[0]?.cause || 'N/A'}`
).join('\n')}

## Recommended Strategy: ${recommendation.chosenStrategy.name}

**Initiatives**:
${recommendation.chosenStrategy.initiatives.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

**Budget**: ${recommendation.chosenStrategy.budget}M VND
**Expected Revenue**: ${recommendation.chosenStrategy.expectedRevenue}M VND
**Risk Level**: ${recommendation.chosenStrategy.risk}

## Simulation Results
- **Expected Value**: ${recommendation.simulationSummary.expectedValue}B VND
- **Probability of Success**: ${Math.round(recommendation.confidence * 100)}%
- **Expected Outcome**: ${recommendation.expectedOutcome}

## Major Risks
${recommendation.majorRisks.map(r => 
  `- **${r.risk}** (${Math.round(r.probability * 100)}% probability)\n  - Impact: ${r.impact}\n  - Mitigation: ${r.mitigation}`
).join('\n\n')}

## Success Criteria
- **Primary**: ${recommendation.successCriteria.primary}
- **Secondary**: 
${recommendation.successCriteria.secondary.map(s => `  - ${s}`).join('\n')}

---
*Generated at: ${recommendation.generatedAt}*
*Reasoning iterations: ${recommendation.reasoningTrace.iterations}*
    `;
  }
}
