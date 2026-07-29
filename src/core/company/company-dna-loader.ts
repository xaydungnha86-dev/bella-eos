/**
 * COMPANY DNA LOADER
 * 
 * Singleton service that loads company DNA once at startup
 * and provides it to all AI agents automatically.
 * 
 * Storage Priority:
 * 1. Supabase (if configured) - for multi-tenant SaaS
 * 2. Local JSON file (.kiro/company-dna.json) - for standalone
 * 3. Default template (BELLA_EOS_DNA) - fallback
 */

import { CompanyDNA, CompanyDNASummary, compressDNA, BELLA_EOS_DNA } from '@/types/company-dna';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export class CompanyDNALoader {
  private static instance: CompanyDNALoader;
  private companyDNA: CompanyDNA | null = null;
  private isLoaded = false;
  private loadPromise: Promise<CompanyDNA> | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): CompanyDNALoader {
    if (!CompanyDNALoader.instance) {
      CompanyDNALoader.instance = new CompanyDNALoader();
    }
    return CompanyDNALoader.instance;
  }

  /**
   * Load Company DNA (auto-called on first access)
   * Returns cached version on subsequent calls
   */
  public async load(workspaceId: string = 'default'): Promise<CompanyDNA> {
    // Return cached if already loaded
    if (this.isLoaded && this.companyDNA) {
      return this.companyDNA;
    }

    // Prevent concurrent loads
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadFromStorage(workspaceId);
    
    try {
      this.companyDNA = await this.loadPromise;
      this.isLoaded = true;
      console.log('[CompanyDNALoader] ✓ Company DNA loaded:', this.companyDNA.identity.brandName);
      return this.companyDNA;
    } finally {
      this.loadPromise = null;
    }
  }

  /**
   * Internal: Try loading from multiple sources
   */
  private async _loadFromStorage(workspaceId: string): Promise<CompanyDNA> {
    // Priority 1: Try Supabase
    try {
      const dna = await this._loadFromSupabase(workspaceId);
      if (dna) {
        console.log('[CompanyDNALoader] Loaded from Supabase');
        return dna;
      }
    } catch (err) {
      console.warn('[CompanyDNALoader] Supabase load failed:', err);
    }

    // Priority 2: Try local JSON file
    try {
      const dna = await this._loadFromLocalFile(workspaceId);
      if (dna) {
        console.log('[CompanyDNALoader] Loaded from local file');
        return dna;
      }
    } catch (err) {
      console.warn('[CompanyDNALoader] Local file load failed:', err);
    }

    // Priority 3: Use default template
    console.log('[CompanyDNALoader] Using default Bella EOS template');
    return BELLA_EOS_DNA;
  }

  /**
   * Load from Supabase
   */
  private async _loadFromSupabase(workspaceId: string): Promise<CompanyDNA | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return data.dna_json as CompanyDNA;
  }

  /**
   * Load from local JSON file
   */
  private async _loadFromLocalFile(workspaceId: string): Promise<CompanyDNA | null> {
    const filePath = path.join(process.cwd(), '.kiro', 'company-dna.json');

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // If file has multiple workspaces, filter by ID
    if (data.workspaces && Array.isArray(data.workspaces)) {
      const workspace = data.workspaces.find((w: any) => w.workspaceId === workspaceId);
      return workspace?.dna || null;
    }

    // Single workspace file
    return data as CompanyDNA;
  }

  /**
   * Get Company DNA (loads if not already loaded)
   */
  public async getDNA(workspaceId: string = 'default'): Promise<CompanyDNA> {
    if (!this.companyDNA || !this.isLoaded) {
      return await this.load(workspaceId);
    }
    return this.companyDNA;
  }

  /**
   * Get lightweight summary for prompt injection
   */
  public async getDNASummary(workspaceId: string = 'default'): Promise<CompanyDNASummary> {
    const dna = await this.getDNA(workspaceId);
    return compressDNA(dna);
  }

  /**
   * Save Company DNA to storage
   */
  public async save(dna: CompanyDNA): Promise<boolean> {
    try {
      // Try Supabase first
      const saved = await this._saveToSupabase(dna);
      if (saved) {
        this.companyDNA = dna;
        this.isLoaded = true;
        console.log('[CompanyDNALoader] ✓ Saved to Supabase');
        return true;
      }
    } catch (err) {
      console.warn('[CompanyDNALoader] Supabase save failed:', err);
    }

    // Fallback to local file
    try {
      await this._saveToLocalFile(dna);
      this.companyDNA = dna;
      this.isLoaded = true;
      console.log('[CompanyDNALoader] ✓ Saved to local file');
      return true;
    } catch (err) {
      console.error('[CompanyDNALoader] Local file save failed:', err);
      return false;
    }
  }

  /**
   * Save to Supabase
   */
  private async _saveToSupabase(dna: CompanyDNA): Promise<boolean> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('company_profiles')
      .upsert({
        workspace_id: dna.metadata?.workspaceId || 'default',
        company_name: dna.identity.companyName,
        brand_name: dna.identity.brandName,
        industry: dna.industry.primaryIndustry,
        dna_json: dna,
        status: dna.metadata?.status || 'active',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'workspace_id'
      });

    return !error;
  }

  /**
   * Save to local JSON file
   */
  private async _saveToLocalFile(dna: CompanyDNA): Promise<void> {
    const kiroDir = path.join(process.cwd(), '.kiro');
    const filePath = path.join(kiroDir, 'company-dna.json');

    // Create .kiro directory if it doesn't exist
    if (!fs.existsSync(kiroDir)) {
      fs.mkdirSync(kiroDir, { recursive: true });
    }

    // Save with pretty formatting
    fs.writeFileSync(filePath, JSON.stringify(dna, null, 2), 'utf-8');
  }

  /**
   * Reload from storage (useful after updates)
   */
  public async reload(workspaceId: string = 'default'): Promise<CompanyDNA> {
    this.isLoaded = false;
    this.companyDNA = null;
    return await this.load(workspaceId);
  }

  /**
   * Check if DNA is loaded
   */
  public isReady(): boolean {
    return this.isLoaded && this.companyDNA !== null;
  }

  /**
   * Get formatted prompt snippet for AI agents
   */
  public async getPromptSnippet(workspaceId: string = 'default'): Promise<string> {
    const dna = await this.getDNA(workspaceId);

    return `## COMPANY PROFILE

**Company**: ${dna.identity.companyName} (Brand: ${dna.identity.brandName})
**Business Model**: ${dna.identity.businessModel}
**Industry**: ${dna.industry.primaryIndustry}
**Product Type**: ${dna.products.type === 'software' ? 'Software/SaaS' : dna.products.type}
**Founded**: ${dna.identity.foundedYear} (${dna.identity.yearsInBusiness} years in business)

**Mission**: ${dna.vision.mission}

**Core Product**: ${dna.products.offerings[0]?.name}
${dna.products.offerings[0]?.description}

**Target Customer**: ${dna.targetAudience.primaryPersona.name}
${dna.targetAudience.primaryPersona.description}

**Key Pain Points** (what customers struggle with):
${dna.targetAudience.primaryPersona.painPoints.map(p => `- ${p}`).join('\n')}

**Brand Voice**: ${dna.brandVoice.tone}
**Brand Personality**: ${dna.brandVoice.personality.join(', ')}
**Visual Style**: ${dna.brandVisual.style}
**Brand Colors**: Primary ${dna.brandVisual.colors.primary}, Accent ${dna.brandVisual.colors.accent}

**Key Differentiators**:
${dna.competitive.differentiators.map(d => `- ${d}`).join('\n')}

**CRITICAL CONTEXT**: ${this._getCriticalContext(dna)}`;
  }

  /**
   * Generate critical context warning based on product type
   */
  private _getCriticalContext(dna: CompanyDNA): string {
    if (dna.products.type === 'software' && dna.industry.primaryIndustry.toLowerCase().includes('wellness')) {
      return `${dna.identity.brandName} is a B2B SOFTWARE COMPANY selling management software TO ${dna.industry.primaryIndustry.toLowerCase()} businesses. We are NOT a ${dna.industry.primaryIndustry.toLowerCase()} service provider ourselves. All marketing content must focus on SOFTWARE FEATURES, DASHBOARD UI, and BUSINESS OUTCOMES for our customers (the ${dna.industry.primaryIndustry.toLowerCase()} owners).`;
    }

    if (dna.products.type === 'software') {
      return `${dna.identity.brandName} is a B2B SOFTWARE COMPANY. All marketing content must show SOFTWARE UI, DASHBOARDS, and TECHNOLOGY, not generic product imagery.`;
    }

    return `${dna.identity.brandName} provides ${dna.products.offerings[0]?.name}. Ensure all content accurately represents our ${dna.products.type} offering.`;
  }

  /**
   * Clear cache (for testing)
   */
  public clearCache(): void {
    this.companyDNA = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

/**
 * Convenience export for quick access
 */
export const getCompanyDNA = async (workspaceId?: string) => {
  return await CompanyDNALoader.getInstance().getDNA(workspaceId);
};

export const getCompanyDNASnippet = async (workspaceId?: string) => {
  return await CompanyDNALoader.getInstance().getPromptSnippet(workspaceId);
};
