/**
 * BELLA EOS EKR PIPELINE VERIFICATION RUNNER
 * Runs the E2E verification of EKR Storage, Versioning, Chunking, and Vector search.
 */

import { EvidenceIngestionRuntime } from '../src/core/elr/evidence-ingestion-runtime';
import { EnterpriseParserRuntime } from '../src/core/elr/enterprise-parser-runtime';
import { SupabaseMetadataStore, SupabaseBlobStore, SupabaseVectorStore } from '../src/core/storage/storage-services';

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 100));

async function runVerification() {
  console.log('🏁 Starting Bella EOS EKR Verification Suite...');

  const metadataStore = SupabaseMetadataStore.getInstance();
  const blobStore = SupabaseBlobStore.getInstance();
  const vectorStore = SupabaseVectorStore.getInstance();
  const ingestion = EvidenceIngestionRuntime.getInstance();
  const parser = EnterpriseParserRuntime.getInstance();

  // Test 1: Ingestion & Blob Upload & Metadata Registry
  console.log('\n📝 Test 1: Ingesting SOP document (v1)...');
  const docTitle = 'SOP_Sales_Ban_Hang.docx';
  const content = 'Quy trình bán hàng tiêu chuẩn của Bella Spa. Bước 1: Tiếp đón. Bước 2: Tư vấn dịch vụ. Đã duyệt ngân sách marketing 50 triệu.';

  const evidence1 = ingestion.ingest({
    type: 'SOP_REVIEW',
    source: docTitle,
    content: content,
    tenantId: 'tenant-bella-spa',
    department: 'Marketing',
    createdBy: 'ceo'
  });

  await flushPromises();

  console.log('✓ Evidence Ingested:', evidence1.id);
  console.log('✓ Document Metadata ID:', evidence1.metadata.documentId);
  console.log('✓ Document Version ID:', evidence1.metadata.versionId);
  console.log('✓ Version Number:', evidence1.metadata.versionNumber);
  console.log('✓ Storage Path:', evidence1.metadata.storagePath);

  if (evidence1.metadata.versionNumber !== 1) {
    throw new Error('Test 1 Failed: Version number should be 1');
  }

  // Verify Blob Store content
  const blobContent = await blobStore.downloadBlob(evidence1.metadata.storagePath);
  if (blobContent?.toString() !== content) {
    throw new Error('Test 1 Failed: Blob content mismatch');
  }
  console.log('✓ Blob Store verified (download content matches raw input)');

  // Verify Metadata Store document
  const docRecord = await metadataStore.findById('documents', evidence1.metadata.documentId);
  if (!docRecord || docRecord.title !== docTitle) {
    throw new Error('Test 1 Failed: Document metadata not found or incorrect');
  }
  console.log('✓ Metadata Store verified (documents record created)');


  // Test 2: Document Versioning
  console.log('\n📝 Test 2: Ingesting SOP document v2 (version increment)...');
  const contentV2 = 'Quy trình bán hàng Bella Spa v2. Bước 1: Tư vấn nhiệt tình. Bước 2: Chốt deal nhanh chóng.';

  const evidence2 = ingestion.ingest({
    type: 'SOP_REVIEW',
    source: docTitle,
    content: contentV2,
    tenantId: 'tenant-bella-spa',
    department: 'Marketing',
    createdBy: 'ceo'
  });

  await flushPromises();

  console.log('✓ Ingested V2. Version Number:', evidence2.metadata.versionNumber);
  if (evidence2.metadata.versionNumber !== 2) {
    throw new Error('Test 2 Failed: Version number should have incremented to 2');
  }

  const versions = await metadataStore.query('document_versions', { document_id: evidence2.metadata.documentId });
  console.log('✓ Total document versions in DB:', versions.length);
  if (versions.length !== 2) {
    throw new Error('Test 2 Failed: Should have 2 versions in metadata store');
  }
  console.log('✓ Document Versioning verified successfully!');


  // Test 3: Parsing & Chunking & Vector Store Search
  console.log('\n📝 Test 3: Parsing Meeting Minutes & Semantic Vector Search...');
  const docTitle3 = 'Meeting_Minutes_CEO_Decision.pdf';
  const minutesContent = 'Biên bản họp tuần 27/07/2026. Đã quyết định triển khai chiến dịch thu hè. Giao việc cho mkt làm Landing Page, deadline 01/08/2026.';

  const evidence3 = ingestion.ingest({
    type: 'MEETING_MINUTES',
    source: docTitle3,
    content: minutesContent,
    tenantId: 'tenant-bella-spa',
    department: 'Operations',
    createdBy: 'ceo'
  });

  await flushPromises();

  const parsedResult = parser.parse(evidence3);
  console.log('✓ Parsed Objects count:', parsedResult.parsedObjects.length);
  const decisionObj = parsedResult.parsedObjects.find(o => o.type === 'DECISION');
  if (!decisionObj) {
    throw new Error('Test 3 Failed: Decision object should be parsed');
  }
  console.log('✓ Parsed Decision identity:', decisionObj.id);

  await flushPromises();

  // Verify parsed objects persisted in Postgres metadata table
  const parsedRecords = await metadataStore.query('parsed_objects', { document_id: evidence3.metadata.documentId });
  console.log('✓ Parsed objects saved in relational table:', parsedRecords.length);
  if (parsedRecords.length === 0) {
    throw new Error('Test 3 Failed: Parsed objects not persisted in MetadataStore');
  }

  // Create a query vector search for "Landing Page"
  const queryVector = new Array(1536).fill(0);
  let hash = 0;
  const searchString = 'Landing Page';
  for (let i = 0; i < searchString.length; i++) {
    hash = searchString.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (let i = 0; i < 1536; i++) {
    queryVector[i] = Math.sin(hash + i) * 0.1;
  }

  console.log('🔍 Performing semantic search for "Landing Page"...');
  const searchMatches = await vectorStore.searchVector(queryVector, 3, 0.5);
  console.log('✓ Semantic matches found:', searchMatches.length);
  if (searchMatches.length === 0) {
    throw new Error('Test 3 Failed: Vector Store returned 0 matches');
  }

  console.log('✓ Matching chunk content:', searchMatches[0].payload.content);
  console.log('✓ Parent Document ID:', searchMatches[0].payload.document_id);
  console.log('✓ Version ID:', searchMatches[0].payload.version_id);
  
  if (!searchMatches[0].payload.content.includes('Landing Page')) {
    throw new Error('Test 3 Failed: Matching chunk does not contain search term');
  }

  console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 100% VALIDATED.');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
