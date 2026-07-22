import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function resolveToken(workspaceId: string): Promise<string | null> {
  // Priority 1: Supabase integrations table (customer-managed via Settings UI)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('integrations')
      .select('key_value')
      .match({ workspace_id: workspaceId, provider: 'facebook', key_name: 'page_access_token', is_active: true })
      .single();

    if (data?.key_value) return data.key_value;
  } catch (_) { /* fall through */ }

  // Priority 2: Server environment variable (set by admin/devops)
  if (process.env.FACEBOOK_PAGE_ACCESS_TOKEN) return process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  return null;
}

async function resolvePageId(workspaceId: string): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('integrations')
      .select('key_value')
      .match({ workspace_id: workspaceId, provider: 'facebook', key_name: 'page_id', is_active: true })
      .single();

    if (data?.key_value) return data.key_value;
  } catch (_) { /* fall through */ }

  return process.env.FACEBOOK_PAGE_ID || 'me';
}

/**
 * POST /api/facebook/publish
 * Body: { message: string, workspace_id?: string }
 *
 * Resolves the Facebook Page Access Token from:
 *   1. Supabase integrations table (customer self-configured via UI)
 *   2. Server .env.local (fallback for admin/devops-managed deployments)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { message, workspace_id = 'default' } = body as { message: string; workspace_id?: string };

    if (!message) {
      return NextResponse.json({ error: '`message` field is required' }, { status: 400 });
    }

    const accessToken = await resolveToken(workspace_id);
    const pageId = await resolvePageId(workspace_id);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          mode: 'CONFIG_REQUIRED',
          error: 'Facebook Page Access Token chưa được cấu hình. Vui lòng vào Trang Cài đặt Tích hợp để nhập token.'
        },
        { status: 503 }
      );
    }

    const fbUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const fbResponse = await fetch(fbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: accessToken })
    });

    const fbData = await fbResponse.json();

    if (!fbResponse.ok || fbData.error) {
      console.error('[API /facebook/publish] Facebook error:', fbData.error);
      return NextResponse.json(
        { success: false, mode: 'REAL_API', error: fbData.error?.message || 'Facebook API error' },
        { status: 502 }
      );
    }

    console.log(`[API /facebook/publish] ✅ Published. FB Post ID: ${fbData.id}`);
    return NextResponse.json({ success: true, mode: 'REAL_API', postId: fbData.id });
  } catch (err: any) {
    console.error('[API /facebook/publish] Internal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
