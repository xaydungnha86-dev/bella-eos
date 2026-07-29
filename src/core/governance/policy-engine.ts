/**
 * BELLA EOS PLATFORM: Policy Engine (Layer 1/2 Governance Gate)
 * Enforces dynamic Policy-as-Code rules and constraints at runtime.
 */

import { IPolicyDefinition } from '@/types/policy-definition';
import { PolicyEvaluator } from './policy-as-code-evaluator';

export interface PolicyCheck {
  policyId: string;
  name: string;
  passed: boolean;
  reason?: string;
  severity?: 'STRICT_BLOCK' | 'WARN_AND_AUDIT' | 'LOG_ONLY';
}

export interface PolicyEvaluationResult {
  passed: boolean;
  violations: PolicyCheck[];
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private policies: Map<string, IPolicyDefinition> = new Map();
  private defaultBudgetLimit = 50000000; // 50M VND

  private constructor() {
    this.seedDefaultPolicies();
  }

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  private seedDefaultPolicies(): void {
    // Seed default GDPR check
    this.addPolicy({
      policyId: 'POL-COMP-GDPR',
      policyName: 'GDPR Customer PII Export restriction',
      policyCategory: 'COMPLIANCE',
      ruleExpression: "action == 'EXPORT' && dataset == 'PII' && userRole != 'DATA_PRIVACY_OFFICER'",
      actionAllowed: false,
      enforcementLevel: 'STRICT_BLOCK'
    });

    // Seed default Inventory check
    this.addPolicy({
      policyId: 'POL-OPS-INV',
      policyName: 'Minimum inventory threshold block',
      policyCategory: 'LEGAL',
      ruleExpression: "inventory < minimum",
      actionAllowed: false,
      enforcementLevel: 'STRICT_BLOCK'
    });

    // Seed default budget cap warning
    this.addPolicy({
      policyId: 'POL-FIN-WARN',
      policyName: 'High value campaign warning',
      policyCategory: 'APPROVAL',
      ruleExpression: "amount > 60000000",
      actionAllowed: false,
      enforcementLevel: 'WARN_AND_AUDIT'
    });
  }

  /**
   * Registers a new dynamic policy definition.
   */
  public addPolicy(policy: IPolicyDefinition): void {
    this.policies.set(policy.policyId, policy);
  }

  /**
   * Removes a dynamic policy by id.
   */
  public removePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  /**
   * Lists all currently active policies.
   */
  public getPolicies(): IPolicyDefinition[] {
    return Array.from(this.policies.values());
  }

  /**
   * Evaluates all policies for a given action and execution context.
   */
  public evaluatePolicies(action: string, context: Record<string, any>): PolicyEvaluationResult {
    const violations: PolicyCheck[] = [];
    const fullContext = { ...context, action };

    for (const policy of this.policies.values()) {
      try {
        const matched = PolicyEvaluator.evaluate(policy.ruleExpression, fullContext);
        // If the rule expression evaluates to true, it means the block condition matches,
        // so a violation is registered.
        if (matched) {
          violations.push({
            policyId: policy.policyId,
            name: policy.policyName,
            passed: false,
            reason: `Policy violation: ${policy.policyName} triggered by rule "${policy.ruleExpression}".`,
            severity: policy.enforcementLevel
          });
        }
      } catch (err: any) {
        console.warn(`[PolicyEngine] Error evaluating policy ${policy.policyId}:`, err.message);
      }
    }

    const strictlyBlocked = violations.some(v => v.severity === 'STRICT_BLOCK');

    return {
      passed: !strictlyBlocked,
      violations
    };
  }

  /**
   * Legacy method preserved for backward compatibility and simple test suites.
   */
  public checkBudgetPolicy(proposedBudget: number, customLimit?: number): PolicyCheck {
    const limit = customLimit ?? this.defaultBudgetLimit;
    const passed = proposedBudget <= limit;
    
    return {
      policyId: 'POL-FIN-001',
      name: 'Marketing Ad-spend Threshold Gate',
      passed,
      reason: passed 
        ? undefined 
        : `Ngân sách đề xuất ${proposedBudget.toLocaleString('vi-VN')} VND vượt quá giới hạn chính sách ${limit.toLocaleString('vi-VN')} VND.`
    };
  }
}
