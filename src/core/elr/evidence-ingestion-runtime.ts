/**
 * BELLA EOS ELR: Evidence Ingestion Runtime (Runtime 1)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Ingest multi-modal enterprise inputs (PDF, DOCX, Excel, Voice Transcripts, 
 * Screenshots, Zalo/Slack logs, ERP/CRM Exports) and convert them into standardized IEvidence Objects.
 */

import { IEvidence, EvidenceType, IEvidenceAttachment } from '@/types/evidence';
import { SupabaseMetadataStore, SupabaseBlobStore } from '@/core/storage/storage-services';

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

    // Asynchronously persist to EKR registry (Fire & Forget to preserve synchronous API contract)
    this.persistToEKR(evidence).catch(err => {
      console.error(`[EvidenceIngestionRuntime] Failed to persist evidence ${id} to EKR:`, err);
    });

    return evidence;
  }

  private async persistToEKR(evidence: IEvidence): Promise<void> {
    const metadataStore = SupabaseMetadataStore.getInstance();
    const blobStore = SupabaseBlobStore.getInstance();

    const title = evidence.source;
    const department = evidence.metadata.department || 'GENERAL';
    const ownerId = evidence.createdBy;
    const contentStr = typeof evidence.content === 'string'
      ? evidence.content
      : JSON.stringify(evidence.content);

    const hash = evidence.metadata.rawHash || `hash-${Date.now()}`;
    const size = Buffer.byteLength(contentStr);
    
    // Determine target storage path
    const sanitizedTitle = title.replace(/\s+/g, '_').toLowerCase();
    const storagePath = `documents/${department.toLowerCase()}/${sanitizedTitle}_${evidence.id}.txt`;

    // 1. Upload raw content to Object Storage (BlobStore)
    await blobStore.uploadBlob(storagePath, contentStr, 'text/plain');

    // 2. Query documents table to see if document already exists
    const existingDocs = await metadataStore.query('documents', { title, department });
    let documentId: string;
    let nextVersionNumber = 1;

    if (existingDocs.length > 0) {
      // Document exists, get the latest version number
      const doc = existingDocs[0];
      documentId = doc.id;
      
      const versions = await metadataStore.query('document_versions', { document_id: documentId });
      if (versions.length > 0) {
        const maxVer = Math.max(...versions.map(v => v.version_number));
        nextVersionNumber = maxVer + 1;
      }
    } else {
      // Document does not exist, create document identity
      documentId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await metadataStore.insert('documents', {
        id: documentId,
        title,
        department,
        owner_id: ownerId === 'SYSTEM_INGESTION' ? null : ownerId,
        status: 'APPROVED'
      });
    }

    // 3. Create document version record
    const versionId = `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await metadataStore.insert('document_versions', {
      id: versionId,
      document_id: documentId,
      version_number: nextVersionNumber,
      storage_path: storagePath,
      mime_type: 'text/plain',
      file_size: size,
      checksum: hash
    });

    // 4. Update evidence metadata with registry details
    evidence.metadata.documentId = documentId;
    evidence.metadata.versionId = versionId;
    evidence.metadata.versionNumber = nextVersionNumber;
    evidence.metadata.storagePath = storagePath;
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
