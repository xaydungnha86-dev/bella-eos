/**
 * BELLA EOS PLATFORM CONTRACT: Validation Report Contract (IValidationReport v1.0)
 * Specification: v18.5 BELLA EOS ENTERPRISE COGNITIVE HARNESS RUNTIME (ECH / ECR)
 * 
 * Contract 32: Post-LLM Compliance Validation Report Contract. Evaluates generated
 * responses against hard business rules and policies, auto-correcting or rejecting non-compliant outputs.
 */

export interface IValidationReport {
  reportId: string;
  sessionId: string;
  isValid: boolean;
  complianceScore: number;
  ruleViolations: string[];
  autoCorrectedOutput?: string;
  validatedAt: string;
}
