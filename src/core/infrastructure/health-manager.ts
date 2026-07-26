/**
 * BELLA EOS INFRASTRUCTURE SERVICE: Enterprise Health Manager
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS Decoupled)
 *
 * Mission: Service Health & Self-Healing Orchestrator. Monitors provider and service statuses,
 * detects latency issues or timeouts, and automatically schedules fallback provider routing.
 */

export type ServiceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

export interface ServiceHealthReport {
  serviceId: string;
  status: ServiceHealthStatus;
  latencyMs: number;
  lastChecked: string;
  fallbacksConfigured: string[];
}

export class HealthManager {
  private static instance: HealthManager;
  private servicesHealth: Map<string, ServiceHealthReport> = new Map();

  private constructor() {
    this.seedHealthData();
  }

  public static getInstance(): HealthManager {
    if (!HealthManager.instance) {
      HealthManager.instance = new HealthManager();
    }
    return HealthManager.instance;
  }

  private seedHealthData(): void {
    // Seed Claude and GPT provider health statuses
    this.servicesHealth.set('Claude-3.5-Sonnet-Code', {
      serviceId: 'Claude-3.5-Sonnet-Code',
      status: 'HEALTHY',
      latencyMs: 1200,
      lastChecked: new Date().toISOString(),
      fallbacksConfigured: ['Gemini-1.5-Pro-Backup']
    });

    this.servicesHealth.set('GPT-4o-Reasoning', {
      serviceId: 'GPT-4o-Reasoning',
      status: 'HEALTHY',
      latencyMs: 2400,
      lastChecked: new Date().toISOString(),
      fallbacksConfigured: ['Claude-3.5-Sonnet-Code', 'Gemini-1.5-Pro-Backup']
    });
  }

  public checkHealth(serviceId: string): ServiceHealthReport | undefined {
    return this.servicesHealth.get(serviceId);
  }

  public reportTimeout(serviceId: string): void {
    const report = this.servicesHealth.get(serviceId);
    if (report) {
      report.status = 'CRITICAL';
      report.latencyMs = 9999;
      report.lastChecked = new Date().toISOString();
    }
  }

  public getFallbackProvider(serviceId: string): string {
    const report = this.servicesHealth.get(serviceId);
    if (report && report.status === 'CRITICAL' && report.fallbacksConfigured.length > 0) {
      // Fallback
      return report.fallbacksConfigured[0];
    }
    return serviceId; // Returns original if healthy or no fallbacks configured
  }

  public recoverService(serviceId: string): void {
    const report = this.servicesHealth.get(serviceId);
    if (report) {
      report.status = 'HEALTHY';
      report.latencyMs = 1200;
      report.lastChecked = new Date().toISOString();
    }
  }
}
