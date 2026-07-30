/**
 * Standardized System-Wide Error Taxonomy (v1)
 */

export type ErrorCategory = 
  | 'DomainError'
  | 'PolicyViolation'
  | 'CapabilityMissing'
  | 'ModelUnavailable'
  | 'Timeout'
  | 'RateLimited'
  | 'ValidationFailed';

export class EnterpriseError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(category: ErrorCategory, code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'EnterpriseError';
    this.category = category;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class DomainError extends EnterpriseError {
  constructor(code: string, message: string, details?: Record<string, any>) {
    super('DomainError', code, message, details);
  }
}

export class PolicyViolationError extends EnterpriseError {
  constructor(code: string, message: string, details?: Record<string, any>) {
    super('PolicyViolation', code, message, details);
  }
}

export class CapabilityMissingError extends EnterpriseError {
  constructor(capabilityId: string) {
    super('CapabilityMissing', 'CAPABILITY_NOT_FOUND', `Required capability "${capabilityId}" is not registered in CapabilityRegistry.`, { capabilityId });
  }
}

export class ModelUnavailableError extends EnterpriseError {
  constructor(modelName: string, reason: string) {
    super('ModelUnavailable', 'MODEL_UNAVAILABLE', `AI Model "${modelName}" is unavailable: ${reason}`, { modelName, reason });
  }
}
