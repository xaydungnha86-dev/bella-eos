import { NextResponse } from 'next/server';

/**
 * POST /api/eip/customers
 * 
 * Server-side proxy for fetching EIP active customers to bypass browser CORS restrictions.
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
    const baseUrl = cleanBase;
    
    // Candidate endpoints for EIP customers
    const candidateEndpoints = [
      `${baseUrl}/customers?status=active`,
      `${baseUrl}/customers`,
      `${baseUrl}/crm/customers`,
      `${baseUrl}/clients`
    ];

    console.log(`[EIP Customers Proxy] Querying EIP active customers from base URL: ${baseUrl}`);
    
    let lastStatus = 500;
    let lastError = 'No endpoint responded';
    let responseData: any = null;
    let successfulEndpoint = '';

    for (const targetUrl of candidateEndpoints) {
      try {
        console.log(`[EIP Customers Proxy] Trying: GET ${targetUrl}`);
        const res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${eip_api_key}`,
            'X-API-Key': eip_api_key,
            'api-key': eip_api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Client': 'bella-eos-platform'
          },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store'
        });

        lastStatus = res.status;

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            responseData = await res.json();
            successfulEndpoint = targetUrl;
            console.log(`[EIP Customers Proxy] ✅ Success from: ${targetUrl}`);
            break;
          } else {
            const rawText = await res.text();
            try {
              responseData = JSON.parse(rawText);
              successfulEndpoint = targetUrl;
              break;
            } catch {
              console.warn(`[EIP Customers Proxy] ${targetUrl} returned non-JSON body`);
            }
          }
        } else if (res.status === 401 || res.status === 403) {
          lastError = `Xác thực thất bại (HTTP ${res.status})`;
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
        console.warn(`[EIP Customers Proxy] Failed fetching ${targetUrl}: ${lastError}`);
      }
    }

    if (responseData) {
      const dataArr = Array.isArray(responseData) 
        ? responseData 
        : (responseData.data || responseData.customers || responseData.items || []);
        
      return NextResponse.json({
        success: true,
        endpoint: successfulEndpoint,
        data: dataArr
      });
    }

    return NextResponse.json({
      success: false,
      error: `Không thể lấy danh sách khách hàng từ EIP server. Lỗi: ${lastError}`,
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
