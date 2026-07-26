/**
 * BELLA EOS ERL: Canary Deployment Coordinator
 * Specification: ERL Governance Engine
 * 
 * Mission: Execute step-wise prompt/model rollouts (5% -> 50% -> 100%) and trigger automatic rollbacks on ERI degradation.
 */

import { ICanaryRollout } from '@/types/erl';

export class CanaryDeploymentCoordinator {
  private static instance: CanaryDeploymentCoordinator;
  private rollouts: Map<string, ICanaryRollout> = new Map();

  private constructor() {}

  public static getInstance(): CanaryDeploymentCoordinator {
    if (!CanaryDeploymentCoordinator.instance) {
      CanaryDeploymentCoordinator.instance = new CanaryDeploymentCoordinator();
    }
    return CanaryDeploymentCoordinator.instance;
  }

  public initiateCanary(targetVersion: string): ICanaryRollout {
    const rolloutId = `canary-roll-${Date.now()}`;
    const rollout: ICanaryRollout = {
      rolloutId,
      targetVersion,
      activePercent: 5,
      eriSampleScore: 98.0,
      status: 'ROLLING_OUT',
      logs: [`[Start] Initiated Canary release for version ${targetVersion} at 5% traffic.`]
    };

    this.rollouts.set(rolloutId, rollout);
    return rollout;
  }

  public advanceCanary(rolloutId: string, sampledEri: number): ICanaryRollout {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout) {
      throw new Error(`Canary Rollout ${rolloutId} not found.`);
    }

    rollout.eriSampleScore = sampledEri;

    if (sampledEri < 90.0) {
      // ERI drop detected! Trigger automated Rollback
      rollout.status = 'ROLLED_BACK';
      rollout.activePercent = 0;
      rollout.logs.push(`[Rollback] ⚠️ ERI score dropped to ${sampledEri} (below target 90.0). Triggering automatic rollback to stable version.`);
    } else {
      if (rollout.activePercent === 5) {
        rollout.activePercent = 50;
        rollout.logs.push(`[Progress] Sample ERI is ${sampledEri}. Scaling traffic allocation to 50%.`);
      } else if (rollout.activePercent === 50) {
        rollout.activePercent = 100;
        rollout.status = 'PROMOTED';
        rollout.logs.push(`[Complete] Stable sample ERI of ${sampledEri} verified. Promoting version ${rollout.targetVersion} to 100% production traffic.`);
      }
    }

    this.rollouts.set(rolloutId, rollout);
    return rollout;
  }

  public getCanary(rolloutId: string): ICanaryRollout | undefined {
    return this.rollouts.get(rolloutId);
  }
}
