import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EnterpriseBrain } from '../../../core/brain';

/**
 * POST /api/ingest
 *
 * Accepts a file upload via FormData or JSON body.
 * - Reads text content from uploaded file
 * - Processes through EnterpriseBrain.Understanding for DNA analysis
 * - Persists metadata + content to Supabase `knowledge_documents` table
 *
 * FormData fields:
 *   file   — the uploaded File object
 *
 * JSON body (fallback):
 *   { fileName, content, size }
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileName = '';
    let fileContent = '';
    let fileSize = '';
    let fileType = '';

    // ── FormData path ──────────────────────────────────────────────────────────
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided in FormData' }, { status: 400 });
      }

      fileName = file.name;
      fileType = file.type;
      const bytes = file.size;
      fileSize = bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${(bytes / 1024).toFixed(0)} KB`;

      // Read text content
      const textTypes = ['text/plain', 'text/markdown', 'application/json', 'text/csv', 'text/html'];
      const isText = textTypes.some(t => fileType.startsWith(t)) ||
        /\.(txt|md|json|csv|html)$/i.test(fileName);

      if (isText) {
        fileContent = await file.text();
      } else {
        // Binary files: extract metadata as structured text placeholder
        fileContent = `[Binary Document] FileName: ${fileName} | Type: ${fileType} | Size: ${fileSize}`;
      }

    // ── JSON path (legacy / backward compat) ──────────────────────────────────
    } else {
      const body = await request.json().catch(() => ({}));
      fileName = body.fileName || '';
      fileContent = body.content || '';
      fileSize = body.size || '';
      fileType = body.fileType || 'text/plain';

      if (!fileName || !fileContent) {
        return NextResponse.json({ error: 'fileName and content are required' }, { status: 400 });
      }
    }

    // ── Brain Processing ───────────────────────────────────────────────────────
    const result = EnterpriseBrain.Understanding.understandDocument(fileName, fileContent);
    EnterpriseBrain.Knowledge.updateDNA(result.dnaTone, result.styleClass);

    // ── Supabase Persistence ───────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let savedId: string | null = null;

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);

      const { data, error } = await supabase
        .from('knowledge_documents')
        .insert([{
          file_name:      fileName,
          file_size:      fileSize,
          file_type:      fileType,
          content:        fileContent.substring(0, 10000), // cap at 10k chars to avoid row size limits
          classification: result.classification,
          dna_tone:       result.dnaTone,
          style_class:    result.styleClass,
          entities:       result.entities || [],
          tenant_id:      'bella-eos',
          ingested_at:    new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) {
        console.warn('[API /ingest] Supabase insert warning:', error.message);
      } else {
        savedId = data?.id ?? null;
      }
    } else {
      console.warn('[API /ingest] Supabase not configured — document processed but not persisted.');
    }

    return NextResponse.json({
      success: true,
      savedId,
      persisted: !!savedId,
      ingested: {
        fileName:         result.fileName,
        fileSize,
        classification:   result.classification,
        extractedEntities: result.entities,
        dnaToneUpdated:   result.dnaTone,
        styleUpdated:     result.styleClass
      }
    });

  } catch (err: any) {
    console.error('[API /ingest] Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
