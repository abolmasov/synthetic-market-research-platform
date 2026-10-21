import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RagSourceProvider } from '../../domain/rag/rag-source.provider';
import { RagSource } from '../../domain/rag/rag-source';
import { DocumentChunkOrmEntity } from '../persistence/typeorm/document-chunk.orm-entity';
import { VertexEmbeddingService } from './vertex-embedding.service';

@Injectable()
export class PgVectorRagSourceProvider implements RagSourceProvider {
  private readonly logger = new Logger(PgVectorRagSourceProvider.name);
  private readonly topK: number;
  private readonly minRelevanceScore: number | null;

  constructor(
    @InjectRepository(DocumentChunkOrmEntity)
    private readonly chunkRepository: Repository<DocumentChunkOrmEntity>,
    private readonly embeddingService: VertexEmbeddingService,
    private readonly configService: ConfigService,
  ) {
    this.topK = parseInt(this.configService.get<string>('RAG_TOP_K', '10'), 10);
    const minScore = this.configService.get<string>(
      'RAG_MIN_RELEVANCE_SCORE',
      '',
    );
    this.minRelevanceScore = minScore ? parseFloat(minScore) : null;
  }

  async query(hypothesis: string): Promise<RagSource[]> {
    try {
      const chunkCount = await this.chunkRepository.count();
      if (chunkCount === 0) {
        this.logger.warn(
          'No documents in knowledge base. Returning empty RAG results.',
        );
        return [];
      }

      const queryEmbedding = await this.embeddingService.embed(hypothesis);
      const vectorLiteral = `[${queryEmbedding.join(',')}]`;

      const rows: {
        id: string;
        title: string;
        url: string | null;
        content: string;
        relevance_score: number;
      }[] = await this.chunkRepository.query(
        `SELECT id, title, url, content,
                1 - (embedding <=> $1::vector) AS relevance_score
         FROM document_chunks
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [vectorLiteral, this.topK],
      );

      let filtered = rows;
      if (this.minRelevanceScore !== null) {
        filtered = rows.filter(
          (row) => Number(row.relevance_score) >= this.minRelevanceScore!,
        );
        if (filtered.length < rows.length) {
          this.logger.log(
            `RAG filtered ${rows.length - filtered.length} low-relevance results (min=${this.minRelevanceScore})`,
          );
        }
      }

      this.logger.log(
        `RAG query returned ${filtered.length} results for: "${hypothesis.slice(0, 80)}..."`,
      );

      return filtered.map((row) => ({
        title: row.title,
        url: row.url ?? '',
        snippet:
          row.content.length > 500
            ? row.content.slice(0, 500) + '...'
            : row.content,
        relevanceScore: Number(Number(row.relevance_score).toFixed(4)),
      }));
    } catch (error) {
      this.logger.error('RAG query failed', error);
      return [];
    }
  }
}
