import { NextResponse } from 'next/server';

/**
 * POST /api/eip/test
 * 
 * Server-side Bella EIP connectivity test.
 * Receives eip_url + eip_api_key from client (localStorage),
 * then makes a real HTTP call to Bella EIP /overview from the server.
 * This causes the request to show up in the Bella EIP dashboard.
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
        status: 'NO_CREDENTIALS',
        message: 'Chưa cấu hình EIP Endpoint URL hoặc API Key trong /settings.',
        data: null
      });
    }

    // Normalise URL: strip trailing slash
    const baseUrl = eip_url.replace(/\/$/, '');
    
    // Try multiple common endpoint patterns for Bella EIP
    const endpoints = [
      `${baseUrl}/overview`,
      `${baseUrl}/dashboard`,
      `${baseUrl}/stats`,
      `${baseUrl}/`,
    ];

    let lastStatus = 0;
    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`[EIP Test] Trying: GET ${endpoint}`);
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${eip_api_key}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Client': 'bella-eos-platform'
          },
          // 10s timeout
          signal: AbortSignal.timeout(10000)
        });

        lastStatus = res.status;
        const responseText = await res.text();
        
        let data: any = null;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = responseText ? { raw: responseText.substring(0, 300) } : null;
        }

        if (res.ok) {
          return NextResponse.json({
            success: true,
            status: 'CONNECTED',
            httpStatus: res.status,
            endpoint,
            message: `✅ Kết nối Bella EIP thành công! HTTP ${res.status}`,
            data,
            eip_url: baseUrl
          });
        }

        if (res.status === 401 || res.status === 403) {
          return NextResponse.json({
            success: false,
            status: 'AUTH_FAILED',
            httpStatus: res.status,
            endpoint,
            message: `⛔ API Key không hợp lệ hoặc không có quyền truy cập. HTTP ${res.status}`,
            data
          });
        }

        // 404 means endpoint doesn't exist, try next
        if (res.status === 404) {
          lastError = `Endpoint ${endpoint} trả về 404`;
          continue;
        }

        // Any other non-OK: return the status
        return NextResponse.json({
          success: false,
          status: 'SERVER_ERROR',
          httpStatus: res.status,
          endpoint,
          message: `⚠️ Bella EIP phản hồi HTTP ${res.status}. Kiểm tra lại URL hoặc liên hệ Admin.`,
          data
        });

      } catch (fetchErr: any) {
        lastError = fetchErr.message || String(fetchErr);
        if (fetchErr.name === 'TimeoutError') {
          return NextResponse.json({
            success: false,
            status: 'TIMEOUT',
            httpStatus: 0,
            endpoint,
            message: `⏱️ Kết nối tới ${endpoint} bị timeout sau 10 giây. Kiểm tra URL và firewall.`,
            data: null
          });
        }
        // network error — try next endpoint
        continue;
      }
    }

    return NextResponse.json({
      success: false,
      status: 'ALL_ENDPOINTS_FAILED',
      httpStatus: lastStatus,
      endpoint: baseUrl,
      message: `❌ Không thể kết nối tới Bella EIP. Lỗi cuối: ${lastError}. Kiểm tra lại EIP Endpoint URL trong /settings.`,
      data: null
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      status: 'INTERNAL_ERROR',
      message: err.message,
      data: null
    }, { status: 500 });
  }
}
