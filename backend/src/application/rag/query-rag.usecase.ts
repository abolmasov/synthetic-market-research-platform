import { Inject, Injectable } from '@nestjs/common';
import type { RagSourceProvider } from '../../domain/rag/rag-source.provider';
import { RAG_SOURCE_PROVIDER } from '../../common/tokens';
import { RagSource } from '../../domain/rag/rag-source';

export type RagQueryInput = {
  hypothesis: string;
};

@Injectable()
export class QueryRagUseCase {
  constructor(
    @Inject(RAG_SOURCE_PROVIDER)
    private readonly provider: RagSourceProvider,
  ) {}

  async execute(input: RagQueryInput): Promise<RagSource[]> {
    return this.provider.query(input.hypothesis);
  }
}
