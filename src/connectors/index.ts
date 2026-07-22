import { Customer, Invoice, Campaign } from '../types/eom';
import { EnterpriseObjectModel } from '../core/eom/eom';

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
      activeReach: 145200,
      engagementRatePct: 5.4,
      dailySessions: 4200
    };
  }
}
