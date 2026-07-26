/**
 * BELLA EOS ERR: Meta-Cognitive Flywheel Orchestrator
 * Specification: v18.7 BELLA EOS ENTERPRISE REFLECTION & EXPERIMENTATION RUNTIME
 * 
 * Mission: Master Meta-Cognitive Flywheel Orchestrator.
 * Executes After Action Reviews ➔ Root Cause Dissection ➔ Assumption Validation ➔ Bias Detection ➔
 * 6-Vector Confidence Calibration ➔ Controlled Experiment Evaluation ➔ Strategy/Prompt/Skill Auto-Evolution ➔ Persistent IMetaCognitiveSession Asset Store.
 */

import { IMetaCognitiveSession } from '@/types/metacognitive-session';
import { IReflectionReport } from '@/types/reflection-report';

import { ReflectionRuntime } from './reflection-runtime';
import { RootCauseRuntime } from './root-cause-runtime';
import { AssumptionValidationRuntime } from './assumption-validation-runtime';
import { BiasDetectionRuntime } from './bias-detection-runtime';
import { StrategyEvolutionRuntime } from './strategy-evolution-runtime';
import { PromptEvolutionRuntime } from './prompt-evolution-runtime';
import { SkillEvolutionRuntime } from './skill-evolution-runtime';
import { DNAEvolutionRuntime } from './dna-evolution-runtime';
import { ConfidenceCalibrationRuntime } from './confidence-calibration-runtime';
import { EnterpriseWisdomSynthesizer } from './enterprise-wisdom-synthesizer';
import { ExperimentRuntime } from '../eerx/experiment-runtime';

export class MetaCognitiveFlywheelOrchestrator {
  private static instance: MetaCognitiveFlywheelOrchestrator;
  private sessionStore: Map<string, IMetaCognitiveSession> = new Map();

  private constructor() {}

  public static getInstance(): MetaCognitiveFlywheelOrchestrator {
    if (!MetaCognitiveFlywheelOrchestrator.instance) {
      MetaCognitiveFlywheelOrchestrator.instance = new MetaCognitiveFlywheelOrchestrator();
    }
    return MetaCognitiveFlywheelOrchestrator.instance;
  }

  public async executeMetaCognitiveCycle(
    tenantId: string,
    decisionId: string,
    plannedTarget: string,
    actualOutcome: string,
    performanceDelta: number
  ): Promise<IMetaCognitiveSession> {
    const sessionId = `meta-session-${Date.now()}`;

    // 1. After Action Review (R27)
    const aar = ReflectionRuntime.getInstance().conductAar(decisionId, plannedTarget, actualOutcome);

    // 2. Root Cause Dissection (R28)
    const rootCause = RootCauseRuntime.getInstance().dissectRootCause(decisionId, performanceDelta);

    // 3. Assumption Validation (R29)
    const assumptions = AssumptionValidationRuntime.getInstance().validateAssumptions(decisionId);

    // 4. Bias Detection (R30)
    const biases = BiasDetectionRuntime.getInstance().detectBiases(5);

    // 5. 6-Vector Confidence Calibration (R35)
    const calibratedConf = ConfidenceCalibrationRuntime.getInstance().calibrateConfidence(0.98, 0.95, 0.92, 0.88, 0.85, 0.90);

    // Build Reflection Report (Contract 36)
    const reflectionReport: IReflectionReport = {
      reflectionId: `ref-rep-${Date.now()}`,
      decisionId,
      tenantId,
      trueRootCause: rootCause.trueRootCause,
      validatedAssumptions: assumptions.validated,
      invalidAssumptions: assumptions.invalid,
      biasFlags: biases,
      calibratedConfidence: calibratedConf,
      reflectionSummary: aar.aarSummary,
      createdAt: new Date().toISOString(),
    };

    // 6. Controlled Experimentation Engine (EERX)
    const expEngine = ExperimentRuntime.getInstance();
    const expPayload = expEngine.createExperiment(tenantId, 'Khảo sát hiệu quả Creative UGC vs Banner Tĩnh', [
      { variantId: 'v1-ugc', variantName: 'Video UGC Review Khách Hàng Thật', trafficAllocationPercentage: 50 },
      { variantId: 'v2-banner', variantName: 'Banner Giảm Giá 30%', trafficAllocationPercentage: 50 },
    ]);
    const evaluatedExp = expEngine.evaluateExperiment(expPayload.experimentId, { 'v1-ugc': 35.2, 'v2-banner': 12.1 });

    // 7. Auto-Evolutions (R31 - R34)
    const stratNode = StrategyEvolutionRuntime.getInstance().evolveStrategy(tenantId, rootCause.trueRootCause);
    const promptNode = PromptEvolutionRuntime.getInstance().evolvePromptInstruction(tenantId, rootCause.trueRootCause);
    const skillNode = SkillEvolutionRuntime.getInstance().evolveSkillPack(tenantId, 'Marketing_Strategy_Skill');
    DNAEvolutionRuntime.getInstance().evolveLearningDNA(tenantId, rootCause.trueRootCause);
    EnterpriseWisdomSynthesizer.getInstance().synthesizeWisdom(tenantId, rootCause.trueRootCause, 'UGC Video Review Outperforms Banners');

    // 8. Persistent IMetaCognitiveSession Asset (Contract 40)
    const session: IMetaCognitiveSession = {
      sessionId,
      tenantId,
      decisionId,
      reflectionReport,
      experimentPayload: evaluatedExp,
      calibratedConfidence: calibratedConf,
      strategyEvolutions: [stratNode, promptNode, skillNode],
      createdAt: new Date().toISOString(),
    };

    this.sessionStore.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): IMetaCognitiveSession | undefined {
    return this.sessionStore.get(sessionId);
  }
}
