/**
 * BELLA EOS CERTIFICATION: Enterprise Market Intelligence Governance Certification Suite
 * Specification: v18.9 BELLA EOS ENTERPRISE MARKET INTELLIGENCE GOVERNANCE
 * 
 * Verifies Source Registry (R47), Source Trust Engine (R48), Freshness Decay (R49),
 * Conflict Resolution (R50), External Source Policy (R51), Strategic Watchlist Engine,
 * and Platform Contracts 44–45.
 */

import { SourceRegistryRuntime } from '@/core/mir/governance/source-registry';
import { SourceTrustEngine } from '@/core/mir/governance/source-trust-engine';
import { FreshnessRuntime } from '@/core/mir/governance/freshness-runtime';
import { ConflictResolutionRuntime } from '@/core/mir/governance/conflict-resolution-runtime';
import { ExternalSourcePolicyRuntime } from '@/core/mir/governance/external-source-policy';
import { StrategicWatchlistEngine } from '@/core/mir/strategic-watchlist';

describe('BELLA EOS v18.9 Enterprise Market Intelligence Governance Certification', () => {

  it('1. Source Registry & Trust Engine (Contract 44): should manage source authority & calculate composite trust scores', () => {
    const govSrc = SourceRegistryRuntime.getInstance().getSource('src-gov');
    const trust = SourceTrustEngine.getInstance().calculateTrustScore('src-gtrends', 3);

    expect(govSrc?.authorityScore).toBe(100);
    expect(trust.compositeTrustScore).toBeGreaterThan(80);
  });

  it('2. Freshness Runtime: should evaluate signal age & apply decay penalties to stale data', () => {
    const fresh = FreshnessRuntime.getInstance().evaluateFreshness(5, 30);
    const stale = FreshnessRuntime.getInstance().evaluateFreshness(200, 90);

    expect(fresh.isOutdated).toBe(false);
    expect(stale.isOutdated).toBe(true);
    expect(stale.decayPenaltyMultiplier).toBe(0.35);
  });

  it('3. Conflict Resolution Runtime: should resolve contradictory market metrics favoring higher authority', () => {
    const res = ConflictResolutionRuntime.getInstance().resolveConflict('ROAS', [
      { sourceId: 'src-nielsen', claimedValue: 3.2, sourceTrustScore: 98 },
      { sourceId: 'src-fbpost', claimedValue: 4.8, sourceTrustScore: 60 },
    ]);

    expect(res.winningSourceId).toBe('src-nielsen');
    expect(res.resolvedValue).toBeLessThan(4.0);
  });

  it('4. External Source Policy Runtime: should block prohibited sources for strategic use cases', () => {
    const valid = ExternalSourcePolicyRuntime.getInstance().validateSourcePolicy('STRATEGY', 'INDUSTRY_REPORT');
    const invalid = ExternalSourcePolicyRuntime.getInstance().validateSourcePolicy('STRATEGY', 'PERSONAL_BLOG');

    expect(valid.isAllowed).toBe(true);
    expect(invalid.isAllowed).toBe(false);
    expect(invalid.policyViolation).toBeDefined();
  });

  it('5. Strategic Watchlist Engine: should execute proactive background scans & emit alerts', () => {
    const watchlist = StrategicWatchlistEngine.getInstance().executeProactiveScan('default-tenant');

    expect(watchlist.totalTopicsScanned).toBeGreaterThan(0);
    expect(watchlist.generatedAlerts.length).toBeGreaterThan(0);
    expect(watchlist.generatedAlerts[0].marketEvidenceId).toMatch(/^mkt-evid-/);
  });
});
