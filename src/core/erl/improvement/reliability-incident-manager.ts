/**
 * BELLA EOS ERL: Reliability Incident Manager
 * Specification: ERL Improvement Engine
 * 
 * Mission: Logs, tracks, and manages DevOps-style incidents, closing the loop with ELR and Decision Journal.
 */

import { IReliabilityIncident } from '@/types/erl';
import { ErlRootCauseRuntime } from '../diagnostics/erl-root-cause-runtime';
import { ReliabilityBudgetManager } from '../governance/reliability-budget-manager';

export class ReliabilityIncidentManager {
  private static instance: ReliabilityIncidentManager;
  private incidents: Map<string, IReliabilityIncident> = new Map();

  private constructor() {}

  public static getInstance(): ReliabilityIncidentManager {
    if (!ReliabilityIncidentManager.instance) {
      ReliabilityIncidentManager.instance = new ReliabilityIncidentManager();
    }
    return ReliabilityIncidentManager.instance;
  }

  public reportIncident(
    capability: string,
    severity: IReliabilityIncident['severity'],
    description: string,
    errorMsg: string
  ): IReliabilityIncident {
    const incidentId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const rootCause = ErlRootCauseRuntime.getInstance().diagnoseFailure(description, errorMsg);

    // Apply error budget penalty based on severity
    const penalty = severity === 'CRITICAL' ? 0.015 : severity === 'MAJOR' ? 0.005 : 0.001;
    ReliabilityBudgetManager.getInstance().reportIncident(capability, penalty);

    const incident: IReliabilityIncident = {
      incidentId,
      severity,
      capability,
      rootCauseAttribution: rootCause,
      description,
      durationMinutes: 0,
      status: 'OPEN',
      recoveryTimeline: [`[${new Date().toISOString()}] Incident detected. Severity: ${severity}.`],
      actionPlan: '',
      createdAt: new Date().toISOString()
    };

    this.incidents.set(incidentId, incident);
    return incident;
  }

  public resolveIncident(
    incidentId: string,
    actionPlan: string,
    durationMinutes: number
  ): IReliabilityIncident | undefined {
    const incident = this.incidents.get(incidentId);
    if (!incident) return undefined;

    incident.status = 'RESOLVED';
    incident.actionPlan = actionPlan;
    incident.durationMinutes = durationMinutes;
    incident.recoveryTimeline.push(`[${new Date().toISOString()}] Incident resolved. Action Plan: ${actionPlan}`);

    // Emulate syncing with ELR Learning Tickets & Decision Journal
    incident.recoveryTimeline.push(`[ELR Sync] Dispatched incident learning payload. Generated Learning Ticket.`);
    incident.recoveryTimeline.push(`[Decision Journal Sync] Recorded post-incident action review decision.`);

    this.incidents.set(incidentId, incident);
    return incident;
  }

  public getIncident(incidentId: string): IReliabilityIncident | undefined {
    return this.incidents.get(incidentId);
  }

  public listIncidents(): IReliabilityIncident[] {
    return Array.from(this.incidents.values());
  }
}
