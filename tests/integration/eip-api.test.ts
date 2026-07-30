import { describe, test, expect, jest, afterEach } from '@jest/globals';
import { POST as testPost } from '../../src/app/api/eip/test/route';
import { POST as overviewPost } from '../../src/app/api/eip/overview/route';
import { POST as customersPost } from '../../src/app/api/eip/customers/route';

describe('Bella EOS: EIP Proxy API Endpoints Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/eip/test (Connectivity Test)', () => {
    test('should return NO_CREDENTIALS when credentials are missing', async () => {
      const mockReq = new Request('http://localhost/api/eip/test', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const res = await testPost(mockReq);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.status).toBe('NO_CREDENTIALS');
      expect(data.message).toContain('Chưa cấu hình EIP Endpoint URL');
    });

    test('should return CONNECTED on successful remote endpoint hit', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ activeCampaigns: 4 }),
        json: async () => ({ activeCampaigns: 4 }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as any);

      const mockReq = new Request('http://localhost/api/eip/test', {
        method: 'POST',
        body: JSON.stringify({
          eip_url: 'https://mock-eip.bella.ai',
          eip_api_key: 'mock-key-123'
        })
      });

      const res = await testPost(mockReq);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.status).toBe('CONNECTED');
      expect(data.data).toEqual({ activeCampaigns: 4 });
      expect(mockFetch).toHaveBeenCalled();
    });

    test('should return AUTH_FAILED when remote returns 401', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
        json: async () => ({ error: 'Invalid API Key' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as any);

      const mockReq = new Request('http://localhost/api/eip/test', {
        method: 'POST',
        body: JSON.stringify({
          eip_url: 'https://mock-eip.bella.ai',
          eip_api_key: 'wrong-key'
        })
      });

      const res = await testPost(mockReq);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.status).toBe('AUTH_FAILED');
      expect(data.message).toContain('API Key không hợp lệ');
    });
  });

  describe('POST /api/eip/overview (Proxy Endpoint)', () => {
    test('should return 400 when credentials are missing', async () => {
      const mockReq = new Request('http://localhost/api/eip/overview', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const res = await overviewPost(mockReq);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing EIP credentials');
    });

    test('should successfully proxy overview stats JSON', async () => {
      const mockFetchData = { totalLeadCount: 1540, conversionRate: 0.12 };
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockFetchData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as any);

      const mockReq = new Request('http://localhost/api/eip/overview', {
        method: 'POST',
        body: JSON.stringify({
          eip_url: 'https://mock-eip.bella.ai',
          eip_api_key: 'mock-key-123'
        })
      });

      const res = await overviewPost(mockReq);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockFetchData);
    });

    test('should return 406 when remote server response is not JSON', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' })
      } as any);

      const mockReq = new Request('http://localhost/api/eip/overview', {
        method: 'POST',
        body: JSON.stringify({
          eip_url: 'https://mock-eip.bella.ai',
          eip_api_key: 'mock-key-123'
        })
      });

      const res = await overviewPost(mockReq);
      expect(res.status).toBe(406);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Remote server did not return JSON');
    });
  });

  describe('POST /api/eip/customers (Proxy Endpoint)', () => {
    test('should proxy customers data', async () => {
      const mockCusts = [{ id: 'cust-1', name: 'John Doe' }];
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCusts,
        headers: new Headers({ 'content-type': 'application/json' })
      } as any);

      const mockReq = new Request('http://localhost/api/eip/customers', {
        method: 'POST',
        body: JSON.stringify({
          eip_url: 'https://mock-eip.bella.ai',
          eip_api_key: 'mock-key-123'
        })
      });

      const res = await customersPost(mockReq);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockCusts);
    });
  });
});
