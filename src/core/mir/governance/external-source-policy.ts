/**
 * BELLA EOS MIR GOVERNANCE: External Source Policy Runtime (Runtime 51)
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Mission: External Data Policy Safeguard Engine. Enforces enterprise compliance rules
 * (e.g. Prohibiting personal blogs for Strategy formulation or Facebook comments for Financial Forecasts).
 */

export interface SourcePolicyCheckResult {
  isAllowed: boolean;
  policyViolation?: string;
}

export class ExternalSourcePolicyRuntime {
  private static instance: ExternalSourcePolicyRuntime;

  private constructor() {}

  public static getInstance(): ExternalSourcePolicyRuntime {
    if (!ExternalSourcePolicyRuntime.instance) {
      ExternalSourcePolicyRuntime.instance = new ExternalSourcePolicyRuntime();
    }
    return ExternalSourcePolicyRuntime.instance;
  }

  public validateSourcePolicy(useCase: 'STRATEGY' | 'FINANCIAL_FORECAST' | 'CUSTOMER_VOICE', sourceType: string): SourcePolicyCheckResult {
    if (useCase === 'STRATEGY' && (sourceType.includes('BLOG') || sourceType.includes('SOCIAL_COMMENT'))) {
      return {
        isAllowed: false,
        policyViolation: 'POLICY VIOLATION: Unverified personal blogs and social comments are strictly prohibited for Strategy formulation.',
      };
    }

    if (useCase === 'FINANCIAL_FORECAST' && sourceType.includes('CUSTOMER_REVIEW')) {
      return {
        isAllowed: false,
        policyViolation: 'POLICY VIOLATION: Customer reviews cannot be used as primary inputs for Financial Forecasts.',
      };
    }

    return {
      isAllowed: true,
    };
  }
}
