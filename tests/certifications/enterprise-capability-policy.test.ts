/**
 * BELLA EOS CERTIFICATION: Dynamic Enterprise Capability & Policy OS Certification Suite
 * Specification: v20.1 BELLA EOS DYNAMIC ENTERPRISE CAPABILITY & POLICY OS
 * 
 * Verifies Capability Registry Service (CORE-08), Enterprise Resource Manager (CORE-09),
 * and Policy-as-Code Engine (GOV-01).
 */

import { CapabilityRegistryService } from '@/core/capability/capability-registry-service';
import { EnterpriseResourceService } from '@/core/resource/enterprise-resource-service';
import { PolicyAsCodeService } from '@/core/gov/policy-as-code-service';

describe('BELLA EOS v20.1 Dynamic Enterprise Capability & Policy OS Certification', () => {

  it('1. Capability Registry Service (CORE-08): should map capabilities to services, skill packs, models & permissions', () => {
    const cap = CapabilityRegistryService.getInstance().getCapability('cap-forecast-rev');

    expect(cap?.capabilityId).toBe('cap-forecast-rev');
    expect(cap?.category).toBe('FINANCE');
    expect(cap?.requiredSkillPack).toBe('financial-forecasting-pack');
    expect(cap?.requiredModel).toBe('claude-3.5-sonnet');
    expect(cap?.requiredPermission).toBe('ROLE_CFO_READ_WRITE');
  });

  it('2. Enterprise Resource Manager (CORE-09): should enforce resource constraints across money, headcount & GPUs', () => {
    const checkValid = EnterpriseResourceService.getInstance().checkResourceAvailability('res-mkt-money', 20_000);
    const checkExceeded = EnterpriseResourceService.getInstance().checkResourceAvailability('res-mkt-money', 500_000);

    expect(checkValid.isWithinCeiling).toBe(true);
    expect(checkExceeded.isWithinCeiling).toBe(false);
    expect(checkExceeded.reason).toContain('RESOURCE EXCEEDED');
  });

  it('3. Policy-as-Code Engine (GOV-01): should enforce security, compliance & approval policies', () => {
    const piiOk = PolicyAsCodeService.getInstance().canExport('DATA_PRIVACY_OFFICER', 'PII');
    const piiDenied = PolicyAsCodeService.getInstance().canExport('INTERN', 'PII');
    const dualSignDenied = PolicyAsCodeService.getInstance().canApprove('CMO', 100_000, 1);

    expect(piiOk.isAllowed).toBe(true);
    expect(piiDenied.isAllowed).toBe(false);
    expect(piiDenied.violatedPolicyName).toContain('GDPR');
    expect(dualSignDenied.isAllowed).toBe(false);
    expect(dualSignDenied.reason).toContain('dual executive signatures');
  });
});
