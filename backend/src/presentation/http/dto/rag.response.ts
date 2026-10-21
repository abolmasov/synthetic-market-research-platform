import { RagSource } from '../../../domain/rag/rag-source';

export type RagQueryResponse = {
  hypothesis: string;
  sources: RagSource[];
};
