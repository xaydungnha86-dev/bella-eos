import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/db/audit
 *
 * Saves a real audit record to Supabase `audit_ledger` table.
 * Uses service-role key from .env.local (never exposed to browser).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { transactionId, sourceIdentity, actionType, payload } = body;

    if (!transactionId || !actionType) {
      return NextResponse.json(
        { error: '`transactionId` and `actionType` are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase chưa được cấu hình trong .env.local' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase.from('audit_ledger').insert([
      {
        transaction_id: transactionId,
        source_identity: sourceIdentity || 'bella-eos-client',
        action_type: actionType,
        payload: payload || {},
        timestamp: new Date().toISOString()
      }
    ]);

    if (error) {
      console.warn('[API /db/audit] Supabase insert error:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
