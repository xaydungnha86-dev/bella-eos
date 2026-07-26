/**
 * BELLA EOS PLATFORM CONTRACT: Learning Contract (ILearning v1.0)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME (ELR)
 * 
 * Contract 23: Learning Contract aggregating updates across Enterprise Brain Memory,
 * Knowledge Graph, Experience Store, and Enterprise Ontology.
 */

import { IEvidence } from './evidence';
import { IKnowledge } from './knowledge';
import { IExperience } from './experience';

export interface ILearning {
  id: string;
  evidenceId: string;
  memory_update: {
    campaign?: string;
    outcome?: string;
    decision?: string;
    lesson?: string;
    confidence: number;
    evidenceRef: string;
  };
  knowledge_update: IKnowledge[];
  experience_update?: IExperience;
  ontology_update?: {
    entitiesAddedOrModified: string[];
    relationsAddedOrModified: string[];
  };
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}
