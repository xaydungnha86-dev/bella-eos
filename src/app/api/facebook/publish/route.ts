import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Resolve Facebook Page Access Token — priority order:
 *  1. Token passed directly in request body (from client localStorage)
 *  2. Supabase integrations table (if DB is configured)
 *  3. Server .env.local environment variable
 */
async function resolveToken(workspaceId: string, clientToken?: string): Promise<string | null> {
  // Priority 1: token sent by client (from localStorage in browser)
  if (clientToken && clientToken.trim().length > 10) return clientToken.trim();

  // Priority 2: Supabase DB
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from('integrations')
        .select('key_value')
        .match({ workspace_id: workspaceId, provider: 'facebook', key_name: 'page_access_token', is_active: true })
        .single();
      if (data?.key_value) return data.key_value;
    }
  } catch (_) { /* DB not configured — continue */ }

  // Priority 3: server env
  return process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
}

async function resolvePageId(workspaceId: string, clientPageId?: string): Promise<string> {
  if (clientPageId && clientPageId.trim()) return clientPageId.trim();

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from('integrations')
        .select('key_value')
        .match({ workspace_id: workspaceId, provider: 'facebook', key_name: 'page_id', is_active: true })
        .single();
      if (data?.key_value) return data.key_value;
    }
  } catch (_) { /* ignore */ }

  return process.env.FACEBOOK_PAGE_ID || 'me';
}

/**
 * POST /api/facebook/publish
 * Body: { message, workspace_id?, client_token?, client_page_id? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      message,
      workspace_id = 'default',
      client_token,
      client_page_id
    } = body as {
      message: string;
      workspace_id?: string;
      client_token?: string;
      client_page_id?: string;
    };

    if (!message) {
      return NextResponse.json({ error: '`message` field is required' }, { status: 400 });
    }

    const accessToken = await resolveToken(workspace_id, client_token);
    const pageId = await resolvePageId(workspace_id, client_page_id);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          mode: 'CONFIG_REQUIRED',
          error: 'Facebook Page Access Token chưa được cấu hình. Vui lòng vào Cài đặt Tích hợp → Facebook Fanpage để nhập token.'
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
      const isExpired = fbData.error?.message?.includes('expired') || fbData.error?.code === 190 || fbData.error?.type === 'OAuthException';
      return NextResponse.json(
        {
          success: false,
          mode: isExpired ? 'CONFIG_REQUIRED' : 'REAL_API',
          isExpired,
          error: isExpired
            ? 'Facebook Page Access Token đã hết hạn session. Vui lòng vào Cài đặt Tích hợp → Facebook Fanpage để cập nhật Token mới.'
            : (fbData.error?.message || 'Facebook API error')
        },
        { status: isExpired ? 503 : 502 }
      );
    }

    console.log(`[API /facebook/publish] ✅ Published. FB Post ID: ${fbData.id}`);
    return NextResponse.json({ success: true, mode: 'REAL_API', postId: fbData.id });

  } catch (err: any) {
    console.error('[API /facebook/publish] Internal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
