/**
 * BELLA EOS PLATFORM CONTRACT: Asset Governance Contract (IAsset v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Asset governance interface for Marketplace items (Skills, SOPs, DNA Packs, Connectors).
 */

export type AssetType = 'SKILL' | 'SOP' | 'DNA_PACK' | 'CONNECTOR' | 'PROMPT_PACK' | 'WORKFLOW';

export interface AssetManifest {
  id: string;
  name: string;
  version: string;
  type: AssetType;
  author: string;
  dependencies: Record<string, string>;
  compatibility: { eosVersion: string };
  license: string;
  signature: string;
  checksum: string;
}

export interface IAsset {
  manifest: AssetManifest;
  contentPayload: any;
  validate(): Promise<boolean>;
  install(tenantId: string): Promise<boolean>;
  uninstall(tenantId: string): Promise<boolean>;
}
