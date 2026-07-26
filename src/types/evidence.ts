/**
 * BELLA EOS PLATFORM CONTRACT: Evidence Contract (IEvidence v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME (ELR)
 * 
 * Contract 20: Standardized Evidence Object representing structured or un-structured
 * enterprise operational inputs entering the Enterprise Learning Runtime.
 */

export type EvidenceType = 
  | 'MEETING_MINUTES' 
  | 'CAMPAIGN_REPORT' 
  | 'MONTHLY_REPORT' 
  | 'SOP_REVIEW' 
  | 'INCIDENT_REPORT' 
  | 'CUSTOMER_FEEDBACK' 
  | 'EXCEL_KPI' 
  | 'PDF_DOC' 
  | 'VOICE_TRANSCRIPT' 
  | 'IMAGE_OCR' 
  | 'EMAIL' 
  | 'CHAT_LOG' 
  | 'ERP_EXPORT' 
  | 'CRM_EXPORT'
  | 'TASK_REVIEW';

export type EvidenceStatus = 
  | 'INGESTED' 
  | 'PARSED' 
  | 'EXTRACTED' 
  | 'RESOLVED' 
  | 'VALIDATED' 
  | 'REQUIRES_HUMAN_APPROVAL' 
  | 'COMMITTED_TO_BRAIN' 
  | 'REJECTED';

export interface IEvidenceAttachment {
  id: string;
  filename: string;
  mimeType: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface IEvidence {
  id: string;
  type: EvidenceType;
  source: string;
  content: string | Record<string, any>;
  attachments: IEvidenceAttachment[];
  confidence: number; // 0.0 to 1.0
  status: EvidenceStatus;
  metadata: {
    tenantId: string;
    department?: string;
    tags?: string[];
    rawHash?: string;
    parsedObjectsCount?: number;
    [key: string]: any;
  };
  createdBy: string;
  createdAt: string;
}
