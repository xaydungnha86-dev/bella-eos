import { NextResponse } from 'next/server';

/**
 * POST /api/facebook/publish
 *
 * Server-side proxy that calls Facebook Graph API v18.0 using the
 * FACEBOOK_PAGE_ACCESS_TOKEN stored securely in .env.local
 * — the token is NEVER exposed to the browser.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { message, pageId } = body as { message: string; pageId?: string };

    if (!message) {
      return NextResponse.json({ error: '`message` field is required' }, { status: 400 });
    }

    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const id = pageId || process.env.FACEBOOK_PAGE_ID || 'me';

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          mode: 'CONFIG_REQUIRED',
          error: 'FACEBOOK_PAGE_ACCESS_TOKEN chưa được cấu hình trong .env.local trên server.'
        },
        { status: 503 }
      );
    }

    const fbUrl = `https://graph.facebook.com/v18.0/${id}/feed`;
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

    console.log(`[API /facebook/publish] Post published. FB Post ID: ${fbData.id}`);
    return NextResponse.json({ success: true, mode: 'REAL_API', postId: fbData.id });

  } catch (err: any) {
    console.error('[API /facebook/publish] Internal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
