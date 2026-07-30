import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ success: false, status: 'invalid_key', error: 'Thiếu provider hoặc apiKey' }, { status: 400 });
    }

    const key = apiKey.trim();

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with OK.' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      const data = await res.json();

      if (res.ok && data.candidates) {
        return NextResponse.json({ success: true, status: 'valid', message: 'Google Gemini API Key hoạt động bình thường! (Quota OK)' });
      }

      const msg = data.error?.message || `HTTP ${res.status}`;
      if (res.status === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource_exhausted')) {
        return NextResponse.json({ success: false, status: 'quota_exceeded', error: `[HẾT HẠN MỨC CHI TIÊU - QUOTA 429] ${msg}` });
      }
      return NextResponse.json({ success: false, status: 'invalid_key', error: `[API KEY KHÔNG HỢP LỆ] ${msg}` });
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });
      const data = await res.json();

      if (res.ok && data.choices) {
        return NextResponse.json({ success: true, status: 'valid', message: 'OpenAI API Key hoạt động bình thường! (Quota OK)' });
      }

      const msg = data.error?.message || `HTTP ${res.status}`;
      if (res.status === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('insufficient_quota')) {
        return NextResponse.json({ success: false, status: 'quota_exceeded', error: `[HẾT HẠN MỨC CHI TIÊU - QUOTA 429] ${msg}` });
      }
      return NextResponse.json({ success: false, status: 'invalid_key', error: `[API KEY KHÔNG HỢP LỆ] ${msg}` });
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });
      const data = await res.json();

      if (res.ok && data.content) {
        return NextResponse.json({ success: true, status: 'valid', message: 'Anthropic Claude API Key hoạt động bình thường! (Quota OK)' });
      }

      const msg = data.error?.message || `HTTP ${res.status}`;
      if (res.status === 429 || msg.toLowerCase().includes('rate_limit') || msg.toLowerCase().includes('credit')) {
        return NextResponse.json({ success: false, status: 'quota_exceeded', error: `[HẾT HẠN MỨC CHI TIÊU - QUOTA 429] ${msg}` });
      }
      return NextResponse.json({ success: false, status: 'invalid_key', error: `[API KEY KHÔNG HỢP LỆ] ${msg}` });
    }

    return NextResponse.json({ success: false, status: 'invalid_key', error: 'Provider không hỗ trợ' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ success: false, status: 'network_error', error: `Lỗi kết nối API: ${err.message}` }, { status: 500 });
  }
}
