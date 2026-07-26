/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Executive Memory Service
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Corporate Philosophy and Executive Wisdom Vault. Captures and retrieves
 * high-level executive mandates, corporate philosophies, and strategic boundary conditions
 * that override AI reasoning - the "never forget" layer above lessons and knowledge.
 *
 * This is NOT a Knowledge Base. NOT a Lessons Learned store.
 * This is Corporate Wisdom: the principles, values, and constraints the CEO lives by.
 */

export interface ExecutiveMemoryEntry {
  memoryId: string;
  category: 'FINANCIAL_PHILOSOPHY' | 'BRAND_PHILOSOPHY' | 'GROWTH_MANDATE' | 'RISK_BOUNDARY' | 'PEOPLE_PHILOSOPHY';
  owner: string;
  mandate: string;
  priority: 'ABSOLUTE' | 'HIGH' | 'GUIDELINE';
  createdAt: string;
}

export class ExecutiveMemoryService {
  private static instance: ExecutiveMemoryService;
  private vault: ExecutiveMemoryEntry[] = [];

  private constructor() {
    this.seedCorporateWisdom();
  }

  public static getInstance(): ExecutiveMemoryService {
    if (!ExecutiveMemoryService.instance) {
      ExecutiveMemoryService.instance = new ExecutiveMemoryService();
    }
    return ExecutiveMemoryService.instance;
  }

  private seedCorporateWisdom(): void {
    this.vault = [
      {
        memoryId: 'em-001',
        category: 'FINANCIAL_PHILOSOPHY',
        owner: 'CEO',
        mandate: 'We NEVER open a new branch if EBITDA is below 15%. Cash discipline is non-negotiable.',
        priority: 'ABSOLUTE',
        createdAt: new Date().toISOString(),
      },
      {
        memoryId: 'em-002',
        category: 'FINANCIAL_PHILOSOPHY',
        owner: 'CEO',
        mandate: 'Cashflow always takes priority over revenue. A healthy business breathes cashflow first.',
        priority: 'ABSOLUTE',
        createdAt: new Date().toISOString(),
      },
      {
        memoryId: 'em-003',
        category: 'BRAND_PHILOSOPHY',
        owner: 'CEO',
        mandate: 'Bella NEVER competes on price. We compete on quality, premium experience, and customer trust.',
        priority: 'ABSOLUTE',
        createdAt: new Date().toISOString(),
      },
      {
        memoryId: 'em-004',
        category: 'GROWTH_MANDATE',
        owner: 'CEO',
        mandate: 'Expand only when operational maturity is proven. Premature scaling destroys culture.',
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
      },
      {
        memoryId: 'em-005',
        category: 'PEOPLE_PHILOSOPHY',
        owner: 'CEO',
        mandate: 'People are our greatest asset. Never automate the human soul of customer service.',
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  public recall(category?: ExecutiveMemoryEntry['category']): ExecutiveMemoryEntry[] {
    return category ? this.vault.filter(e => e.category === category) : this.vault;
  }

  public addMandate(entry: Omit<ExecutiveMemoryEntry, 'memoryId' | 'createdAt'>): ExecutiveMemoryEntry {
    const newEntry: ExecutiveMemoryEntry = {
      ...entry,
      memoryId: `em-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.vault.push(newEntry);
    return newEntry;
  }

  public hasAbsoluteMandate(keyword: string): boolean {
    return this.vault.some(
      e => e.priority === 'ABSOLUTE' && e.mandate.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}
