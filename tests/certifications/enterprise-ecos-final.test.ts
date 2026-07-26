/**
 * BELLA EOS CERTIFICATION: Enterprise Cognitive Operating System (ECOS) Final Specification Certification Suite
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 * 
 * Verifies Cross-Cutting Infrastructure Services, EDR AI Market Analyst Expert Agent,
 * and unified ECOS execution.
 */

import { EnterpriseObservationService } from '@/core/infrastructure/observation-service';
import { EnterpriseNotificationService } from '@/core/infrastructure/notification-service';
import { EnterpriseSchedulingService } from '@/core/infrastructure/scheduling-service';
import { EnterpriseIntegrationService } from '@/core/infrastructure/integration-service';
import { EnterpriseSecretManagerService } from '@/core/infrastructure/secret-manager-service';
import { EnterpriseCostAnalyticsService } from '@/core/infrastructure/cost-analytics-service';
import { AiMarketAnalyst } from '@/core/edr/ai-market-analyst';
import { MultiAgentDebateRuntime } from '@/core/edr/multi-agent-debate-runtime';

describe('BELLA EOS ECOS Consolidated Final Specification Certification Suite', () => {

  it('1. Cross-Cutting Infrastructure Services: should execute telemetry, alert notifications & scheduling', async () => {
    const obs = EnterpriseObservationService.getInstance();
    obs.recordLog('Test log');
    expect(obs.getTelemetry().logs.length).toBeGreaterThan(0);

    const notif = EnterpriseNotificationService.getInstance();
    const sent = await notif.sendNotification({
      channel: 'EMAIL',
      recipient: 'ceo@bella.vn',
      message: 'Strategic report ready',
      priority: 'HIGH',
    });
    expect(sent).toBe(true);

    const sched = EnterpriseSchedulingService.getInstance();
    expect(sched.getActiveTasksCount()).toBeGreaterThan(0);
  });

  it('2. Cross-Cutting Infrastructure Services: should execute integration syncs, vaults & cost analysis', () => {
    const integration = EnterpriseIntegrationService.getInstance();
    expect(integration.getIntegrationStatus('sap')?.connectionStatus).toBe('CONNECTED');

    const secret = EnterpriseSecretManagerService.getInstance();
    expect(secret.retrieveSecret('API_KEY_OPENAI')).toBeDefined();

    const cost = EnterpriseCostAnalyticsService.getInstance();
    cost.trackUsage('claude-3.5-sonnet', 10000);
    expect(cost.getCostReport(1000).totalExpenditureUsd).toBeGreaterThan(0);
  });

  it('3. EDR Expert Board: should integrate AI Market Analyst expert agent & conduct debate', () => {
    const analysis = AiMarketAnalyst.getInstance().conductMarketAnalysis('Launch Spa in Da Nang');
    expect(analysis.tamSamSomUsd.som).toBe(3_500_000);

    const debate = MultiAgentDebateRuntime.getInstance().conductDebate(['FINANCE', 'MARKETING', 'MARKET_ANALYST'], 'Launch Spa in Da Nang');
    expect(debate.opinions.length).toBeGreaterThan(5);
    expect(debate.opinions.some(o => o.expertRole === 'MARKET_ANALYST')).toBe(true);
  });
});
