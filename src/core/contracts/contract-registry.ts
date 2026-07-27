import { EnterpriseContextContract } from './enterprise-context-contract';
import { ExecutiveIntelligenceContract, EicStatus } from './executive-intelligence-contract';
import { LearningContract } from './learning-contract';

export interface AuditRecord {
  timestamp: string;
  contractId: string;
  action: 'REGISTERED' | 'MUTATED' | 'STATUS_CHANGED' | 'ARCHIVED';
  operator: string;
  details: string;
}

export class ContractRegistry {
  private static instance: ContractRegistry;

  private eccStore: Map<string, EnterpriseContextContract> = new Map();
  private eicStore: Map<string, ExecutiveIntelligenceContract[]> = new Map(); // contractId -> Array of versions
  private learningStore: Map<string, LearningContract> = new Map();
  private auditHistory: AuditRecord[] = [];

  private constructor() {}

  public static getInstance(): ContractRegistry {
    if (!ContractRegistry.instance) {
      ContractRegistry.instance = new ContractRegistry();
    }
    return ContractRegistry.instance;
  }

  /**
   * Registers a new Enterprise Context Contract (ECC)
   */
  public registerEcc(ecc: EnterpriseContextContract): void {
    this.eccStore.set(ecc.contextId, ecc);
    this.logAudit(ecc.contextId, 'REGISTERED', 'SYSTEM_KERNEL', `Khởi tạo Enterprise Context Contract thành công.`);
  }

  /**
   * Registers or updates an Executive Intelligence Contract (EIC) with full versioning and lineage tracking
   */
  public registerEic(eic: ExecutiveIntelligenceContract): number {
    const cid = eic.metadata.contractId;
    const existing = this.eicStore.get(cid) || [];

    // Calculate version increment
    const currentVersion = existing.length + 1;
    const updatedEic: ExecutiveIntelligenceContract = {
      ...eic,
      metadata: {
        ...eic.metadata,
        version: currentVersion
      }
    };

    // Maintain commit history / lineage relationship
    if (existing.length > 0) {
      const prevEic = existing[existing.length - 1];
      updatedEic.metadata.parentContractId = `${prevEic.metadata.contractId}-v${prevEic.metadata.version}`;
      
      // Update previous contract's children
      prevEic.metadata.childContractIds = prevEic.metadata.childContractIds || [];
      if (!prevEic.metadata.childContractIds.includes(`${cid}-v${currentVersion}`)) {
        prevEic.metadata.childContractIds.push(`${cid}-v${currentVersion}`);
      }
    }

    existing.push(updatedEic);
    this.eicStore.set(cid, existing);

    this.logAudit(
      cid, 
      'REGISTERED', 
      eic.metadata.agentId, 
      `Đã đăng ký EIC v${currentVersion} với trạng thái ${eic.metadata.status}.`
    );

    return currentVersion;
  }

  /**
   * Updates EIC Status along its 11-step lifecycle
   */
  public updateEicStatus(contractId: string, version: number, status: EicStatus, operator: string): void {
    const existing = this.eicStore.get(contractId);
    if (!existing) throw new Error(`Contract ${contractId} not found.`);

    const targetIdx = existing.findIndex(e => e.metadata.version === version);
    if (targetIdx === -1) throw new Error(`Contract version ${version} of ${contractId} not found.`);

    const oldStatus = existing[targetIdx].metadata.status;
    existing[targetIdx].metadata.status = status;

    this.logAudit(
      contractId, 
      'STATUS_CHANGED', 
      operator, 
      `Chuyển đổi trạng thái từ ${oldStatus} sang ${status} (phiên bản v${version}).`
    );
  }

  /**
   * Gets specific version of an EIC
   */
  public getEic(contractId: string, version?: number): ExecutiveIntelligenceContract | undefined {
    const list = this.eicStore.get(contractId);
    if (!list || list.length === 0) return undefined;

    if (!version) {
      return list[list.length - 1]; // Return latest
    }
    return list.find(e => e.metadata.version === version);
  }

  /**
   * Registers a learning contract for telemetry audit trails
   */
  public registerLearning(learning: LearningContract): void {
    this.learningStore.set(learning.learningId, learning);
    this.logAudit(
      learning.learningId, 
      'REGISTERED', 
      'LEARNING_ENGINE', 
      `Closed-loop learning contract registered for EIC reference: ${learning.parentContractId}`
    );
  }

  /**
   * Fetches the entire audit trail log for compliance checks
   */
  public getAuditHistory(contractId?: string): AuditRecord[] {
    if (contractId) {
      return this.auditHistory.filter(r => r.contractId === contractId);
    }
    return this.auditHistory;
  }

  private logAudit(contractId: string, action: AuditRecord['action'], operator: string, details: string): void {
    this.auditHistory.push({
      timestamp: new Date().toISOString(),
      contractId,
      action,
      operator,
      details
    });
  }
}
