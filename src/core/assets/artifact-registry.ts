/**
 * BELLA EOS ASSET SERVICE: Artifact Registry
 * Specification: BELLA EOS FINAL IMPLEMENTATION SPECIFICATION (ECOS)
 *
 * Mission: Enterprise Audit Verification Engine. Stores and validates verifiable output proofs
 * (Git commits, file URIs, database changes, logs) associated with completed tasks and deliverables.
 */

export interface Artifact {
  artifactId: string;
  taskId: string;
  type: 'GIT_COMMIT' | 'FILE_URI' | 'DATABASE_LOG' | 'URL_PROOF' | 'IMAGE_PROOF' | 'KPI_METRIC';
  uri: string;
  metadata?: Record<string, any>;
  registeredAt: string;
}

export class ArtifactRegistry {
  private static instance: ArtifactRegistry;
  private registry: Map<string, Artifact[]> = new Map(); // taskId -> Artifacts

  private constructor() {}

  public static getInstance(): ArtifactRegistry {
    if (!ArtifactRegistry.instance) {
      ArtifactRegistry.instance = new ArtifactRegistry();
    }
    return ArtifactRegistry.instance;
  }

  public registerArtifact(params: Omit<Artifact, 'artifactId' | 'registeredAt'>): Artifact {
    const artifact: Artifact = {
      ...params,
      artifactId: `art-${params.type}-${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };

    const list = this.registry.get(params.taskId) || [];
    list.push(artifact);
    this.registry.set(params.taskId, list);

    return artifact;
  }

  public getArtifactsForTask(taskId: string): Artifact[] {
    return this.registry.get(taskId) || [];
  }

  public hasValidEvidence(taskId: string): boolean {
    const list = this.registry.get(taskId);
    return !!list && list.length > 0;
  }
}
