/**
 * BELLA EOS PLATFORM CORE: Evidence Validation Service
 * Part of Task Governance Bounded Context v5.4
 */

export interface TaskEvidence {
  type: string;  // 'CRM' | 'IMAGE' | 'URL' | 'FILE_HASH' | 'MARKDOWN' | 'OTHER'
  value: string;
  checksum?: string;
}

export interface ValidationResult {
  status: 'PASS' | 'PASS_WITH_WARNING' | 'MANUAL_REVIEW' | 'FAIL';
  confidence: number;
  violations: string[];
}

export class EvidenceValidationService {
  /**
   * Evaluates submitted evidence package against business criteria.
   */
  public validate(assignmentId: string, evidence: TaskEvidence[]): ValidationResult {
    if (!evidence || evidence.length === 0) {
      return {
        status: 'FAIL',
        confidence: 0,
        violations: ['Evidence package is empty. At least one verification token or report link is required.']
      };
    }

    const violations: string[] = [];
    let containsValidEvidence = false;
    let hasWarnings = false;
    let needsManualReview = false;
    let confidenceSum = 0;
    let evidenceCount = 0;

    for (const item of evidence) {
      evidenceCount++;
      const val = item.value ? item.value.trim() : '';

      switch (item.type.toUpperCase()) {
        case 'CRM': {
          // Rule: CRM reference must be in format crm::[a-zA-Z0-9_-]+
          if (!val.startsWith('crm::')) {
            violations.push(`CRM verification item "${val}" lacks the "crm::" protocol prefix.`);
            confidenceSum += 10;
          } else {
            const idPart = val.substring(5);
            if (idPart.length < 3) {
              violations.push(`CRM customer ID "${idPart}" is too short or invalid.`);
              confidenceSum += 20;
            } else if (idPart.includes('fail')) {
              violations.push(`CRM pipeline validation returned invalid or cancelled status for transaction "${idPart}".`);
              confidenceSum += 5;
            } else {
              containsValidEvidence = true;
              confidenceSum += 95;
            }
          }
          break;
        }

        case 'IMAGE': {
          if (!val) {
            violations.push('Image evidence provided is an empty file or path.');
            confidenceSum += 0;
          } else if (val.includes('corrupted') || val.includes('error')) {
            violations.push('Image format check failed: raw file header checksum mismatch.');
            confidenceSum += 10;
          } else if (val.includes('warning') || val.includes('low_res')) {
            hasWarnings = true;
            violations.push('Image check warning: low resolution asset detected.');
            containsValidEvidence = true;
            confidenceSum += 70;
          } else {
            containsValidEvidence = true;
            confidenceSum += 90;
          }
          break;
        }

        case 'URL': {
          if (!val.match(/^https?:\/\/[^\s$.?#].[^\s]*$/i)) {
            violations.push(`Provided URL "${val}" is not a valid HTTP/HTTPS path.`);
            confidenceSum += 15;
          } else if (val.includes('localhost') || val.includes('test')) {
            needsManualReview = true;
            violations.push('System warning: Submission points to a development/sandbox URL. Human inspection required.');
            containsValidEvidence = true;
            confidenceSum += 50;
          } else {
            containsValidEvidence = true;
            confidenceSum += 85;
          }
          break;
        }

        case 'FILE_HASH': {
          if (!val.match(/^[a-fA-F0-9]{32,64}$/)) {
            violations.push('Hash signature is not a valid MD5, SHA-1, or SHA-256 string.');
            confidenceSum += 20;
          } else {
            containsValidEvidence = true;
            confidenceSum += 98;
          }
          break;
        }

        case 'MARKDOWN': {
          if (val.length < 20) {
            violations.push('Text report content is too short to be considered an actionable summary.');
            confidenceSum += 30;
          } else {
            containsValidEvidence = true;
            confidenceSum += 80;
          }
          break;
        }

        default: {
          // Manual review fallback for unknown evidence formats
          needsManualReview = true;
          violations.push(`Unrecognized evidence standard "${item.type}". Manual verification required.`);
          confidenceSum += 40;
          break;
        }
      }
    }

    const averageConfidence = Math.round(confidenceSum / Math.max(1, evidenceCount));

    // Determine final validation outcome
    if (violations.length > 0 && !containsValidEvidence) {
      return {
        status: 'FAIL',
        confidence: averageConfidence,
        violations
      };
    }

    if (needsManualReview || averageConfidence < 65) {
      return {
        status: 'MANUAL_REVIEW',
        confidence: averageConfidence,
        violations
      };
    }

    if (hasWarnings || violations.length > 0) {
      return {
        status: 'PASS_WITH_WARNING',
        confidence: averageConfidence,
        violations
      };
    }

    return {
      status: 'PASS',
      confidence: averageConfidence,
      violations: []
    };
  }
}
