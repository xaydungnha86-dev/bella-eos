/**
 * BELLA EOS CERTIFICATION: Enterprise Knowledge Repository (EKR) Storage & Pipeline Certification Suite
 * Specification: ADR-0006 EKR STORAGE ARCHITECTURE
 * 
 * Verifies document registry metadata storage, physical file upload tracking in IBlobStore,
 * automated document version increments (v1, v2, v3), structural parsing, semantic chunking,
 * deterministic embedding vectorization, and vector search matching.
 */

import { EvidenceIngestionRuntime } from '@/core/elr/evidence-ingestion-runtime';
import { EnterpriseParserRuntime } from '@/core/elr/enterprise-parser-runtime';
import { SupabaseMetadataStore, SupabaseBlobStore, SupabaseVectorStore } from '@/core/storage/storage-services';

describe('BELLA EOS EKR Storage & Pipeline E2E Certification', () => {
  const metadataStore = SupabaseMetadataStore.getInstance();
  const blobStore = SupabaseBlobStore.getInstance();
  const vectorStore = SupabaseVectorStore.getInstance();
  const ingestion = EvidenceIngestionRuntime.getInstance();
  const parser = EnterpriseParserRuntime.getInstance();

  // Helper to wait for async tasks (fire-and-forget logic) to finish in the event loop
  const flushPromises = () => new Promise(setImmediate);

  it('1. Should persist raw document file in BlobStore and create metadata registry record (Version 1)', async () => {
    const docTitle = 'SOP_Sales_Ban_Hang.docx';
    const content = 'Quy trình bán hàng tiêu chuẩn của Bella Spa. Bước 1: Tiếp đón. Bước 2: Tư vấn dịch vụ. Đã duyệt ngân sách marketing 50 triệu.';

    // Ingest the raw evidence document
    const evidence = ingestion.ingest({
      type: 'SOP_REVIEW',
      source: docTitle,
      content: content,
      tenantId: 'tenant-bella-spa',
      department: 'Marketing',
      createdBy: 'ceo'
    });

    // Wait for the async EKR persistence task to run
    await flushPromises();

    // Verify evidence object was enriched with document metadata
    expect(evidence.metadata.documentId).toBeDefined();
    expect(evidence.metadata.versionId).toBeDefined();
    expect(evidence.metadata.versionNumber).toBe(1);
    expect(evidence.metadata.storagePath).toContain('sop_sales_ban_hang.docx');

    // Verify Blob Store contains the raw document content
    const storagePath = evidence.metadata.storagePath;
    const blobContent = await blobStore.downloadBlob(storagePath);
    expect(blobContent?.toString()).toBe(content);

    // Verify Document Registry has metadata entry
    const docRecord = await metadataStore.findById('documents', evidence.metadata.documentId);
    expect(docRecord).not.toBeNull();
    expect(docRecord?.title).toBe(docTitle);
    expect(docRecord?.department).toBe('Marketing');
    expect(docRecord?.status).toBe('APPROVED');

    // Verify Document Version is created
    const verRecord = await metadataStore.findById('document_versions', evidence.metadata.versionId);
    expect(verRecord).not.toBeNull();
    expect(verRecord?.document_id).toBe(evidence.metadata.documentId);
    expect(verRecord?.version_number).toBe(1);
  });

  it('2. Should support document versioning: increment version to 2 upon uploading the same document title', async () => {
    const docTitle = 'SOP_Sales_Ban_Hang.docx';
    const contentV2 = 'Quy trình bán hàng Bella Spa v2. Bước 1: Tư vấn nhiệt tình. Bước 2: Chốt deal nhanh chóng.';

    // Ingest the second version of the document
    const evidence = ingestion.ingest({
      type: 'SOP_REVIEW',
      source: docTitle,
      content: contentV2,
      tenantId: 'tenant-bella-spa',
      department: 'Marketing',
      createdBy: 'ceo'
    });

    await flushPromises();

    // Verify version is incremented to 2
    expect(evidence.metadata.versionNumber).toBe(2);

    // Verify both versions exist under the same document
    const docId = evidence.metadata.documentId;
    const versions = await metadataStore.query('document_versions', { document_id: docId });
    expect(versions.length).toBe(2);

    const v1 = versions.find(v => v.version_number === 1);
    const v2 = versions.find(v => v.version_number === 2);
    expect(v1).toBeDefined();
    expect(v2).toBeDefined();
    expect(v2?.id).toBe(evidence.metadata.versionId);
  });

  it('3. Should parse document, save structured entities to relational store, and chunk/vectorize content to VectorStore', async () => {
    const docTitle = 'Meeting_Minutes_CEO_Decision.pdf';
    const content = 'Biên bản họp tuần 27/07/2026. Đã quyết định triển khai chiến dịch thu hè. Giao việc cho mkt làm Landing Page, deadline 01/08/2026.';

    const evidence = ingestion.ingest({
      type: 'MEETING_MINUTES',
      source: docTitle,
      content: content,
      tenantId: 'tenant-bella-spa',
      department: 'Operations',
      createdBy: 'ceo'
    });

    await flushPromises();

    // Run Parser Runtime on the document
    const parsedResult = parser.parse(evidence);
    expect(parsedResult.parsedObjects.length).toBeGreaterThan(0);

    // Confirm that Decisions or Action Items are parsed
    const decisionObj = parsedResult.parsedObjects.find(o => o.type === 'DECISION');
    expect(decisionObj).toBeDefined();

    await flushPromises();

    // Verify structured parsed entities are persisted in the Metadata Store
    const parsedRecords = await metadataStore.query('parsed_objects', { document_id: evidence.metadata.documentId });
    expect(parsedRecords.length).toBeGreaterThan(0);
    expect(parsedRecords.find(r => r.object_type === 'DECISION')).toBeDefined();

    // Verify semantic text chunks are generated and stored in the VectorStore
    // Our mock embedding query vector (deterministic for the search term 'Landing Page')
    const queryVector = new Array(1536).fill(0);
    let hash = 0;
    const searchString = 'Landing Page';
    for (let i = 0; i < searchString.length; i++) {
      hash = searchString.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < 1536; i++) {
      queryVector[i] = Math.sin(hash + i) * 0.1;
    }

    // Search vector store for semantic matches
    const searchMatches = await vectorStore.searchVector(queryVector, 3, 0.5);
    expect(searchMatches.length).toBeGreaterThan(0);
    expect(searchMatches[0].payload.document_id).toBe(evidence.metadata.documentId);
    expect(searchMatches[0].payload.version_id).toBe(evidence.metadata.versionId);
    expect(searchMatches[0].payload.content).toContain('Landing Page');
  });
});
