import { RagSource } from './rag-source';

export interface RagSourceProvider {
  query(hypothesis: string): Promise<RagSource[]>;
}
