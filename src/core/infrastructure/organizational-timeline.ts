/**
 * BELLA EOS COGNITIVE INFRASTRUCTURE SERVICE: Organizational Memory Timeline
 * Specification: ECR Historical Context Grounding
 */

export interface TimelineLandmark {
  year: number;
  month?: string;
  label: string;
  category: 'EXPANSION' | 'ACQUISITION' | 'FINANCE' | 'SYSTEM_UPGRADE' | 'IPO';
  description: string;
  impactNotes?: string;
}

export class OrganizationalTimeline {
  private static instance: OrganizationalTimeline;

  private landmarks: TimelineLandmark[] = [];

  private constructor() {
    this.seedDefaultTimeline();
  }

  public static getInstance(): OrganizationalTimeline {
    if (!OrganizationalTimeline.instance) {
      OrganizationalTimeline.instance = new OrganizationalTimeline();
    }
    return OrganizationalTimeline.instance;
  }

  private seedDefaultTimeline() {
    this.registerLandmark({
      year: 2026,
      month: 'June',
      label: 'Open Da Nang Branch regional center',
      category: 'EXPANSION',
      description: 'First regional center expansion in Central Vietnam.',
      impactNotes: 'Expected revenue boost by 24% for regional sales funnel.'
    });

    this.registerLandmark({
      year: 2027,
      month: 'March',
      label: 'Acquisition of ABC Spa local chain',
      category: 'ACQUISITION',
      description: 'Merged 4 boutique locations under Bella Brand identity.',
      impactNotes: 'Consolidated customer database into Supabase ERP.'
    });

    this.registerLandmark({
      year: 2028,
      month: 'September',
      label: 'Launch Premium Membership App',
      category: 'SYSTEM_UPGRADE',
      description: 'Integrated loyalty points, bookings, and therapist feedback.',
      impactNotes: 'Drove repeat booking frequency up to 2.4x.'
    });

    this.registerLandmark({
      year: 2030,
      month: 'December',
      label: 'Target Initial Public Offering (IPO)',
      category: 'FINANCE',
      description: 'Bella brand listed on stock exchange.',
      impactNotes: 'Expected target valuation of 500B VND.'
    });
  }

  public registerLandmark(landmark: TimelineLandmark): void {
    this.landmarks.push(landmark);
    this.landmarks.sort((a, b) => a.year - b.year);
  }

  public getLandmarks(): TimelineLandmark[] {
    return this.landmarks;
  }

  public queryLandmarks(category?: TimelineLandmark['category']): TimelineLandmark[] {
    if (!category) return this.landmarks;
    return this.landmarks.filter(l => l.category === category);
  }
}
