/**
 * BELLA EOS PLATFORM CONTRACT: Knowledge Contract (IKnowledge v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME (ELR)
 * 
 * Contract 21: Distilled Enterprise Knowledge representing verified patterns,
 * lessons, risks, and recommendations learned from operational evidence.
 */

export type KnowledgeCategory = 
  | 'LESSON_LEARNED' 
  | 'SUCCESS_PATTERN' 
  | 'FAILURE_PATTERN' 
  | 'RISK_CATALOG' 
  | 'BEST_PRACTICE' 
  | 'RECOMMENDATION' 
  | 'ANTI_PATTERN';

export interface IKnowledge {
  id: string;
  category: KnowledgeCategory;
  lesson: string;
  pattern?: string;
  risk?: string;
  recommendation?: string;
  confidence: number; // 0.0 to 1.0 (e.g., 0.96)
  evidence_refs: string[]; // List of Evidence IDs supporting this knowledge
  owner: string;
  effective_date: string;
  expiration?: string;
  status: 'DRAFT' | 'VERIFIED' | 'DEPRECATED';
  tags: string[];
  metadata?: Record<string, any>;
}
