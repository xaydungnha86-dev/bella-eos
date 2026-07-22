/**
 * BELLA EOS PLATFORM CONTRACT: Identity Fabric Contract (IIdentity v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages Human, AI Agent, Worker, Connector, and Service identities.
 */

export type IdentityType = 'HUMAN' | 'AI_AGENT' | 'WORKER' | 'CONNECTOR' | 'SERVICE';

export interface IRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface ICredential {
  id: string;
  type: 'API_KEY' | 'OAUTH2' | 'JWT' | 'PASSPHRASE';
  issuedAt: string;
  expiresAt?: string;
  isMasked: boolean;
}

export interface IIdentity {
  id: string;
  tenantId: string;
  type: IdentityType;
  name: string;
  permissions: string[];
  roles: IRole[];
  credentials: ICredential[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface IAccessToken {
  token: string;
  identityId: string;
  expiresInSeconds: number;
  scopes: string[];
}
