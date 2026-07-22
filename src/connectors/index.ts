import { Customer, Invoice, Campaign, CanonicalContextPackage } from '../types/eom';
import { EnterpriseObjectModel } from '../core/eom/eom';
import { supabase } from '../lib/supabase';

export class EipConnector {
  static getActiveCustomers(): Customer[] {
    console.log('[EipConnector] Fetching active customer records from external EIP CRM');
    return [
      EnterpriseObjectModel.createObject<Customer>('Customer', {
        id: 'cust_001',
        name: 'Trần Thị Thuỷ',
        email: 'thuy.tran@gmail.com',
        segment: 'VIP Spa Clients',
        status: 'active'
      }),
      EnterpriseObjectModel.createObject<Customer>('Customer', {
        id: 'cust_002',
        name: 'Nguyễn Văn Minh',
        email: 'minh.nguyen@outlook.com',
        segment: 'Standard Clients',
        status: 'active'
      })
    ];
  }
}

export class SapConnector {
  static getInvoiceMetrics(): Invoice[] {
    console.log('[SapConnector] Interfacing with SAP Financial Ledger');
    return [
      EnterpriseObjectModel.createObject<Invoice>('Invoice', {
        id: 'inv_sap_99',
        customerId: 'cust_001',
        amountVnd: 12500000,
        status: 'paid',
        dueDate: new Date().toISOString()
      })
    ];
  }
}

export class MisaConnector {
  static getAlerts() {
    console.log('[MisaConnector] Reading inventory warnings from MISA Stock ERP');
    return {
      activeAlertsCount: 3,
      details: ['Rose Oil Spa package low stock', 'Therapy towels low quantity']
    };
  }
}

export class FacebookConnector {
  static getReachMetrics() {
    console.log('[FacebookConnector] Accessing page reach statistics');
    return {
      source: 'FacebookGraphAPI',
      pageLikes: 25400,
      postReach24h: 14500,
      engagementRatePct: 5.4
    };
  }

  /**
   * Publishes a post via the secure server-side proxy.
   * Reads the token from localStorage (set by /settings page) and passes it
   * to the server-side route so it never has to be in .env.
   */
  static async publishRealPost(
    message: string,
    _accessToken?: string,
    _pageId?: string
  ): Promise<{ success: boolean; postId?: string; error?: string; mode: 'REAL_API' | 'CONFIG_REQUIRED' }> {
    // Read tokens from localStorage (set by the customer via /settings UI)
    const clientToken = (() => {
      if (typeof window === 'undefined') return '';
      try { return JSON.parse(localStorage.getItem('bella_eos_integrations') || '{}')['facebook::page_access_token'] || ''; } catch { return ''; }
    })();
    const clientPageId = (() => {
      if (typeof window === 'undefined') return 'me';
      try { return JSON.parse(localStorage.getItem('bella_eos_integrations') || '{}')['facebook::page_id'] || 'me'; } catch { return 'me'; }
    })();

    console.log(`[FacebookConnector] Routing post via server proxy. Token source: ${clientToken ? 'localStorage' : 'server-env'}`);

    try {
      const response = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          client_token: clientToken || undefined,
          client_page_id: clientPageId || undefined
        })
      });

      const data = await response.json();

      if (response.status === 503 || data.mode === 'CONFIG_REQUIRED') {
        return {
          success: false,
          mode: 'CONFIG_REQUIRED',
          error: data.error || 'Chưa cấu hình Facebook Token. Vào Cài đặt Tích hợp → Facebook Fanpage để nhập.'
        };
      }

      if (!response.ok || !data.success) {
        return { success: false, mode: 'REAL_API', error: data.error };
      }

      console.log(`[FacebookConnector] ✅ Post published! FB Post ID: ${data.postId}`);
      return { success: true, mode: 'REAL_API', postId: data.postId };

    } catch (err: any) {
      return { success: false, mode: 'REAL_API', error: `Lỗi kết nối: ${err.message}` };
    }
  }
}

export class SupabaseConnector {
  /**
   * Saves a transaction audit record via the secure server-side API route.
   * The Supabase service role key NEVER leaves the server.
   */
  static async saveAuditRecord(record: { transactionId: string; sourceIdentity: string; actionType: string; payload: any }) {
    try {
      const response = await fetch('/api/db/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const data = await response.json();
      if (!data.success) console.warn('[SupabaseConnector] Audit save notice:', data.error);
      return { success: !!data.success };
    } catch (e) {
      console.warn('[SupabaseConnector] Audit route unreachable — offline mode.');
      return { success: false };
    }
  }

  /**
   * Saves a Canonical Context Package directly via Supabase client (anon key is safe here).
   */
  static async saveCanonicalContext(context: import('../types/eom').CanonicalContextPackage) {
    try {
      const { error } = await supabase.from('memory_records').insert([
        {
          type: 'canonical_context',
          objective: context.objective,
          payload: context,
          created_at: new Date().toISOString()
        }
      ]);
      return { success: !error };
    } catch (e) {
      return { success: false };
    }
  }
}
