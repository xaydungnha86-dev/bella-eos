/**
 * BELLA EOS INFRASTRUCTURE: Secrets Store Manager
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages environment secrets, Supabase Vault, API keys, and encryption keys.
 */

export class SecretsStore {
  private static instance: SecretsStore;
  private memorySecrets: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): SecretsStore {
    if (!SecretsStore.instance) {
      SecretsStore.instance = new SecretsStore();
    }
    return SecretsStore.instance;
  }

  public getSecret(key: string): string | null {
    if (this.memorySecrets.has(key)) {
      return this.memorySecrets.get(key)!;
    }
    return process.env[key] || null;
  }

  public setSecret(key: string, value: string): void {
    this.memorySecrets.set(key, value);
  }

  public getMaskedSecret(key: string): string {
    const raw = this.getSecret(key);
    if (!raw) return 'NOT_CONFIGURED';
    if (raw.length <= 8) return '****';
    return `${raw.slice(0, 4)}...${raw.slice(-4)}`;
  }
}
