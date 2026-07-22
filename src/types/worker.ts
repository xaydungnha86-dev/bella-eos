/**
 * BELLA EOS PLATFORM CONTRACT: Worker Contract Interface (IWorker v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Stateless Execution Worker Contract for AI, Human, MCP, API, Script, Robot, External Workers.
 */

import { CanonicalContextPackage } from './eom';

export type WorkerType = 'AI' | 'HUMAN' | 'MCP' | 'API' | 'SCRIPT' | 'ROBOT' | 'EXTERNAL';

export interface WorkerHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  activeJobsCount: number;
}

export interface WorkerEvidence {
  taskId: string;
  workerId: string;
  success: boolean;
  output: any;
  score?: number;
  completedAt: string;
  executionMs: number;
}

export interface IWorker {
  id: string;
  type: WorkerType;
  execute(contextPackage: CanonicalContextPackage): Promise<WorkerEvidence>;
  cancel(taskId: string): Promise<boolean>;
  heartbeat(): Promise<boolean>;
  health(): Promise<WorkerHealth>;
  dispose(): Promise<void>;
}
