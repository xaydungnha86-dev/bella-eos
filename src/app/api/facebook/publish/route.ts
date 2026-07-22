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
 * Body: { message, image_url?, workspace_id?, client_token?, client_page_id? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      message,
      image_url,
      workspace_id = 'default',
      client_token,
      client_page_id
    } = body as {
      message: string;
      image_url?: string;
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

    // Dynamic PNG Graphic Banner Generator URL (Logo, Headline, Badge, Spa UI Mockup)
    const defaultBannerUrl = `${getBaseUrl(request)}/api/ai/banner-image`;
    const photoUrl = (image_url && !image_url.includes('unsplash')) ? image_url : defaultBannerUrl;

    // ── Try Facebook Graph API Photo Post Endpoint via FormData Binary Upload ─
    const fbPhotoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    let fbResponse: Response;

    try {
      console.log('[API /facebook/publish] Fetching image binary from:', photoUrl);
      const imgRes = await fetch(photoUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/png';
        const formData = new FormData();
        formData.append('caption', message);
        formData.append('access_token', accessToken);
        formData.append('source', new Blob([arrayBuffer], { type: contentType }), 'banner.png');

        console.log('[API /facebook/publish] Uploading PNG binary via FormData source to Facebook...');
        fbResponse = await fetch(fbPhotoUrl, {
          method: 'POST',
          body: formData
        });
      } else {
        console.warn('[API /facebook/publish] Binary fetch non-ok, falling back to JSON URL...');
        fbResponse = await fetch(fbPhotoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: message, url: photoUrl, access_token: accessToken })
        });
      }
    } catch (e) {
      console.warn('[API /facebook/publish] Binary upload notice, falling back to JSON URL:', e);
      fbResponse = await fetch(fbPhotoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: message, url: photoUrl, access_token: accessToken })
      });
    }

    let fbData = await fbResponse.json();

    // Fallback to text feed post if photos endpoint encounters an image format error
    if (!fbResponse.ok && fbData.error?.code !== 190) {
      console.warn('[API /facebook/publish] Photo post failed, falling back to text feed post:', fbData.error?.message);
      const fbFeedUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      fbResponse = await fetch(fbFeedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, access_token: accessToken })
      });
      fbData = await fbResponse.json();
    }

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

    const postId = fbData.post_id || fbData.id;
    console.log(`[API /facebook/publish] ✅ Published Photo Post. FB Post ID: ${postId}`);
    return NextResponse.json({ success: true, mode: 'REAL_API', postId, hasImage: true, photoUrl });

  } catch (err: any) {
    console.error('[API /facebook/publish] Internal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const host = request.headers.get('host');
  if (host) return `http://${host}`;
  return 'http://localhost:3000';
}
