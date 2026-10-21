import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentChunkOrmEntity } from '../persistence/typeorm/document-chunk.orm-entity';
import { VertexEmbeddingService } from './vertex-embedding.service';

export type DocumentMetadata = {
  title: string;
  url?: string;
  sourceType: string;
  industry?: string;
  uploadedFileName?: string;
  extra?: Record<string, unknown>;
};

export type RagDocumentSummary = {
  id: string;
  title: string;
  sourceType: string;
  url: string | null;
  industry: string | null;
  uploadedFileName: string | null;
  chunks: number;
  createdAt: string;
  isLegacy: boolean;
};

type TextChunk = {
  content: string;
  index: number;
};

type PdfParseResult = {
  text?: string;
};

type PdfParseModule = {
  default?: (input: Uint8Array | Buffer) => Promise<PdfParseResult>;
};

const EMBEDDING_BATCH_SIZE = 5;

type LegacyDocumentSelector = {
  title: string;
  sourceType: string;
  url: string | null;
  industry: string | null;
  uploadedFileName: string | null;
  createdMinute: string;
};

@Injectable()
export class DocumentIngestionService {
  private readonly logger = new Logger(DocumentIngestionService.name);
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(
    @InjectRepository(DocumentChunkOrmEntity)
    private readonly chunkRepository: Repository<DocumentChunkOrmEntity>,
    private readonly embeddingService: VertexEmbeddingService,
    private readonly configService: ConfigService,
  ) {
    this.chunkSize = parseInt(
      this.configService.get<string>('RAG_CHUNK_SIZE', '2000'),
      10,
    );
    this.chunkOverlap = parseInt(
      this.configService.get<string>('RAG_CHUNK_OVERLAP', '200'),
      10,
    );
  }

  async ingestText(text: string, metadata: DocumentMetadata): Promise<number> {
    const chunks = this.chunkText(text);
    this.logger.log(`Chunked "${metadata.title}" into ${chunks.length} chunks`);

    const documentId = randomUUID();
    const ingestedAt = new Date().toISOString();

    let inserted = 0;

    for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
      const texts = batch.map((c) => c.content);

      const embeddings = await this.embeddingService.embedBatch(texts);

      const entities = batch.map((chunk, idx) => {
        const entity = this.chunkRepository.create({
          title: metadata.title,
          url: metadata.url ?? null,
          content: chunk.content,
          embedding: `[${embeddings[idx].join(',')}]`,
          sourceType: metadata.sourceType,
          industry: metadata.industry ?? null,
          metadata: {
            ...metadata.extra,
            chunkIndex: chunk.index,
            uploadedFileName: metadata.uploadedFileName ?? null,
            documentId,
            ingestedAt,
          },
        });
        return entity;
      });

      await this.chunkRepository.save(entities);
      inserted += entities.length;

      this.logger.log(
        `Embedded and stored batch ${Math.floor(i / EMBEDDING_BATCH_SIZE) + 1}, total: ${inserted}/${chunks.length}`,
      );
    }

    return inserted;
  }

  async ingestFile(
    filePath: string,
    metadata: DocumentMetadata,
  ): Promise<number> {
    const ext = path.extname(filePath).toLowerCase();
    const buffer = fs.readFileSync(filePath);
    const text = await this.extractTextFromBuffer(buffer, ext);

    if (!text.trim()) {
      this.logger.warn(`File "${filePath}" produced no text, skipping`);
      return 0;
    }

    return this.ingestText(text, {
      ...metadata,
      uploadedFileName: metadata.uploadedFileName ?? path.basename(filePath),
    });
  }

  async ingestBuffer(
    fileName: string,
    buffer: Buffer,
    metadata: DocumentMetadata,
  ): Promise<number> {
    const ext = path.extname(fileName).toLowerCase();
    const text = await this.extractTextFromBuffer(buffer, ext);

    if (!text.trim()) {
      this.logger.warn(`File "${fileName}" produced no text, skipping`);
      return 0;
    }

    return this.ingestText(text, {
      ...metadata,
      uploadedFileName: metadata.uploadedFileName ?? fileName,
    });
  }

  async getDocuments(): Promise<RagDocumentSummary[]> {
    try {
      const rows = await this.chunkRepository
        .createQueryBuilder('chunk')
        .select([
          'chunk.id',
          'chunk.title',
          'chunk.url',
          'chunk.sourceType',
          'chunk.industry',
          'chunk.metadata',
          'chunk.createdAt',
        ])
        .orderBy('chunk.createdAt', 'DESC')
        .getMany();

      type AggregatedDocument = RagDocumentSummary & {
        createdAtMs: number;
      };

      const byDocument = new Map<string, AggregatedDocument>();

      for (const row of rows) {
        const metadata = row.metadata ?? {};
        const documentId = this.getMetadataString(metadata, 'documentId');
        const uploadedFileName = this.getMetadataString(
          metadata,
          'uploadedFileName',
        );
        const createdAt = row.createdAt;

        const key =
          documentId !== null
            ? `doc_${documentId}`
            : this.encodeLegacyDocumentKey({
                title: row.title,
                sourceType: row.sourceType,
                url: row.url,
                industry: row.industry,
                uploadedFileName,
                createdMinute: this.toUtcMinuteStartIso(createdAt),
              });

        const existing = byDocument.get(key);
        if (!existing) {
          byDocument.set(key, {
            id: key,
            title: row.title,
            sourceType: row.sourceType,
            url: row.url,
            industry: row.industry,
            uploadedFileName,
            chunks: 1,
            createdAt: createdAt.toISOString(),
            createdAtMs: createdAt.getTime(),
            isLegacy: documentId === null,
          });
          continue;
        }

        existing.chunks += 1;
        if (createdAt.getTime() < existing.createdAtMs) {
          existing.createdAtMs = createdAt.getTime();
          existing.createdAt = createdAt.toISOString();
        }
      }

      return [...byDocument.values()]
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
        .map((document) => ({
          id: document.id,
          title: document.title,
          sourceType: document.sourceType,
          url: document.url,
          industry: document.industry,
          uploadedFileName: document.uploadedFileName,
          chunks: document.chunks,
          createdAt: document.createdAt,
          isLegacy: document.isLegacy,
        }));
    } catch (error) {
      this.logger.error('Failed to get RAG documents from database', error);
      return [];
    }
  }

  async deleteDocument(documentKey: string): Promise<number> {
    if (documentKey.startsWith('doc_')) {
      const documentId = documentKey.slice(4);
      if (!documentId) {
        return 0;
      }

      const result = await this.chunkRepository
        .createQueryBuilder()
        .delete()
        .from(DocumentChunkOrmEntity)
        .where(`metadata ->> 'documentId' = :documentId`, {
          documentId,
        })
        .execute();

      return result.affected ?? 0;
    }

    if (documentKey.startsWith('legacy_')) {
      return this.deleteLegacyDocument(documentKey);
    }

    return 0;
  }

  async getStats(): Promise<{
    totalChunks: number;
    bySourceType: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    try {
      type SourceTypeCountRow = {
        sourceType: string | null;
        count: string;
      };

      type IndustryCountRow = {
        industry: string | null;
        count: string;
      };

      const totalChunks = await this.chunkRepository.count();

      const sourceTypeRows = await this.chunkRepository
        .createQueryBuilder('chunk')
        .select('chunk.sourceType', 'sourceType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('chunk.sourceType')
        .getRawMany<SourceTypeCountRow>();

      const bySourceType: Record<string, number> = {};
      for (const row of sourceTypeRows) {
        const label = row.sourceType ?? 'unspecified';
        bySourceType[label] = Number.parseInt(row.count, 10);
      }

      const industryRows = await this.chunkRepository
        .createQueryBuilder('chunk')
        .select('chunk.industry', 'industry')
        .addSelect('COUNT(*)', 'count')
        .groupBy('chunk.industry')
        .getRawMany<IndustryCountRow>();

      const byIndustry: Record<string, number> = {};
      for (const row of industryRows) {
        const label = row.industry ?? 'unspecified';
        const nextValue =
          (byIndustry[label] ?? 0) + Number.parseInt(row.count, 10);
        byIndustry[label] = nextValue;
      }

      return { totalChunks, bySourceType, byIndustry };
    } catch (error) {
      this.logger.error('Failed to get RAG stats from database', error);
      return {
        totalChunks: 0,
        bySourceType: {},
        byIndustry: {},
      };
    }
  }

  async deleteAll(): Promise<number> {
    const result = await this.chunkRepository.delete({});
    return result.affected ?? 0;
  }

  private async deleteLegacyDocument(documentKey: string): Promise<number> {
    const selector = this.decodeLegacyDocumentKey(documentKey);
    if (!selector) {
      return 0;
    }

    const minuteStart = new Date(selector.createdMinute);
    if (Number.isNaN(minuteStart.getTime())) {
      return 0;
    }

    const minuteEnd = new Date(minuteStart.getTime() + 60_000);

    const query = this.chunkRepository
      .createQueryBuilder()
      .delete()
      .from(DocumentChunkOrmEntity)
      .where('title = :title', { title: selector.title })
      .andWhere(`"sourceType" = :sourceType`, {
        sourceType: selector.sourceType,
      })
      .andWhere(`"createdAt" >= :minuteStart`, {
        minuteStart: minuteStart.toISOString(),
      })
      .andWhere(`"createdAt" < :minuteEnd`, {
        minuteEnd: minuteEnd.toISOString(),
      })
      .andWhere(`metadata ->> 'documentId' IS NULL`);

    if (selector.url === null) {
      query.andWhere('url IS NULL');
    } else {
      query.andWhere('url = :url', { url: selector.url });
    }

    if (selector.industry === null) {
      query.andWhere('industry IS NULL');
    } else {
      query.andWhere('industry = :industry', { industry: selector.industry });
    }

    if (selector.uploadedFileName === null) {
      query.andWhere(`metadata ->> 'uploadedFileName' IS NULL`);
    } else {
      query.andWhere(`metadata ->> 'uploadedFileName' = :uploadedFileName`, {
        uploadedFileName: selector.uploadedFileName,
      });
    }

    const result = await query.execute();
    return result.affected ?? 0;
  }

  private toUtcMinuteStartIso(date: Date): string {
    const minuteStart = new Date(date);
    minuteStart.setUTCSeconds(0, 0);
    return minuteStart.toISOString();
  }

  private encodeLegacyDocumentKey(selector: LegacyDocumentSelector): string {
    const payload = Buffer.from(JSON.stringify(selector), 'utf-8').toString(
      'base64url',
    );
    return `legacy_${payload}`;
  }

  private decodeLegacyDocumentKey(
    documentKey: string,
  ): LegacyDocumentSelector | null {
    const payload = documentKey.slice(7);
    if (!payload) {
      return null;
    }

    try {
      const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decoded) as Partial<LegacyDocumentSelector>;
      if (
        typeof parsed.title !== 'string' ||
        typeof parsed.sourceType !== 'string' ||
        typeof parsed.createdMinute !== 'string'
      ) {
        return null;
      }

      return {
        title: parsed.title,
        sourceType: parsed.sourceType,
        url: typeof parsed.url === 'string' ? parsed.url : null,
        industry: typeof parsed.industry === 'string' ? parsed.industry : null,
        uploadedFileName:
          typeof parsed.uploadedFileName === 'string'
            ? parsed.uploadedFileName
            : null,
        createdMinute: parsed.createdMinute,
      };
    } catch {
      return null;
    }
  }

  private getMetadataString(
    metadata: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = metadata[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private chunkText(text: string): TextChunk[] {
    const cleaned = text.replace(/\r\n/g, '\n').trim();
    if (cleaned.length <= this.chunkSize) {
      return [{ content: cleaned, index: 0 }];
    }

    const chunks: TextChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < cleaned.length) {
      let end = Math.min(start + this.chunkSize, cleaned.length);

      // Try to find a natural break point if we are not at the end
      if (end < cleaned.length) {
        const slice = cleaned.slice(start, end);
        const lastParagraph = slice.lastIndexOf('\n\n');
        const lastNewline = slice.lastIndexOf('\n');
        const lastSentence = slice.lastIndexOf('. ');

        // Prioritize paragraph breaks, then newlines, then sentences
        if (lastParagraph > this.chunkSize * 0.5) {
          end = start + lastParagraph;
        } else if (lastNewline > this.chunkSize * 0.5) {
          end = start + lastNewline;
        } else if (lastSentence > this.chunkSize * 0.5) {
          end = start + lastSentence + 2; // Include the period and space
        }
      }

      // Safety check: ensure we advance
      if (end <= start) {
        end = Math.min(start + this.chunkSize, cleaned.length);
      }

      const content = cleaned.slice(start, end).trim();
      if (content.length > 0) {
        chunks.push({ content, index });
        index++;
      }

      // Move start forward, respecting overlap but ensuring progress
      const nextStart = end - this.chunkOverlap;
      start = Math.max(nextStart, start + 1);

      // If nextStart went past end of text (unlikely with math.min), break
      if (start >= cleaned.length) break;
    }

    return chunks;
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    const module = (await import('pdf-parse')) as unknown as PdfParseModule;
    const parse = module.default;

    if (!parse) {
      throw new Error('pdf-parse default export is not available');
    }

    const result = await parse(buffer);
    return result.text ?? '';
  }

  private async extractTextFromBuffer(
    buffer: Buffer,
    ext: string,
  ): Promise<string> {
    switch (ext) {
      case '.pdf':
        return this.parsePdf(buffer);
      case '.txt':
      case '.md':
      case '.html':
      case '.htm':
      case '.csv':
        return buffer.toString('utf-8');
      case '.json': {
        const raw = buffer.toString('utf-8');
        const parsed: unknown = JSON.parse(raw);
        return typeof parsed === 'string'
          ? parsed
          : JSON.stringify(parsed, null, 2);
      }
      default:
        throw new Error(
          `Unsupported file type: ${ext}. Supported types: .csv, .pdf, .txt, .json, .md, .html`,
        );
    }
  }
}
