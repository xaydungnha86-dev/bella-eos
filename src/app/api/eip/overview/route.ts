import { NextResponse } from 'next/server';

/**
 * POST /api/eip/overview
 * 
 * Server-side proxy for fetching EIP overview metrics to bypass browser CORS restrictions.
 * Receives eip_url and eip_api_key in the request body.
 */
export async function POST(request: Request) {
  try {
    const { eip_url, eip_api_key } = await request.json() as {
      eip_url?: string;
      eip_api_key?: string;
    };

    if (!eip_url || !eip_api_key) {
      return NextResponse.json({
        success: false,
        error: 'Missing EIP credentials'
      }, { status: 400 });
    }

    const baseUrl = eip_url.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/overview`;

    console.log(`[EIP Proxy] Fetching EIP overview from: ${targetUrl}`);
    
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${eip_api_key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client': 'bella-eos-platform'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      console.warn(`[EIP Proxy] Remote server returned HTTP ${res.status}`);
      return NextResponse.json({
        success: false,
        error: `Remote server returned HTTP ${res.status}`
      }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn('[EIP Proxy] Remote server did not return JSON');
      return NextResponse.json({
        success: false,
        error: 'Remote server did not return JSON'
      }, { status: 406 });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      data
    });

  } catch (err: any) {
    console.error('[EIP Proxy] Exception:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal proxy error'
    }, { status: 500 });
  }
}
