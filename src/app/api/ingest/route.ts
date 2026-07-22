import { NextResponse } from 'next/server';
import { EnterpriseBrain } from '../../../core/brain';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fileName, content, size } = body;

    if (!fileName || !content) {
      return NextResponse.json({ error: 'fileName and content are required' }, { status: 400 });
    }

    // Process document ingestion via Domain 2 Understanding Center
    const result = EnterpriseBrain.Understanding.understandDocument(fileName, content);

    // Update Company DNA in Knowledge Center dynamically based on parsed results
    EnterpriseBrain.Knowledge.updateDNA(result.dnaTone, result.styleClass);

    return NextResponse.json({
      success: true,
      ingested: {
        fileName: result.fileName,
        classification: result.classification,
        extractedEntities: result.entities,
        dnaToneUpdated: result.dnaTone,
        styleUpdated: result.styleClass
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
