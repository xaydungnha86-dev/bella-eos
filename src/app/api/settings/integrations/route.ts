import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// GET /api/settings/integrations?workspace_id=default
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspace_id') || 'default';

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('integrations')
      .select('provider, label, key_name, is_active, updated_at')   // key_value intentionally omitted
      .eq('workspace_id', workspaceId)
      .order('provider');

    if (error) throw error;

    // Map to a cleaner shape — mask the actual key value (show *** from UI)
    const grouped: Record<string, { label: string; key_name: string; is_active: boolean; saved: boolean }[]> = {};
    for (const row of data ?? []) {
      if (!grouped[row.provider]) grouped[row.provider] = [];
      grouped[row.provider].push({
        label: row.label,
        key_name: row.key_name,
        is_active: row.is_active,
        saved: true
      });
    }

    return NextResponse.json({ success: true, integrations: grouped });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/settings/integrations
// Body: { workspace_id, provider, label, key_name, key_value }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspace_id = 'default', provider, label, key_name, key_value } = body as {
      workspace_id?: string;
      provider: string;
      label: string;
      key_name: string;
      key_value: string;
    };

    if (!provider || !key_name || !key_value) {
      return NextResponse.json({ error: 'provider, key_name, and key_value are required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('integrations').upsert(
      [{ workspace_id, provider, label, key_name, key_value, is_active: true }],
      { onConflict: 'workspace_id,provider,key_name' }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/settings/integrations
// Body: { workspace_id, provider, key_name }
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { workspace_id = 'default', provider, key_name } = body;

    const supabase = getSupabase();
    const { error } = await supabase
      .from('integrations')
      .delete()
      .match({ workspace_id, provider, key_name });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
