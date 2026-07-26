/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise State Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Corporate Operating Mode & State Model. Defines the current corporate
 * health and performance state, allowing all cognitive services to adapt their logic
 * (e.g. Crisis mode tightens financial controls, expansion mode allows aggressive growth).
 */

export type EnterpriseState = 'HEALTHY' | 'GROWING' | 'DECLINING' | 'CRISIS' | 'RECOVERY' | 'EXPANSION';

export class EnterpriseStateService {
  private static instance: EnterpriseStateService;
  private currentState: EnterpriseState = 'HEALTHY';

  private constructor() {}

  public static getInstance(): EnterpriseStateService {
    if (!EnterpriseStateService.instance) {
      EnterpriseStateService.instance = new EnterpriseStateService();
    }
    return EnterpriseStateService.instance;
  }

  public getCurrentState(): EnterpriseState {
    return this.currentState;
  }

  public setCurrentState(state: EnterpriseState): void {
    this.currentState = state;
  }

  /**
   * Returns state-specific operational guidelines that ECR reasoning model
   * can inject into its prompts.
   */
  public getStateGuideline(): string {
    switch (this.currentState) {
      case 'CRISIS':
        return 'CRITICAL OPERATION MODE: Focus on aggressive cost-saving and immediate cash preservation. Minimize high-risk long-term investments.';
      case 'EXPANSION':
        return 'GROWTH MODE: Focus on geographical scale-up, market capture, and high-velocity onboarding.';
      case 'DECLINING':
        return 'CONSERVATIVE MODE: Stabilize customer retention, optimize internal processes, review underperforming assets.';
      case 'RECOVERY':
        return 'STABILIZATION MODE: Gradually resume planned initiatives, monitor resource friction closely.';
      case 'GROWING':
      case 'HEALTHY':
      default:
        return 'STANDARD MODE: Balance growth objectives with standard risk limits.';
    }
  }

  /**
   * Modifies the decision policy auto-approval limit based on current state.
   * If CRISIS, ceilings are heavily cut. If EXPANSION, limits are slightly raised.
   */
  public getAutoApproveCapOverride(defaultCapVnd: number): number {
    if (this.currentState === 'CRISIS') {
      return 5_000_000; // Reduce ceiling to 5M VND
    }
    if (this.currentState === 'EXPANSION') {
      return 35_000_000; // Raise ceiling to 35M VND
    }
    return defaultCapVnd;
  }
}
