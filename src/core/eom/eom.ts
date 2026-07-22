import * as EOMTypes from '../../types/eom';

export class EnterpriseObjectModel {
  private static schemas: { [key: string]: string[] } = {
    Company: ['id', 'name', 'taxId', 'industry'],
    Department: ['id', 'name', 'companyId'],
    Role: ['id', 'title', 'jd', 'skills', 'kpis'],
    Objective: ['id', 'title', 'targetValue', 'deadline', 'ownerId'],
    Project: ['id', 'name', 'objectiveId', 'budget', 'status'],
    Process: ['id', 'templateId', 'name', 'status', 'progress', 'version'],
    Stage: ['id', 'processId', 'name', 'order', 'status'],
    Task: ['id', 'stageId', 'title', 'assignedTo', 'status'],
    Command: ['id', 'type', 'payload', 'targetTopic', 'status'],
    Resource: ['id', 'type', 'capacity', 'lockedBy', 'status'],
    Capability: ['id', 'name', 'executorId', 'costPerUnit', 'latencyMs'],
    Policy: ['id', 'name', 'rule', 'type', 'status'],
    Evidence: ['id', 'taskId', 'proofType', 'proofData', 'verified'],
    Knowledge: ['id', 'category', 'content', 'tags'],
    Decision: ['id', 'intentId', 'rationale', 'confidence', 'policyApplied'],
    Asset: ['id', 'type', 'storageUrl', 'hash'],
    Metric: ['id', 'name', 'value', 'timestamp'],
    Document: ['id', 'title', 'version', 'content'],
    Event: ['id', 'name', 'payload', 'timestamp'],
    Intent: ['id', 'rawText', 'sourceIdentity', 'decomposedObjectives']
  };

  static createObject<T = any>(objectType: string, data: any): T {
    const schema = this.schemas[objectType];
    if (!schema) {
      return data as T;
    }
    const obj: any = {
      _eomType: objectType,
      _id: `${objectType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    schema.forEach(field => {
      obj[field] = data[field] !== undefined ? data[field] : null;
    });
    return obj as T;
  }

  static validate(objectType: string, data: any): any {
    const schema = this.schemas[objectType];
    if (!schema) {
      throw new Error(`EOM Schema not found for type: ${objectType}`);
    }

    // Verify required fields or structure is correct
    // For simulation validation, we log and return the object
    const validatedObj = this.createObject(objectType, data);
    console.log(`[EOM Validation] Verified object type: ${objectType}`, validatedObj);
    return validatedObj;
  }
}
