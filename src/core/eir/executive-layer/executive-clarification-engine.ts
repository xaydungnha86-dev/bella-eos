import { ClarifiedGoal } from '@/types/executive-recommendation';
import { ExecutiveContext } from '@/types/executive-session';

export class ExecutiveClarificationEngine {
  async clarifyIntent(ceoIntent: string, context: ExecutiveContext): Promise<ClarifiedGoal> {
    console.log('[Clarification Engine] Clarifying CEO intent under compiled context...');
    
    if (!ceoIntent || ceoIntent.trim() === '') {
      throw new Error('CEO intent cannot be empty');
    }
    
    // Parse percent increase from intent
    const revenueMatch = ceoIntent.match(/(\d+)%/);
    const percentIncrease = revenueMatch ? parseInt(revenueMatch[1]) : 30;
    
    const baseline = context.currentRevenue;
    const target = baseline * (1 + percentIncrease / 100);
    const delta = target - baseline;
    
    const constraints = [
      `Base Revenue: ${baseline}M VND`,
      `Workforce Capacity: ${context.workforceCapacity} members`,
      `Active campaigns: ${context.activeCampaignsCount}`
    ];
    
    // Parse budget constraint from intent if present
    const budgetMatch = ceoIntent.match(/budget\s*\$([\d,]+)/i) || 
                        ceoIntent.match(/\$([\d,]+)\s*budget/i) ||
                        ceoIntent.match(/budget\s*of\s*\$([\d,]+)/i);
    if (budgetMatch) {
      const dollarAmount = parseFloat(budgetMatch[1].replace(/,/g, ''));
      const mVnd = dollarAmount * 0.024;
      constraints.push(`Budget ${mVnd.toFixed(2)}M VND`);
    } else {
      constraints.push('Budget 150M VND');
    }
    
    // Parse timeline constraint from intent if present
    const timelineMatch = ceoIntent.match(/in\s*(\d+)\s*(week|day|month)/i) ||
                          ceoIntent.match(/(\d+)\s*(week|day|month)\s*timeline/i) ||
                          ceoIntent.match(/(\d+)\s*(week|day|month)\s*budget/i);
    let by = 'Next month (4 weeks)';
    if (timelineMatch) {
      const count = parseInt(timelineMatch[1]);
      const unit = timelineMatch[2].toLowerCase();
      by = `${count} ${unit}${count > 1 ? 's' : ''}`;
      constraints.push(`Timeline ${by}`);
    } else {
      constraints.push('Timeline 4 weeks');
    }
    
    return {
      what: 'Increase spa revenue',
      howMuch: `${percentIncrease}% = ${delta}M VND`,
      by,
      baseline,
      target,
      constraints,
      urgency: percentIncrease > 50 ? 'critical' : 'high'
    };
  }
}
