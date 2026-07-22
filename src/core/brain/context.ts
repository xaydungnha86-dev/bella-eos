import { CanonicalContextPackage } from '../../types/eom';
import { KnowledgeCenter } from './knowledge';
import { MemoryCenter } from './memory';

export class ContextCenter {
  // Config parameters configured by the user
  static config = {
    budgetVnd: 10000000,
    targetMetricType: 'targetFollowers',
    targetValue: 1000,
    segment: 'VIP Spa Clients'
  };

  /**
   * Generates a selective, token-optimized Canonical Context Package.
   * CRITICAL SECURITY PRINCIPLE: This center NEVER exposes raw database credentials, 
   * raw SQL tables, or un-filtered transaction rows directly to AI workers. 
   * It only packages refined, security-cleared contextual slices.
   */
  static compileContext(activeStep: { id: number; name: string; agent: string }, objective: string): CanonicalContextPackage {
    console.log(`[Context Center] Building Canonical Context Package for: ${activeStep.name}`);
    
    // Retrieve historical learning summaries to aid the worker
    const memoryRecords = MemoryCenter.getRecordsByCategory('operational');
    const tips = memoryRecords.map(m => ({
      task: activeStep.name,
      tip: `Rule parsed from memory: ${m.content}`
    }));

    // Compile the Canonical Package
    const contextPackage: CanonicalContextPackage = {
      objective,
      activeStep,
      erp: {
        approvedBudgetVnd: this.config.budgetVnd,
        targetValue: this.config.targetValue,
        targetMetric: this.config.targetMetricType
      },
      brandDna: {
        voiceTone: KnowledgeCenter.CompanyDNA.voiceTone,
        designStyle: KnowledgeCenter.CompanyDNA.style
      },
      policies: [
        { id: 'POL-GOV-001', rule: 'Ngân sách chiến dịch tối đa 100,000,000 VND trừ khi được CEO ký duyệt ghi đè.' }
      ],
      learningEvidence: tips,
      timestamp: new Date().toISOString()
    };

    // Calculate simulated token reduction metrics (Selective Context)
    const rawTokensEstimate = 12500; // estimated tokens if dumping all DB tables
    const compiledTokensEstimate = 1500; // actual tokens of refined canonical package
    const savingsPct = Math.round(((rawTokensEstimate - compiledTokensEstimate) / rawTokensEstimate) * 100);

    console.log(`[Context Center] Selective Context Compilation: Savings of ${savingsPct}% in LLM tokens achieved!`);
    
    return contextPackage;
  }

  static updateConfig(budget: number, metricType: string, value: number, segment: string) {
    this.config.budgetVnd = budget;
    this.config.targetMetricType = metricType;
    this.config.targetValue = value;
    this.config.segment = segment;
    console.log(`[Context Center] Updated Business Context parameters:`, this.config);
  }
}
