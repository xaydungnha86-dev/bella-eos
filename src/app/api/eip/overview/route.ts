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

    const rawUrl = eip_url.trim().replace(/\/$/, '');
    const cleanBase = rawUrl.replace(/\/overview$/, '').replace(/\/$/, '');
    
    // Candidate endpoints for EIP overview
    const candidateEndpoints = Array.from(new Set([
      rawUrl,
      `${cleanBase}/overview`,
      `${cleanBase}/dashboard`,
      `${cleanBase}/stats`,
      `${cleanBase}/metrics`,
      cleanBase
    ]));

    console.log(`[EIP Overview Proxy] Querying EIP server base URL: ${rawUrl}`);
    
    let lastStatus = 500;
    let lastError = 'No endpoint responded';
    let responseData: any = null;
    let successfulEndpoint = '';

    for (const targetUrl of candidateEndpoints) {
      try {
        console.log(`[EIP Overview Proxy] Trying: GET ${targetUrl}`);
        const res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${eip_api_key}`,
            'x-api-key': eip_api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Client': 'bella-eos-platform'
          },
          signal: AbortSignal.timeout(8000)
        });

        lastStatus = res.status;

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.warn(`[EIP Overview Proxy] ${targetUrl} returned non-JSON content-type: ${contentType}`);
            return NextResponse.json({
              success: false,
              error: 'Remote server did not return JSON'
            }, { status: 406 });
          }

          responseData = await res.json();
          successfulEndpoint = targetUrl;
          console.log(`[EIP Overview Proxy] ✅ Success from: ${targetUrl}`);
          break;
        } else if (res.status === 401 || res.status === 403) {
          lastError = `Xác thực thất bại (HTTP ${res.status})`;
          // Don't try other endpoints if auth is rejected
          return NextResponse.json({
            success: false,
            error: lastError,
            httpStatus: res.status
          }, { status: res.status });
        } else {
          lastError = `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
        console.warn(`[EIP Overview Proxy] Failed fetching ${targetUrl}: ${lastError}`);
      }
    }

    if (responseData) {
      return NextResponse.json({
        success: true,
        endpoint: successfulEndpoint,
        data: responseData
      });
    }

    return NextResponse.json({
      success: false,
      error: `Không thể kết nối đến EIP server. Lỗi: ${lastError}`,
      httpStatus: lastStatus
    }, { status: lastStatus || 502 });

  } catch (err: any) {
    console.error('[EIP Proxy] Exception:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal proxy error'
    }, { status: 500 });
  }
}
