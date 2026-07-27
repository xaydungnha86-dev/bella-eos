/**
 * BELLA ECOS — Planning Engine Runtime (L2: Functional Runtime)
 * Sprint 28 — Architecture Freeze Maturity Series
 *
 * Nguyên tắc kiến trúc (Architecture Freeze):
 *   Planning chỉ làm: validate, dependency resolution, ordering.
 *   Goal Decomposition là một concern riêng biệt (IGoalDecomposer):
 *     — có thể là LLM, Rule-based, Template, Plugin.
 *   Planning Engine không biết và không phụ thuộc vào cách decompose.
 *   Cost Estimation thuộc hoàn toàn về Economics Runtime.
 *
 * L2 Capabilities:
 *   ✅ IPlanStore / InMemoryPlanStore (Persistence Abstraction)
 *   ✅ IGoalDecomposer (Decoupled — Plan Engine không tự decompose)
 *   ✅ plan(goal, decomposer?): lấy Task Graph từ decomposer, lưu vào store
 *   ✅ validate(plan): ValidationResult — cycle, duplicate, orphan, missing dep, unreachable
 *   ✅ solveDependencies(plan): string[] — Kahn's Topological Sort
 *   ✅ RuntimeMetrics v2.0 (shared contract)
 *   ✅ Error handling & stable public interface
 */

import { ExecutionPlan, Goal } from '@/types/planner';
import { RuntimeMetrics, createMetric } from '@/types/runtime-metrics';

const RUNTIME_NAME = 'PlanningEngine';

// ─────────────────────────────────────────────
// 1. Persistence Abstraction — IPlanStore
// ─────────────────────────────────────────────

export interface IPlanStore {
  savePlan(plan: ExecutionPlan): void;
  getPlan(planId: string): ExecutionPlan | undefined;
  deletePlan(planId: string): boolean;
  getAllPlans(): ExecutionPlan[];
}

export class InMemoryPlanStore implements IPlanStore {
  private plans: Map<string, ExecutionPlan> = new Map();

  savePlan(plan: ExecutionPlan): void {
    this.plans.set(plan.planId, plan);
  }

  getPlan(planId: string): ExecutionPlan | undefined {
    return this.plans.get(planId);
  }

  deletePlan(planId: string): boolean {
    return this.plans.delete(planId);
  }

  getAllPlans(): ExecutionPlan[] {
    return Array.from(this.plans.values());
  }
}

// ─────────────────────────────────────────────
// 2. Goal Decomposer — Decoupled Interface
//    Planning Engine KHÔNG tự phân rã Goal.
//    IGoalDecomposer là điểm mở rộng:
//      → LLM Decomposer, Rule Decomposer, Template Decomposer, Plugin...
// ─────────────────────────────────────────────

export interface IGoalDecomposer {
  decompose(goal: Goal): ExecutionPlan;
}

/**
 * DefaultGoalDecomposer — Rule-based, dùng làm fallback khi không có decomposer tùy chỉnh.
 * Phân rã Goal thành 3 tasks tiêu chuẩn theo luồng chiến dịch Bella EOS:
 *   Analyze → Strategize → Execute
 */
export class DefaultGoalDecomposer implements IGoalDecomposer {
  decompose(goal: Goal): ExecutionPlan {
    const planId = `plan-${goal.id}-${Date.now()}`;
    return {
      planId,
      goalId: goal.id,
      strategy: `Functional Strategy for: ${goal.name}`,
      tasks: [
        {
          id: `${planId}-task-analyze`,
          name: `Analyze context for goal: ${goal.name}`,
          agent: 'AnalyticsAgent',
          capability: 'cap-data-analysis',
          dependsOn: [],
        },
        {
          id: `${planId}-task-strategize`,
          name: `Devise strategy to achieve: ${goal.targetMetric} = ${goal.targetValue}`,
          agent: 'StrategyAgent',
          capability: 'cap-strategy-gen',
          dependsOn: [`${planId}-task-analyze`],
        },
        {
          id: `${planId}-task-execute`,
          name: `Execute approved campaign actions`,
          agent: 'ExecutionAgent',
          capability: 'cap-campaign-exec',
          dependsOn: [`${planId}-task-strategize`],
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────
// 3. Validation Result
// ─────────────────────────────────────────────

export interface ValidationIssue {
  code:
    | 'CYCLE_DETECTED'
    | 'DUPLICATE_TASK_ID'
    | 'MISSING_DEPENDENCY'
    | 'ORPHAN_TASK'
    | 'UNREACHABLE_TASK'
    | 'MISSING_CAPABILITY';
  taskId: string;
  detail: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

// ─────────────────────────────────────────────
// 4. PlanningEngine — Public API
// ─────────────────────────────────────────────

export class PlanningEngine {
  private static instance: PlanningEngine;
  private store: IPlanStore;
  private metricsLog: RuntimeMetrics[] = [];

  private constructor(store?: IPlanStore) {
    this.store = store ?? new InMemoryPlanStore();
  }

  public static getInstance(store?: IPlanStore): PlanningEngine {
    if (!PlanningEngine.instance) {
      PlanningEngine.instance = new PlanningEngine(store);
    }
    return PlanningEngine.instance;
  }

  /** @internal — for testing only */
  public static resetInstance(): void {
    (PlanningEngine as any).instance = undefined;
  }

  // ── Metrics helpers ──

  private measure<T>(operation: string, fn: () => T): T {
    const startedAt = Date.now();
    let success = true;
    let errorCode: string | undefined;
    let result: T;
    try {
      result = fn();
    } catch (err: any) {
      success = false;
      errorCode = err?.message ?? 'UNKNOWN_ERROR';
      this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success, errorCode));
      throw err;
    }
    this.metricsLog.push(createMetric(RUNTIME_NAME, operation, startedAt, success));
    return result!;
  }

  public getMetrics(): RuntimeMetrics[] {
    return [...this.metricsLog];
  }

  public clearMetrics(): void {
    this.metricsLog = [];
  }

  // ── Core API ──

  /**
   * Receive a Task Graph from a decomposer (LLM, Rule, Template, Plugin),
   * validate it, solve dependencies, and persist the plan.
   *
   * Planning Engine does NOT decompose the Goal itself.
   * The decomposer is injected externally (Dependency Injection).
   */
  public async plan(goal: Goal, decomposer?: IGoalDecomposer): Promise<ExecutionPlan> {
    // Validate synchronously so assertThrows / non-async callers catch it immediately
    if (!goal || !goal.id || !goal.name) {
      const err = new Error('plan: goal.id and goal.name are required');
      this.metricsLog.push(createMetric(RUNTIME_NAME, 'plan', Date.now(), false, err.message));
      throw err;
    }
    return this.measure('plan', () => {
      const effectiveDecomposer = decomposer ?? new DefaultGoalDecomposer();
      const plan = effectiveDecomposer.decompose(goal);

      // Validate before storing
      const validation = this.validate(plan);
      if (!validation.valid) {
        const codes = validation.issues.map(i => i.code).join(', ');
        throw new Error(`plan: invalid task graph — ${codes}`);
      }

      this.store.savePlan(plan);
      return plan;
    });
  }

  /**
   * validate(plan) — Comprehensive plan quality & safety check.
   *
   * Detects:
   *   1. Duplicate Task IDs
   *   2. Missing Dependencies (depends on non-existent task)
   *   3. Cyclic Dependencies (would deadlock execution)
   *   4. Orphan Tasks (task with no capability assigned)
   *   5. Unreachable Tasks (can never be reached from root tasks)
   *   6. Missing Capability (empty capability string)
   */
  public validate(plan: ExecutionPlan): ValidationResult {
    return this.measure('validate', () => {
      if (!plan || !plan.tasks) throw new Error('validate: plan and plan.tasks are required');
      const issues: ValidationIssue[] = [];
      const taskIds = new Set<string>();

      // 1. Detect Duplicate Task IDs
      for (const task of plan.tasks) {
        if (taskIds.has(task.id)) {
          issues.push({
            code: 'DUPLICATE_TASK_ID',
            taskId: task.id,
            detail: `Task ID "${task.id}" is duplicated in the plan.`,
          });
        }
        taskIds.add(task.id);
      }

      // 2. Detect Missing Dependencies & Missing Capability
      for (const task of plan.tasks) {
        if (!task.capability || task.capability.trim() === '') {
          issues.push({
            code: 'MISSING_CAPABILITY',
            taskId: task.id,
            detail: `Task "${task.id}" has no capability assigned.`,
          });
        }
        for (const dep of task.dependsOn ?? []) {
          if (!taskIds.has(dep)) {
            issues.push({
              code: 'MISSING_DEPENDENCY',
              taskId: task.id,
              detail: `Task "${task.id}" depends on "${dep}" which does not exist in the plan.`,
            });
          }
        }
      }

      // 3. Detect Cyclic Dependencies (DFS with coloring)
      const WHITE = 0, GRAY = 1, BLACK = 2;
      const color: Record<string, number> = {};
      plan.tasks.forEach(t => (color[t.id] = WHITE));

      const adjacency: Record<string, string[]> = {};
      plan.tasks.forEach(t => (adjacency[t.id] = t.dependsOn ?? []));

      const hasCycle = (nodeId: string): boolean => {
        color[nodeId] = GRAY;
        for (const dep of adjacency[nodeId] ?? []) {
          if (color[dep] === undefined) continue; // dep not in plan (already reported as MISSING)
          if (color[dep] === GRAY) return true;
          if (color[dep] === WHITE && hasCycle(dep)) return true;
        }
        color[nodeId] = BLACK;
        return false;
      };

      for (const task of plan.tasks) {
        if (color[task.id] === WHITE && hasCycle(task.id)) {
          issues.push({
            code: 'CYCLE_DETECTED',
            taskId: task.id,
            detail: `Cyclic dependency detected involving task "${task.id}".`,
          });
        }
      }

      // 4. Detect Orphan Tasks (no capability, already checked above, but also: no deps AND nothing depends on it)
      const isDepended = new Set<string>();
      plan.tasks.forEach(t => (t.dependsOn ?? []).forEach(d => isDepended.add(d)));

      for (const task of plan.tasks) {
        const hasDeps = (task.dependsOn ?? []).length > 0;
        const isDependedOn = isDepended.has(task.id);
        if (!hasDeps && !isDependedOn && plan.tasks.length > 1) {
          issues.push({
            code: 'ORPHAN_TASK',
            taskId: task.id,
            detail: `Task "${task.id}" has no dependencies and nothing depends on it (orphan).`,
          });
        }
      }

      // 5. Detect Unreachable Tasks
      // Root tasks = tasks that nobody depends on (they have no inbound edges)
      // A task is unreachable if it cannot be reached from any root task via forward traversal
      const inboundCount: Record<string, number> = {};
      plan.tasks.forEach(t => (inboundCount[t.id] = 0));
      plan.tasks.forEach(t =>
        (t.dependsOn ?? []).forEach(dep => {
          // dep → t: so t has one inbound edge from dep
          if (inboundCount[t.id] !== undefined) inboundCount[t.id]++;
        })
      );

      // Build forward adjacency (who does this task unlock?)
      const forwardAdj: Record<string, string[]> = {};
      plan.tasks.forEach(t => (forwardAdj[t.id] = []));
      plan.tasks.forEach(t =>
        (t.dependsOn ?? []).forEach(dep => {
          if (forwardAdj[dep]) forwardAdj[dep].push(t.id);
        })
      );

      // BFS from all root nodes (tasks with 0 inbound edges)
      const reachable = new Set<string>();
      const rootTasks = plan.tasks.filter(t => inboundCount[t.id] === 0);
      const queue = rootTasks.map(t => t.id);
      while (queue.length > 0) {
        const current = queue.shift()!;
        reachable.add(current);
        for (const next of forwardAdj[current] ?? []) {
          if (!reachable.has(next)) queue.push(next);
        }
      }

      for (const task of plan.tasks) {
        if (!reachable.has(task.id)) {
          // Don't double-report if already flagged as ORPHAN or CYCLE
          const alreadyReported = issues.some(
            i => i.taskId === task.id && (i.code === 'ORPHAN_TASK' || i.code === 'CYCLE_DETECTED')
          );
          if (!alreadyReported) {
            issues.push({
              code: 'UNREACHABLE_TASK',
              taskId: task.id,
              detail: `Task "${task.id}" is not reachable from any root task.`,
            });
          }
        }
      }

      return { valid: issues.length === 0, issues };
    });
  }

  /**
   * solveDependencies(plan) — Kahn's Topological Sort.
   * Returns tasks in valid execution order.
   * Throws if the graph contains cycles (should be validated first).
   */
  public solveDependencies(plan: ExecutionPlan): string[] {
    return this.measure('solveDependencies', () => {
      if (!plan || !plan.tasks) throw new Error('solveDependencies: plan.tasks is required');

      const inDegree: Record<string, number> = {};
      const forwardAdj: Record<string, string[]> = {};

      plan.tasks.forEach(t => {
        inDegree[t.id] = 0;
        forwardAdj[t.id] = [];
      });

      plan.tasks.forEach(t => {
        (t.dependsOn ?? []).forEach(dep => {
          forwardAdj[dep].push(t.id);
          inDegree[t.id]++;
        });
      });

      const queue: string[] = Object.entries(inDegree)
        .filter(([, d]) => d === 0)
        .map(([id]) => id);

      const order: string[] = [];

      while (queue.length > 0) {
        const current = queue.shift()!;
        order.push(current);
        for (const next of forwardAdj[current]) {
          inDegree[next]--;
          if (inDegree[next] === 0) queue.push(next);
        }
      }

      if (order.length !== plan.tasks.length) {
        throw new Error('solveDependencies: cyclic dependency detected — cannot produce a linear order');
      }

      return order;
    });
  }

  // ── Store Access ──

  public getPlan(planId: string): ExecutionPlan | undefined {
    return this.measure('getPlan', () => {
      if (!planId) throw new Error('getPlan: planId is required');
      return this.store.getPlan(planId);
    });
  }

  public deletePlan(planId: string): boolean {
    return this.measure('deletePlan', () => {
      if (!planId) throw new Error('deletePlan: planId is required');
      return this.store.deletePlan(planId);
    });
  }

  public getAllPlans(): ExecutionPlan[] {
    return this.measure('getAllPlans', () => this.store.getAllPlans());
  }
}
