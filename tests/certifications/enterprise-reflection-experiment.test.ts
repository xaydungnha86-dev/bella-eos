/**
 * BELLA EOS CERTIFICATION: Enterprise Reflection & Experimentation Runtime (ERR / EERX) Certification Suite
 * Specification: v18.7 BELLA EOS ULTIMATE ENTERPRISE COGNITIVE OPERATING SYSTEM
 * 
 * Verifies After Action Review (AAR), Root Cause Dissection, Assumption Validation, Cognitive Bias Detection,
 * 6-Vector Multi-Dimensional Confidence Calibration, EERX Controlled A/B/C Experiments, Prompt/Skill Auto-Evolution,
 * and IMetaCognitiveSession asset persistence (Completing all 40 Frozen Platform Contracts).
 */

import { ReflectionRuntime } from '@/core/err/reflection-runtime';
import { RootCauseRuntime } from '@/core/err/root-cause-runtime';
import { AssumptionValidationRuntime } from '@/core/err/assumption-validation-runtime';
import { BiasDetectionRuntime } from '@/core/err/bias-detection-runtime';
import { StrategyEvolutionRuntime } from '@/core/err/strategy-evolution-runtime';
import { PromptEvolutionRuntime } from '@/core/err/prompt-evolution-runtime';
import { SkillEvolutionRuntime } from '@/core/err/skill-evolution-runtime';
import { ConfidenceCalibrationRuntime } from '@/core/err/confidence-calibration-runtime';
import { ExperimentRuntime } from '@/core/eerx/experiment-runtime';
import { MetaCognitiveFlywheelOrchestrator } from '@/core/err/metacognitive-flywheel-orchestrator';

describe('BELLA EOS v18.7 Enterprise Reflection & Experimentation (ERR / EERX) Certification', () => {

  it('1. Reflection & Root Cause Runtimes: should conduct AAR & dissect true root cause', () => {
    const aar = ReflectionRuntime.getInstance().conductAar('dec-1', 'Target ROAS 3.5x', 'Actual 2.1x');
    const rc = RootCauseRuntime.getInstance().dissectRootCause('dec-1', -1.4);

    expect(aar.aarSummary).toBeDefined();
    expect(aar.keyQuestionsAnswered.length).toBe(4);
    expect(rc.trueRootCause).toContain('Creative');
  });

  it('2. Assumption & Bias Runtimes: should validate hypotheses & flag cognitive biases', () => {
    const assumptions = AssumptionValidationRuntime.getInstance().validateAssumptions('dec-1');
    const biases = BiasDetectionRuntime.getInstance().detectBiases(2);

    expect(assumptions.validated.length).toBeGreaterThan(0);
    expect(assumptions.invalid.length).toBeGreaterThan(0);
    expect(biases.length).toBeGreaterThan(0);
  });

  it('3. 6-Vector Confidence Calibration (Contract 38): should compute weighted 6-vector score', () => {
    const calibrated = ConfidenceCalibrationRuntime.getInstance().calibrateConfidence(0.98, 0.95, 0.92, 0.88, 0.85, 0.90);

    expect(calibrated.dataConfidence).toBe(0.98);
    expect(calibrated.overallWeightedScore).toBeGreaterThan(0.90);
  });

  it('4. EERX Experiment Engine (Contract 37): should run controlled A/B/C experiments & select winner', () => {
    const expEngine = ExperimentRuntime.getInstance();
    const exp = expEngine.createExperiment('default-tenant', 'Testing UGC vs Banner', [
      { variantId: 'v1', variantName: 'UGC Video', trafficAllocationPercentage: 50 },
      { variantId: 'v2', variantName: 'Banner', trafficAllocationPercentage: 50 },
    ]);
    const result = expEngine.evaluateExperiment(exp.experimentId, { 'v1': 35.2, 'v2': 12.1 });

    expect(result.status).toBe('COMPLETED');
    expect(result.winnerVariantId).toBe('v1');
  });

  it('5. Auto-Evolutions (Contract 39): should auto-refine EAH prompts & Skill Packs', () => {
    const stratEvo = StrategyEvolutionRuntime.getInstance().evolveStrategy('default-tenant', 'UGC outperforms Banners');
    const promptEvo = PromptEvolutionRuntime.getInstance().evolvePromptInstruction('default-tenant', 'Mandatory UGC verification');
    const skillEvo = SkillEvolutionRuntime.getInstance().evolveSkillPack('default-tenant', 'Marketing_Skill');

    expect(stratEvo.evolutionId).toMatch(/^strat-evo-/);
    expect(promptEvo.newLogic).toContain('MANDATORY RULE');
    expect(skillEvo.newLogic).toContain('v2.0');
  });

  it('6. Master Meta-Cognitive Flywheel (Contract 40: IMetaCognitiveSession): 40-Contract platform completion', async () => {
    const session = await MetaCognitiveFlywheelOrchestrator.getInstance().executeMetaCognitiveCycle(
      'default-tenant', 'dec-101', 'Target ROAS 3.5x', 'Actual ROAS 2.1x', -1.4
    );

    expect(session.sessionId).toMatch(/^meta-session-/);
    expect(session.reflectionReport.trueRootCause).toBeDefined();
    expect(session.experimentPayload?.winnerVariantId).toBe('v1-ugc');
    expect(session.calibratedConfidence.overallWeightedScore).toBeGreaterThan(0.90);
    expect(session.strategyEvolutions.length).toBe(3);
  });
});
