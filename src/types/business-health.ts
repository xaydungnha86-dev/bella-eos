export interface HealthScore {
  score: number; // 0-100
  status: 'critical' | 'warning' | 'healthy';
  bottlenecks: string[];
}

export interface HealthEvidence {
  category: string;
  metric: string;
  delta: string;
  description: string;
}

export interface HealthRecommendation {
  category: string;
  recommendation: string;
  expectedImpact: string;
}

export interface BusinessHealthReport {
  marketing: HealthScore;
  sales: HealthScore;
  retention: HealthScore;
  finance: HealthScore;
  operations: HealthScore;
  brand: HealthScore;
  evidences: HealthEvidence[];
  recommendations: HealthRecommendation[];
}
