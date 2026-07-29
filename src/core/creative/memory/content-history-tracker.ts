/**
 * Content History Tracker
 * 
 * Tracks previously used headlines, copy, and CTAs to ensure content diversity.
 * Ensures each generation has fresh messaging while maintaining campaign goals.
 */

export interface ContentHistoryEntry {
  id: string;
  timestamp: number;
  campaignGoal: string;
  headline: string;
  keyBenefits: string[];
  callToAction: string;
  postCopy?: string;
}

export class ContentHistoryTracker {
  private static instance: ContentHistoryTracker;
  private history: ContentHistoryEntry[] = [];
  private maxHistorySize = 10; // Keep last 10 content variations
  
  private constructor() {}
  
  static getInstance(): ContentHistoryTracker {
    if (!ContentHistoryTracker.instance) {
      ContentHistoryTracker.instance = new ContentHistoryTracker();
    }
    return ContentHistoryTracker.instance;
  }
  
  /**
   * Add new content to history
   */
  addContent(entry: ContentHistoryEntry): void {
    this.history.unshift(entry); // Add to beginning
    
    // Keep only last N entries
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    
    console.log(`[ContentHistoryTracker] Added content to history. Total: ${this.history.length}`);
  }
  
  /**
   * Get recent headlines to avoid repetition
   */
  getRecentHeadlines(count: number = 5): string[] {
    return this.history
      .slice(0, count)
      .map(entry => entry.headline);
  }
  
  /**
   * Get recent CTAs to avoid repetition
   */
  getRecentCTAs(count: number = 5): string[] {
    return this.history
      .slice(0, count)
      .map(entry => entry.callToAction);
  }
  
  /**
   * Get recent key benefits to avoid repetition
   */
  getRecentBenefits(count: number = 3): string[][] {
    return this.history
      .slice(0, count)
      .map(entry => entry.keyBenefits);
  }
  
  /**
   * Generate content variation constraints
   */
  generateContentConstraints(): {
    headlineConstraints: string[];
    benefitConstraints: string[];
    ctaConstraints: string[];
    overallGuidance: string;
  } {
    const recent = this.history.slice(0, 5);
    
    if (recent.length === 0) {
      return {
        headlineConstraints: [],
        benefitConstraints: [],
        ctaConstraints: [],
        overallGuidance: 'No previous content - you have full creative freedom for the first generation.'
      };
    }
    
    const headlineConstraints: string[] = [];
    const benefitConstraints: string[] = [];
    const ctaConstraints: string[] = [];
    
    // Headline variation
    const recentHeadlines = this.getRecentHeadlines(5);
    if (recentHeadlines.length > 0) {
      headlineConstraints.push(`DO NOT use these headlines again: "${recentHeadlines.join('", "')}"`);
      
      // Analyze patterns
      const hasAI = recentHeadlines.filter(h => h.includes('AI')).length;
      const hasVanHanh = recentHeadlines.filter(h => h.includes('VẬN HÀNH')).length;
      const hasTheHeMoi = recentHeadlines.filter(h => h.includes('THẾ HỆ MỚI')).length;
      
      if (hasAI > 2) {
        headlineConstraints.push('AVOID starting headline with "AI" - try different angles like "QUẢN LÝ", "TỐI ƯU", "NÂNG CẤP", "CHUYỂN ĐỔI"');
      }
      if (hasVanHanh > 2) {
        headlineConstraints.push('AVOID using "VẬN HÀNH" - try alternatives like "QUẢN TRỊ", "ĐIỀU HÀNH", "KINH DOANH"');
      }
      if (hasTheHeMoi > 2) {
        headlineConstraints.push('AVOID "THẾ HỆ MỚI" - try "THÔNG MINH", "TỰ ĐỘNG", "HIỆN ĐẠI", "4.0"');
      }
    }
    
    // Key benefits variation
    const recentBenefits = this.getRecentBenefits(3);
    const allBenefits = recentBenefits.flat();
    if (allBenefits.length > 0) {
      benefitConstraints.push(`Previous benefits used: "${allBenefits.join('", "')}"`);
      benefitConstraints.push('CREATE NEW benefits that highlight DIFFERENT value propositions');
      benefitConstraints.push('Try different angles: cost savings, time efficiency, customer satisfaction, competitive advantage, growth metrics');
    }
    
    // CTA variation
    const recentCTAs = this.getRecentCTAs(5);
    if (recentCTAs.length > 0) {
      ctaConstraints.push(`DO NOT use these CTAs: "${recentCTAs.join('", "')}"`);
      
      // Suggest alternatives
      const alternatives = [
        'Nhận tư vấn miễn phí',
        'Đặt lịch demo ngay',
        'Trải nghiệm 30 ngày',
        'Tham gia cộng đồng',
        'Xem giải pháp',
        'Liên hệ chuyên gia',
        'Khám phá ngay',
        'Bắt đầu dùng thử'
      ].filter(alt => !recentCTAs.includes(alt));
      
      if (alternatives.length > 0) {
        ctaConstraints.push(`TRY these fresh CTAs: "${alternatives.slice(0, 3).join('", "')}"`);
      }
    }
    
    const overallGuidance = `
**CONTENT DIVERSITY MANDATE**:
You have created ${recent.length} previous versions. Each new version MUST use:
- A DIFFERENT headline angle (not just word substitution - completely different perspective)
- DIFFERENT benefits (highlight different value propositions)
- A DIFFERENT call-to-action (vary the urgency and offer)

While maintaining the same campaign goal: "${recent[0]?.campaignGoal || 'drive business growth'}"
`;
    
    return {
      headlineConstraints,
      benefitConstraints,
      ctaConstraints,
      overallGuidance
    };
  }
  
  /**
   * Clear history (for testing)
   */
  clear(): void {
    this.history = [];
    console.log('[ContentHistoryTracker] History cleared');
  }
  
  /**
   * Get statistics
   */
  getStats(): { total: number; uniqueHeadlines: number; uniqueCTAs: number } {
    const headlines = new Set(this.history.map(e => e.headline));
    const ctas = new Set(this.history.map(e => e.callToAction));
    
    return {
      total: this.history.length,
      uniqueHeadlines: headlines.size,
      uniqueCTAs: ctas.size
    };
  }
}
