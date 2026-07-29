/**
 * Image History Tracker
 * 
 * Tracks previously generated images to ensure visual diversity.
 * Stores descriptions of past images and provides them as "avoid" constraints.
 */

export interface ImageHistoryEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  visualDescription: string;  // AI-generated description of what the image looks like
  creativeBrief: {
    headline: string;
    heroSubject: string;
    environmentDescription: string;
    colorMood: string;
    lightingMood: string;
  };
}

export class ImageHistoryTracker {
  private static instance: ImageHistoryTracker;
  private history: ImageHistoryEntry[] = [];
  private maxHistorySize = 10; // Keep last 10 images
  
  private constructor() {}
  
  static getInstance(): ImageHistoryTracker {
    if (!ImageHistoryTracker.instance) {
      ImageHistoryTracker.instance = new ImageHistoryTracker();
    }
    return ImageHistoryTracker.instance;
  }
  
  /**
   * Add a new image to history
   */
  addImage(entry: ImageHistoryEntry): void {
    this.history.unshift(entry); // Add to beginning
    
    // Keep only last N images
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    
    console.log(`[ImageHistoryTracker] Added image to history. Total: ${this.history.length}`);
  }
  
  /**
   * Get recent image descriptions to avoid repetition
   */
  getRecentDescriptions(count: number = 3): string[] {
    return this.history
      .slice(0, count)
      .map(entry => entry.visualDescription);
  }
  
  /**
   * Get recent images for a specific tenant/brand
   * (For multi-tenant support in future)
   */
  getRecentForTenant(tenantId: string, count: number = 3): ImageHistoryEntry[] {
    // TODO: Filter by tenantId when multi-tenant is implemented
    return this.history.slice(0, count);
  }
  
  /**
   * Generate "avoid" constraints based on recent images
   */
  generateAvoidConstraints(): string[] {
    const recent = this.history.slice(0, 3);
    
    if (recent.length === 0) {
      return [];
    }
    
    const constraints: string[] = [];
    
    // Analyze recent patterns
    const recentSubjects = recent.map(e => e.creativeBrief.heroSubject);
    const recentEnvironments = recent.map(e => e.creativeBrief.environmentDescription);
    const recentColors = recent.map(e => e.creativeBrief.colorMood);
    const recentLighting = recent.map(e => e.creativeBrief.lightingMood);
    
    // Create specific avoidance instructions
    if (recentSubjects.length > 0) {
      constraints.push(`DO NOT repeat these subject arrangements: ${recentSubjects.join('; ')}`);
    }
    
    if (recentEnvironments.length > 0) {
      constraints.push(`DO NOT use these environments again: ${recentEnvironments.join('; ')}`);
    }
    
    if (recentColors.length > 0) {
      constraints.push(`AVOID these color moods: ${recentColors.join(', ')}`);
    }
    
    if (recentLighting.length > 0) {
      constraints.push(`AVOID these lighting styles: ${recentLighting.join(', ')}`);
    }
    
    // Add specific visual descriptions to avoid
    const visualDescriptions = this.getRecentDescriptions(3);
    if (visualDescriptions.length > 0) {
      constraints.push(`PREVIOUS IMAGES YOU MUST AVOID REPLICATING: ${visualDescriptions.join(' | ')}`);
    }
    
    return constraints;
  }
  
  /**
   * Clear history (for testing or reset)
   */
  clear(): void {
    this.history = [];
    console.log('[ImageHistoryTracker] History cleared');
  }
  
  /**
   * Get summary statistics
   */
  getStats(): { total: number; oldest?: number; newest?: number } {
    return {
      total: this.history.length,
      oldest: this.history[this.history.length - 1]?.timestamp,
      newest: this.history[0]?.timestamp
    };
  }
}
