/**
 * BELLA EOS PLUGIN SDK: Domain Pack Manager (Layer 3 Industry Extension)
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * Mission: Industry Extension Layer Manager. Hot-swaps domain-specific vertical packs
 * (Spa Pack, Clinic Pack, Retail Pack, Manufacturing Pack, Hospitality Pack) without touching Layer 1/2 Core.
 */

export interface IDomainPack {
  packId: string;
  packName: string;
  industryCategory: 'SPA_WELLNESS' | 'MEDICAL_CLINIC' | 'RETAIL_ECOM' | 'MANUFACTURING' | 'LOGISTICS' | 'HOSPITALITY';
  sops: string[];
  kpis: string[];
  dnaRules: string[];
  skills: string[];
}

export class DomainPackManager {
  private static instance: DomainPackManager;
  private activePacks: Map<string, IDomainPack> = new Map();

  private constructor() {
    this.seedDefaultPacks();
  }

  public static getInstance(): DomainPackManager {
    if (!DomainPackManager.instance) {
      DomainPackManager.instance = new DomainPackManager();
    }
    return DomainPackManager.instance;
  }

  private seedDefaultPacks(): void {
    this.registerPack({
      packId: 'pack-spa',
      packName: 'Spa & Wellness Luxury Domain Pack',
      industryCategory: 'SPA_WELLNESS',
      sops: ['SOP-01: VIP Customer Greeting & Consultation', 'SOP-02: Therapist Schedule Auto-Dispatch'],
      kpis: ['Retention Rate >= 45%', 'Avg Booking Value >= $120', 'Therapist Utilization >= 85%'],
      dnaRules: ['NEVER discount flagship luxury treatments during peak weekend hours.'],
      skills: ['poster-design-skill', 'appointment-scheduler-skill'],
    });

    this.registerPack({
      packId: 'pack-clinic',
      packName: 'Medical Clinic & Dental Domain Pack',
      industryCategory: 'MEDICAL_CLINIC',
      sops: ['SOP-01: Patient Intake & Triage', 'SOP-02: Doctor Follow-up Reminder'],
      kpis: ['Patient No-Show Rate <= 5%', 'Doctor Utilization >= 90%'],
      dnaRules: ['ALWAYS enforce HIPAA & MOH medical compliance before issuing treatment recommendations.'],
      skills: ['patient-triage-skill', 'prescription-reminder-skill'],
    });
  }

  public registerPack(pack: IDomainPack): void {
    this.activePacks.set(pack.packId, pack);
  }

  public getPack(packId: string): IDomainPack | undefined {
    return this.activePacks.get(packId);
  }

  public getActivePacksCount(): number {
    return this.activePacks.size;
  }
}
