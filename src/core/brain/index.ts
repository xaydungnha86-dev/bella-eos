export { MemoryCenter } from './memory';
export { UnderstandingCenter } from './understanding';
export { KnowledgeCenter } from './knowledge';
export { ContextCenter } from './context';
export { ReasoningCenter } from './reasoning';
export { LearningCenter } from './learning';

import { MemoryCenter } from './memory';
import { UnderstandingCenter } from './understanding';
import { KnowledgeCenter } from './knowledge';
import { ContextCenter } from './context';
import { ReasoningCenter } from './reasoning';
import { LearningCenter } from './learning';

export class EnterpriseBrain {
  static Memory = MemoryCenter;
  static Understanding = UnderstandingCenter;
  static Knowledge = KnowledgeCenter;
  static Context = ContextCenter;
  static Reasoning = ReasoningCenter;
  static Learning = LearningCenter;
}
