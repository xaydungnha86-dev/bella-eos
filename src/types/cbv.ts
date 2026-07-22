/**
 * BELLA EOS PLATFORM CONTRACT: Canonical Business Vocabulary (CBV v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Standard business terms used by all Bella Connectors for external data normalization.
 */

export type CanonicalTerm =
  | 'Revenue'
  | 'Customer'
  | 'Booking'
  | 'Campaign'
  | 'KPI'
  | 'ROI'
  | 'Margin'
  | 'Lead'
  | 'Invoice'
  | 'Approval'
  | 'Order'
  | 'Payment'
  | 'Employee'
  | 'Asset'
  | 'Product';

export interface CBVMappingRule {
  sourceSystem: string;       // e.g. 'SAP', 'MISA', 'Facebook', 'Zalo'
  sourceField: string;        // e.g. 'total_amount', 'khach_hang_id'
  targetTerm: CanonicalTerm;  // e.g. 'Revenue', 'Customer'
  transformer?: (val: any) => any;
}

export interface CanonicalBusinessVocabulary {
  version: '1.0';
  tenantId: string;
  sourceSystem: string;
  mappedTerms: Partial<Record<CanonicalTerm, any>>;
  rawPayload?: Record<string, any>;
  timestamp: string;
}
