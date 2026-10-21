import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RagController } from '../presentation/http/rag.controller';
import { QueryRagUseCase } from '../application/rag/query-rag.usecase';
import { RAG_SOURCE_PROVIDER } from '../common/tokens';
import { InMemoryRagSourceProvider } from '../infrastructure/rag/in-memory-rag.provider';
import { PgVectorRagSourceProvider } from '../infrastructure/rag/pgvector-rag.provider';
import { VertexEmbeddingService } from '../infrastructure/rag/vertex-embedding.service';
import { DocumentIngestionService } from '../infrastructure/rag/document-ingestion.service';
import { DocumentChunkOrmEntity } from '../infrastructure/persistence/typeorm/document-chunk.orm-entity';
import { isDatabaseEnabled } from '../common/runtime-config';

const isPgVectorEnabled =
  isDatabaseEnabled &&
  process.env.RAG_PROVIDER?.trim().toLowerCase() === 'pgvector';

const ragImports = isPgVectorEnabled
  ? [TypeOrmModule.forFeature([DocumentChunkOrmEntity]), ConfigModule]
  : [];

const ragSourceProvider = {
  provide: RAG_SOURCE_PROVIDER,
  useClass: isPgVectorEnabled
    ? PgVectorRagSourceProvider
    : InMemoryRagSourceProvider,
};

const pgVectorProviders = isPgVectorEnabled
  ? [VertexEmbeddingService, DocumentIngestionService]
  : [];

const pgVectorExports = isPgVectorEnabled ? [DocumentIngestionService] : [];

@Module({
  imports: [...ragImports],
  controllers: [RagController],
  providers: [QueryRagUseCase, ragSourceProvider, ...pgVectorProviders],
  exports: [RAG_SOURCE_PROVIDER, QueryRagUseCase, ...pgVectorExports],
})
export class RagModule {}
