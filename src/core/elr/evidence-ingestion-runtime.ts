/**
 * BELLA EOS ELR: Evidence Ingestion Runtime (Runtime 1)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Ingest multi-modal enterprise inputs (PDF, DOCX, Excel, Voice Transcripts, 
 * Screenshots, Zalo/Slack logs, ERP/CRM Exports) and convert them into standardized IEvidence Objects.
 */

import { IEvidence, EvidenceType, IEvidenceAttachment } from '@/types/evidence';

export interface RawInputPayload {
  type: EvidenceType;
  source: string;
  content: string | Record<string, any>;
  attachments?: IEvidenceAttachment[];
  tenantId: string;
  department?: string;
  createdBy?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export class EvidenceIngestionRuntime {
  private static instance: EvidenceIngestionRuntime;
  private evidenceStore: Map<string, IEvidence> = new Map();

  private constructor() {}

  public static getInstance(): EvidenceIngestionRuntime {
    if (!EvidenceIngestionRuntime.instance) {
      EvidenceIngestionRuntime.instance = new EvidenceIngestionRuntime();
    }
    return EvidenceIngestionRuntime.instance;
  }

  public ingest(payload: RawInputPayload): IEvidence {
    const id = `evid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const evidence: IEvidence = {
      id,
      type: payload.type,
      source: payload.source,
      content: payload.content,
      attachments: payload.attachments || [],
      confidence: 1.0, // Initial ingestion confidence
      status: 'INGESTED',
      metadata: {
        tenantId: payload.tenantId,
        department: payload.department || 'GENERAL',
        tags: payload.tags || [],
        rawHash: `sha256-${Buffer.from(JSON.stringify(payload.content)).toString('hex').substring(0, 16)}`,
        ...payload.metadata,
      },
      createdBy: payload.createdBy || 'SYSTEM_INGESTION',
      createdAt: new Date().toISOString(),
    };

    this.evidenceStore.set(id, evidence);
    return evidence;
  }

  public getEvidence(id: string): IEvidence | undefined {
    return this.evidenceStore.get(id);
  }

  public listEvidence(tenantId?: string): IEvidence[] {
    const list = Array.from(this.evidenceStore.values());
    if (tenantId) {
      return list.filter(e => e.metadata.tenantId === tenantId);
    }
    return list;
  }

  public updateStatus(id: string, status: IEvidence['status'], confidence?: number): IEvidence | undefined {
    const item = this.evidenceStore.get(id);
    if (!item) return undefined;
    item.status = status;
    if (confidence !== undefined) {
      item.confidence = confidence;
    }
    return item;
  }
}
