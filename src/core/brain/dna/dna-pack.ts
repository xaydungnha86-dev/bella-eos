/**
 * BELLA EOS BRAIN: Versioned Company DNA Asset Pack
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Independent Enterprise Asset containing Identity, Brand, Business, and Operating DNA.
 */

export interface IdentityDNA {
  vision: string;
  mission: string;
  coreValues: string[];
  corporateCulture: string;
}

export interface BrandDNA {
  voiceTone: string;
  designPrinciples: string;
  contentRules: string[];
  primaryColors: string[];
}

export interface BusinessDNA {
  sops: string[];
  policies: string[];
  riskThresholds: Record<string, number>;
  decisionRules: string[];
}

export interface OperatingDNA {
  riskAppetite: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  delegationMatrix: Record<string, string>;
  approvalRules: string[];
  decisionStyle: string;
  complianceLevel: string;
}

export interface CompanyDNAPack {
  id: string;
  name: string;
  version: string; // e.g. '1.0', '1.1', '2.0' (supports rollback)
  tenantId: string;
  identity: IdentityDNA;
  brand: BrandDNA;
  business: BusinessDNA;
  operating: OperatingDNA;
  updatedAt: string;
}

export class DNAPackManager {
  private static instance: DNAPackManager;
  private packs: Map<string, CompanyDNAPack[]> = new Map(); // tenantId -> DNAPack history

  private constructor() {}

  public static getInstance(): DNAPackManager {
    if (!DNAPackManager.instance) {
      DNAPackManager.instance = new DNAPackManager();
    }
    return DNAPackManager.instance;
  }

  public registerPack(pack: CompanyDNAPack): void {
    if (!this.packs.has(pack.tenantId)) {
      this.packs.set(pack.tenantId, []);
    }
    this.packs.get(pack.tenantId)!.push(pack);
  }

  public getActivePack(tenantId: string): CompanyDNAPack | null {
    const list = this.packs.get(tenantId);
    if (!list || list.length === 0) return null;
    return list[list.length - 1]; // Return latest version
  }

  public rollback(tenantId: string, version: string): CompanyDNAPack | null {
    const list = this.packs.get(tenantId);
    if (!list) return null;
    const found = list.find(p => p.version === version);
    if (found) {
      this.registerPack({ ...found, version: `${found.version}-rollback-${Date.now()}` });
      return found;
    }
    return null;
  }
}
