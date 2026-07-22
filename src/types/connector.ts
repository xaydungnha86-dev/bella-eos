/**
 * BELLA EOS PLATFORM CONTRACT: Connector Contract Interface (IConnector v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Standardized Connector pipeline: Connector ➔ Normalizer ➔ Validator ➔ Transformer ➔ CBV.
 */

import { CanonicalBusinessVocabulary } from './cbv';

export interface CapabilitiesDescription {
  connectorId: string;
  supportedEntities: string[];
  canPush: boolean;
  canPull: boolean;
}

export interface IConnector {
  authenticate(credentials: Record<string, any>): Promise<boolean>;
  discover(): Promise<CapabilitiesDescription>;
  fetch(query: Record<string, any>): Promise<any>;
  push(payload: any): Promise<any>;
  mapToCBV(rawData: any): CanonicalBusinessVocabulary;
}
