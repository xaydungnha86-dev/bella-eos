/**
 * BELLA EOS ASSETS: Learning DNA Pack
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Defines the enterprise-specific Learning DNA Asset Pack. As the enterprise operates,
 * AI continuously distills lessons, patterns, playbooks, best practices, decisions,
 * risk catalogs, and optimization history into this living DNA pack.
 */

import { AssetManifest, IAsset } from '@/types/asset';

export interface LearningDNAPayload {
  tenantId: string;
  version: string;
  lessons: string[];
  patterns: string[];
  playbooks: string[];
  bestPractices: string[];
  executiveDecisions: string[];
  riskCatalog: string[];
  commonMistakes: string[];
  optimizationHistory: string[];
  updatedAt: string;
}

export class LearningDNAPack implements IAsset {
  public manifest: AssetManifest;
  public contentPayload: LearningDNAPayload;

  constructor(tenantId: string, initialPayload?: Partial<LearningDNAPayload>) {
    const now = new Date().toISOString();
    this.manifest = {
      id: `dna-learning-${tenantId}`,
      name: `Enterprise Learning DNA Pack [${tenantId}]`,
      version: '18.3.0',
      type: 'LEARNING_DNA',
      author: 'BELLA_EOS_ELR',
      dependencies: {},
      compatibility: { eosVersion: 'v18.3' },
      license: 'PROPRIETARY_ENTERPRISE',
      signature: `sig-dna-${tenantId}-${Date.now()}`,
      checksum: `sha256-dna-${tenantId}`,
    };

    this.contentPayload = {
      tenantId,
      version: '18.3.0',
      lessons: initialPayload?.lessons || ['Always cross-verify revenue numbers with ERP ground truth.'],
      patterns: initialPayload?.patterns || ['Short form campaign videos under 20s generate +23% ROAS.'],
      playbooks: initialPayload?.playbooks || ['High ROI Retargeting Playbook v1.0'],
      bestPractices: initialPayload?.bestPractices || ['Enforce human approval gate when validation confidence < 80%.'],
      executiveDecisions: initialPayload?.executiveDecisions || ['Approved Q3 Retargeting Budget Boost'],
      riskCatalog: initialPayload?.riskCatalog || ['Unbudgeted Marketing Overrun Risk'],
      commonMistakes: initialPayload?.commonMistakes || ['Launching campaigns without setting baseline KPI targets'],
      optimizationHistory: initialPayload?.optimizationHistory || ['Initial v18.3 Learning DNA scaffold created'],
      updatedAt: now,
    };
  }

  public async validate(): Promise<boolean> {
    return (
      Boolean(this.contentPayload.tenantId) &&
      Array.isArray(this.contentPayload.lessons) &&
      Array.isArray(this.contentPayload.patterns)
    );
  }

  public async install(tenantId: string): Promise<boolean> {
    this.contentPayload.tenantId = tenantId;
    return true;
  }

  public async uninstall(tenantId: string): Promise<boolean> {
    return true;
  }

  public appendLesson(lesson: string): void {
    if (!this.contentPayload.lessons.includes(lesson)) {
      this.contentPayload.lessons.push(lesson);
      this.contentPayload.updatedAt = new Date().toISOString();
    }
  }

  public appendPattern(pattern: string): void {
    if (!this.contentPayload.patterns.includes(pattern)) {
      this.contentPayload.patterns.push(pattern);
      this.contentPayload.updatedAt = new Date().toISOString();
    }
  }

  public appendOptimization(record: string): void {
    this.contentPayload.optimizationHistory.push(record);
    this.contentPayload.updatedAt = new Date().toISOString();
  }
}

export class LearningDNAManager {
  private static instance: LearningDNAManager;
  private dnaStore: Map<string, LearningDNAPack> = new Map();

  private constructor() {}

  public static getInstance(): LearningDNAManager {
    if (!LearningDNAManager.instance) {
      LearningDNAManager.instance = new LearningDNAManager();
    }
    return LearningDNAManager.instance;
  }

  public getOrCreateDNA(tenantId: string): LearningDNAPack {
    let pack = this.dnaStore.get(tenantId);
    if (!pack) {
      pack = new LearningDNAPack(tenantId);
      this.dnaStore.set(tenantId, pack);
    }
    return pack;
  }
}
