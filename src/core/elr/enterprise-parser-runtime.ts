/**
 * BELLA EOS ELR: Enterprise Parser Runtime (Runtime 2)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Understand raw operational documents and transform them into 
 * structured Enterprise Objects (Campaign, Decision, Issue, Action, Owner, Deadline, Risk, KPI)
 * without lossy generic summarization.
 */

import { IEvidence } from '@/types/evidence';
import { SupabaseMetadataStore, SupabaseVectorStore } from '@/core/storage/storage-services';

export interface EnterpriseParsedObject {
  id: string;
  evidenceId: string;
  type: 'CAMPAIGN' | 'DECISION' | 'ISSUE' | 'ACTION' | 'OWNER' | 'DEADLINE' | 'RISK' | 'KPI';
  name: string;
  details: Record<string, any>;
  confidence: number;
}

export interface EnterpriseParserResult {
  evidenceId: string;
  parsedObjects: EnterpriseParsedObject[];
  extractedMetrics: Record<string, any>;
}

export class EnterpriseParserRuntime {
  private static instance: EnterpriseParserRuntime;

  private constructor() {}

  public static getInstance(): EnterpriseParserRuntime {
    if (!EnterpriseParserRuntime.instance) {
      EnterpriseParserRuntime.instance = new EnterpriseParserRuntime();
    }
    return EnterpriseParserRuntime.instance;
  }

  public parse(evidence: IEvidence): EnterpriseParserResult {
    const rawText = typeof evidence.content === 'string' 
      ? evidence.content 
      : JSON.stringify(evidence.content);

    const parsedObjects: EnterpriseParsedObject[] = [];
    const extractedMetrics: Record<string, any> = {};

    // 1. Structural extraction of Enterprise Objects from Evidence text/JSON
    const textLower = rawText.toLowerCase();

    // Parse Decisions
    if (textLower.includes('quyết định') || textLower.includes('quuyết định') || textLower.includes('decision') || textLower.includes('đã duyệt')) {
      parsedObjects.push({
        id: `obj-dec-${Date.now()}-1`,
        evidenceId: evidence.id,
        type: 'DECISION',
        name: 'Executive Directive',
        details: { rawTextSnippet: rawText },
        confidence: 0.92,
      });
    }

    // Parse Campaigns
    if (textLower.includes('campaign') || textLower.includes('chiến dịch') || textLower.includes('marketing')) {
      parsedObjects.push({
        id: `obj-cmp-${Date.now()}-2`,
        evidenceId: evidence.id,
        type: 'CAMPAIGN',
        name: 'Enterprise Campaign',
        details: { rawTextSnippet: rawText },
        confidence: 0.95,
      });
    }

    // Parse Actions & Owners
    if (textLower.includes('action') || textLower.includes('giao việc') || textLower.includes('phụ trách')) {
      parsedObjects.push({
        id: `obj-act-${Date.now()}-3`,
        evidenceId: evidence.id,
        type: 'ACTION',
        name: 'Operational Action Item',
        details: { rawTextSnippet: rawText },
        confidence: 0.88,
      });
    }

    // Parse Risks & Issues
    if (textLower.includes('risk') || textLower.includes('rủi ro') || textLower.includes('sự cố') || textLower.includes('incident')) {
      parsedObjects.push({
        id: `obj-rsk-${Date.now()}-4`,
        evidenceId: evidence.id,
        type: 'RISK',
        name: 'Identified Enterprise Risk',
        details: { rawTextSnippet: rawText },
        confidence: 0.89,
      });
    }

    // Default object fallback if generic
    if (parsedObjects.length === 0) {
      parsedObjects.push({
        id: `obj-gen-${Date.now()}-0`,
        evidenceId: evidence.id,
        type: 'KPI',
        name: 'General Operational Record',
        details: { rawTextSnippet: rawText },
        confidence: 0.85,
      });
    }

    evidence.metadata.parsedObjectsCount = parsedObjects.length;
    evidence.status = 'PARSED';

    const result: EnterpriseParserResult = {
      evidenceId: evidence.id,
      parsedObjects,
      extractedMetrics,
    };

    // Asynchronously persist parsed data and generate vector embeddings (Fire & Forget)
    this.persistParsedData(evidence, result).catch(err => {
      console.error(`[EnterpriseParserRuntime] Failed to persist parsed data to EKR for evidence ${evidence.id}:`, err);
    });

    return result;
  }

  private async persistParsedData(evidence: IEvidence, result: EnterpriseParserResult): Promise<void> {
    const metadataStore = SupabaseMetadataStore.getInstance();
    const vectorStore = SupabaseVectorStore.getInstance();

    const documentId = evidence.metadata.documentId || `doc-fallback-${evidence.id}`;
    const versionId = evidence.metadata.versionId || `ver-fallback-${evidence.id}`;

    // 1. Persist each parsed object to Metadata Store
    for (const obj of result.parsedObjects) {
      await metadataStore.insert('parsed_objects', {
        id: obj.id,
        evidence_id: obj.evidenceId,
        document_id: documentId,
        object_type: obj.type,
        name: obj.name,
        details: obj.details,
        confidence: obj.confidence,
        created_at: new Date().toISOString()
      });
    }

    // 2. Perform chunking & vectorization
    const rawText = typeof evidence.content === 'string'
      ? evidence.content
      : JSON.stringify(evidence.content);

    // Simple chunker: split by sentence boundaries or newlines
    const sentences = rawText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 5);
    const chunks: string[] = [];
    
    // Group sentences into chunks of approx 150-300 characters
    let currentChunk = '';
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 300) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + ' ';
      } else {
        currentChunk += sentence + ' ';
      }
    }
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    // 3. Upsert chunks into Vector Store
    for (let index = 0; index < chunks.length; index++) {
      const chunkText = chunks[index];
      const chunkId = `chk-${evidence.id}-${index}`;
      const embedding = this.generateMockEmbedding(chunkText);
      const payload = {
        document_id: documentId,
        version_id: versionId,
        chunk_index: index,
        content: chunkText,
        metadata: {
          evidence_id: evidence.id,
          source: evidence.source,
          department: evidence.metadata.department
        }
      };

      await vectorStore.upsertVector(chunkId, embedding, payload);
    }
  }

  private generateMockEmbedding(text: string): number[] {
    const vector = new Array(1536).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < 1536; i++) {
      vector[i] = Math.sin(hash + i) * 0.1;
    }
    return vector;
  }
}
